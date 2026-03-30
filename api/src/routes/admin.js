import { Router } from 'express';
import { recomputeAllScores } from '../services/scoringService.js';
import { recomputeAndCacheMetrics } from '../services/graphService.js';
import { refreshIndicators } from '../db/queries/indicators.js';
import { getAgentStatus, getDataFreshness } from '../db/queries/admin.js';
import { clearCache } from '../middleware/cache.js';
import { getPoolStats } from '../db/pool.js';

const router = Router();

// Tighter rate limit for expensive POST operations (recompute/refresh).
// These are CPU/DB-intensive: max 3 per 5 minutes per IP.
const adminPostCounts = new Map();
setInterval(() => adminPostCounts.clear(), 5 * 60_000).unref();

/** Reset the admin POST rate limit counter (used in tests). */
export function resetAdminPostLimit() {
  adminPostCounts.clear();
}

function adminPostLimit(req, res, next) {
  const key = req.ip;
  const count = (adminPostCounts.get(key) || 0) + 1;
  adminPostCounts.set(key, count);
  if (count > 3) {
    return res.status(429).json({ error: 'Too many admin operations. Try again in a few minutes.' });
  }
  next();
}

// Recompute all IRS scores and cache them
router.post('/recompute-scores', adminPostLimit, async (req, res, next) => {
  try {
    console.warn(`[ADMIN] ${req.path} initiated at ${new Date().toISOString()} from ${req.ip}`);
    const count = await recomputeAllScores();
    clearCache();
    res.json({ data: { companiesScored: count }, message: 'Scores recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute graph metrics and cache them
router.post('/recompute-graph', adminPostLimit, async (req, res, next) => {
  try {
    console.warn(`[ADMIN] ${req.path} initiated at ${new Date().toISOString()} from ${req.ip}`);
    const count = await recomputeAndCacheMetrics();
    clearCache();
    res.json({ data: { nodesCached: count }, message: 'Graph metrics recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute everything
router.post('/recompute-all', adminPostLimit, async (req, res, next) => {
  try {
    console.warn(`[ADMIN] ${req.path} initiated at ${new Date().toISOString()} from ${req.ip}`);
    const scores = await recomputeAllScores();
    const metrics = await recomputeAndCacheMetrics();
    await refreshIndicators();
    clearCache();
    res.json({
      data: { companiesScored: scores, nodesCached: metrics, indicatorsRefreshed: true },
      message: 'All computations complete',
    });
  } catch (err) {
    next(err);
  }
});

// Refresh economic indicators materialized view
router.post('/refresh-indicators', adminPostLimit, async (req, res, next) => {
  try {
    console.warn(`[ADMIN] ${req.path} initiated at ${new Date().toISOString()} from ${req.ip}`);
    await refreshIndicators();
    clearCache();
    res.json({ data: null, message: 'Economic indicators refreshed' });
  } catch (err) {
    next(err);
  }
});

// Agent health status (last 7 days)
router.get('/agent-status', async (req, res, next) => {
  try {
    const agents = await getAgentStatus();
    res.json({ data: { agents, generated_at: new Date().toISOString(), window_days: 7 } });
  } catch (err) {
    next(err);
  }
});

// Data freshness per entity type
router.get('/data-freshness', async (req, res, next) => {
  try {
    const freshness = await getDataFreshness();
    res.json({ data: { freshness, generated_at: new Date().toISOString() } });
  } catch (err) {
    next(err);
  }
});

// Pool health stats
router.get('/pool-stats', async (req, res) => {
  const stats = getPoolStats();
  res.json({ data: stats });
});

export default router;
