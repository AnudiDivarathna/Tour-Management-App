import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

/**
 * Bootstraps a user from the command line, which is the only way to create the
 * very first admin (every other account is added from the admin UI).
 *
 *   npm run create-user -- --name "Anudi" --username anudi --password secret123
 *   npm run create-user -- --name "Sunil" --username sunil --password 1234 --role driver --vehicles "NF 1997,NH 1997"
 */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    args[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

async function run() {
  const { name, username, password, role = 'admin', vehicles = '' } = parseArgs(
    process.argv.slice(2)
  );

  if (!name || !username || !password) {
    console.error(
      'Usage: npm run create-user -- --name "Full Name" --username user --password pass [--role admin|driver] [--vehicles "NF 1997,NH 1997"]'
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const plates = vehicles
    .split(',')
    .map((plate) => plate.trim())
    .filter(Boolean);
  const vehicleIds = plates.length
    ? (await Vehicle.find({ numberPlate: { $in: plates } })).map((v) => v._id)
    : [];

  if (plates.length && vehicleIds.length !== plates.length) {
    console.warn(
      `Only matched ${vehicleIds.length} of ${plates.length} vehicle numbers; check the plates.`
    );
  }

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.vehicles = role === 'driver' ? vehicleIds : [];
    existing.passwordHash = await User.hashPassword(password);
    existing.active = true;
    await existing.save();
    console.log(`Updated existing ${role}: ${username}`);
  } else {
    await User.create({
      name,
      username,
      role,
      vehicles: role === 'driver' ? vehicleIds : [],
      passwordHash: await User.hashPassword(password),
    });
    console.log(`Created ${role}: ${username}`);
  }

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect();
  process.exit(1);
});
