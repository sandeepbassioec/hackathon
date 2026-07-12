import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { apiRequest } from '../api';

function lookup(list, id) {
  return list.find((x) => x.id === id);
}

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest('/trips'), apiRequest('/vehicles'), apiRequest('/drivers')])
      .then(([t, v, d]) => {
        setTrips(t);
        setVehicles(v);
        setDrivers(d);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Trip Management</h2>
        </div>
        <button className="btn btn-primary">New Trip</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Distance (km)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td>{t.source} &rarr; {t.destination}</td>
                <td className="mono">{lookup(vehicles, t.vehicle_id)?.registration_number}</td>
                <td>{lookup(drivers, t.driver_id)?.name}</td>
                <td>{t.cargo_weight}</td>
                <td>{t.planned_distance}</td>
                <td><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
