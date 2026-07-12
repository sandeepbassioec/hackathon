use axum::{extract::State, routing::get, Json, Router};
use chrono::NaiveDate;
use serde::Deserialize;
use sqlx::PgPool;

use crate::error::ApiError;
use crate::models::driver::Driver;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_drivers).post(create_driver))
    // TODO(Team Lead): add update endpoint.
    // Reminder: drivers with expired licenses or Suspended status must be
    // excluded from any dispatch-selection endpoint.
}

async fn list_drivers(State(pool): State<PgPool>) -> Result<Json<Vec<Driver>>, ApiError> {
    let drivers = sqlx::query_as::<_, Driver>("SELECT * FROM drivers ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(drivers))
}

#[derive(Deserialize)]
struct CreateDriverRequest {
    name: String,
    license_number: String,
    license_category: String,
    license_expiry_date: NaiveDate,
    contact_number: String,
    safety_score: Option<f64>,
}

async fn create_driver(
    State(pool): State<PgPool>,
    Json(req): Json<CreateDriverRequest>,
) -> Result<Json<Driver>, ApiError> {
    if req.name.trim().is_empty() {
        return Err(ApiError::bad_request("name is required"));
    }
    if req.license_number.trim().is_empty() {
        return Err(ApiError::bad_request("license_number is required"));
    }

    let driver = sqlx::query_as::<_, Driver>(
        "INSERT INTO drivers (name, license_number, license_category, license_expiry_date, contact_number, safety_score, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'available')
         RETURNING *",
    )
    .bind(&req.name)
    .bind(&req.license_number)
    .bind(&req.license_category)
    .bind(req.license_expiry_date)
    .bind(&req.contact_number)
    .bind(req.safety_score.unwrap_or(100.0))
    .fetch_one(&pool)
    .await?;

    Ok(Json(driver))
}
