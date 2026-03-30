import { Router } from 'express';
import { getFeatureRegistry, getDataCompleteness, ingestFeatures, getIngestionLog } from '../db/queries/feature-ingestion.js';
import { ValidationError } from '../errors.js';
import { logger } from '../logger.js';

const router = Router();

/**
 * GET /api/features/registry
 * List registered features, optional ?entityType filter.
 */
router.get('/registry', async (req, res, next) => {
  try {
    const { entityType } = req.query;
    const data = await getFeatureRegistry(entityType);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/features/completeness
 * Data completeness report, optional ?entityType and ?limit.
 */
router.get('/completeness', async (req, res, next) => {
  try {
    const { entityType } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 1000);
    const data = await getDataCompleteness(entityType, limit);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/features/ingest
 * Bulk ingest features. Expects JSON body with `features` array.
 * Each item must have: entity_type, entity_id, feature_name, value, source, confidence, agent_id.
 */
router.post('/ingest', async (req, res, next) => {
  try {
    const { features } = req.body;

    if (!Array.isArray(features) || features.length === 0) {
      throw new ValidationError('Request body must contain a non-empty "features" array');
    }

    if (features.length > 1000) {
      throw new ValidationError('Maximum 1000 features per request');
    }

    const requiredFields = ['entity_type', 'entity_id', 'feature_name', 'value', 'source', 'confidence', 'agent_id'];
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      for (const field of requiredFields) {
        if (f[field] === undefined || f[field] === null) {
          throw new ValidationError(`Feature at index ${i} is missing required field "${field}"`);
        }
      }
    }

    logger.info(`[feature-ingestion] Bulk ingest request: ${features.length} features from ${req.ip}`);
    const count = await ingestFeatures(features);
    res.json({ data: { ingested: count, total: features.length }, message: 'Feature ingestion complete' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/features/log
 * Ingestion audit log, optional ?limit and ?entityType.
 */
router.get('/log', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
    const { entityType } = req.query;
    const data = await getIngestionLog(limit, entityType);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
