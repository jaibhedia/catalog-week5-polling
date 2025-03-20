use actix_web::{web, App, HttpServer, HttpResponse, Responder, HttpRequest, Error, middleware::Logger};
use actix_web_actors::ws;
use actix::{Actor, StreamHandler, Message, Handler, ActorContext, AsyncContext};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json;
use std::sync::{Arc, Mutex};
use uuid::Uuid;
use chrono::{Utc, Duration};
use std::collections::HashMap;
use url::Url; // Now correctly imported after adding the `url` crate
use webauthn_rs::prelude::{Passkey, PasskeyAuthentication, PasskeyRegistration, RegisterPublicKeyCredential, PublicKeyCredential};
use webauthn_rs::{Webauthn, WebauthnBuilder};
use jsonwebtoken::{encode, Header, EncodingKey, Validation, DecodingKey, decode};

// WebSocket message for broadcasting poll updates
#[derive(Message)]
#[rtype(result = "()")]
struct BroadcastMessage(String);

// User structure
#[derive(Serialize, Deserialize, Clone)]
struct User {
    id: Uuid,
    username: String,
    credentials: Vec<Passkey>,
}

// Poll structures
#[derive(Serialize, Deserialize, Clone)]
struct PollOption {
    #[serde(default)]
    #[serde(skip_serializing_if = "String::is_empty")]
    id: String,
    text: String,
    #[serde(default)]
    votes: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct Poll {
    #[serde(default)]
    #[serde(skip_serializing_if = "String::is_empty")]
    id: String,
    title: String,
    options: Vec<PollOption>,
    #[serde(default)]
    #[serde(skip_serializing_if = "String::is_empty")]
    creator_id: String,
    #[serde(default)]
    is_closed: bool,
    #[serde(default = "Utc::now")]
    created_at: chrono::DateTime<Utc>,
}

#[derive(Serialize)]
struct PollResults {
    poll: Poll,
    total_votes: u32,
    percentages: HashMap<String, f32>,
}

// JWT Claims
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

// Application state
struct AppState {
    webauthn: Webauthn,
    users: Arc<Mutex<HashMap<Uuid, User>>>,
    polls: Arc<Mutex<Vec<Poll>>>,
    votes: Arc<Mutex<Vec<(String, String)>>>,
    ws_clients: Arc<Mutex<HashMap<String, Vec<actix::Addr<PollWebSocket>>>>>,
    reg_challenges: Arc<Mutex<HashMap<Uuid, (String, PasskeyRegistration)>>>, // Updated to store username with PasskeyRegistration
    auth_challenges: Arc<Mutex<HashMap<Uuid, PasskeyAuthentication>>>,
}

// WebSocket handler for polls
struct PollWebSocket {
    poll_id: String,
    app_state: web::Data<AppState>,
}

impl Actor for PollWebSocket {
    type Context = ws::WebsocketContext<Self>;
    fn started(&mut self, ctx: &mut Self::Context) {
        let mut clients = self.app_state.ws_clients.lock().unwrap();
        let addr = ctx.address();
        clients.entry(self.poll_id.clone())
            .or_insert_with(Vec::new)
            .push(addr);
    }
    fn stopped(&mut self, ctx: &mut Self::Context) {
        let mut clients = self.app_state.ws_clients.lock().unwrap();
        if let Some(clients_vec) = clients.get_mut(&self.poll_id) {
            clients_vec.retain(|addr| addr != &ctx.address());
        }
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for PollWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Ping(msg)) => ctx.pong(&msg),
            Ok(ws::Message::Text(_)) => (),
            Ok(ws::Message::Binary(_)) => (),
            Ok(ws::Message::Close(_)) => ctx.stop(),
            _ => (),
        }
    }
}

