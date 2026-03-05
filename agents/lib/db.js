import initSqlJs from "sql.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../../services/api/db/bbi.db");

let _db = null;
let _SQL = null;

export async function getDb() {
  if (_db) return _db;
  _SQL = await initSqlJs();
  const buffer = readFileSync(DB_PATH);
  _db = new _SQL.Database(buffer);
  return _db;
}

export function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

export function queryOne(db, sql, params = []) {
  return queryAll(db, sql, params)[0] || null;
}

export function run(db, sql, params = []) {
  db.run(sql, params);
}

export function saveDb(db) {
  const data = db.export();
  writeFileSync(DB_PATH, Buffer.from(data));
}

export function now() {
  return new Date().toISOString();
}
