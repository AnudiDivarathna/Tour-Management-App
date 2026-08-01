import { format, parseISO, isValid } from 'date-fns';

export function toDateInputValue(value) {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

export function formatDate(value) {
  if (!value) return '—';
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  if (!isValid(d)) return '—';
  return format(d, 'dd MMM yyyy');
}

export function formatDateRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export const CURRENCY = 'Rs';

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  const amount = num.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY} ${amount}`;
}

export const VEHICLE_TYPE_OPTIONS = [
  { value: 'bus', label: 'Bus' },
  { value: 'van', label: 'Van' },
  { value: 'long_coach', label: 'Long coach' },
];

export function vehicleTypeLabel(type) {
  if (!type) return '—';
  const match = VEHICLE_TYPE_OPTIONS.find((opt) => opt.value === type);
  return match ? match.label : type;
}

export function vehicleLabel(vehicle) {
  if (!vehicle) return 'Unassigned';
  if (typeof vehicle === 'string') return vehicle;
  return `${vehicle.numberPlate} (${vehicleTypeLabel(vehicle.type)})`;
}

const STATUS_LABELS = {
  tentative: 'Tentative',
  confirmed: 'Confirmed',
  payment_received: 'Payment received',
  // legacy values
  pending: 'Tentative',
  done: 'Payment received',
};

export function formatStatus(status) {
  if (!status) return '—';
  return STATUS_LABELS[status] || status;
}

export const TOUR_STATUS_OPTIONS = [
  { value: 'tentative', label: 'Tentative' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'payment_received', label: 'Payment received' },
];

