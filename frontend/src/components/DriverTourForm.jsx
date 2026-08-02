import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

function AddEntryDialog({ open, label, tone, onCancel, onAdd }) {
  const [amount, setAmount] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setAmount('');
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e) {
      if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    const value = String(amount).trim();
    if (!value || Number(value) === 0 || Number.isNaN(Number(value))) return;
    onAdd(value);
  }

  return createPortal(
    <div className="confirm-backdrop" role="presentation" onClick={onCancel}>
      <form
        className={`confirm-dialog expense-add-dialog ${tone || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-add-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3 id="expense-add-title">Add {label.toLowerCase()} entry</h3>
        <p className="muted">Enter the amount for this entry.</p>
        <label className="expense-add-field">
          <span>Amount</span>
          <span className="money-input">
            <span className="currency">{CURRENCY}</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              placeholder="0.00"
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </span>
        </label>
        <div className="confirm-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn primary">
            Add entry
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default function DriverTourForm({ tour, onSubmit }) {
  const [rows, setRows] = useState([]);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const [addingCategory, setAddingCategory] = useState(null);
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
  const addingMeta = EXPENSE_CATEGORIES.find((c) => c.key === addingCategory);

  function touch() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setSaveState('idle');
  }

  function addRowWithAmount(category, amount) {
    touch();
    setRows((prev) => [...prev, { ...newExpenseRow(category), amount }]);
    setAddingCategory(null);
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
                  <ul
                    className={`expense-rows${categoryRows.length > 2 ? ' is-scrollable' : ''}`}
                  >
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

                <button
                  type="button"
                  className="expense-add"
                  onClick={() => setAddingCategory(key)}
                >
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

      <AddEntryDialog
        open={Boolean(addingMeta)}
        label={addingMeta?.label || 'expense'}
        tone={addingMeta?.tone}
        onCancel={() => setAddingCategory(null)}
        onAdd={(amount) => addRowWithAmount(addingCategory, amount)}
      />
    </div>
  );
}
