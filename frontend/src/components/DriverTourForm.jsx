import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDateRange, formatMoney, CURRENCY } from '../utils/format';
import {
  EXPENSE_CATEGORIES,
  categoryTotal,
  expenseRowsFromTour,
  expensesGrandTotal,
  newExpenseRow,
  toExpensePayload,
} from '../utils/tourExpenses';
import { BedIcon, CalendarIcon, FoodIcon, FuelIcon, ParkingIcon, RoadIcon } from './icons';

const CATEGORY_ICONS = {
  fuel: FuelIcon,
  highway: RoadIcon,
  parking: ParkingIcon,
  accommodation: BedIcon,
  food: FoodIcon,
};

export default function DriverTourForm({ tour, onSubmit }) {
  const [rows, setRows] = useState([]);
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
    setRows(expenseRowsFromTour(tour));
  }, [tour]);

  const grandTotal = useMemo(() => expensesGrandTotal(rows), [rows]);

  function touch() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('idle');
  }

  function addRow(category) {
    touch();
    setRows((prev) => [...prev, newExpenseRow(category)]);
  }

  function updateRow(rowId, field, value) {
    touch();
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, [field]: value } : row))
    );
  }

  function removeRow(rowId) {
    touch();
    setRows((prev) => prev.filter((row) => row.rowId !== rowId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saveState === 'saving') return;
    setError('');
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('saving');
    try {
      await onSubmit({ expenses: toExpensePayload(rows) });
      setSaveState('saved');
      resetTimer.current = setTimeout(() => setSaveState('idle'), 2200);
    } catch (err) {
      setError(err.message);
      setSaveState('idle');
    }
  }

  if (!tour) return null;

  const buttonLabel =
    saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save expenses';

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

      <form className="driver-form" onSubmit={handleSubmit}>
        <div className="expense-total-bar">
          <div className="expense-total-main">
            <small>Total expenses</small>
            <strong>{formatMoney(grandTotal)}</strong>
          </div>
          <div className="expense-total-chips">
            {EXPENSE_CATEGORIES.map(({ key, label, tone }) => (
              <span key={key} className={`expense-chip ${tone}`}>
                {label}
                <b>{formatMoney(categoryTotal(rows, key))}</b>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="expense-groups">
          {EXPENSE_CATEGORIES.map(({ key, label, tone }) => {
            const Icon = CATEGORY_ICONS[key];
            const categoryRows = rows.filter((row) => row.category === key);
            return (
              <section key={key} className={`expense-group ${tone}`}>
                <header className="expense-group-head">
                  <span className="expense-group-icon">
                    <Icon />
                  </span>
                  <span className="expense-group-title">
                    <strong>{label}</strong>
                    <small>
                      {categoryRows.length
                        ? `${categoryRows.length} ${
                            categoryRows.length === 1 ? 'entry' : 'entries'
                          }`
                        : 'No entries yet'}
                    </small>
                  </span>
                  <span className="expense-group-total">
                    {formatMoney(categoryTotal(rows, key))}
                  </span>
                </header>

                {categoryRows.length > 0 && (
                  <ul className="expense-rows">
                    {categoryRows.map((row, index) => (
                      <li key={row.rowId} className="expense-row">
                        <span className="expense-row-no">{index + 1}</span>
                        <label className="expense-cell amount">
                          <span className="money-input">
                            <span className="currency">{CURRENCY}</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              value={row.amount}
                              placeholder="0.00"
                              onChange={(e) => updateRow(row.rowId, 'amount', e.target.value)}
                              onFocus={(e) => e.target.select()}
                            />
                          </span>
                        </label>
                        <button
                          type="button"
                          className="expense-remove"
                          onClick={() => removeRow(row.rowId)}
                          aria-label={`Remove ${label} entry`}
                          title="Remove entry"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button type="button" className="expense-add" onClick={() => addRow(key)}>
                  + Add {label.toLowerCase()} entry
                </button>
              </section>
            );
          })}
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
