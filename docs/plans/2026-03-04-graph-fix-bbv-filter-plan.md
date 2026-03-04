# Graph Fix + BBV Portfolio Filter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the broken Graph view and add a global BBV portfolio filter that defaults to showing only Battle Born Venture companies across all views.

**Architecture:** API routes accept an optional `?fund=bbv` query parameter that filters companies at the SQL level. The frontend `App.jsx` holds a `portfolioFilter` state (default `"bbv"`) and passes it to all views, which append it to their API calls. A toggle in the header switches between BBV-only and full ecosystem.

**Tech Stack:** Express 5, sql.js, React 19, Cytoscape.js

---

### Task 1: Fix Graph.jsx double `/api` prefix

**Files:**
- Modify: `apps/goed/src/views/Graph.jsx:14`

**Step 1: Fix the useApi path**

In `apps/goed/src/views/Graph.jsx`, line 14, change:

```jsx
const { data: graphData } = useApi("/api/graph");
```

to:

```jsx
const { data: graphData } = useApi("/graph");
```

Every other view uses paths without the `/api` prefix (e.g., `/companies`, `/funds`, `/timeline`). The `useApi` hook in `apps/goed/src/hooks/useApi.js` already prepends `/api` via `API_BASE`.

**Step 2: Verify in browser**

Start API and frontend servers. Navigate to Graph tab. The graph should now load (previously showed an empty box). Check network tab: request should be `GET /api/graph` → 200 (not `/api/api/graph` → 404).

**Step 3: Commit**

```bash
git add apps/goed/src/views/Graph.jsx
git commit -m "fix: correct double /api prefix in Graph.jsx useApi call"
```

---

### Task 2: Add `?fund` filter to `/api/companies` route

**Files:**
- Modify: `services/api/routes/companies.js`

**Step 1: Add fund query param filtering**

Replace the entire `services/api/routes/companies.js` with:

```js
import { Router } from "express";
import { computeIRS } from "../../../packages/ui-core/src/scoring.js";

const router = Router();

function filterByFund(companies, fund) {
  if (!fund || fund === "all") return companies;
  return companies.filter(c => c.eligible.includes(fund));
}

router.get("/", (req, res) => {
  const rows = req.queryAll("SELECT * FROM companies ORDER BY momentum DESC");
  const companies = rows.map(r => ({
    ...r,
    sector: JSON.parse(r.sectors || "[]"),
    eligible: JSON.parse(r.eligible || "[]"),
  }));
  const filtered = filterByFund(companies, req.query.fund);
  const scored = filtered.map(computeIRS).sort((a, b) => b.irs - a.irs);
  res.json(scored);
});

router.get("/:id", (req, res) => {
  const row = req.queryOne("SELECT * FROM companies WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Not found" });
  const company = { ...row, sector: JSON.parse(row.sectors || "[]"), eligible: JSON.parse(row.eligible || "[]") };
  const scored = computeIRS(company);
  const edges = req.queryAll("SELECT * FROM edges WHERE source = ? OR target = ?", [`c_${row.id}`, `c_${row.id}`]);
  const timeline = req.queryAll("SELECT * FROM timeline_events WHERE company = ? ORDER BY date DESC", [row.name]);
  res.json({ ...scored, edges, timeline });
});

export default router;
```

**Step 2: Verify**

```bash
curl "http://localhost:3001/api/companies?fund=bbv" | node --input-type=module -e "import{createInterface}from'readline';let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).length))"
```

Expected: `31` (BBV portfolio companies).

```bash
curl "http://localhost:3001/api/companies" | node --input-type=module -e "import{createInterface}from'readline';let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).length))"
```

Expected: `75` (all companies — backward compatible).

**Step 3: Commit**

```bash
git add services/api/routes/companies.js
git commit -m "feat: add ?fund= query param filter to /api/companies"
```

---

### Task 3: Add `?fund` filter to `/api/graph` route

**Files:**
- Modify: `services/api/routes/graph.js`

**Step 1: Add fund filtering to graph route**

Replace the entire `services/api/routes/graph.js` with:

