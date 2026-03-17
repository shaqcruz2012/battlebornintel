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

export async function getWeeklyBrief({ weekStart, weekEnd } = {}) {
  const params = [];
  let idx = 1;
  let where = `WHERE analysis_type = 'weekly_brief'`;

  if (weekStart) {
    where += ` AND DATE(created_at) >= $${idx}::date`;
    params.push(weekStart);
    idx++;
  }

  if (weekEnd) {
    where += ` AND DATE(created_at) <= $${idx}::date`;
    params.push(weekEnd);
    idx++;
  }

  const { rows } = await pool.query(
    `SELECT * FROM analysis_results ${where} ORDER BY created_at DESC LIMIT 1`,
    params
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
