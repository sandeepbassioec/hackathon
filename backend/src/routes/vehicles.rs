use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::AuthUser;
use crate::error::ApiError;
use crate::models::vehicle::Vehicle;

const MANAGES_VEHICLES: &[&str] = &["fleet_manager"];

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_vehicles).post(create_vehicle)).route(
        "/:id",
        axum::routing::patch(update_vehicle).delete(delete_vehicle),
    )
}

async fn list_vehicles(_user: AuthUser, State(pool): State<PgPool>) -> Result<Json<Vec<Vehicle>>, ApiError> {
    let vehicles = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(vehicles))
}

#[derive(Deserialize)]
struct CreateVehicleRequest {
    registration_number: String,
    name_model: String,
    vehicle_type: String,
    max_load_capacity: f64,
    acquisition_cost: f64,
}

async fn create_vehicle(
    user: AuthUser,
    State(pool): State<PgPool>,
    Json(req): Json<CreateVehicleRequest>,
) -> Result<Json<Vehicle>, ApiError> {
    user.require_role(MANAGES_VEHICLES)?;

    if req.registration_number.trim().is_empty() {
        return Err(ApiError::bad_request("registration_number is required"));
    }
    if req.max_load_capacity <= 0.0 {
        return Err(ApiError::bad_request("max_load_capacity must be greater than zero"));
    }

    let vehicle = sqlx::query_as::<_, Vehicle>(
        "INSERT INTO vehicles (registration_number, name_model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status)
         VALUES ($1, $2, $3, $4, 0, $5, 'available')
         RETURNING *",
    )
    .bind(&req.registration_number)
    .bind(&req.name_model)
    .bind(&req.vehicle_type)
    .bind(req.max_load_capacity)
    .bind(req.acquisition_cost)
    .fetch_one(&pool)
    .await?;

    Ok(Json(vehicle))
}

#[derive(Deserialize)]
struct UpdateVehicleRequest {
    name_model: Option<String>,
    vehicle_type: Option<String>,
    max_load_capacity: Option<f64>,
    acquisition_cost: Option<f64>,
    status: Option<String>,
}

const VALID_VEHICLE_STATUSES: &[&str] = &["available", "on_trip", "in_shop", "retired"];

async fn update_vehicle(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateVehicleRequest>,
) -> Result<Json<Vehicle>, ApiError> {
    user.require_role(MANAGES_VEHICLES)?;

    if let Some(status) = &req.status {
        if !VALID_VEHICLE_STATUSES.contains(&status.as_str()) {
            return Err(ApiError::bad_request(format!(
                "status must be one of: {}",
                VALID_VEHICLE_STATUSES.join(", ")
            )));
        }
    }

    let vehicle = sqlx::query_as::<_, Vehicle>(
        "UPDATE vehicles SET
            name_model = COALESCE($1, name_model),
            vehicle_type = COALESCE($2, vehicle_type),
            max_load_capacity = COALESCE($3, max_load_capacity),
            acquisition_cost = COALESCE($4, acquisition_cost),
            status = COALESCE($5, status)
         WHERE id = $6
         RETURNING *",
    )
    .bind(&req.name_model)
    .bind(&req.vehicle_type)
    .bind(req.max_load_capacity)
    .bind(req.acquisition_cost)
    .bind(&req.status)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| ApiError::not_found("vehicle not found"))?;

    Ok(Json(vehicle))
}

async fn delete_vehicle(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<axum::http::StatusCode, ApiError> {
    user.require_role(MANAGES_VEHICLES)?;

    let result = sqlx::query("DELETE FROM vehicles WHERE id = $1").bind(id).execute(&pool).await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::not_found("vehicle not found"));
    }

    Ok(axum::http::StatusCode::NO_CONTENT)
}