```js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const entities = req.queryAll("SELECT * FROM entities");
  const edges = req.queryAll("SELECT * FROM edges");
  const listings = req.queryAll("SELECT * FROM listings");

  const fund = req.query.fund;
  const filteredCompanies = (!fund || fund === "all")
    ? companies
    : companies.filter(c => c.eligible.includes(fund));

  const companyIds = new Set(filteredCompanies.map(c => `c_${c.id}`));

  // Keep edges where at least one endpoint is a filtered company
  const filteredEdges = edges.filter(e => companyIds.has(e.source) || companyIds.has(e.target));

  // Collect entity IDs referenced by filtered edges
  const referencedEntityIds = new Set();
  filteredEdges.forEach(e => {
    if (!companyIds.has(e.source)) referencedEntityIds.add(e.source);
    if (!companyIds.has(e.target)) referencedEntityIds.add(e.target);
  });

  const filteredEntities = entities.filter(e => referencedEntityIds.has(e.id));

  const nodes = [];
  filteredCompanies.forEach(c => nodes.push({
    id: `c_${c.id}`, label: c.name, type: "company", stage: c.stage,
    funding: c.funding, momentum: c.momentum, employees: c.employees,
    city: c.city, region: c.region, sector: c.sector, eligible: c.eligible,
    founded: c.founded,
  }));
  filteredEntities.forEach(e => {
    const type = e.category === "graph_fund" ? "fund" : e.category;
    nodes.push({
      id: e.id, label: e.name, type, etype: e.etype, atype: e.atype,
      role: e.role, city: e.city, region: e.region, founded: e.founded,
      note: e.note, companyId: e.company_id,
    });
  });

  res.json({ nodes, edges: filteredEdges, listings });
});

export default router;
```

**Step 2: Verify**

```bash
curl -s "http://localhost:3001/api/graph?fund=bbv" | node --input-type=module -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const g=JSON.parse(d);console.log('nodes:',g.nodes.length,'edges:',g.edges.length)})"
```

Expected: Fewer nodes and edges than the unfiltered version.

**Step 3: Commit**

```bash
git add services/api/routes/graph.js
git commit -m "feat: add ?fund= filter to /api/graph route"
```

---

### Task 4: Add `?fund` filter to `/api/stats` and `/api/timeline` routes

**Files:**
- Modify: `services/api/routes/stats.js`
- Modify: `services/api/routes/timeline.js`

**Step 1: Update stats.js**

Replace the entire `services/api/routes/stats.js` with:

```js
import { Router } from "express";
import { computeIRS } from "../../../packages/ui-core/src/scoring.js";

const router = Router();

function getCompanies(req) {
  const rows = req.queryAll("SELECT * FROM companies");
  const companies = rows.map(r => ({
    ...r, sector: JSON.parse(r.sectors || "[]"), eligible: JSON.parse(r.eligible || "[]"),
  }));
  const fund = req.query.fund;
  if (!fund || fund === "all") return companies;
  return companies.filter(c => c.eligible.includes(fund));
}

router.get("/ssbci", (req, res) => {
  const ssbciFunds = req.queryAll("SELECT * FROM funds WHERE type = 'SSBCI'");
  const totalDeployed = ssbciFunds.reduce((s, f) => s + f.deployed, 0);
  const totalAllocated = ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0);
  const avgLeverage = ssbciFunds.filter(f => f.leverage).reduce((s, f) => s + f.leverage, 0) / ssbciFunds.filter(f => f.leverage).length;
  const privateLeveraged = Math.round(totalDeployed * avgLeverage);

  const companies = getCompanies(req);
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
  const companies = getCompanies(req);
  const totalFunding = companies.reduce((s, c) => s + c.funding, 0);
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);
  res.json({ totalFunding, totalEmployees, companyCount: companies.length });
});

export default router;
```

**Step 2: Update timeline.js**

Replace the entire `services/api/routes/timeline.js` with:

```js
import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const fund = req.query.fund;
  if (!fund || fund === "all") {
    const events = req.queryAll("SELECT * FROM timeline_events ORDER BY date DESC");
    return res.json(events);
  }

  // Get company names for the fund filter
  const companies = req.queryAll("SELECT * FROM companies").map(r => ({
    ...r, eligible: JSON.parse(r.eligible || "[]"),
  }));
  const fundCompanyNames = new Set(
    companies.filter(c => c.eligible.includes(fund)).map(c => c.name)
  );

  const events = req.queryAll("SELECT * FROM timeline_events ORDER BY date DESC");
  const filtered = events.filter(e => fundCompanyNames.has(e.company));
  res.json(filtered);
});

export default router;
```

