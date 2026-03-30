import { Router } from 'express';
import { getEcosystemMap, getEcosystemGapsUnified, proposeIntervention } from '../db/queries/ecosystem.js';

const router = Router();

// GET /api/ecosystem/map?region=las_vegas — bubble chart data from entity_registry
router.get('/map', async (req, res, next) => {
  try {
    const { region } = req.query;
    let data = await getEcosystemMap();
    // Filter by region if specified
    if (region && region !== 'all') {
      const r = region.toLowerCase();
      data = data.filter((item) => {
        const itemRegion = (item.detail?.region || item.detail?.city || '').toLowerCase();
        return itemRegion.includes(r) || r.includes(itemRegion);
      });
    }
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /api/ecosystem/gaps?region=las_vegas — unified gap analysis with severity validation
router.get('/gaps', async (req, res, next) => {
  try {
    const region = req.query.region || null;
    const data = await getEcosystemGapsUnified(region);
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
