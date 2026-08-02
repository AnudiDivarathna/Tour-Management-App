import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const DEV_SECRET = 'tour-management-dev-secret';
const TOKEN_TTL = '12h';

function secret() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      throw new Error('JWT_SECRET is not set');
    }
    return DEV_SECRET;
  }
  return process.env.JWT_SECRET;
}

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, secret(), {
    expiresIn: TOKEN_TTL,
  });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Sign in required' });

    const payload = jwt.verify(token, secret());
    const user = await User.findById(payload.sub);
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Session is no longer valid' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please sign in again' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export function canAccessVehicle(user, vehicleId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!vehicleId) return false;
  return user.vehicles.some((id) => String(id) === String(vehicleId));
}
