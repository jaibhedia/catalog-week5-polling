use crate::routes::polls;
use crate::startup::AppState;
use axum::{
    routing::get,
    Router,
    extract::Extension,
    http::{Method, HeaderName, HeaderValue},
};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use http::header;
use tower_sessions::{
    cookie::{time::Duration, SameSite},
    Expiry, MemoryStore, SessionManagerLayer,
};

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

    // Configure session store
    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(false) // Set to true in production
        .with_same_site(SameSite::Lax)
        .with_expiry(Expiry::OnInactivity(Duration::hours(1)));

    // Fixed CORS configuration that allows credentials
    let cors = CorsLayer::new()
        // Allow specific origins instead of Any
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_origin("https://catalog-week5-polling.vercel.app".parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        // Explicitly list headers instead of using Any
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::ACCEPT,
            HeaderName::from_static("x-requested-with"),
            HeaderName::from_static("x-csrf-token"),
        ])
        .allow_credentials(true)
        .max_age(std::time::Duration::from_secs(3600));

    // Build the router with all middleware applied together
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
        .layer(Extension(app_state))
        // Add the session layer before cors
        .layer(session_layer)
        .layer(cors);

    // Set up the server address
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    info!("Server listening on {}", addr);

    // Start the HTTP server
    let listener = TcpListener::bind(addr).await.unwrap();
    info!("Listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}