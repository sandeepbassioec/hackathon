import StatusBadge from '../components/StatusBadge';
import { mockMaintenance, mockVehicles } from '../data/mockData';

export default function Maintenance() {
  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Maintenance</h2>
        </div>
        <button className="btn btn-primary">New Maintenance Record</button>
      </div>

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
            {mockMaintenance.map((m) => (
              <tr key={m.id}>
                <td className="mono">
                  {mockVehicles.find((v) => v.id === m.vehicle_id)?.registration_number}
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
