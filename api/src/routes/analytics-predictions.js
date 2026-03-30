import { Router } from 'express';
import { predictMissingLinks, predictLinksForNode } from '../engine/link-prediction.js';

const router = Router();

// Valid node ID pattern: prefix_id (e.g., c_4, f_bbv, x_nshe, p_john_doe)
const NODE_ID_RE = /^[a-z]{1,3}_[\w]+$/;

/**
 * Filter predicted links by region.
 * Keeps predictions where either nodeA or nodeC is in the given region.
 */
function filterPredictionsByRegion(data, region) {
  if (!region || region === 'all' || !data?.predictions) return data;

  const filtered = data.predictions.filter((p) => {
    const aRegion = p.nodeA?.region;
    const cRegion = p.nodeC?.region;
    return aRegion === region || cRegion === region;
  });

  return {
    ...data,
    predictions: filtered,
    stats: {
      ...data.stats,
      predictionsAboveThreshold: filtered.length,
    },
  };
}

/**
 * GET /api/analytics/predicted-links?limit=50&minScore=0.3&region=las_vegas
 * Returns top predicted missing links across the entire graph.
 */
router.get('/predicted-links', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10) || 50, 1), 200);
    const minScore = Math.min(Math.max(parseFloat(req.query.minScore || '0.3') || 0.3, 0), 1);
    const region = req.query.region || null;

    const data = await predictMissingLinks({ limit, minScore });
    res.json({ data: filterPredictionsByRegion(data, region) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/predicted-links/:nodeId?limit=20
 * Returns predicted links for a specific node.
 */
router.get('/predicted-links/:nodeId', async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!nodeId || !NODE_ID_RE.test(nodeId)) {
      return res.status(400).json({ error: 'Invalid nodeId format. Expected pattern like c_4, f_bbv, x_nshe.' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10) || 20, 1), 100);
    const minScore = Math.min(Math.max(parseFloat(req.query.minScore || '0.3') || 0.3, 0), 1);

    const data = await predictLinksForNode(nodeId, { limit, minScore });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
