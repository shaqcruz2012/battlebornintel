/**
 * migrate-v2.js
 *
 * Adds provenance columns to entities, edges, timeline_events
 * and creates new tables: pending_review, data_sources, entity_snapshots.
 *
 * Idempotent: each ALTER TABLE is wrapped in try/catch so re-running
 * after columns already exist is harmless.
 *
 * Usage:  node db/migrate-v2.js
 */

import initSqlJs from "sql.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "bbi.db");

console.log("migrate-v2: opening", dbPath);

const SQL = await initSqlJs();
const buffer = readFileSync(dbPath);
const db = new SQL.Database(buffer);

// ── Helper: run ALTER TABLE, ignore "duplicate column" errors ──────────
function addColumn(table, colDef) {
  try {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    console.log(`  + ${table}.${colDef.split(" ")[0]}`);
  } catch (err) {
    if (/duplicate column/i.test(err.message)) {
      console.log(`  ~ ${table}.${colDef.split(" ")[0]} (already exists)`);
    } else {
      throw err;
    }
  }
}

// ── 1. Provenance columns on timeline_events ───────────────────────────
console.log("\n--- ALTER timeline_events ---");
addColumn("timeline_events", "amount REAL");
addColumn("timeline_events", "round_type TEXT");
addColumn("timeline_events", "investors TEXT");
addColumn("timeline_events", "valuation REAL");
addColumn("timeline_events", "source_url TEXT");
addColumn("timeline_events", "confidence REAL DEFAULT 1.0");
addColumn("timeline_events", "agent_id TEXT DEFAULT 'seed'");
addColumn("timeline_events", "created_at TEXT");
addColumn("timeline_events", "verified INTEGER DEFAULT 1");

// ── 2. Provenance columns on entities ──────────────────────────────────
console.log("\n--- ALTER entities ---");
addColumn("entities", "confidence REAL DEFAULT 1.0");
addColumn("entities", "source_url TEXT");
addColumn("entities", "agent_id TEXT DEFAULT 'seed'");
addColumn("entities", "created_at TEXT");
addColumn("entities", "verified INTEGER DEFAULT 1");

// ── 3. Provenance columns on edges ─────────────────────────────────────
console.log("\n--- ALTER edges ---");
addColumn("edges", "confidence REAL DEFAULT 1.0");
addColumn("edges", "source_url TEXT");
addColumn("edges", "agent_id TEXT DEFAULT 'seed'");
addColumn("edges", "created_at TEXT");
addColumn("edges", "verified INTEGER DEFAULT 1");

// ── 4. New tables ──────────────────────────────────────────────────────
console.log("\n--- CREATE new tables ---");

db.run(`
  CREATE TABLE IF NOT EXISTS pending_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_table TEXT NOT NULL,
    proposed_data TEXT NOT NULL,
    confidence REAL,
    sources TEXT,
    agent_id TEXT,
    created_at TEXT,
    reviewed_at TEXT,
    reviewer TEXT,
    status TEXT DEFAULT 'pending'
  )
`);
console.log("  + pending_review");

db.run(`
  CREATE TABLE IF NOT EXISTS data_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    url TEXT,
    title TEXT,
    published_date TEXT,
    accessed_at TEXT,
    source_credibility REAL,
    extraction_method TEXT
  )
`);
console.log("  + data_sources");

db.run(`
  CREATE TABLE IF NOT EXISTS entity_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    period TEXT,
    metrics TEXT
  )
`);
console.log("  + entity_snapshots");

// ── 5. Indexes on new tables ───────────────────────────────────────────
console.log("\n--- CREATE indexes ---");

const indexes = [
  "CREATE INDEX IF NOT EXISTS idx_pending_review_status ON pending_review(status)",
  "CREATE INDEX IF NOT EXISTS idx_pending_review_agent ON pending_review(agent_id)",
  "CREATE INDEX IF NOT EXISTS idx_data_sources_record ON data_sources(record_type, record_id)",
  "CREATE INDEX IF NOT EXISTS idx_entity_snapshots_entity ON entity_snapshots(entity_id)",
  "CREATE INDEX IF NOT EXISTS idx_entity_snapshots_date ON entity_snapshots(snapshot_date)",
];

for (const sql of indexes) {
  db.run(sql);
  const name = sql.match(/idx_\w+/)?.[0];
  console.log(`  + ${name}`);
}

// ── 6. Backfill existing rows ──────────────────────────────────────────
console.log("\n--- Backfill provenance defaults ---");

for (const table of ["timeline_events", "entities", "edges"]) {
  const res = db.run(
    `UPDATE ${table} SET confidence = 1.0, agent_id = 'seed', verified = 1 WHERE agent_id IS NULL`
  );
  console.log(`  ${table}: updated ${db.getRowsModified()} rows`);
}

// ── 7. Save ────────────────────────────────────────────────────────────
const data = db.export();
writeFileSync(dbPath, Buffer.from(data));
console.log("\nmigrate-v2: saved", dbPath, `(${data.length} bytes)\n`);
