import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

const EMPTY_FUEL_FORM = { vehicle_id: '', liters: '', cost: '', log_date: '' };
const EMPTY_EXPENSE_FORM = { vehicle_id: '', expense_type: '', amount: '', expense_date: '', description: '' };

export default function FuelExpense() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [entryType, setEntryType] = useState('fuel');
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL_FORM);
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([apiRequest('/fuel'), apiRequest('/expenses'), apiRequest('/vehicles')])
      .then(([f, e, v]) => {
        setFuelLogs(f);
        setExpenses(e);
        setVehicles(v);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function regNo(vehicleId) {
    return vehicles.find((v) => v.id === vehicleId)?.registration_number;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (entryType === 'fuel') {
        await apiRequest('/fuel', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: fuelForm.vehicle_id,
            liters: Number(fuelForm.liters),
            cost: Number(fuelForm.cost),
            log_date: fuelForm.log_date,
          }),
        });
        setFuelForm(EMPTY_FUEL_FORM);
      } else {
        await apiRequest('/expenses', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: expenseForm.vehicle_id,
            expense_type: expenseForm.expense_type,
            amount: Number(expenseForm.amount),
            expense_date: expenseForm.expense_date,
            description: expenseForm.description || null,
          }),
        });
        setExpenseForm(EMPTY_EXPENSE_FORM);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Fuel & Expense</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Entry
        </button>
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

      {showForm && (
        <Modal title="Add Entry" onClose={() => setShowForm(false)}>
          <div className="toolbar">
            <button
              type="button"
              className={entryType === 'fuel' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setEntryType('fuel')}
            >
              Fuel Log
            </button>
            <button
              type="button"
              className={entryType === 'expense' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setEntryType('expense')}
            >
              Expense
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {entryType === 'fuel' ? (
              <>
                <div className="field">
                  <label>Vehicle</label>
                  <select
                    required
                    value={fuelForm.vehicle_id}
                    onChange={(e) => setFuelForm((f) => ({ ...f, vehicle_id: e.target.value }))}
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.registration_number}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Liters</label>
                  <input required type="number" min="0.1" step="0.1" value={fuelForm.liters}
                    onChange={(e) => setFuelForm((f) => ({ ...f, liters: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Cost</label>
                  <input required type="number" min="0" value={fuelForm.cost}
                    onChange={(e) => setFuelForm((f) => ({ ...f, cost: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input required type="date" value={fuelForm.log_date}
                    onChange={(e) => setFuelForm((f) => ({ ...f, log_date: e.target.value }))} />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Vehicle</label>
                  <select
                    required
                    value={expenseForm.vehicle_id}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, vehicle_id: e.target.value }))}
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.registration_number}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Type (e.g. Toll, Parking)</label>
                  <input required value={expenseForm.expense_type}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, expense_type: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Amount</label>
                  <input required type="number" min="0" value={expenseForm.amount}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Date</label>
                  <input required type="date" value={expenseForm.expense_date}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, expense_date: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Description (optional)</label>
                  <input value={expenseForm.description}
                    onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </>
            )}
            {formError && <div className="error-text">{formError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
