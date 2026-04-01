import { Router } from 'express';
import {
  getOpportunities,
  getCompanyOpportunities,
  getOpportunityStats,
} from '../db/queries/opportunities.js';

const router = Router();

const VALID_QUALITIES = ['excellent', 'good', 'fair', 'all'];
const VALID_TYPES = ['program', 'fund', 'all'];
const VALID_SORTS = ['score', 'company', 'recent'];

/**
 * GET /api/opportunities
 * List opportunity edges with filters, sorting, pagination.
 */
router.get('/', async (req, res, next) => {
  try {
    const { quality = 'all', entityType = 'all', sector, stage, region, search,
      sortBy = 'score', limit = '100', offset = '0' } = req.query;

    if (!VALID_QUALITIES.includes(quality)) {
      return res.status(400).json({ error: `Invalid quality. Use: ${VALID_QUALITIES.join(', ')}` });
    }
    if (!VALID_TYPES.includes(entityType)) {
      return res.status(400).json({ error: `Invalid entityType. Use: ${VALID_TYPES.join(', ')}` });
    }
    if (!VALID_SORTS.includes(sortBy)) {
      return res.status(400).json({ error: `Invalid sortBy. Use: ${VALID_SORTS.join(', ')}` });
    }

    const result = await getOpportunities({
      quality: quality !== 'all' ? quality : undefined,
      entityType: entityType !== 'all' ? entityType : undefined,
      sector, stage, region, search, sortBy, limit, offset,
    });

    res.json({
      data: result.opportunities,
      meta: { total: result.total, limit: result.limit, offset: result.offset,
        filters: { quality, entityType, sector, stage, region, search } },
    });
  } catch (err) { next(err); }
});

/**
 * GET /api/opportunities/stats
 * Aggregate opportunity statistics.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const data = await getOpportunityStats();
    res.json({ data });
  } catch (err) { next(err); }
});

/**
 * GET /api/opportunities/company/:companyId
 * All opportunities for a specific company.
 */
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    if (isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({ error: 'companyId must be a positive integer' });
    }
    const result = await getCompanyOpportunities(companyId);
    res.json({ data: result.opportunities, summary: result.summary });
  } catch (err) { next(err); }
});

export default router;
