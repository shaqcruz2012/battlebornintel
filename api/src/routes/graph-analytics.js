import { Router } from 'express';
import {
  getNodeEmbeddings,
  getClusteringResults,
  getClusteringSummary,
  getNodeTemporalMetrics,
  getGraphSnapshot,
} from '../db/queries/graph-analytics.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Node IDs: alphanumeric + underscore, max 40 chars. */
function isValidNodeId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_]{1,40}$/.test(id);
}

/** YYYY-MM-DD date string. */
function isISODate(str) {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

/** Safe positive integer. */
function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/graph-analytics/embeddings?model_name=...&node_ids=c_1,c_2
router.get('/embeddings', async (req, res, next) => {
  try {
    const { model_name, node_ids } = req.query;

    let nodeIds;
    if (node_ids) {
      nodeIds = node_ids.split(',').map((s) => s.trim()).filter(Boolean);
      for (const id of nodeIds) {
        if (!isValidNodeId(id)) {
          return res.status(400).json({ error: `Invalid node_id: ${id}. Must be alphanumeric/underscore, max 40 chars.` });
        }
      }
    }

    const data = await getNodeEmbeddings({ modelName: model_name, nodeIds });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/graph-analytics/clusters?model_name=...&cluster_id=1
router.get('/clusters', async (req, res, next) => {
  try {
    const { model_name, cluster_id } = req.query;

    let clusterId;
    if (cluster_id !== undefined) {
      clusterId = parseInt(cluster_id, 10);
      if (!Number.isInteger(clusterId)) {
        return res.status(400).json({ error: 'cluster_id must be an integer' });
      }
    }

    const data = await getClusteringResults({ modelName: model_name, clusterId });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/graph-analytics/clusters/summary?model_name=...
router.get('/clusters/summary', async (req, res, next) => {
  try {
    const { model_name } = req.query;
    const data = await getClusteringSummary(model_name);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/graph-analytics/temporal/:nodeId
router.get('/temporal/:nodeId', async (req, res, next) => {
  try {
    const { nodeId } = req.params;

    if (!isValidNodeId(nodeId)) {
      return res.status(400).json({ error: 'nodeId must be alphanumeric/underscore, max 40 chars' });
    }

    const data = await getNodeTemporalMetrics(nodeId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/graph-analytics/snapshot?date=2025-01-01
router.get('/snapshot', async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date || !isISODate(date)) {
      return res.status(400).json({ error: 'date query parameter required in YYYY-MM-DD format' });
    }

    const data = await getGraphSnapshot(date);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
