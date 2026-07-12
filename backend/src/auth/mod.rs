pub mod jwt;
pub mod password;

// TODO(Team Lead): add an Axum extractor that reads the `Authorization: Bearer <token>`
// header, calls jwt::verify_token, and rejects the request (401) if missing/invalid.
// Wrap it with a role check helper for RBAC (e.g. require_role("fleet_manager")).
