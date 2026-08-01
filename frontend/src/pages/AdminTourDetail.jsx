import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AdminTourForm from '../components/AdminTourForm';
import { api } from '../api';

export default function AdminTourDetail({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = mode === 'new';
  const [tour, setTour] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const fromCalendarId = location.state?.fromCalendar;

  useEffect(() => {
    (async () => {
      try {
        const [vehicleList, companyList, tourData] = await Promise.all([
          api.getVehicles(),
          api.getCompanies(),
          isNew ? Promise.resolve(null) : api.getTour(id),
        ]);
        setVehicles(vehicleList);
        setCompanies(companyList);
        setTour(tourData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  async function handleSubmit(payload) {
    if (isNew) {
      const created = await api.createTour(payload);
      navigate(`/admin/tours/${created._id}`);
    } else {
      const updated = await api.updateTour(id, payload);
      setTour(updated);
    }
  }

  const vehicleId = tour?.vehicle?._id || tour?.vehicle || fromCalendarId;
  const backTo = fromCalendarId
    ? `/admin/vehicles/${fromCalendarId}/calendar`
    : '/admin/tours';
  const backLabel = fromCalendarId ? '← Back to calendar' : '← Back to tours';

  return (
    <Layout role="admin">
      <div className="page-header row">
        <div>
          <Link to={backTo} className="back-link">
            {backLabel}
          </Link>
          <h1>{isNew ? 'New tour' : 'Tour details'}</h1>
          {!isNew && vehicleId && !fromCalendarId && (
            <p className="muted">
              <Link to={`/admin/vehicles/${vehicleId}/calendar`}>
                View on vehicle calendar →
              </Link>
            </p>
          )}
        </div>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="panel">
          <AdminTourForm
            initial={tour}
            vehicles={vehicles}
            companies={companies}
            onSubmit={handleSubmit}
            onCancel={() => navigate(backTo)}
            submitLabel={isNew ? 'Create tour' : 'Save changes'}
          />
        </div>
      )}
    </Layout>
  );
}
