import { Router } from 'express';
import { getEcosystemMap, getEcosystemGapsUnified, proposeIntervention } from '../db/queries/ecosystem.js';

const router = Router();

// GET /api/ecosystem/map — bubble chart data from entity_registry
router.get('/map', async (req, res, next) => {
  try {
    const data = await getEcosystemMap();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/ecosystem/gaps — unified gap analysis with severity validation
router.get('/gaps', async (req, res, next) => {
  try {
    const data = await getEcosystemGapsUnified();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// POST /api/ecosystem/interventions — propose a bridge for a gap
router.post('/interventions', async (req, res, next) => {
  try {
    const { gapType, gapName, bridgeId, communityA, communityB, proposedBy, notes } = req.body;
    if (!gapName) return res.status(400).json({ error: 'gapName is required' });
    const result = await proposeIntervention({ gapType, gapName, bridgeId, communityA, communityB, proposedBy, notes });
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
