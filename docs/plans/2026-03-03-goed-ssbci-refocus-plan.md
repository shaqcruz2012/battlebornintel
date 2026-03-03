# GOED/SSBCI Refocus Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refocus BBI from a general startup ecosystem dashboard into an internal GOED tool centered on SSBCI ecosystem intelligence.

**Architecture:** Single-file React app (`src/App.jsx`, ~2248 lines). Surgical edits: remove Watchlist/Compare views and related state, reorder navigation, refocus Dashboard KPIs toward SSBCI metrics.

**Tech Stack:** React 19, D3.js, Vite 8, inline CSS-in-JS

---

### Task 1: Remove Watchlist and Compare from VIEWS array

**Files:**
- Modify: `src/App.jsx:33-45`

**Step 1: Update VIEWS array**

Replace the current VIEWS array with reordered version (SSBCI promoted to position 2):

```jsx
const VIEWS = [
  { id: "dashboard", label: "Home", icon: "◆" },
  { id: "ssbci", label: "SSBCI", icon: "★" },
  { id: "radar", label: "Radar", icon: "📡" },
  { id: "companies", label: "Companies", icon: "⬡" },
  { id: "investors", label: "Funds", icon: "◈" },
  { id: "sectors", label: "Sectors", icon: "◉" },
  { id: "graph", label: "Graph", icon: "🕸" },
  { id: "timeline", label: "Activity", icon: "⏱" },
  { id: "map", label: "Map", icon: "⊕" },
];
```

Removed: `watchlist` and `compare` entries.

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: reorder nav, remove watchlist/compare from VIEWS"
```

---

### Task 2: Remove watchlist/compare state and helpers

**Files:**
- Modify: `src/App.jsx:1444,1448,1466-1469`

**Step 1: Remove compareList state**

Delete line 1444:
```jsx
  const [compareList, setCompareList] = useState([]);
```

**Step 2: Remove watchlist state**

Delete line 1448:
```jsx
  const [watchlist, setWatchlist] = useState([]);
```

**Step 3: Remove watchlist helpers**

Delete lines 1466-1469:
```jsx
  // Watchlist helpers
  const toggleWatchlist = (id) => setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const isWatched = (id) => watchlist.includes(id);
  const watchedCompanies = useMemo(() => allScored.filter(c => watchlist.includes(c.id)), [allScored, watchlist]);
```

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove watchlist and compare state/helpers"
```

---

### Task 3: Remove star buttons and compare buttons from views

**Files:**
- Modify: `src/App.jsx` — multiple locations

**Step 1: Remove star button from Radar view (line ~1521)**

Delete the star button element on the deal card in the Radar view:
```jsx
<button onClick={() => toggleWatchlist(sc.id)} style={{ background:isWatched(sc.id) ? GOLD+"20" : "none", ... }}>{isWatched(sc.id) ? "★" : "☆"}</button>
```

**Step 2: Remove Watchlist stat from Dashboard (line ~1617)**

Delete:
```jsx
{!isMobile && <Stat label="Watchlist" value={watchlist.length} sub="companies tracked" />}
```

**Step 3: Remove star button from Companies table (line ~1729)**

Delete the star button element on each company row.

**Step 4: Remove compare button and star button from Companies detail rows (lines ~1778-1779)**

Delete both button elements:
```jsx
<button onClick={...setCompareList...}>⟺</button>
<button onClick={...toggleWatchlist...}>☆/★</button>
```

**Step 5: Remove star button from Sectors deep-dive (line ~2149)**

Delete the star button in the sector company list.

**Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove star/compare buttons from all views"
```

---

### Task 4: Remove Watchlist view block

**Files:**
- Modify: `src/App.jsx:2156-2229`

**Step 1: Delete entire Watchlist view**

Remove the block from `{/* ═══════════════════════ WATCHLIST ═══════════════════════ */}` through the closing `)}` of the watchlist view (lines ~2156-2229).

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove watchlist view"
```

---

### Task 5: Remove Compare view block

**Files:**
- Modify: `src/App.jsx:1891-1985`

