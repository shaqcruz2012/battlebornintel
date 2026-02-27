import { Grade } from '../shared/Grade.jsx';
import { MBar } from '../shared/MBar.jsx';
import { Spark } from '../shared/Spark.jsx';
import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel, getStageList } from '../../engine/formatters.js';

export default function CompaniesView({ viewProps }) {
  const {
    config, data, filtered, isMobile,
    search, setSearch, stageFilter, setStageFilter,
    regionFilter, setRegionFilter, sortBy, setSortBy,
    selectedCompany, setSelectedCompany,
    compareList, setCompareList, toggleWatchlist, isWatched,
  } = viewProps;

  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L = config?.labels || {};

  const fadeIn = { animation: "fadeIn 0.3s ease-out" };

  return (
    <div style={fadeIn}>
      <div style={{ display:"flex", gap: isMobile ? 6 : 12, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L.searchPlaceholder || "Search companies, sectors..."} style={{ flex:1, minWidth: isMobile ? "100%" : 200, padding:"10px 14px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, color:TEXT, fontSize:13, outline:"none" }} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", width: isMobile ? "100%" : "auto" }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ flex: isMobile ? 1 : "none", padding:"8px 10px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TEXT, fontSize:11 }}>
            <option value="all">{"All " + (L.stageLabel || "Stage") + "s"}</option>
            {getStageList(config).map(s => <option key={s} value={s}>{sl(s)}</option>)}
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
        {filtered.map(c => (
          <div key={c.id} onClick={() => setSelectedCompany(selectedCompany?.id === c.id ? null : c)} style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 10px" : "12px 16px", background: selectedCompany?.id === c.id ? "#1A1814" : CARD, border:`1px solid ${selectedCompany?.id === c.id ? GOLD+"40" : BORDER}`, borderRadius:10, cursor:"pointer", transition:"all 0.15s" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                <span style={{ fontSize:14, fontWeight:600 }}>{c.name}</span>
                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:sc[c.stage]+"22", color:sc[c.stage], fontWeight:600 }}>{sl(c.stage)}</span>
              </div>
              <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{c.sector.join(" · ")} · {c.city}</div>
            </div>
            {!isMobile && <div style={{ fontSize:13, fontWeight:600, color:GREEN, flexShrink:0 }}>{fmt(c.funding)}</div>}
            <MBar score={c.momentum} w={isMobile ? 40 : 70} />
            {!isMobile && <div style={{ display:"flex", gap:3, flexShrink:0 }}>
              {c.eligible.map(e => <span key={e} style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:GOLD+"20", color:GOLD }}>{e.toUpperCase()}</span>)}
            </div>}
            <button onClick={e => { e.stopPropagation(); setCompareList(prev => prev.includes(c.id) ? prev.filter(x=>x!==c.id) : [...prev.slice(-3),c.id]); }} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${compareList.includes(c.id) ? GOLD : BORDER}`, background:compareList.includes(c.id) ? GOLD+"20" : "transparent", color:compareList.includes(c.id) ? GOLD : MUTED, cursor:"pointer", fontSize:12, flexShrink:0 }}>{"\u27FA"}</button>
            <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED+"60", cursor:"pointer", fontSize:14, padding:2 }}>{isWatched(c.id) ? "\u2605" : "\u2606"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
