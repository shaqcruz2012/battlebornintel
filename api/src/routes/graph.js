import { Router } from 'express';
import { getGraphData, getGraphMetrics } from '../db/queries/graph.js';

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

router.get('/metrics', async (req, res, next) => {
  try {
    const data = await getGraphMetrics();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
