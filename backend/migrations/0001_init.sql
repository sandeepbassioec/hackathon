CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES
    ('fleet_manager'),
    ('driver'),
    ('safety_officer'),
    ('financial_analyst');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    name_model TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    max_load_capacity DOUBLE PRECISION NOT NULL,
    odometer DOUBLE PRECISION NOT NULL DEFAULT 0,
    acquisition_cost DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_category TEXT NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number TEXT NOT NULL,
    safety_score DOUBLE PRECISION NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    cargo_weight DOUBLE PRECISION NOT NULL,
    planned_distance DOUBLE PRECISION NOT NULL,
    final_odometer DOUBLE PRECISION,
    fuel_consumed DOUBLE PRECISION,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    description TEXT NOT NULL,
    cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'open',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    liters DOUBLE PRECISION NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    log_date DATE NOT NULL
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    expense_type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT
);
