import { Router } from 'express';
import {
  getStakeholderActivities,
  getCompanyActivities,
  getActivitiesByLocationAndDateRange,
  countActivitiesByType,
  countActivitiesByLocation,
} from '../db/queries/stakeholder-activities.js';

const router = Router();

/**
 * GET /api/stakeholder-activities
 * Get all stakeholder activities with optional filters
 *
 * Query parameters:
 *  - location: Nevada region (las_vegas, reno, henderson, carson_city, etc.)
 *  - since: ISO date string (e.g., 2025-01-01)
 *  - until: ISO date string (e.g., 2025-12-31)
 *  - limit: number of activities (default: 50, max: 200)
 *  - type: activity type filter (funding, partnership, award, etc.)
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      location = 'all',
      since,
      until,
      limit = 50,
      type,
    } = req.query;

    // Validate and sanitize inputs
    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    if (since && !ISO_DATE.test(since)) {
      return res.status(400).json({ error: 'since must be ISO date format YYYY-MM-DD' });
    }
    if (until && !ISO_DATE.test(until)) {
      return res.status(400).json({ error: 'until must be ISO date format YYYY-MM-DD' });
    }

    const data = await getStakeholderActivities({
      location,
      since,
      until,
      limit: parsedLimit,
      type,
    });

    res.json({
      success: true,
      data,
      meta: {
        count: data.length,
        limit: parsedLimit,
        filters: {
          location: location !== 'all' ? location : null,
          since: since || null,
          until: until || null,
          type: type || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stakeholder-activities/company/:companyId
 * Get activities for a specific company
 */
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { limit = 20 } = req.query;

    const data = await getCompanyActivities(
      parseInt(companyId, 10),
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stakeholder-activities/location/:location
 * Get activities by location
 */
router.get('/location/:location', async (req, res, next) => {
  try {
    const { location } = req.params;
    const { since, until } = req.query;

    // Default to last 90 days if not specified
    const endDate = until || new Date().toISOString().split('T')[0];
    const startDate = since || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const data = await getActivitiesByLocationAndDateRange(location, startDate, endDate);

    res.json({
      success: true,
      data,
      meta: {
        count: data.length,
        location,
        dateRange: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stakeholder-activities/stats/by-type
 * Get count of activities by type
 */
router.get('/stats/by-type', async (req, res, next) => {
  try {
    const data = await countActivitiesByType();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stakeholder-activities/stats/by-location
 * Get count of activities by location
 */
router.get('/stats/by-location', async (req, res, next) => {
  try {
    const data = await countActivitiesByLocation();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
