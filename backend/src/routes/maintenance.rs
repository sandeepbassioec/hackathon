use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::ApiError;
use crate::models::maintenance::MaintenanceLog;
use crate::models::vehicle::Vehicle;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_maintenance).post(open_maintenance))
        .route("/:id/close", post(close_maintenance))
}

async fn list_maintenance(State(pool): State<PgPool>) -> Result<Json<Vec<MaintenanceLog>>, ApiError> {
    let logs = sqlx::query_as::<_, MaintenanceLog>("SELECT * FROM maintenance_logs ORDER BY opened_at DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(logs))
}

#[derive(Deserialize)]
struct OpenMaintenanceRequest {
    vehicle_id: Uuid,
    description: String,
    cost: Option<f64>,
}

async fn open_maintenance(
    State(pool): State<PgPool>,
    Json(req): Json<OpenMaintenanceRequest>,
) -> Result<Json<MaintenanceLog>, ApiError> {
    let vehicle = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles WHERE id = $1")
        .bind(req.vehicle_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| ApiError::not_found("vehicle not found"))?;

    if vehicle.status == "retired" {
        return Err(ApiError::conflict("cannot open a maintenance record on a retired vehicle"));
    }
    if req.description.trim().is_empty() {
        return Err(ApiError::bad_request("description is required"));
    }

    let mut tx = pool.begin().await.map_err(ApiError::from)?;

    let log = sqlx::query_as::<_, MaintenanceLog>(
        "INSERT INTO maintenance_logs (vehicle_id, description, cost, status)
         VALUES ($1, $2, $3, 'open')
         RETURNING *",
    )
    .bind(req.vehicle_id)
    .bind(&req.description)
    .bind(req.cost.unwrap_or(0.0))
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query("UPDATE vehicles SET status = 'in_shop' WHERE id = $1")
        .bind(req.vehicle_id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await.map_err(ApiError::from)?;

    Ok(Json(log))
}

async fn close_maintenance(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<MaintenanceLog>, ApiError> {
    let log = sqlx::query_as::<_, MaintenanceLog>("SELECT * FROM maintenance_logs WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| ApiError::not_found("maintenance record not found"))?;

    if log.status != "open" {
        return Err(ApiError::conflict("maintenance record is not open"));
    }

    let vehicle = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles WHERE id = $1")
        .bind(log.vehicle_id)
        .fetch_optional(&pool)
        .await?
        .ok_or_else(|| ApiError::not_found("vehicle not found"))?;

    let mut tx = pool.begin().await.map_err(ApiError::from)?;

    let updated = sqlx::query_as::<_, MaintenanceLog>(
        "UPDATE maintenance_logs SET status = 'closed', closed_at = now() WHERE id = $1 RETURNING *",
    )
    .bind(id)
    .fetch_one(&mut *tx)
    .await?;

    if vehicle.status != "retired" {
        sqlx::query("UPDATE vehicles SET status = 'available' WHERE id = $1")
            .bind(log.vehicle_id)
            .execute(&mut *tx)
            .await?;
    }

    tx.commit().await.map_err(ApiError::from)?;

    Ok(Json(updated))
}
