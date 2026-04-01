import pool from '../pool.js';
import { regionCondition } from '../../utils/regionMapping.js';

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

export async function getRiskAssessments({ region } = {}) {
  if (region && region !== 'all') {
    const rc = regionCondition(region, 'c.region', 1);
    if (rc.condition) {
      const { rows } = await pool.query(
        `SELECT ar.* FROM analysis_results ar
         JOIN companies c ON ar.entity_type = 'company' AND ar.entity_id = 'c_' || c.id
         WHERE ar.analysis_type = 'risk_assessment'
           AND ${rc.condition}
         ORDER BY ar.created_at DESC LIMIT 10`,
        rc.params
      );
      return rows;
    }
  }
  const { rows } = await pool.query(
    `SELECT * FROM analysis_results
     WHERE analysis_type = 'risk_assessment'
     ORDER BY created_at DESC LIMIT 10`
  );
  return rows;
}
