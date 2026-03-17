import pool from '../pool.js';

export async function getAllFunds() {
  const { rows } = await pool.query(
    `SELECT f.*,
       (SELECT COUNT(*) FROM companies c WHERE f.id = ANY(c.eligible)) AS live_company_count
     FROM funds f
     ORDER BY f.deployed_m DESC NULLS LAST`
  );
  return rows.map(formatFund);
}

export async function getFundById(id) {
  const { rows } = await pool.query(`SELECT * FROM funds WHERE id = $1`, [id]);
  if (rows.length === 0) return null;

  const fund = formatFund(rows[0]);

  // Get portfolio companies (those with this fund in their eligible array)
  const { rows: companies } = await pool.query(
    `SELECT c.*, cs.irs_score, cs.grade
     FROM companies c
     LEFT JOIN computed_scores cs ON cs.company_id = c.id
       AND cs.computed_at = (SELECT MAX(computed_at) FROM computed_scores WHERE company_id = c.id)
     WHERE $1 = ANY(c.eligible)
     ORDER BY c.funding_m DESC`,
    [id]
  );
  fund.portfolio = companies.map((r) => ({
    id: r.id,
    name: r.name,
    stage: r.stage,
    funding: parseFloat(r.funding_m),
    momentum: r.momentum,
    irs: r.irs_score,
    grade: r.grade,
  }));

  return fund;
}

function formatFund(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.fund_type,
    allocated: row.allocated_m != null ? parseFloat(row.allocated_m) : null,
    deployed: row.deployed_m != null ? parseFloat(row.deployed_m) : null,
    leverage: row.leverage != null ? parseFloat(row.leverage) : null,
    companies: parseInt(row.live_company_count ?? row.company_count, 10) || 0,
    thesis: row.thesis,
  };
}
