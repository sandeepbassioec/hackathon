use axum::{extract::State, routing::get, Json, Router};
use serde::Deserialize;
use sqlx::PgPool;

use crate::error::ApiError;
use crate::models::vehicle::Vehicle;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_vehicles).post(create_vehicle))
    // TODO(Team Lead): add update/retire endpoints.
    // Reminder: retired/in_shop vehicles must never appear in any
    // dispatch-selection endpoint.
}

async fn list_vehicles(State(pool): State<PgPool>) -> Result<Json<Vec<Vehicle>>, ApiError> {
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
    State(pool): State<PgPool>,
    Json(req): Json<CreateVehicleRequest>,
) -> Result<Json<Vehicle>, ApiError> {
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
