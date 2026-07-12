use axum::{routing::{get, post}, Router};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_maintenance).post(open_maintenance))
        .route("/:id/close", post(close_maintenance))
    // TODO(Member 2): opening a record must flip the vehicle to in_shop;
    // closing must restore it to available (unless retired).
}

async fn list_maintenance() -> &'static str { "TODO: list maintenance logs" }
async fn open_maintenance() -> &'static str { "TODO: open maintenance record" }
async fn close_maintenance() -> &'static str { "TODO: close maintenance record" }
