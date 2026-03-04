import express from "express";
import cors from "cors";
import initSqlJs from "sql.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import companiesRouter from "./routes/companies.js";
import fundsRouter from "./routes/funds.js";
import graphRouter from "./routes/graph.js";
import timelineRouter from "./routes/timeline.js";
import statsRouter from "./routes/stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "db", "bbi.db");

// sql.js helpers — return arrays of plain objects like better-sqlite3
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryOne(db, sql, params = []) {
  const results = queryAll(db, sql, params);
  return results[0] || null;
}

// Async init: load sql.js WASM, open existing DB file, then start Express
const SQL = await initSqlJs();
const buffer = readFileSync(dbPath);
const db = new SQL.Database(buffer);

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  req.queryAll = (sql, params) => queryAll(db, sql, params);
  req.queryOne = (sql, params) => queryOne(db, sql, params);
  next();
});

app.use("/api/companies", companiesRouter);
app.use("/api/funds", fundsRouter);
app.use("/api/graph", graphRouter);
app.use("/api/timeline", timelineRouter);
app.use("/api/stats", statsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BBI API running on :${PORT}`));
