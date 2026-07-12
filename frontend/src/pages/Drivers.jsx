import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

const EMPTY_FORM = {
  name: '',
  license_number: '',
  license_category: '',
  license_expiry_date: '',
  contact_number: '',
  safety_score: '100',
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    apiRequest('/drivers')
      .then(setDrivers)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await apiRequest('/drivers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          license_number: form.license_number,
          license_category: form.license_category,
          license_expiry_date: form.license_expiry_date,
          contact_number: form.contact_number,
          safety_score: Number(form.safety_score),
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
          <h2>Driver Management</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Driver
        </button>
      </div>

      {error && <div className="error-text">{error}</div>}

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
            {drivers.map((d) => (
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

      {showForm && (
        <Modal title="Add Driver" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div className="field">
              <label>License Number</label>
              <input
                required
                value={form.license_number}
                onChange={(e) => updateField('license_number', e.target.value)}
              />
            </div>
            <div className="field">
              <label>License Category</label>
              <input
                required
                value={form.license_category}
                onChange={(e) => updateField('license_category', e.target.value)}
              />
            </div>
            <div className="field">
              <label>License Expiry Date</label>
              <input
                required
                type="date"
                value={form.license_expiry_date}
                onChange={(e) => updateField('license_expiry_date', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Contact Number</label>
              <input
                required
                value={form.contact_number}
                onChange={(e) => updateField('contact_number', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Safety Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.safety_score}
                onChange={(e) => updateField('safety_score', e.target.value)}
              />
            </div>
            {formError && <div className="error-text">{formError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Driver'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
