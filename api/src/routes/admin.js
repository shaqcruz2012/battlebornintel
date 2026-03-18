import { Router } from 'express';
import { recomputeAllScores } from '../services/scoringService.js';
import { recomputeAndCacheMetrics } from '../services/graphService.js';
import { exportTemporalData, verifyExport } from '../services/temporalExport.js';

const router = Router();

// Recompute all IRS scores and cache them
router.post('/recompute-scores', async (req, res, next) => {
  try {
    const count = await recomputeAllScores();
    res.json({ data: { companiesScored: count }, message: 'Scores recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute graph metrics and cache them
router.post('/recompute-graph', async (req, res, next) => {
  try {
    const count = await recomputeAndCacheMetrics();
    res.json({ data: { nodesCached: count }, message: 'Graph metrics recomputed' });
  } catch (err) {
    next(err);
  }
});

// Recompute everything
router.post('/recompute-all', async (req, res, next) => {
  try {
    const scores = await recomputeAllScores();
    const metrics = await recomputeAndCacheMetrics();
    res.json({
      data: { companiesScored: scores, nodesCached: metrics },
      message: 'All computations complete',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/export-temporal — triggers data export for TGN training
router.post('/export-temporal', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const meta = await exportTemporalData();
    const durationMs = Date.now() - startTime;
    res.json({
      success: true,
      duration_ms: durationMs,
      ...meta,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/export-temporal/verify — check if exported data exists and return stats
router.get('/export-temporal/verify', (req, res, next) => {
  try {
    const result = verifyExport();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
