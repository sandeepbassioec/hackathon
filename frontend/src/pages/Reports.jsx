import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export default function Reports() {
  const [costs, setCosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/reports/vehicle-roi')
      .then(setCosts)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Analytics</span>
          <h2>Reports</h2>
        </div>
        <button className="btn btn-secondary">Export CSV</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Vehicle Cost Summary</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0, marginBottom: 12 }}>
          ROI needs a revenue figure per vehicle, which isn't part of the
          problem statement's data model yet — showing cost breakdown until
          the team decides a revenue source (e.g. a per-trip billing rate).
        </p>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Acquisition Cost</th>
              <th>Total Fuel Cost</th>
              <th>Total Maintenance Cost</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((r) => (
              <tr key={r.registration_number}>
                <td className="mono">{r.registration_number}</td>
                <td>&#8377;{r.acquisition_cost.toLocaleString()}</td>
                <td>&#8377;{r.total_fuel_cost.toLocaleString()}</td>
                <td>&#8377;{r.total_maintenance_cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
