import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import VehicleList from '../components/VehicleList';
import { api } from '../api';

export default function DriverHome() {
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
    <Layout role="driver">
      <div className="page-header">
        <h1>Vehicles</h1>
        <p className="muted">Select a vehicle to view its tour schedule.</p>
      </div>

      <p className="driver-note">
        Tap a vehicle to open its calendar, then pick a schedule to record your fuel and bill
        amounts.
      </p>
      <VehicleList
        vehicles={vehicles}
        basePath="/driver/vehicles"
        loading={loading}
        error={error}
      />
    </Layout>
  );
}
