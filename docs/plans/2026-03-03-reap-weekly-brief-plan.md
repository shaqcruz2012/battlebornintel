# MIT REAP Stakeholder Lens + Weekly Brief Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a REAP 5-stakeholder filter/lens across Companies, Graph, and Funds views, plus a printable Weekly Intelligence Brief organized by REAP pillars.

**Architecture:** All changes in single-file React app `src/App.jsx` (~2068 lines). Add REAP_PILLARS constant, reapFilter state, ReapChipBar component, filter logic in 3 views, and a new Brief view. No new files.

**Tech Stack:** React 19, inline CSS-in-JS, D3.js (graph)

---

### Task 1: Add REAP_PILLARS constant and helper function

**Files:**
- Modify: `src/App.jsx` — insert after VIEWS array (after line 43)

**Step 1: Add REAP_PILLARS constant**

Insert after the VIEWS array closing `];` (line 43):

```jsx
const REAP_PILLARS = [
  { id: "all", label: "All", icon: "◎", color: GOLD },
  { id: "risk_capital", label: "Risk Capital", icon: "◈", color: GREEN },
  { id: "corporations", label: "Corporations", icon: "△", color: BLUE },
  { id: "entrepreneurs", label: "Entrepreneurs", icon: "⬡", color: GOLD },
  { id: "universities", label: "Universities", icon: "▣", color: PURPLE },
  { id: "government", label: "Government", icon: "⊕", color: RED },
];

function getReapPillar(entity) {
  if (!entity) return null;
  // Funds
  if (entity.type === "SSBCI" || entity.type === "Angel" || entity.type === "Deep Tech VC" || entity.type === "Growth VC" || entity.type === "Accelerator") return "risk_capital";
  // Externals by etype
  if (entity.etype === "VC Firm" || entity.etype === "PE Firm" || entity.etype === "Investment Co" || entity.etype === "SPAC") return "risk_capital";
  if (entity.etype === "Corporation") return "corporations";
  if (entity.etype === "University" || entity.etype === "University Hub") return "universities";
  if (entity.etype === "Government" || entity.etype === "Economic Development") return "government";
  if (entity.etype === "Foundation") return "government";
  // Companies
  if (entity.stage || entity.momentum !== undefined) return "entrepreneurs";
  // Accelerators
  if (entity.atype) return "risk_capital";
  return null;
}

function getCompanyReapConnections(companyId) {
  const connected = new Set();
  const allEntities = [...EXTERNALS, ...ECOSYSTEM_ORGS, ...ACCELERATORS];
  VERIFIED_EDGES.forEach(e => {
    const cId = `c_${companyId}`;
    if (e.source === cId || e.target === cId) {
      const otherId = e.source === cId ? e.target : e.source;
      const entity = allEntities.find(x => x.id === otherId);
      if (entity) {
        const pillar = getReapPillar(entity);
        if (pillar) connected.add(pillar);
      }
      // Check funds
      const fundMatch = otherId.startsWith("f_") ? FUNDS.find(f => f.id === otherId.replace("f_","")) : null;
      if (fundMatch) connected.add("risk_capital");
    }
  });
  return connected;
}
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add REAP pillar constants and classification helpers"
```

---

### Task 2: Add reapFilter state and ReapChipBar component

**Files:**
- Modify: `src/App.jsx` — add state near line 1446, add component inline

**Step 1: Add reapFilter state**

After `const [fundDetail, setFundDetail] = useState(null);` (line 1446), add:

```jsx
  const [reapFilter, setReapFilter] = useState("all");
```

**Step 2: Add ReapChipBar inline component**

Right after the reapFilter state line, add a helper function that returns the chip bar JSX. This will be called inside the views that need it:

