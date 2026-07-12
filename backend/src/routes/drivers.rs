use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};
use chrono::NaiveDate;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::AuthUser;
use crate::error::ApiError;
use crate::models::driver::Driver;

const MANAGES_DRIVERS: &[&str] = &["fleet_manager"];
const VALID_DRIVER_STATUSES: &[&str] = &["available", "on_trip", "off_duty", "suspended"];

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_drivers).post(create_driver)).route(
        "/:id",
        axum::routing::patch(update_driver).delete(delete_driver),
    )
}

async fn list_drivers(_user: AuthUser, State(pool): State<PgPool>) -> Result<Json<Vec<Driver>>, ApiError> {
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
    user: AuthUser,
    State(pool): State<PgPool>,
    Json(req): Json<CreateDriverRequest>,
) -> Result<Json<Driver>, ApiError> {
    user.require_role(MANAGES_DRIVERS)?;

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

#[derive(Deserialize)]
struct UpdateDriverRequest {
    name: Option<String>,
    license_category: Option<String>,
    license_expiry_date: Option<NaiveDate>,
    contact_number: Option<String>,
    safety_score: Option<f64>,
    status: Option<String>,
}

async fn update_driver(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateDriverRequest>,
) -> Result<Json<Driver>, ApiError> {
    user.require_role(MANAGES_DRIVERS)?;

    if let Some(status) = &req.status {
        if !VALID_DRIVER_STATUSES.contains(&status.as_str()) {
            return Err(ApiError::bad_request(format!(
                "status must be one of: {}",
                VALID_DRIVER_STATUSES.join(", ")
            )));
        }
    }

    let driver = sqlx::query_as::<_, Driver>(
        "UPDATE drivers SET
            name = COALESCE($1, name),
            license_category = COALESCE($2, license_category),
            license_expiry_date = COALESCE($3, license_expiry_date),
            contact_number = COALESCE($4, contact_number),
            safety_score = COALESCE($5, safety_score),
            status = COALESCE($6, status)
         WHERE id = $7
         RETURNING *",
    )
    .bind(&req.name)
    .bind(&req.license_category)
    .bind(req.license_expiry_date)
    .bind(&req.contact_number)
    .bind(req.safety_score)
    .bind(&req.status)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| ApiError::not_found("driver not found"))?;

    Ok(Json(driver))
}

async fn delete_driver(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<axum::http::StatusCode, ApiError> {
    user.require_role(MANAGES_DRIVERS)?;

    let result = sqlx::query("DELETE FROM drivers WHERE id = $1").bind(id).execute(&pool).await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::not_found("driver not found"));
    }

    Ok(axum::http::StatusCode::NO_CONTENT)
}
