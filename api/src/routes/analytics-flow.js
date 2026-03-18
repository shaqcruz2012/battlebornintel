import { Router } from 'express';
import { computeCapitalFlows } from '../engine/capital-flow.js';

const router = Router();

// GET /api/analytics/capital-flows
router.get('/capital-flows', async (_req, res, next) => {
  try {
    const data = await computeCapitalFlows();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/capital-magnets?limit=20
router.get('/capital-magnets', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const { capitalMagnets } = await computeCapitalFlows();
    res.json({ data: capitalMagnets.slice(0, limit) });
  } catch (err) {
    next(err);
  }
});

export default router;
