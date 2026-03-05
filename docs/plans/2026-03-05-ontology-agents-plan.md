# BBI Ontology Intelligence Platform — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a living intelligence platform with graph hover sidebar, ontology schema, confidence/provenance layer, timeline verification agent, snapshot agent, and cron scheduler.

**Architecture:** Extend the pnpm monorepo with an `agents/` workspace containing hybrid Node.js agents (Brave Search + Claude LLM). Schema extensions add provenance columns and new tables. Frontend gets a hover panel on graph nodes and confidence badges on timeline events.

**Tech Stack:** Node.js agents, @anthropic-ai/sdk, brave-search, node-cron, sql.js, React 19, Cytoscape.js

---

### Task 1: Schema Extensions

Add provenance columns to existing tables and create new tables for quarantine, sources, and snapshots.

**Files:**
- Modify: `services/api/db/schema.sql`
- Create: `services/api/db/migrate-v2.js`
- Modify: `services/api/db/seed.js` (backfill existing data)

**Step 1: Create migration script**

Create `services/api/db/migrate-v2.js`:

```js
import initSqlJs from "sql.js";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "bbi.db");

const SQL = await initSqlJs();
const buffer = readFileSync(dbPath);
const db = new SQL.Database(buffer);

// --- Provenance columns on existing tables ---

const alterStmts = [
  // timeline_events
  "ALTER TABLE timeline_events ADD COLUMN amount REAL",
  "ALTER TABLE timeline_events ADD COLUMN round_type TEXT",
  "ALTER TABLE timeline_events ADD COLUMN investors TEXT",
  "ALTER TABLE timeline_events ADD COLUMN valuation REAL",
  "ALTER TABLE timeline_events ADD COLUMN source_url TEXT",
  "ALTER TABLE timeline_events ADD COLUMN confidence REAL DEFAULT 1.0",
  "ALTER TABLE timeline_events ADD COLUMN agent_id TEXT DEFAULT 'seed'",
  "ALTER TABLE timeline_events ADD COLUMN created_at TEXT",
  "ALTER TABLE timeline_events ADD COLUMN verified INTEGER DEFAULT 1",
  // entities
  "ALTER TABLE entities ADD COLUMN confidence REAL DEFAULT 1.0",
  "ALTER TABLE entities ADD COLUMN source_url TEXT",
  "ALTER TABLE entities ADD COLUMN agent_id TEXT DEFAULT 'seed'",
  "ALTER TABLE entities ADD COLUMN created_at TEXT",
  "ALTER TABLE entities ADD COLUMN verified INTEGER DEFAULT 1",
  // edges
  "ALTER TABLE edges ADD COLUMN confidence REAL DEFAULT 1.0",
  "ALTER TABLE edges ADD COLUMN source_url TEXT",
  "ALTER TABLE edges ADD COLUMN agent_id TEXT DEFAULT 'seed'",
  "ALTER TABLE edges ADD COLUMN created_at TEXT",
  "ALTER TABLE edges ADD COLUMN verified INTEGER DEFAULT 1",
];

for (const sql of alterStmts) {
  try { db.exec(sql); } catch (e) {
    if (!e.message.includes("duplicate column")) throw e;
    // Column already exists — skip
  }
}

// --- New tables ---

db.exec(`
  CREATE TABLE IF NOT EXISTS pending_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_table TEXT NOT NULL,
    proposed_data TEXT NOT NULL,
    confidence REAL NOT NULL,
    sources TEXT,
    agent_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewer TEXT,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS data_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_type TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    url TEXT,
    title TEXT,
    published_date TEXT,
    accessed_at TEXT NOT NULL,
    source_credibility TEXT NOT NULL,
    extraction_method TEXT
  );

  CREATE TABLE IF NOT EXISTS entity_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    period TEXT NOT NULL,
    metrics TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_snapshots_entity ON entity_snapshots(entity_id);
  CREATE INDEX IF NOT EXISTS idx_snapshots_date ON entity_snapshots(snapshot_date);
  CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_review(status);
  CREATE INDEX IF NOT EXISTS idx_sources_record ON data_sources(record_type, record_id);
`);

// --- Backfill existing seed data with provenance defaults ---

db.exec("UPDATE timeline_events SET confidence = 1.0, agent_id = 'seed', verified = 1 WHERE agent_id IS NULL OR agent_id = 'seed'");
db.exec("UPDATE entities SET confidence = 1.0, agent_id = 'seed', verified = 1 WHERE agent_id IS NULL OR agent_id = 'seed'");
db.exec("UPDATE edges SET confidence = 1.0, agent_id = 'seed', verified = 1 WHERE agent_id IS NULL OR agent_id = 'seed'");

// Save
const data = db.export();
writeFileSync(dbPath, Buffer.from(data));
console.log("Migration v2 complete: provenance columns + new tables added");
db.close();
```

**Step 2: Update schema.sql to include new tables for fresh installs**

Append to `services/api/db/schema.sql` (after existing content):

```sql
-- v2: Provenance & time-series tables

CREATE TABLE IF NOT EXISTS pending_review (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_table TEXT NOT NULL,
  proposed_data TEXT NOT NULL,
  confidence REAL NOT NULL,
  sources TEXT,
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewer TEXT,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_type TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  url TEXT,
  title TEXT,
  published_date TEXT,
  accessed_at TEXT NOT NULL,
  source_credibility TEXT NOT NULL,
  extraction_method TEXT
);

CREATE TABLE IF NOT EXISTS entity_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  snapshot_date TEXT NOT NULL,
  period TEXT NOT NULL,
  metrics TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_entity ON entity_snapshots(entity_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON entity_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_review(status);
CREATE INDEX IF NOT EXISTS idx_sources_record ON data_sources(record_type, record_id);
```

**Step 3: Add migration script to package.json**

In `services/api/package.json`, add to scripts:

```json
"migrate": "node db/migrate-v2.js"
```

**Step 4: Run migration**

```bash
cd services/api && node db/migrate-v2.js
```

Expected: "Migration v2 complete: provenance columns + new tables added"

**Step 5: Verify migration**

