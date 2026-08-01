import express from 'express';
import Tour from '../models/Tour.js';
import { calculateTourFinance } from '../utils/tourFinance.js';

const router = express.Router();

function withFinance(body, existing = {}) {
  const merged = { ...existing, ...body };
  const finance = calculateTourFinance(merged);
  return { ...body, ...finance };
}

router.get('/', async (_req, res) => {
  try {
    const tours = await Tour.find()
      .populate('vehicle')
      .sort({ startDate: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/unassigned', async (_req, res) => {
  try {
    const tours = await Tour.find({
      $or: [{ vehicle: null }, { vehicle: { $exists: false } }],
    }).sort({ startDate: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('vehicle');
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = withFinance(req.body);
    delete payload.paymentStatus;
    const tour = await Tour.create(payload);
    const populated = await Tour.findById(tour._id).populate('vehicle');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await Tour.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: 'Tour not found' });
    const payload = withFinance(req.body, existing);
    delete payload.paymentStatus;
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { $set: payload, $unset: { paymentStatus: '' } },
      { new: true, runValidators: true }
    ).populate('vehicle');
    res.json(tour);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });
    res.json({ message: 'Tour deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
