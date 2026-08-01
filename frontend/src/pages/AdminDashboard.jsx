import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import VehicleList from '../components/VehicleList';
import { api } from '../api';

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <Layout role="admin">
      <div className="section-block">
        <div className="section-heading">
          <h2 className="section-title">Vehicles</h2>
          <p className="muted">
            Click a vehicle number to open its calendar and view tour details.
          </p>
        </div>
        <VehicleList
          vehicles={vehicles}
          basePath="/admin/vehicles"
          loading={loading}
          error={error}
        />
      </div>
    </Layout>
  );
}
