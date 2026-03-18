import pool from '../pool.js';

/**
 * Get all investors — Nevada-based funds + out-of-state externals with invested_in edges.
 */
export async function getAllInvestors() {
  // Section 1: Nevada-based funds (from funds table)
  const { rows: funds } = await pool.query(`
    SELECT f.id, f.name, f.fund_type AS type, f.allocated_m, f.deployed_m,
           f.company_count, f.thesis, f.check_size_min_m, f.check_size_max_m,
           f.vintage_year
    FROM funds f
    ORDER BY f.deployed_m DESC NULLS LAST
  `);

  // Section 2: External investors with invested_in edges (out-of-state + NV i_ nodes)
  const { rows: externals } = await pool.query(`
    SELECT e.id, e.name, e.entity_type AS type, e.note,
           COUNT(DISTINCT ge.target_id) AS portfolio_size,
           ARRAY_AGG(DISTINCT ge.target_id ORDER BY ge.target_id) AS portfolio_ids
    FROM externals e
    INNER JOIN graph_edges ge ON ge.source_id = e.id AND ge.rel = 'invested_in'
    WHERE e.id LIKE 'i_%'
    GROUP BY e.id, e.name, e.entity_type, e.note
    ORDER BY COUNT(DISTINCT ge.target_id) DESC, e.name
  `);

  // Enrich externals with company names
  const allCompanyIds = [...new Set(externals.flatMap(e => e.portfolio_ids || []))];
  let companyMap = {};
  if (allCompanyIds.length > 0) {
    const { rows: companies } = await pool.query(
      `SELECT 'c_' || id AS cid, id, name, stage, funding_m FROM companies WHERE 'c_' || id = ANY($1::text[])`,
      [allCompanyIds]
    );
    for (const c of companies) {
      companyMap[c.cid] = { id: c.id, name: c.name, stage: c.stage, funding: c.funding_m ? parseFloat(c.funding_m) : null };
    }
  }

  const externalInvestors = externals.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    note: e.note,
    portfolioSize: parseInt(e.portfolio_size, 10),
    portfolio: (e.portfolio_ids || []).map(pid => companyMap[pid]).filter(Boolean),
  }));

  return {
    nvFunds: funds.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      allocated: f.allocated_m != null ? parseFloat(f.allocated_m) : null,
      deployed: f.deployed_m != null ? parseFloat(f.deployed_m) : null,
      companies: parseInt(f.company_count, 10) || 0,
      thesis: f.thesis,
      checkSizeMin: f.check_size_min_m != null ? parseFloat(f.check_size_min_m) : null,
      checkSizeMax: f.check_size_max_m != null ? parseFloat(f.check_size_max_m) : null,
      vintageYear: f.vintage_year,
    })),
    externalInvestors,
  };
}

/**
 * Get a single investor by ID — works for both fund IDs and external i_ IDs.
 */
export async function getInvestorById(id) {
  // Try funds table first
  const { rows: fundRows } = await pool.query(`SELECT * FROM funds WHERE id = $1`, [id]);
  if (fundRows.length > 0) {
    const f = fundRows[0];
    // Get portfolio companies via eligible array
    const { rows: portfolio } = await pool.query(
      `SELECT c.id, c.name, c.stage, c.funding_m, cs.irs_score, cs.grade
       FROM companies c
       LEFT JOIN computed_scores cs ON cs.company_id = c.id
         AND cs.computed_at = (SELECT MAX(computed_at) FROM computed_scores WHERE company_id = c.id)
       WHERE $1 = ANY(c.eligible)
       ORDER BY c.funding_m DESC`,
      [id]
    );
    return {
      id: f.id,
      name: f.name,
      type: f.fund_type,
      source: 'fund',
      allocated: f.allocated_m != null ? parseFloat(f.allocated_m) : null,
      deployed: f.deployed_m != null ? parseFloat(f.deployed_m) : null,
      thesis: f.thesis,
      portfolio: portfolio.map(c => ({
        id: c.id, name: c.name, stage: c.stage,
        funding: c.funding_m ? parseFloat(c.funding_m) : null,
        irs: c.irs_score, grade: c.grade,
      })),
    };
  }

  // Try externals table
  const { rows: extRows } = await pool.query(`SELECT * FROM externals WHERE id = $1`, [id]);
  if (extRows.length === 0) return null;
  const e = extRows[0];

  const { rows: edges } = await pool.query(
    `SELECT ge.target_id, ge.note, ge.event_year, c.name AS company_name, c.stage, c.funding_m
     FROM graph_edges ge
     LEFT JOIN companies c ON 'c_' || c.id = ge.target_id
     WHERE ge.source_id = $1 AND ge.rel = 'invested_in'
     ORDER BY ge.event_year DESC NULLS LAST`,
    [id]
  );

  return {
    id: e.id,
    name: e.name,
    type: e.entity_type,
    source: 'external',
    note: e.note,
    portfolio: edges.map(ed => ({
      id: ed.target_id,
      name: ed.company_name || ed.target_id,
      stage: ed.stage,
      funding: ed.funding_m ? parseFloat(ed.funding_m) : null,
      note: ed.note,
      year: ed.event_year,
    })),
  };
}

/**
 * Aggregate investor stats for the KPI strip.
 */
export async function getInvestorStats() {
  const { rows: [fundStats] } = await pool.query(`
    SELECT
      COUNT(*) AS total_nv_funds,
      COALESCE(SUM(deployed_m), 0) AS total_deployed,
      COALESCE(SUM(allocated_m), 0) AS total_allocated
    FROM funds
  `);

  const { rows: [extStats] } = await pool.query(`
    SELECT COUNT(DISTINCT e.id) AS total_external_investors
    FROM externals e
    INNER JOIN graph_edges ge ON ge.source_id = e.id AND ge.rel = 'invested_in'
    WHERE e.id LIKE 'i_%'
  `);

  // Breakdown by investor type
  const { rows: typeBreakdown } = await pool.query(`
    SELECT e.entity_type AS type, COUNT(DISTINCT e.id) AS count
    FROM externals e
    INNER JOIN graph_edges ge ON ge.source_id = e.id AND ge.rel = 'invested_in'
    WHERE e.id LIKE 'i_%'
    GROUP BY e.entity_type
    ORDER BY count DESC
  `);

  const totalUniqueInvestors = parseInt(fundStats.total_nv_funds, 10) +
    parseInt(extStats.total_external_investors, 10);

  return {
    totalUniqueInvestors,
    totalNvFunds: parseInt(fundStats.total_nv_funds, 10),
    totalExternalInvestors: parseInt(extStats.total_external_investors, 10),
    totalDeployed: parseFloat(fundStats.total_deployed),
    totalAllocated: parseFloat(fundStats.total_allocated),
    typeBreakdown: typeBreakdown.map(t => ({
      type: t.type,
      count: parseInt(t.count, 10),
    })),
  };
}