```bash
cd services/api && node -e "
import initSqlJs from 'sql.js';
import { readFileSync } from 'fs';
const SQL = await initSqlJs();
const db = new SQL.Database(readFileSync('db/bbi.db'));
const tables = db.exec(\"SELECT name FROM sqlite_master WHERE type='table'\");
console.log('Tables:', tables[0].values.map(v => v[0]));
const cols = db.exec(\"PRAGMA table_info(timeline_events)\");
console.log('timeline_events columns:', cols[0].values.map(v => v[1]));
db.close();
"
```

Expected: Tables include `pending_review`, `data_sources`, `entity_snapshots`. timeline_events has `confidence`, `source_url`, etc.

**Step 6: Commit**

```bash
git add services/api/db/schema.sql services/api/db/migrate-v2.js services/api/package.json services/api/db/bbi.db
git commit -m "feat: schema v2 — provenance columns, quarantine, sources, snapshots tables"
```

---

### Task 2: Ontology Configuration

Define the economic development ontology as a shared config module.

**Files:**
- Create: `packages/ui-core/src/ontology.js`
- Modify: `packages/ui-core/src/index.js` (re-export)

**Step 1: Create ontology config**

Create `packages/ui-core/src/ontology.js`:

```js
// BBI Economic Development Ontology
// Palantir-style object/link type system for risk capital formation tracking

export const OBJECT_TYPES = {
  company:    { prefix: "c_",  label: "Company",       icon: "⬡", requiredProps: ["name", "stage", "city"] },
  vc_firm:    { prefix: "x_",  label: "VC Firm",       icon: "◈", requiredProps: ["name"] },
  angel:      { prefix: "x_",  label: "Angel Group",   icon: "◈", requiredProps: ["name"] },
  ssbci_fund: { prefix: "f_",  label: "SSBCI Fund",    icon: "◈", requiredProps: ["name", "allocated"] },
  accelerator:{ prefix: "a_",  label: "Accelerator",   icon: "▲", requiredProps: ["name"] },
  corporation:{ prefix: "x_",  label: "Corporation",   icon: "△", requiredProps: ["name"] },
  university: { prefix: "x_",  label: "University",    icon: "▣", requiredProps: ["name"] },
  gov_agency: { prefix: "x_",  label: "Gov Agency",    icon: "⊕", requiredProps: ["name"] },
  person:     { prefix: "p_",  label: "Person",        icon: "●", requiredProps: ["name", "role"] },
  exchange:   { prefix: "x_",  label: "Exchange",      icon: "◧", requiredProps: ["name"] },
};

export const LINK_TYPES = {
  invested_in:     { label: "Invested In",     validSources: ["vc_firm","angel","ssbci_fund","corporation"], validTargets: ["company"], weightProp: "deal_size" },
  loaned_to:       { label: "Loaned To",       validSources: ["ssbci_fund"], validTargets: ["company"], weightProp: "loan_amount" },
  grants_to:       { label: "Grants To",       validSources: ["gov_agency"], validTargets: ["company"], weightProp: "grant_amount" },
  accelerated_by:  { label: "Accelerated By",  validSources: ["company"], validTargets: ["accelerator"], weightProp: "cohort_year" },
  partners_with:   { label: "Partners With",   validSources: ["company","corporation"], validTargets: ["company","corporation"], weightProp: null },
  contracts_with:  { label: "Contracts With",  validSources: ["company","corporation"], validTargets: ["company","corporation"], weightProp: null },
  founded:         { label: "Founded",         validSources: ["person"], validTargets: ["company","vc_firm"], weightProp: "year" },
  manages:         { label: "Manages",         validSources: ["person"], validTargets: ["vc_firm","ssbci_fund"], weightProp: null },
  housed_at:       { label: "Housed At",       validSources: ["company"], validTargets: ["university"], weightProp: null },
  supports:        { label: "Supports",        validSources: ["gov_agency","university"], validTargets: ["company"], weightProp: null },
  competes_with:   { label: "Competes With",   validSources: ["company"], validTargets: ["company"], weightProp: null },
  listed_on:       { label: "Listed On",       validSources: ["company"], validTargets: ["exchange"], weightProp: null },
  acquired:        { label: "Acquired",        validSources: ["company","corporation"], validTargets: ["company"], weightProp: "deal_size" },
  won_pitch:       { label: "Won Pitch",       validSources: ["company"], validTargets: ["accelerator"], weightProp: null },
  incubated_by:    { label: "Incubated By",    validSources: ["company"], validTargets: ["accelerator"], weightProp: null },
  approved_by:     { label: "Approved By",     validSources: ["company"], validTargets: ["gov_agency"], weightProp: null },
  collaborated_with:{ label: "Collaborated",   validSources: ["company","university"], validTargets: ["company","university"], weightProp: null },
};

export const EVENT_TYPES = {
  funding:     { label: "Funding",     icon: "💰", roundTypes: ["pre_seed","seed","series_a","series_b","series_c_plus","growth","debt"] },
  grant:       { label: "Grant",       icon: "🏛️", roundTypes: ["sbir_1","sbir_2","doe","state","other"] },
  partnership: { label: "Partnership", icon: "🤝", roundTypes: null },
  hiring:      { label: "Hiring",      icon: "👥", roundTypes: null },
  momentum:    { label: "Momentum",    icon: "📈", roundTypes: null },
  launch:      { label: "Launch",      icon: "🚀", roundTypes: null },
  award:       { label: "Award",       icon: "🏆", roundTypes: null },
  patent:      { label: "Patent",      icon: "📜", roundTypes: null },
  acquisition: { label: "Acquisition", icon: "🔄", roundTypes: null },
};

// Confidence tiers
export const CONFIDENCE_TIERS = {
  verified:   { min: 1.0,  color: "#4E9B60", label: "Verified",   icon: "✅", autoPublish: true },
  high:       { min: 0.85, color: "#5088A8", label: "High",       icon: "🔵", autoPublish: true },
  medium:     { min: 0.60, color: "#C49A38", label: "Medium",     icon: "🟡", autoPublish: true, tag: "unverified" },
  low:        { min: 0.30, color: "#D4864A", label: "Low",        icon: "🟠", autoPublish: false },
  unverified: { min: 0.0,  color: "#C25550", label: "Unverified", icon: "🔴", autoPublish: false },
};

export function getConfidenceTier(score) {
  if (score >= 1.0)  return CONFIDENCE_TIERS.verified;
  if (score >= 0.85) return CONFIDENCE_TIERS.high;
  if (score >= 0.60) return CONFIDENCE_TIERS.medium;
  if (score >= 0.30) return CONFIDENCE_TIERS.low;
  return CONFIDENCE_TIERS.unverified;
}

// Source credibility ratings
export const SOURCE_CREDIBILITY = {
  official: { label: "Official Filing", baseConfidence: 0.95, examples: "SEC EDGAR, state filings, company IR" },
  tier1:    { label: "Tier 1 Press",    baseConfidence: 0.85, examples: "Reuters, Bloomberg, WSJ, TechCrunch, PitchBook" },
  tier2:    { label: "Tier 2 Press",    baseConfidence: 0.70, examples: "NNBW, Vegas Inc, RGJ, trade pubs" },
  tier3:    { label: "Tier 3",          baseConfidence: 0.50, examples: "Blogs, social media, press releases" },
  unknown:  { label: "Unknown",         baseConfidence: 0.30, examples: "Unclassified source" },
};
```

