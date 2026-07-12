use axum::{extract::State, routing::get, Json, Router};
use chrono::NaiveDate;
use serde::Deserialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::ApiError;
use crate::models::fuel_expense::{Expense, FuelLog};
use crate::models::vehicle::Vehicle;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/fuel", get(list_fuel_logs).post(create_fuel_log))
        .route("/expenses", get(list_expenses).post(create_expense))
    // TODO(Member 2): total operational cost per vehicle = sum(fuel) + sum(maintenance)
}

async fn vehicle_exists(pool: &PgPool, id: Uuid) -> Result<(), ApiError> {
    let found: Option<Vehicle> = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    found.map(|_| ()).ok_or_else(|| ApiError::not_found("vehicle not found"))
}

async fn list_fuel_logs(State(pool): State<PgPool>) -> Result<Json<Vec<FuelLog>>, ApiError> {
    let logs = sqlx::query_as::<_, FuelLog>("SELECT * FROM fuel_logs ORDER BY log_date DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(logs))
}

#[derive(Deserialize)]
struct CreateFuelLogRequest {
    vehicle_id: Uuid,
    liters: f64,
    cost: f64,
    log_date: NaiveDate,
}

async fn create_fuel_log(
    State(pool): State<PgPool>,
    Json(req): Json<CreateFuelLogRequest>,
) -> Result<Json<FuelLog>, ApiError> {
    vehicle_exists(&pool, req.vehicle_id).await?;
    if req.liters <= 0.0 {
        return Err(ApiError::bad_request("liters must be greater than zero"));
    }

    let log = sqlx::query_as::<_, FuelLog>(
        "INSERT INTO fuel_logs (vehicle_id, liters, cost, log_date) VALUES ($1, $2, $3, $4) RETURNING *",
    )
    .bind(req.vehicle_id)
    .bind(req.liters)
    .bind(req.cost)
    .bind(req.log_date)
    .fetch_one(&pool)
    .await?;

    Ok(Json(log))
}

async fn list_expenses(State(pool): State<PgPool>) -> Result<Json<Vec<Expense>>, ApiError> {
    let expenses = sqlx::query_as::<_, Expense>("SELECT * FROM expenses ORDER BY expense_date DESC")
        .fetch_all(&pool)
        .await?;
    Ok(Json(expenses))
}

#[derive(Deserialize)]
struct CreateExpenseRequest {
    vehicle_id: Uuid,
    expense_type: String,
    amount: f64,
    expense_date: NaiveDate,
    description: Option<String>,
}

async fn create_expense(
    State(pool): State<PgPool>,
    Json(req): Json<CreateExpenseRequest>,
) -> Result<Json<Expense>, ApiError> {
    vehicle_exists(&pool, req.vehicle_id).await?;
    if req.amount <= 0.0 {
        return Err(ApiError::bad_request("amount must be greater than zero"));
    }

    let expense = sqlx::query_as::<_, Expense>(
        "INSERT INTO expenses (vehicle_id, expense_type, amount, expense_date, description)
         VALUES ($1, $2, $3, $4, $5) RETURNING *",
    )
    .bind(req.vehicle_id)
    .bind(&req.expense_type)
    .bind(req.amount)
    .bind(req.expense_date)
    .bind(&req.description)
    .fetch_one(&pool)
    .await?;

    Ok(Json(expense))
}
