import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { EditIcon, TrashIcon } from '../components/icons';
import { api } from '../api';
import {
  formatDateRange,
  formatDateShort,
  formatMoney,
  formatStatus,
  vehicleLabel,
} from '../utils/format';
import { downloadToursExcel } from '../utils/exportToursExcel';
import { resolveTourStatus } from '../utils/tourStatus';
import { useConfirm } from '../hooks/useConfirm';

function shortPlate(vehicle) {
  if (!vehicle) return '—';
  return vehicle.numberPlate || vehicleLabel(vehicle);
}

function shortMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return Math.round(num).toLocaleString('en-LK');
}

function StatusChip({ status }) {
  const stacked = status === 'payment_pending' || status === 'payment_received';
  return (
    <span className={`status-chip ${status}${stacked ? ' stacked' : ''}`}>
      {stacked ? (
        <>
          <span>Payment</span>
          <span>{status === 'payment_received' ? 'received' : 'pending'}</span>
        </>
      ) : (
        formatStatus(status)
      )}
    </span>
  );
}

export default function AdminTours() {
  const { confirm } = useConfirm();
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

  async function handleDelete(tour) {
    const ok = await confirm({
      title: 'Delete this tour?',
      message: `${tour.company || 'This tour'} will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete tour',
    });
    if (!ok) return;
    try {
      await api.deleteTour(tour._id);
      setTours((prev) => prev.filter((t) => t._id !== tour._id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMarkPaymentReceived(id) {
    try {
      const updated = await api.markTourPaymentReceived(id);
      setTours((prev) => prev.map((t) => (t._id === id ? updated : t)));
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
        <div className="table-wrap panel tours-table-wrap">
          <table className="tours-table">
            <thead>
              <tr>
                <th className="col-dates">Dates</th>
                <th className="col-company">Company</th>
                <th className="col-optional">Tour No.</th>
                <th className="col-vehicle">Vehicle</th>
                <th className="col-status">Status</th>
                <th className="col-optional">Cost</th>
                <th className="money">Profit</th>
                <th className="col-actions" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => {
                const vehicleId = tour.vehicle?._id || tour.vehicle;
                const statusValue = resolveTourStatus(tour);
                return (
                  <tr key={tour._id}>
                    <td className="col-dates">
                      <Link to={`/admin/tours/${tour._id}`}>
                        <span className="date-full">
                          {formatDateRange(tour.startDate, tour.endDate)}
                        </span>
                        <span className="date-short">
                          <span>{formatDateShort(tour.startDate)}</span>
                          <span>{formatDateShort(tour.endDate)}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="col-company">
                      <span className="company-text">{tour.company || '—'}</span>
                    </td>
                    <td className="col-optional">{tour.tourNo || '—'}</td>
                    <td className="col-vehicle">
                      {vehicleId ? (
                        <Link to={`/admin/vehicles/${vehicleId}/calendar`}>
                          <span className="vehicle-full">{vehicleLabel(tour.vehicle)}</span>
                          <span className="vehicle-short">{shortPlate(tour.vehicle)}</span>
                        </Link>
                      ) : (
                        <>
                          <span className="vehicle-full">{vehicleLabel(tour.vehicle)}</span>
                          <span className="vehicle-short">{shortPlate(tour.vehicle)}</span>
                        </>
                      )}
                    </td>
                    <td className="col-status">
                      <StatusChip status={statusValue} />
                    </td>
                    <td className="col-optional money">
                      <span className="money-full">
                        {formatMoney(tour.totalCost ?? tour.totalAmount)}
                      </span>
                      <span className="money-short">
                        {shortMoney(tour.totalCost ?? tour.totalAmount)}
                      </span>
                    </td>
                    <td className="money">
                      <span className="money-full">{formatMoney(tour.netProfit)}</span>
                      <span className="money-short">{shortMoney(tour.netProfit)}</span>
                    </td>
                    <td className="col-actions">
                      <div className="tour-actions-inner">
                        {(statusValue === 'payment_pending' ||
                          statusValue === 'payment_received') && (
                          <label className="status-check compact" title="Payment received">
                            <input
                              type="checkbox"
                              checked={statusValue === 'payment_received'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleMarkPaymentReceived(tour._id);
                                }
                              }}
                            />
                            <span className="paid-label">Paid</span>
                          </label>
                        )}
                        <Link
                          to={`/admin/tours/${tour._id}`}
                          className="icon-btn"
                          title="Edit tour"
                          aria-label="Edit tour"
                        >
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Delete tour"
                          aria-label="Delete tour"
                          onClick={() => handleDelete(tour)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!tours.length && (
                <tr>
                    <td colSpan={8} className="muted">
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
