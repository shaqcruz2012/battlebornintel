import pool from '../pool.js';

/**
 * Get economic indicator time series with optional filters.
 * @param {Object} opts
 * @param {string[]} [opts.metric_names] - filter to specific metrics
 * @param {string}   [opts.entity_type]  - e.g. 'macro', 'region'
 * @param {Object}   [opts.date_range]   - { start, end } ISO date strings
 */
export async function getIndicators({ metric_names, entity_type, date_range } = {}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (metric_names && metric_names.length > 0) {
    conditions.push(`metric_name = ANY($${idx})`);
    params.push(metric_names);
    idx++;
  }

  if (entity_type) {
    conditions.push(`entity_type = $${idx}`);
    params.push(entity_type);
    idx++;
  }

  if (date_range?.start) {
    conditions.push(`period_start >= $${idx}`);
    params.push(date_range.start);
    idx++;
  }

  if (date_range?.end) {
    conditions.push(`period_start <= $${idx}`);
    params.push(date_range.end);
    idx++;
  }

  let sql = `SELECT * FROM economic_indicators_latest`;
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY metric_name, period_start DESC';

  const { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Get summary (latest + trend) for all economic indicators.
 */
export async function getIndicatorsSummary() {
  const { rows } = await pool.query(
    `SELECT * FROM economic_indicators_summary ORDER BY metric_name, entity_type, entity_id`
  );
  return rows;
}

/**
 * Get historical series for a specific metric and optional entity.
 * @param {string} metric_name
 * @param {string} [entity_id]
 * @param {number} [limit=100]
 */
export async function getIndicatorHistory(metric_name, entity_id, limit = 100) {
  const params = [metric_name];
  let sql = `SELECT * FROM economic_indicators_latest WHERE metric_name = $1`;

  if (entity_id) {
    sql += ` AND entity_id = $2`;
    params.push(entity_id);
  }

  sql += ` ORDER BY period_start DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Get indicators for a specific entity_type + entity_id, with optional date range.
 * @param {string} entity_type
 * @param {string} entity_id
 * @param {Object} [date_range] - { start, end } ISO date strings
 */
export async function getIndicatorsByEntity(entity_type, entity_id, date_range) {
  const conditions = ['entity_type = $1', 'entity_id = $2'];
  const params = [entity_type, entity_id];
  let idx = 3;

  if (date_range?.start) {
    conditions.push(`period_start >= $${idx}`);
    params.push(date_range.start);
    idx++;
  }

  if (date_range?.end) {
    conditions.push(`period_start <= $${idx}`);
    params.push(date_range.end);
    idx++;
  }

  const sql = `SELECT * FROM economic_indicators_latest
    WHERE ${conditions.join(' AND ')}
    ORDER BY metric_name, period_start DESC`;

  const { rows } = await pool.query(sql, params);
  return rows;
}

/**
 * Refresh the economic indicators materialized view.
 */
export async function refreshIndicators() {
  await pool.query('SELECT refresh_economic_indicators()');
}
