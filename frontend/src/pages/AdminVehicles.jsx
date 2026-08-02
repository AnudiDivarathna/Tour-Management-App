import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import VehicleList from '../components/VehicleList';
import { api } from '../api';
import { VEHICLE_CATEGORY_OPTIONS, VEHICLE_TYPE_OPTIONS } from '../utils/format';
import { useConfirm } from '../hooks/useConfirm';

export default function AdminVehicles() {
  const { confirm } = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [numberPlate, setNumberPlate] = useState('');
  const [type, setType] = useState('bus');
  const [category, setCategory] = useState('others');
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

  const filteredVehicles = useMemo(() => {
    if (categoryFilter === 'all') return vehicles;
    return vehicles.filter((v) => (v.category || 'others') === categoryFilter);
  }, [vehicles, categoryFilter]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await api.createVehicle({
        numberPlate: numberPlate.trim(),
        type,
        category,
      });
      setNumberPlate('');
      setType('bus');
      setCategory('others');
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const vehicle = vehicles.find((v) => v._id === id);
    const ok = await confirm({
      title: vehicle ? `Delete ${vehicle.numberPlate}?` : 'Delete this vehicle?',
      message: 'Assigned tours will become unassigned. This cannot be undone.',
      confirmLabel: 'Delete vehicle',
    });
    if (!ok) return;
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
        <div className="header-actions">
          <label className="filter-control">
            <span>Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All</option>
              {VEHICLE_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close' : 'Add vehicle'}
          </button>
        </div>
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
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {VEHICLE_CATEGORY_OPTIONS.map((opt) => (
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
        vehicles={filteredVehicles}
        basePath="/admin/vehicles"
        loading={loading}
        error={error}
        onDelete={handleDelete}
        emptyMessage={
          vehicles.length
            ? 'No vehicles match this category.'
            : 'No vehicles yet.'
        }
      />
    </Layout>
  );
}
