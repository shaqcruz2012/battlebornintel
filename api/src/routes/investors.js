import { Router } from 'express';
import { getAllInvestors, getInvestorById, getInvestorStats } from '../db/queries/investors.js';

const router = Router();

// GET /api/investors — all investors (funds + external) with portfolio data
router.get('/', async (req, res, next) => {
  try {
    const data = await getAllInvestors();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/investors/stats — aggregate stats for KPI strip
router.get('/stats', async (req, res, next) => {
  try {
    const data = await getInvestorStats();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/investors/:id — individual investor detail
router.get('/:id', async (req, res, next) => {
  try {
    const data = await getInvestorById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Investor not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
