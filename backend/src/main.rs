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
use tower_sessions_redis_store::RedisStore;

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

async fn create_redis_store() -> RedisStore<redis::aio::Connection> {
    let client = redis::Client::open("redis://127.0.0.1:6379").unwrap();
    let connection = client.get_async_connection().await.unwrap();
    RedisStore::new(connection)
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let app_state = AppState::new().await;

    // CORS and session configurations for cross-domain setup
// let session_store = MemoryStore::default();
let session_store = create_redis_store().await;
// Create a session cookie name and session layer
let session_layer = SessionManagerLayer::new(session_store)
    .with_secure(true) // Enable for HTTPS
    .with_same_site(SameSite::None) // Required for cross-site requests
    .with_expiry(Expiry::OnInactivity(Duration::hours(1)))
    // Use a strong, custom cookie name 
    .with_cookie_name("polling_session")
    // Add a session secret for better security
    .with_cookie_path("/");

// Update allowed headers to include the session cookie
let cors = CorsLayer::new()
    .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
    .allow_origin("https://catalog-week5-polling.vercel.app".parse::<HeaderValue>().unwrap())
    .allow_methods([
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::DELETE,
        Method::OPTIONS,
    ])
    .allow_headers([
        header::CONTENT_TYPE,
        header::AUTHORIZATION,
        header::ACCEPT,
        header::COOKIE,
        header::SET_COOKIE,
        HeaderName::from_static("x-requested-with"),
        HeaderName::from_static("x-csrf-token"),
    ])
    .allow_credentials(true)
    .expose_headers([header::SET_COOKIE]) // Important for cookies to work
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