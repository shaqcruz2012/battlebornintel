import pool from '../pool.js';

/**
 * Get the latest scenario_results forecasts for a company from completed scenarios.
 * Returns rows for funding_m_forecast and employees_forecast metrics.
 */
export async function getCompanyForecasts(companyId) {
  const { rows } = await pool.query(
    `SELECT sr.metric_name, sr.value, sr.unit, sr.period,
            sr.confidence_lo, sr.confidence_hi, sr.scenario_id
     FROM scenario_results sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE sr.entity_type = 'company'
       AND sr.entity_id = $1
       AND s.status = 'complete'
       AND sr.metric_name IN ('funding_m_forecast', 'employees_forecast')
     ORDER BY s.created_at DESC, sr.period ASC`,
    [String(companyId)]
  );
  return rows;
}

/**
 * Get the latest causal evaluation analysis_results for a company.
 * Returns the content JSONB which includes ATT, spillover coefficients, etc.
 */
export async function getCompanyCausalData(companyId) {
  const { rows } = await pool.query(
    `SELECT id, content, model_used, created_at
     FROM analysis_results
     WHERE analysis_type = 'causal_evaluation'
       AND entity_type = 'company'
       AND entity_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [String(companyId)]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get the latest survival_probability from scenario_results for a company.
 */
export async function getCompanySurvival(companyId) {
  const { rows } = await pool.query(
    `SELECT sr.value, sr.confidence_lo, sr.confidence_hi, sr.period, sr.scenario_id
     FROM scenario_results sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE sr.entity_type = 'company'
       AND sr.entity_id = $1
       AND s.status = 'complete'
       AND sr.metric_name = 'survival_probability'
     ORDER BY s.created_at DESC, sr.period DESC
     LIMIT 1`,
    [String(companyId)]
  );
  return rows.length > 0 ? rows[0] : null;
}
