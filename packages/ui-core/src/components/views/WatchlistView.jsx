import { Stat } from '../shared/Stat.jsx';
import { Grade } from '../shared/Grade.jsx';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, RED } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel, getStageList } from '../../engine/formatters.js';
import { GRADE_COLORS, TRIGGER_CFG } from '../../engine/irs.js';

export default function WatchlistView({ viewProps }) {
  const {
    config, isMobile,
    watchlist, setWatchlist, toggleWatchlist, isWatched,
    watchedCompanies, setSelectedCompany, setView,
  } = viewProps;

  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L = config?.labels || {};

  const px = isMobile ? 12 : 24;

  return (
    <div style={{ padding:px, animation:"fadeIn 0.4s ease-out" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:TEXT }}>My Watchlist</div>
        <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{watchlist.length} {(L.entityPlural || "companies").toLowerCase()} tracked</div></div>
        {watchlist.length > 0 && <button onClick={() => setWatchlist([])} style={{ background:"none", border:`1px solid ${RED}40`, color:RED, fontSize:10, padding:"5px 10px", borderRadius:6, cursor:"pointer" }}>Clear All</button>}
      </div>

      {watchlist.length === 0 ? (
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:12, padding:40, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>{"\u2606"}</div>
          <div style={{ fontSize:14, color:TEXT, marginBottom:6 }}>{"No " + (L.entityPlural || "companies").toLowerCase() + " watched yet"}</div>
          <div style={{ fontSize:11, color:MUTED, marginBottom:16 }}>Star any company from the Radar, Companies, or Sectors view to track it here.</div>
          <button onClick={() => setView("radar")} style={{ padding:"8px 20px", background:GOLD+"20", color:GOLD, border:`1px solid ${GOLD}40`, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Browse Radar {"\u2192"}</button>
        </div>
      ) : (
        <>
          {/* Portfolio Summary */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
            <Stat label="Watched" value={watchedCompanies.length} />
            <Stat label="Avg IRS" value={watchedCompanies.length ? Math.round(watchedCompanies.reduce((s,c) => s+c.irs, 0) / watchedCompanies.length) : 0} color={GREEN} />
            <Stat label="Total Raised" value={fmt(watchedCompanies.reduce((s,c) => s+c.funding, 0))} />
            <Stat label="Total Team" value={watchedCompanies.reduce((s,c) => s+c.employees, 0).toLocaleString()} />
          </div>

          {/* Grade distribution bar */}
          {(() => {
            const gdist = {};
            watchedCompanies.forEach(c => { gdist[c.grade] = (gdist[c.grade] || 0) + 1; });
            const total = watchedCompanies.length || 1;
            return (
              <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:12, marginBottom:16 }}>
                <div style={{ fontSize:10, color:MUTED, marginBottom:6 }}>Grade Distribution</div>
                <div style={{ display:"flex", borderRadius:4, overflow:"hidden", height:8 }}>
                  {["A","A-","B+","B","B-","C+","C","D"].filter(g => gdist[g]).map(g => (
                    <div key={g} style={{ width:`${(gdist[g]/total)*100}%`, background:GRADE_COLORS[g] || MUTED, transition:"width 0.3s" }} title={`${g}: ${gdist[g]}`} />
                  ))}
                </div>
                <div style={{ display:"flex", gap:8, marginTop:6 }}>
                  {["A","A-","B+","B","B-","C+","C","D"].filter(g => gdist[g]).map(g => (
                    <span key={g} style={{ fontSize:9, color:GRADE_COLORS[g] || MUTED }}>{g}: {gdist[g]}</span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Company list */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {watchedCompanies.sort((a,b) => b.irs - a.irs).map(c => (
              <div key={c.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding: isMobile ? "10px 12px" : "12px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"60"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                <Grade grade={c.grade} />
                <div style={{ flex:1, minWidth:0 }} onClick={() => setSelectedCompany(c)}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:TEXT }}>{c.name}</span>
                    <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:sc[c.stage]+"25", color:sc[c.stage] || MUTED }}>{sl(c.stage)}</span>
                    {c.triggers.slice(0,2).map(t => <span key={t} style={{ fontSize:8, color:TRIGGER_CFG[t]?.c || MUTED }}>{TRIGGER_CFG[t]?.i}</span>)}
                  </div>
                  <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{c.city} · {(c.sector||[]).slice(0,2).join(", ")} · {fmt(c.funding)} · {c.employees} people</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:18, fontWeight:700, color:GOLD }}>{c.irs}</div>
                  <div style={{ fontSize:8, color:MUTED }}>IRS</div>
                </div>
                <button onClick={() => toggleWatchlist(c.id)} style={{ background:"none", border:"none", color:GOLD, cursor:"pointer", fontSize:18, padding:4 }} title="Remove from watchlist">{"\u2605"}</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
