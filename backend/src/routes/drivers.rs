use axum::{routing::get, Router};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new().route("/", get(list_drivers))
    // TODO(Team Lead): add create/update endpoints.
    // Reminder: drivers with expired licenses or Suspended status must be
    // excluded from any dispatch-selection endpoint.
}

async fn list_drivers() -> &'static str {
    "TODO: list drivers"
}
