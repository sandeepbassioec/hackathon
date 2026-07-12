use axum::{extract::State, Json, routing::get, Router};
use serde::Serialize;
use sqlx::{PgPool, Row};

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/dashboard", get(dashboard_kpis))
        .route("/fleet-utilization", get(fleet_utilization))
        .route("/vehicle-roi", get(vehicle_roi))
    // TODO(Member 2): Fuel Efficiency = distance / fuel. Support CSV export.
}

#[derive(Serialize)]
struct DashboardKpis {
    active_vehicles: i64,
    available_vehicles: i64,
    in_maintenance: i64,
    active_trips: i64,
    pending_trips: i64,
    drivers_on_duty: i64,
    fleet_utilization: f64,
}

async fn dashboard_kpis(
    State(pool): State<PgPool>,
) -> Result<Json<DashboardKpis>, axum::http::StatusCode> {
    let row = sqlx::query(
        "SELECT
            COUNT(*) FILTER (WHERE status <> 'retired') AS active_vehicles,
            COUNT(*) FILTER (WHERE status = 'available') AS available_vehicles,
            COUNT(*) FILTER (WHERE status = 'in_shop') AS in_maintenance,
            COUNT(*) FILTER (WHERE status = 'on_trip') AS vehicles_on_trip
         FROM vehicles",
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let trip_row = sqlx::query(
        "SELECT
            COUNT(*) FILTER (WHERE status = 'dispatched') AS active_trips,
            COUNT(*) FILTER (WHERE status = 'draft') AS pending_trips
         FROM trips",
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let driver_row = sqlx::query("SELECT COUNT(*) AS drivers_on_duty FROM drivers WHERE status = 'on_trip'")
        .fetch_one(&pool)
        .await
        .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let active_vehicles: i64 = row.get("active_vehicles");
    let available_vehicles: i64 = row.get("available_vehicles");
    let in_maintenance: i64 = row.get("in_maintenance");
    let vehicles_on_trip: i64 = row.get("vehicles_on_trip");
    let active_trips: i64 = trip_row.get("active_trips");
    let pending_trips: i64 = trip_row.get("pending_trips");
    let drivers_on_duty: i64 = driver_row.get("drivers_on_duty");

    let fleet_utilization = if active_vehicles > 0 {
        (vehicles_on_trip as f64 / active_vehicles as f64) * 100.0
    } else {
        0.0
    };

    Ok(Json(DashboardKpis {
        active_vehicles,
        available_vehicles,
        in_maintenance,
        active_trips,
        pending_trips,
        drivers_on_duty,
        fleet_utilization,
    }))
}

async fn fleet_utilization() -> &'static str { "TODO: fleet utilization report (filters by type/status/region)" }

#[derive(Serialize)]
struct VehicleCostSummary {
    registration_number: String,
    acquisition_cost: f64,
    total_fuel_cost: f64,
    total_maintenance_cost: f64,
    // Revenue isn't tracked by any entity in the problem statement's schema
    // (no "revenue" or billing model is specified), so ROI cannot be
    // computed yet. Once the team decides a revenue source (e.g. a rate
    // per trip/distance), add it here and compute:
    // roi = (revenue - (total_fuel_cost + total_maintenance_cost)) / acquisition_cost
}

async fn vehicle_roi(
    State(pool): State<PgPool>,
) -> Result<Json<Vec<VehicleCostSummary>>, axum::http::StatusCode> {
    let rows = sqlx::query(
        "SELECT
            v.registration_number,
            v.acquisition_cost,
            (SELECT COALESCE(SUM(cost), 0) FROM fuel_logs f WHERE f.vehicle_id = v.id) AS total_fuel_cost,
            (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs m WHERE m.vehicle_id = v.id) AS total_maintenance_cost
         FROM vehicles v
         ORDER BY v.registration_number",
    )
    .fetch_all(&pool)
    .await
    .map_err(|_| axum::http::StatusCode::INTERNAL_SERVER_ERROR)?;

    let summaries = rows
        .into_iter()
        .map(|row| VehicleCostSummary {
            registration_number: row.get("registration_number"),
            acquisition_cost: row.get("acquisition_cost"),
            total_fuel_cost: row.get("total_fuel_cost"),
            total_maintenance_cost: row.get("total_maintenance_cost"),
        })
        .collect();

    Ok(Json(summaries))
}
