import pool from '../pool.js';

export async function getCompanyAnalysis(companyId) {
  const { rows } = await pool.query(
    `SELECT * FROM analysis_results
     WHERE entity_type = 'company' AND entity_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [`c_${companyId}`]
  );
  return rows[0] || null;
}

export async function getWeeklyBrief() {
  const { rows } = await pool.query(
    `SELECT * FROM analysis_results
     WHERE analysis_type = 'weekly_brief'
     ORDER BY created_at DESC LIMIT 1`
  );
  return rows[0] || null;
}

export async function getRiskAssessments() {
  const { rows } = await pool.query(
    `SELECT * FROM analysis_results
     WHERE analysis_type = 'risk_assessment'
     ORDER BY created_at DESC LIMIT 10`
  );
  return rows;
}
