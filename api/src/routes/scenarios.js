import { Router } from 'express';
import {
  listScenarios,
  getScenario,
  getScenarioResults,
  getLatestForecasts,
  compareScenarios,
  listModels,
} from '../db/queries/scenarios.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const { rows, total } = await listScenarios({ page, limit });
    res.json({ data: rows, meta: { page, limit, total } });
  } catch (err) {
    next(err);
  }
});

router.get('/models', async (req, res, next) => {
  try {
    const data = await listModels();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/compare', async (req, res, next) => {
  try {
    const idsParam = req.query.ids;
    const metric = req.query.metric;
    if (!idsParam || !metric) {
      return res.status(400).json({ error: 'ids and metric query params are required' });
    }
    const ids = idsParam.split(',').map((s) => parseInt(s.trim(), 10));
    if (ids.some(isNaN)) {
      return res.status(400).json({ error: 'ids must be comma-separated integers' });
    }
    const data = await compareScenarios(ids, metric);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/forecasts/:entityType/:entityId', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const metricNames = req.query.metrics ? req.query.metrics.split(',') : undefined;
    const data = await getLatestForecasts({ entityType, entityId, metricNames });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const data = await getScenario(id);
    if (!data) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/results', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const filters = {
      entityType: req.query.entity_type,
      metricName: req.query.metric,
      entityId: req.query.entity_id,
    };
    const data = await getScenarioResults(id, filters);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
