use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Driver {
    pub id: Uuid,
    pub name: String,
    pub license_number: String,
    pub license_category: String,
    pub license_expiry_date: NaiveDate,
    pub contact_number: String,
    pub safety_score: f64,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

// Status values: available | on_trip | off_duty | suspended