**Step 2: Re-export from index**

Add to `packages/ui-core/src/index.js`:

```js
export { OBJECT_TYPES, LINK_TYPES, EVENT_TYPES, CONFIDENCE_TIERS, getConfidenceTier, SOURCE_CREDIBILITY } from "./ontology.js";
```

**Step 3: Commit**

```bash
git add packages/ui-core/src/ontology.js packages/ui-core/src/index.js
git commit -m "feat: economic development ontology config with confidence tiers"
```

---

### Task 3: Agent Workspace Setup

Create the `agents/` pnpm workspace with shared libraries.

**Files:**
- Create: `agents/package.json`
- Create: `agents/lib/db.js`
- Create: `agents/lib/search.js`
- Create: `agents/lib/llm.js`
- Create: `agents/lib/confidence.js`
- Create: `agents/.env.example`
- Modify: `pnpm-workspace.yaml`

**Step 1: Add agents to pnpm workspace**

Update `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
  - services/*
  - agents
```

**Step 2: Create agents/package.json**

```json
{
  "name": "@bbi/agents",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "timeline": "node timeline/run.js",
    "snapshot": "node snapshot/run.js",
    "scheduler": "node scheduler.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "node-cron": "^3.0.3",
    "sql.js": "^1.12.0",
    "dotenv": "^16.5.0"
  }
}
```

**Step 3: Create agents/.env.example**

```
ANTHROPIC_API_KEY=sk-ant-...
BRAVE_SEARCH_API_KEY=BSA...
```

**Step 4: Create agents/lib/db.js**

```js
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
```

**Step 5: Create agents/lib/search.js**

```js
// Brave Search API wrapper
// Free tier: 2,000 queries/month
// Docs: https://api.search.brave.com/app/documentation/web-search

const BRAVE_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";

export async function searchWeb(query, opts = {}) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) throw new Error("BRAVE_SEARCH_API_KEY not set");

  const params = new URLSearchParams({
    q: query,
    count: String(opts.count || 5),
    freshness: opts.freshness || "pm",  // past month
    text_decorations: "false",
  });

  const res = await fetch(`${BRAVE_ENDPOINT}?${params}`, {
    headers: { "Accept": "application/json", "Accept-Encoding": "gzip", "X-Subscription-Token": apiKey },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave Search error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const results = (data.web?.results || []).map(r => ({
    title: r.title,
    url: r.url,
    description: r.description,
    publishedDate: r.page_age || null,
    domain: new URL(r.url).hostname,
  }));

  return results;
}

// Classify source credibility by domain
const TIER1_DOMAINS = new Set([
  "reuters.com","bloomberg.com","wsj.com","techcrunch.com","pitchbook.com",
  "crunchbase.com","sec.gov","nytimes.com","ft.com","theinformation.com",
]);
const TIER2_DOMAINS = new Set([
  "nnbw.com","vegasinc.lasvegassun.com","rgj.com","lasvegassun.com",
  "reviewjournal.com","nevadaappeal.com","businesswire.com","prnewswire.com",
  "venturebeat.com","siliconangle.com","axios.com","wired.com",
]);

export function classifySource(url) {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    if (domain.endsWith(".gov")) return "official";
    if (TIER1_DOMAINS.has(domain)) return "tier1";
    if (TIER2_DOMAINS.has(domain)) return "tier2";
    // Check for known tier3
    if (domain.includes("medium.com") || domain.includes("substack.com") ||
        domain.includes("twitter.com") || domain.includes("x.com") ||
        domain.includes("linkedin.com") || domain.includes("reddit.com")) return "tier3";
    return "unknown";
  } catch { return "unknown"; }
}
```

**Step 6: Create agents/lib/llm.js**

```js
import Anthropic from "@anthropic-ai/sdk";

let _client = null;

function getClient() {
  if (_client) return _client;
  _client = new Anthropic();  // uses ANTHROPIC_API_KEY env var
  return _client;
}

/**
 * Extract structured event data from a search result snippet.
 * Returns null if the snippet is not about a relevant event.
 */
export async function extractEvent(companyName, snippet, sourceUrl) {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are a financial data extraction agent for Nevada's startup ecosystem intelligence platform.

Extract a structured event from this text about "${companyName}". Only extract if the text describes a REAL, specific event (funding round, partnership, hire, grant, launch, award, patent, or acquisition).

Source URL: ${sourceUrl}

Text:
${snippet}

Respond with ONLY valid JSON (no markdown, no explanation). If no real event is found, respond with: {"event": null}

If an event is found:
{
  "event": {
    "date": "YYYY-MM-DD",
    "type": "funding|grant|partnership|hiring|momentum|launch|award|patent|acquisition",
    "detail": "One sentence summary of the event",
    "amount": null or number in millions (e.g. 4.5 for $4.5M),
    "round_type": null or "pre_seed|seed|series_a|series_b|series_c_plus|growth|debt|sbir_1|sbir_2|doe|state",
    "investors": [] or ["investor name 1", "investor name 2"],
    "icon": "emoji matching event type",
    "date_confidence": "exact|approximate|inferred",
    "amount_confidence": "exact|approximate|inferred"
  }
}

CRITICAL RULES:
- The date MUST appear in the source text or be derivable from publication date. If you cannot determine the date, set date_confidence to "inferred".
- The amount MUST appear as an exact number in the text. Do NOT estimate or infer amounts. If no exact amount, set amount to null.
- Only extract events directly related to "${companyName}" in Nevada.
- Be conservative. When in doubt, return {"event": null}.`
    }],
  });

  try {
    const text = response.content[0].text.trim();
    const parsed = JSON.parse(text);
    return parsed.event;
  } catch {
    return null;
  }
}

