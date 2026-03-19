import pool from '../pool.js';

export async function getAllCompanies({ stage, region, sector, search, sortBy } = {}) {
  let sql = `
    SELECT c.*,
           cs.irs_score, cs.grade, cs.triggers, cs.dims
    FROM companies c
    LEFT JOIN LATERAL (
      SELECT irs_score, grade, triggers, dims
      FROM computed_scores
      WHERE company_id = c.id
      ORDER BY computed_at DESC
      LIMIT 1
    ) cs ON true
  `;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (stage && stage !== 'all') {
    const stageMap = {
      seed: ['pre_seed', 'seed'],
      early: ['series_a', 'series_b'],
      growth: ['series_c_plus', 'growth'],
    };
    const stages = stageMap[stage] || [stage];
    conditions.push(`c.stage = ANY($${idx})`);
    params.push(stages);
    idx++;
  }

  if (region && region !== 'all') {
    conditions.push(`c.region = $${idx}`);
    params.push(region);
    idx++;
  }

  if (sector && sector !== 'all') {
    conditions.push(`$${idx} = ANY(c.sectors)`);
    params.push(sector);
    idx++;
  }

  if (search) {
    conditions.push(
      `(c.name ILIKE $${idx} OR c.city ILIKE $${idx} OR EXISTS (SELECT 1 FROM unnest(c.sectors) s WHERE s ILIKE $${idx}))`
    );
    params.push(`%${search}%`);
    idx++;
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const orderMap = {
    irs: 'cs.irs_score DESC NULLS LAST',
    momentum: 'c.momentum DESC NULLS LAST',
    funding: 'c.funding_m DESC NULLS LAST',
    name: 'c.name ASC',
    employees: 'c.employees DESC NULLS LAST',
  };
  sql += ` ORDER BY ${orderMap[sortBy] || orderMap.irs}`;

  const { rows } = await pool.query(sql, params);
  return rows.map(formatCompany);
}

export async function getCompanyById(id) {
  const nodeId = `c_${id}`;

  // Run all three queries in parallel instead of sequentially
  const [companyResult, edgeResult, listingResult] = await Promise.all([
    pool.query(
      `WITH latest_scores AS (
         SELECT DISTINCT ON (company_id) company_id, irs_score, grade, triggers, dims
         FROM computed_scores
         WHERE company_id = $1
         ORDER BY company_id, computed_at DESC
       )
       SELECT c.*, cs.irs_score, cs.grade, cs.triggers, cs.dims
       FROM companies c
       LEFT JOIN latest_scores cs ON cs.company_id = c.id
       WHERE c.id = $1`,
      [id]
    ),
    pool.query(
      `SELECT * FROM graph_edges WHERE source_id = $1 OR target_id = $1`,
      [nodeId]
    ),
    pool.query(
      `SELECT * FROM listings WHERE company_id = $1`,
      [id]
    ),
  ]);

  if (companyResult.rows.length === 0) return null;

  const company = formatCompany(companyResult.rows[0]);
  company.edges = edgeResult.rows;
  company.listings = listingResult.rows;

  return company;
}

function formatCompany(row) {
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
    lat: row.lat ? parseFloat(row.lat) : null,
    lng: row.lng ? parseFloat(row.lng) : null,
    irs: row.irs_score || null,
    grade: row.grade || null,
    triggers: row.triggers || [],
    dims: row.dims || null,
  };
}
