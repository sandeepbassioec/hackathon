pub mod jwt;
pub mod password;

use axum::{extract::FromRequestParts, http::request::Parts};

use crate::error::ApiError;

/// The authenticated user for a request, extracted from a verified JWT.
/// Add `user: AuthUser` as a handler parameter to require a valid token;
/// call `user.require_role(&[...])` to additionally restrict by role.
pub struct AuthUser {
    pub user_id: String,
    pub role: String,
}

impl AuthUser {
    pub fn require_role(&self, allowed: &[&str]) -> Result<(), ApiError> {
        if allowed.contains(&self.role.as_str()) {
            Ok(())
        } else {
            Err(ApiError::forbidden(format!(
                "role '{}' is not permitted to perform this action",
                self.role
            )))
        }
    }
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or_else(|| ApiError::unauthorized("missing Authorization header"))?;

        let token = header
            .strip_prefix("Bearer ")
            .ok_or_else(|| ApiError::unauthorized("Authorization header must be a Bearer token"))?;

        let claims = jwt::verify_token(token).map_err(|_| ApiError::unauthorized("invalid or expired token"))?;

        Ok(AuthUser { user_id: claims.sub, role: claims.role })
    }
}
