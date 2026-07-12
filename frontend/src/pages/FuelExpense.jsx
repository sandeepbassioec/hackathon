import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export default function FuelExpense() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest('/fuel'), apiRequest('/expenses'), apiRequest('/vehicles')])
      .then(([f, e, v]) => {
        setFuelLogs(f);
        setExpenses(e);
        setVehicles(v);
      })
      .catch((err) => setError(err.message));
  }, []);

  function regNo(vehicleId) {
    return vehicles.find((v) => v.id === vehicleId)?.registration_number;
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Fuel & Expense</h2>
        </div>
        <button className="btn btn-primary">Add Entry</button>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="two-col">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Fuel Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Liters</th>
                <th>Cost</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((f) => (
                <tr key={f.id}>
                  <td className="mono">{regNo(f.vehicle_id)}</td>
                  <td>{f.liters}</td>
                  <td>&#8377;{f.cost}</td>
                  <td>{f.log_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Other Expenses</h3>
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="mono">{regNo(e.vehicle_id)}</td>
                  <td>{e.expense_type}</td>
                  <td>&#8377;{e.amount}</td>
                  <td>{e.expense_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
