import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// Load .env if it exists
try {
  const envPath = resolve(ROOT, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.+?)\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
} catch {}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  console.log('Connected to PostgreSQL');

  try {
    // Dynamic import of frontend data modules (pathToFileURL for Windows ESM compat)
    const toURL = (p) => pathToFileURL(resolve(ROOT, p)).href;
    const { COMPANIES } = await import(toURL('frontend/src/data/companies.js'));
    const { FUNDS } = await import(toURL('frontend/src/data/funds.js'));
    const { VERIFIED_EDGES } = await import(toURL('frontend/src/data/edges.js'));
    const {
      GRAPH_FUNDS,
      PEOPLE,
      EXTERNALS,
      ACCELERATORS,
      ECOSYSTEM_ORGS,
      LISTINGS,
    } = await import(toURL('frontend/src/data/graph-entities.js'));
    const { TIMELINE } = await import(toURL('frontend/src/data/timeline.js'));
    const {
      SHEAT,
      STAGE_NORMS,
      TRIGGER_CFG,
      GRADE_COLORS,
      GP,
      NODE_CFG,
      REL_CFG,
      GSTAGE_C,
      STAGE_COLORS,
      COMM_COLORS,
    } = await import(toURL('frontend/src/data/constants.js'));

    await client.query('BEGIN');

    // Truncate all tables (order matters for FK)
    await client.query(`
      TRUNCATE graph_metrics_cache, computed_scores, analysis_results, agent_runs,
               listings, timeline_events, graph_edges, people, externals,
               accelerators, ecosystem_orgs, graph_funds, funds, companies, constants
      CASCADE
    `);

    // 1. Companies
    for (const c of COMPANIES) {
      await client.query(
        `INSERT INTO companies (id, slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          c.id,
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
          c.name,
          c.stage,
          c.sector || [],
          c.city,
          c.region,
          c.funding || 0,
          c.momentum || 0,
          c.employees || 0,
          c.founded || null,
          c.description || null,
          c.eligible || [],
          c.lat || null,
          c.lng || null,
        ]
      );
    }
    // Reset sequence
    await client.query(
      `SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies))`
    );
    console.log(`  companies: ${COMPANIES.length} rows`);

    // 2. Funds
    for (const f of FUNDS) {
      await client.query(
        `INSERT INTO funds (id, name, fund_type, allocated_m, deployed_m, leverage, company_count, thesis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          f.id,
          f.name,
          f.type,
          f.allocated || null,
          f.deployed || 0,
          f.leverage || null,
          f.companies || 0,
          f.thesis || null,
        ]
      );
    }
    console.log(`  funds: ${FUNDS.length} rows`);

    // 3. Graph edges
    for (const e of VERIFIED_EDGES) {
      await client.query(
        `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year)
         VALUES ($1, $2, $3, $4, $5)`,
        [e.source, e.target, e.rel, e.note || null, e.y || null]
      );
    }
    console.log(`  graph_edges: ${VERIFIED_EDGES.length} rows`);

    // 4. People
    for (const p of PEOPLE) {
      await client.query(
        `INSERT INTO people (id, name, role, company_id, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [p.id, p.name, p.role || null, p.companyId || null, p.note || null]
      );
    }
    console.log(`  people: ${PEOPLE.length} rows`);

    // 5. Externals
    for (const x of EXTERNALS) {
      await client.query(
        `INSERT INTO externals (id, name, entity_type, note)
         VALUES ($1, $2, $3, $4)`,
        [x.id, x.name, x.etype, x.note || null]
      );
    }
    console.log(`  externals: ${EXTERNALS.length} rows`);

    // 6. Accelerators
    for (const a of ACCELERATORS) {
      await client.query(
        `INSERT INTO accelerators (id, name, accel_type, city, region, founded, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          a.id,
          a.name,
          a.atype,
          a.city || null,
          a.region || null,
          a.founded || null,
          a.note || null,
        ]
      );
    }
    console.log(`  accelerators: ${ACCELERATORS.length} rows`);

    // 7. Ecosystem orgs
    for (const o of ECOSYSTEM_ORGS) {
      await client.query(
        `INSERT INTO ecosystem_orgs (id, name, entity_type, city, region, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          o.id,
          o.name,
          o.etype,
          o.city || null,
          o.region || null,
          o.note || null,
        ]
      );
    }
    console.log(`  ecosystem_orgs: ${ECOSYSTEM_ORGS.length} rows`);

    // 8. Graph funds
    for (const f of GRAPH_FUNDS) {
      await client.query(
        `INSERT INTO graph_funds (id, name, fund_type) VALUES ($1, $2, $3)`,
        [f.id, f.name, f.type]
      );
    }
    console.log(`  graph_funds: ${GRAPH_FUNDS.length} rows`);

    // 9. Listings
    for (const l of LISTINGS) {
      await client.query(
        `INSERT INTO listings (company_id, exchange, ticker) VALUES ($1, $2, $3)`,
        [l.companyId, l.exchange, l.ticker]
      );
    }
    console.log(`  listings: ${LISTINGS.length} rows`);

    // 10. Timeline events
    if (TIMELINE) {
      for (const t of TIMELINE) {
        await client.query(
          `INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
           VALUES ($1, $2, $3, $4, $5)`,
          [t.date, t.type, t.company, t.detail, t.icon || null]
        );
      }
      console.log(`  timeline_events: ${TIMELINE.length} rows`);
    }

    // 11. Constants
    const constantsMap = {
      sector_heat: SHEAT,
      stage_norms: STAGE_NORMS,
      trigger_config: TRIGGER_CFG,
      grade_colors: GRADE_COLORS,
      graph_palette: GP,
      node_config: NODE_CFG,
      rel_config: REL_CFG,
      stage_graph_colors: GSTAGE_C,
      stage_colors: STAGE_COLORS,
      community_colors: COMM_COLORS,
    };
    for (const [key, value] of Object.entries(constantsMap)) {
      if (value !== undefined) {
        await client.query(
          `INSERT INTO constants (key, value, description) VALUES ($1, $2, $3)`,
          [key, JSON.stringify(value), `Auto-seeded from frontend data`]
        );
      }
    }
    console.log(
      `  constants: ${Object.keys(constantsMap).length} rows`
    );

    // 12. Pre-compute IRS scores
    const { computeIRS } = await import(toURL('api/src/engine/scoring.js'));
    for (const c of COMPANIES) {
      const company = {
        ...c,
        sector: c.sector || [],
        eligible: c.eligible || [],
        funding: c.funding || 0,
      };
      const { irs, grade, triggers, dims } = computeIRS(
        company,
        SHEAT,
        STAGE_NORMS
      );
      await client.query(
        `INSERT INTO computed_scores (company_id, irs_score, grade, triggers, dims)
         VALUES ($1, $2, $3, $4, $5)`,
        [c.id, irs, grade, triggers, JSON.stringify(dims)]
      );
    }
    console.log(`  computed_scores: ${COMPANIES.length} rows`);

    // 13. Pre-compute graph metrics
    const { computeGraphMetrics } = await import(toURL('api/src/engine/graph-metrics.js'));
    // Build node list (same as graph-builder logic)
    const gNodes = [];
    const gSet = new Set();
    const gAdd = (id, label, type, extra = {}) => {
      if (!gSet.has(id)) { gSet.add(id); gNodes.push({ id, label, type, ...extra }); }
    };
    COMPANIES.forEach((c) =>
      gAdd(`c_${c.id}`, c.name, 'company', { funding: c.funding || 0 })
    );
    GRAPH_FUNDS.forEach((f) => gAdd(`f_${f.id}`, f.name, 'fund'));
    PEOPLE.forEach((p) => gAdd(p.id, p.name, 'person'));
    EXTERNALS.forEach((x) => gAdd(x.id, x.name, 'external'));
    ACCELERATORS.forEach((a) => gAdd(a.id, a.name, 'accelerator'));
    ECOSYSTEM_ORGS.forEach((o) => gAdd(o.id, o.name, 'ecosystem'));

    const gEdges = VERIFIED_EDGES
      .filter((e) => gSet.has(e.source) && gSet.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, rel: e.rel }));
    // Add derived edges
    COMPANIES.forEach((c) => {
      (c.eligible || []).forEach((f) => {
        if (gSet.has(`f_${f}`)) gEdges.push({ source: `c_${c.id}`, target: `f_${f}`, rel: 'eligible_for' });
      });
      (c.sector || []).forEach((s) => {
        if (gSet.has(`s_${s}`)) gEdges.push({ source: `c_${c.id}`, target: `s_${s}`, rel: 'operates_in' });
      });
    });

    const metrics = computeGraphMetrics(gNodes, gEdges);
    const nodeIds = Object.keys(metrics.pagerank);
    for (const nodeId of nodeIds) {
      await client.query(
        `INSERT INTO graph_metrics_cache (node_id, pagerank, betweenness, community_id)
         VALUES ($1, $2, $3, $4)`,
        [nodeId, metrics.pagerank[nodeId], metrics.betweenness[nodeId], metrics.communities[nodeId]]
      );
    }
    console.log(`  graph_metrics_cache: ${nodeIds.length} rows`);

    await client.query('COMMIT');
    console.log('\nSeed complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
