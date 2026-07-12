// Placeholder data so the UI is fully navigable while the backend routes
// (vehicles/drivers/trips/maintenance/fuel-expense/reports) are still TODOs.
// Once a route returns real JSON, swap the matching mock array in the page
// for an apiRequest() call — the shapes below already match the DB schema.

export const mockKpis = {
  activeVehicles: 18,
  availableVehicles: 11,
  inMaintenance: 3,
  activeTrips: 6,
  pendingTrips: 2,
  driversOnDuty: 9,
  fleetUtilization: 61,
};

export const mockVehicles = [
  { id: 'v1', registration_number: 'MH12AB1234', name_model: 'Tata Ace', vehicle_type: 'Mini Truck', max_load_capacity: 750, odometer: 18420, acquisition_cost: 650000, status: 'available' },
  { id: 'v2', registration_number: 'MH12CD5678', name_model: 'Ashok Leyland Dost', vehicle_type: 'LCV', max_load_capacity: 1250, odometer: 44210, acquisition_cost: 980000, status: 'on_trip' },
  { id: 'v3', registration_number: 'MH14EF9012', name_model: 'Mahindra Bolero Pickup', vehicle_type: 'Pickup', max_load_capacity: 900, odometer: 76210, acquisition_cost: 720000, status: 'in_shop' },
  { id: 'v4', registration_number: 'MH04GH3456', name_model: 'Eicher Pro 2049', vehicle_type: 'Truck', max_load_capacity: 4900, odometer: 120500, acquisition_cost: 2100000, status: 'retired' },
];

export const mockDrivers = [
  { id: 'd1', name: 'Alex Menon', license_number: 'DL-2291-KA', license_category: 'LMV', license_expiry_date: '2027-03-14', contact_number: '9876543210', safety_score: 92, status: 'available' },
  { id: 'd2', name: 'Priya Nair', license_number: 'DL-8817-MH', license_category: 'HMV', license_expiry_date: '2026-11-02', contact_number: '9822011234', safety_score: 88, status: 'on_trip' },
  { id: 'd3', name: 'Ravi Kumar', license_number: 'DL-4432-DL', license_category: 'HMV', license_expiry_date: '2026-08-19', contact_number: '9911223344', safety_score: 74, status: 'suspended' },
];

export const mockTrips = [
  { id: 't1', source: 'Pune', destination: 'Mumbai', vehicle_id: 'v2', driver_id: 'd2', cargo_weight: 900, planned_distance: 150, status: 'dispatched' },
  { id: 't2', source: 'Nashik', destination: 'Pune', vehicle_id: 'v1', driver_id: 'd1', cargo_weight: 300, planned_distance: 210, status: 'draft' },
  { id: 't3', source: 'Pune', destination: 'Solapur', vehicle_id: 'v3', driver_id: 'd3', cargo_weight: 600, planned_distance: 250, status: 'completed' },
];

export const mockMaintenance = [
  { id: 'm1', vehicle_id: 'v3', description: 'Suspension repair', cost: 8400, status: 'open' },
  { id: 'm2', vehicle_id: 'v4', description: 'Engine overhaul', cost: 45000, status: 'closed' },
];

export const mockFuelLogs = [
  { id: 'f1', vehicle_id: 'v1', liters: 32, cost: 3040, log_date: '2026-07-10' },
  { id: 'f2', vehicle_id: 'v2', liters: 58, cost: 5510, log_date: '2026-07-11' },
];

export const mockExpenses = [
  { id: 'e1', vehicle_id: 'v2', expense_type: 'Toll', amount: 420, expense_date: '2026-07-11', description: 'Mumbai-Pune expressway' },
];

export const mockVehicleRoi = [
  { registration_number: 'MH12AB1234', revenue: 180000, fuel: 24000, maintenance: 6000, acquisition_cost: 650000, roi: 0.231 },
  { registration_number: 'MH12CD5678', revenue: 260000, fuel: 41000, maintenance: 12000, acquisition_cost: 980000, roi: 0.211 },
];
