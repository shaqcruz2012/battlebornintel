import pool from '../db/pool.js';
import { computeIRS } from '../engine/scoring.js';

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
 * Score all companies and return them with IRS data attached.
 */
export async function scoreAllCompanies() {
  const { sectorHeat, stageNorms } = await loadConstants();
  const { rows } = await pool.query(`SELECT * FROM companies`);

  return rows.map((row) => {
    const company = formatRow(row);
    const score = computeIRS(company, sectorHeat, stageNorms);
    return { ...company, ...score };
  });
}

/**
 * Score a single company by ID.
 */
export async function scoreCompany(companyId) {
  const { sectorHeat, stageNorms } = await loadConstants();
  const { rows } = await pool.query(`SELECT * FROM companies WHERE id = $1`, [companyId]);
  if (rows.length === 0) return null;

  const company = formatRow(rows[0]);
  const score = computeIRS(company, sectorHeat, stageNorms);
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
    for (const row of rows) {
      const company = formatRow(row);
      const { irs, grade, triggers, dims } = computeIRS(company, sectorHeat, stageNorms);
      await client.query(
        `INSERT INTO computed_scores (company_id, irs_score, grade, triggers, dims)
         VALUES ($1, $2, $3, $4, $5)`,
        [row.id, irs, grade, triggers, JSON.stringify(dims)]
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
