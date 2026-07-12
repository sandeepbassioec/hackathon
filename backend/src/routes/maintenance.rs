use axum::{extract::State, Json, routing::{get, post}, Router};
use sqlx::PgPool;

use crate::models::maintenance::MaintenanceLog;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_maintenance).post(open_maintenance))
        .route("/:id/close", post(close_maintenance))
    // TODO(Member 2): opening a record must flip the vehicle to in_shop;
    // closing must restore it to available (unless retired).
}

async fn list_maintenance(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<MaintenanceLog>>, axum::http::StatusCode> {
    let logs = sqlx::query_as::<_, MaintenanceLog>("SELECT * FROM maintenance_logs ORDER BY opened_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(logs))
}

async fn open_maintenance() -> &'static str { "TODO: open maintenance record" }
async fn close_maintenance() -> &'static str { "TODO: close maintenance record" }
