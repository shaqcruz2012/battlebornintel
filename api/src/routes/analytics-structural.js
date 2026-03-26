import { Router } from 'express';
import { analyzeStructuralHoles } from '../engine/structural-holes.js';

const router = Router();

// In-memory cache (structural analysis is expensive — reuse for 5 min)
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL = 300_000;

async function getCachedAnalysis() {
  if (_cache && Date.now() - _cacheTs < CACHE_TTL) return _cache;
  _cache = await analyzeStructuralHoles();
  _cacheTs = Date.now();
  return _cache;
}

/**
 * GET /api/analytics/structural-holes
 *
 * Full structural hole analysis: bridges, islands, gaps, stats.
 */
router.get('/structural-holes', async (req, res, next) => {
  try {
    const analysis = await getCachedAnalysis();
    res.json({ data: analysis });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/ecosystem-gaps
 *
 * Focused view: only gaps and islands (lighter payload for the gaps UI).
 */
router.get('/ecosystem-gaps', async (req, res, next) => {
  try {
    const analysis = await getCachedAnalysis();
    res.json({
      data: {
        gaps: analysis.gaps,
        islands: analysis.islands,
        stats: {
          totalCommunities: analysis.stats.totalCommunities,
          islandCount: analysis.stats.islandCount,
          gapCount: analysis.stats.gapCount,
        },
        trends: analysis.trends,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
