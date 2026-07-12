import StatusBadge from '../components/StatusBadge';
import { mockDrivers } from '../data/mockData';

export default function Drivers() {
  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Master Data</span>
          <h2>Driver Management</h2>
        </div>
        <button className="btn btn-primary">Add Driver</button>
      </div>

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
            {mockDrivers.map((d) => (
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