impl Handler<BroadcastMessage> for PollWebSocket {
    type Result = ();
    fn handle(&mut self, msg: BroadcastMessage, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

async fn ws_handler(
    req: HttpRequest,
    stream: web::Payload,
    poll_id: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<HttpResponse, Error> {
    ws::start(
        PollWebSocket {
            poll_id: poll_id.into_inner(),
            app_state: state.clone(),
        },
        &req,
        stream
    )
}

#[derive(Deserialize)]
struct RegInitRequest {
    username: String,
}

async fn reg_init(
    req: web::Json<RegInitRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let username = req.username.trim();
    if username.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({"error": "Username cannot be empty"}));
    }

    let users = state.users.lock().unwrap();
    if users.values().any(|u| u.username == username) {
        return HttpResponse::BadRequest().json(serde_json::json!({"error": "Username already taken"}));
    }
    drop(users);

    let user_id = Uuid::new_v4();
    let (ccr, reg_state) = match state.webauthn.start_passkey_registration(user_id, username, username, None) {
        Ok(result) => result,
        Err(e) => return HttpResponse::BadRequest().json(serde_json::json!({"error": format!("{:?}", e)})),
    };

    println!("Generated challenge: {:?}", ccr);
    state.reg_challenges.lock().unwrap().insert(user_id, (username.to_string(), reg_state));
    let response = serde_json::json!({
        "user_id": user_id.to_string(),
        "challenge": ccr
    });
    println!("Serialized response: {}", serde_json::to_string(&response).unwrap());
    HttpResponse::Ok().json(response)
}

#[derive(Deserialize)]
struct RegCompleteRequest {
    user_id: String,
    credential: RegisterPublicKeyCredential,
}

async fn reg_complete(
    req: web::Json<RegCompleteRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let user_id = match Uuid::parse_str(&req.user_id) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(serde_json::json!({"error": "Invalid user_id"})),
    };

    let (username, reg_state) = match state.reg_challenges.lock().unwrap().remove(&user_id) {
        Some((username, state)) => (username, state),
        None => return HttpResponse::BadRequest().json(serde_json::json!({"error": "No registration in progress"})),
    };

    let passkey = match state.webauthn.finish_passkey_registration(&req.credential, &reg_state) {
        Ok(passkey) => passkey,
        Err(e) => return HttpResponse::BadRequest().json(serde_json::json!({"error": format!("{:?}", e)})),
    };

    let user = User {
        id: user_id,
        username,
        credentials: vec![passkey],
    };

    state.users.lock().unwrap().insert(user_id, user.clone());

    let claims = Claims {
        sub: user_id.to_string(),
        exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
    };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref())).unwrap();

    HttpResponse::Ok().json(serde_json::json!({
        "user": user,
        "token": token
    }))
}

#[derive(Deserialize)]
struct AuthStartRequest {
    username: String,
}

async fn auth_start(
    req: web::Json<AuthStartRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let users = state.users.lock().unwrap();
    let user = match users.values().find(|u| u.username == req.username) {
        Some(user) => user.clone(),
        None => return HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"})),
    };
    drop(users);

    let (acr, auth_state) = match state.webauthn.start_passkey_authentication(&user.credentials) {
        Ok(result) => result,
        Err(e) => return HttpResponse::BadRequest().json(serde_json::json!({"error": format!("{:?}", e)})),
    };

    state.auth_challenges.lock().unwrap().insert(user.id, auth_state);
    HttpResponse::Ok().json(acr)
}

#[derive(Deserialize)]
struct AuthCompleteRequest {
    username: String,
    credential: PublicKeyCredential,
}

async fn auth_complete(
    req: web::Json<AuthCompleteRequest>,
    state: web::Data<AppState>,
) -> impl Responder {
    let users = state.users.lock().unwrap();
    let user = match users.values().find(|u| u.username == req.username) {
        Some(user) => user.clone(),
        None => return HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"})),
    };
    drop(users);

    let auth_state = match state.auth_challenges.lock().unwrap().remove(&user.id) {
        Some(state) => state,
        None => return HttpResponse::BadRequest().json(serde_json::json!({"error": "No authentication in progress"})),
    };

    match state.webauthn.finish_passkey_authentication(&req.credential, &auth_state) {
        Ok(_) => {
            let claims = Claims {
                sub: user.id.to_string(),
                exp: (Utc::now() + Duration::hours(24)).timestamp() as usize,
            };
            let token = encode(&Header::default(), &claims, &EncodingKey::from_secret("secret".as_ref())).unwrap();
            HttpResponse::Ok().json(serde_json::json!({
                "user": user,
                "token": token
            }))
        }
        Err(e) => HttpResponse::Unauthorized().json(serde_json::json!({"error": format!("{:?}", e)})),
    }
}

