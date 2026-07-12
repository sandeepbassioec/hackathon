import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

const EMPTY_FORM = { vehicle_id: '', description: '', cost: '' };

export default function Maintenance() {
  const canManage = true; // any logged-in user can manage

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', cost: '' });
  const [editError, setEditError] = useState('');

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

  function openEditForm(log) {
    setEditingLog(log);
    setEditForm({ description: log.description, cost: String(log.cost) });
    setEditError('');
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditError('');
    try {
      await apiRequest(`/maintenance/${editingLog.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: editForm.description,
          cost: Number(editForm.cost),
        }),
      });
      setEditingLog(null);
      load();
    } catch (err) {
      setEditError(err.message);
    }
  }

  async function handleDelete(id) {
    setActionError('');
    try {
      await apiRequest(`/maintenance/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setActionError(err.message);
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
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            New Maintenance Record
          </button>
        )}
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
              {canManage && <th>Actions</th>}
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
                {canManage && (
                  <td style={{ display: 'flex', gap: 6 }}>
                    {m.status === 'open' && (
                      <>
                        <button className="btn btn-secondary" onClick={() => openEditForm(m)}>Edit</button>
                        <button className="btn btn-secondary" onClick={() => handleDelete(m.id)}>Delete</button>
                        <button className="btn btn-secondary" onClick={() => handleClose(m.id)}>Close</button>
                      </>
                    )}
                  </td>
                )}
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

      {editingLog && (
        <Modal title="Edit Maintenance Record" onClose={() => setEditingLog(null)}>
          <form onSubmit={handleEditSubmit}>
            <div className="field">
              <label>Description</label>
              <input
                required
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Cost</label>
              <input
                type="number"
                min="0"
                value={editForm.cost}
                onChange={(e) => setEditForm((f) => ({ ...f, cost: e.target.value }))}
              />
            </div>
            {editError && <div className="error-text">{editError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
