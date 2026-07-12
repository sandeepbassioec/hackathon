use axum::{extract::State, Json, routing::{get, post}, Router};
use sqlx::PgPool;

use crate::models::trip::Trip;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_trips).post(create_trip))
        .route("/:id/dispatch", post(dispatch_trip))
        .route("/:id/complete", post(complete_trip))
        .route("/:id/cancel", post(cancel_trip))
    // TODO(Member 2): implement full lifecycle per problem statement section 4:
    // draft -> dispatched -> completed | cancelled, with cargo weight vs.
    // vehicle capacity check, vehicle/driver availability check, and the
    // automatic status flips on vehicle/driver described in the rules.
}

async fn list_trips(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Trip>>, axum::http::StatusCode> {
    let trips = sqlx::query_as::<_, Trip>("SELECT * FROM trips ORDER BY created_at DESC")
        .fetch_all(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(trips))
}

async fn create_trip() -> &'static str { "TODO: create trip (validate cargo weight)" }
async fn dispatch_trip() -> &'static str { "TODO: dispatch trip" }
async fn complete_trip() -> &'static str { "TODO: complete trip" }
async fn cancel_trip() -> &'static str { "TODO: cancel trip" }
