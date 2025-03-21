// src/models/mod.rs
// src/models/mod.rs
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PollOption {
    pub id: i32,
    pub text: String,
    pub votes: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Poll {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub title: String,
    pub options: Vec<PollOption>,
    #[serde(with = "uuid_binary")]
    pub creator_id: Uuid,
    pub is_closed: bool,
    pub created_at: mongodb::bson::DateTime,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub author: Option<String>, // Already correct
}

mod uuid_binary {
    use serde::{Serialize, Deserialize, Serializer, Deserializer};
    use uuid::Uuid;
    use mongodb::bson::Binary;

    pub fn serialize<S>(uuid: &Uuid, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let binary = Binary {
            subtype: mongodb::bson::spec::BinarySubtype::Uuid,
            bytes: uuid.as_bytes().to_vec(),
        };
        binary.serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Uuid, D::Error>
    where
        D: Deserializer<'de>,
    {
        let binary = Binary::deserialize(deserializer)?;
        Uuid::from_slice(&binary.bytes).map_err(serde::de::Error::custom)
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UserData {
    pub username: String,
    #[serde(deserialize_with = "deserialize_uuid", serialize_with = "serialize_uuid")]
    pub unique_id: Uuid,
    pub passkeys: Vec<webauthn_rs::prelude::Passkey>,
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