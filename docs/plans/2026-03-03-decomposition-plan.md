# BBI Monorepo Decomposition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Decompose the 2245-line single-file BBI app into a pnpm monorepo with Express + SQLite API backend and Cytoscape.js graph visualization.

**Architecture:** Three-phase migration. Phase 1 scaffolds the monorepo and builds the Express + SQLite backend (services/api/) with all data migrated. Phase 2 decomposes the frontend into apps/goed/ with extracted views, shared components, and packages/ui-core/ for constants/helpers. Phase 3 replaces D3 force-directed graph with Cytoscape.js.

**Tech Stack:** React 19, Vite 8, Express, better-sqlite3, Cytoscape.js, pnpm workspaces

---

### Task 1: Scaffold pnpm monorepo structure

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json` (root)
- Create: `apps/goed/package.json`
- Create: `apps/goed/vite.config.js`
- Create: `apps/goed/index.html`
- Create: `packages/ui-core/package.json`
- Create: `services/api/package.json`

**Step 1: Create pnpm workspace config**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
```

**Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "battlebornintel",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter @bbi/api dev\" \"pnpm --filter @bbi/goed dev\"",
    "build": "pnpm --filter @bbi/goed build",
    "seed": "pnpm --filter @bbi/api seed"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

**Step 3: Create apps/goed/package.json**

```json
{
  "name": "@bbi/goed",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@bbi/ui-core": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.1.1",
    "vite": "^8.0.0-beta.13"
  }
}
```

**Step 4: Create apps/goed/vite.config.js**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

**Step 5: Create apps/goed/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Battle Born Intelligence</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 6: Create packages/ui-core/package.json**

```json
{
  "name": "@bbi/ui-core",
  "version": "0.0.0",
  "type": "module",
  "main": "src/index.js",
  "exports": {
    ".": "./src/index.js",
    "./constants": "./src/constants.js",
    "./scoring": "./src/scoring.js",
    "./reap": "./src/reap.js"
  }
}
```

**Step 7: Create services/api/package.json**

```json
{
  "name": "@bbi/api",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "seed": "node db/seed.js"
  },
  "dependencies": {
    "better-sqlite3": "^11.8.2",
    "cors": "^2.8.5",
    "express": "^5.1.0"
  }
}
```

**Step 8: Update .gitignore**

Add to `.gitignore`:
```
node_modules/
services/api/db/bbi.db
dist/
```

**Step 9: Commit**

```bash
git add pnpm-workspace.yaml package.json apps/ packages/ services/ .gitignore
git commit -m "scaffold: pnpm monorepo with apps/goed, packages/ui-core, services/api"
```

---

### Task 2: Extract constants and helpers to packages/ui-core

**Files:**
- Create: `packages/ui-core/src/constants.js`
- Create: `packages/ui-core/src/scoring.js`
- Create: `packages/ui-core/src/reap.js`
- Create: `packages/ui-core/src/index.js`
- Source: `src/App.jsx:9-31,33-44,46-53,793-831,834,843-873`

**Step 1: Create packages/ui-core/src/constants.js**

Extract all color constants, config objects, VIEWS, stage labels, formatters:

```js
// ── Colors ──
export const GOLD = "#C49A38", DARK = "#08080A", CARD = "#111110", BORDER = "#1E1D1A";
export const TEXT = "#E2DCD0", MUTED = "#706C64", GREEN = "#4E9B60", RED = "#C25550";
export const BLUE = "#5088A8", PURPLE = "#8868A8", ORANGE = "#D4864A";

export const STAGE_COLORS = { pre_seed: "#706C64", seed: "#5088A8", series_a: "#4E9B60", series_b: ORANGE, series_c_plus: PURPLE, growth: GOLD };

// ── Graph palette ──
export const GP = { bg:"#08080B",surface:"#111117",card:"#18181F",border:"#2A2A35",text:"#D4D0C8",muted:"#6B6A72",dim:"#3D3D48",gold:"#C8A55A",green:"#4ECDC4",blue:"#5B8DEF",purple:"#9B72CF",orange:"#E8945A",red:"#E85D5D",cyan:"#5BC0DE",pink:"#D46B9E",lime:"#8BC34A",teal:"#26A69A" };

export const NODE_CFG = {
  company:{color:GP.gold,label:"Companies",icon:"⬡"},fund:{color:GP.purple,label:"Funds",icon:"◈"},sector:{color:GP.blue,label:"Sectors",icon:"◉"},region:{color:GP.orange,label:"Regions",icon:"⊞"},
  person:{color:GP.purple,label:"People",icon:"●"},external:{color:GP.cyan,label:"External",icon:"△"},exchange:{color:GP.pink,label:"Exchanges",icon:"◧"},
  accelerator:{color:GP.lime,label:"Accelerators",icon:"▲"},ecosystem:{color:"#7986CB",label:"Ecosystem Orgs",icon:"⊕"},
};

export const REL_CFG = {
  eligible_for:{color:GP.gold,label:"Eligible For",dash:""},operates_in:{color:GP.blue,label:"Operates In",dash:"3,2"},headquartered_in:{color:GP.orange,label:"HQ In",dash:"6,3"},
  invested_in:{color:GP.green,label:"Invested In",dash:""},loaned_to:{color:GP.green,label:"Loaned To",dash:"4,2"},partners_with:{color:GP.cyan,label:"Partners With",dash:""},
  contracts_with:{color:GP.cyan,label:"Contracts With",dash:"4,4"},acquired:{color:GP.red,label:"Acquired",dash:""},founder_of:{color:GP.purple,label:"Founded",dash:""},
  manages:{color:GP.purple,label:"Manages",dash:"3,2"},listed_on:{color:GP.pink,label:"Listed On",dash:"2,2"},accelerated_by:{color:GP.lime,label:"Accelerated By",dash:""},
  won_pitch:{color:GP.lime,label:"Won Pitch",dash:""},incubated_by:{color:GP.lime,label:"Incubated By",dash:"3,2"},program_of:{color:GP.lime,label:"Program Of",dash:"4,3"},
  supports:{color:"#7986CB",label:"Supports",dash:"3,2"},housed_at:{color:"#7986CB",label:"Housed At",dash:"4,3"},collaborated_with:{color:GP.cyan,label:"Collaborated With",dash:"3,3"},
  funds:{color:GP.gold,label:"Funds",dash:""},approved_by:{color:GP.teal,label:"Approved By",dash:"5,3"},filed_with:{color:GP.pink,label:"Filed With",dash:"4,4"},competes_with:{color:"#FF7043",label:"Competes With",dash:"2,4"},grants_to:{color:GP.green,label:"Grants To",dash:"4,2"},
};

export const GSTAGE_C = { pre_seed:GP.dim,seed:GP.blue,series_a:GP.green,series_b:GP.orange,series_c_plus:GP.purple,growth:GP.gold };

export const VIEWS = [
  { id: "dashboard", label: "Home", icon: "◆" },
  { id: "ssbci", label: "SSBCI", icon: "★" },
  { id: "radar", label: "Radar", icon: "📡" },
  { id: "companies", label: "Companies", icon: "⬡" },
  { id: "investors", label: "Funds", icon: "◈" },
  { id: "sectors", label: "Sectors", icon: "◉" },
  { id: "graph", label: "Graph", icon: "🕸" },
  { id: "timeline", label: "Activity", icon: "⏱" },
  { id: "map", label: "Map", icon: "⊕" },
  { id: "brief", label: "Brief", icon: "📋" },
];

export const TRIGGER_CFG = {
  rapid_funding:  { i:"🔥", l:"Rapid Funding",  c:"#EF4444" },
  grant_validated:{ i:"🏛️", l:"Grant Validated", c:"#3B82F6" },
  hiring_surge:   { i:"📈", l:"Hiring Surge",    c:"#F59E0B" },
  hot_sector:     { i:"🌡️", l:"Hot Sector",      c:"#F97316" },
  ssbci_eligible: { i:"🏦", l:"SSBCI Match",     c:"#8B5CF6" },
  high_momentum:  { i:"⚡", l:"High Momentum",   c:"#22C55E" },
};

export const GRADE_COLORS = { A:"#4ADE80","A-":"#86EFAC","B+":"#FACC15",B:"#FDE047","B-":"#FEF08A","C+":"#FB923C",C:"#FDBA74",D:"#F87171" };

// ── Formatters ──
export const fmt = m => m >= 1000 ? `$${(m/1000).toFixed(1)}B` : m >= 1 ? `$${m.toFixed(1)}M` : m > 0 ? `$${(m*1000).toFixed(0)}K` : "—";
export const stageLabel = s => ({ pre_seed:"Pre-Seed", seed:"Seed", series_a:"Series A", series_b:"Series B", series_c_plus:"Series C+", growth:"Growth" }[s] || s);

// ── CSS animations ──
export const fadeIn = { animation: "fadeIn 0.3s ease-out" };
export const css = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
```

