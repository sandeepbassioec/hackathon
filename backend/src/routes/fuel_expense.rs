use axum::{extract::State, Json, routing::get, Router};
use sqlx::PgPool;

use crate::models::fuel_expense::{Expense, FuelLog};

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/fuel", get(list_fuel_logs).post(create_fuel_log))
        .route("/expenses", get(list_expenses).post(create_expense))
    // TODO(Member 2): total operational cost per vehicle = sum(fuel) + sum(maintenance)
}

async fn list_fuel_logs(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<FuelLog>>, axum::http::StatusCode> {
    let logs = sqlx::query_as::<_, FuelLog>("SELECT * FROM fuel_logs ORDER BY log_date DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(logs))
}

async fn create_fuel_log() -> &'static str { "TODO: record fuel log" }

async fn list_expenses(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Expense>>, axum::http::StatusCode> {
    let expenses = sqlx::query_as::<_, Expense>("SELECT * FROM expenses ORDER BY expense_date DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(expenses))
}

async fn create_expense() -> &'static str { "TODO: record expense" }
