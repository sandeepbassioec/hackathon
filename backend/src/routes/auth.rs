use axum::{extract::State, routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};

use crate::auth::{jwt, password};

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

pub fn router() -> Router<PgPool> {
    Router::new().route("/login", post(login))
}

async fn login(
    State(pool): State<PgPool>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, axum::http::StatusCode> {
    let row = sqlx::query(
        "SELECT users.id, users.password_hash, roles.name as role_name
         FROM users JOIN roles ON roles.id = users.role_id
         WHERE users.email = $1",
    )
    .bind(&req.email)
    .fetch_optional(&pool)
    .await
    .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(axum::http::StatusCode::UNAUTHORIZED)?;

    let password_hash: String = row.get("password_hash");
    if !password::verify_password(&req.password, &password_hash) {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    }

    let user_id: uuid::Uuid = row.get("id");
    let role_name: String = row.get("role_name");
    let token = jwt::issue_token(&user_id.to_string(), &role_name)
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(LoginResponse { token }))
}
