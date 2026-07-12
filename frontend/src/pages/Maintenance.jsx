import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { apiRequest } from '../api';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest('/maintenance'), apiRequest('/vehicles')])
      .then(([m, v]) => {
        setLogs(m);
        setVehicles(v);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Maintenance</h2>
        </div>
        <button className="btn btn-primary">New Maintenance Record</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((m) => (
              <tr key={m.id}>
                <td className="mono">
                  {vehicles.find((v) => v.id === m.vehicle_id)?.registration_number}
                </td>
                <td>{m.description}</td>
                <td>&#8377;{m.cost.toLocaleString()}</td>
                <td><StatusBadge status={m.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