/**
 * Verify an existing timeline event against its claimed details.
 * Returns a verification result.
 */
export async function verifyEvent(event, searchResults) {
  const client = getClient();

  const snippets = searchResults.map((r, i) => `[${i+1}] ${r.title}\n${r.description}\nURL: ${r.url}`).join("\n\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-20250414",
    max_tokens: 512,
    messages: [{
      role: "user",
      content: `Verify this timeline event about "${event.company}" against these search results.

Event to verify:
- Date: ${event.date}
- Type: ${event.type}
- Detail: ${event.detail}

Search results:
${snippets}

Respond with ONLY valid JSON:
{
  "verified": true or false,
  "corrected_date": "YYYY-MM-DD" or null (if date is wrong),
  "corrected_detail": "..." or null (if detail needs update),
  "best_source_index": 1-based index of best matching result, or null,
  "notes": "brief explanation"
}`
    }],
  });

  try {
    return JSON.parse(response.content[0].text.trim());
  } catch {
    return { verified: false, notes: "LLM parse error" };
  }
}
```

**Step 7: Create agents/lib/confidence.js**

```js
import { SOURCE_CREDIBILITY } from "../../packages/ui-core/src/ontology.js";

/**
 * Compute confidence score for an extracted event.
 * @param {object} extraction - The LLM extraction result
 * @param {string} sourceCredibility - 'official', 'tier1', 'tier2', 'tier3', 'unknown'
 * @param {number} corroboratingSourceCount - Number of other sources that agree
 */
export function computeConfidence(extraction, sourceCredibility, corroboratingSourceCount = 0) {
  const baseCred = SOURCE_CREDIBILITY[sourceCredibility]?.baseConfidence || 0.30;

  // Extraction quality penalties
  let extractionScore = 1.0;
  if (extraction.date_confidence === "inferred") extractionScore -= 0.30;
  else if (extraction.date_confidence === "approximate") extractionScore -= 0.10;
  if (extraction.amount_confidence === "inferred") extractionScore -= 0.20;
  else if (extraction.amount_confidence === "approximate") extractionScore -= 0.05;

  // Base confidence = source credibility × extraction quality
  let confidence = baseCred * extractionScore;

  // Corroboration bonus: each additional source adds up to 0.15
  if (corroboratingSourceCount >= 2) confidence = Math.min(confidence + 0.15, 0.95);
  else if (corroboratingSourceCount >= 1) confidence = Math.min(confidence + 0.10, 0.90);

  return Math.round(confidence * 100) / 100;
}

/**
 * Determine if a record should be quarantined or published.
 */
export function shouldQuarantine(confidence) {
  return confidence < 0.60;
}

/**
 * Check if two events are duplicates (same company + similar date + same type).
 */
export function isDuplicate(newEvent, existingEvents) {
  return existingEvents.some(ex => {
    if (ex.company !== newEvent.company) return false;
    if (ex.type !== newEvent.type) return false;
    // Same date or within 3 days
    const d1 = new Date(ex.date);
    const d2 = new Date(newEvent.date);
    const diffDays = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });
}
```

**Step 8: Install dependencies**

```bash
cd agents && pnpm install
```

**Step 9: Commit**

```bash
git add agents/ pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat: agents workspace with shared db, search, llm, confidence libs"
```

---

### Task 4: Timeline Verification Agent

The core agent that searches for SSBCI company mentions and populates verified events.

**Files:**
- Create: `agents/timeline/run.js`
- Create: `agents/timeline/search-companies.js`
- Create: `agents/timeline/extract-events.js`
- Create: `agents/timeline/verify-existing.js`

**Step 1: Create agents/timeline/search-companies.js**

```js
import { queryAll } from "../lib/db.js";
import { searchWeb } from "../lib/search.js";

/**
 * For each SSBCI-eligible company, search for recent news mentions.
 * Returns array of { company, results[] }
 */
export async function searchCompanies(db, opts = {}) {
  const fund = opts.fund || "bbv";
  const companies = queryAll(db, "SELECT * FROM companies").map(r => ({
    ...r, eligible: JSON.parse(r.eligible || "[]"),
  }));

  const eligible = companies.filter(c => c.eligible.includes(fund));
  console.log(`Searching ${eligible.length} ${fund.toUpperCase()}-eligible companies...`);

  const results = [];
  for (const company of eligible) {
    try {
      const query = `"${company.name}" Nevada ${new Date().getFullYear()}`;
      const searchResults = await searchWeb(query, { count: 5, freshness: "pm" });
      results.push({ company, searchResults });
      console.log(`  ${company.name}: ${searchResults.length} results`);
      // Rate limit: 1 req/sec for free tier
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.error(`  ${company.name}: search error — ${err.message}`);
      results.push({ company, searchResults: [], error: err.message });
    }
  }

  return results;
}
```

**Step 2: Create agents/timeline/extract-events.js**

```js
import { extractEvent } from "../lib/llm.js";
import { classifySource } from "../lib/search.js";
import { computeConfidence, shouldQuarantine, isDuplicate } from "../lib/confidence.js";
import { queryAll, run, now } from "../lib/db.js";

/**
 * Process search results: extract events via LLM, score confidence, write to DB.
 */
