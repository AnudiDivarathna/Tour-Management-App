import express from 'express';
import User from '../models/User.js';
import { requireAuth, signToken } from '../utils/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '');
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username }).populate('vehicles');
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }
    if (!user.active) {
      return res.status(403).json({ message: 'This account has been disabled' });
    }

    res.json({ token: signToken(user), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  await req.user.populate('vehicles');
  res.json(req.user);
});

router.post('/password', requireAuth, async (req, res) => {
  try {
    const current = String(req.body.currentPassword || '');
    const next = String(req.body.newPassword || '');
    if (next.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters' });
    }
    if (!(await req.user.checkPassword(current))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    req.user.passwordHash = await User.hashPassword(next);
    await req.user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
