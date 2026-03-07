import pool from '../pool.js';

export async function getAllCompanies({ stage, region, sector, search, sortBy } = {}) {
  let sql = `
    SELECT c.*, cs.irs_score, cs.grade, cs.triggers, cs.dims
    FROM companies c
    LEFT JOIN computed_scores cs ON cs.company_id = c.id
      AND cs.computed_at = (SELECT MAX(computed_at) FROM computed_scores WHERE company_id = c.id)
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
    momentum: 'c.momentum DESC',
    funding: 'c.funding_m DESC',
    name: 'c.name ASC',
  };
  sql += ` ORDER BY ${orderMap[sortBy] || orderMap.irs}`;

  const { rows } = await pool.query(sql, params);
  return rows.map(formatCompany);
}

export async function getCompanyById(id) {
  const { rows } = await pool.query(
    `SELECT c.*, cs.irs_score, cs.grade, cs.triggers, cs.dims
     FROM companies c
     LEFT JOIN computed_scores cs ON cs.company_id = c.id
       AND cs.computed_at = (SELECT MAX(computed_at) FROM computed_scores WHERE company_id = c.id)
     WHERE c.id = $1`,
    [id]
  );
  if (rows.length === 0) return null;

  const company = formatCompany(rows[0]);

  // Get edges
  const nodeId = `c_${id}`;
  const { rows: edges } = await pool.query(
    `SELECT * FROM graph_edges WHERE source_id = $1 OR target_id = $1`,
    [nodeId]
  );
  company.edges = edges;

  // Get listings
  const { rows: listings } = await pool.query(
    `SELECT * FROM listings WHERE company_id = $1`,
    [id]
  );
  company.listings = listings;

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