export async function extractAndStoreEvents(db, companySearchResults) {
  const existingEvents = queryAll(db, "SELECT * FROM timeline_events");
  let added = 0, quarantined = 0, skipped = 0;

  for (const { company, searchResults } of companySearchResults) {
    if (!searchResults || searchResults.length === 0) continue;

    const extractedForCompany = [];

    for (const result of searchResults) {
      try {
        const event = await extractEvent(company.name, result.description, result.url);
        if (!event) { skipped++; continue; }

        // Attach company name
        event.company = company.name;

        // Check for duplicates against existing + already extracted
        if (isDuplicate(event, [...existingEvents, ...extractedForCompany])) {
          skipped++;
          continue;
        }

        const sourceCredibility = classifySource(result.url);

        // Count corroborating sources (other results about same event)
        const corroborating = searchResults.filter(r =>
          r.url !== result.url &&
          r.description.toLowerCase().includes(company.name.toLowerCase())
        ).length;

        const confidence = computeConfidence(event, sourceCredibility, corroborating);

        if (shouldQuarantine(confidence)) {
          // Write to pending_review
          run(db, `INSERT INTO pending_review (target_table, proposed_data, confidence, sources, agent_id, created_at, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events",
            JSON.stringify(event),
            confidence,
            JSON.stringify([{ url: result.url, title: result.title, credibility: sourceCredibility }]),
            "timeline_v1",
            now(),
            "pending",
          ]);
          quarantined++;
        } else {
          // Write to live timeline_events
          run(db, `INSERT INTO timeline_events (date, type, company, detail, icon, amount, round_type, investors, source_url, confidence, agent_id, created_at, verified)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            event.date,
            event.type,
            company.name,
            event.detail,
            event.icon || "📰",
            event.amount || null,
            event.round_type || null,
            event.investors ? JSON.stringify(event.investors) : null,
            result.url,
            confidence,
            "timeline_v1",
            now(),
            0,  // not human-verified yet
          ]);

          // Write source attribution
          const lastId = queryAll(db, "SELECT last_insert_rowid() as id")[0].id;
          run(db, `INSERT INTO data_sources (record_type, record_id, url, title, published_date, accessed_at, source_credibility, extraction_method)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events",
            lastId,
            result.url,
            result.title,
            result.publishedDate || null,
            now(),
            sourceCredibility,
            "llm",
          ]);

          extractedForCompany.push(event);
          added++;
        }
      } catch (err) {
        console.error(`  Extract error for ${company.name}: ${err.message}`);
      }
    }
  }

  return { added, quarantined, skipped };
}
```

**Step 3: Create agents/timeline/verify-existing.js**

```js
import { queryAll, run, now } from "../lib/db.js";
import { searchWeb } from "../lib/search.js";
import { verifyEvent } from "../lib/llm.js";
import { classifySource } from "../lib/search.js";

/**
 * Re-verify existing seed events that haven't been verified recently.
 * Checks dates and details against current web sources.
 */
export async function verifyExistingEvents(db, opts = {}) {
  const limit = opts.limit || 10;  // verify up to N events per run

  // Get seed events (agent_id='seed') that haven't been verified
  const events = queryAll(db,
    "SELECT * FROM timeline_events WHERE agent_id = 'seed' ORDER BY date DESC LIMIT ?",
    [limit]
  );

  console.log(`Verifying ${events.length} existing events...`);
  let verified = 0, corrected = 0, failed = 0;

  for (const event of events) {
    try {
      const query = `"${event.company}" ${event.type} ${event.date.slice(0, 7)}`;
      const results = await searchWeb(query, { count: 3, freshness: "py" }); // past year
      await new Promise(r => setTimeout(r, 1100));  // rate limit

      if (results.length === 0) {
        console.log(`  ${event.company} (${event.date}): no results found`);
        failed++;
        continue;
      }

      const verification = await verifyEvent(event, results);

      if (verification.verified) {
        // Update as verified with best source
        const bestSource = verification.best_source_index
          ? results[verification.best_source_index - 1]
          : results[0];

        run(db, "UPDATE timeline_events SET verified = 1, source_url = ? WHERE id = ?",
          [bestSource?.url || null, event.id]);

        if (bestSource) {
          run(db, `INSERT INTO data_sources (record_type, record_id, url, title, accessed_at, source_credibility, extraction_method)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            "timeline_events", event.id, bestSource.url, bestSource.title,
            now(), classifySource(bestSource.url), "llm_verify",
          ]);
        }

        verified++;
        console.log(`  ${event.company} (${event.date}): ✅ verified`);
      } else if (verification.corrected_date || verification.corrected_detail) {
        // Apply corrections
        const newDate = verification.corrected_date || event.date;
        const newDetail = verification.corrected_detail || event.detail;
        run(db, "UPDATE timeline_events SET date = ?, detail = ?, verified = 1 WHERE id = ?",
          [newDate, newDetail, event.id]);
        corrected++;
        console.log(`  ${event.company}: 🔧 corrected date ${event.date} → ${newDate}`);
      } else {
        failed++;
        console.log(`  ${event.company} (${event.date}): ❌ could not verify — ${verification.notes}`);
      }
    } catch (err) {
      console.error(`  Verify error for ${event.company}: ${err.message}`);
      failed++;
    }
  }

  return { verified, corrected, failed };
}
```

**Step 4: Create agents/timeline/run.js**

```js
import "dotenv/config";
import { getDb, saveDb } from "../lib/db.js";
import { searchCompanies } from "./search-companies.js";
import { extractAndStoreEvents } from "./extract-events.js";
import { verifyExistingEvents } from "./verify-existing.js";

