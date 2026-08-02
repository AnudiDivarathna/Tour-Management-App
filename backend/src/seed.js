import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import Tour from './models/Tour.js';
import Company from './models/Company.js';
import { calculateTourFinance } from './utils/tourFinance.js';

dotenv.config();

function parseAmount(value) {
  if (value === null || value === undefined || value === '' || value === '-') {
    return 0;
  }
  const raw = String(value).trim();
  const negative = raw.startsWith('(') && raw.endsWith(')');
  const cleaned = raw.replace(/[(),]/g, '');
  const num = Number(cleaned);
  if (Number.isNaN(num)) return 0;
  return negative ? -num : num;
}

function parseDate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split('.').map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}

function normalisePlate(plate) {
  return String(plate || '')
    .trim()
    .replace(/[-_]/g, '')
    .toUpperCase();
}

function formatPlate(plate) {
  const compact = normalisePlate(plate);
  const match = compact.match(/^([A-Z]+)(\d+)$/);
  if (!match) return String(plate || '').trim();
  return `${match[1]} ${match[2]}`;
}

const VAN_PLATES = new Set(['NG 3909', 'PG 3909', 'NF 3035'].map(normalisePlate));
const LONG_COACH_PLATES = new Set(['NH 1997'].map(normalisePlate));

function vehicleTypeFor(numberPlate) {
  const key = normalisePlate(numberPlate);
  if (LONG_COACH_PLATES.has(key)) return 'long_coach';
  if (VAN_PLATES.has(key)) return 'van';
  return 'bus';
}

const vehiclePlates = [
  'NF 4507',
  'NF 1997',
  'NG 1997',
  'NH 1997',
  'NH 3674',
  'NG 3909',
  'PG 3909',
  'NF 7436',
  'NF 3035',
];

// Payment Status is Pending for all rows → keep status as confirmed (not payment_received).
const tourRows = [
  {
    range: '29.07.2026-07.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NF 1997',
    status: 'ongoing',
    dieselCost: '62,500.00',
    driverPayment: '21,640.00',
    commission: '',
  },
  {
    range: '29.07.2026-09.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    status: 'ongoing',
    dieselCost: '38,577.00',
    driverPayment: '',
    commission: '',
  },
  {
    range: '29.07.2026-01.08.2026',
    company: 'GCH',
    tourNo: 'GCH26-1179',
    vehicle: 'NF 4507',
    status: 'ongoing',
    dieselCost: '42,793.00',
    driverPayment: '25,000.00',
    commission: '',
  },
  {
    range: '02.08.2026-17.08.2026',
    company: 'My Globe Travel',
    tourNo: 'MGT20260844',
    vehicle: 'NG 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
  {
    range: '15.08.2026-21.08.2026',
    company: 'Guide Pathirana',
    tourNo: '',
    vehicle: 'NH 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
  {
    range: '18.08.2026-30.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
  {
    range: '25.08.2026-04.09.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
  {
    range: '25.08.2026-08.09.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NF 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
  {
    range: '11.09.2026-21.09.2026',
    company: 'Guide Buddika',
    tourNo: '',
    vehicle: 'NG 1997',
    status: 'ongoing',
    dieselCost: '',
    driverPayment: '',
    commission: '',
  },
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Tour.deleteMany({});
    await Vehicle.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleared previous tours, vehicles, and companies');

    const companyNames = [...new Set(tourRows.map((row) => row.company).filter(Boolean))];
    const insertedCompanies = await Company.insertMany(
      companyNames.map((name) => ({ name }))
    );
    console.log(`Seeded ${insertedCompanies.length} companies`);

    const vehicles = vehiclePlates.map((numberPlate) => ({
      numberPlate: formatPlate(numberPlate),
      type: vehicleTypeFor(numberPlate),
    }));
    const insertedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Seeded ${insertedVehicles.length} vehicles`);

    const vehicleByPlate = new Map(
      insertedVehicles.map((v) => [normalisePlate(v.numberPlate), v._id])
    );

    const tours = tourRows.map((row) => {
      const [startStr, endStr] = row.range.split('-');
      const finance = calculateTourFinance({
        dieselCost: parseAmount(row.dieselCost),
        driverPayment: parseAmount(row.driverPayment),
        helperPayment: 0,
        commission: parseAmount(row.commission),
        fuelAdvance: 0,
        balance: 0,
        highwayBill: 0,
        parkingBill: 0,
        accommodationCharges: 0,
        foodBill: 0,
        waterBottles: 0,
      });
      const vehicleId = row.vehicle
        ? vehicleByPlate.get(normalisePlate(row.vehicle)) || null
        : null;

      if (row.vehicle && !vehicleId) {
        console.warn(`No vehicle found for plate "${row.vehicle}"`);
      }

      return {
        startDate: parseDate(startStr),
        endDate: parseDate(endStr),
        company: row.company,
        tourNo: row.tourNo || '',
        vehicle: vehicleId,
        status: row.status,
        ...finance,
      };
    });

    await Tour.insertMany(tours);
    console.log(`Seeded ${tours.length} tours`);
    console.log('Seed complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
