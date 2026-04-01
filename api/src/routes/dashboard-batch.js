/**
 * Dashboard Batch API
 * Consolidates multiple dashboard data queries into a single endpoint
 * Reduces network overhead and improves load time by 80-120ms
 */

import { Router } from 'express';
import { logger } from '../logger.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { getAllCompanies } from '../db/queries/companies.js';
import { getAllFunds } from '../db/queries/funds.js';
import { getKpis } from '../db/queries/kpis.js';
import { getSectorStats } from '../db/queries/kpis.js';
import { getIndicatorsSummary } from '../db/queries/indicators.js';

const router = Router();

// Apply cache middleware to batch endpoint (5 minute TTL, real-time data)
router.use(cacheMiddleware('dashboard-batch', 300000, { cacheControl: 'public, max-age=300' }));

/**
 * GET /api/dashboard-batch
 * Fetch multiple dashboard datasets in one request
 *
 * Query params (all optional):
 * - companies: boolean (default true) - fetch companies list
 * - kpis: boolean (default true) - fetch KPI aggregates
 * - funds: boolean (default true) - fetch funds list
 * - sectors: boolean (default true) - fetch sector stats
 * - indicators: boolean (default false) - fetch economic indicators summary
 * - filters: JSON string - pass to companies query
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      companies: includeCompanies = 'true',
      kpis: includeKpis = 'true',
      funds: includeFunds = 'true',
      sectors: includeSectors = 'true',
      indicators: includeIndicators = 'false',
      filters: filtersStr,
    } = req.query;

    // Parse filters if provided, whitelist allowed keys
    let filters = {};
    const ALLOWED_FILTER_KEYS = ['stage', 'region', 'sector', 'search', 'sortBy'];
    if (filtersStr) {
      try {
        const parsed = JSON.parse(filtersStr);
        const unknownKeys = Object.keys(parsed).filter(k => !ALLOWED_FILTER_KEYS.includes(k));
        if (unknownKeys.length > 0) {
          return res.status(400).json({ error: `Unknown filter keys: ${unknownKeys.join(', ')}` });
        }
        filters = parsed;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }

    // Convert string booleans
    const shouldFetchCompanies = includeCompanies === 'true';
    const shouldFetchKpis = includeKpis === 'true';
    const shouldFetchFunds = includeFunds === 'true';
    const shouldFetchSectors = includeSectors === 'true';
    const shouldFetchIndicators = includeIndicators === 'true';

    // Execute all requested queries in parallel
    const promises = [];

    if (shouldFetchCompanies) {
      promises.push(
        getAllCompanies(filters).catch(err => {
          logger.error('Companies query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchKpis) {
      promises.push(
        getKpis(filters).catch(err => {
          logger.error('KPIs query error:', err);
          return {};
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchFunds) {
      promises.push(
        getAllFunds(filters).catch(err => {
          logger.error('Funds query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchSectors) {
      promises.push(
        getSectorStats(filters).catch(err => {
          logger.error('Sector stats query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchIndicators) {
      promises.push(
        getIndicatorsSummary().catch(err => {
          logger.error('Indicators query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    const [companies, kpis, funds, sectors, indicators] = await Promise.all(promises);

    // Build response object only with requested data
    const response = {};
    if (shouldFetchCompanies) response.companies = companies;
    if (shouldFetchKpis) response.kpis = kpis;
    if (shouldFetchFunds) response.funds = funds;
    if (shouldFetchSectors) response.sectors = sectors;
    if (shouldFetchIndicators) response.indicators = indicators;

    res.json({ data: response });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard-batch/executives
 * Fetch executive dashboard specific data (companies + KPIs)
 * Most commonly used dashboard combination
 */
router.get('/executives', async (req, res, next) => {
  try {
    const { filters: filtersStr } = req.query;

    let filters = {};
    const ALLOWED_FILTER_KEYS = ['stage', 'region', 'sector', 'search', 'sortBy'];
    if (filtersStr) {
      try {
        const parsed = JSON.parse(filtersStr);
        const unknownKeys = Object.keys(parsed).filter(k => !ALLOWED_FILTER_KEYS.includes(k));
        if (unknownKeys.length > 0) {
          return res.status(400).json({ error: `Unknown filter keys: ${unknownKeys.join(', ')}` });
        }
        filters = parsed;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }

    const [companies, kpis] = await Promise.all([
      getAllCompanies(filters).catch(err => {
        logger.error('Companies query error:', err);
        return [];
      }),
      getKpis(filters).catch(err => {
        logger.error('KPIs query error:', err);
        return {};
      }),
    ]);

    res.json({ data: { companies, kpis } });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard-batch/goed
 * Fetch GOED-specific data (kpis + sectors + companies)
 *
 * The `region` query param scopes all three datasets so that capital deployed,
 * sector counts, and company lists all reflect the selected Nevada region.
 */
router.get('/goed', async (req, res, next) => {
  try {
    const { region } = req.query;

    const filters = region && region !== 'all' ? { region } : {};

    const [kpis, sectors, companies, indicators] = await Promise.all([
      getKpis(filters).catch(err => {
        logger.error('KPIs query error:', err);
        return {};
      }),
      getSectorStats(filters).catch(err => {
        logger.error('Sector stats query error:', err);
        return [];
      }),
      getAllCompanies(filters).catch(err => {
        logger.error('Companies query error:', err);
        return [];
      }),
      getIndicatorsSummary().catch(err => {
        logger.error('Indicators query error:', err);
        return [];
      }),
    ]);

    res.json({ data: { kpis, sectors, companies, indicators } });
  } catch (err) {
    next(err);
  }
});

export default router;
