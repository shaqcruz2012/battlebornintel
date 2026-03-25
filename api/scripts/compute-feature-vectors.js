/**
 * compute-feature-vectors.js
 *
 * Computes 32-dim node feature vectors and 31-dim edge feature vectors
 * for T-GNN training. Stores results in node_features and edge_features tables.
 *
 * Usage: node scripts/compute-feature-vectors.js
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433', 10),
  user: process.env.PGUSER || 'bbi',
  password: process.env.PGPASSWORD || 'bbi_dev_password',
  database: process.env.PGDATABASE || 'battlebornintel',
});

// ── Constants ────────────────────────────────────────────────────────────────

const FEATURE_VERSION = 1;

const NODE_FEATURE_NAMES = [
  'type_company', 'type_fund', 'type_person', 'type_program',
  'type_accelerator', 'type_ecosystem', 'type_external',
  'stage_preseed', 'stage_seed', 'stage_a', 'stage_b',
  'stage_c', 'stage_growth', 'stage_public',
  'region_lv', 'region_reno', 'region_henderson', 'region_other', 'region_unknown',
  'funding_log', 'employees_log', 'momentum_norm', 'confidence', 'verified',
  'degree', 'pagerank', 'age_norm',
  'pad1', 'pad2', 'pad3', 'pad4', 'pad5',
];

const ENTITY_TYPES = ['company', 'fund', 'person', 'program', 'accelerator', 'ecosystem_org', 'external'];
const STAGES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'public'];
const REGIONS = ['las_vegas', 'reno', 'henderson', 'other', 'unknown'];

// Top 15 relationship types for edge one-hot encoding
const TOP_RELS = [
  'fund_opportunity', 'invested_in', 'partners_with', 'accelerated_by',
  'funds', 'supports', 'contracts_with', 'manages', 'housed_at',
  'spinout_of', 'acquired', 'collaborated_with', 'acquired_by',
  'program_of', 'backed_by_founders_of',
];

const IMPACT_TYPES = ['capital_flow', 'market_access', 'knowledge_transfer', 'talent_flow', 'infrastructure', 'governance'];
const EDGE_CATEGORIES = ['historical', 'opportunity', 'projected'];
const DATA_QUALITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];

const EDGE_FEATURE_NAMES = [
  ...TOP_RELS.map(r => `rel_${r}`),
  ...IMPACT_TYPES.map(t => `impact_${t}`),
  ...EDGE_CATEGORIES.map(c => `cat_${c}`),
  'confidence', 'weight',
  ...DATA_QUALITY_LEVELS.map(q => `dq_${q}`),
  'bidirectional', 'time_delta',
];

// ── Helper functions ─────────────────────────────────────────────────────────

function oneHot(categories, value) {
  return categories.map(c => (c === value ? 1.0 : 0.0));
}

function logNorm(value, maxVal) {
  if (!value || value <= 0) return 0.0;
  if (!maxVal || maxVal <= 0) return 0.0;
  return Math.log1p(value) / Math.log1p(maxVal);
}

function clamp01(v) {
  if (v == null || isNaN(v)) return 0.0;
  return Math.max(0.0, Math.min(1.0, v));
}

// ── Node feature computation ─────────────────────────────────────────────────

async function computeNodeFeatures() {
  console.log('Computing node feature vectors...');

  // 1. Fetch all entities
  const { rows: entities } = await pool.query(
    `SELECT canonical_id, entity_type, confidence, verified, valid_from
     FROM entity_registry`
  );

  // 2. Fetch company data keyed by canonical_id
  const { rows: companyRows } = await pool.query(
    `SELECT er.canonical_id, c.stage, c.region, c.funding_m, c.employees, c.momentum, c.founded
     FROM entity_registry er
     JOIN companies c ON c.id = CAST(er.source_table_id AS INTEGER)
     WHERE er.entity_type = 'company' AND er.source_table = 'companies'`
  );
  const companyMap = new Map();
  for (const row of companyRows) {
    companyMap.set(row.canonical_id, row);
  }

  // 3. Compute degree centrality (edge count per node)
  const { rows: degreeCounts } = await pool.query(
    `SELECT node_id, COUNT(*) AS degree FROM (
       SELECT source_id AS node_id FROM graph_edges
       UNION ALL
       SELECT target_id AS node_id FROM graph_edges
     ) sub GROUP BY node_id`
  );
  const degreeMap = new Map();
  let maxDegree = 1;
  for (const row of degreeCounts) {
    const d = parseInt(row.degree, 10);
    degreeMap.set(row.node_id, d);
    if (d > maxDegree) maxDegree = d;
  }

  // 4. Fetch pagerank from graph_metrics_cache
  const { rows: prRows } = await pool.query(
    `SELECT node_id, pagerank FROM graph_metrics_cache`
  );
  const pagerankMap = new Map();
  let maxPagerank = 1;
  for (const row of prRows) {
    const pr = parseFloat(row.pagerank);
    pagerankMap.set(row.node_id, pr);
    if (pr > maxPagerank) maxPagerank = pr;
  }

  // 5. Find max values for normalization
  const { rows: [maxVals] } = await pool.query(
    `SELECT MAX(funding_m) AS max_funding, MAX(employees) AS max_employees FROM companies`
  );
  const maxFunding = parseFloat(maxVals.max_funding) || 1;
  const maxEmployees = parseInt(maxVals.max_employees, 10) || 1;

  // Current year for age calculation
  const currentYear = new Date().getFullYear();
  const maxAge = 50; // normalize age against 50 years

  // 6. Compute vectors
  const vectors = [];
  for (const entity of entities) {
    const { canonical_id, entity_type, confidence, verified, valid_from } = entity;
    const company = companyMap.get(canonical_id);

    // Entity type one-hot (7 dims)
    const typeVec = oneHot(ENTITY_TYPES, entity_type);

    // Stage one-hot (7 dims) - only for companies
    const stage = company ? company.stage : null;
    const stageVec = oneHot(STAGES, stage);

    // Region one-hot (5 dims) - only for companies
    const region = company ? (company.region || 'unknown') : 'unknown';
    const regionVec = oneHot(REGIONS, region);

    // Numeric features (8 dims)
    const fundingLog = company ? logNorm(parseFloat(company.funding_m) || 0, maxFunding) : 0.0;
    const employeesLog = company ? logNorm(parseInt(company.employees, 10) || 0, maxEmployees) : 0.0;
    const momentumNorm = company ? clamp01((parseInt(company.momentum, 10) || 0) / 100) : 0.0;
    const conf = clamp01(parseFloat(confidence) || 0);
    const ver = verified ? 1.0 : 0.0;

    const degree = degreeMap.get(canonical_id) || 0;
    const degreeCentrality = clamp01(degree / maxDegree);

    const pr = pagerankMap.get(canonical_id) || 0;
    const pagerankNorm = clamp01(pr / maxPagerank);

    // Age: use company founded year, or entity valid_from
    let ageYears = 0;
    if (company && company.founded) {
      ageYears = currentYear - parseInt(company.founded, 10);
    } else if (valid_from) {
      ageYears = (Date.now() - new Date(valid_from).getTime()) / (365.25 * 24 * 3600 * 1000);
    }
    const ageNorm = clamp01(Math.max(0, ageYears) / maxAge);

    const numericVec = [fundingLog, employeesLog, momentumNorm, conf, ver, degreeCentrality, pagerankNorm, ageNorm];

    // Padding (5 dims)
    const padVec = [0.0, 0.0, 0.0, 0.0, 0.0];

    const featureVector = [...typeVec, ...stageVec, ...regionVec, ...numericVec, ...padVec];
    vectors.push({ canonical_id, featureVector });
  }

  // 7. Batch upsert into node_features
  console.log(`Upserting ${vectors.length} node feature vectors...`);
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const { canonical_id, featureVector } of batch) {
      values.push(`($${paramIdx}, $${paramIdx + 1}::FLOAT8[], $${paramIdx + 2}::TEXT[], NOW(), $${paramIdx + 3})`);
      params.push(canonical_id, featureVector, NODE_FEATURE_NAMES, FEATURE_VERSION);
      paramIdx += 4;
    }

    await pool.query(
      `INSERT INTO node_features (canonical_id, feature_vector, feature_names, computed_at, version)
       VALUES ${values.join(', ')}
       ON CONFLICT (canonical_id)
       DO UPDATE SET feature_vector = EXCLUDED.feature_vector,
                     feature_names = EXCLUDED.feature_names,
                     computed_at = EXCLUDED.computed_at,
                     version = EXCLUDED.version`,
      params
    );
  }

  console.log(`Node features computed: ${vectors.length} entities`);
  return vectors.length;
}

// ── Edge feature computation ─────────────────────────────────────────────────

async function computeEdgeFeatures() {
  console.log('Computing edge feature vectors...');

  // 1. Fetch all edges
  const { rows: edges } = await pool.query(
    `SELECT id, rel, impact_type, edge_category, confidence, weight,
            data_quality, bidirectional, event_date, valid_from
     FROM graph_edges`
  );

  // Find the time range for normalization
  let minTime = Infinity;
  let maxTime = -Infinity;
  const now = Date.now();
  for (const edge of edges) {
    const t = edge.event_date ? new Date(edge.event_date).getTime()
            : edge.valid_from ? new Date(edge.valid_from).getTime()
            : null;
    if (t !== null && !isNaN(t)) {
      if (t < minTime) minTime = t;
      if (t > maxTime) maxTime = t;
    }
  }
  const timeRange = maxTime > minTime ? (maxTime - minTime) : 1;

  // 2. Compute feature vectors
  const vectors = [];
  for (const edge of edges) {
    const {
      id, rel, impact_type, edge_category,
      confidence, weight, data_quality, bidirectional,
      event_date, valid_from,
    } = edge;

    // Relationship type one-hot (15 dims)
    const relVec = oneHot(TOP_RELS, rel);

    // Impact type one-hot (6 dims)
    const impactVec = oneHot(IMPACT_TYPES, impact_type);

    // Edge category one-hot (3 dims)
    const catVec = oneHot(EDGE_CATEGORIES, edge_category);

    // Confidence (1 dim)
    const conf = clamp01(parseFloat(confidence) || 0);

    // Weight (1 dim)
    const wt = clamp01(parseFloat(weight) || 0);

    // Data quality one-hot (3 dims)
    const dqVec = oneHot(DATA_QUALITY_LEVELS, data_quality);

    // Bidirectional (1 dim)
    const bidir = bidirectional ? 1.0 : 0.0;

    // Time delta normalized (1 dim) - how recent is this edge (1 = most recent, 0 = oldest)
    const edgeTime = event_date ? new Date(event_date).getTime()
                   : valid_from ? new Date(valid_from).getTime()
                   : null;
    const timeDelta = edgeTime !== null && !isNaN(edgeTime)
      ? clamp01((edgeTime - minTime) / timeRange)
      : 0.5; // default to midpoint if no date

    const featureVector = [...relVec, ...impactVec, ...catVec, conf, wt, ...dqVec, bidir, timeDelta];
    vectors.push({ edge_id: id, featureVector });
  }

  // 3. Batch upsert into edge_features
  console.log(`Upserting ${vectors.length} edge feature vectors...`);
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const { edge_id, featureVector } of batch) {
      values.push(`($${paramIdx}, $${paramIdx + 1}::FLOAT8[], NOW())`);
      params.push(edge_id, featureVector);
      paramIdx += 2;
    }

    await pool.query(
      `INSERT INTO edge_features (edge_id, feature_vector, computed_at)
       VALUES ${values.join(', ')}
       ON CONFLICT (edge_id)
       DO UPDATE SET feature_vector = EXCLUDED.feature_vector,
                     computed_at = EXCLUDED.computed_at`,
      params
    );
  }

  console.log(`Edge features computed: ${vectors.length} edges`);
  return vectors.length;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== T-GNN Feature Vector Computation ===\n');

  try {
    const nodeCount = await computeNodeFeatures();
    console.log('');
    const edgeCount = await computeEdgeFeatures();

    console.log('\n=== Summary ===');
    console.log(`Node feature vectors computed: ${nodeCount} (${NODE_FEATURE_NAMES.length} dims)`);
    console.log(`Edge feature vectors computed: ${edgeCount} (${EDGE_FEATURE_NAMES.length} dims)`);
    console.log(`Feature version: ${FEATURE_VERSION}`);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
