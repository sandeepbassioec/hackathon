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
use crate::models::fuel_expense::{Expense, FuelLog};
use crate::models::vehicle::Vehicle;

const MANAGES_FINANCE: &[&str] = &["financial_analyst"];

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/fuel", get(list_fuel_logs).post(create_fuel_log))
        .route("/fuel/:id", axum::routing::patch(update_fuel_log).delete(delete_fuel_log))
        .route("/expenses", get(list_expenses).post(create_expense))
        .route("/expenses/:id", axum::routing::patch(update_expense).delete(delete_expense))
    // TODO(Member 2): total operational cost per vehicle = sum(fuel) + sum(maintenance)
}

async fn vehicle_exists(pool: &PgPool, id: Uuid) -> Result<(), ApiError> {
    let found: Option<Vehicle> = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    found.map(|_| ()).ok_or_else(|| ApiError::not_found("vehicle not found"))
}

async fn list_fuel_logs(_user: AuthUser, State(pool): State<PgPool>) -> Result<Json<Vec<FuelLog>>, ApiError> {
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
    user: AuthUser,
    State(pool): State<PgPool>,
    Json(req): Json<CreateFuelLogRequest>,
) -> Result<Json<FuelLog>, ApiError> {
    user.require_role(MANAGES_FINANCE)?;
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

#[derive(Deserialize)]
struct UpdateFuelLogRequest {
    liters: Option<f64>,
    cost: Option<f64>,
    log_date: Option<NaiveDate>,
}

async fn update_fuel_log(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateFuelLogRequest>,
) -> Result<Json<FuelLog>, ApiError> {
    user.require_role(MANAGES_FINANCE)?;

    let log = sqlx::query_as::<_, FuelLog>(
        "UPDATE fuel_logs SET
            liters = COALESCE($1, liters),
            cost = COALESCE($2, cost),
            log_date = COALESCE($3, log_date)
         WHERE id = $4
         RETURNING *",
    )
    .bind(req.liters)
    .bind(req.cost)
    .bind(req.log_date)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| ApiError::not_found("fuel log not found"))?;

    Ok(Json(log))
}

async fn delete_fuel_log(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<axum::http::StatusCode, ApiError> {
    user.require_role(MANAGES_FINANCE)?;

    let result = sqlx::query("DELETE FROM fuel_logs WHERE id = $1").bind(id).execute(&pool).await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::not_found("fuel log not found"));
    }
    Ok(axum::http::StatusCode::NO_CONTENT)
}

async fn list_expenses(_user: AuthUser, State(pool): State<PgPool>) -> Result<Json<Vec<Expense>>, ApiError> {
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
    user: AuthUser,
    State(pool): State<PgPool>,
    Json(req): Json<CreateExpenseRequest>,
) -> Result<Json<Expense>, ApiError> {
    user.require_role(MANAGES_FINANCE)?;
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

#[derive(Deserialize)]
struct UpdateExpenseRequest {
    expense_type: Option<String>,
    amount: Option<f64>,
    expense_date: Option<NaiveDate>,
    description: Option<String>,
}

async fn update_expense(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateExpenseRequest>,
) -> Result<Json<Expense>, ApiError> {
    user.require_role(MANAGES_FINANCE)?;

    let expense = sqlx::query_as::<_, Expense>(
        "UPDATE expenses SET
            expense_type = COALESCE($1, expense_type),
            amount = COALESCE($2, amount),
            expense_date = COALESCE($3, expense_date),
            description = COALESCE($4, description)
         WHERE id = $5
         RETURNING *",
    )
    .bind(&req.expense_type)
    .bind(req.amount)
    .bind(req.expense_date)
    .bind(&req.description)
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| ApiError::not_found("expense not found"))?;

    Ok(Json(expense))
}

async fn delete_expense(
    user: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<axum::http::StatusCode, ApiError> {
    user.require_role(MANAGES_FINANCE)?;

    let result = sqlx::query("DELETE FROM expenses WHERE id = $1").bind(id).execute(&pool).await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::not_found("expense not found"));
    }
    Ok(axum::http::StatusCode::NO_CONTENT)
}
