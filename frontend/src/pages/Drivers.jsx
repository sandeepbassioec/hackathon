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
  const canManage = true; // any logged-in user can manage

  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(driver) {
    setEditingId(driver.id);
    setForm({
      name: driver.name,
      license_number: driver.license_number,
      license_category: driver.license_category,
      license_expiry_date: driver.license_expiry_date,
      contact_number: driver.contact_number,
      safety_score: String(driver.safety_score),
    });
    setFormError('');
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/drivers/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: form.name,
            license_category: form.license_category,
            license_expiry_date: form.license_expiry_date,
            contact_number: form.contact_number,
            safety_score: Number(form.safety_score),
          }),
        });
      } else {
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
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setActionError('');
    try {
      await apiRequest(`/drivers/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Master Data</span>
          <h2>Driver Management</h2>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openAddForm}>
            Add Driver
          </button>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}
      {actionError && <div className="error-text">{actionError}</div>}

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
              {canManage && <th>Actions</th>}
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
                {canManage && (
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary" onClick={() => openEditForm(d)}>Edit</button>
                    <button className="btn btn-secondary" onClick={() => handleDelete(d.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editingId ? 'Edit Driver' : 'Add Driver'} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            </div>
            <div className="field">
              <label>License Number</label>
              <input
                required
                disabled={!!editingId}
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
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Driver'}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
