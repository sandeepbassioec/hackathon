import StatusBadge from '../components/StatusBadge';
import { mockTrips, mockVehicles, mockDrivers } from '../data/mockData';

function lookup(list, id) {
  return list.find((x) => x.id === id);
}

export default function Trips() {
  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Trip Management</h2>
        </div>
        <button className="btn btn-primary">New Trip</button>
      </div>

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
            {mockTrips.map((t) => (
              <tr key={t.id}>
                <td>{t.source} &rarr; {t.destination}</td>
                <td className="mono">{lookup(mockVehicles, t.vehicle_id)?.registration_number}</td>
                <td>{lookup(mockDrivers, t.driver_id)?.name}</td>
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
