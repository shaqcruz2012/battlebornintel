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
 *  - limit: number of activities (default: 100, max: 500)
 *  - type: activity type filter (funding, partnership, award, etc.)
 *  - stakeholder_type: stakeholder category filter (gov_policy, university, corporate, risk_capital, ecosystem)
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      location = 'all',
      since,
      until,
      limit = 100,
      type,
      stakeholder_type,
      stakeholderType: stakeholderTypeCamel,
    } = req.query;
    // Support both snake_case and camelCase param names
    const resolvedStakeholderType = stakeholder_type || stakeholderTypeCamel;

    // Validate and sanitize inputs
    const parsedLimit = Math.min(parseInt(limit, 10) || 100, 500);
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    if (since && !ISO_DATE.test(since)) {
      return res.status(400).json({ error: 'since must be ISO date format YYYY-MM-DD' });
    }
    if (until && !ISO_DATE.test(until)) {
      return res.status(400).json({ error: 'until must be ISO date format YYYY-MM-DD' });
    }

    const VALID_STAKEHOLDER_TYPES = new Set([
      'gov_policy', 'gov', 'university', 'corporate', 'risk_capital', 'capital', 'ecosystem',
    ]);
    if (resolvedStakeholderType && resolvedStakeholderType !== 'all' && !VALID_STAKEHOLDER_TYPES.has(resolvedStakeholderType)) {
      return res.status(400).json({
        error: `stakeholder_type must be one of: ${[...VALID_STAKEHOLDER_TYPES].join(', ')}`,
      });
    }

    const filterParams = {
      location,
      since,
      until,
      type,
      stakeholderType: resolvedStakeholderType,
    };

    // Fetch paginated data with total count in a single query
    const { rows: data, totalCount } = await getStakeholderActivities({
      ...filterParams,
      limit: parsedLimit,
    });

    const activeFilters = {
      location: location !== 'all' ? location : null,
      since: since || null,
      until: until || null,
      type: type || null,
      stakeholder_type: (stakeholder_type && stakeholder_type !== 'all') ? stakeholder_type : null,
    };

    res.json({
      data,
      meta: {
        count: data.length,
        total: totalCount,
        limit: parsedLimit,
        hasMore: totalCount > parsedLimit,
        filters: activeFilters,
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

    const parsedCompanyId = parseInt(companyId, 10);
    if (Number.isNaN(parsedCompanyId)) {
      return res.status(400).json({ error: 'companyId must be a number' });
    }

    const data = await getCompanyActivities(
      parsedCompanyId,
      parseInt(limit, 10) || 20
    );

    res.json({
      data,
      meta: { count: data.length },
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

    res.json({ data });
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

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
