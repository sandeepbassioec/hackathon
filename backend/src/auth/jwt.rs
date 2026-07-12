use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

fn secret() -> String {
    std::env::var("JWT_SECRET").expect("JWT_SECRET must be set")
}

pub fn issue_token(user_id: &str, role: &str) -> anyhow::Result<String> {
    let expiry_hours: i64 = std::env::var("JWT_EXPIRY_HOURS")
        .unwrap_or_else(|_| "12".to_string())
        .parse()
        .unwrap_or(12);
    let exp = (chrono::Utc::now() + chrono::Duration::hours(expiry_hours)).timestamp() as usize;
    let claims = Claims { sub: user_id.to_string(), role: role.to_string(), exp };
    let token = encode(&Header::default(), &claims, &EncodingKey::from_secret(secret().as_bytes()))?;
    Ok(token)
}

pub fn verify_token(token: &str) -> anyhow::Result<Claims> {
    let data = decode::<Claims>(token, &DecodingKey::from_secret(secret().as_bytes()), &Validation::default())?;
    Ok(data.claims)
}
