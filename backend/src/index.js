import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import vehicleRoutes from './routes/vehicles.js';
import tourRoutes from './routes/tours.js';
import companyRoutes from './routes/companies.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { canAccessVehicle, requireAuth } from './utils/auth.js';
import Tour from './models/Tour.js';
import { calculateTourFinance } from './utils/tourFinance.js';
import { sanitiseExpenses, totalsFromExpenses } from './utils/tourExpenses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const DRIVER_ALLOWED_FIELDS = [
  'dieselCost',
  'highwayBill',
  'parkingBill',
  'accommodationCharges',
  'foodBill',
];

app.use(cors());
app.use(express.json());

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', requireAuth, vehicleRoutes);
app.use('/api/tours', requireAuth, tourRoutes);
app.use('/api/companies', requireAuth, companyRoutes);

app.patch('/api/driver/tours/:id', requireAuth, async (req, res) => {
  try {
    const updates = {};
    for (const field of DRIVER_ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (req.body.expenses !== undefined) {
      const expenses = sanitiseExpenses(req.body.expenses);
      Object.assign(updates, { expenses }, totalsFromExpenses(expenses));
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No allowed fields to update' });
    }
    const existing = await Tour.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Tour not found' });
    if (!canAccessVehicle(req.user, existing.vehicle)) {
      return res.status(403).json({ message: 'You cannot update this tour' });
    }
    const finance = calculateTourFinance({ ...existing, ...updates });
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { ...updates, ...finance },
      { new: true, runValidators: true }
    ).populate('vehicle');
    res.json(tour);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default app;

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}
