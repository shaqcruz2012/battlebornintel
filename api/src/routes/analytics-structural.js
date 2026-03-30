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
 * Filter structural analysis data by region.
 * Filters bridges and island members whose associated entities match the region.
 */
function filterAnalysisByRegion(analysis, region) {
  if (!region || region === 'all') return analysis;

  const filteredBridges = (analysis.bridges || []).filter(
    (b) => b.region === region
  );
  const filteredIslands = (analysis.islands || []).map((island) => ({
    ...island,
    members: (island.members || []).filter(
      (m) => !m.region || m.region === region
    ),
  })).filter((island) => island.members.length > 0);

  return {
    ...analysis,
    bridges: filteredBridges,
    islands: filteredIslands,
    stats: {
      ...analysis.stats,
      bridgeCount: filteredBridges.length,
      islandCount: filteredIslands.length,
    },
  };
}

/**
 * GET /api/analytics/structural-holes?region=las_vegas
 *
 * Full structural hole analysis: bridges, islands, gaps, stats.
 */
router.get('/structural-holes', async (req, res, next) => {
  try {
    const region = req.query.region || null;
    const analysis = await getCachedAnalysis();
    res.json({ data: filterAnalysisByRegion(analysis, region) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/ecosystem-gaps?region=las_vegas
 *
 * Focused view: only gaps and islands (lighter payload for the gaps UI).
 */
router.get('/ecosystem-gaps', async (req, res, next) => {
  try {
    const region = req.query.region || null;
    const analysis = await getCachedAnalysis();
    const filtered = filterAnalysisByRegion(analysis, region);
    res.json({
      data: {
        gaps: filtered.gaps,
        islands: filtered.islands,
        stats: {
          totalCommunities: filtered.stats.totalCommunities,
          islandCount: filtered.stats.islandCount,
          gapCount: filtered.stats.gapCount,
        },
        trends: filtered.trends,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
