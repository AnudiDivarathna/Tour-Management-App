import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from './models/Vehicle.js';
import Tour from './models/Tour.js';
import Company from './models/Company.js';
import { calculateTourFinance } from './utils/tourFinance.js';
import { computeAutoStatus } from './utils/tourStatus.js';

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
    .replace(/[-_\s]+/g, '')
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

// Columns: range, company, tourNo, vehicle, status, fuel, driver payment,
// tour payment (balance), commission, net profit (derived), payment pending.
const tourRows = [
  {
    range: '27.06.2026-02.07.2026',
    company: 'Ceylon Canvas Holidays',
    tourNo: 'CC-CL-270626-2',
    vehicle: 'NG 1997',
    dieselCost: '66,461.00',
    driverPayment: '32,000.00',
    balance: '189,910.00',
    commission: '',
  },
  {
    range: '11.07.2026-18.07.2026',
    company: 'GCH',
    tourNo: 'GCH26-1006',
    vehicle: 'NH 1997',
    dieselCost: '109,177.00',
    driverPayment: '45,000.00',
    balance: '279,640.00',
    commission: '',
  },
  {
    range: '19.07.2026-24.07.2026',
    company: 'Ceylon Canvas Holidays',
    tourNo: 'CC-ZB-190726-4',
    vehicle: 'NH 1997',
    dieselCost: '70,692.00',
    driverPayment: '31,500.00',
    balance: '210,770.00',
    commission: '',
  },
  {
    range: '20.07.2026-22.07.2026',
    company: 'Classicdestinations',
    tourNo: '25/563/1',
    vehicle: 'NG 1997',
    dieselCost: '37,858.00',
    driverPayment: '13,500.00',
    balance: '97,480.00',
    commission: '',
  },
  {
    range: '26.07.2026-28.07.2026',
    company: 'GCH',
    tourNo: 'GCH26-1189',
    vehicle: 'NF 1997',
    dieselCost: '25,580.00',
    driverPayment: '6,000.00',
    balance: '100,970.00',
    commission: '7,500.00',
  },
  {
    range: '29.07.2026-07.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NF 1997',
    dieselCost: '62,500.00',
    driverPayment: '22,240.00',
    balance: '',
    commission: '',
  },
  {
    range: '29.07.2026-03.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    dieselCost: '75,247.00',
    driverPayment: '32,000.00',
    balance: '',
    commission: '',
  },
  {
    range: '29.07.2026-01.08.2026',
    company: 'GCH',
    tourNo: 'GCH26-1179',
    vehicle: 'NF 4507',
    dieselCost: '57,438.00',
    driverPayment: '23,000.00',
    balance: '45,000.00',
    commission: '',
  },
  {
    range: '01.08.2026-06.08.2026',
    company: 'Ceylon Canvas Holidays',
    tourNo: '',
    vehicle: 'NF 4507',
    dieselCost: '24,110.00',
    driverPayment: '',
    balance: '70,000.00',
    commission: '',
  },
  {
    range: '02.08.2026-17.08.2026',
    company: 'My Globe Travel',
    tourNo: 'MGT20260844',
    vehicle: 'NG 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '70,000.00',
    commission: '',
  },
  {
    range: '15.08.2026-21.08.2026',
    company: 'Guide Pathirana',
    tourNo: '',
    vehicle: 'NH 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '',
    commission: '',
  },
  {
    range: '18.08.2026-30.08.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '',
    commission: '',
  },
  {
    range: '25.08.2026-04.09.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NH 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '',
    commission: '',
  },
  {
    range: '25.08.2026-08.09.2026',
    company: 'Estiaco Holidays',
    tourNo: '',
    vehicle: 'NF 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '',
    commission: '',
  },
  {
    range: '11.09.2026-21.09.2026',
    company: 'Guide Buddika',
    tourNo: '',
    vehicle: 'NG 1997',
    dieselCost: '',
    driverPayment: '',
    balance: '',
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
    console.log('Cleared previous tours');

    const companyNames = [...new Set(tourRows.map((row) => row.company).filter(Boolean))];
    await Company.deleteMany({});
    const insertedCompanies = await Company.insertMany(
      companyNames.map((name) => ({ name }))
    );
    console.log(`Seeded ${insertedCompanies.length} companies`);

    for (const numberPlate of vehiclePlates) {
      const plate = formatPlate(numberPlate);
      await Vehicle.updateOne(
        { numberPlate: plate },
        { $setOnInsert: { numberPlate: plate, type: vehicleTypeFor(plate) } },
        { upsert: true }
      );
    }
    const vehicles = await Vehicle.find();
    console.log(`Vehicles ready: ${vehicles.length}`);

    const vehicleByPlate = new Map(
      vehicles.map((v) => [normalisePlate(v.numberPlate), v._id])
    );

    const tours = tourRows.map((row) => {
      const [startStr, endStr] = row.range.split('-');
      const startDate = parseDate(startStr);
      const endDate = parseDate(endStr);
      const finance = calculateTourFinance({
        dieselCost: parseAmount(row.dieselCost),
        driverPayment: parseAmount(row.driverPayment),
        helperPayment: 0,
        commission: parseAmount(row.commission),
        fuelAdvance: 0,
        balance: parseAmount(row.balance),
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
        startDate,
        endDate,
        company: row.company,
        tourNo: row.tourNo || '',
        vehicle: vehicleId,
        status: computeAutoStatus(startDate, endDate),
        expenses: [],
        ...finance,
      };
    });

    await Tour.insertMany(tours);
    console.log(`Seeded ${tours.length} tours`);

    for (const tour of tours) {
      console.log(
        `${tour.tourNo || '(no tour no)'} | ${tour.company} | profit=${tour.netProfit}`
      );
    }

    console.log('Seed complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
