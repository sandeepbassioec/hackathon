use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use chrono::Utc;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::ApiError;
use crate::models::driver::Driver;
use crate::models::trip::Trip;
use crate::models::vehicle::Vehicle;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_trips).post(create_trip))
        .route("/:id/dispatch", post(dispatch_trip))
        .route("/:id/complete", post(complete_trip))
        .route("/:id/cancel", post(cancel_trip))
}

async fn list_trips(State(pool): State<PgPool>) -> Result<Json<Vec<Trip>>, ApiError> {
    let trips = sqlx::query_as::<_, Trip>("SELECT * FROM trips ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(trips))
}

#[derive(Deserialize)]
struct CreateTripRequest {
    source: String,
    destination: String,
    vehicle_id: Uuid,
    driver_id: Uuid,
    cargo_weight: f64,
    planned_distance: f64,
}

async fn create_trip(
    State(pool): State<PgPool>,
    Json(req): Json<CreateTripRequest>,
) -> Result<Json<Trip>, ApiError> {
    let vehicle = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles WHERE id = $1")
        .bind(req.vehicle_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| ApiError::not_found("vehicle not found"))?;

    let driver = sqlx::query_as::<_, Driver>("SELECT * FROM drivers WHERE id = $1")
        .bind(req.driver_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| ApiError::not_found("driver not found"))?;

    if vehicle.status != "available" {
        return Err(ApiError::conflict(format!(
            "vehicle is not available (current status: {})",
            vehicle.status
        )));
    }
    if driver.status != "available" {
        return Err(ApiError::conflict(format!(
            "driver is not available (current status: {})",
            driver.status
        )));
    }
    if driver.license_expiry_date < Utc::now().date_naive() {
        return Err(ApiError::conflict("driver's license has expired"));
    }
    if req.cargo_weight > vehicle.max_load_capacity {
        return Err(ApiError::bad_request(format!(
            "cargo weight ({} kg) exceeds vehicle max load capacity ({} kg)",
            req.cargo_weight, vehicle.max_load_capacity
        )));
    }

    let trip = sqlx::query_as::<_, Trip>(
        "INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft')
         RETURNING *",
    )
    .bind(&req.source)
    .bind(&req.destination)
    .bind(req.vehicle_id)
    .bind(req.driver_id)
    .bind(req.cargo_weight)
    .bind(req.planned_distance)
    .fetch_one(&pool)
    .await?;

    Ok(Json(trip))
}

async fn fetch_trip(pool: &PgPool, id: Uuid) -> Result<Trip, ApiError> {
    sqlx::query_as::<_, Trip>("SELECT * FROM trips WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .ok_or_else(|| ApiError::not_found("trip not found"))
}

async fn dispatch_trip(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Trip>, ApiError> {
    let trip = fetch_trip(&pool, id).await?;
    if trip.status != "draft" {
        return Err(ApiError::conflict(format!(
            "trip cannot be dispatched from status '{}'",
            trip.status
        )));
    }

    let mut tx = pool.begin().await.map_err(ApiError::from)?;

    let updated = sqlx::query_as::<_, Trip>(
        "UPDATE trips SET status = 'dispatched' WHERE id = $1 RETURNING *",
    )
    .bind(id)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query("UPDATE vehicles SET status = 'on_trip' WHERE id = $1")
        .bind(trip.vehicle_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE drivers SET status = 'on_trip' WHERE id = $1")
        .bind(trip.driver_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await.map_err(ApiError::from)?;

    Ok(Json(updated))
}

#[derive(Deserialize)]
struct CompleteTripRequest {
    final_odometer: f64,
    fuel_consumed: f64,
}

async fn complete_trip(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<CompleteTripRequest>,
) -> Result<Json<Trip>, ApiError> {
    let trip = fetch_trip(&pool, id).await?;
    if trip.status != "dispatched" {
        return Err(ApiError::conflict(format!(
            "trip cannot be completed from status '{}'",
            trip.status
        )));
    }

    let mut tx = pool.begin().await.map_err(ApiError::from)?;

    let updated = sqlx::query_as::<_, Trip>(
        "UPDATE trips SET status = 'completed', completed_at = now(), final_odometer = $1, fuel_consumed = $2
         WHERE id = $3 RETURNING *",
    )
    .bind(req.final_odometer)
    .bind(req.fuel_consumed)
    .bind(id)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query("UPDATE vehicles SET status = 'available', odometer = $1 WHERE id = $2")
        .bind(req.final_odometer)
        .bind(trip.vehicle_id)
        .execute(&mut *tx)
        .await?;

    sqlx::query("UPDATE drivers SET status = 'available' WHERE id = $1")
        .bind(trip.driver_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await.map_err(ApiError::from)?;

    Ok(Json(updated))
}

async fn cancel_trip(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<Trip>, ApiError> {
    let trip = fetch_trip(&pool, id).await?;
    if trip.status != "draft" && trip.status != "dispatched" {
        return Err(ApiError::conflict(format!(
            "trip cannot be cancelled from status '{}'",
            trip.status
        )));
    }

    let mut tx = pool.begin().await.map_err(ApiError::from)?;

    let updated = sqlx::query_as::<_, Trip>(
        "UPDATE trips SET status = 'cancelled' WHERE id = $1 RETURNING *",
    )
    .bind(id)
    .fetch_one(&mut *tx)
    .await?;

    if trip.status == "dispatched" {
        sqlx::query("UPDATE vehicles SET status = 'available' WHERE id = $1")
            .bind(trip.vehicle_id)
            .execute(&mut *tx)
            .await?;

        sqlx::query("UPDATE drivers SET status = 'available' WHERE id = $1")
            .bind(trip.driver_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await.map_err(ApiError::from)?;

    Ok(Json(updated))
}
