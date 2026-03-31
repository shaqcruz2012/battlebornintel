import { Router } from 'express';
import { getCommunities, findShortestPath, getNetworkStats } from '../db/queries/graph-analysis.js';
import { ValidationError } from '../errors.js';

const router = Router();

// NOTE: Cache middleware is applied at the mount level in index.js.
// Do NOT add a route-level cache here — it would double-cache.

/**
 * GET /api/graph-analysis/communities
 * Returns nodes grouped by community_id with centrality metrics.
 */
router.get('/communities', async (req, res, next) => {
  try {
    const data = await getCommunities();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph-analysis/path/:source/:target
 * Finds shortest path between two nodes via BFS over graph_edges.
 */
router.get('/path/:source/:target', async (req, res, next) => {
  try {
    const { source, target } = req.params;
    if (!source || source.trim() === '') {
      throw new ValidationError('source parameter is required');
    }
    if (!target || target.trim() === '') {
      throw new ValidationError('target parameter is required');
    }
    const data = await findShortestPath(source, target);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph-analysis/stats
 * Returns network statistics summary (node/edge counts, top nodes, degree, categories).
 */
router.get('/stats', async (req, res, next) => {
  try {
    const data = await getNetworkStats();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
