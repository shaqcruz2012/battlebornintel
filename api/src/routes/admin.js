import { Router } from 'express';
import { recomputeAllScores } from '../services/scoringService.js';
import { recomputeAndCacheMetrics } from '../services/graphService.js';
import { refreshIndicators } from '../db/queries/indicators.js';

const router = Router();

// Recompute all IRS scores and cache them
router.post('/recompute-scores', async (req, res, next) => {
  try {
    const count = await recomputeAllScores();
    res.json({ data: { companiesScored: count }, message: 'Scores recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute graph metrics and cache them
router.post('/recompute-graph', async (req, res, next) => {
  try {
    const count = await recomputeAndCacheMetrics();
    res.json({ data: { nodesCached: count }, message: 'Graph metrics recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute everything
router.post('/recompute-all', async (req, res, next) => {
  try {
    const scores = await recomputeAllScores();
    const metrics = await recomputeAndCacheMetrics();
    await refreshIndicators();
    res.json({
      data: { companiesScored: scores, nodesCached: metrics, indicatorsRefreshed: true },
      message: 'All computations complete',
    });
  } catch (err) {
    next(err);
  }
});

// Refresh economic indicators materialized view
router.post('/refresh-indicators', async (req, res, next) => {
  try {
    await refreshIndicators();
    res.json({ data: null, message: 'Economic indicators refreshed' });
  } catch (err) {
    next(err);
  }
});

export default router;
