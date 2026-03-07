import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  'postgresql://bbi:bbi_dev_password@localhost:5432/battlebornintel';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  console.log('Connected to PostgreSQL');

  try {
    // Dynamic import of frontend data modules
    const { COMPANIES } = await import(
      resolve(ROOT, 'frontend/src/data/companies.js')
    );
    const { FUNDS } = await import(
      resolve(ROOT, 'frontend/src/data/funds.js')
    );
    const { VERIFIED_EDGES } = await import(
      resolve(ROOT, 'frontend/src/data/edges.js')
    );
    const {
      GRAPH_FUNDS,
      PEOPLE,
      EXTERNALS,
      ACCELERATORS,
      ECOSYSTEM_ORGS,
      LISTINGS,
    } = await import(resolve(ROOT, 'frontend/src/data/graph-entities.js'));
    const { TIMELINE } = await import(
      resolve(ROOT, 'frontend/src/data/timeline.js')
    );
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
    } = await import(resolve(ROOT, 'frontend/src/data/constants.js'));

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