**Step 2: Create packages/ui-core/src/scoring.js**

Extract IRS computation and graph metrics:

```js
// ── Sector Heat & Stage Norms ──
export const SHEAT = { AI:95, Cybersecurity:88, Defense:85, Cleantech:82, Mining:78, Aerospace:80, Cloud:80, "Data Center":80, Energy:78, Solar:75, Robotics:78, Biotech:72, Fintech:70, Gaming:68, Blockchain:50, Drones:75, Construction:65, Logistics:65, "Materials Science":70, "Real Estate":50, Computing:70, Water:72, Media:58, Payments:68, IoT:65, Manufacturing:60, Semiconductors:82, Hospitality:60, Cannabis:45, Analytics:75, Satellite:82, Identity:80, AdTech:65, Education:62, Healthcare:70, Consumer:55, Fitness:60, Mobile:58, Banking:55, Retail:52 };
export const STAGE_NORMS = { pre_seed:0.5, seed:3, series_a:15, series_b:50, series_c_plus:200, growth:500 };

export function computeIRS(c) {
  const m = Math.min(c.momentum || 0, 100);
  const fv = Math.min((c.funding / (STAGE_NORMS[c.stage] || 3)) * 50, 100);
  const sScores = (c.sector || []).map(s => SHEAT[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs = c.employees >= 100 ? 80 : c.employees >= 30 ? 60 : c.employees >= 15 ? 45 : c.employees >= 5 ? 25 : 10;
  const hasSsbci = c.eligible.some(e => ["bbv","fundnv","1864"].includes(e));
  const hasSbir = c.eligible.includes("sbir");
  const ns = Math.min((c.eligible.length || 0) * 15 + (c.employees > 0 ? 15 : 0), 100);
  const ts = Math.min(30 + (c.employees > 10 ? 25 : 0) + (c.eligible.length * 10), 100);
  const dq = Math.min(60 + (c.description ? 20 : 0) + (c.eligible.length > 0 ? 20 : 0), 100);
  const irs = Math.round(m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 + dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12);
  const grade = irs >= 85 ? "A" : irs >= 78 ? "A-" : irs >= 72 ? "B+" : irs >= 65 ? "B" : irs >= 58 ? "B-" : irs >= 50 ? "C+" : irs >= 42 ? "C" : "D";
  const triggers = [];
  if (fv >= 75) triggers.push("rapid_funding");
  if (sh >= 85) triggers.push("hot_sector");
  if (hasSsbci) triggers.push("ssbci_eligible");
  if (hs >= 50) triggers.push("hiring_surge");
  if (m >= 80) triggers.push("high_momentum");
  if (hasSbir) triggers.push("grant_validated");
  return { ...c, irs, grade, triggers, dims: { momentum: m, funding_velocity: Math.round(fv), market_timing: sh, hiring: hs, data_quality: dq, network: ns, team: ts } };
}

export function computeGraphMetrics(nodes, edges) {
  if (!nodes.length) return { pagerank:{}, betweenness:{}, communities:{}, watchlist:[] };
  const ids = nodes.map(n=>n.id);
  const idx = {}; ids.forEach((id,i) => idx[id]=i);
  const N = ids.length;
  const adj = Array.from({length:N}, ()=>[]);
  const edgeList = [];
  edges.forEach(e => {
    const si=idx[typeof e.source==="object"?e.source.id:e.source];
    const ti=idx[typeof e.target==="object"?e.target.id:e.target];
    if(si!==undefined && ti!==undefined && si!==ti) {
      adj[si].push(ti); adj[ti].push(si);
      edgeList.push([si,ti]);
    }
  });
  // PageRank
  const d = 0.85;
  let pr = new Float64Array(N).fill(1/N);
  for(let iter=0; iter<40; iter++){
    const next = new Float64Array(N).fill((1-d)/N);
    for(let i=0;i<N;i++){
      if(adj[i].length>0){ const share = pr[i]/adj[i].length; for(const j of adj[i]) next[j] += d*share; }
      else { for(let j=0;j<N;j++) next[j] += d*pr[i]/N; }
    }
    pr = next;
  }
  const prMax = Math.max(...pr), prMin = Math.min(...pr), prRange = prMax-prMin||1;
  const pagerank = {};
  ids.forEach((id,i) => pagerank[id] = Math.round(((pr[i]-prMin)/prRange)*100));
  // Betweenness
  const bc = new Float64Array(N).fill(0);
  for(let s=0;s<N;s++){
    const stack=[], pred=Array.from({length:N},()=>[]);
    const sigma=new Float64Array(N).fill(0); sigma[s]=1;
    const dist=new Int32Array(N).fill(-1); dist[s]=0;
    const queue=[s]; let qi=0;
    while(qi<queue.length){
      const v=queue[qi++]; stack.push(v);
      for(const w of adj[v]){
        if(dist[w]<0){ dist[w]=dist[v]+1; queue.push(w); }
        if(dist[w]===dist[v]+1){ sigma[w]+=sigma[v]; pred[w].push(v); }
      }
    }
    const delta=new Float64Array(N).fill(0);
    while(stack.length){ const w=stack.pop(); for(const v of pred[w]) delta[v]+=(sigma[v]/sigma[w])*(1+delta[w]); if(w!==s) bc[w]+=delta[w]; }
  }
  const bcMax = Math.max(...bc)||1;
  const betweenness = {};
  ids.forEach((id,i) => betweenness[id] = Math.round((bc[i]/bcMax)*100));
  // Communities
  const labels = Array.from({length:N}, (_,i)=>i);
  for(let iter=0;iter<20;iter++){
    let changed=false;
    const order=[...Array(N).keys()].sort(()=>Math.random()-0.5);
    for(const i of order){
      if(adj[i].length===0) continue;
      const freq={};
      for(const j of adj[i]) freq[labels[j]]=(freq[labels[j]]||0)+1;
      const maxFreq=Math.max(...Object.values(freq));
      const candidates=Object.entries(freq).filter(([,f])=>f===maxFreq).map(([l])=>parseInt(l));
      const newLabel=candidates[Math.floor(Math.random()*candidates.length)];
      if(newLabel!==labels[i]){ labels[i]=newLabel; changed=true; }
    }
    if(!changed) break;
  }
  const labelMap={}; let nextCid=0;
  const communities={};
  ids.forEach((id,i) => { if(labelMap[labels[i]]===undefined) labelMap[labels[i]]=nextCid++; communities[id]=labelMap[labels[i]]; });
  // Watchlist
  const watchlist = [];
  const nodeMap = {}; nodes.forEach(n => nodeMap[n.id]=n);
  ids.forEach((id,i) => {
    const n = nodeMap[id]; if(!n || n.type!=="company") return;
    const degree = adj[i].length;
    const prScore = pagerank[id], bcScore = betweenness[id], funding = n.funding||0;
    const signals = [];
    if(funding > 50 && degree <= 3) signals.push({type:"undercovered",label:"High funding, few connections",severity:Math.min(100,Math.round(funding/10)),icon:"👁"});
    if(bcScore > 60) signals.push({type:"bridge",label:"Structural bridge between clusters",severity:bcScore,icon:"🌉"});
    if(prScore > 50 && funding < 100) signals.push({type:"hidden_influence",label:"Structurally important beyond funding",severity:prScore,icon:"🔮"});
    if(funding > 200 && prScore < 20) signals.push({type:"isolated_capital",label:"Large funding but low graph connectivity",severity:Math.round(funding/50),icon:"🏝"});
    if(degree >= 8) signals.push({type:"hub",label:`Hub node: ${degree} connections`,severity:degree*5,icon:"⭐"});
    if(signals.length > 0) watchlist.push({id,name:n.label||n.name,degree,pagerank:prScore,betweenness:bcScore,funding,signals,priority:signals.reduce((s,sig)=>s+sig.severity,0)});
  });
  watchlist.sort((a,b) => b.priority - a.priority);
  const numCommunities = nextCid;
  const { GP: _gp } = await import("./constants.js");
  const COMM_COLORS = [_gp?.gold||"#C8A55A",_gp?.green||"#4ECDC4",_gp?.blue||"#5B8DEF",_gp?.purple||"#9B72CF",_gp?.orange||"#E8945A",_gp?.red||"#E85D5D",_gp?.cyan||"#5BC0DE",_gp?.pink||"#D46B9E",_gp?.lime||"#8BC34A",_gp?.teal||"#26A69A","#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"];
  return { pagerank, betweenness, communities, watchlist, numCommunities, commColors:COMM_COLORS, adj, ids, idx };
}
```

