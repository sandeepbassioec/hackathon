use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct MaintenanceLog {
    pub id: Uuid,
    pub vehicle_id: Uuid,
    pub description: String,
    pub cost: f64,
    pub status: String,
    pub opened_at: DateTime<Utc>,
    pub closed_at: Option<DateTime<Utc>>,
}

// Opening a record -> vehicle status becomes in_shop.
// Closing a record -> vehicle status returns to available (unless retired).
