import { useState, useMemo } from "react";
import { useApi } from "../hooks/useApi.js";
import { CARD, BORDER, MUTED, GOLD, GREEN, TEXT, STAGE_COLORS, fadeIn, fmt, stageLabel } from "@bbi/ui-core";
import ReapChipBar from "../components/ReapChipBar.jsx";
import Grade from "../components/Grade.jsx";
import MBar from "../components/MBar.jsx";

export default function Companies({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("momentum");
  const [reapFilter, setReapFilter] = useState("all");

  if (!companies) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading companies...</div>;

  const filtered = companies.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.sector.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (regionFilter !== "all" && c.region !== regionFilter) return false;
    return true;
  }).sort((a, b) => sortBy === "momentum" ? b.momentum - a.momentum : sortBy === "funding" ? b.funding - a.funding : a.name.localeCompare(b.name));

  const selectedCompanyRef = null; // handled by parent

  return (
    <div style={fadeIn}>
      <ReapChipBar reapFilter={reapFilter} setReapFilter={setReapFilter} />
      <div style={{ display:"flex", gap: isMobile ? 6 : 12, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, sectors..." style={{ flex:1, minWidth: isMobile ? "100%" : 200, padding:"10px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT, fontSize:13, outline:"none" }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", width: isMobile ? "100%" : "auto" }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
            <option value="all">All Stages</option>
            {Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{stageLabel(s)}</option>)}
          </select>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
            <option value="all">All Regions</option>
            <option value="las_vegas">Las Vegas</option>
            <option value="henderson">Henderson</option>
            <option value="reno">Reno</option>
            <option value="rural">Rural</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
            <option value="momentum">Momentum</option>
            <option value="funding">Funding</option>
            <option value="name">Name</option>
          </select>
        </div>
        <span style={{ fontSize:11, color:MUTED }}>{filtered.length} results</span>
      </div>

      <div style={{ display:"grid", gap:6 }}>
        {filtered.filter(c => {
          if (reapFilter === "all") return true;
          if (reapFilter === "entrepreneurs") return true;
          // For other REAP pillars, we'd need graph data; show all for now
          return true;
        }).map(c => (
          <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 10px" : "12px 16px", background: CARD, border:`1px solid ${BORDER}`, borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{c.name}</span>
                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:STAGE_COLORS[c.stage]+"22", color:STAGE_COLORS[c.stage], fontWeight:600 }}>{stageLabel(c.stage)}</span>
              </div>
              <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{c.sector.join(" · ")} · {c.city}</div>
            </div>
            {!isMobile && <div style={{ fontSize:13, fontWeight:600, color:GREEN, flexShrink:0 }}>{fmt(c.funding)}</div>}
            <MBar score={c.momentum} w={isMobile ? 40 : 70} />
            {!isMobile && <div style={{ display:"flex", gap:3, flexShrink:0 }}>
              {c.eligible.map(e => <span key={e} style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:GOLD+"20", color:GOLD }}>{e.toUpperCase()}</span>)}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}
