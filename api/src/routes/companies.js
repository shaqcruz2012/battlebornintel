import { Router } from 'express';
import { getAllCompanies, getCompanyById } from '../db/queries/companies.js';
import { computeForwardScore } from '../engine/scoring.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { stage, region, sector, search, sortBy } = req.query;
    const data = await getAllCompanies({ stage, region, sector, search, sortBy });

    // Enrich each company with forward score (best-effort, non-blocking)
    const enriched = await Promise.all(
      data.map(async (company) => {
        try {
          const forwardData = await computeForwardScore(company.id);
          if (forwardData) {
            return {
              ...company,
              forward_score: forwardData.forward_score,
              forward_components: forwardData.components,
              score_type: 'blended',
            };
          }
        } catch {
          // Forward score is additive — silently fall back
        }
        return {
          ...company,
          forward_score: null,
          forward_components: null,
          score_type: 'heuristic',
        };
      })
    );

    res.json({ data: enriched });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const data = await getCompanyById(id);
    if (!data) return res.status(404).json({ error: 'Company not found' });

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

export default router;
