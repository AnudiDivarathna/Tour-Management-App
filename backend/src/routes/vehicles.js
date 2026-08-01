import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Tour from '../models/Tour.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ numberPlate: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/tours', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const tours = await Tour.find({ vehicle: req.params.id }).sort({ startDate: 1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { numberPlate, type } = req.body;
    if (!numberPlate || !type) {
      return res.status(400).json({ message: 'numberPlate and type are required' });
    }
    const vehicle = await Vehicle.create({ numberPlate, type });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { numberPlate, type } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { numberPlate, type },
      { new: true, runValidators: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await Tour.updateMany({ vehicle: req.params.id }, { vehicle: null });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
