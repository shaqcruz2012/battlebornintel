import pool from '../pool.js';

/**
 * List scenarios with pagination, including result counts and model metadata.
 * @param {Object} [opts]
 * @param {number} [opts.page=1]   - 1-based page number
 * @param {number} [opts.limit=20] - rows per page (max 100 enforced by caller)
 * @returns {Promise<{rows: Object[], total: number}>}
 */
export async function listScenarios({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.description, s.base_period, s.status,
            s.assumptions, s.created_by, s.created_at, s.updated_at,
            m.name AS model_name,
            COUNT(sr.id)::int AS result_count
     FROM scenarios s
     LEFT JOIN models m ON m.id = s.model_id
     LEFT JOIN scenario_results sr ON sr.scenario_id = s.id
     GROUP BY s.id, m.name
     ORDER BY s.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM scenarios`
  );

  return { rows, total: countRows[0].total };
}

/**
 * Fetch a single scenario by ID, including all its result rows.
 * @param {number} id - scenario primary key
 * @returns {Promise<Object|null>} scenario object with embedded `results` array,
 *   or null if not found
 */
export async function getScenario(id) {
  const { rows: scenarioRows } = await pool.query(
    `SELECT s.*, m.name AS model_name, m.objective AS model_objective,
            m.input_variables, m.output_variables
     FROM scenarios s
     LEFT JOIN models m ON m.id = s.model_id
     WHERE s.id = $1`,
    [id]
  );
  if (!scenarioRows[0]) return null;

  const { rows: results } = await pool.query(
    `SELECT id, entity_type, entity_id, metric_name, value, unit,
            period, confidence_lo, confidence_hi, created_at
     FROM scenario_results
     WHERE scenario_id = $1
     ORDER BY entity_type, entity_id, metric_name, period`,
    [id]
  );

  return { ...scenarioRows[0], results };
}

/**
 * Get filtered result rows for a scenario.
 * @param {number} scenarioId - scenario primary key
 * @param {Object} [filters]
 * @param {string} [filters.entityType] - filter by entity_type (e.g. 'company')
 * @param {string} [filters.metricName] - filter by metric_name
 * @param {string} [filters.entityId]   - filter by entity_id
 * @returns {Promise<Object[]>}
 */
export async function getScenarioResults(scenarioId, { entityType, metricName, entityId } = {}) {
  const conditions = ['sr.scenario_id = $1'];
  const params = [scenarioId];
  let idx = 2;

  if (entityType) {
    conditions.push(`sr.entity_type = $${idx++}`);
    params.push(entityType);
  }
  if (metricName) {
    conditions.push(`sr.metric_name = $${idx++}`);
    params.push(metricName);
  }
  if (entityId) {
    conditions.push(`sr.entity_id = $${idx++}`);
    params.push(entityId);
  }

  const { rows } = await pool.query(
    `SELECT sr.id, sr.entity_type, sr.entity_id, sr.metric_name,
            sr.value, sr.unit, sr.period, sr.confidence_lo, sr.confidence_hi,
            sr.created_at
     FROM scenario_results sr
     WHERE ${conditions.join(' AND ')}
     ORDER BY sr.entity_type, sr.entity_id, sr.metric_name, sr.period`,
    params
  );
  return rows;
}

/**
 * Get the most recent forecast values for an entity across all completed scenarios.
 * Uses DISTINCT ON to return only the latest scenario result per (metric, period) pair.
 * @param {Object} opts
 * @param {string}   opts.entityType   - entity type (e.g. 'company')
 * @param {string}   opts.entityId     - entity identifier
 * @param {string[]} [opts.metricNames] - optional allowlist of metric names
 * @returns {Promise<Object[]>}
 */
export async function getLatestForecasts({ entityType, entityId, metricNames } = {}) {
  const conditions = [
    `sr.entity_type = $1`,
    `sr.entity_id = $2`,
    `s.status = 'complete'`,
  ];
  const params = [entityType, entityId];
  let idx = 3;

  if (metricNames && metricNames.length > 0) {
    conditions.push(`sr.metric_name = ANY($${idx++})`);
    params.push(metricNames);
  }

  const { rows } = await pool.query(
    `SELECT DISTINCT ON (sr.metric_name, sr.period)
            sr.metric_name, sr.value, sr.unit, sr.period,
            sr.confidence_lo, sr.confidence_hi,
            s.id AS scenario_id, s.name AS scenario_name
     FROM scenario_results sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY sr.metric_name, sr.period, s.created_at DESC`,
    params
  );
  return rows;
}

/**
 * Compare results for a specific metric across multiple scenarios.
 * @param {number[]} scenarioIds - array of scenario primary keys
 * @param {string}   metricName  - metric to compare (e.g. 'funding_m_simulated')
 * @returns {Promise<Object[]>} rows ordered by period then scenario_id
 */
export async function compareScenarios(scenarioIds, metricName) {
  const { rows } = await pool.query(
    `SELECT sr.scenario_id, s.name AS scenario_name,
            sr.entity_type, sr.entity_id, sr.metric_name,
            sr.value, sr.unit, sr.period,
            sr.confidence_lo, sr.confidence_hi
     FROM scenario_results sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE sr.scenario_id = ANY($1)
       AND sr.metric_name = $2
     ORDER BY sr.period, sr.scenario_id`,
    [scenarioIds, metricName]
  );
  return rows;
}

/**
 * List all registered models ordered by name.
 * @returns {Promise<Object[]>} model rows with input/output variable metadata
 */
export async function listModels() {
  const { rows } = await pool.query(
    `SELECT id, name, objective, input_variables, output_variables,
            version, is_active, created_at, updated_at
     FROM models
     ORDER BY name`
  );
  return rows;
}
