# TransitOps

Smart Transport Operations Platform — vehicle, driver, dispatch, maintenance and
expense management with role-based access and operational analytics.

## Stack

- Backend: Rust (Axum + sqlx + PostgreSQL)
- Frontend: React (Vite)
- Auth: JWT with role-based access control

## Getting started

1. Postgres: either use your own local install, or `docker compose up -d`
   (provisions a matching `odoo_hackathon` database). If you already created
   the `odoo_hackathon` database yourself, just point `DATABASE_URL` at it.
2. Backend:
   ```
   cd backend
   cp .env.example .env        # edit DATABASE_URL user/password to match your local Postgres
   cargo install sqlx-cli --no-default-features --features postgres
   sqlx migrate run            # creates tables (0001) and inserts demo data (0002)
   cargo run
   ```
   Migration `0002_seed.sql` inserts demo rows for every table (vehicles,
   drivers, trips, maintenance, fuel logs, expenses) plus one login user per
   role. Log in with any of these — all share the password `password123`:
   - `fleet.manager@transitops.demo`
   - `driver@transitops.demo`
   - `safety.officer@transitops.demo`
   - `financial.analyst@transitops.demo`

   The seed data isn't part of the graded solution — delete or edit
   `0002_seed.sql` freely, or add your own rows via `cargo run --example
   hash_password -- <password>` to generate a hash for a new user.
3. Frontend (runs on `http://localhost:5174`):
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Every screen calls the real backend API (see `frontend/src/api.js`) — no
   mock data left in the frontend. List endpoints (`GET /api/vehicles`,
   `/drivers`, `/trips`, `/maintenance`, `/fuel`, `/expenses`,
   `/reports/dashboard`, `/reports/vehicle-roi`) are already wired to
   Postgres; create/update endpoints and business-rule validation are still
   `TODO`s in `backend/src/routes/` for the team to build live.

## Windows build note

On Windows, if `cargo build` fails with an MSVC linker error (`LNK1104`,
`cannot open file 'msvcrt.lib'`) or a `ring`/`cc-rs` compile error about a
missing `vcruntime.h`, create a **local, untracked**
`backend/.cargo/config.toml` (already gitignored) with your machine's actual
Visual Studio / Windows SDK paths:

```toml
[target.x86_64-pc-windows-msvc]
linker = "C:\\Path\\To\\VC\\Tools\\MSVC\\<version>\\bin\\Hostx64\\x64\\link.exe"

[env]
LIB = "C:\\Path\\To\\VC\\Tools\\MSVC\\<version>\\lib\\x64;C:\\Path\\To\\Windows Kits\\10\\Lib\\<sdk>\\ucrt\\x64;C:\\Path\\To\\Windows Kits\\10\\Lib\\<sdk>\\um\\x64"
INCLUDE = "C:\\Path\\To\\VC\\Tools\\MSVC\\<version>\\include;C:\\Path\\To\\Windows Kits\\10\\include\\<sdk>\\ucrt;C:\\Path\\To\\Windows Kits\\10\\include\\<sdk>\\um;C:\\Path\\To\\Windows Kits\\10\\include\\<sdk>\\shared"
CC = "C:\\Path\\To\\VC\\Tools\\MSVC\\<version>\\bin\\Hostx64\\x64\\cl.exe"
```

This is **not committed** on purpose — the paths are machine-specific (exact
VS/SDK version differs per install) and, more importantly, Cargo's `[env]`
table applies globally regardless of target OS, so committing a Windows path
here would break the build on macOS/Linux. Mac and Linux need no special
config — `cargo build` just uses the system C compiler (Clang/GCC), no setup
beyond having Xcode Command Line Tools (`xcode-select --install`) or
build-essential installed.

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

## Known gap: Vehicle ROI needs a revenue source

The problem statement's ROI formula is `(Revenue - (Maintenance + Fuel)) /
Acquisition Cost`, but no entity in the given schema tracks revenue per
vehicle. `/api/reports/vehicle-roi` currently returns acquisition cost, total
fuel cost, and total maintenance cost per vehicle — the team needs to decide
where "revenue" comes from (e.g. a rate per trip/distance) before the actual
ROI number can be computed. See the comment in
`backend/src/routes/reports.rs`.

## Business rules to implement live

See the problem statement for the full rule set (unique registration numbers,
status transitions, cargo weight vs. capacity, license/status checks on
dispatch, ROI formula, etc.). These are intentionally left as `TODO`s in the
route handlers.
