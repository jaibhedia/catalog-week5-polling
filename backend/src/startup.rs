use std::sync::Arc;
use webauthn_rs::prelude::*;
use mongodb::{Client, Database};
use serde::{Serialize, Deserialize};
use dotenv::dotenv;
use tracing::info;
use uuid::Uuid;
use tokio::sync::broadcast::{self, Sender};
use crate::models::Poll;
use std::env;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UserData {
    pub username: String,
    #[serde(deserialize_with = "deserialize_uuid", serialize_with = "serialize_uuid")]
    pub unique_id: Uuid,
    pub passkeys: Vec<Passkey>,
}

fn deserialize_uuid<'de, D>(deserializer: D) -> Result<Uuid, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    Uuid::parse_str(&s).map_err(serde::de::Error::custom)
}

fn serialize_uuid<S>(uuid: &Uuid, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    serializer.serialize_str(&uuid.to_string())
}

#[derive(Clone)]
pub struct AppState {
    pub webauthn: Arc<Webauthn>,
    pub db: Database,
    pub broadcast_tx: Arc<Sender<Poll>>,
}

impl AppState {
    pub async fn new() -> Self {
        dotenv().ok();

        // Load from environment variables with fallbacks for local dev
        let rp_id = env::var("RP_ID").unwrap_or_else(|_| "localhost".to_string());
        let rp_origin = env::var("RP_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:3000".to_string());
        let rp_name = env::var("RP_NAME")
            .unwrap_or_else(|_| "Axum Webauthn-rs".to_string());

        let rp_origin_url = Url::parse(&rp_origin).expect("Invalid RP_ORIGIN URL in .env");
        let builder = WebauthnBuilder::new(&rp_id, &rp_origin_url).expect("Invalid WebAuthn configuration");
        let builder = builder.rp_name(&rp_name);
        let webauthn = Arc::new(builder.build().expect("Failed to build WebAuthn"));

        let mongo_uri = std::env::var("MONGODB_URI").expect("MONGODB_URI must be set in .env");
        info!("Connecting to MongoDB ....");
        let client = Client::with_uri_str(&mongo_uri)
            .await
            .expect("Failed to connect to MongoDB");
        let db = client.database("polling-app");
        info!("Using database: polling_db, collection: users");

        let (tx, _) = broadcast::channel::<Poll>(100);
        let broadcast_tx = Arc::new(tx);

        Self { webauthn, db, broadcast_tx }
    }

    pub fn users_collection(&self) -> mongodb::Collection<UserData> {
        self.db.collection("users")
    }
}