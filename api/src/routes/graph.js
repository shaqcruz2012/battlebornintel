import { Router } from 'express';
import { logger } from '../logger.js';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';
import { computeAndReturnMetrics } from '../services/graphService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// Cache graph data for 5 minutes. The graph changes infrequently (new edges/nodes
// added via admin, not real-time writes), so a 5-minute TTL is safe. Cache key
// is derived from nodeTypes + yearMax + region query params so each unique filter
// combination is cached independently.
router.use(cacheMiddleware('graph', 300000, { cacheControl: 'public, max-age=300' }));

router.get('/', async (req, res, next) => {
  try {
    const nodeTypes = req.query.nodeTypes
      ? req.query.nodeTypes.split(',')
      : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];
    const yearMax = parseInt(req.query.yearMax || '2026', 10);
    const region = req.query.region || 'all';
    const data = await getGraphData({ nodeTypes, yearMax, region });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// Cached metrics (from graph_metrics_cache table)
router.get('/metrics', async (req, res, next) => {
  try {
    const cached = await getGraphMetrics();
    // If cache is empty, compute live
    if (Object.keys(cached.pagerank).length === 0) {
      const nodeTypes = req.query.nodeTypes
        ? req.query.nodeTypes.split(',')
        : undefined;
      try {
        const live = await computeAndReturnMetrics(nodeTypes);
        return res.json({ data: live, source: 'computed' });
      } catch (computeErr) {
        logger.error('[graph/metrics] Live computation failed:', computeErr.message);
        // Return empty metrics rather than crashing — the graph still renders
        return res.json({
          data: { pagerank: {}, betweenness: {}, communities: {}, watchlist: [], numCommunities: 0, coInvestmentDensity: {}, founderMobility: {}, structuralHole: {} },
          source: 'empty',
        });
      }
    }
    res.json({ data: cached, source: 'cache' });
  } catch (err) {
    next(err);
  }
});

export default router;
