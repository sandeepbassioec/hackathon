use axum::{routing::get, Router};
use sqlx::PgPool;

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/dashboard", get(dashboard_kpis))
        .route("/fleet-utilization", get(fleet_utilization))
        .route("/vehicle-roi", get(vehicle_roi))
    // TODO(Member 2): Fuel Efficiency = distance / fuel; Fleet Utilization;
    // Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    // Support CSV export.
}

async fn dashboard_kpis() -> &'static str { "TODO: active/available/in-shop vehicles, active/pending trips, drivers on duty, utilization %" }
async fn fleet_utilization() -> &'static str { "TODO: fleet utilization report" }
async fn vehicle_roi() -> &'static str { "TODO: vehicle ROI report" }