```jsx
  const ReapChipBar = () => (
    <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
      {REAP_PILLARS.map(p => (
        <button key={p.id} onClick={() => setReapFilter(p.id)}
          style={{
            padding:"5px 12px", borderRadius:20, fontSize:10, fontWeight:600, cursor:"pointer",
            border:`1px solid ${reapFilter === p.id ? p.color+"60" : BORDER}`,
            background: reapFilter === p.id ? p.color+"18" : "transparent",
            color: reapFilter === p.id ? p.color : MUTED,
            transition:"all 0.15s"
          }}>
          {p.icon} {p.label}
        </button>
      ))}
    </div>
  );
```

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add reapFilter state and ReapChipBar component"
```

---

### Task 3: Integrate REAP lens into Companies view

**Files:**
- Modify: `src/App.jsx` — Companies view block starting at line ~1742

**Step 1: Add ReapChipBar to Companies view**

Inside the `{view === "companies" && (` block, right after the opening `<div style={fadeIn}>`, add:

```jsx
            <ReapChipBar />
```

**Step 2: Add REAP filtering to the company list**

The Companies view currently renders `{filtered.map(c => (`. We need to wrap this with REAP filtering. Replace `{filtered.map(c => (` with:

```jsx
              {filtered.filter(c => {
                if (reapFilter === "all") return true;
                if (reapFilter === "entrepreneurs") return true;
                return getCompanyReapConnections(c.id).has(reapFilter);
              }).map(c => (
```

**Step 3: Update the results count**

The results count `<span>{filtered.length} results</span>` should reflect REAP filtering too. Replace it with:

```jsx
              <span style={{ fontSize:11, color:MUTED }}>{reapFilter === "all" ? filtered.length : filtered.filter(c => reapFilter === "entrepreneurs" || getCompanyReapConnections(c.id).has(reapFilter)).length} results</span>
```

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate REAP filter lens into Companies view"
```

---

### Task 4: Integrate REAP lens into Funds view

**Files:**
- Modify: `src/App.jsx` — Funds view block starting at line ~1789

**Step 1: Add ReapChipBar to Funds view**

Inside the `{view === "investors" && !fundDetail && (` block, right after the section label div (`Fund & Program Performance`), add:

```jsx
            <ReapChipBar />
```

**Step 2: Add REAP filtering to the fund list**

The Funds view renders `{FUNDS.map(f => {`. Replace with:

```jsx
              {FUNDS.filter(f => {
                if (reapFilter === "all") return true;
                if (reapFilter === "risk_capital") return true;
                if (reapFilter === "government") return f.type === "SSBCI";
                return false;
              }).map(f => {
```

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate REAP filter lens into Funds view"
```

---

### Task 5: Integrate REAP lens into Graph view

**Files:**
- Modify: `src/App.jsx` — Graph view (~line 1892) and OntologyGraphView component (~line 985)

**Step 1: Pass reapFilter prop to OntologyGraphView**

In the Graph view section, change:

```jsx
<OntologyGraphView onSelectCompany={(id)=>{setSelectedCompany(COMPANIES.find(c=>c.id===id)||null);setView("companies");}} />
```

to:

```jsx
<ReapChipBar />
<OntologyGraphView reapFilter={reapFilter} onSelectCompany={(id)=>{setSelectedCompany(COMPANIES.find(c=>c.id===id)||null);setView("companies");}} />
```

**Step 2: Accept reapFilter prop in OntologyGraphView**

Change the function signature from:
```jsx
function OntologyGraphView({onSelectCompany}) {
```
to:
```jsx
function OntologyGraphView({onSelectCompany, reapFilter="all"}) {
```

**Step 3: Add REAP-based opacity to node rendering**

Inside OntologyGraphView, find where nodes are rendered as circles (the SVG circle elements). Add opacity logic. Find the node circle rendering — there should be a `.map` over `layout.nodes` that renders `<circle>` or `<g>` elements. Add an opacity calculation:

Before the node rendering map, add:

```jsx
  const reapNodeMatch = (node) => {
    if (reapFilter === "all") return true;
    const entity = [...EXTERNALS, ...ECOSYSTEM_ORGS, ...ACCELERATORS].find(x => x.id === node.id);
    if (entity) return getReapPillar(entity) === reapFilter;
    if (node.id.startsWith("f_")) {
      const fund = FUNDS.find(f => f.id === node.id.replace("f_",""));
      return fund ? getReapPillar(fund) === reapFilter : false;
    }
    if (node.type === "company") return reapFilter === "entrepreneurs";
    return false;
  };
```

Then apply opacity to each node element: add `opacity: reapNodeMatch(n) ? 1 : 0.15` to the node's style/group.

The exact rendering code varies — the implementer should find the node rendering loop and add the opacity conditionally. The key rule: if `reapFilter !== "all"`, matching nodes get opacity 1.0, non-matching get 0.15.

**Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate REAP filter lens into Graph view"
```

---

### Task 6: Add Brief view to VIEWS array and implement Brief view

**Files:**
- Modify: `src/App.jsx` — VIEWS array (line ~33) and main render (before line ~2061)

**Step 1: Add brief to VIEWS array**

Add after the map entry:

```jsx
  { id: "brief", label: "Brief", icon: "📋" },
```

**Step 2: Add Brief view block**

Before the closing `</div>` at line ~2061 (the one before `{/* DETAIL PANEL */}`), insert the Brief view:

```jsx
        {/* ═══════════════════════ WEEKLY BRIEF ═══════════════════════ */}
        {view === "brief" && (
          <div style={{ ...fadeIn, maxWidth:900, margin:"0 auto" }}>
            {/* Print styles */}
            <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:24, paddingBottom:16, borderBottom:`2px solid ${GOLD}40` }}>
              <div style={{ fontSize:10, color:GOLD, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Battle Born Intelligence</div>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>GOED Weekly Intelligence Brief</div>
              <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>Week Ending {new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</div>
              <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>Innovation-Based Economic Development</div>
            </div>

            {/* SSBCI Summary Bar */}
            {(() => {
              const ssbciFunds = FUNDS.filter(f=>f.type==="SSBCI");
              const ssbciDeployed = ssbciFunds.reduce((s,f)=>s+f.deployed,0);
              const avgLev = ssbciFunds.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbciFunds.filter(f=>f.leverage).length;
              const privateLev = Math.round(ssbciDeployed * avgLev);
              const ssbciCompanies = allScored.filter(c=>c.eligible.some(e=>["bbv","fundnv","1864"].includes(e)));
              const ssbciAvgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s,c)=>s+c.irs,0)/ssbciCompanies.length) : 0;
              return (
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:24 }}>
                  <Stat label="SSBCI Deployed" value={fmt(ssbciDeployed)} sub={`${ssbciFunds.length} funds`} color={PURPLE} />
                  <Stat label="Private Leverage" value={fmt(privateLev)} sub={`${avgLev.toFixed(1)}x ratio`} color={GREEN} />
                  <Stat label="Portfolio Cos" value={ssbciCompanies.length} sub={`of ${COMPANIES.length}`} color={GOLD} />
                  <Stat label="Avg IRS" value={ssbciAvgIRS} sub="SSBCI portfolio" color={ssbciAvgIRS >= 70 ? GREEN : GOLD} />
                </div>
              );
            })()}

            {/* REAP Pillar Sections */}
            {REAP_PILLARS.filter(p => p.id !== "all").map(pillar => {
              // Gather entities for this pillar
              const allEntities = [...EXTERNALS, ...ECOSYSTEM_ORGS, ...ACCELERATORS];
              const pillarEntities = allEntities.filter(e => getReapPillar(e) === pillar.id);
              const pillarFunds = FUNDS.filter(f => getReapPillar(f) === pillar.id);

              // Companies connected to this pillar
              const pillarCompanies = pillar.id === "entrepreneurs"
                ? allScored
                : allScored.filter(c => getCompanyReapConnections(c.id).has(pillar.id));

              // Timeline events related to this pillar
              const pillarEvents = TIMELINE_EVENTS.filter(ev => {
                if (pillar.id === "entrepreneurs") return ["funding","momentum","launch","hiring"].includes(ev.type);
                if (pillar.id === "risk_capital") return ["funding"].includes(ev.type);
                if (pillar.id === "government") return ["grant"].includes(ev.type);
                if (pillar.id === "corporations") return ["partnership"].includes(ev.type);
                if (pillar.id === "universities") return false;
                return false;
              }).slice(0, 3);

              // Pillar-specific metrics
              let metrics = [];
              if (pillar.id === "risk_capital") {
                const totalDeployed = pillarFunds.reduce((s,f)=>s+f.deployed,0);
                const ssbciFunds = pillarFunds.filter(f=>f.type==="SSBCI");
                metrics = [
                  `${pillarFunds.length} funds tracked`,
                  `${fmt(totalDeployed)} deployed`,
                  `${ssbciFunds.length} SSBCI programs`,
                ];
              } else if (pillar.id === "entrepreneurs") {
                const gradeA = pillarCompanies.filter(c=>c.grade.startsWith("A")).length;
                const topMover = [...pillarCompanies].sort((a,b)=>b.momentum-a.momentum)[0];
                metrics = [
                  `${pillarCompanies.length} companies tracked`,
                  `${gradeA} Grade A companies`,
                  topMover ? `Top: ${topMover.name} (momentum ${topMover.momentum})` : "",
                ].filter(Boolean);
              } else if (pillar.id === "government") {
                metrics = [
                  `${pillarEntities.length} government entities`,
                  `SSBCI administered by GOED`,
                  `DOE, SBIR/STTR, AFWERX active`,
                ];
              } else if (pillar.id === "corporations") {
                metrics = [
                  `${pillarEntities.length} corporate partners`,
                  `${pillarCompanies.length} companies with corporate ties`,
                ];
              } else if (pillar.id === "universities") {
                metrics = [
                  `${pillarEntities.length} university hubs`,
                  `UNR Innevation Center + UNLV Tech Park`,
                ];
              }

              return (
                <div key={pillar.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, marginBottom:12, borderLeft:`3px solid ${pillar.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:pillar.color }}>{pillar.icon} {pillar.label}</div>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:pillar.color+"15", color:pillar.color }}>{pillarCompanies.length} companies</span>
                  </div>

                  {/* Metrics */}
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:10 }}>
                    {metrics.map((m,i) => (
                      <span key={i} style={{ fontSize:11, color:TEXT }}>{m}</span>
                    ))}
                  </div>

                  {/* Deal flow / events */}
                  {pillarEvents.length > 0 && (
                    <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:8, marginTop:6 }}>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Recent Activity</div>
                      {pillarEvents.map((ev, i) => (
                        <div key={i} style={{ fontSize:11, color:TEXT, marginBottom:4 }}>
                          <span style={{ color:MUTED }}>{ev.date.slice(5)}</span> {ev.icon} <span style={{ fontWeight:600 }}>{ev.company}</span> — {ev.detail}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Top companies in pillar */}
                  {pillar.id !== "entrepreneurs" && pillarCompanies.length > 0 && (
                    <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:8, marginTop:6 }}>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Key Companies</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {pillarCompanies.sort((a,b)=>b.irs-a.irs).slice(0,6).map(c => (
                          <span key={c.id} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:pillar.color+"12", border:`1px solid ${pillar.color}25`, color:TEXT }}>{c.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ textAlign:"center", paddingTop:16, borderTop:`1px solid ${BORDER}`, marginTop:8 }}>
              <div style={{ fontSize:10, color:MUTED }}>Generated by Battle Born Intelligence · {new Date().toLocaleString()}</div>
              <button className="no-print" onClick={() => window.print()} style={{ marginTop:10, padding:"8px 20px", background:GOLD+"20", color:GOLD, border:`1px solid ${GOLD}40`, borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer" }}>🖨 Print Brief</button>
            </div>
          </div>
        )}
```

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add Weekly Intelligence Brief view with REAP pillars"
```

---

### Task 7: Verify everything works

**Step 1: Check for syntax errors**

```bash
grep -c "REAP_PILLARS\|reapFilter\|ReapChipBar\|getReapPillar\|getCompanyReapConnections" src/App.jsx
```

Expected: Multiple matches confirming all new code is present.

**Step 2: Verify no broken references**

```bash
grep -n "watchlist\|compareList" src/App.jsx
```

Expected: Only graph engine internal `watchlist` references.

**Step 3: Count views in VIEWS array**

```bash
grep -c "{ id:" src/App.jsx | head -1
```

Should show VIEWS now has 10 entries (added "brief").

**Step 4: Commit final cleanup if needed**

```bash
git add -A
git commit -m "chore: verify REAP lens + Brief integration"
```