**Note:** The `computeGraphMetrics` function uses a dynamic import for GP colors for the community palette. Alternatively, pass COMM_COLORS in from the caller or import GP statically. The implementer should use a static import:

```js
import { GP } from "./constants.js";
const COMM_COLORS = [GP.gold,GP.green,GP.blue,GP.purple,GP.orange,GP.red,GP.cyan,GP.pink,GP.lime,GP.teal,"#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"];
```

and define it at module level, removing the dynamic import inside the function.

**Step 3: Create packages/ui-core/src/reap.js**

Extract REAP constants and helpers:

```js
import { GOLD, GREEN, BLUE, PURPLE, RED } from "./constants.js";

export const REAP_PILLARS = [
  { id: "all", label: "All", icon: "◎", color: GOLD },
  { id: "risk_capital", label: "Risk Capital", icon: "◈", color: GREEN },
  { id: "corporations", label: "Corporations", icon: "△", color: BLUE },
  { id: "entrepreneurs", label: "Entrepreneurs", icon: "⬡", color: GOLD },
  { id: "universities", label: "Universities", icon: "▣", color: PURPLE },
  { id: "government", label: "Government", icon: "⊕", color: RED },
];

export function getReapPillar(entity) {
  if (!entity) return null;
  if (entity.type === "SSBCI" || entity.type === "Angel" || entity.type === "Deep Tech VC" || entity.type === "Growth VC" || entity.type === "Accelerator") return "risk_capital";
  if (entity.etype === "VC Firm" || entity.etype === "PE Firm" || entity.etype === "Investment Co" || entity.etype === "SPAC") return "risk_capital";
  if (entity.etype === "Corporation") return "corporations";
  if (entity.etype === "University" || entity.etype === "University Hub") return "universities";
  if (entity.etype === "Government" || entity.etype === "Economic Development") return "government";
  if (entity.etype === "Foundation") return "government";
  if (entity.stage || entity.momentum !== undefined) return "entrepreneurs";
  if (entity.atype) return "risk_capital";
  return null;
}

export function getCompanyReapConnections(companyId, edges, entities, funds) {
  const connected = new Set();
  edges.forEach(e => {
    const cId = `c_${companyId}`;
    if (e.source === cId || e.target === cId) {
      const otherId = e.source === cId ? e.target : e.source;
      const entity = entities.find(x => x.id === otherId);
      if (entity) {
        const pillar = getReapPillar(entity);
        if (pillar) connected.add(pillar);
      }
      const fundMatch = otherId.startsWith("f_") ? funds.find(f => f.id === otherId.replace("f_","")) : null;
      if (fundMatch) connected.add("risk_capital");
    }
  });
  return connected;
}
```

