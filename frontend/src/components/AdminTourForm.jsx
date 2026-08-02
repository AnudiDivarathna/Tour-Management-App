import { useEffect, useMemo, useRef, useState } from 'react';
import {
  toDateInputValue,
  formatMoney,
  formatStatus,
  CURRENCY,
} from '../utils/format';
import { calculateTourFinance } from '../utils/tourFinance';
import { computeAutoStatus, resolveTourStatus } from '../utils/tourStatus';

const emptyForm = {
  startDate: '',
  endDate: '',
  company: '',
  tourNo: '',
  vehicle: '',
  status: 'scheduled',
  dieselCost: 0,
  driverPayment: 0,
  helperPayment: 0,
  highwayBill: 0,
  parkingBill: 0,
  accommodationCharges: 0,
  foodBill: 0,
  waterBottles: 0,
  fuelAdvance: 0,
  balance: 0,
  commission: 0,
};

const COST_FIELDS = [
  { key: 'dieselCost', label: 'Fuel' },
  { key: 'driverPayment', label: 'Driver payment' },
  { key: 'helperPayment', label: 'Helper payment' },
  { key: 'highwayBill', label: 'Highway' },
  { key: 'parkingBill', label: 'Parking' },
  { key: 'accommodationCharges', label: 'Accommodation' },
  { key: 'foodBill', label: 'Food' },
  { key: 'waterBottles', label: 'Water bottles' },
];

const INCOME_FIELDS = [
  { key: 'fuelAdvance', label: 'Tour advance' },
  { key: 'balance', label: 'Tour payment' },
  { key: 'commission', label: 'Commission' },
];

export default function AdminTourForm({
  initial,
  vehicles,
  companies = [],
  onSubmit,
  onMarkPaymentReceived,
  onCancel,
  submitLabel = 'Save tour',
}) {
  const [form, setForm] = useState(emptyForm);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);
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
    const startDate = toDateInputValue(initial.startDate);
    const endDate = toDateInputValue(initial.endDate);
    setForm({
      startDate,
      endDate,
      company: initial.company || '',
      tourNo: initial.tourNo || '',
      vehicle: initial.vehicle?._id || initial.vehicle || '',
      status: resolveTourStatus({ ...initial, startDate, endDate }),
      dieselCost: initial.dieselCost ?? 0,
      driverPayment: (() => {
        const driver = Number(initial.driverPayment) || 0;
        const helper = Number(initial.helperPayment) || 0;
        const legacy = Number(initial.driverHelperPayment) || 0;
        if (!driver && !helper && legacy) return legacy;
        return driver;
      })(),
      helperPayment: Number(initial.helperPayment) || 0,
      highwayBill: initial.highwayBill ?? 0,
      parkingBill: initial.parkingBill ?? 0,
      accommodationCharges: initial.accommodationCharges ?? 0,
      foodBill: initial.foodBill ?? 0,
      waterBottles: initial.waterBottles ?? 0,
      fuelAdvance: initial.fuelAdvance ?? 0,
      balance: initial.balance ?? 0,
      commission: initial.commission ?? 0,
    });
  }, [initial]);

  const autoStatus = useMemo(
    () => computeAutoStatus(form.startDate, form.endDate),
    [form.startDate, form.endDate]
  );

  const displayStatus =
    form.status === 'payment_received' ? 'payment_received' : autoStatus;

  useEffect(() => {
    setForm((prev) => {
      if (prev.status === 'payment_received') return prev;
      if (!prev.startDate || !prev.endDate) return prev;
      const next = computeAutoStatus(prev.startDate, prev.endDate);
      if (prev.status === next) return prev;
      return { ...prev, status: next };
    });
  }, [form.startDate, form.endDate]);

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
      const status =
        form.status === 'payment_received'
          ? 'payment_received'
          : computeAutoStatus(form.startDate, form.endDate);
      const payload = {
        ...form,
        status,
        vehicle: form.vehicle || null,
        dieselCost: Number(form.dieselCost) || 0,
        driverPayment: Number(form.driverPayment) || 0,
        helperPayment: Number(form.helperPayment) || 0,
        highwayBill: Number(form.highwayBill) || 0,
        parkingBill: Number(form.parkingBill) || 0,
        accommodationCharges: Number(form.accommodationCharges) || 0,
        foodBill: Number(form.foodBill) || 0,
        waterBottles: Number(form.waterBottles) || 0,
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
            <span className={`status-chip ${displayStatus}`}>
              {formatStatus(displayStatus)}
            </span>
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
                <select
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                >
                  <option value="">— Select company —</option>
                  {form.company &&
                    !companies.some((c) => c.name === form.company) && (
                      <option value={form.company}>{form.company}</option>
                    )}
                  {companies.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
              {(autoStatus === 'payment_pending' ||
                displayStatus === 'payment_received') && (
                <div className="field span-2 status-actions">
                  <span className="field-name">Status</span>
                  <label className="status-check">
                    <input
                      type="checkbox"
                      checked={displayStatus === 'payment_received'}
                      disabled={markingPaid}
                      onChange={async (e) => {
                        const checked = e.target.checked;
                        setError('');
                        if (checked) {
                          if (onMarkPaymentReceived) {
                            setMarkingPaid(true);
                            try {
                              await onMarkPaymentReceived();
                              update('status', 'payment_received');
                            } catch (err) {
                              setError(err.message);
                            } finally {
                              setMarkingPaid(false);
                            }
                          } else {
                            update('status', 'payment_received');
                          }
                        } else {
                          update(
                            'status',
                            computeAutoStatus(form.startDate, form.endDate)
                          );
                        }
                      }}
                    />
                    <span>Payment received</span>
                  </label>
                </div>
              )}
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
