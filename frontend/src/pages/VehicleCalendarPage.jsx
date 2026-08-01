import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import TourCalendar from '../components/TourCalendar';
import { api } from '../api';

export default function VehicleCalendarPage({ role }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const base = role === 'admin' ? '/admin' : '/driver';

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [v, t] = await Promise.all([
          api.getVehicle(id),
          api.getVehicleTours(id),
        ]);
        setVehicle(v);
        setTours(t);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <Layout role={role}>
      <div className="page-header">
        <Link to={role === 'admin' ? '/admin/vehicles' : '/driver'} className="back-link">
          ← Back to vehicles
        </Link>
        {vehicle && (
          <>
            <h1>{vehicle.numberPlate}</h1>
            <p className="muted capitalize">
              {vehicle.type} · click a marked schedule for tour details
            </p>
          </>
        )}
      </div>

      {loading && <p className="muted">Loading calendar…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="panel">
          <TourCalendar
            tours={tours}
            onSelectTour={(tour) =>
              navigate(`${base}/tours/${tour._id}`, {
                state: { fromCalendar: id },
              })
            }
          />
        </div>
      )}
    </Layout>
  );
}
