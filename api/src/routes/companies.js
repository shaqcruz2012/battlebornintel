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
    const data = await getCompanyById(parseInt(req.params.id, 10));
    if (!data) return res.status(404).json({ error: 'Company not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
