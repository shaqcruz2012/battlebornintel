import { Router } from 'express';
import { findInvestorMatches } from '../engine/investor-matching.js';

const router = Router();

/**
 * GET /api/analytics/investor-match/:companyId?limit=20
 *
 * Returns ranked investor matches for a company based on
 * neighborhood cosine similarity on the graph.
 */
router.get('/investor-match/:companyId', async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    if (isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId must be a positive integer' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const result = await findInvestorMatches(companyId, { limit });

    if (!result) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
