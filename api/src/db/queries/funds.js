import pool from '../pool.js';

export async function getAllFunds() {
  const { rows } = await pool.query(
    `SELECT * FROM funds ORDER BY deployed_m DESC`
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
    allocated: row.allocated_m ? parseFloat(row.allocated_m) : null,
    deployed: parseFloat(row.deployed_m),
    leverage: row.leverage ? parseFloat(row.leverage) : null,
    companies: row.company_count,
    thesis: row.thesis,
  };
}
