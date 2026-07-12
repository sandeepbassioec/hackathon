use axum::{extract::State, Json, routing::get, Router};
use sqlx::PgPool;

use crate::models::vehicle::Vehicle;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_vehicles))
    // TODO(Team Lead): add create/update/retire endpoints.
    // Reminder: registration_number must be unique; retired/in_shop vehicles
    // must be excluded from any dispatch-selection endpoint.
}

async fn list_vehicles(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Vehicle>>, axum::http::StatusCode> {
    let vehicles = sqlx::query_as::<_, Vehicle>("SELECT * FROM vehicles ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(vehicles))
}
