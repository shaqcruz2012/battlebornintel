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

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/** Return true if n is a safe positive integer (> 0, not NaN). */
function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}

/** Return true if the string is a valid ISO 8601 date (YYYY-MM-DD). */
function isISODate(str) {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const pageRaw = parseInt(req.query.page || '1', 10);
    const limitRaw = parseInt(req.query.limit || '20', 10);

    if (!isPosInt(pageRaw)) {
      return res.status(400).json({ error: 'page must be a positive integer' });
    }
    if (!isPosInt(limitRaw)) {
      return res.status(400).json({ error: 'limit must be a positive integer' });
    }

    const page = pageRaw;
    const limit = Math.min(100, limitRaw);
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
    if (!metric.trim()) {
      return res.status(400).json({ error: 'metric must be a non-empty string' });
    }

    const ids = idsParam.split(',').map((s) => parseInt(s.trim(), 10));
    if (ids.some((n) => !isPosInt(n))) {
      return res.status(400).json({ error: 'ids must be comma-separated positive integers' });
    }

    const data = await compareScenarios(ids, metric.trim());
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/forecasts/:entityType/:entityId', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityType.trim()) {
      return res.status(400).json({ error: 'entityType must be a non-empty string' });
    }
    if (!entityId || !entityId.trim()) {
      return res.status(400).json({ error: 'entityId must be a non-empty string' });
    }

    const metricNames = req.query.metrics
      ? req.query.metrics.split(',').map((m) => m.trim()).filter(Boolean)
      : undefined;

    const data = await getLatestForecasts({ entityType, entityId, metricNames });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!isPosInt(id)) return res.status(400).json({ error: 'id must be a positive integer' });
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
    if (!isPosInt(id)) return res.status(400).json({ error: 'id must be a positive integer' });

    const { metric } = req.query;
    if (metric !== undefined && !metric.trim()) {
      return res.status(400).json({ error: 'metric must be a non-empty string when provided' });
    }

    const filters = {
      entityType: req.query.entity_type,
      metricName: metric ? metric.trim() : undefined,
      entityId: req.query.entity_id,
    };
    const data = await getScenarioResults(id, filters);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