**Note:** `getCompanyReapConnections` now takes data as parameters instead of referencing module-level globals. This makes it work with API-fetched data.

**Step 4: Create packages/ui-core/src/index.js**

```js
export * from "./constants.js";
export * from "./scoring.js";
export * from "./reap.js";
```

**Step 5: Commit**

```bash
git add packages/ui-core/
git commit -m "feat: extract constants, scoring, and REAP helpers to packages/ui-core"
```

---

### Task 3: Create SQLite schema and seed script

**Files:**
- Create: `services/api/db/schema.sql`
- Create: `services/api/db/seed.js`
- Source: `src/App.jsx:91-187` (COMPANIES), `188-197` (FUNDS), `200-231` (TIMELINE_EVENTS), `237-248` (GRAPH_FUNDS, PEOPLE), `250-403` (EXTERNALS), `404-417` (ACCELERATORS), `418-424` (ECOSYSTEM_ORGS), `425-433` (LISTINGS), `434-746` (VERIFIED_EDGES)

**Step 1: Create services/api/db/schema.sql**

```sql
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT,
  sectors TEXT,
  city TEXT,
  region TEXT,
  funding REAL,
  momentum INTEGER,
  employees INTEGER,
  founded INTEGER,
  description TEXT,
  eligible TEXT,
  lat REAL,
  lng REAL
);

CREATE TABLE IF NOT EXISTS funds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  allocated REAL,
  deployed REAL,
  leverage REAL,
  companies INTEGER,
  thesis TEXT
);

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  etype TEXT,
  atype TEXT,
  role TEXT,
  city TEXT,
  region TEXT,
  founded INTEGER,
  company_id INTEGER,
  note TEXT
);

CREATE TABLE IF NOT EXISTS edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  rel TEXT NOT NULL,
  note TEXT,
  year INTEGER
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  type TEXT,
  company TEXT,
  detail TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS listings (
  company_id INTEGER,
  exchange TEXT,
  ticker TEXT,
  PRIMARY KEY (company_id, exchange)
);

CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target);
CREATE INDEX IF NOT EXISTS idx_entities_category ON entities(category);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(region);
```

**Step 2: Create services/api/db/seed.js**

This script reads the hardcoded data from `src/App.jsx` by importing it programmatically. However, since the data is embedded in JSX (not a standalone module), the seed script must contain the data directly. Copy all data arrays from `src/App.jsx` into the seed script.

```js
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "bbi.db");
const schemaPath = join(__dirname, "schema.sql");

// Create database and apply schema
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(readFileSync(schemaPath, "utf8"));

// ── Data arrays (copied from src/App.jsx) ──
// The implementer must copy ALL data arrays from src/App.jsx lines 91-746
// into this file. Here is the structure — paste the actual arrays:

// const COMPANIES = [ ... ];  // lines 91-187
// const FUNDS = [ ... ];      // lines 188-197
// const TIMELINE_EVENTS = [ ... ]; // lines 200-231
// const GRAPH_FUNDS = [ ... ];     // lines 237-241
// const PEOPLE = [ ... ];          // lines 242-249
// const EXTERNALS = [ ... ];       // lines 250-403
// const ACCELERATORS = [ ... ];    // lines 404-417
// const ECOSYSTEM_ORGS = [ ... ];  // lines 418-424
// const LISTINGS = [ ... ];        // lines 425-433
// const VERIFIED_EDGES = [ ... ];  // lines 434-746

// ── Seed functions ──
function seedCompanies(companies) {
  const stmt = db.prepare(`INSERT OR REPLACE INTO companies (id, name, stage, sectors, city, region, funding, momentum, employees, founded, description, eligible, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const c of companies) {
      stmt.run(c.id, c.name, c.stage, JSON.stringify(c.sector), c.city, c.region, c.funding, c.momentum, c.employees, c.founded, c.description, JSON.stringify(c.eligible), c.lat, c.lng);
    }
  });
  tx();
  console.log(`Seeded ${companies.length} companies`);
}

function seedFunds(funds) {
  const stmt = db.prepare(`INSERT OR REPLACE INTO funds (id, name, type, allocated, deployed, leverage, companies, thesis) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const f of funds) {
      stmt.run(f.id, f.name, f.type, f.allocated, f.deployed, f.leverage, f.companies, f.thesis);
    }
  });
  tx();
  console.log(`Seeded ${funds.length} funds`);
}

function seedEntities(graphFunds, people, externals, accelerators, ecosystemOrgs) {
  const stmt = db.prepare(`INSERT OR REPLACE INTO entities (id, name, category, etype, atype, role, city, region, founded, company_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const f of graphFunds) stmt.run(f.id, f.name, "graph_fund", null, null, null, null, null, null, null, f.type);
    for (const p of people) stmt.run(p.id, p.name, "person", null, null, p.role, null, null, null, p.companyId, p.note);
    for (const x of externals) stmt.run(x.id, x.name, "external", x.etype, null, null, null, null, null, null, x.note);
    for (const a of accelerators) stmt.run(a.id, a.name, "accelerator", null, a.atype, null, a.city, a.region, a.founded, null, a.note);
    for (const o of ecosystemOrgs) stmt.run(o.id, o.name, "ecosystem", o.etype, null, null, o.city, o.region, null, null, o.note);
  });
  tx();
  const total = graphFunds.length + people.length + externals.length + accelerators.length + ecosystemOrgs.length;
  console.log(`Seeded ${total} entities`);
}

