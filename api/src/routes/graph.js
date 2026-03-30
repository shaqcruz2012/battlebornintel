import { Router } from 'express';
import { getGraphData, getGraphDataLight, getGraphMetrics } from '../db/queries/graph.js';
import { computeAndReturnMetrics } from '../services/graphService.js';
import { recomputeGraphAnalytics, getNodeAnalytics, getClusterSummaries } from '../services/graphAnalyticsService.js';

const router = Router();

function parseGraphParams(req) {
  const nodeTypes = req.query.nodeTypes
    ? req.query.nodeTypes.split(',')
    : ['company', 'fund', 'person', 'external', 'accelerator', 'ecosystem'];
  const yearMax = parseInt(req.query.yearMax || '2026', 10);
  const region = req.query.region || 'all';
  const includeOpportunities = req.query.opportunities === 'true' || req.query.opportunities === '1';
  return { nodeTypes, yearMax, region, includeOpportunities };
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

// Cached metrics (from graph_analytics table first, then graph_metrics_cache fallback)
router.get('/metrics', async (req, res, next) => {
  try {
    // Try pre-computed graph_analytics first
    const analytics = await getNodeAnalytics();
    if (analytics.length > 0) {
      const pagerank = {};
      const betweenness = {};
      const communities = {};
      const communityNames = {};
      analytics.forEach(a => {
        pagerank[a.node_id] = a.pagerank;
        betweenness[a.node_id] = a.betweenness;
        communities[a.node_id] = a.community_id;
        if (a.community_name) communityNames[a.community_id] = a.community_name;
      });

      const clusterData = await getClusterSummaries('community');
      clusterData.forEach(c => {
        if (c.name) communityNames[c.cluster_id] = c.name;
      });

      return res.json({
        data: { pagerank, betweenness, communities, communityNames, numCommunities: clusterData.length },
        source: 'graph_analytics',
      });
    }

    // Fall back to legacy graph_metrics_cache
    const cached = await getGraphMetrics();
    if (Object.keys(cached.pagerank).length === 0) {
      const nodeTypes = req.query.nodeTypes
        ? req.query.nodeTypes.split(',')
        : undefined;
      try {
        const live = await computeAndReturnMetrics(nodeTypes);
        return res.json({ data: live, source: 'computed' });
      } catch (computeErr) {
        console.error('[graph/metrics] Live computation failed:', computeErr.message);
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

// GET /api/graph/analytics — read pre-computed node analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await getNodeAnalytics();
    res.json({ data: analytics });
  } catch (err) {
    console.error('[graph/analytics]', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET /api/graph/clusters?type=community|kmeans
router.get('/clusters', async (req, res) => {
  try {
    const type = req.query.type || 'community';
    const clusters = await getClusterSummaries(type);
    res.json({ data: clusters });
  } catch (err) {
    console.error('[graph/clusters]', err);
    res.status(500).json({ error: 'Failed to load clusters' });
  }
});

// POST /api/graph/recompute — trigger analytics recomputation
router.post('/recompute', async (req, res) => {
  try {
    const result = await recomputeGraphAnalytics();
    res.json({ data: result });
  } catch (err) {
    console.error('[graph/recompute]', err);
    res.status(500).json({ error: 'Analytics recomputation failed' });
  }
});

export default router;
