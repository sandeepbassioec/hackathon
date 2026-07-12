-- Demo/sample data so the app has something to show immediately.
-- Safe to delete or edit freely — this is not part of the graded solution,
-- just seed data standing in for what mockData.js had in the frontend.
--
-- All four demo users share the password: password123

INSERT INTO users (email, password_hash, role_id) VALUES
    ('fleet.manager@transitops.demo', '$argon2id$v=19$m=19456,t=2,p=1$rghf7WC33CxC9gKRVSAkjA$cRhHts4NhjzeIb72pJtM6zBJQansGB+ZRdAdCuss4Jk', (SELECT id FROM roles WHERE name = 'fleet_manager')),
    ('driver@transitops.demo', '$argon2id$v=19$m=19456,t=2,p=1$rghf7WC33CxC9gKRVSAkjA$cRhHts4NhjzeIb72pJtM6zBJQansGB+ZRdAdCuss4Jk', (SELECT id FROM roles WHERE name = 'driver')),
    ('safety.officer@transitops.demo', '$argon2id$v=19$m=19456,t=2,p=1$rghf7WC33CxC9gKRVSAkjA$cRhHts4NhjzeIb72pJtM6zBJQansGB+ZRdAdCuss4Jk', (SELECT id FROM roles WHERE name = 'safety_officer')),
    ('financial.analyst@transitops.demo', '$argon2id$v=19$m=19456,t=2,p=1$rghf7WC33CxC9gKRVSAkjA$cRhHts4NhjzeIb72pJtM6zBJQansGB+ZRdAdCuss4Jk', (SELECT id FROM roles WHERE name = 'financial_analyst'));

INSERT INTO vehicles (id, registration_number, name_model, vehicle_type, max_load_capacity, odometer, acquisition_cost, status) VALUES
    (gen_random_uuid(), 'MH12AB1234', 'Tata Ace', 'Mini Truck', 750, 18420, 650000, 'available'),
    (gen_random_uuid(), 'MH12CD5678', 'Ashok Leyland Dost', 'LCV', 1250, 44210, 980000, 'on_trip'),
    (gen_random_uuid(), 'MH14EF9012', 'Mahindra Bolero Pickup', 'Pickup', 900, 76210, 720000, 'in_shop'),
    (gen_random_uuid(), 'MH04GH3456', 'Eicher Pro 2049', 'Truck', 4900, 120500, 2100000, 'retired');

INSERT INTO drivers (id, name, license_number, license_category, license_expiry_date, contact_number, safety_score, status) VALUES
    (gen_random_uuid(), 'Alex Menon', 'DL-2291-KA', 'LMV', '2027-03-14', '9876543210', 92, 'available'),
    (gen_random_uuid(), 'Priya Nair', 'DL-8817-MH', 'HMV', '2026-11-02', '9822011234', 88, 'on_trip'),
    (gen_random_uuid(), 'Ravi Kumar', 'DL-4432-DL', 'HMV', '2026-08-19', '9911223344', 74, 'suspended');

INSERT INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status) VALUES
    (gen_random_uuid(), 'Pune', 'Mumbai',
        (SELECT id FROM vehicles WHERE registration_number = 'MH12CD5678'),
        (SELECT id FROM drivers WHERE license_number = 'DL-8817-MH'),
        900, 150, 'dispatched'),
    (gen_random_uuid(), 'Nashik', 'Pune',
        (SELECT id FROM vehicles WHERE registration_number = 'MH12AB1234'),
        (SELECT id FROM drivers WHERE license_number = 'DL-2291-KA'),
        300, 210, 'draft'),
    (gen_random_uuid(), 'Pune', 'Solapur',
        (SELECT id FROM vehicles WHERE registration_number = 'MH14EF9012'),
        (SELECT id FROM drivers WHERE license_number = 'DL-4432-DL'),
        600, 250, 'completed');

INSERT INTO maintenance_logs (id, vehicle_id, description, cost, status) VALUES
    (gen_random_uuid(), (SELECT id FROM vehicles WHERE registration_number = 'MH14EF9012'), 'Suspension repair', 8400, 'open'),
    (gen_random_uuid(), (SELECT id FROM vehicles WHERE registration_number = 'MH04GH3456'), 'Engine overhaul', 45000, 'closed');

INSERT INTO fuel_logs (id, vehicle_id, liters, cost, log_date) VALUES
    (gen_random_uuid(), (SELECT id FROM vehicles WHERE registration_number = 'MH12AB1234'), 32, 3040, '2026-07-10'),
    (gen_random_uuid(), (SELECT id FROM vehicles WHERE registration_number = 'MH12CD5678'), 58, 5510, '2026-07-11');

INSERT INTO expenses (id, vehicle_id, expense_type, amount, expense_date, description) VALUES
    (gen_random_uuid(), (SELECT id FROM vehicles WHERE registration_number = 'MH12CD5678'), 'Toll', 420, '2026-07-11', 'Mumbai-Pune expressway');