async fn get_current_user(req: HttpRequest, state: web::Data<AppState>) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => match Uuid::parse_str(&id) {
            Ok(uuid) => uuid,
            Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Invalid token"})),
        },
        Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Invalid or missing token"})),
    };

    let users = state.users.lock().unwrap();
    match users.get(&user_id) {
        Some(user) => HttpResponse::Ok().json(user),
        None => HttpResponse::NotFound().json(serde_json::json!({"error": "User not found"})),
    }
}


fn get_user_id_from_request(req: &HttpRequest) -> Result<String, Error> {
    if let Some(auth_header) = req.headers().get("Authorization") {
        if let Ok(auth_str) = auth_header.to_str() {
            if auth_str.starts_with("Bearer ") {
                let token = &auth_str[7..];
                let validation = Validation::default();
                let decoded = decode::<Claims>(
                    token,
                    &DecodingKey::from_secret("secret".as_ref()),
                    &validation,
                );
                if let Ok(token_data) = decoded {
                    return Ok(token_data.claims.sub);
                }
            }
        }
    }
    Err(actix_web::error::ErrorUnauthorized("Invalid or missing token"))
}


async fn list_polls(state: web::Data<AppState>) -> impl Responder {
    let polls = state.polls.lock().unwrap();
    HttpResponse::Ok().json(polls.clone())
}

async fn create_poll(poll: web::Json<Poll>, state: web::Data<AppState>, req: HttpRequest) -> Result<HttpResponse, Error> {
    let creator_id = get_user_id_from_request(&req)?;
    let mut polls = state.polls.lock().unwrap();

    if poll.options.len() < 2 {
        return Ok(HttpResponse::BadRequest().json(serde_json::json!({"error": "Poll must have at least 2 options"})));
    }

    let new_poll = Poll {
        id: Uuid::new_v4().to_string(),
        title: poll.title.clone(),
        options: poll.options.iter().map(|o| PollOption {
            id: Uuid::new_v4().to_string(),
            text: o.text.clone(),
            votes: 0,
        }).collect(),
        creator_id,
        is_closed: false,
        created_at: Utc::now(),
    };

    polls.push(new_poll.clone());
    Ok(HttpResponse::Ok().json(new_poll))
}

async fn get_poll(poll_id: web::Path<String>, state: web::Data<AppState>) -> impl Responder {
    let polls = state.polls.lock().unwrap();
    if let Some(poll) = polls.iter().find(|p| p.id == *poll_id) {
        HttpResponse::Ok().json(poll)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found"}))
    }
}

async fn vote_poll(
    path: web::Path<String>,
    option: web::Json<PollOption>,
    state: web::Data<AppState>,
    req: HttpRequest,
) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let mut polls = state.polls.lock().unwrap();
    let mut votes = state.votes.lock().unwrap();

    if let Some(poll) = polls.iter_mut().find(|p| p.id == *path) {
        if poll.is_closed {
            return HttpResponse::BadRequest().json(serde_json::json!({"error": "Poll is closed"}));
        }

        if votes.contains(&(user_id.clone(), poll.id.clone())) {
            return HttpResponse::BadRequest().json(serde_json::json!({"error": "User already voted"}));
        }

        if let Some(opt) = poll.options.iter_mut().find(|o| o.id == option.id) {
            opt.votes += 1;
            votes.push((user_id, poll.id.clone()));
            broadcast_update(&poll, &state);
            HttpResponse::Ok().json(poll)
        } else {
            HttpResponse::NotFound().json(serde_json::json!({"error": "Option not found"}))
        }
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found"}))
    }
}

async fn close_poll(poll_id: web::Path<String>, state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let mut polls = state.polls.lock().unwrap();
    if let Some(poll) = polls.iter_mut().find(|p| p.id == *poll_id) {
        if poll.creator_id != user_id {
            return HttpResponse::Forbidden().json(serde_json::json!({"error": "Not authorized"}));
        }
        poll.is_closed = true;
        broadcast_update(&poll, &state);
        HttpResponse::Ok().json(poll)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found"}))
    }
}

