import { Router } from 'express';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';
import { computeAndReturnMetrics } from '../services/graphService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const nodeTypes = req.query.nodeTypes
      ? req.query.nodeTypes.split(',')
      : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];
    const yearMax = parseInt(req.query.yearMax || '2026', 10);
    const data = await getGraphData({ nodeTypes, yearMax });
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
      const live = await computeAndReturnMetrics(nodeTypes);
      return res.json({ data: live, source: 'computed' });
    }
    res.json({ data: cached, source: 'cache' });
  } catch (err) {
    next(err);
  }
});

export default router;
