import { useEffect, useMemo, useRef, useState } from 'react';
import {
  toDateInputValue,
  formatMoney,
  formatStatus,
  CURRENCY,
  TOUR_STATUS_OPTIONS,
} from '../utils/format';
import { calculateTourFinance } from '../utils/tourFinance';

const emptyForm = {
  startDate: '',
  endDate: '',
  company: '',
  tourNo: '',
  vehicle: '',
  status: 'tentative',
  dieselCost: 0,
  driverHelperPayment: 0,
  highwayBill: 0,
  parkingBill: 0,
  accommodationCharges: 0,
  foodBill: 0,
  fuelAdvance: 0,
  balance: 0,
  commission: 0,
};

const COST_FIELDS = [
  { key: 'dieselCost', label: 'Fuel' },
  { key: 'driverHelperPayment', label: 'Driver & helper' },
  { key: 'highwayBill', label: 'Highway' },
  { key: 'parkingBill', label: 'Parking' },
  { key: 'accommodationCharges', label: 'Accommodation' },
  { key: 'foodBill', label: 'Food' },
];

const INCOME_FIELDS = [
  { key: 'fuelAdvance', label: 'Fuel advance' },
  { key: 'balance', label: 'Balance' },
  { key: 'commission', label: 'Commission' },
];

export default function AdminTourForm({
  initial,
  vehicles,
  onSubmit,
  onCancel,
  submitLabel = 'Save tour',
}) {
  const [form, setForm] = useState(emptyForm);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const resetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!initial) {
      setForm(emptyForm);
      return;
    }
    setForm({
      startDate: toDateInputValue(initial.startDate),
      endDate: toDateInputValue(initial.endDate),
      company: initial.company || '',
      tourNo: initial.tourNo || '',
      vehicle: initial.vehicle?._id || initial.vehicle || '',
      status:
        initial.paymentStatus === 'done'
          ? 'payment_received'
          : ['tentative', 'confirmed', 'payment_received'].includes(initial.status)
            ? initial.status
            : initial.status === 'pending'
              ? 'tentative'
              : 'tentative',
      dieselCost: initial.dieselCost ?? 0,
      driverHelperPayment: initial.driverHelperPayment ?? 0,
      highwayBill: initial.highwayBill ?? 0,
      parkingBill: initial.parkingBill ?? 0,
      accommodationCharges: initial.accommodationCharges ?? 0,
      foodBill: initial.foodBill ?? 0,
      fuelAdvance: initial.fuelAdvance ?? 0,
      balance: initial.balance ?? 0,
      commission: initial.commission ?? 0,
    });
  }, [initial]);

  const { totalCost, netProfit } = useMemo(
    () => calculateTourFinance(form),
    [form]
  );

  const totalReceived = useMemo(
    () =>
      INCOME_FIELDS.reduce((sum, { key }) => sum + (Number(form[key]) || 0), 0),
    [form]
  );

  function update(field, value) {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('idle');
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.startDate || !form.endDate) {
      setError('Start date and end date are required.');
      return;
    }
    if (saveState === 'saving') return;

    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('saving');
    try {
      const payload = {
        ...form,
        vehicle: form.vehicle || null,
        dieselCost: Number(form.dieselCost) || 0,
        driverHelperPayment: Number(form.driverHelperPayment) || 0,
        highwayBill: Number(form.highwayBill) || 0,
        parkingBill: Number(form.parkingBill) || 0,
        accommodationCharges: Number(form.accommodationCharges) || 0,
        foodBill: Number(form.foodBill) || 0,
        fuelAdvance: Number(form.fuelAdvance) || 0,
        balance: Number(form.balance) || 0,
        commission: Number(form.commission) || 0,
        totalCost,
        netProfit,
      };
      await onSubmit(payload);
      setSaveState('saved');
      resetTimer.current = setTimeout(() => setSaveState('idle'), 2200);
    } catch (err) {
      setError(err.message);
      setSaveState('idle');
    }
  }

  const buttonLabel =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : submitLabel;

  const moneyField = ({ key, label }) => (
    <label key={key} className="field money">
      <span className="field-name">{label}</span>
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
  );

  return (
    <form className="tour-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <div className="form-columns">
        <section className="form-section trip-section">
          <header className="form-section-head">
            <h3 className="form-section-title">Tour details</h3>
            <span className={`status-chip ${form.status}`}>{formatStatus(form.status)}</span>
          </header>

          <div className="field-block">
            <div className="field-grid two">
              <label className="field">
                <span className="field-name">Start date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => update('startDate', e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span className="field-name">End date</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => update('endDate', e.target.value)}
                  required
                />
              </label>
              <label className="field span-2">
                <span className="field-name">Company</span>
                <input
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  placeholder="Client / company name"
                />
              </label>
              <label className="field">
                <span className="field-name">Tour No.</span>
                <input
                  value={form.tourNo}
                  onChange={(e) => update('tourNo', e.target.value)}
                  placeholder="—"
                />
              </label>
              <label className="field">
                <span className="field-name">Vehicle</span>
                <select value={form.vehicle} onChange={(e) => update('vehicle', e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.numberPlate} ({v.type})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field span-2">
                <span className="field-name">Status</span>
                <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                  {TOUR_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="form-section finance-section">
          <header className="form-section-head">
            <h3 className="form-section-title">Finance</h3>
            <span className="section-hint">All amounts in LKR</span>
          </header>

          <div className="field-block spend">
            <div className="field-block-head">
              <span>Spent</span>
              <strong>{formatMoney(totalCost)}</strong>
            </div>
            <div className="field-grid three">{COST_FIELDS.map(moneyField)}</div>
          </div>

          <div className="field-block earn">
            <div className="field-block-head">
              <span>Received</span>
              <strong>{formatMoney(totalReceived)}</strong>
            </div>
            <div className="field-grid three">{INCOME_FIELDS.map(moneyField)}</div>
          </div>

          <div className="finance-summary">
            <div className="finance-stat cost">
              <span>Total cost</span>
              <strong>{formatMoney(totalCost)}</strong>
            </div>
            <div className="finance-stat received">
              <span>Total received</span>
              <strong>{formatMoney(totalReceived)}</strong>
            </div>
            <div className={`finance-stat ${netProfit < 0 ? 'negative' : 'positive'}`}>
              <span>Net profit</span>
              <strong>{formatMoney(netProfit)}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`btn primary save-btn ${saveState}`}
          disabled={saveState === 'saving'}
        >
          <span key={saveState} className="save-btn-label">
            {saveState === 'saved' && <span className="save-check" aria-hidden="true">✓</span>}
            {buttonLabel}
          </span>
        </button>
      </div>
    </form>
  );
}
