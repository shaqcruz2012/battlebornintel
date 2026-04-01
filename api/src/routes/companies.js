import { Router } from 'express';
import { getAllCompanies, getCompanyById } from '../db/queries/companies.js';
import { getCompanyDimensions } from '../db/queries/company-dimensions.js';
import { computeForwardScore } from '../engine/scoring.js';
import { NotFoundError, ValidationError } from '../errors.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { stage, region, sector, search, sortBy } = req.query;
    const data = await getAllCompanies({ stage, region, sector, search, sortBy });

    // forward_score, forward_components, and score_type are already
    // populated from computed_scores via the CTE in getAllCompanies().
    // No per-company re-computation needed.
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) throw new ValidationError('id must be a positive integer');
    const data = await getCompanyById(id);
    if (!data) throw new NotFoundError('Company not found');

    // Enrich single company with forward score
    try {
      const forwardData = await computeForwardScore(id);
      if (forwardData) {
        data.forward_score = forwardData.forward_score;
        data.forward_components = forwardData.components;
        data.score_type = 'blended';
      } else {
        data.forward_score = null;
        data.forward_components = null;
        data.score_type = 'heuristic';
      }
    } catch {
      data.forward_score = null;
      data.forward_components = null;
      data.score_type = 'heuristic';
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/dimensions', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) throw new ValidationError('id must be a positive integer');
    const data = await getCompanyDimensions(id);
    if (!data) throw new NotFoundError('Company not found');
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
