import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { apiRequest } from '../api';

function lookup(list, id) {
  return list.find((x) => x.id === id);
}

const EMPTY_TRIP_FORM = {
  source: '',
  destination: '',
  vehicle_id: '',
  driver_id: '',
  cargo_weight: '',
  planned_distance: '',
};

export default function Trips() {
  const canManage = true; // any logged-in user can manage

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripForm, setNewTripForm] = useState(EMPTY_TRIP_FORM);
  const [newTripError, setNewTripError] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingTrip, setEditingTrip] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_TRIP_FORM);
  const [editError, setEditError] = useState('');

  const [completingTrip, setCompletingTrip] = useState(null);
  const [completeForm, setCompleteForm] = useState({ final_odometer: '', fuel_consumed: '' });
  const [completeError, setCompleteError] = useState('');

  const [actionError, setActionError] = useState('');

  function load() {
    Promise.all([apiRequest('/trips'), apiRequest('/vehicles'), apiRequest('/drivers')])
      .then(([t, v, d]) => {
        setTrips(t);
        setVehicles(v);
        setDrivers(d);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  function updateNewTripField(field, value) {
    setNewTripForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreateTrip(e) {
    e.preventDefault();
    setNewTripError('');
    setSaving(true);
    try {
      await apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify({
          source: newTripForm.source,
          destination: newTripForm.destination,
          vehicle_id: newTripForm.vehicle_id,
          driver_id: newTripForm.driver_id,
          cargo_weight: Number(newTripForm.cargo_weight),
          planned_distance: Number(newTripForm.planned_distance),
        }),
      });
      setShowNewTrip(false);
      setNewTripForm(EMPTY_TRIP_FORM);
      load();
    } catch (err) {
      setNewTripError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function openEditForm(trip) {
    setEditingTrip(trip);
    setEditForm({
      ...EMPTY_TRIP_FORM,
      source: trip.source,
      destination: trip.destination,
      cargo_weight: String(trip.cargo_weight),
      planned_distance: String(trip.planned_distance),
    });
    setEditError('');
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditError('');
    try {
      await apiRequest(`/trips/${editingTrip.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          source: editForm.source,
          destination: editForm.destination,
          cargo_weight: Number(editForm.cargo_weight),
          planned_distance: Number(editForm.planned_distance),
        }),
      });
      setEditingTrip(null);
      load();
    } catch (err) {
      setEditError(err.message);
    }
  }

  async function handleDeleteTrip(tripId) {
    setActionError('');
    try {
      await apiRequest(`/trips/${tripId}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDispatch(tripId) {
    setActionError('');
    try {
      await apiRequest(`/trips/${tripId}/dispatch`, { method: 'POST' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleCancel(tripId) {
    setActionError('');
    try {
      await apiRequest(`/trips/${tripId}/cancel`, { method: 'POST' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleComplete(e) {
    e.preventDefault();
    setCompleteError('');
    try {
      await apiRequest(`/trips/${completingTrip.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          final_odometer: Number(completeForm.final_odometer),
          fuel_consumed: Number(completeForm.fuel_consumed),
        }),
      });
      setCompletingTrip(null);
      setCompleteForm({ final_odometer: '', fuel_consumed: '' });
      load();
    } catch (err) {
      setCompleteError(err.message);
    }
  }

  const availableVehicles = vehicles.filter((v) => v.status === 'available');
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  return (
    <>
      <div className="topbar">
        <div>
          <span className="kicker">Operations</span>
          <h2>Trip Management</h2>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowNewTrip(true)}>
            New Trip
          </button>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}
      {actionError && <div className="error-text">{actionError}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo (kg)</th>
              <th>Distance (km)</th>
              <th>Status</th>
              {canManage && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td>{t.source} &rarr; {t.destination}</td>
                <td className="mono">{lookup(vehicles, t.vehicle_id)?.registration_number}</td>
                <td>{lookup(drivers, t.driver_id)?.name}</td>
                <td>{t.cargo_weight}</td>
                <td>{t.planned_distance}</td>
                <td><StatusBadge status={t.status} /></td>
                {canManage && (
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.status === 'draft' && (
                      <>
                        <button className="btn btn-secondary" onClick={() => openEditForm(t)}>Edit</button>
                        <button className="btn btn-secondary" onClick={() => handleDeleteTrip(t.id)}>Delete</button>
                        <button className="btn btn-secondary" onClick={() => handleDispatch(t.id)}>Dispatch</button>
                      </>
                    )}
                    {t.status === 'dispatched' && (
                      <button className="btn btn-secondary" onClick={() => setCompletingTrip(t)}>
                        Complete
                      </button>
                    )}
                    {(t.status === 'draft' || t.status === 'dispatched') && (
                      <button className="btn btn-secondary" onClick={() => handleCancel(t.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNewTrip && (
        <Modal title="New Trip" onClose={() => setShowNewTrip(false)}>
          <form onSubmit={handleCreateTrip}>
            <div className="field">
              <label>Source</label>
              <input required value={newTripForm.source} onChange={(e) => updateNewTripField('source', e.target.value)} />
            </div>
            <div className="field">
              <label>Destination</label>
              <input required value={newTripForm.destination} onChange={(e) => updateNewTripField('destination', e.target.value)} />
            </div>
            <div className="field">
              <label>Vehicle (available only)</label>
              <select
                required
                value={newTripForm.vehicle_id}
                onChange={(e) => updateNewTripField('vehicle_id', e.target.value)}
              >
                <option value="">Select a vehicle</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration_number} ({v.max_load_capacity} kg)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Driver (available only)</label>
              <select
                required
                value={newTripForm.driver_id}
                onChange={(e) => updateNewTripField('driver_id', e.target.value)}
              >
                <option value="">Select a driver</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Cargo Weight (kg)</label>
              <input
                required
                type="number"
                min="1"
                value={newTripForm.cargo_weight}
                onChange={(e) => updateNewTripField('cargo_weight', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Planned Distance (km)</label>
              <input
                required
                type="number"
                min="1"
                value={newTripForm.planned_distance}
                onChange={(e) => updateNewTripField('planned_distance', e.target.value)}
              />
            </div>
            {newTripError && <div className="error-text">{newTripError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? 'Saving...' : 'Create Trip'}
            </button>
          </form>
        </Modal>
      )}

      {editingTrip && (
        <Modal title="Edit Trip" onClose={() => setEditingTrip(null)}>
          <form onSubmit={handleEditSubmit}>
            <div className="field">
              <label>Source</label>
              <input required value={editForm.source} onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))} />
            </div>
            <div className="field">
              <label>Destination</label>
              <input required value={editForm.destination} onChange={(e) => setEditForm((f) => ({ ...f, destination: e.target.value }))} />
            </div>
            <div className="field">
              <label>Cargo Weight (kg)</label>
              <input
                required
                type="number"
                min="1"
                value={editForm.cargo_weight}
                onChange={(e) => setEditForm((f) => ({ ...f, cargo_weight: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Planned Distance (km)</label>
              <input
                required
                type="number"
                min="1"
                value={editForm.planned_distance}
                onChange={(e) => setEditForm((f) => ({ ...f, planned_distance: e.target.value }))}
              />
            </div>
            {editError && <div className="error-text">{editError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {completingTrip && (
        <Modal title="Complete Trip" onClose={() => setCompletingTrip(null)}>
          <form onSubmit={handleComplete}>
            <div className="field">
              <label>Final Odometer</label>
              <input
                required
                type="number"
                min="0"
                value={completeForm.final_odometer}
                onChange={(e) => setCompleteForm((f) => ({ ...f, final_odometer: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Fuel Consumed (liters)</label>
              <input
                required
                type="number"
                min="0"
                value={completeForm.fuel_consumed}
                onChange={(e) => setCompleteForm((f) => ({ ...f, fuel_consumed: e.target.value }))}
              />
            </div>
            {completeError && <div className="error-text">{completeError}</div>}
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Mark Completed
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
