import { Router } from 'express';
import { getDb } from '../db.js';
import { createHash } from 'crypto';

const router = Router({ mergeParams: true });

// Cache TTL in minutes
const CACHE_TTL_MIN = 5;

function hashFilters(filters, relFilters, yearFilter) {
  const key = JSON.stringify({ filters, relFilters, yearFilter });
  return createHash('sha256').update(key).digest('hex').slice(0, 16);
}

router.get('/', (req, res) => {
  const db = getDb();
  const { vertical } = req.params;
  const { filters, relFilters, yearFilter } = req.query;

  const filterHash = hashFilters(filters, relFilters, yearFilter);

  // Check cache
  const cached = db.prepare(
    "SELECT * FROM graph_metrics_cache WHERE vertical_id = ? AND filter_hash = ? AND computed_at > datetime('now', ?)"
  ).get(vertical, filterHash, `-${CACHE_TTL_MIN} minutes`);

  if (cached) {
    return res.json(JSON.parse(cached.metrics_json));
  }

  // Cache miss — return empty for now (server-side computation added in Phase 5)
  // The client-side will fall back to local computation
  res.json({ cached: false, message: 'Server-side metrics not yet implemented — use client-side fallback' });
});

// Invalidate cache
router.delete('/cache', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM graph_metrics_cache WHERE vertical_id = ?').run(req.params.vertical);
  res.json({ cleared: true });
});

export default router;
