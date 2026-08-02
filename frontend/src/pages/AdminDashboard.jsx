import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import VehicleList from '../components/VehicleList';
import { api } from '../api';
import { VEHICLE_CATEGORY_OPTIONS } from '../utils/format';

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        setVehicles(await api.getVehicles());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (categoryFilter === 'all') return vehicles;
    return vehicles.filter((v) => (v.category || 'others') === categoryFilter);
  }, [vehicles, categoryFilter]);

  return (
    <Layout role="admin">
      <div className="section-block">
        <div className="section-heading row">
          <h2 className="section-title">Vehicles</h2>
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
        </div>
        <VehicleList
          vehicles={filteredVehicles}
          basePath="/admin/vehicles"
          loading={loading}
          error={error}
          emptyMessage={
            vehicles.length
              ? 'No vehicles match this category.'
              : 'No vehicles yet.'
          }
        />
      </div>
    </Layout>
  );
}
