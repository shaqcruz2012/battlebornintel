import { Router } from 'express';
import { getGraphAtDate, getNodeFeatures, getNodeMetricsHistory, getStageTransitions } from '../db/queries/temporal.js';
import { ValidationError, NotFoundError } from '../errors.js';

const router = Router();

// NOTE: Cache middleware is applied at the mount level in index.js.
// Do NOT add a route-level cache here — it would double-cache.

/**
 * GET /api/graph/temporal?date=YYYY-MM-DD
 * Returns graph snapshot (nodes + edges) active at the given date.
 */
router.get('/temporal', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError('date query parameter required in YYYY-MM-DD format');
    }
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError('Invalid date value');
    }
    const data = await getGraphAtDate(date);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph/node-features
 * Returns all node feature vectors from the node_features materialized view.
 */
router.get('/node-features', async (req, res, next) => {
  try {
    const data = await getNodeFeatures();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph/metrics/:nodeId/history
 * Returns metrics history time-series for a specific node.
 */
router.get('/metrics/:nodeId/history', async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!nodeId || nodeId.trim() === '') {
      throw new ValidationError('nodeId parameter is required');
    }
    const data = await getNodeMetricsHistory(nodeId);
    if (data.length === 0) {
      throw new NotFoundError(`No metrics history found for node ${nodeId}`);
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/companies/:id/transitions
 * Returns stage transitions for a company.
 */
router.get('/stage-transitions/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      throw new ValidationError('id must be a positive integer');
    }
    const data = await getStageTransitions(id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
