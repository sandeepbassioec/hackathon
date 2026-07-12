import { mockVehicleRoi } from '../data/mockData';

export default function Reports() {
  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Analytics</span>
          <h2>Reports</h2>
        </div>
        <button className="btn btn-secondary">Export CSV</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Vehicle ROI</h3>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Revenue</th>
              <th>Fuel</th>
              <th>Maintenance</th>
              <th>Acquisition Cost</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {mockVehicleRoi.map((r) => (
              <tr key={r.registration_number}>
                <td className="mono">{r.registration_number}</td>
                <td>&#8377;{r.revenue.toLocaleString()}</td>
                <td>&#8377;{r.fuel.toLocaleString()}</td>
                <td>&#8377;{r.maintenance.toLocaleString()}</td>
                <td>&#8377;{r.acquisition_cost.toLocaleString()}</td>
                <td className="mono">{(r.roi * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
