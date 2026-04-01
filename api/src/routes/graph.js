import { Router } from 'express';
import { logger } from '../logger.js';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';
import { computeAndReturnMetrics } from '../services/graphService.js';
import { generateCommunityNames } from '../engine/graph-metrics.js';
const router = Router();

// NOTE: Cache middleware is applied at the mount level in index.js
// (key='graph', TTL=300s, Cache-Control='public, max-age=3600').
// Do NOT add a route-level cache here — it would double-cache.

router.get('/', async (req, res, next) => {
  try {
    const nodeTypes = req.query.nodeTypes
      ? req.query.nodeTypes.split(',')
      : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem', 'program'];
    const yearMax = parseInt(req.query.yearMax || '2026', 10);
    const region = req.query.region || 'all';
    const light = req.query.light === 'true';
    const data = await getGraphData({ nodeTypes, yearMax, region, light });
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
    // Generate community names from cached assignments if missing
    if (!cached.communityNames || Object.keys(cached.communityNames).length === 0) {
      try {
        const nodeTypes = req.query.nodeTypes
          ? req.query.nodeTypes.split(',')
          : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem', 'program'];
        const { nodes, edges } = await getGraphData({ nodeTypes, yearMax: 2026, light: true });
        cached.communityNames = generateCommunityNames(nodes, edges, cached.communities || {});
      } catch (nameErr) {
        logger.warn('[graph/metrics] Could not generate community names:', nameErr.message);
        cached.communityNames = {};
      }
    }
    res.json({ data: cached, source: 'cache' });
  } catch (err) {
    next(err);
  }
});

export default router;