function seedEdges(edges) {
  const stmt = db.prepare(`INSERT INTO edges (source, target, rel, note, year) VALUES (?, ?, ?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const e of edges) stmt.run(e.source, e.target, e.rel, e.note, e.y || null);
  });
  tx();
  console.log(`Seeded ${edges.length} edges`);
}

function seedTimeline(events) {
  const stmt = db.prepare(`INSERT INTO timeline_events (date, type, company, detail, icon) VALUES (?, ?, ?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const e of events) stmt.run(e.date, e.type, e.company, e.detail, e.icon);
  });
  tx();
  console.log(`Seeded ${events.length} timeline events`);
}

function seedListings(listings) {
  const stmt = db.prepare(`INSERT OR REPLACE INTO listings (company_id, exchange, ticker) VALUES (?, ?, ?)`);
  const tx = db.transaction(() => {
    for (const l of listings) stmt.run(l.companyId, l.exchange, l.ticker);
  });
  tx();
  console.log(`Seeded ${listings.length} listings`);
}

// ── Run seed ──
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
```

**Important:** The implementer MUST copy the actual data arrays from `src/App.jsx` into this file for the seed to work. These are the arrays at lines 91-746. Declare them as `const` at the top of the file after the imports.

**Step 3: Commit**

```bash
git add services/api/db/
git commit -m "feat: SQLite schema and seed script for BBI data migration"
```

---

### Task 4: Build Express API server and routes

**Files:**
- Create: `services/api/server.js`
- Create: `services/api/routes/companies.js`
- Create: `services/api/routes/funds.js`
- Create: `services/api/routes/graph.js`
- Create: `services/api/routes/timeline.js`
- Create: `services/api/routes/stats.js`

**Step 1: Create services/api/server.js**

```js
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import companiesRouter from "./routes/companies.js";
import fundsRouter from "./routes/funds.js";
import graphRouter from "./routes/graph.js";
import timelineRouter from "./routes/timeline.js";
import statsRouter from "./routes/stats.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "db", "bbi.db");

const db = new Database(dbPath, { readonly: true });
db.pragma("journal_mode = WAL");

const app = express();
app.use(cors());
app.use(express.json());

