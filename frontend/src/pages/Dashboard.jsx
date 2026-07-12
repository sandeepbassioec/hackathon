import StatTile from '../components/StatTile';
import StatusBadge from '../components/StatusBadge';
import { mockKpis, mockTrips, mockMaintenance } from '../data/mockData';

export default function Dashboard() {
  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Overview</span>
          <h2>Fleet Dashboard</h2>
        </div>
      </div>

      <div className="stat-grid">
        <StatTile label="Active Vehicles" value={mockKpis.activeVehicles} />
        <StatTile label="Available" value={mockKpis.availableVehicles} />
        <StatTile label="In Maintenance" value={mockKpis.inMaintenance} />
        <StatTile label="Active Trips" value={mockKpis.activeTrips} />
        <StatTile label="Pending Trips" value={mockKpis.pendingTrips} />
        <StatTile label="Drivers On Duty" value={mockKpis.driversOnDuty} />
        <StatTile label="Fleet Utilization" value={mockKpis.fleetUtilization} suffix="%" />
      </div>

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
              {mockTrips.map((t) => (
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
              {mockMaintenance.map((m) => (
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
