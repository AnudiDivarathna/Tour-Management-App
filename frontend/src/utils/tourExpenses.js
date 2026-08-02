export const EXPENSE_CATEGORIES = [
  { key: 'fuel', label: 'Fuel', totalField: 'dieselCost', tone: 'fuel' },
  { key: 'highway', label: 'Highway', totalField: 'highwayBill', tone: 'road' },
  { key: 'parking', label: 'Parking', totalField: 'parkingBill', tone: 'parking' },
  {
    key: 'accommodation',
    label: 'Accommodation',
    totalField: 'accommodationCharges',
    tone: 'stay',
  },
  { key: 'food', label: 'Food', totalField: 'foodBill', tone: 'food' },
];

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

let rowSeq = 0;
export function newExpenseRow(category) {
  rowSeq += 1;
  return { rowId: `row-${rowSeq}`, category, amount: '' };
}

/**
 * Tours saved before line items existed only have category totals, so those are
 * surfaced as a single row per category to avoid losing recorded amounts.
 */
export function expenseRowsFromTour(tour) {
  if (!tour) return [];
  if (Array.isArray(tour.expenses) && tour.expenses.length) {
    return tour.expenses.map((entry) => ({
      ...newExpenseRow(entry.category),
      amount: entry.amount ?? '',
    }));
  }
  return EXPENSE_CATEGORIES.filter(({ totalField }) => num(tour[totalField]) !== 0).map(
    ({ key, totalField }) => ({ ...newExpenseRow(key), amount: tour[totalField] })
  );
}

export function categoryTotal(rows, category) {
  return rows
    .filter((row) => row.category === category)
    .reduce((sum, row) => sum + num(row.amount), 0);
}

export function expensesGrandTotal(rows) {
  return rows.reduce((sum, row) => sum + num(row.amount), 0);
}

export function toExpensePayload(rows) {
  return rows
    .map((row) => ({
      category: row.category,
      amount: num(row.amount),
    }))
    .filter((row) => row.amount !== 0);
}
