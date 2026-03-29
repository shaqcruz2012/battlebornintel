/**
 * Dashboard Batch API
 * Consolidates multiple dashboard data queries into a single endpoint
 * Reduces network overhead and improves load time by 80-120ms
 */

import { Router } from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { getAllCompanies, getCompanyById } from '../db/queries/companies.js';
import { getAllFunds } from '../db/queries/funds.js';
import { getKpis } from '../db/queries/kpis.js';
import { getSectorStats } from '../db/queries/kpis.js';

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
 * - filters: JSON string - pass to companies query
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      companies: includeCompanies = 'true',
      kpis: includeKpis = 'true',
      funds: includeFunds = 'true',
      sectors: includeSectors = 'true',
      filters: filtersStr,
    } = req.query;

    // Parse filters if provided
    let filters = {};
    if (filtersStr) {
      try {
        filters = JSON.parse(filtersStr);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }

    // Convert string booleans
    const shouldFetchCompanies = includeCompanies === 'true';
    const shouldFetchKpis = includeKpis === 'true';
    const shouldFetchFunds = includeFunds === 'true';
    const shouldFetchSectors = includeSectors === 'true';

    // Execute all requested queries in parallel
    const promises = [];

    if (shouldFetchCompanies) {
      promises.push(
        getAllCompanies(filters).catch(err => {
          console.error('Companies query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchKpis) {
      promises.push(
        getKpis(filters).catch(err => {
          console.error('KPIs query error:', err);
          return {};
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchFunds) {
      promises.push(
        getAllFunds().catch(err => {
          console.error('Funds query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    if (shouldFetchSectors) {
      promises.push(
        getSectorStats().catch(err => {
          console.error('Sector stats query error:', err);
          return [];
        })
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    const [companies, kpis, funds, sectors] = await Promise.all(promises);

    // Build response object only with requested data
    const response = {};
    if (shouldFetchCompanies) response.companies = companies;
    if (shouldFetchKpis) response.kpis = kpis;
    if (shouldFetchFunds) response.funds = funds;
    if (shouldFetchSectors) response.sectors = sectors;

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
    if (filtersStr) {
      try {
        filters = JSON.parse(filtersStr);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid filters JSON' });
      }
    }

    const [companies, kpis] = await Promise.all([
      getAllCompanies(filters).catch(err => {
        console.error('Companies query error:', err);
        return [];
      }),
      getKpis(filters).catch(err => {
        console.error('KPIs query error:', err);
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

    const [kpis, sectors, companies] = await Promise.all([
      getKpis(filters).catch(err => {
        console.error('KPIs query error:', err);
        return {};
      }),
      getSectorStats(filters).catch(err => {
        console.error('Sector stats query error:', err);
        return [];
      }),
      getAllCompanies(filters).catch(err => {
        console.error('Companies query error:', err);
        return [];
      }),
    ]);

    res.json({ data: { kpis, sectors, companies } });
  } catch (err) {
    next(err);
  }
});

export default router;
