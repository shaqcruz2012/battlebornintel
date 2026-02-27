/**
 * BBI Data Migration: Static JS files → SQLite
 *
 * Usage:
 *   node src/migrate.js --vertical goed --path ../../apps/goed
 *   node src/migrate.js --vertical esint --path ../../apps/esint
 */

import { getDb } from './db.js';
import { resolve, join } from 'path';
import { pathToFileURL } from 'url';

// Parse CLI args
const args = process.argv.slice(2);
const verticalIdx = args.indexOf('--vertical');
const pathIdx = args.indexOf('--path');
if (verticalIdx === -1 || pathIdx === -1) {
  console.error('Usage: node src/migrate.js --vertical <id> --path <appDir>');
  process.exit(1);
}
const verticalId = args[verticalIdx + 1];
const appPath = resolve(args[pathIdx + 1]);

console.log(`\nMigrating ${verticalId} from ${appPath}...\n`);

// Helper: dynamic import from file path
async function load(filePath) {
  const url = pathToFileURL(resolve(filePath)).href;
  return import(url);
}

// Helper: JSON.stringify arrays/objects, pass through primitives
function jsonify(val) {
  if (val === undefined || val === null) return null;
  if (Array.isArray(val) || typeof val === 'object') return JSON.stringify(val);
  return val;
}

