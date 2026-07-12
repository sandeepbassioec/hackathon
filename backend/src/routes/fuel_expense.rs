use axum::{routing::get, Router};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/fuel", get(list_fuel_logs).post(create_fuel_log))
        .route("/expenses", get(list_expenses).post(create_expense))
    // TODO(Member 2): total operational cost per vehicle = sum(fuel) + sum(maintenance)
}

async fn list_fuel_logs() -> &'static str { "TODO: list fuel logs" }
async fn create_fuel_log() -> &'static str { "TODO: record fuel log" }
async fn list_expenses() -> &'static str { "TODO: list expenses" }
async fn create_expense() -> &'static str { "TODO: record expense" }
