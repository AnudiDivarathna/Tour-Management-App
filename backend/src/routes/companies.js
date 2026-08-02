import express from 'express';
import Company from '../models/Company.js';
import Tour from '../models/Tour.js';
import { requireAdmin } from '../utils/auth.js';

const router = express.Router();

router.use(requireAdmin);

async function syncCompaniesFromTours() {
  const names = await Tour.distinct('company', {
    company: { $nin: ['', null] },
  });
  if (!names.length) return;
  await Company.bulkWrite(
    names.map((name) => ({
      updateOne: {
        filter: { name: String(name).trim() },
        update: { $setOnInsert: { name: String(name).trim() } },
        upsert: true,
      },
    })),
    { ordered: false }
  );
}

router.get('/', async (_req, res) => {
  try {
    await syncCompaniesFromTours();
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }
    const company = await Company.create({ name });
    res.status(201).json(company);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Company already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }
    const existing = await Company.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Company not found' });

    const previousName = existing.name;
    existing.name = name;
    await existing.save();

    if (previousName !== name) {
      await Tour.updateMany({ company: previousName }, { company: name });
    }

    res.json(existing);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Company already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
