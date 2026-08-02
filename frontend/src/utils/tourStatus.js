export const TOUR_STATUSES = [
  'scheduled',
  'ongoing',
  'payment_pending',
  'payment_received',
];

function toDayKey(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Date-driven status (ignores admin payment_received). */
export function computeAutoStatus(startDate, endDate) {
  const today = todayKey();
  const start = toDayKey(startDate);
  const end = toDayKey(endDate);
  if (end && today >= end) return 'payment_pending';
  if (start && today >= start) return 'ongoing';
  return 'scheduled';
}

/**
 * payment_received sticks until admin clears it.
 * Everything else is derived from start/end dates.
 */
export function resolveTourStatus(tour) {
  if (!tour) return 'scheduled';
  if (tour.status === 'payment_received' || tour.paymentStatus === 'done') {
    return 'payment_received';
  }
  return computeAutoStatus(tour.startDate, tour.endDate);
}
