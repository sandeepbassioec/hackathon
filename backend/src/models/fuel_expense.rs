use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct FuelLog {
    pub id: Uuid,
    pub vehicle_id: Uuid,
    pub liters: f64,
    pub cost: f64,
    pub log_date: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Expense {
    pub id: Uuid,
    pub vehicle_id: Uuid,
    pub expense_type: String,
    pub amount: f64,
    pub expense_date: NaiveDate,
    pub description: Option<String>,
}
