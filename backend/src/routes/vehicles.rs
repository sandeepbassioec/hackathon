use axum::{routing::get, Router};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_vehicles))
    // TODO(Team Lead): add create/update/retire endpoints.
    // Reminder: registration_number must be unique; retired/in_shop vehicles
    // must be excluded from any dispatch-selection endpoint.
}

async fn list_vehicles() -> &'static str {
    "TODO: list vehicles"
}
