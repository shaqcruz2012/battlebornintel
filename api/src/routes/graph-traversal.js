import { Router } from 'express';
import {
  getNeighborhood,
  getShortestPaths,
  getSimilarNodes,
  getCommunities,
} from '../db/queries/graph-traversal.js';

const router = Router();

// Valid node ID pattern: prefix_id (e.g., c_4, f_bbv, x_nshe, p_john_doe)
const NODE_ID_RE = /^[a-z]{1,3}_[\w]+$/;

function validateNodeId(id) {
  if (!id || typeof id !== 'string') return false;
  return NODE_ID_RE.test(id);
}

/**
 * GET /api/graph/neighbors/:nodeId?depth=2
 * Multi-hop traversal — find all nodes within N hops of a given node.
 */
router.get('/neighbors/:nodeId', async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!validateNodeId(nodeId)) {
      return res.status(400).json({ error: 'Invalid nodeId format. Expected pattern like c_4, f_bbv, x_nshe.' });
    }

    const depth = Math.min(Math.max(parseInt(req.query.depth || '2', 10) || 2, 1), 4);
    const data = await getNeighborhood(nodeId, depth);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph/paths/:sourceId/:targetId?maxDepth=4
 * Shortest paths between two nodes using BFS.
 */
router.get('/paths/:sourceId/:targetId', async (req, res, next) => {
  try {
    const { sourceId, targetId } = req.params;
    if (!validateNodeId(sourceId)) {
      return res.status(400).json({ error: `Invalid sourceId format: "${sourceId}".` });
    }
    if (!validateNodeId(targetId)) {
      return res.status(400).json({ error: `Invalid targetId format: "${targetId}".` });
    }
    if (sourceId === targetId) {
      return res.status(400).json({ error: 'sourceId and targetId must be different.' });
    }

    const maxDepth = Math.min(Math.max(parseInt(req.query.maxDepth || '4', 10) || 4, 1), 6);
    const data = await getShortestPaths(sourceId, targetId, maxDepth);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph/similar/:nodeId?limit=10
 * Find structurally similar nodes via Jaccard similarity on neighborhoods.
 */
router.get('/similar/:nodeId', async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    if (!validateNodeId(nodeId)) {
      return res.status(400).json({ error: 'Invalid nodeId format.' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10) || 10, 1), 50);
    const data = await getSimilarNodes(nodeId, limit);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/graph/communities
 * Enhanced community detection with inter-community edge counts, hubs, and isolation.
 */
router.get('/communities', async (req, res, next) => {
  try {
    const data = await getCommunities();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
