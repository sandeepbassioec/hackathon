pub mod auth;
pub mod vehicles;
pub mod drivers;
pub mod trips;
pub mod maintenance;
pub mod fuel_expense;
pub mod reports;

use axum::Router;
use sqlx::PgPool;

pub fn build(pool: PgPool) -> Router {
    Router::new()
        .nest("/api/auth", auth::router())
        .nest("/api/vehicles", vehicles::router())
        .nest("/api/drivers", drivers::router())
        .nest("/api/trips", trips::router())
        .nest("/api/maintenance", maintenance::router())
        .nest("/api", fuel_expense::router())
        .nest("/api/reports", reports::router())
        .with_state(pool)
}
