use crate::routes::polls;
use crate::startup::AppState;
use axum::{
    routing::get,
    Router,
    extract::Extension,
};
use std::net::SocketAddr;
use tokio::net::TcpListener;

#[macro_use]
extern crate tracing;

mod auth;
mod error;
mod models;
mod routes;
mod startup;
mod websocket;

#[cfg(all(feature = "javascript", feature = "wasm", not(doc)))]
compile_error!("Feature \"javascript\" and feature \"wasm\" cannot be enabled at the same time");

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let app_state = AppState::new().await;

    let app = Router::new()
        .route("/", get(|| async { "Backend is running!" }))
        .route("/register_start/:username", axum::routing::post(crate::auth::start_register))
        .route("/register_finish", axum::routing::post(crate::auth::finish_register))
        .route("/login_start/:username", axum::routing::post(crate::auth::start_authentication))
        .route("/login_finish", axum::routing::post(crate::auth::finish_authentication))
        .route("/api/user", axum::routing::get(crate::auth::get_current_user))
        .route("/api/logout", axum::routing::get(crate::auth::logout))
        .merge(polls::router(app_state.broadcast_tx.clone()))
        .route("/ws", axum::routing::get(crate::websocket::websocket_handler))
        .layer(Extension(app_state));

    // Set up the server address
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    info!("Server listening on {}", addr);

    // Start the HTTP server
    let listener = TcpListener::bind(addr).await.unwrap();
    info!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}