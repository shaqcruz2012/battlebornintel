import { Router } from 'express';
import {
  getIndicators,
  getIndicatorsSummary,
  getIndicatorHistory,
  getIndicatorsByEntity,
} from '../db/queries/indicators.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Return true if the string is a valid ISO 8601 date (YYYY-MM-DD). */
function isISODate(str) {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

/**
 * Parse and validate a `limit` query parameter.
 * Returns a positive integer clamped to [1, maxAllowed], or null on error.
 */
function parseLimit(raw, maxAllowed = 500) {
  const n = parseInt(raw, 10);
  if (!Number.isInteger(n) || n <= 0) return null;
  return Math.min(n, maxAllowed);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / -- summary of all indicators (latest + trend)
router.get('/', async (req, res, next) => {
  try {
    const data = await getIndicatorsSummary();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /history/:metric -- time series for a specific indicator
router.get('/history/:metric', async (req, res, next) => {
  try {
    const { metric } = req.params;

    if (!metric || !metric.trim()) {
      return res.status(400).json({ error: 'metric must be a non-empty string' });
    }

    const { entity_id, limit: limitRaw } = req.query;

    let limit = 100;
    if (limitRaw !== undefined) {
      limit = parseLimit(limitRaw);
      if (limit === null) {
        return res.status(400).json({ error: 'limit must be a positive integer' });
      }
    }

    const data = await getIndicatorHistory(metric.trim(), entity_id || null, limit);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /macro -- all macro indicators (entity_type='macro')
router.get('/macro', async (req, res, next) => {
  try {
    const { start, end } = req.query;

    if (start !== undefined && !isISODate(start)) {
      return res.status(400).json({ error: 'start must be a valid ISO date (YYYY-MM-DD)' });
    }
    if (end !== undefined && !isISODate(end)) {
      return res.status(400).json({ error: 'end must be a valid ISO date (YYYY-MM-DD)' });
    }

    const date_range = (start || end) ? { start, end } : undefined;
    const data = await getIndicators({ entity_type: 'macro', date_range });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /regional/:region -- indicators for a specific region
router.get('/regional/:region', async (req, res, next) => {
  try {
    const { region } = req.params;
    const { start, end } = req.query;

    if (start !== undefined && !isISODate(start)) {
      return res.status(400).json({ error: 'start must be a valid ISO date (YYYY-MM-DD)' });
    }
    if (end !== undefined && !isISODate(end)) {
      return res.status(400).json({ error: 'end must be a valid ISO date (YYYY-MM-DD)' });
    }

    const date_range = (start || end) ? { start, end } : undefined;
    const data = await getIndicatorsByEntity('region', region, date_range);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
