use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Vehicle {
    pub id: Uuid,
    pub registration_number: String,
    pub name_model: String,
    pub vehicle_type: String,
    pub max_load_capacity: f64,
    pub odometer: f64,
    pub acquisition_cost: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

// Status values: available | on_trip | in_shop | retired
