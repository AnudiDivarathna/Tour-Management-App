export const EXPENSE_CATEGORIES = [
  { key: 'fuel', totalField: 'dieselCost' },
  { key: 'highway', totalField: 'highwayBill' },
  { key: 'parking', totalField: 'parkingBill' },
  { key: 'accommodation', totalField: 'accommodationCharges' },
  { key: 'food', totalField: 'foodBill' },
];

export const EXPENSE_CATEGORY_KEYS = EXPENSE_CATEGORIES.map((c) => c.key);

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function sanitiseExpenses(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((entry) => entry && EXPENSE_CATEGORY_KEYS.includes(entry.category))
    .map((entry) => ({
      category: entry.category,
      amount: num(entry.amount),
      note: String(entry.note || '').trim(),
      date: entry.date ? new Date(entry.date) : null,
    }))
    .filter((entry) => !(entry.amount === 0 && !entry.note && !entry.date));
}

/** Category totals mapped onto the flat tour fields the rest of the app uses. */
export function totalsFromExpenses(expenses) {
  const totals = {};
  for (const { key, totalField } of EXPENSE_CATEGORIES) {
    totals[totalField] = expenses
      .filter((entry) => entry.category === key)
      .reduce((sum, entry) => sum + num(entry.amount), 0);
  }
  return totals;
}
