import { Router } from 'express';
import { computeCapitalFlows } from '../engine/capital-flow.js';

const router = Router();

/**
 * Filter capital flow data by region.
 * Keeps only magnets/sourceSink entries matching the region and
 * recalculates byRegion to show only the filtered region.
 */
function filterByRegion(data, region) {
  if (!region || region === 'all') return data;

  const filteredMagnets = (data.capitalMagnets || []).filter(
    (m) => m.region === region
  );
  const filteredSourceSink = (data.sourceSink || []).filter(
    (s) => s.region === region
  );

  return {
    ...data,
    capitalMagnets: filteredMagnets,
    sourceSink: filteredSourceSink,
  };
}

// GET /api/analytics/capital-flows?region=las_vegas
router.get('/capital-flows', async (req, res, next) => {
  try {
    const region = req.query.region || null;
    const data = await computeCapitalFlows();
    res.json({ data: filterByRegion(data, region) });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/capital-magnets?limit=20
router.get('/capital-magnets', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const { capitalMagnets } = await computeCapitalFlows();
    res.json({ data: capitalMagnets.slice(0, limit) });
  } catch (err) {
    next(err);
  }
});

export default router;
