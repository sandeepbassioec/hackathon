import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

const EMPTY_FORM = {
  registration_number: '',
  name_model: '',
  vehicle_type: '',
  max_load_capacity: '',
  acquisition_cost: '',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest('/vehicles')
      .then(setVehicles)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  const rows = vehicles.filter(
    (v) => statusFilter === 'all' || v.status === statusFilter
  );

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          registration_number: form.registration_number,
          name_model: form.name_model,
          vehicle_type: form.vehicle_type,
          max_load_capacity: Number(form.max_load_capacity),
          acquisition_cost: Number(form.acquisition_cost),
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

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Master Data</span>
          <h2>Vehicle Registry</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Vehicle
        </button>
      </div>

      <div className="toolbar">
        <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="in_shop">In Shop</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Registration</th>
              <th>Model</th>
              <th>Type</th>
              <th>Max Load (kg)</th>
              <th>Odometer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <td className="mono">{v.registration_number}</td>
                <td>{v.name_model}</td>
                <td>{v.vehicle_type}</td>
                <td>{v.max_load_capacity}</td>
                <td>{v.odometer.toLocaleString()}</td>
                <td><StatusBadge status={v.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add Vehicle" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Registration Number</label>
              <input
                required
                value={form.registration_number}
                onChange={(e) => updateField('registration_number', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Name / Model</label>
              <input
                required
                value={form.name_model}
                onChange={(e) => updateField('name_model', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Type</label>
              <input
                required
                value={form.vehicle_type}
                onChange={(e) => updateField('vehicle_type', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Max Load Capacity (kg)</label>
              <input
                required
                type="number"
                min="1"
                value={form.max_load_capacity}
                onChange={(e) => updateField('max_load_capacity', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Acquisition Cost</label>
              <input
                required
                type="number"
                min="0"
                value={form.acquisition_cost}
                onChange={(e) => updateField('acquisition_cost', e.target.value)}
              />
            </div>
            {formError && <div className="error-text">{formError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Vehicle'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