async function main() {
  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`BBI Timeline Agent — ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  const db = await getDb();

  // Phase 1: Search for new events
  console.log("--- Phase 1: Searching for new events ---");
  const companyResults = await searchCompanies(db);
  const { added, quarantined, skipped } = await extractAndStoreEvents(db, companyResults);
  console.log(`\nNew events: ${added} added, ${quarantined} quarantined, ${skipped} skipped\n`);

  // Phase 2: Verify existing events
  console.log("--- Phase 2: Verifying existing events ---");
  const { verified, corrected, failed } = await verifyExistingEvents(db);
  console.log(`\nVerification: ${verified} verified, ${corrected} corrected, ${failed} failed\n`);

  // Save database
  saveDb(db);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`${"=".repeat(60)}`);
  console.log(`Complete in ${elapsed}s — ${added} new, ${quarantined} quarantined, ${verified} verified`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch(err => {
  console.error("Timeline agent failed:", err);
  process.exit(1);
});
```

**Step 5: Test the agent (dry run)**

```bash
cd agents && ANTHROPIC_API_KEY=your_key BRAVE_SEARCH_API_KEY=your_key node timeline/run.js
```

Expected: Agent runs, searches companies, extracts events, logs summary.

**Step 6: Commit**

```bash
git add agents/timeline/
git commit -m "feat: timeline verification agent — search, extract, verify"
```

---

### Task 5: Snapshot Agent

Captures periodic state snapshots of all tracked entities.

**Files:**
- Create: `agents/snapshot/run.js`

**Step 1: Create agents/snapshot/run.js**

```js
import "dotenv/config";
import { getDb, queryAll, run, saveDb, now } from "../lib/db.js";

async function main() {
  const period = process.argv[2] || "monthly";
  const snapshotDate = new Date().toISOString().slice(0, 10);

  console.log(`\nBBI Snapshot Agent — ${period} snapshot for ${snapshotDate}\n`);

  const db = await getDb();

  // Check if snapshot already exists for this date+period
  const existing = queryAll(db,
    "SELECT COUNT(*) as count FROM entity_snapshots WHERE snapshot_date = ? AND period = ?",
    [snapshotDate, period]
  );
  if (existing[0]?.count > 0) {
    console.log(`Snapshot already exists for ${snapshotDate} (${period}). Skipping.`);
    return;
  }

  // Snapshot all companies
  const companies = queryAll(db, "SELECT * FROM companies");
  let count = 0;

  for (const c of companies) {
    const metrics = {
      funding: c.funding,
      momentum: c.momentum,
      employees: c.employees,
      stage: c.stage,
      sectors: c.sectors,  // JSON string
    };

    run(db, `INSERT INTO entity_snapshots (entity_id, snapshot_date, period, metrics)
             VALUES (?, ?, ?, ?)`, [
      `c_${c.id}`,
      snapshotDate,
      period,
      JSON.stringify(metrics),
    ]);
    count++;
  }

  // Snapshot funds
  const funds = queryAll(db, "SELECT * FROM funds");
  for (const f of funds) {
    const metrics = {
      deployed: f.deployed,
      allocated: f.allocated,
      leverage: f.leverage,
      companies: f.companies,
    };

    run(db, `INSERT INTO entity_snapshots (entity_id, snapshot_date, period, metrics)
             VALUES (?, ?, ?, ?)`, [
      f.id,
      snapshotDate,
      period,
      JSON.stringify(metrics),
    ]);
    count++;
  }

  saveDb(db);
  console.log(`Snapshot complete: ${count} entities captured for ${snapshotDate} (${period})`);
}

main().catch(err => {
  console.error("Snapshot agent failed:", err);
  process.exit(1);
});
```

**Step 2: Commit**

```bash
git add agents/snapshot/
git commit -m "feat: snapshot agent for monthly/quarterly entity state captures"
```

---

### Task 6: Cron Scheduler

**Files:**
- Create: `agents/scheduler.js`

**Step 1: Create agents/scheduler.js**

```js
import "dotenv/config";
import cron from "node-cron";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runAgent(script, args = []) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting: ${script} ${args.join(" ")}`);

  return new Promise((resolve) => {
    const child = execFile("node", [join(__dirname, script), ...args], {
      cwd: __dirname,
      env: process.env,
      timeout: 10 * 60 * 1000,  // 10 min timeout
    }, (error, stdout, stderr) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (error) {
        console.error(`[${new Date().toISOString()}] FAILED (${elapsed}s): ${script}\n${stderr}`);
      } else {
        console.log(stdout);
        console.log(`[${new Date().toISOString()}] Complete (${elapsed}s): ${script}`);
      }
      resolve();
    });
  });
}

// 6:30am PST = 14:30 UTC
cron.schedule("30 14 * * *", () => {
  console.log("\n🌅 Morning intelligence run (6:30am PST)");
  runAgent("timeline/run.js");
}, { timezone: "America/Los_Angeles" });

// 12:00pm PST = 20:00 UTC
cron.schedule("0 12 * * *", () => {
  console.log("\n☀️ Midday refresh (12:00pm PST)");
  runAgent("timeline/run.js");
}, { timezone: "America/Los_Angeles" });

// Monthly snapshot: 1st of month at 6:00am PST
cron.schedule("0 6 1 * *", () => {
  console.log("\n📸 Monthly snapshot");
  runAgent("snapshot/run.js", ["monthly"]);
}, { timezone: "America/Los_Angeles" });

// Quarterly snapshot: Jan 1, Apr 1, Jul 1, Oct 1 at 6:15am PST
cron.schedule("15 6 1 1,4,7,10 *", () => {
  console.log("\n📸 Quarterly snapshot");
  runAgent("snapshot/run.js", ["quarterly"]);
}, { timezone: "America/Los_Angeles" });

console.log(`\n${"=".repeat(50)}`);
console.log("BBI Agent Scheduler running");
console.log("  Timeline: 6:30am + 12:00pm PST daily");
console.log("  Snapshot: 1st of month (monthly) + Jan/Apr/Jul/Oct (quarterly)");
console.log(`${"=".repeat(50)}\n`);
```

**Step 2: Commit**

```bash
git add agents/scheduler.js
git commit -m "feat: cron scheduler — 6:30am + 12:00pm PST timeline, monthly/quarterly snapshots"
```

---

### Task 7: Graph Hover Sidebar

**Files:**
- Create: `apps/goed/src/components/GraphHoverPanel.jsx`
- Modify: `apps/goed/src/views/Graph.jsx`

**Step 1: Create GraphHoverPanel component**

Create `apps/goed/src/components/GraphHoverPanel.jsx`:

```jsx
import { GP, NODE_CFG, GSTAGE_C, REL_CFG } from "@bbi/ui-core/constants";
import { stageLabel, fmt } from "@bbi/ui-core";
import { getConfidenceTier } from "@bbi/ui-core/ontology";

