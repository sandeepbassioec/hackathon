import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { mockVehicles } from '../data/mockData';

export default function Vehicles() {
  const [statusFilter, setStatusFilter] = useState('all');

  const rows = mockVehicles.filter(
    (v) => statusFilter === 'all' || v.status === statusFilter
  );

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Master Data</span>
          <h2>Vehicle Registry</h2>
        </div>
        <button className="btn btn-primary">Add Vehicle</button>
      </div>

      <div className="toolbar">
        <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="in_shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Registration</th>
              <th>Model</th>
              <th>Type</th>
              <th>Max Load (kg)</th>
              <th>Odometer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="mono">{v.registration_number}</td>
                <td>{v.name_model}</td>
                <td>{v.vehicle_type}</td>
                <td>{v.max_load_capacity}</td>
                <td>{v.odometer.toLocaleString()}</td>
                <td><StatusBadge status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
