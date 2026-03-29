import pool from '../pool.js';

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

export async function listModels() {
  const { rows } = await pool.query(
    `SELECT id, name, objective, input_variables, output_variables,
            version, is_active, created_at, updated_at
     FROM models
     ORDER BY name`
  );
  return rows;
}