export default function GraphHoverPanel({ node, position, isMobile, onPin }) {
  if (!node) return null;

  const { type } = node;
  const tier = node.confidence != null ? getConfidenceTier(node.confidence) : null;

  const panelStyle = isMobile
    ? {
        marginTop: 8, padding: 14, background: GP.surface,
        borderRadius: 10, border: `1px solid ${GP.border}`,
        animation: "fadeIn 0.15s ease-out",
      }
    : {
        position: "absolute",
        left: Math.min(position.x + 16, 360),
        top: Math.max(position.y - 20, 10),
        width: 280, padding: 14, background: GP.surface,
        borderRadius: 10, border: `1px solid ${GP.border}`,
        boxShadow: `0 8px 32px ${GP.bg}CC`,
        zIndex: 100, pointerEvents: "auto",
        animation: "fadeIn 0.15s ease-out",
      };

  return (
    <div style={panelStyle} onClick={onPin}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{NODE_CFG[type]?.icon || "◎"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GP.text }}>{node.label}</div>
          <div style={{ fontSize: 9, color: NODE_CFG[type]?.color || GP.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            {NODE_CFG[type]?.label || type}
            {tier && <span style={{ marginLeft: 6, color: tier.color }}>{tier.icon}</span>}
          </div>
        </div>
      </div>

      {/* Company details */}
      {type === "company" && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {node.stage && (
              <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: (GSTAGE_C[node.stage] || GP.muted) + "20", color: GSTAGE_C[node.stage] || GP.muted, border: `1px solid ${(GSTAGE_C[node.stage] || GP.muted)}30` }}>
                {stageLabel(node.stage)}
              </span>
            )}
            {node.city && <span style={{ fontSize: 9, color: GP.muted }}>{node.city}</span>}
            {node.founded && <span style={{ fontSize: 9, color: GP.muted }}>Est. {node.founded}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
            <Metric label="Funding" value={node.funding ? fmt(node.funding) : "—"} color={GP.green} />
            <Metric label="Momentum" value={node.momentum || "—"} color={node.momentum > 75 ? GP.green : GP.gold} />
            <Metric label="People" value={node.employees || "—"} color={GP.blue} />
          </div>
          {node.sector && node.sector.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
              {(Array.isArray(node.sector) ? node.sector : []).slice(0, 3).map(s => (
                <span key={s} style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: GP.blue + "15", color: GP.blue }}>{s}</span>
              ))}
            </div>
          )}
          {node.eligible && node.eligible.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(Array.isArray(node.eligible) ? node.eligible : []).map(e => (
                <span key={e} style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: GP.green + "15", color: GP.green }}>✓ {e.toUpperCase()}</span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Fund details */}
      {type === "fund" && (
        <>
          {node.etype && <div style={{ fontSize: 10, color: GP.muted, marginBottom: 6 }}>{node.etype}</div>}
          {node.note && <div style={{ fontSize: 10, color: GP.text, lineHeight: 1.4, marginBottom: 6 }}>{node.note}</div>}
        </>
      )}

      {/* Entity details */}
      {type !== "company" && type !== "fund" && (
        <>
          {node.etype && <div style={{ fontSize: 10, color: GP.muted, marginBottom: 4 }}>{node.etype}</div>}
          {node.role && <div style={{ fontSize: 10, color: GP.text, marginBottom: 4 }}>{node.role}</div>}
          {node.city && <div style={{ fontSize: 9, color: GP.muted, marginBottom: 4 }}>{node.city}</div>}
          {node.note && <div style={{ fontSize: 10, color: GP.text, lineHeight: 1.4 }}>{node.note}</div>}
        </>
      )}

      {!isMobile && (
        <div style={{ fontSize: 8, color: GP.dim, marginTop: 8, textAlign: "center" }}>Click to pin</div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 8, color: GP.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
```

**Step 2: Wire hover events into Graph.jsx**

Modify `apps/goed/src/views/Graph.jsx`:

Add import at top:
```jsx
import GraphHoverPanel from "../components/GraphHoverPanel.jsx";
```

Add new state variables (after existing `useState` lines):
```jsx
const [hoverNode, setHoverNode] = useState(null);
const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
const [pinned, setPinned] = useState(false);
```

Add hover event handlers inside the `useEffect` (after the existing `cy.on("tap", ...)` handlers, before `cyRef.current = cy;`):

```jsx
    let hoverTimeout = null;
    cy.on("mouseover", "node", (evt) => {
      if (pinned) return;
      clearTimeout(hoverTimeout);
      const node = evt.target;
      const pos = node.renderedPosition();
      setHoverPos({ x: pos.x, y: pos.y });
      setHoverNode({ id: node.id(), ...node.data() });
    });
    cy.on("mouseout", "node", () => {
      if (pinned) return;
      hoverTimeout = setTimeout(() => setHoverNode(null), 200);
    });
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setHoverNode({ id: node.id(), ...node.data() });
      const pos = node.renderedPosition();
      setHoverPos({ x: pos.x, y: pos.y });
      setPinned(true);
    });
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        setPinned(false);
        setHoverNode(null);
        setSelected(null);
      }
    });
```

**Important:** Remove the existing `cy.on("tap", "node", ...)` and `cy.on("tap", ...)` handlers (lines ~127-145 in current file) since the new handlers above replace them.

Replace the existing `{selected && (...)}` JSX block at the bottom with:

```jsx
      <GraphHoverPanel
        node={hoverNode || selected}
        position={hoverPos}
        isMobile={isMobile}
        onPin={() => setPinned(true)}
      />
```

**Step 3: Commit**

```bash
git add apps/goed/src/components/GraphHoverPanel.jsx apps/goed/src/views/Graph.jsx
git commit -m "feat: graph node hover sidebar with type-specific detail panels"
```

---

### Task 8: Frontend Confidence Badges + API Endpoints

**Files:**
- Modify: `apps/goed/src/views/Timeline.jsx`
- Create: `services/api/routes/sources.js`
- Create: `services/api/routes/snapshots.js`
- Modify: `services/api/routes/timeline.js` (add pending endpoint)
- Modify: `services/api/server.js` (register new routes)

**Step 1: Add new API routes**

Create `services/api/routes/sources.js`:

```js
import { Router } from "express";

const router = Router();

// GET /api/sources/:recordType/:recordId
router.get("/:recordType/:recordId", (req, res) => {
  const { recordType, recordId } = req.params;
  const sources = req.queryAll(
    "SELECT * FROM data_sources WHERE record_type = ? AND record_id = ? ORDER BY accessed_at DESC",
    [recordType, parseInt(recordId)]
  );
  res.json(sources);
});

export default router;
```

Create `services/api/routes/snapshots.js`:

```js
import { Router } from "express";

const router = Router();

// GET /api/snapshots?entity=c_1&period=monthly
router.get("/", (req, res) => {
  const { entity, period } = req.query;
  let sql = "SELECT * FROM entity_snapshots WHERE 1=1";
  const params = [];

  if (entity) { sql += " AND entity_id = ?"; params.push(entity); }
  if (period) { sql += " AND period = ?"; params.push(period); }

  sql += " ORDER BY snapshot_date DESC";

  const snapshots = req.queryAll(sql, params);
  // Parse metrics JSON
  const parsed = snapshots.map(s => ({ ...s, metrics: JSON.parse(s.metrics || "{}") }));
  res.json(parsed);
});

