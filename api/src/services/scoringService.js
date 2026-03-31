import pool from '../db/pool.js';
import { computeIRS, computeForwardScore } from '../engine/scoring.js';

/**
 * Load constants (sector heat + stage norms) from DB.
 */
async function loadConstants() {
  const { rows } = await pool.query(
    `SELECT key, value FROM constants WHERE key IN ('sector_heat', 'stage_norms')`
  );
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    sectorHeat: map.sector_heat || {},
    stageNorms: map.stage_norms || {},
  };
}

/**
 * Safely compute forward score for a company.
 * Returns null on any failure so heuristic-only scoring still works.
 */
async function safeForwardScore(companyId) {
  try {
    return await computeForwardScore(companyId);
  } catch {
    return null;
  }
}

/**
 * Score all companies and return them with IRS data attached.
 */
export async function scoreAllCompanies() {
  const { sectorHeat, stageNorms } = await loadConstants();
  const { rows } = await pool.query(`SELECT * FROM companies`);

  const results = await Promise.all(
    rows.map(async (row) => {
      const company = formatRow(row);
      const forwardData = await safeForwardScore(row.id);
      const score = computeIRS(company, sectorHeat, stageNorms, forwardData);
      return { ...company, ...score };
    })
  );

  return results;
}

/**
 * Score a single company by ID.
 */
export async function scoreCompany(companyId) {
  const { sectorHeat, stageNorms } = await loadConstants();
  const { rows } = await pool.query(`SELECT * FROM companies WHERE id = $1`, [companyId]);
  if (rows.length === 0) return null;

  const company = formatRow(rows[0]);
  const forwardData = await safeForwardScore(companyId);
  const score = computeIRS(company, sectorHeat, stageNorms, forwardData);
  return { ...company, ...score };
}

/**
 * Recompute and cache IRS scores for all companies.
 */
export async function recomputeAllScores() {
  const { sectorHeat, stageNorms } = await loadConstants();
  const { rows } = await pool.query(`SELECT * FROM companies`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM computed_scores');
    for (const row of rows) {
      const company = formatRow(row);
      const forwardData = await safeForwardScore(row.id);
      const { irs, grade, triggers, dims, forward_score, forward_components, score_type } =
        computeIRS(company, sectorHeat, stageNorms, forwardData);
      await client.query(
        `INSERT INTO computed_scores
           (company_id, irs_score, grade, triggers, dims, forward_score, forward_components, score_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          row.id, irs, grade, triggers, JSON.stringify(dims),
          forward_score, forward_components ? JSON.stringify(forward_components) : null,
          score_type,
        ]
      );
    }
    await client.query('COMMIT');
    return rows.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function formatRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    stage: row.stage,
    sector: row.sectors,
    city: row.city,
    region: row.region,
    funding: parseFloat(row.funding_m),
    momentum: row.momentum,
    employees: row.employees,
    founded: row.founded,
    description: row.description,
    eligible: row.eligible,
  };
}
