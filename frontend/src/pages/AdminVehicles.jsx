import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import VehicleList from '../components/VehicleList';
import { api } from '../api';
import { VEHICLE_TYPE_OPTIONS, vehicleTypeLabel } from '../utils/format';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [numberPlate, setNumberPlate] = useState('');
  const [type, setType] = useState('bus');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setVehicles(await api.getVehicles());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.createVehicle({ numberPlate: numberPlate.trim(), type });
      setNumberPlate('');
      setType('bus');
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this vehicle? Assigned tours will become unassigned.')) return;
    try {
      await api.deleteVehicle(id);
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout role="admin">
      <div className="page-header row">
        <div>
          <h1>Vehicles</h1>
          <p className="muted">Click a vehicle number to open its schedule calendar.</p>
        </div>
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Add vehicle'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form panel" onSubmit={handleCreate}>
          {formError && <p className="error">{formError}</p>}
          <label>
            Vehicle number
            <input
              value={numberPlate}
              onChange={(e) => setNumberPlate(e.target.value)}
              placeholder="e.g. NF 4507"
              required
            />
          </label>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {VEHICLE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create'}
          </button>
        </form>
      )}

      <VehicleList
        vehicles={vehicles}
        basePath="/admin/vehicles"
        loading={loading}
        error={error}
      />

      {!loading && vehicles.length > 0 && (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>
                    <Link to={`/admin/vehicles/${v._id}/calendar`}>{v.numberPlate}</Link>
                  </td>
                  <td>
                    <span className={`type-chip ${v.type}`}>{vehicleTypeLabel(v.type)}</span>
                  </td>
                  <td className="right">
                    <button type="button" className="btn danger ghost" onClick={() => handleDelete(v._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
