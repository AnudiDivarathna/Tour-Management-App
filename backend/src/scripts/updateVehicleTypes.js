import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

// Plates whose type changed after they were first seeded. Keys are matched
// ignoring spacing and case, so "NH1997" and "nh 1997" both hit "NH 1997".
const TYPE_BY_PLATE = {
  'NH 1997': 'long_coach',
};

function normalise(plate) {
  return String(plate).replace(/\s+/g, '').toUpperCase();
}

const lookup = new Map(
  Object.entries(TYPE_BY_PLATE).map(([plate, type]) => [normalise(plate), type])
);

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const vehicles = await Vehicle.find();
    let updated = 0;

    for (const vehicle of vehicles) {
      const type = lookup.get(normalise(vehicle.numberPlate));
      if (!type || vehicle.type === type) continue;
      console.log(`${vehicle.numberPlate}: ${vehicle.type} -> ${type}`);
      vehicle.type = type;
      await vehicle.save();
      updated += 1;
    }

    console.log(updated ? `Updated ${updated} vehicle(s)` : 'Nothing to update');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exit(1);
  }
}

run();