export default router;
```

**Step 2: Add pending review endpoint to timeline route**

Add to `services/api/routes/timeline.js` (after the existing GET "/" handler):

```js
router.get("/pending", (req, res) => {
  const pending = req.queryAll(
    "SELECT * FROM pending_review WHERE target_table = 'timeline_events' AND status = 'pending' ORDER BY created_at DESC"
  );
  const parsed = pending.map(p => ({ ...p, proposed_data: JSON.parse(p.proposed_data || "{}"), sources: JSON.parse(p.sources || "[]") }));
  res.json(parsed);
});

router.post("/:id/verify", (req, res) => {
  const id = parseInt(req.params.id);
  const pending = req.queryOne("SELECT * FROM pending_review WHERE id = ?", [id]);
  if (!pending) return res.status(404).json({ error: "Not found" });

  const data = JSON.parse(pending.proposed_data);
  // Promote to live timeline_events
  req.db.run(
    `INSERT INTO timeline_events (date, type, company, detail, icon, amount, round_type, investors, source_url, confidence, agent_id, created_at, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.date, data.type, data.company, data.detail, data.icon || "📰", data.amount || null,
     data.round_type || null, data.investors ? JSON.stringify(data.investors) : null,
     null, pending.confidence, pending.agent_id, pending.created_at, 1]
  );

  // Mark as approved
  req.db.run("UPDATE pending_review SET status = 'approved', reviewed_at = ? WHERE id = ?",
    [new Date().toISOString(), id]);

  res.json({ ok: true });
});
```

**Step 3: Register new routes in server.js**

Add imports to `services/api/server.js`:

```js
import sourcesRouter from "./routes/sources.js";
import snapshotsRouter from "./routes/snapshots.js";
```

Add route registrations (after existing `app.use` lines):

```js
app.use("/api/sources", sourcesRouter);
app.use("/api/snapshots", snapshotsRouter);
```

**Step 4: Update Timeline.jsx with confidence badges**

Replace `apps/goed/src/views/Timeline.jsx`:

```jsx
import { useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { BORDER, MUTED, GOLD, GREEN, BLUE, ORANGE, PURPLE, TEXT, fadeIn } from "@bbi/ui-core";
import { getConfidenceTier } from "@bbi/ui-core/ontology";

export default function Timeline({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
  const { data: events } = useApi("/timeline" + fundParam);
  const [expandedSource, setExpandedSource] = useState(null);

  if (!events) return <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Loading timeline...</div>;

  const typeColor = (type) =>
    type === "funding" ? GREEN : type === "grant" ? BLUE : type === "momentum" ? GOLD :
    type === "hiring" ? ORANGE : type === "patent" ? PURPLE : MUTED;

  return (
    <div style={fadeIn}>
      <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
        Ecosystem Activity Feed
      </div>
      <div style={{ borderLeft: `2px solid ${BORDER}`, marginLeft: isMobile ? 10 : 20, paddingLeft: isMobile ? 16 : 24 }}>
        {events.map((ev, i) => {
          const tier = ev.confidence != null ? getConfidenceTier(ev.confidence) : null;
          const isVerified = ev.verified === 1;
          const isExpanded = expandedSource === i;

          return (
            <div key={ev.id || i} style={{ position: "relative", marginBottom: 18, paddingBottom: 4, ...fadeIn }}>
              <div style={{
                position: "absolute", left: isMobile ? -25 : -33, top: 4,
                width: 16, height: 16, borderRadius: "50%", background: "#111110",
                border: `2px solid ${typeColor(ev.type)}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
              }}>{ev.icon}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: MUTED }}>{ev.date}</span>
                {tier && !isVerified && (
                  <span
                    onClick={() => setExpandedSource(isExpanded ? null : i)}
                    style={{ cursor: "pointer", fontSize: 9, color: tier.color }}
                    title={`${tier.label} confidence (${ev.confidence})`}
                  >
                    {tier.icon}
                  </span>
                )}
                {isVerified && tier && tier.min >= 0.85 && (
                  <span style={{ fontSize: 9, color: "#4E9B60" }} title="Verified">✅</span>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.company}</div>
              <div style={{ fontSize: 12, color: TEXT }}>{ev.detail}</div>

              {ev.amount && (
                <span style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>
                  ${ev.amount >= 1000 ? `${(ev.amount/1000).toFixed(1)}B` : `${ev.amount}M`}
                  {ev.round_type && ` · ${ev.round_type.replace("_", " ")}`}
                </span>
              )}

              {isExpanded && ev.source_url && (
                <div style={{ marginTop: 4, padding: 8, background: "#111110", borderRadius: 6, border: `1px solid ${BORDER}`, fontSize: 10 }}>
                  <div style={{ color: MUTED, marginBottom: 2 }}>Source:</div>
                  <a href={ev.source_url} target="_blank" rel="noopener noreferrer"
                     style={{ color: BLUE, textDecoration: "none", wordBreak: "break-all" }}>
                    {ev.source_url.length > 60 ? ev.source_url.slice(0, 60) + "..." : ev.source_url}
                  </a>
                  <div style={{ color: MUTED, marginTop: 4 }}>
                    Agent: {ev.agent_id || "seed"} · Confidence: {ev.confidence}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 5: Commit**

```bash
git add services/api/routes/sources.js services/api/routes/snapshots.js services/api/routes/timeline.js services/api/server.js apps/goed/src/views/Timeline.jsx
git commit -m "feat: confidence badges on timeline, source/snapshot API endpoints"
```

---

## Verification Checklist

After all tasks:

1. **Schema**: Run `node services/api/db/migrate-v2.js` — should add all new columns/tables
2. **API**: Restart API server, verify `/api/timeline` returns events with `confidence` field
3. **Graph hover**: Navigate to Graph view, hover over a node — panel should appear
4. **Timeline badges**: Navigate to Timeline — should show confidence icons
5. **Agent dry run**: Run `node agents/timeline/run.js` with API keys — should search, extract, log summary
6. **Snapshot**: Run `node agents/snapshot/run.js monthly` — should create snapshots
7. **Scheduler**: Run `node agents/scheduler.js` — should print schedule and wait for cron triggers
