import { useEffect, useState } from 'react';
import StatTile from '../components/StatTile';
import StatusBadge from '../components/StatusBadge';
import { apiRequest } from '../api';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest('/reports/dashboard'),
      apiRequest('/trips'),
      apiRequest('/maintenance'),
    ])
      .then(([k, t, m]) => {
        setKpis(k);
        setTrips(t.slice(0, 5));
        setMaintenance(m.filter((log) => log.status === 'open').slice(0, 5));
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Overview</span>
          <h2>Fleet Dashboard</h2>
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {kpis && (
        <div className="stat-grid">
          <StatTile label="Active Vehicles" value={kpis.active_vehicles} />
          <StatTile label="Available" value={kpis.available_vehicles} />
          <StatTile label="In Maintenance" value={kpis.in_maintenance} />
          <StatTile label="Active Trips" value={kpis.active_trips} />
          <StatTile label="Pending Trips" value={kpis.pending_trips} />
          <StatTile label="Drivers On Duty" value={kpis.drivers_on_duty} />
          <StatTile label="Fleet Utilization" value={kpis.fleet_utilization.toFixed(0)} suffix="%" />
        </div>
      )}

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Recent Trips</h3>
          <table>
            <thead>
              <tr>
                <th>Route</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id}>
                  <td>{t.source} &rarr; {t.destination}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Open Maintenance</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map((m) => (
                <tr key={m.id}>
                  <td>{m.description}</td>
                  <td><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
