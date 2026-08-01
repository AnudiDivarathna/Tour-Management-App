import { useEffect, useRef, useState } from 'react';
import { formatDateRange, formatMoney, CURRENCY } from '../utils/format';
import { BedIcon, CalendarIcon, FoodIcon, FuelIcon, ParkingIcon, RoadIcon } from './icons';

const FIELDS = [
  { key: 'dieselCost', label: 'Fuel cost', Icon: FuelIcon, tone: 'fuel' },
  { key: 'highwayBill', label: 'Highway bill', Icon: RoadIcon, tone: 'road' },
  { key: 'parkingBill', label: 'Parking bill', Icon: ParkingIcon, tone: 'parking' },
  { key: 'accommodationCharges', label: 'Accommodation', Icon: BedIcon, tone: 'stay' },
  { key: 'foodBill', label: 'Food bill', Icon: FoodIcon, tone: 'food' },
];

export default function DriverTourForm({ tour, onSubmit }) {
  const [form, setForm] = useState({
    dieselCost: 0,
    highwayBill: 0,
    parkingBill: 0,
    accommodationCharges: 0,
    foodBill: 0,
  });
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!tour) return;
    setForm({
      dieselCost: tour.dieselCost ?? 0,
      highwayBill: tour.highwayBill ?? 0,
      parkingBill: tour.parkingBill ?? 0,
      accommodationCharges: tour.accommodationCharges ?? 0,
      foodBill: tour.foodBill ?? 0,
    });
  }, [tour]);

  function update(field, value) {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('idle');
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saveState === 'saving') return;
    setError('');
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('saving');
    try {
      await onSubmit({
        dieselCost: Number(form.dieselCost) || 0,
        highwayBill: Number(form.highwayBill) || 0,
        parkingBill: Number(form.parkingBill) || 0,
        accommodationCharges: Number(form.accommodationCharges) || 0,
        foodBill: Number(form.foodBill) || 0,
      });
      setSaveState('saved');
      resetTimer.current = setTimeout(() => setSaveState('idle'), 2200);
    } catch (err) {
      setError(err.message);
      setSaveState('idle');
    }
  }

  if (!tour) return null;

  const buttonLabel =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Update bills';

  return (
    <div className="stack">
      <div className="trip-banner">
        <span className="trip-banner-icon">
          <CalendarIcon />
        </span>
        <div>
          <span className="label">Date range</span>
          <strong>{formatDateRange(tour.startDate, tour.endDate)}</strong>
        </div>
        <div>
          <span className="label">Tour No.</span>
          <strong>{tour.tourNo || '—'}</strong>
        </div>
      </div>

      <div className="bill-summary">
        {FIELDS.map(({ key, label, Icon, tone }) => (
          <div key={key} className={`bill-stat ${tone}`}>
            <span className="bill-stat-icon">
              <Icon />
            </span>
            <span className="bill-stat-text">
              <small>{label}</small>
              <strong>{formatMoney(tour[key])}</strong>
            </span>
          </div>
        ))}
      </div>

      <form className="driver-form" onSubmit={handleSubmit}>
        <h3 className="form-section-title">Update your bills</h3>
        {error && <p className="error">{error}</p>}

        <div className="form-grid">
          {FIELDS.map(({ key, label, Icon }) => (
            <label key={key}>
              <span className="field-label">
                <Icon className="field-icon" />
                {label}
              </span>
              <span className="money-input">
                <span className="currency">{CURRENCY}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
              </span>
            </label>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn primary save-btn ${saveState}`}
            disabled={saveState === 'saving'}
          >
            <span key={saveState} className="save-btn-label">
              {saveState === 'saved' && (
                <span className="save-check" aria-hidden="true">
                  ✓
                </span>
              )}
              {buttonLabel}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