async fn reset_poll(poll_id: web::Path<String>, state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let user_id = match get_user_id_from_request(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(serde_json::json!({"error": "Unauthorized"})),
    };

    let mut polls = state.polls.lock().unwrap();
    let mut votes = state.votes.lock().unwrap();

    if let Some(poll) = polls.iter_mut().find(|p| p.id == *poll_id) {
        if poll.creator_id != user_id {
            return HttpResponse::Forbidden().json(serde_json::json!({"error": "Not authorized"}));
        }
        poll.options.iter_mut().for_each(|o| o.votes = 0);
        votes.retain(|(_, pid)| pid != &poll.id);
        broadcast_update(&poll, &state);
        HttpResponse::Ok().json(poll)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found"}))
    }
}

async fn get_poll_results(
    poll_id: web::Path<String>,
    query: web::Query<HashMap<String, String>>,
    state: web::Data<AppState>,
) -> impl Responder {
    let polls = state.polls.lock().unwrap();
    if let Some(poll) = polls.iter().find(|p| p.id == *poll_id) {
        let total_votes = poll.options.iter().map(|o| o.votes).sum::<u32>();
        let percentages = poll.options.iter()
            .map(|o| {
                let perc = if total_votes > 0 {
                    (o.votes as f32 / total_votes as f32) * 100.0
                } else {
                    0.0
                };
                (o.id.clone(), perc)
            })
            .collect::<HashMap<String, f32>>();

        let results = PollResults {
            poll: poll.clone(),
            total_votes,
            percentages,
        };

        if let Some(closed) = query.get("closed") {
            if closed == "true" && !poll.is_closed {
                return HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not closed"}));
            }
        }
        if let Some(creator) = query.get("creator") {
            if creator != &poll.creator_id {
                return HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found for creator"}));
            }
        }

        HttpResponse::Ok().json(results)
    } else {
        HttpResponse::NotFound().json(serde_json::json!({"error": "Poll not found"}))
    }
}

fn broadcast_update(poll: &Poll, state: &web::Data<AppState>) {
    let clients = state.ws_clients.lock().unwrap();
    if let Some(clients_vec) = clients.get(&poll.id) {
        let results = serde_json::to_string(&PollResults {
            poll: poll.clone(),
            total_votes: poll.options.iter().map(|o| o.votes).sum(),
            percentages: poll.options.iter().map(|o| {
                let total = poll.options.iter().map(|o| o.votes).sum::<u32>();
                let perc = if total > 0 { (o.votes as f32 / total as f32) * 100.0 } else { 0.0 };
                (o.id.clone(), perc)
            }).collect(),
        }).unwrap();

        for client in clients_vec {
            client.do_send(BroadcastMessage(results.clone()));
        }
    }
}



#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let origin = Url::parse("http://localhost:3000").unwrap();
    let webauthn = WebauthnBuilder::new("localhost", &origin).unwrap().build().unwrap();

    let state = web::Data::new(AppState {
        webauthn,
        users: Arc::new(Mutex::new(HashMap::new())),
        polls: Arc::new(Mutex::new(Vec::new())),
        votes: Arc::new(Mutex::new(Vec::new())),
        ws_clients: Arc::new(Mutex::new(HashMap::new())),
        reg_challenges: Arc::new(Mutex::new(HashMap::new())),
        auth_challenges: Arc::new(Mutex::new(HashMap::new())),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![actix_web::http::header::CONTENT_TYPE, actix_web::http::header::AUTHORIZATION])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(state.clone())
            .route("/api/reg/init", web::post().to(reg_init))
            .route("/api/reg/complete", web::post().to(reg_complete))
            .route("/api/auth/start", web::post().to(auth_start))
            .route("/api/auth/complete", web::post().to(auth_complete))
            .route("/api/auth/me", web::get().to(get_current_user))
            .route("/api/polls", web::get().to(list_polls))
            .route("/api/polls", web::post().to(create_poll))
            .route("/api/polls/{pollId}", web::get().to(get_poll))
            .route("/api/polls/{pollId}/vote", web::post().to(vote_poll))
            .route("/api/polls/{pollId}/close", web::post().to(close_poll))
            .route("/api/polls/{pollId}/reset", web::post().to(reset_poll))
            .route("/api/polls/{pollId}/results", web::get().to(get_poll_results))
            .route("/ws/polls/{pollId}", web::get().to(ws_handler))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}