**Step 3: Verify**

```bash
curl -s "http://localhost:3001/api/stats/ecosystem?fund=bbv"
```

Expected: Lower `totalFunding`, `totalEmployees`, and `companyCount: 31`.

```bash
curl -s "http://localhost:3001/api/timeline?fund=bbv" | node --input-type=module -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log('events:',JSON.parse(d).length))"
```

Expected: Fewer events than unfiltered.

**Step 4: Commit**

```bash
git add services/api/routes/stats.js services/api/routes/timeline.js
git commit -m "feat: add ?fund= filter to /api/stats and /api/timeline routes"
```

---

### Task 5: Add portfolio toggle to App.jsx and pass to views

**Files:**
- Modify: `apps/goed/src/App.jsx`

**Step 1: Add portfolioFilter state and header toggle**

Replace the entire `apps/goed/src/App.jsx` with:

```jsx
import { useState } from "react";
import { VIEWS, DARK, CARD, BORDER, GOLD, GREEN, MUTED, TEXT, css, fadeIn } from "@bbi/ui-core";
import useW from "./hooks/useW.js";
import DetailPanel from "./components/DetailPanel.jsx";
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

const VIEW_MAP = {
  dashboard: Dashboard,
  ssbci: SSBCI,
  radar: Radar,
  companies: Companies,
  investors: Funds,
  sectors: Sectors,
  graph: Graph,
  timeline: Timeline,
  map: MapView,
  brief: Brief,
};

export default function App() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const [view, setView] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState("bbv");
  const px = isMobile ? 12 : 24;

  const fundParam = portfolioFilter === "all" ? "" : `?fund=${portfolioFilter}`;
  const ActiveView = VIEW_MAP[view] || Dashboard;

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`10px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:DARK+"F0", backdropFilter:"blur(12px)", zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 8 : 12 }}>
          <span style={{ color:GOLD, fontSize:isMobile ? 16 : 18 }}>{"\u25C6"}</span>
          <span style={{ fontWeight:700, fontSize:isMobile ? 11 : 14, letterSpacing:isMobile ? 1 : 2, textTransform:"uppercase" }}>{isMobile ? "BBI" : "Battle Born Intelligence"}</span>
          <span style={{ fontSize:9, color:MUTED, background:"#1A1814", padding:"2px 6px", borderRadius:4 }}>v6.0</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Portfolio Toggle */}
          <div style={{ display:"flex", borderRadius:4, overflow:"hidden", border:`1px solid ${BORDER}` }}>
            {[["bbv","BBV Portfolio"],["all","Full Ecosystem"]].map(([val, label]) => (
              <button key={val} onClick={() => setPortfolioFilter(val)} style={{ background: portfolioFilter === val ? GOLD+"25" : "transparent", border:"none", color: portfolioFilter === val ? GOLD : MUTED, fontSize: isMobile ? 8 : 9, padding: isMobile ? "3px 6px" : "4px 10px", cursor:"pointer", fontWeight: portfolioFilter === val ? 700 : 400, letterSpacing: 0.5 }}>{label}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, color:MUTED }}>LIVE</span>
          </div>
          {isMobile && <button onClick={() => setMobileNav(!mobileNav)} style={{ background:"none", border:"none", color:GOLD, fontSize:20, cursor:"pointer", padding:4 }}>{mobileNav ? "\u2715" : "\u2630"}</button>}
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
        <ActiveView
          isMobile={isMobile}
          isTablet={isTablet}
          setSelectedCompany={setSelectedCompany}
          setView={setView}
          fundParam={fundParam}
        />
      </div>

      {/* DETAIL PANEL */}
      <DetailPanel
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        isMobile={isMobile}
      />
    </div>
  );
}
```

Key changes:
- Added `portfolioFilter` state, default `"bbv"`
- Added `fundParam` computed string: empty for "all", `?fund=bbv` for BBV
- Added toggle buttons in header between "BBV Portfolio" and "Full Ecosystem"
- Passes `fundParam` prop to all views via `ActiveView`

**Step 2: Commit**

```bash
git add apps/goed/src/App.jsx
git commit -m "feat: add BBV portfolio toggle to App header, pass fundParam to views"
```

---

### Task 6: Update all views to use `fundParam` in API calls

**Files:**
- Modify: `apps/goed/src/views/Dashboard.jsx` (lines 11-12)
- Modify: `apps/goed/src/views/SSBCI.jsx` (lines 6-7)
- Modify: `apps/goed/src/views/Radar.jsx` (line 10)
- Modify: `apps/goed/src/views/Companies.jsx` (line 9)
- Modify: `apps/goed/src/views/Funds.jsx` (lines 9-10)
- Modify: `apps/goed/src/views/Sectors.jsx` (line 9)
- Modify: `apps/goed/src/views/Graph.jsx` (line 14 — already fixed in Task 1)
- Modify: `apps/goed/src/views/Timeline.jsx` (line 5)
- Modify: `apps/goed/src/views/Map.jsx` (line 6)
- Modify: `apps/goed/src/views/Brief.jsx` (lines 7-10)

**Step 1: Update each view**

The pattern is the same in every view: add `fundParam` to the destructured props, then append it to each `useApi()` path.

**Dashboard.jsx** — change props and useApi calls:
```jsx
// Line 10: add fundParam to props
export default function Dashboard({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
// Line 11-12: append fundParam
  const { data: companies } = useApi("/companies" + fundParam);
  const { data: funds } = useApi("/funds");
```
Note: `/funds` does NOT get the filter (funds are always shown).

**SSBCI.jsx** — same pattern:
```jsx
export default function SSBCI({ isMobile, fundParam }) {
  const { data: funds } = useApi("/funds");
  const { data: companies } = useApi("/companies" + fundParam);
```

**Radar.jsx**:
```jsx
export default function Radar({ isMobile, setSelectedCompany, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
```

**Companies.jsx**:
```jsx
export default function Companies({ isMobile, setSelectedCompany, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
```

**Funds.jsx**:
```jsx
export default function Funds({ isMobile, fundParam }) {
  const { data: funds } = useApi("/funds");
  const { data: companies } = useApi("/companies" + fundParam);
```

**Sectors.jsx**:
```jsx
export default function Sectors({ isMobile, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
```

**Graph.jsx** (already fixed path in Task 1, now add fundParam):
```jsx
export default function Graph({ isMobile, setSelectedCompany, setView, fundParam }) {
  ...
  const { data: graphData } = useApi("/graph" + fundParam);
```

**Timeline.jsx**:
```jsx
export default function Timeline({ isMobile, fundParam }) {
  const { data: events } = useApi("/timeline" + fundParam);
```

**Map.jsx**:
```jsx
export default function MapView({ isMobile, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
```

**Brief.jsx**:
```jsx
export default function Brief({ isMobile, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
  const { data: funds } = useApi("/funds");
  const { data: timeline } = useApi("/timeline" + fundParam);
  const { data: graphData } = useApi("/graph" + fundParam);
```

**Step 2: Verify**

Start both servers. Toggle between "BBV Portfolio" and "Full Ecosystem" in the header. Dashboard should show different company counts, funding totals, and momentum rankings based on the toggle.

**Step 3: Commit**

```bash
git add apps/goed/src/views/
git commit -m "feat: wire fundParam into all views for BBV portfolio filtering"
```

---

### Task 7: Update `useApi` hook to re-fetch when path changes

**Files:**
- Verify: `apps/goed/src/hooks/useApi.js`

**Step 1: Verify useApi already handles path changes**

The current `useApi` hook has `[path]` in its `useEffect` dependency array (line 16 of `useApi.js`). When `fundParam` changes (e.g., from `""` to `"?fund=bbv"`), the full path changes (e.g., `/companies` to `/companies?fund=bbv`), triggering a re-fetch. No code changes needed.

**Step 2: End-to-end test**

1. Open browser to `http://127.0.0.1:5173`
2. Dashboard should show BBV-only data by default (31 companies in portfolio count area)
3. Click "Full Ecosystem" toggle — all counts should increase (75 companies)
4. Click "BBV Portfolio" toggle — back to 31
5. Navigate to Graph tab — should render the Cytoscape visualization
6. Navigate to each other tab — all should load without errors

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify useApi re-fetches on fund filter change"
```

Only commit if there were any remaining changes. If `git status` shows clean, skip this commit.
