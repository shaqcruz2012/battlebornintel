import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'bbi.db');
const SCHEMA_PATH = join(__dirname, '..', 'schema.sql');

let db;

export function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize schema if tables don't exist
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='verticals'").get();
  if (!tableCheck) {
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    // Remove PRAGMA lines (already set above) and execute all CREATE statements
    const cleanSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('PRAGMA'))
      .join('\n');
    db.exec(cleanSchema);
    console.log('Database schema initialized.');
  }
  return db;
}

// -- Helper functions --

export function getAll(table, verticalId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM ${table} WHERE vertical_id = ?`).all(verticalId);
}

export function getById(table, id, verticalId) {
  const db = getDb();
  return db.prepare(`SELECT * FROM ${table} WHERE id = ? AND vertical_id = ?`).get(id, verticalId);
}

export function insertRow(table, obj) {
  const db = getDb();
  const keys = Object.keys(obj);
  const placeholders = keys.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
  return stmt.run(...keys.map(k => obj[k]));
}

export function updateRow(table, id, obj, verticalId) {
  const db = getDb();
  const sets = Object.keys(obj).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(obj), id, verticalId];
  return db.prepare(`UPDATE ${table} SET ${sets}, updated_at = datetime('now') WHERE id = ? AND vertical_id = ?`).run(...values);
}

export function deleteRow(table, id, verticalId) {
  const db = getDb();
  return db.prepare(`DELETE FROM ${table} WHERE id = ? AND vertical_id = ?`).run(id, verticalId);
}

export function invalidateMetricsCache(verticalId) {
  const db = getDb();
  db.prepare('DELETE FROM graph_metrics_cache WHERE vertical_id = ?').run(verticalId);
}

export default getDb;
