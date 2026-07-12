use axum::{extract::State, Json, routing::get, Router};
use sqlx::PgPool;

use crate::models::driver::Driver;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_drivers))
    // TODO(Team Lead): add create/update endpoints.
    // Reminder: drivers with expired licenses or Suspended status must be
    // excluded from any dispatch-selection endpoint.
}

async fn list_drivers(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Driver>>, axum::http::StatusCode> {
    let drivers = sqlx::query_as::<_, Driver>("SELECT * FROM drivers ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(drivers))
}
