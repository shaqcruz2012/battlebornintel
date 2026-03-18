import { Router } from 'express';
import { getGraphData, getGraphDataLight, getGraphMetrics } from '../db/queries/graph.js';
import { computeAndReturnMetrics } from '../services/graphService.js';

const router = Router();

function parseGraphParams(req) {
  const nodeTypes = req.query.nodeTypes
    ? req.query.nodeTypes.split(',')
    : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];
  const yearMax = parseInt(req.query.yearMax || '2026', 10);
  const region = req.query.region || 'all';
  return { nodeTypes, yearMax, region };
}

router.get('/', async (req, res, next) => {
  try {
    const data = await getGraphData(parseGraphParams(req));
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// Lightweight endpoint for initial render — smaller payload, faster parse
router.get('/light', async (req, res, next) => {
  try {
    const data = await getGraphDataLight(parseGraphParams(req));
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
        console.error('[graph/metrics] Live computation failed:', computeErr.message);
        // Return empty metrics rather than crashing — the graph still renders
        return res.json({
          data: { pagerank: {}, betweenness: {}, communities: {}, watchlist: [], numCommunities: 0 },
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
