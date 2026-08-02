import { format } from 'date-fns';
import { formatStatus, vehicleLabel } from './format';
import { resolveTourStatus } from './tourStatus';

function toExcelDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return format(d, 'yyyy-MM-dd');
}

function money(value) {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

export function buildTourExportRows(tours) {
  return tours.map((tour) => ({
    'Start date': toExcelDate(tour.startDate),
    'End date': toExcelDate(tour.endDate),
    Company: tour.company || '',
    'Tour No.': tour.tourNo || '',
    Vehicle: vehicleLabel(tour.vehicle),
    Status: formatStatus(resolveTourStatus(tour)),
    Fuel: money(tour.dieselCost),
    'Driver payment': money(
      tour.driverPayment ??
        (tour.helperPayment ? 0 : tour.driverHelperPayment) ??
        0
    ),
    'Helper payment': money(tour.helperPayment),
    Highway: money(tour.highwayBill),
    Parking: money(tour.parkingBill),
    Accommodation: money(tour.accommodationCharges),
    Food: money(tour.foodBill),
    'Water bottles': money(tour.waterBottles),
    'Tour advance': money(tour.fuelAdvance),
    'Tour payment': money(tour.balance),
    Commission: money(tour.commission),
    'Total cost': money(tour.totalCost ?? tour.totalAmount),
    'Net profit': money(tour.netProfit),
  }));
}

export async function downloadToursExcel(tours, filename) {
  const XLSX = await import('xlsx');
  const rows = buildTourExportRows(tours);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tours');

  const colWidths = Object.keys(rows[0] || { Company: '' }).map((key) => ({
    wch: Math.max(key.length + 2, 14),
  }));
  worksheet['!cols'] = colWidths;

  const stamp = format(new Date(), 'yyyy-MM-dd');
  XLSX.writeFile(workbook, filename || `tours-export-${stamp}.xlsx`);
}
