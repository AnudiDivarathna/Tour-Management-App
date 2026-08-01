import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api';
import { formatDateRange, formatMoney, formatStatus, vehicleLabel } from '../utils/format';
import { downloadToursExcel } from '../utils/exportToursExcel';

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setTours(await api.getTours());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this tour?')) return;
    try {
      await api.deleteTour(id);
      setTours((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleExportExcel() {
    if (!tours.length) {
      alert('No tours to export.');
      return;
    }
    try {
      await downloadToursExcel(tours);
    } catch (err) {
      alert(err.message || 'Failed to export Excel file.');
    }
  }

  return (
    <Layout role="admin">
      <div className="page-header row">
        <div>
          <h1>Tours</h1>
          <p className="muted">All tour records. Unassigned tours have no vehicle yet.</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={handleExportExcel}
            disabled={loading || !tours.length}
          >
            Export Excel
          </button>
          <Link to="/admin/tours/new" className="btn primary">
            Add tour
          </Link>
        </div>
      </div>

      {loading && <p className="muted">Loading tours…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <th>Date range</th>
                <th>Company</th>
                <th>Tour No.</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Fuel</th>
                <th>Total cost</th>
                <th>Net profit</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => {
                const vehicleId = tour.vehicle?._id || tour.vehicle;
                const statusValue =
                  tour.paymentStatus === 'done'
                    ? 'payment_received'
                    : ['tentative', 'confirmed', 'payment_received'].includes(tour.status)
                      ? tour.status
                      : tour.status === 'pending'
                        ? 'tentative'
                        : tour.status || 'tentative';
                return (
                  <tr key={tour._id}>
                    <td>
                      <Link to={`/admin/tours/${tour._id}`}>
                        {formatDateRange(tour.startDate, tour.endDate)}
                      </Link>
                    </td>
                    <td>{tour.company || '—'}</td>
                    <td>{tour.tourNo || '—'}</td>
                    <td>
                      {vehicleId ? (
                        <Link to={`/admin/vehicles/${vehicleId}/calendar`}>
                          {vehicleLabel(tour.vehicle)}
                        </Link>
                      ) : (
                        vehicleLabel(tour.vehicle)
                      )}
                    </td>
                    <td>
                      <span className={`status-chip ${statusValue}`}>
                        {formatStatus(statusValue)}
                      </span>
                    </td>
                    <td>{formatMoney(tour.dieselCost)}</td>
                    <td>{formatMoney(tour.totalCost ?? tour.totalAmount)}</td>
                    <td>{formatMoney(tour.netProfit)}</td>
                    <td className="right nowrap">
                      <Link to={`/admin/tours/${tour._id}`} className="btn ghost">
                        Details
                      </Link>
                      <button
                        type="button"
                        className="btn danger ghost"
                        onClick={() => handleDelete(tour._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!tours.length && (
                <tr>
                  <td colSpan={9} className="muted">
                    No tours yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