// Attach db to request
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/api/companies", companiesRouter);
app.use("/api/funds", fundsRouter);
app.use("/api/graph", graphRouter);
app.use("/api/timeline", timelineRouter);
app.use("/api/stats", statsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BBI API running on :${PORT}`));
```

**Step 2: Create services/api/routes/companies.js**

```js
import { Router } from "express";
import { computeIRS } from "@bbi/ui-core/scoring";

const router = Router();

router.get("/", (req, res) => {
  const rows = req.db.prepare("SELECT * FROM companies ORDER BY momentum DESC").all();
  const companies = rows.map(r => ({
    ...r,
    sector: JSON.parse(r.sectors || "[]"),
    eligible: JSON.parse(r.eligible || "[]"),
  }));
  const scored = companies.map(computeIRS).sort((a, b) => b.irs - a.irs);
  res.json(scored);
});

router.get("/:id", (req, res) => {
  const row = req.db.prepare("SELECT * FROM companies WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const company = { ...row, sector: JSON.parse(row.sectors || "[]"), eligible: JSON.parse(row.eligible || "[]") };
  const scored = computeIRS(company);
  const edges = req.db.prepare("SELECT * FROM edges WHERE source = ? OR target = ?").all(`c_${row.id}`, `c_${row.id}`);
  const timeline = req.db.prepare("SELECT * FROM timeline_events WHERE company = ? ORDER BY date DESC").all(row.name);
  res.json({ ...scored, edges, timeline });
});

export default router;
```

**Step 3: Create services/api/routes/funds.js**

```js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const funds = req.db.prepare("SELECT * FROM funds").all();
  res.json(funds);
});

export default router;
```

**Step 4: Create services/api/routes/graph.js**

```js
import { Router } from "express";
import { getReapPillar } from "@bbi/ui-core/reap";

const router = Router();

router.get("/", (req, res) => {
  const pillar = req.query.pillar;
  const companies = req.db.prepare("SELECT * FROM companies").all().map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const entities = req.db.prepare("SELECT * FROM entities").all();
  const edges = req.db.prepare("SELECT * FROM edges").all();
  const listings = req.db.prepare("SELECT * FROM listings").all();

  // Build nodes
  const nodes = [];
  companies.forEach(c => nodes.push({ id: `c_${c.id}`, label: c.name, type: "company", stage: c.stage, funding: c.funding, momentum: c.momentum, employees: c.employees, city: c.city, region: c.region, sector: c.sector, eligible: c.eligible, founded: c.founded }));
  entities.forEach(e => {
    const type = e.category === "graph_fund" ? "fund" : e.category;
    nodes.push({ id: e.id, label: e.name, type, etype: e.etype, atype: e.atype, role: e.role, city: e.city, region: e.region, founded: e.founded, note: e.note, companyId: e.company_id });
  });

  // Filter by REAP pillar if requested
  let filteredNodes = nodes;
  let filteredEdges = edges;
  if (pillar && pillar !== "all") {
    const pillarNodeIds = new Set();
    nodes.forEach(n => {
      if (n.type === "company" && pillar === "entrepreneurs") pillarNodeIds.add(n.id);
      else if (getReapPillar(n) === pillar) pillarNodeIds.add(n.id);
    });
    filteredNodes = nodes; // keep all nodes, let frontend handle opacity
    filteredEdges = edges;
  }

  res.json({ nodes: filteredNodes, edges: filteredEdges, listings });
});

export default router;
```

**Step 5: Create services/api/routes/timeline.js**

```js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const events = req.db.prepare("SELECT * FROM timeline_events ORDER BY date DESC").all();
  res.json(events);
});

export default router;
```

**Step 6: Create services/api/routes/stats.js**

```js
import { Router } from "express";
import { computeIRS } from "@bbi/ui-core/scoring";

const router = Router();

router.get("/ssbci", (req, res) => {
  const ssbciFunds = req.db.prepare("SELECT * FROM funds WHERE type = 'SSBCI'").all();
  const totalDeployed = ssbciFunds.reduce((s, f) => s + f.deployed, 0);
  const totalAllocated = ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0);
  const avgLeverage = ssbciFunds.filter(f => f.leverage).reduce((s, f) => s + f.leverage, 0) / ssbciFunds.filter(f => f.leverage).length;
  const privateLeveraged = Math.round(totalDeployed * avgLeverage);

  const companies = req.db.prepare("SELECT * FROM companies").all().map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const scored = companies.map(computeIRS);
  const ssbciCompanies = scored.filter(c => c.eligible.some(e => ["bbv", "fundnv", "1864"].includes(e)));
  const avgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s, c) => s + c.irs, 0) / ssbciCompanies.length) : 0;

  res.json({
    deployed: totalDeployed,
    allocated: totalAllocated,
    utilization: Math.round(totalDeployed / totalAllocated * 100),
    privateLeveraged,
    avgLeverage: parseFloat(avgLeverage.toFixed(1)),
    portfolioCount: ssbciCompanies.length,
    totalCompanies: companies.length,
    avgIRS,
    funds: ssbciFunds,
  });
});

router.get("/ecosystem", (req, res) => {
  const companies = req.db.prepare("SELECT * FROM companies").all();
  const totalFunding = companies.reduce((s, c) => s + c.funding, 0);
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);
  res.json({ totalFunding, totalEmployees, companyCount: companies.length });
});

export default router;
```

**Step 7: Commit**

```bash
git add services/api/server.js services/api/routes/
git commit -m "feat: Express API server with companies, funds, graph, timeline, stats routes"
```

---

### Task 5: Install dependencies and verify API

**Step 1: Install pnpm if not available**

```bash
npm install -g pnpm
```

**Step 2: Install all workspace dependencies**

```bash
cd /c/Users/shaqc/programming/battlebornintel/.claude/worktrees/clever-lederberg
pnpm install
```

**Step 3: Run seed script**

```bash
pnpm seed
```

Expected: "Seeded 75 companies", "Seeded 8 funds", "Seeded N entities", etc.

**Step 4: Start API and verify endpoints**

```bash
cd services/api && node server.js &
curl http://localhost:3001/api/stats/ssbci
curl http://localhost:3001/api/companies | head -c 500
curl http://localhost:3001/api/funds
```

Expected: JSON responses with correct data.

**Step 5: Kill API server, commit any fixes**

```bash
git add -A
git commit -m "chore: install dependencies, verify API works"
```

---

### Task 6: Create shared React components

**Files:**
- Create: `apps/goed/src/components/Stat.jsx`
- Create: `apps/goed/src/components/Counter.jsx`
- Create: `apps/goed/src/components/ReapChipBar.jsx`
- Create: `apps/goed/src/components/Spark.jsx`
- Create: `apps/goed/src/components/MBar.jsx`
- Create: `apps/goed/src/components/Grade.jsx`
- Create: `apps/goed/src/components/DetailPanel.jsx`
- Create: `apps/goed/src/hooks/useApi.js`
- Create: `apps/goed/src/hooks/useW.js`
- Source: `src/App.jsx:843-873,1503-1518,1551-1565,1568-1634`

**Step 1: Create apps/goed/src/hooks/useApi.js**

```js
import { useState, useEffect } from "react";

const API_BASE = "/api";

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}${path}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [path]);

  return { data, loading, error };
}

export async function fetchApi(path) {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}
```

**Step 2: Create apps/goed/src/hooks/useW.js**

```js
import { useState, useEffect } from "react";

export const useW = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
};
```

**Step 3: Create component files**

Create each component as a separate JSX file, importing constants from `@bbi/ui-core`. Each component should match the existing implementation exactly but as a standalone export.

The implementer should extract each component from `src/App.jsx`:
- `Spark` (line 843-847) → `apps/goed/src/components/Spark.jsx`
- `MBar` (line 849-856) → `apps/goed/src/components/MBar.jsx`
- `Counter` (line 858-866) → `apps/goed/src/components/Counter.jsx`
- `Stat` (line 1551-1558) → `apps/goed/src/components/Stat.jsx` (receives `isMobile` as prop)
- `Grade` (line 1561-1565) → `apps/goed/src/components/Grade.jsx`
- `ReapChipBar` (line 1503-1518) → `apps/goed/src/components/ReapChipBar.jsx` (receives `reapFilter`, `setReapFilter` as props)
- `DetailPanel` (line 1568-1634) → `apps/goed/src/components/DetailPanel.jsx` (receives `selectedCompany`, `setSelectedCompany`, `isMobile` as props)

Each file should `import { ... } from "@bbi/ui-core"` for constants and scoring.

**Step 4: Commit**

```bash
git add apps/goed/src/
git commit -m "feat: extract shared components and hooks for apps/goed"
```

---

### Task 7: Decompose views into individual files

**Files:**
- Create: `apps/goed/src/views/Dashboard.jsx`
- Create: `apps/goed/src/views/SSBCI.jsx`
- Create: `apps/goed/src/views/Radar.jsx`
- Create: `apps/goed/src/views/Companies.jsx`
- Create: `apps/goed/src/views/Funds.jsx`
- Create: `apps/goed/src/views/Sectors.jsx`
- Create: `apps/goed/src/views/Graph.jsx` (temporary — wraps old OntologyGraphView, replaced in Task 9)
- Create: `apps/goed/src/views/Timeline.jsx`
- Create: `apps/goed/src/views/Map.jsx`
- Create: `apps/goed/src/views/Brief.jsx`
- Source: `src/App.jsx:1670-2236`

**Step 1: Extract each view block**

Each `{view === "xxx" && (...)}` block in `src/App.jsx` becomes a standalone view component. The implementer should:

1. Cut the JSX for each view from the main component
2. Move data fetching to use `useApi` hook instead of module-level arrays
3. Import shared components from `../components/`
4. Import constants from `@bbi/ui-core`
5. Accept common props: `{ isMobile, isTablet, setSelectedCompany }`

**View → Source Line Mapping:**
- Dashboard: lines 1670-1749
- Radar: lines 1751-1811
- Companies: lines 1813-1864
- Funds (investors): lines 1865-1973
- Graph: lines 1975-1981 (wrapper for OntologyGraphView)
- Timeline: lines 1983-1998
- SSBCI: lines 2000-2036
- Map: lines 2038-2072
- Sectors: lines 2073-2143
- Brief: lines 2145-2236

Each view should fetch its data with `useApi`:
```js
const { data: companies } = useApi("/api/companies");
const { data: funds } = useApi("/api/funds");
const { data: stats } = useApi("/api/stats/ssbci");
```

**Step 2: Commit**

```bash
git add apps/goed/src/views/
git commit -m "feat: decompose views into individual files"
```

---

### Task 8: Create App shell and main.jsx

**Files:**
- Create: `apps/goed/src/App.jsx`
- Create: `apps/goed/src/main.jsx`
- Source: `src/App.jsx:1487-1668,2238-2245`

**Step 1: Create apps/goed/src/main.jsx**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Step 2: Create apps/goed/src/App.jsx**

This is the thin shell: navigation, routing (view state), and layout. It imports and renders all views based on `view` state.

```jsx
import { useState } from "react";
import { VIEWS, GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, css, fadeIn } from "@bbi/ui-core";
import { useW } from "./hooks/useW.js";
import Dashboard from "./views/Dashboard.jsx";
import SSBCI from "./views/SSBCI.jsx";
import Radar from "./views/Radar.jsx";
import Companies from "./views/Companies.jsx";
import Funds from "./views/Funds.jsx";
import Sectors from "./views/Sectors.jsx";
import Graph from "./views/Graph.jsx";
import Timeline from "./views/Timeline.jsx";
import MapView from "./views/Map.jsx";
import Brief from "./views/Brief.jsx";
import DetailPanel from "./components/DetailPanel.jsx";

export default function BattleBornIntelligence() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const [view, setView] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const px = isMobile ? 12 : 24;

  const viewProps = { isMobile, isTablet, setSelectedCompany, setView };

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`10px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:DARK+"F0", backdropFilter:"blur(12px)", zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 8 : 12 }}>
          <span style={{ color:GOLD, fontSize:isMobile ? 16 : 18 }}>◆</span>
          <span style={{ fontWeight:700, fontSize:isMobile ? 11 : 14, letterSpacing:isMobile ? 1 : 2, textTransform:"uppercase" }}>{isMobile ? "BBI" : "Battle Born Intelligence"}</span>
          <span style={{ fontSize:9, color:MUTED, background:"#1A1814", padding:"2px 6px", borderRadius:4 }}>v6.0</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, color:MUTED }}>LIVE</span>
          </div>
          {isMobile && <button onClick={() => setMobileNav(!mobileNav)} style={{ background:"none", border:"none", color:GOLD, fontSize:20, cursor:"pointer", padding:4 }}>{mobileNav ? "✕" : "☰"}</button>}
        </div>
      </div>

      {/* NAV */}
      {(!isMobile || mobileNav) && (
        <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`0 ${px}px`, display:"flex", gap:0, overflowX:"auto", ...(isMobile && mobileNav ? { flexWrap:"wrap", background:CARD, ...fadeIn } : {}) }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setMobileNav(false); }} style={{ padding: isMobile ? "10px 12px" : "10px 16px", background:"none", border:"none", borderBottom: view === v.id ? `2px solid ${GOLD}` : "2px solid transparent", color: view === v.id ? GOLD : MUTED, fontSize: isMobile ? 11 : 12, fontWeight:600, cursor:"pointer", letterSpacing:0.5, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"all 0.2s", minWidth: isMobile && mobileNav ? "33%" : "auto" }}>
              <span style={{ fontSize:13 }}>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:px, maxWidth:1400, margin:"0 auto" }}>
        {view === "dashboard" && <Dashboard {...viewProps} />}
        {view === "ssbci" && <SSBCI {...viewProps} />}
        {view === "radar" && <Radar {...viewProps} />}
        {view === "companies" && <Companies {...viewProps} />}
        {view === "investors" && <Funds {...viewProps} />}
        {view === "sectors" && <Sectors {...viewProps} />}
        {view === "graph" && <Graph {...viewProps} />}
        {view === "timeline" && <Timeline {...viewProps} />}
        {view === "map" && <MapView {...viewProps} />}
        {view === "brief" && <Brief {...viewProps} />}
      </div>

      {selectedCompany && <DetailPanel selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} isMobile={isMobile} />}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/goed/src/App.jsx apps/goed/src/main.jsx
