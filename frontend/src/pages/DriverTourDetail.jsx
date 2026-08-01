import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import DriverTourForm from '../components/DriverTourForm';
import { api } from '../api';

export default function DriverTourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setTour(await api.getTour(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleSubmit(payload) {
    const updated = await api.updateDriverTour(id, payload);
    setTour(updated);
  }

  const backTo = tour?.vehicle?._id
    ? `/driver/vehicles/${tour.vehicle._id}/calendar`
    : '/driver';

  return (
    <Layout role="driver">
      <div className="page-header">
        <Link to={backTo} className="back-link">
          ← Back
        </Link>
        <h1>Tour details</h1>
        <p className="muted">You can update fuel and bill amounts only.</p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && tour && (
        <div className="panel">
          <DriverTourForm tour={tour} onSubmit={handleSubmit} />
        </div>
      )}
    </Layout>
  );
}
