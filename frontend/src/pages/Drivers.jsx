import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { apiRequest } from '../api';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/drivers')
      .then(setDrivers)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Master Data</span>
          <h2>Driver Management</h2>
        </div>
        <button className="btn btn-primary">Add Driver</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>License No.</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Safety Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td className="mono">{d.license_number}</td>
                <td>{d.license_category}</td>
                <td>{d.license_expiry_date}</td>
                <td>{d.safety_score}</td>
                <td><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
