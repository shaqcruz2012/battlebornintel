import { Router } from 'express';
import { getAllCompanies, getCompanyById } from '../db/queries/companies.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { stage, region, sector, search, sortBy } = req.query;
    const data = await getAllCompanies({ stage, region, sector, search, sortBy });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const data = await getCompanyById(id);
    if (!data) return res.status(404).json({ error: 'Company not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
