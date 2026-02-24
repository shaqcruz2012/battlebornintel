import { useState, useMemo } from "react";
import COMPANIES from './data/companies.json';
import VERIFIED_EDGES from './data/edges.json';
import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, SHEAT, VIEWS, css, fadeIn } from "./lib/constants";
import computeIRS from "./lib/computeIRS";
import { useW } from "./components/shared";
import GraphView from "./components/GraphView";
import DetailPanel from "./components/DetailPanel";
import Dashboard from "./components/Dashboard";
import RadarView from "./components/RadarView";
import CompanyList from "./components/CompanyList";
import FundView from "./components/FundView";
import CompareView from "./components/CompareView";
import TimelineView from "./components/TimelineView";
import SSBCIView from "./components/SSBCIView";
import MapView from "./components/MapView";
import SectorView from "./components/SectorView";
import WatchlistView from "./components/WatchlistView";

export default function BattleBornIntelligence() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [sortBy, setSortBy] = useState("momentum");
  const [mobileNav, setMobileNav] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [sectorDetail, setSectorDetail] = useState(null);

  const filtered = useMemo(() => COMPANIES.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.sector.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (regionFilter !== "all" && c.region !== regionFilter) return false;
    return true;
  }).sort((a, b) => sortBy === "momentum" ? b.momentum - a.momentum : sortBy === "funding" ? b.funding - a.funding : a.name.localeCompare(b.name)), [search, stageFilter, regionFilter, sortBy]);

  const scored = useMemo(() => filtered.map(computeIRS).sort((a, b) => b.irs - a.irs), [filtered]);
  const allScored = useMemo(() => COMPANIES.map(computeIRS), []);
  const totalFunding = COMPANIES.reduce((s, c) => s + c.funding, 0);
  const avgMomentum = Math.round(COMPANIES.reduce((s, c) => s + c.momentum, 0) / COMPANIES.length);
  const totalEmployees = COMPANIES.reduce((s, c) => s + c.employees, 0);
  const px = isMobile ? 12 : 24;

  const toggleWatchlist = (id) => setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const isWatched = (id) => watchlist.includes(id);
  const watchedCompanies = useMemo(() => allScored.filter(c => watchlist.includes(c.id)), [allScored, watchlist]);

  const sectorStats = useMemo(() => {
    const map = {};
    allScored.forEach(c => (c.sector || []).forEach(s => {
      if (!map[s]) map[s] = { name: s, count: 0, totalFunding: 0, totalIRS: 0, companies: [], stages: {} };
      map[s].count++;
      map[s].totalFunding += c.funding;
      map[s].totalIRS += c.irs;
      map[s].companies.push(c);
      map[s].stages[c.stage] = (map[s].stages[c.stage] || 0) + 1;
    }));
    return Object.values(map).map(s => ({
      ...s, avgIRS: Math.round(s.totalIRS / s.count), heat: SHEAT[s.name] || 50,
      topCompany: s.companies.sort((a, b) => b.irs - a.irs)[0],
    })).sort((a, b) => b.heat - a.heat);
  }, [allScored]);

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`10px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:DARK+"F0", backdropFilter:"blur(12px)", zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 8 : 12 }}>
          <span style={{ color:GOLD, fontSize:isMobile ? 16 : 18 }}>◆</span>
          <span style={{ fontWeight:700, fontSize:isMobile ? 11 : 14, letterSpacing:isMobile ? 1 : 2, textTransform:"uppercase" }}>{isMobile ? "BBI" : "Battle Born Intelligence"}</span>
          <span style={{ fontSize:9, color:MUTED, background:"#1A1814", padding:"2px 6px", borderRadius:4 }}>v5.0</span>
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
        {view === "dashboard" && <Dashboard isMobile={isMobile} isTablet={isTablet} allScored={allScored} totalFunding={totalFunding} avgMomentum={avgMomentum} totalEmployees={totalEmployees} watchlist={watchlist} sectorStats={sectorStats} setSelectedCompany={setSelectedCompany} setView={setView} setSectorDetail={setSectorDetail} />}
        {view === "radar" && <RadarView scored={scored} isMobile={isMobile} setSelectedCompany={setSelectedCompany} toggleWatchlist={toggleWatchlist} isWatched={isWatched} />}
        {view === "companies" && <CompanyList filtered={filtered} search={search} setSearch={setSearch} stageFilter={stageFilter} setStageFilter={setStageFilter} regionFilter={regionFilter} setRegionFilter={setRegionFilter} sortBy={sortBy} setSortBy={setSortBy} selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} compareList={compareList} setCompareList={setCompareList} toggleWatchlist={toggleWatchlist} isWatched={isWatched} isMobile={isMobile} />}
        {view === "investors" && <FundView allScored={allScored} isMobile={isMobile} setSelectedCompany={setSelectedCompany} />}
        {view === "sectors" && <SectorView sectorStats={sectorStats} sectorDetail={sectorDetail} setSectorDetail={setSectorDetail} isMobile={isMobile} setSelectedCompany={setSelectedCompany} toggleWatchlist={toggleWatchlist} isWatched={isWatched} />}
        {view === "watchlist" && <WatchlistView watchlist={watchlist} setWatchlist={setWatchlist} watchedCompanies={watchedCompanies} isMobile={isMobile} setSelectedCompany={setSelectedCompany} setView={setView} toggleWatchlist={toggleWatchlist} />}
        {view === "compare" && <CompareView compareList={compareList} isMobile={isMobile} />}
        {view === "graph" && (
          <div style={fadeIn}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Ontological Relationship Graph — {VERIFIED_EDGES.length} Verified Edges · Graph Intelligence Active</div>
            <GraphView onSelectCompany={(id)=>{setSelectedCompany(COMPANIES.find(c=>c.id===id)||null);setView("companies");}} />
          </div>
        )}
        {view === "timeline" && <TimelineView isMobile={isMobile} />}
        {view === "ssbci" && <SSBCIView isMobile={isMobile} />}
        {view === "map" && <MapView isMobile={isMobile} setSelectedCompany={setSelectedCompany} />}
      </div>

      <DetailPanel selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany} toggleWatchlist={toggleWatchlist} isWatched={isWatched} isMobile={isMobile} />

      {compareList.length > 0 && view !== "compare" && (
        <div style={{ position:"fixed", bottom: isMobile ? 12 : 20, left:"50%", transform:"translateX(-50%)", background:CARD, border:`1px solid ${GOLD}40`, borderRadius:12, padding: isMobile ? "8px 12px" : "10px 20px", display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, zIndex:200, boxShadow:`0 8px 32px ${DARK}`, animation:"slideUp 0.3s ease-out", maxWidth:"90vw" }}>
          <span style={{ fontSize:11, color:GOLD, flexShrink:0 }}>⟺ {compareList.length}</span>
          {!isMobile && <div style={{ display:"flex", gap:4 }}>
            {compareList.map(id => { const c=COMPANIES.find(x=>x.id===id); return <span key={id} style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:GOLD+"15", color:TEXT }}>{c?.name}</span>; })}
          </div>}
          <button onClick={() => setView("compare")} style={{ padding:"6px 14px", background:GOLD, color:DARK, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer" }}>Compare</button>
          <button onClick={() => setCompareList([])} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", fontSize:14, padding:4 }}>✕</button>
        </div>
      )}
    </div>
  );
}
