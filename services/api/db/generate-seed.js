// This script extracts data from App.jsx and generates seed.js
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsx = readFileSync(join(__dirname, "../../../src/App.jsx"), "utf8");

// Extract array blocks from the source
function extractArray(varName) {
  // Find the const VARNAME = [ ... ]; block
  const regex = new RegExp(`const ${varName}\\s*=\\s*\\[`, "g");
  const match = regex.exec(appJsx);
  if (!match) throw new Error(`Could not find ${varName}`);

  let start = match.index + match[0].length - 1; // position of '['
  let depth = 0;
  let end = start;
  for (let i = start; i < appJsx.length; i++) {
    if (appJsx[i] === '[') depth++;
    if (appJsx[i] === ']') depth--;
    if (depth === 0) { end = i + 1; break; }
  }
  return appJsx.slice(start, end);
}

const COMPANIES = extractArray("COMPANIES");
const FUNDS = extractArray("FUNDS");
const TIMELINE_EVENTS = extractArray("TIMELINE_EVENTS");
const GRAPH_FUNDS = extractArray("GRAPH_FUNDS");
const PEOPLE = extractArray("PEOPLE");
const EXTERNALS = extractArray("EXTERNALS");
const ACCELERATORS = extractArray("ACCELERATORS");
const ECOSYSTEM_ORGS = extractArray("ECOSYSTEM_ORGS");
const LISTINGS = extractArray("LISTINGS");
const VERIFIED_EDGES = extractArray("VERIFIED_EDGES");

const seedContent = `import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "bbi.db");
const schemaPath = join(__dirname, "schema.sql");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(readFileSync(schemaPath, "utf8"));

// ── DATA ──

const COMPANIES = ${COMPANIES};

const FUNDS = ${FUNDS};

const TIMELINE_EVENTS = ${TIMELINE_EVENTS};

const GRAPH_FUNDS = ${GRAPH_FUNDS};

const PEOPLE = ${PEOPLE};

const EXTERNALS = ${EXTERNALS};

const ACCELERATORS = ${ACCELERATORS};

const ECOSYSTEM_ORGS = ${ECOSYSTEM_ORGS};

const LISTINGS = ${LISTINGS};

const VERIFIED_EDGES = ${VERIFIED_EDGES};

// ── SEED FUNCTIONS ──

function seedCompanies(companies) {
  const stmt = db.prepare(\`INSERT OR REPLACE INTO companies (id, name, stage, sectors, city, region, funding, momentum, employees, founded, description, eligible, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const c of companies) {
      stmt.run(c.id, c.name, c.stage, JSON.stringify(c.sector), c.city, c.region, c.funding, c.momentum, c.employees, c.founded, c.description, JSON.stringify(c.eligible), c.lat, c.lng);
    }
  });
  tx();
  console.log(\`Seeded \${companies.length} companies\`);
}

function seedFunds(funds) {
  const stmt = db.prepare(\`INSERT OR REPLACE INTO funds (id, name, type, allocated, deployed, leverage, companies, thesis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const f of funds) stmt.run(f.id, f.name, f.type, f.allocated, f.deployed, f.leverage, f.companies, f.thesis);
  });
  tx();
  console.log(\`Seeded \${funds.length} funds\`);
}

function seedEntities(graphFunds, people, externals, accelerators, ecosystemOrgs) {
  const stmt = db.prepare(\`INSERT OR REPLACE INTO entities (id, name, category, etype, atype, role, city, region, founded, company_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const f of graphFunds) stmt.run(f.id, f.name, "graph_fund", null, null, null, null, null, null, null, f.type);
    for (const p of people) stmt.run(p.id, p.name, "person", null, null, p.role, null, null, null, p.companyId, p.note);
    for (const x of externals) stmt.run(x.id, x.name, "external", x.etype, null, null, null, null, null, null, x.note);
    for (const a of accelerators) stmt.run(a.id, a.name, "accelerator", null, a.atype, null, a.city, a.region, a.founded, null, a.note);
    for (const o of ecosystemOrgs) stmt.run(o.id, o.name, "ecosystem", o.etype, null, null, o.city, o.region, null, null, o.note);
  });
  tx();
  const total = graphFunds.length + people.length + externals.length + accelerators.length + ecosystemOrgs.length;
  console.log(\`Seeded \${total} entities\`);
}

function seedEdges(edges) {
  const stmt = db.prepare(\`INSERT INTO edges (source, target, rel, note, year) VALUES (?, ?, ?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const e of edges) stmt.run(e.source, e.target, e.rel, e.note, e.y || null);
  });
  tx();
  console.log(\`Seeded \${edges.length} edges\`);
}

function seedTimeline(events) {
  const stmt = db.prepare(\`INSERT INTO timeline_events (date, type, company, detail, icon) VALUES (?, ?, ?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const e of events) stmt.run(e.date, e.type, e.company, e.detail, e.icon);
  });
  tx();
  console.log(\`Seeded \${events.length} timeline events\`);
}

function seedListings(listings) {
  const stmt = db.prepare(\`INSERT OR REPLACE INTO listings (company_id, exchange, ticker) VALUES (?, ?, ?)\`);
  const tx = db.transaction(() => {
    for (const l of listings) stmt.run(l.companyId, l.exchange, l.ticker);
  });
  tx();
  console.log(\`Seeded \${listings.length} listings\`);
}

// ── RUN SEED ──
console.log("Seeding BBI database...");
db.exec("DELETE FROM companies; DELETE FROM funds; DELETE FROM entities; DELETE FROM edges; DELETE FROM timeline_events; DELETE FROM listings;");
seedCompanies(COMPANIES);
seedFunds(FUNDS);
seedEntities(GRAPH_FUNDS, PEOPLE, EXTERNALS, ACCELERATORS, ECOSYSTEM_ORGS);
seedEdges(VERIFIED_EDGES);
seedTimeline(TIMELINE_EVENTS);
seedListings(LISTINGS);
console.log("Done! Database at:", dbPath);
db.close();
`;

writeFileSync(join(__dirname, "seed.js"), seedContent, "utf8");
console.log("Generated seed.js successfully!");
