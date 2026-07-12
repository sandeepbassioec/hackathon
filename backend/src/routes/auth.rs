use axum::{extract::State, routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, Row};

use crate::auth::{jwt, password};
use crate::error::ApiError;

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub role: String,
}

pub fn router() -> Router<PgPool> {
    Router::new().route("/login", post(login))
}

async fn login(
    State(pool): State<PgPool>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, ApiError> {
    let row = sqlx::query(
        "SELECT users.id, users.password_hash, roles.name as role_name
         FROM users JOIN roles ON roles.id = users.role_id
         WHERE users.email = $1",
    )
    .bind(&req.email)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| ApiError::unauthorized("invalid email or password"))?;

    let password_hash: String = row.get("password_hash");
    if !password::verify_password(&req.password, &password_hash) {
        return Err(ApiError::unauthorized("invalid email or password"));
    }

    let user_id: uuid::Uuid = row.get("id");
    let role_name: String = row.get("role_name");
    let token = jwt::issue_token(&user_id.to_string(), &role_name)
        .map_err(|_| ApiError::new(axum::http::StatusCode::INTERNAL_SERVER_ERROR, "could not issue token"))?;

    Ok(Json(LoginResponse { token, role: role_name }))
}
