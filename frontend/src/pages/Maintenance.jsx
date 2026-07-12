import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

const EMPTY_FORM = { vehicle_id: '', description: '', cost: '' };

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    Promise.all([apiRequest('/maintenance'), apiRequest('/vehicles')])
      .then(([m, v]) => {
        setLogs(m);
        setVehicles(v);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: form.vehicle_id,
          description: form.description,
          cost: Number(form.cost || 0),
        }),
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleClose(id) {
    setActionError('');
    try {
      await apiRequest(`/maintenance/${id}/close`, { method: 'POST' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  const eligibleVehicles = vehicles.filter((v) => v.status !== 'retired');

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Maintenance</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          New Maintenance Record
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}
      {actionError && <div className="error-text">{actionError}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Actions</th>
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
                <td>
                  {m.status === 'open' && (
                    <button className="btn btn-secondary" onClick={() => handleClose(m.id)}>
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="New Maintenance Record" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Vehicle</label>
              <select
                required
                value={form.vehicle_id}
                onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
              >
                <option value="">Select a vehicle</option>
                {eligibleVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Description</label>
              <input
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Cost</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
              />
            </div>
            {formError && <div className="error-text">{formError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Open Maintenance Record'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
