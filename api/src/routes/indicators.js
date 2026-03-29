import { Router } from 'express';
import {
  getIndicators,
  getIndicatorsSummary,
  getIndicatorHistory,
  getIndicatorsByEntity,
} from '../db/queries/indicators.js';

const router = Router();

// GET / -- summary of all indicators (latest + trend)
router.get('/', async (req, res, next) => {
  try {
    const data = await getIndicatorsSummary();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /history/:metric -- time series for a specific indicator
router.get('/history/:metric', async (req, res, next) => {
  try {
    const { metric } = req.params;
    const { entity_id, limit } = req.query;
    const data = await getIndicatorHistory(
      metric,
      entity_id || null,
      limit ? parseInt(limit, 10) : 100,
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /macro -- all macro indicators (entity_type='macro')
router.get('/macro', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const date_range = (start || end) ? { start, end } : undefined;
    const data = await getIndicators({ entity_type: 'macro', date_range });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// GET /regional/:region -- indicators for a specific region
router.get('/regional/:region', async (req, res, next) => {
  try {
    const { region } = req.params;
    const { start, end } = req.query;
    const date_range = (start || end) ? { start, end } : undefined;
    const data = await getIndicatorsByEntity('region', region, date_range);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