async function migrate() {
  const db = getDb();
  const dataDir = join(appPath, 'src', 'data');

  // Load config
  const configMod = await load(join(appPath, 'src', 'config.js'));
  const config = configMod.default;

  // Load core data files
  const companiesMod = await load(join(dataDir, 'companies.js'));
  const fundsMod = await load(join(dataDir, 'funds.js'));
  const timelineMod = await load(join(dataDir, 'timeline.js'));
  const graphMod = await load(join(dataDir, 'graph.js'));

  const COMPANIES = companiesMod.COMPANIES;
  const FUNDS = fundsMod.FUNDS;
  const TIMELINE = timelineMod.TIMELINE_EVENTS;
  const GRAPH_FUNDS = graphMod.GRAPH_FUNDS;
  const PEOPLE = graphMod.PEOPLE;
  const EXTERNALS = graphMod.EXTERNALS;
  const ACCELERATORS = graphMod.ACCELERATORS || [];
  const ECOSYSTEM_ORGS = graphMod.ECOSYSTEM_ORGS || [];
  const LISTINGS = graphMod.LISTINGS || [];
  const VERIFIED_EDGES = graphMod.VERIFIED_EDGES;

  // Load enterprise data (optional)
  let DOCKETS = [], PPA_RECORDS = [], QUEUE_ENTRIES = [], BENCHMARKS_DATA = null;
  try { const m = await load(join(dataDir, 'dockets.js')); DOCKETS = m.DOCKETS || []; } catch {}
  try { const m = await load(join(dataDir, 'ppa.js')); PPA_RECORDS = m.PPA_RECORDS || []; } catch {}
  try { const m = await load(join(dataDir, 'queue.js')); QUEUE_ENTRIES = m.QUEUE_ENTRIES || []; } catch {}
  try {
    const m = await load(join(dataDir, 'benchmarks.js'));
    BENCHMARKS_DATA = {
      stages: m.STAGE_BENCHMARKS || {},
      risks: m.RISK_MULTIPLIERS || {}
    };
  } catch {}

  // Run migration in a transaction
  const runMigration = db.transaction(() => {
    // Clear existing data for this vertical
    const tables = ['edges', 'listings', 'ecosystem_orgs', 'accelerators', 'externals', 'people',
      'graph_funds', 'timeline_events', 'funds', 'companies', 'dockets', 'ppas', 'queue_entries',
      'benchmarks', 'graph_metrics_cache'];
    for (const t of tables) {
      try { db.prepare(`DELETE FROM ${t} WHERE vertical_id = ?`).run(verticalId); } catch {}
    }
    db.prepare('DELETE FROM verticals WHERE id = ?').run(verticalId);

    // Rebuild FTS
    try { db.exec("INSERT INTO companies_fts(companies_fts) VALUES('rebuild')"); } catch {}

    // Insert vertical config
    db.prepare('INSERT INTO verticals (id, name, config_json) VALUES (?, ?, ?)').run(
      verticalId, config.name || verticalId, JSON.stringify(config)
    );

    // -- Companies --
    const insertCompany = db.prepare(`INSERT INTO companies (
      id, vertical_id, name, stage, sector, city, region, funding, momentum, employees,
      founded, description, eligible, lat, lng,
      capacity_mw, storage_mwh, acreage, developer, epc, estimated_cod,
      docket_ids, queue_ids, ppa_ids, key_milestones, risk_factors, permitting_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (const c of COMPANIES) {
      insertCompany.run(
        c.id, verticalId, c.name, c.stage, jsonify(c.sector), c.city || '', c.region || '',
        c.funding || 0, c.momentum || 50, c.employees || 0, c.founded || 2020,
        c.description || '', jsonify(c.eligible || []), c.lat || 0, c.lng || 0,
        c.capacityMW ?? null, c.storageMWh ?? null, c.acreage ?? null,
        c.developer ?? null, c.epc ?? null, c.estimatedCOD ?? null,
        jsonify(c.docketIds), jsonify(c.queueIds), jsonify(c.ppaIds),
        jsonify(c.keyMilestones), jsonify(c.riskFactors), c.permittingScore ?? null
      );
    }

    // FTS sync for companies
    for (const c of COMPANIES) {
      try {
        db.prepare(`INSERT INTO companies_fts(rowid, name, description, city, sector)
          SELECT rowid, name, description, city, sector FROM companies
          WHERE id = ? AND vertical_id = ?`).run(c.id, verticalId);
      } catch {}
    }

    // -- Funds --
    const insertFund = db.prepare(`INSERT INTO funds (
      id, vertical_id, name, type, allocated, deployed, leverage, companies, thesis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    for (const f of FUNDS) {
      insertFund.run(
        f.id, verticalId, f.name, f.type, f.allocated ?? null, f.deployed || 0,
        f.leverage ?? null, f.companies || 0, f.thesis || ''
      );
    }

    // -- Timeline Events --
    const insertEvent = db.prepare(`INSERT INTO timeline_events (
      vertical_id, date, type, company, company_id, detail, icon
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    for (const t of TIMELINE) {
      insertEvent.run(
        verticalId, t.date, t.type, t.company || '', t.companyId ?? null,
        t.detail || '', t.icon || ''
      );
    }

    // -- Graph Funds --
    const insertGF = db.prepare('INSERT OR REPLACE INTO graph_funds (id, vertical_id, name, type) VALUES (?, ?, ?, ?)');
    for (const gf of GRAPH_FUNDS) {
      insertGF.run(gf.id, verticalId, gf.name, gf.type);
    }

    // -- People (OR REPLACE handles duplicate IDs from expanded graphs) --
    const insertPerson = db.prepare('INSERT OR REPLACE INTO people (id, vertical_id, name, role, company_id, note) VALUES (?, ?, ?, ?, ?, ?)');
    for (const p of PEOPLE) {
      insertPerson.run(p.id, verticalId, p.name, p.role || '', p.companyId ?? null, p.note || '');
    }

    // -- Externals --
    const insertExternal = db.prepare('INSERT OR REPLACE INTO externals (id, vertical_id, name, etype, note) VALUES (?, ?, ?, ?, ?)');
    for (const x of EXTERNALS) {
      insertExternal.run(x.id, verticalId, x.name, x.etype || '', x.note || '');
    }

    // -- Accelerators --
    const insertAccel = db.prepare('INSERT OR REPLACE INTO accelerators (id, vertical_id, name, atype, city, region, founded, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const a of ACCELERATORS) {
      insertAccel.run(a.id, verticalId, a.name, a.atype || '', a.city || '', a.region || '', a.founded ?? null, a.note || '');
    }

    // -- Ecosystem Orgs --
    const insertEco = db.prepare('INSERT OR REPLACE INTO ecosystem_orgs (id, vertical_id, name, etype, city, region, note) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const e of ECOSYSTEM_ORGS) {
      insertEco.run(e.id, verticalId, e.name, e.etype || '', e.city || '', e.region || '', e.note || '');
    }

    // -- Listings --
    const insertListing = db.prepare('INSERT INTO listings (vertical_id, company_id, exchange, ticker) VALUES (?, ?, ?, ?)');
    for (const l of LISTINGS) {
      insertListing.run(verticalId, l.companyId, l.exchange, l.ticker);
    }

    // -- Edges --
    const insertEdge = db.prepare('INSERT INTO edges (vertical_id, source, target, rel, note, year) VALUES (?, ?, ?, ?, ?, ?)');
    for (const e of VERIFIED_EDGES) {
      insertEdge.run(verticalId, e.source, e.target, e.rel, e.note ?? null, e.y ?? null);
    }

    // -- Enterprise: Dockets --
    if (DOCKETS.length > 0) {
      const insertDocket = db.prepare(`INSERT INTO dockets (
        id, vertical_id, title, agency, status, open_date, last_activity, next_deadline,
        projects, filings, impact, url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const d of DOCKETS) {
        insertDocket.run(
          d.id, verticalId, d.title, d.agency, d.status || 'open',
          d.openDate ?? null, d.lastActivity ?? null, d.nextDeadline ?? null,
          jsonify(d.projects || []), jsonify(d.filings || []),
          d.impact || '', d.url ?? null
        );
      }
    }

    // -- Enterprise: PPAs --
    if (PPA_RECORDS.length > 0) {
      const insertPPA = db.prepare(`INSERT INTO ppas (
        id, vertical_id, project, project_id, buyer, technology,
        capacity_mw, storage_mwh, price_per_mwh, term_years,
        execution_date, cod_date, docket_ref, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const p of PPA_RECORDS) {
        insertPPA.run(
          p.id, verticalId, p.project, p.projectId ?? null, p.buyer || '', p.technology || '',
          p.capacityMW ?? null, p.storageMWh ?? null, p.pricePerMWh ?? null, p.termYears ?? null,
          p.executionDate ?? null, p.codDate ?? null, p.docketRef ?? null, p.notes ?? null
        );
      }
    }

    // -- Enterprise: Queue Entries --
    if (QUEUE_ENTRIES.length > 0) {
      const insertQueue = db.prepare(`INSERT INTO queue_entries (
        id, vertical_id, project_id, project_name, utility, request_mw, type,
        substation, status, application_date, study_complete_date, estimated_cod, county, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const q of QUEUE_ENTRIES) {
        insertQueue.run(
          q.id, verticalId, q.projectId ?? null, q.projectName, q.utility || '',
          q.requestMW || 0, q.type || '', q.substation || '', q.status || '',
          q.applicationDate ?? null, q.studyCompleteDate ?? null,
          q.estimatedCOD ?? null, q.county || '', q.notes ?? null
        );
      }
    }

    // -- Enterprise: Benchmarks --
    if (BENCHMARKS_DATA) {
      db.prepare('INSERT OR REPLACE INTO benchmarks (vertical_id, data_json) VALUES (?, ?)').run(
        verticalId, JSON.stringify(BENCHMARKS_DATA)
      );
    }
  });

  runMigration();

  // Print stats
  const stats = {
    companies: db.prepare('SELECT COUNT(*) as c FROM companies WHERE vertical_id=?').get(verticalId).c,
    funds: db.prepare('SELECT COUNT(*) as c FROM funds WHERE vertical_id=?').get(verticalId).c,
    timeline: db.prepare('SELECT COUNT(*) as c FROM timeline_events WHERE vertical_id=?').get(verticalId).c,
    graphFunds: db.prepare('SELECT COUNT(*) as c FROM graph_funds WHERE vertical_id=?').get(verticalId).c,
    people: db.prepare('SELECT COUNT(*) as c FROM people WHERE vertical_id=?').get(verticalId).c,
    externals: db.prepare('SELECT COUNT(*) as c FROM externals WHERE vertical_id=?').get(verticalId).c,
    accelerators: db.prepare('SELECT COUNT(*) as c FROM accelerators WHERE vertical_id=?').get(verticalId).c,
    ecosystemOrgs: db.prepare('SELECT COUNT(*) as c FROM ecosystem_orgs WHERE vertical_id=?').get(verticalId).c,
    listings: db.prepare('SELECT COUNT(*) as c FROM listings WHERE vertical_id=?').get(verticalId).c,
    edges: db.prepare('SELECT COUNT(*) as c FROM edges WHERE vertical_id=?').get(verticalId).c,
    dockets: db.prepare('SELECT COUNT(*) as c FROM dockets WHERE vertical_id=?').get(verticalId).c,
    ppas: db.prepare('SELECT COUNT(*) as c FROM ppas WHERE vertical_id=?').get(verticalId).c,
    queue: db.prepare('SELECT COUNT(*) as c FROM queue_entries WHERE vertical_id=?').get(verticalId).c,
  };

  console.log(`Migrated ${verticalId}:`);
  Object.entries(stats).forEach(([k, v]) => {
    if (v > 0) console.log(`  ${k.padEnd(16)} ${v}`);
  });
  console.log(`\nDone. Database: bbi.db\n`);
}

migrate().catch(e => { console.error('Migration failed:', e); process.exit(1); });
