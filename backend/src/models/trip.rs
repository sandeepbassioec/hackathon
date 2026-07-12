use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Trip {
    pub id: Uuid,
    pub source: String,
    pub destination: String,
    pub vehicle_id: Uuid,
    pub driver_id: Uuid,
    pub cargo_weight: f64,
    pub planned_distance: f64,
    pub final_odometer: Option<f64>,
    pub fuel_consumed: Option<f64>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

// Lifecycle: draft -> dispatched -> completed | cancelled
// TODO(Member 2): enforce the mandatory business rules from the problem statement
// section 4 when transitioning status (capacity check, availability check, etc.)
