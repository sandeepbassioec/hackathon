# TransitOps

Smart Transport Operations Platform — vehicle, driver, dispatch, maintenance and
expense management with role-based access and operational analytics.

## Stack

- Backend: Rust (Axum + sqlx + PostgreSQL)
- Frontend: React (Vite)
- Auth: JWT with role-based access control

## Getting started

1. Start Postgres:
   ```
   docker compose up -d
   ```
2. Backend:
   ```
   cd backend
   cp .env.example .env
   cargo install sqlx-cli --no-default-features --features postgres
   sqlx migrate run
   cargo run
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

## Module ownership

Everything is committed to `main` directly (single-branch requirement), so
ownership is split by file/folder to avoid conflicts. Push often (every 1-2
hours) and `git pull --rebase` before pushing.

| Owner | Area | Files |
|---|---|---|
| Team Lead | Auth/RBAC, Vehicle & Driver master data | `backend/src/auth/*`, `backend/src/routes/vehicles.rs`, `backend/src/routes/drivers.rs`, `backend/src/models/vehicle.rs`, `backend/src/models/driver.rs` |
| Member 2 | Trip lifecycle, Maintenance, Fuel & Expense, Reports | `backend/src/routes/trips.rs`, `backend/src/routes/maintenance.rs`, `backend/src/routes/fuel_expense.rs`, `backend/src/routes/reports.rs`, matching models |
| Member 3 | Frontend (dashboard, forms, KPIs) | `frontend/*` |

Shared/foundational files (`main.rs`, `db.rs`, `migrations/`) are already wired
up — coordinate before editing those since everyone depends on them.

## Business rules to implement live

See the problem statement for the full rule set (unique registration numbers,
status transitions, cargo weight vs. capacity, license/status checks on
dispatch, ROI formula, etc.). These are intentionally left as `TODO`s in the
route handlers.
