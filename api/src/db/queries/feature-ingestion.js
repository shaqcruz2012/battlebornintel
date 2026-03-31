import pool from '../pool.js';
import { logger } from '../../logger.js';

/**
 * Returns registered features for an entity type from the feature_registry table.
 */
export async function getFeatureRegistry(entityType) {
  const params = [];
  let where = '';
  if (entityType) {
    params.push(entityType);
    where = 'WHERE entity_type = $1';
  }
  const result = await pool.query(
    `SELECT feature_name, entity_type, data_type, description, source, is_active, created_at
     FROM feature_registry
     ${where}
     ORDER BY entity_type, feature_name`,
    params
  );
  return result.rows;
}

/**
 * Returns data completeness report from the node_data_completeness materialized view.
 */
export async function getDataCompleteness(entityType, limit = 100) {
  const params = [];
  let where = '';
  if (entityType) {
    params.push(entityType);
    where = 'WHERE entity_type = $1';
  }
  params.push(limit);
  const result = await pool.query(
    `SELECT *
     FROM node_data_completeness
     ${where}
     ORDER BY completeness_pct ASC
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

/**
 * Bulk ingest features. Each feature object must contain:
 *   { entity_type, entity_id, feature_name, value, source, confidence, agent_id }
 *
 * For each feature:
 *   1. Log to feature_ingestion_log
 *   2. If entity_type is 'company', update the companies table column matching feature_name
 *   3. If entity_type is 'metric', insert into metric_snapshots
 *
 * Returns count of successful ingestions.
 */
export async function ingestFeatures(features) {
  const client = await pool.connect();
  let successCount = 0;

  try {
    await client.query('BEGIN');

    for (const f of features) {
      try {
        // 1. Log to feature_ingestion_log
        await client.query(
          `INSERT INTO feature_ingestion_log
             (entity_type, entity_id, feature_name, value, source, confidence, agent_id, ingested_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [f.entity_type, f.entity_id, f.feature_name, f.value, f.source, f.confidence, f.agent_id]
        );

        // 2. If entity_type is 'company', update the companies table column
        if (f.entity_type === 'company') {
          // Use a parameterised column name via a whitelist approach:
          // only update columns that actually exist on companies.
          const allowedColumns = [
            'stage', 'employees', 'funding_m', 'momentum', 'city',
            'region', 'status', 'eligible', 'founded', 'sectors',
          ];
          if (allowedColumns.includes(f.feature_name)) {
            await client.query(
              `UPDATE companies SET ${f.feature_name} = $1 WHERE id = $2`,
              [f.value, f.entity_id]
            );
          } else {
            logger.warn(`[feature-ingestion] Skipping unknown company column: ${f.feature_name}`);
          }
        }

        // 3. If entity_type is 'metric', insert into metric_snapshots
        if (f.entity_type === 'metric') {
          await client.query(
            `INSERT INTO metric_snapshots
               (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, agent_id)
             VALUES ('metric', $1, $2, $3, NULL, NOW(), NOW(), 'point', $4, $5)
             ON CONFLICT DO NOTHING`,
            [f.entity_id, f.feature_name, f.value, f.confidence, f.agent_id]
          );
        }

        successCount++;
      } catch (err) {
        logger.error(`[feature-ingestion] Failed to ingest feature ${f.feature_name} for ${f.entity_type}/${f.entity_id}: ${err.message}`);
        // Continue processing remaining features
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  logger.info(`[feature-ingestion] Ingested ${successCount}/${features.length} features`);
  return successCount;
}

/**
 * Returns recent ingestion log entries, optionally filtered by entity type.
 */
export async function getIngestionLog(limit = 50, entityType) {
  const params = [];
  let where = '';
  if (entityType) {
    params.push(entityType);
    where = 'WHERE entity_type = $1';
  }
  params.push(limit);
  const result = await pool.query(
    `SELECT id, entity_type, entity_id, feature_name, value, source, confidence, agent_id, ingested_at
     FROM feature_ingestion_log
     ${where}
     ORDER BY ingested_at DESC
     LIMIT $${params.length}`,
    params
  );
  return result.rows;
}
