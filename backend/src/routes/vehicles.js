import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import {
  resolveTourStatus,
  withResolvedStatus,
} from '../utils/tourStatus.js';
import { canAccessVehicle, requireAdmin } from '../utils/auth.js';

const router = express.Router();

function guardVehicleAccess(req, res, next) {
  if (!canAccessVehicle(req.user, req.params.id)) {
    return res.status(403).json({ message: 'You do not have access to this vehicle' });
  }
  next();
}

async function syncTourStatuses(tours) {
  await Promise.all(
    tours.map(async (tour) => {
      const next = resolveTourStatus(tour);
      if (tour.status !== next) {
        tour.status = next;
        await Tour.updateOne(
          { _id: tour._id },
          { status: next, $unset: { paymentStatus: '' } }
        );
      }
    })
  );
  return tours.map((tour) => withResolvedStatus(tour));
}

router.get('/', async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin' ? {} : { _id: { $in: req.user.vehicles } };
    const vehicles = await Vehicle.find(filter).sort({ numberPlate: 1 });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', guardVehicleAccess, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/tours', guardVehicleAccess, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    const tours = await Tour.find({ vehicle: req.params.id }).sort({ startDate: 1 });
    res.json(await syncTourStatuses(tours));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
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

router.put('/:id', requireAdmin, async (req, res) => {
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

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    await Tour.updateMany({ vehicle: req.params.id }, { vehicle: null });
    await User.updateMany(
      { vehicles: req.params.id },
      { $pull: { vehicles: req.params.id } }
    );
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