**Step 1: Delete entire Compare view**

Remove the block from `{view === "compare" && (` through its closing `)}` (lines ~1891-1985).

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove compare view"
```

---

### Task 6: Remove Compare floating bar

**Files:**
- Modify: `src/App.jsx:2236-2244`

**Step 1: Delete floating compare bar**

Remove the block:
```jsx
{compareList.length > 0 && view !== "compare" && (
  <div style={{ position:"fixed", bottom:... }}>
    ...
  </div>
)}
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: remove compare floating bar"
```

---

### Task 7: Refocus Dashboard KPIs

**Files:**
- Modify: `src/App.jsx:1611-1618`

**Step 1: Replace dashboard stat cards**

Replace the current KPI grid (lines 1611-1618) with SSBCI-focused metrics:

```jsx
<div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: isMobile ? 8 : 16, marginBottom:24 }}>
  {(() => {
    const ssbciFunds = FUNDS.filter(f=>f.type==="SSBCI");
    const ssbciDeployed = ssbciFunds.reduce((s,f)=>s+f.deployed,0);
    const avgLev = ssbciFunds.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbciFunds.filter(f=>f.leverage).length;
    const privateLev = Math.round(ssbciDeployed * avgLev);
    const ssbciCompanies = allScored.filter(c=>c.eligible.some(e=>["bbv","fundnv","1864"].includes(e)));
    const ssbciAvgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s,c)=>s+c.irs,0)/ssbciCompanies.length) : 0;
    return (<>
      <Stat label="SSBCI Deployed" value={fmt(ssbciDeployed)} sub={`${ssbciFunds.length} active funds`} color={PURPLE} />
      <Stat label="Private Capital Leveraged" value={fmt(privateLev)} sub={`${avgLev.toFixed(1)}x avg ratio`} color={GREEN} />
      <Stat label="SSBCI Portfolio" value={ssbciCompanies.length} sub={`of ${COMPANIES.length} tracked`} color={GOLD} />
      <Stat label="Portfolio Avg IRS" value={ssbciAvgIRS} sub="SSBCI companies" color={ssbciAvgIRS >= 70 ? GREEN : GOLD} />
      {!isMobile && <Stat label="Ecosystem Capital" value={<Counter end={totalFunding} prefix="$" suffix="M" />} sub="All companies" />}
      {!isMobile && <Stat label="Total Jobs" value={<Counter end={totalEmployees} />} sub="Across ecosystem" color={BLUE} />}
    </>);
  })()}
</div>
```

**Step 2: Refocus Top Momentum list to prioritize SSBCI companies**

In the "Top Momentum" section (line ~1640), change the sort to prioritize SSBCI-affiliated companies:

```jsx
{[...COMPANIES].sort((a, b) => {
  const aSSBCI = a.eligible.some(e=>["bbv","fundnv","1864"].includes(e)) ? 1 : 0;
  const bSSBCI = b.eligible.some(e=>["bbv","fundnv","1864"].includes(e)) ? 1 : 0;
  if (bSSBCI !== aSSBCI) return bSSBCI - aSSBCI;
  return b.momentum - a.momentum;
}).slice(0, isMobile ? 6 : 10).map((c, i) => (
```

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: refocus dashboard KPIs for SSBCI ecosystem intelligence"
```

---

### Task 8: Verify app runs clean

**Step 1: Install deps if needed**

```bash
cd temp-scaffold && npm install
```

**Step 2: Verify no JS errors**

Search for any remaining references to removed state (`watchlist`, `compareList`, `toggleWatchlist`, `isWatched`, `watchedCompanies`, `setWatchlist`, `setCompareList`):

```bash
grep -n "toggleWatchlist\|isWatched\|watchedCompanies\|setWatchlist\|setCompareList\|compareList" src/App.jsx
```

Expected: No matches (graph engine `watchlist` variable is local scope, not the removed state).

**Step 3: Commit final cleanup if needed**

```bash
git add -A
git commit -m "chore: final cleanup for GOED/SSBCI refocus"
```
