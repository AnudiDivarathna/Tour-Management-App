import express from 'express';
import User, { USER_ROLES } from '../models/User.js';
import { requireAdmin, requireAuth } from '../utils/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

function normaliseVehicles(role, vehicles) {
  if (role !== 'driver') return [];
  return Array.isArray(vehicles) ? vehicles.filter(Boolean) : [];
}

router.get('/', async (_req, res) => {
  try {
    const users = await User.find().populate('vehicles').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, username, password, role = 'driver', vehicles } = req.body;
    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ message: 'Name, username, and password are required' });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }

    const user = await User.create({
      name,
      username,
      role,
      vehicles: normaliseVehicles(role, vehicles),
      passwordHash: await User.hashPassword(password),
    });
    await user.populate('vehicles');
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'That username is already taken' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, username, password, role, vehicles, active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const nextRole = role || user.role;
    if (user.role === 'admin' && nextRole !== 'admin') {
      const admins = await User.countDocuments({ role: 'admin', active: true });
      if (admins <= 1) {
        return res.status(400).json({ message: 'At least one admin must remain' });
      }
    }

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (active !== undefined) user.active = Boolean(active);
    user.role = nextRole;
    user.vehicles = normaliseVehicles(nextRole, vehicles ?? user.vehicles);
    if (password) {
      if (String(password).length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters' });
      }
      user.passwordHash = await User.hashPassword(password);
    }

    await user.save();
    await user.populate('vehicles');
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'That username is already taken' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      const admins = await User.countDocuments({ role: 'admin' });
      if (admins <= 1) {
        return res.status(400).json({ message: 'At least one admin must remain' });
      }
    }
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
