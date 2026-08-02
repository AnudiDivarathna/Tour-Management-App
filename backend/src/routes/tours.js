import express from 'express';
import Tour from '../models/Tour.js';
import { calculateTourFinance } from '../utils/tourFinance.js';
import {
  computeAutoStatus,
  resolveTourStatus,
  withResolvedStatus,
} from '../utils/tourStatus.js';
import { canAccessVehicle, requireAdmin } from '../utils/auth.js';

const router = express.Router();

function withFinance(body, existing = {}) {
  const merged = { ...existing, ...body };
  const finance = calculateTourFinance(merged);
  const payload = { ...body, ...finance };
  delete payload.driverHelperPayment;
  return payload;
}

function applyStatusRules(body, existing = {}) {
  const payload = { ...body };
  const startDate = payload.startDate ?? existing.startDate;
  const endDate = payload.endDate ?? existing.endDate;
  const requested = payload.status ?? existing.status;

  if (requested === 'payment_received') {
    payload.status = 'payment_received';
  } else {
    payload.status = computeAutoStatus(startDate, endDate);
  }

  return payload;
}

async function syncTourStatus(tour) {
  if (!tour) return tour;
  const next = resolveTourStatus(tour);
  if (tour.status !== next) {
    tour.status = next;
    await Tour.updateOne({ _id: tour._id }, { status: next, $unset: { paymentStatus: '' } });
  }
  return withResolvedStatus(tour);
}

async function syncTourStatuses(tours) {
  await Promise.all(tours.map((tour) => syncTourStatus(tour)));
  return tours.map((tour) => withResolvedStatus(tour));
}

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const tours = await Tour.find().populate('vehicle').sort({ startDate: -1 });
    res.json(await syncTourStatuses(tours));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/unassigned', requireAdmin, async (_req, res) => {
  try {
    const tours = await Tour.find({
      $or: [{ vehicle: null }, { vehicle: { $exists: false } }],
    }).sort({ startDate: -1 });
    res.json(await syncTourStatuses(tours));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('vehicle');
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    if (!canAccessVehicle(req.user, tour.vehicle?._id)) {
      return res.status(403).json({ message: 'You do not have access to this tour' });
    }
    res.json(await syncTourStatus(tour));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const payload = applyStatusRules(withFinance(req.body));
    delete payload.paymentStatus;
    const tour = await Tour.create(payload);
    const populated = await Tour.findById(tour._id).populate('vehicle');
    res.status(201).json(withResolvedStatus(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const existing = await Tour.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Tour not found' });
    const payload = applyStatusRules(withFinance(req.body, existing), existing);
    delete payload.paymentStatus;
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      {
        $set: payload,
        $unset: { paymentStatus: '', driverHelperPayment: '' },
      },
      { new: true, runValidators: true }
    ).populate('vehicle');
    res.json(withResolvedStatus(tour));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/payment-received', requireAdmin, async (req, res) => {
  try {
    const existing = await Tour.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Tour not found' });

    existing.status = 'payment_received';
    existing.set('paymentStatus', undefined);
    await existing.save();

    const tour = await Tour.findById(existing._id).populate('vehicle');
    res.json(withResolvedStatus(tour));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json({ message: 'Tour deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
