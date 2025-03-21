// src/websocket/mod.rs
use axum::{
    extract::{WebSocketUpgrade, Extension},
    response::IntoResponse,
};
use futures_util::{SinkExt, StreamExt};
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::startup::{AppState, UserData};
use crate::models::Poll;
use axum::extract::ws::{Message, WebSocket};
use mongodb::bson::{doc, oid::ObjectId};
use serde_json;

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    Extension(app_state): Extension<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, app_state))
}

async fn handle_socket(socket: WebSocket, app_state: AppState) {
    info!("New WebSocket connection established");
    let ( ws_sender, mut ws_receiver) = socket.split();
    let ws_sender = Arc::new(Mutex::new(ws_sender));
    let tx = Arc::clone(&app_state.broadcast_tx);
    let mut rx = tx.subscribe();
    let is_closed = Arc::new(Mutex::new(false));

    let ws_sender_clone = Arc::clone(&ws_sender);
    let is_closed_clone = Arc::clone(&is_closed);
    let app_state_clone = app_state.clone();
    tokio::spawn(async move {
        while let Some(msg_result) = ws_receiver.next().await {
            match msg_result {
                Ok(Message::Text(text)) => {
                    info!("Received message: {}", text);
                    if text.starts_with("join_poll:") {
                        let poll_id = text.strip_prefix("join_poll:").unwrap();
                        if let Ok(poll_id) = ObjectId::parse_str(poll_id) {
                            let collection = app_state_clone.db.collection::<Poll>("polls");
                            let users_collection = app_state_clone.db.collection::<UserData>("users");
                            match collection.find_one(doc! { "_id": poll_id }).await {
                                Ok(Some(mut poll)) => {
                                    if poll.id.is_none() {
                                        poll.id = Some(poll_id);
                                    }
                                    // Fetch author for initial poll
                                    let creator = users_collection
                                        .find_one(doc! { "unique_id": poll.creator_id.to_string() })
                                        .await
                                        .unwrap_or(None);
                                    poll.author = creator.map(|u| u.username);
                                    let poll_json = serde_json::to_string(&poll).unwrap();
                                    let mut sender = ws_sender_clone.lock().await;
                                    if sender.send(Message::Text(poll_json)).await.is_err() {
                                        error!("Failed to send poll update: {}", poll_id);
                                        *is_closed_clone.lock().await = true;
                                        return;
                                    }
                                    info!("Sent initial poll {} to client with author: {:?}", poll_id, poll.author);
                                }
                                Ok(None) => info!("Poll {} not found", poll_id),
                                Err(e) => {
                                    error!("Database error fetching poll {}: {:?}", poll_id, e);
                                    *is_closed_clone.lock().await = true;
                                    return;
                                }
                            }
                        }
                    }
                }
                Ok(Message::Ping(data)) => {
                    let mut sender = ws_sender_clone.lock().await;
                    if sender.send(Message::Pong(data)).await.is_err() {
                        error!("Failed to send pong");
                        *is_closed_clone.lock().await = true;
                        return;
                    }
                    info!("Sent pong response");
                }
                Ok(Message::Close(_)) => {
                    info!("Client closed WebSocket connection");
                    *is_closed_clone.lock().await = true;
                    return;
                }
                Err(e) => {
                    error!("WebSocket receive error: {:?}", e);
                    *is_closed_clone.lock().await = true;
                    return;
                }
                _ => info!("Received non-text message, ignoring"),
            }
        }
        info!("WebSocket receiver loop ended");
        *is_closed_clone.lock().await = true;
    });

    let ws_sender_ping = Arc::clone(&ws_sender);
    let is_closed_ping = Arc::clone(&is_closed);
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
        loop {
            interval.tick().await;
            if *is_closed_ping.lock().await {
                info!("Stopping ping loop due to closed connection");
                return;
            }
            let mut sender = ws_sender_ping.lock().await;
            if sender.send(Message::Ping(vec![])).await.is_err() {
                error!("Failed to send ping");
                return;
            }
            info!("Sent ping to keep WebSocket alive");
        }
    });

    let ws_sender_broadcast = Arc::clone(&ws_sender);
    let is_closed_broadcast = Arc::clone(&is_closed);
    while let Ok(poll) = rx.recv().await {
        if *is_closed_broadcast.lock().await {
            info!("Stopping broadcast loop due to closed connection");
            break;
        }
        if poll.id.is_none() {
            error!("Poll missing ID before broadcast, skipping: {:?}", poll);
            continue;
        }
        let poll_json = match serde_json::to_string(&poll) {
            Ok(json) => json,
            Err(e) => {
                error!("Failed to serialize poll: {:?}", e);
                continue;
            }
        };
        let mut sender = ws_sender_broadcast.lock().await;
        if sender.send(Message::Text(poll_json)).await.is_err() {
            error!("Failed to broadcast poll update: {:?}", poll.id.unwrap().to_hex());
            continue;
        }
        info!("Broadcasted poll update: {}", poll.id.unwrap().to_hex());
    }
    info!("WebSocket broadcast loop ended");
}
