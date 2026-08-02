import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

const OWNED_PLATES = new Set(['NF4507', 'NF1997', 'NG1997', 'NH1997']);

function normalisePlate(plate) {
  return String(plate || '')
    .trim()
    .replace(/[-_\s]+/g, '')
    .toUpperCase();
}

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const vehicles = await Vehicle.find();
    let owned = 0;
    let others = 0;

    for (const vehicle of vehicles) {
      const category = OWNED_PLATES.has(normalisePlate(vehicle.numberPlate))
        ? 'owned'
        : 'others';
      if (vehicle.category !== category) {
        vehicle.category = category;
        await vehicle.save();
      }
      if (category === 'owned') owned += 1;
      else others += 1;
      console.log(`${vehicle.numberPlate} -> ${category}`);
    }

    console.log(`Updated ${vehicles.length} vehicles (${owned} owned, ${others} others)`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
