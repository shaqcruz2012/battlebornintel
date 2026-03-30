import { Router } from 'express';
import { getTimeline, getREAPMetrics, getTimelineWeeks, getTimelineWeek } from '../db/queries/timeline.js';

const router = Router();

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Known event_type values recorded in timeline_events (matches REAP metrics query in db/queries/timeline.js)
const VALID_EVENT_TYPES = new Set([
  'Funding', 'Grant', 'Hiring', 'Partnership', 'Launch', 'Patent',
  'Milestone', 'Award', 'Expansion', 'Acquisition', 'Founding',
]);

/**
 * GET /api/timeline
 * Returns the most recent timeline events, optionally filtered by type.
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, type, region } = req.query;
    if (type && !VALID_EVENT_TYPES.has(type)) {
      return res.status(400).json({
        error: `type must be one of: ${[...VALID_EVENT_TYPES].join(', ')}`,
      });
    }
    const data = await getTimeline({
      limit: limit ? Math.min(parseInt(limit, 10), 500) : 30,
      type,
      region,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/timeline/weeks
 * Returns all weeks that have timeline events, with event counts.
 * Cached at 120s TTL via cacheMiddleware in index.js.
 */
router.get('/weeks', async (req, res, next) => {
  try {
    const data = await getTimelineWeeks();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/timeline/reap
 * Returns MIT REAP framework metrics aggregated from timeline events.
 * Optional query params: since (YYYY-MM-DD), until (YYYY-MM-DD).
 */
router.get('/reap', async (req, res, next) => {
  try {
    const { since, until } = req.query;
    if (since && !ISO_DATE_RE.test(since)) {
      return res.status(400).json({ error: 'since must be ISO format YYYY-MM-DD' });
    }
    if (until && !ISO_DATE_RE.test(until)) {
      return res.status(400).json({ error: 'until must be ISO format YYYY-MM-DD' });
    }
    const data = await getREAPMetrics({ since, until });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/timeline/week/:date
 * Returns all events for the ISO week starting on :date (a Monday).
 * Cached at 120s TTL via cacheMiddleware in index.js.
 *
 * @param {string} date - ISO date string (YYYY-MM-DD), should be a Monday
 */
router.get('/week/:date', async (req, res, next) => {
  try {
    const { date } = req.params;
    if (!ISO_DATE_RE.test(date)) {
      return res.status(400).json({ error: 'date must be ISO format YYYY-MM-DD' });
    }
    const data = await getTimelineWeek(date);
    res.json({ data, weekStart: date, eventCount: data.length });
  } catch (err) {
    next(err);
  }
});

export default router;