git commit -m "feat: App shell with navigation and view routing"
```

---

### Task 9: Replace D3 graph with Cytoscape.js

**Files:**
- Modify: `apps/goed/src/views/Graph.jsx`
- Modify: `apps/goed/package.json` (add cytoscape deps)

**Step 1: Add cytoscape dependencies**

Add to `apps/goed/package.json` dependencies:
```json
"cytoscape": "^3.31.0",
"cytoscape-cose-bilkent": "^4.1.0"
```

Run `pnpm install` in the workspace.

**Step 2: Rewrite Graph.jsx with Cytoscape**

Replace the entire Graph.jsx with a Cytoscape-based implementation:

```jsx
import { useEffect, useRef, useState, useMemo } from "react";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { useApi } from "../hooks/useApi.js";
import { GP, NODE_CFG, REL_CFG, GSTAGE_C } from "@bbi/ui-core/constants";
import { REAP_PILLARS, getReapPillar } from "@bbi/ui-core/reap";
import { computeGraphMetrics } from "@bbi/ui-core/scoring";
import ReapChipBar from "../components/ReapChipBar.jsx";

cytoscape.use(coseBilkent);

export default function Graph({ isMobile, setSelectedCompany, setView }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const { data: graphData } = useApi("/api/graph");
  const [reapFilter, setReapFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [colorMode, setColorMode] = useState("default");

  // Build Cytoscape elements from API data
  const elements = useMemo(() => {
    if (!graphData) return [];
    const els = [];
    graphData.nodes.forEach(n => {
      els.push({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          stage: n.stage,
          funding: n.funding || 0,
          ...n,
        },
        classes: [n.type],
      });
    });
    graphData.edges.forEach((e, i) => {
      els.push({
        data: {
          id: `e_${i}`,
          source: e.source,
          target: e.target,
          rel: e.rel,
          note: e.note,
        },
        classes: [e.rel],
      });
    });
    return els;
  }, [graphData]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": 8,
            color: GP.text,
            "text-valign": "bottom",
            "text-margin-y": 4,
            "background-color": (el) => {
              const type = el.data("type");
              if (type === "company") return GSTAGE_C[el.data("stage")] || GP.muted;
              return NODE_CFG[type]?.color || GP.muted;
            },
            width: (el) => {
              const type = el.data("type");
              if (type === "fund") return 40;
              if (type === "accelerator") return 36;
              if (type === "company") return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, el.data("funding"))) * 0.6));
              return 26;
            },
            height: (el) => {
              const type = el.data("type");
              if (type === "fund") return 40;
              if (type === "accelerator") return 36;
              if (type === "company") return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, el.data("funding"))) * 0.6));
              return 26;
            },
            "border-width": 1,
            "border-color": GP.border,
          },
        },
        {
          selector: "edge",
          style: {
            width: (el) => {
              const rel = el.data("rel");
              if (rel === "invested_in" || rel === "acquired") return 2;
              if (rel === "loaned_to" || rel === "funds") return 1.6;
              return 0.8;
            },
            "line-color": (el) => REL_CFG[el.data("rel")]?.color || GP.dim,
            "curve-style": "bezier",
            opacity: 0.4,
          },
        },
        {
          selector: "node.dimmed",
          style: { opacity: 0.15 },
        },
        {
          selector: "edge.dimmed",
          style: { opacity: 0.05 },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: false,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        nodeRepulsion: 4500,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
      },
      minZoom: 0.3,
      maxZoom: 4,
    });

    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setSelected({
        id: node.id(),
        label: node.data("label"),
        type: node.data("type"),
        ...node.data(),
      });
      if (node.data("type") === "company") {
        const companyId = parseInt(node.id().replace("c_", ""));
        if (!isNaN(companyId)) {
          // Could navigate to company detail
        }
      }
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) setSelected(null);
    });

    cyRef.current = cy;

    return () => cy.destroy();
  }, [elements]);

  // Apply REAP filter
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass("dimmed");
    cy.edges().removeClass("dimmed");

    if (reapFilter !== "all") {
      cy.nodes().forEach((node) => {
        const data = node.data();
        let match = false;
        if (data.type === "company" && reapFilter === "entrepreneurs") match = true;
        else if (getReapPillar(data) === reapFilter) match = true;
        if (!match) node.addClass("dimmed");
      });
      cy.edges().forEach((edge) => {
        const src = edge.source();
        const tgt = edge.target();
        if (src.hasClass("dimmed") && tgt.hasClass("dimmed")) edge.addClass("dimmed");
      });
    }
  }, [reapFilter]);

  return (
    <div style={{ ...{ animation: "fadeIn 0.3s ease-out" } }}>
      <div style={{ fontSize: 10, color: GP.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Ontological Relationship Graph — Graph Intelligence Active
      </div>
      <ReapChipBar reapFilter={reapFilter} setReapFilter={setReapFilter} />
      <div style={{ display: "flex", gap: 1, marginBottom: 8 }}>
        {[["default","◉"],["pagerank","PR"],["betweenness","BC"],["community","🏘"]].map(([mode,label]) => (
          <div key={mode} onClick={() => setColorMode(mode)} style={{ cursor:"pointer", padding:"3px 6px", background:colorMode===mode?GP.gold+"20":GP.bg, border:`1px solid ${colorMode===mode?GP.gold+"50":GP.border}`, fontSize:8, color:colorMode===mode?GP.gold:GP.muted, borderRadius:mode==="default"?"4px 0 0 4px":mode==="community"?"0 4px 4px 0":"0", fontWeight:colorMode===mode?700:400 }}>{label}</div>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: isMobile ? 400 : 620,
          background: GP.bg,
          borderRadius: 10,
          border: `1px solid ${GP.border}`,
        }}
      />
      {selected && (
        <div style={{ marginTop: 8, padding: 12, background: GP.surface, borderRadius: 8, border: `1px solid ${GP.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: GP.text }}>{selected.label}</div>
          <div style={{ fontSize: 10, color: GP.muted }}>{selected.type} {selected.note ? `— ${selected.note}` : ""}</div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/goed/
git commit -m "feat: replace D3 force graph with Cytoscape.js"
```

---

### Task 10: Remove old single-file app and temp-scaffold, update root

**Files:**
- Delete: `src/App.jsx`
- Delete: `src/main.jsx` (if exists)
- Delete: `temp-scaffold/`
- Modify: root `package.json` (already done in Task 1)

**Step 1: Remove old files**

```bash
rm -rf src/ temp-scaffold/
```

**Step 2: Verify frontend starts**

```bash
pnpm dev
```

Expected: Both API (port 3001) and frontend (port 5173) start. Visit `http://localhost:5173` and verify Dashboard loads with SSBCI KPIs.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old single-file app and temp-scaffold"
```

---

### Task 11: Final verification and cleanup

**Step 1: Check all views render**

Navigate through each view in the browser:
- Dashboard: SSBCI KPIs, sector heat, top momentum
- SSBCI: Fund utilization bars
- Radar: IRS-ranked deals with triggers
- Companies: REAP chip bar, search, filter, company cards
- Funds: Fund cards with REAP filter, deal flow
- Sectors: Sector grid with heat scores
- Graph: Cytoscape visualization with REAP filter
- Timeline: Activity feed
- Map: Nevada map with company dots
- Brief: Weekly GOED brief with REAP pillars

**Step 2: Check for console errors**

Open browser devtools, verify no JavaScript errors across all views.

**Step 3: Remove d3 dependency**

D3 is no longer needed (replaced by Cytoscape). Remove from `apps/goed/package.json` if it was included.

**Step 4: Commit and tag**

```bash
git add -A
git commit -m "chore: final verification, BBI v6.0 monorepo complete"
```
