import { Stat } from '../shared/Stat.jsx';
import { Grade } from '../shared/Grade.jsx';
import { ScoreExplainer } from '../shared/Onboarding.jsx';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, ORANGE } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel, getStageList } from '../../engine/formatters.js';

export default function SectorsView({ viewProps }) {
  const {
    config, data, isMobile, sectorStats,
    sectorDetail, setSectorDetail,
    setSelectedCompany, toggleWatchlist, isWatched, setView,
  } = viewProps;

  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L = config?.labels || {};

  const px = isMobile ? 12 : 24;

  /* ─── Sector Grid ─── */
  if (!sectorDetail) {
    return (
      <div style={{ padding:px, animation:"fadeIn 0.4s ease-out" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:TEXT }}>Sector Analytics</div>
              <ScoreExplainer config={config} />
            </div>
            <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>{sectorStats.length} sectors tracked</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap:12 }}>
          {sectorStats.map(s => {
            const heatColor = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            return (
              <div key={s.name} onClick={() => setSectorDetail(s)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:16, cursor:"pointer", transition:"all 0.2s", borderLeft:`3px solid ${heatColor}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = heatColor} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>{s.name}</span>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:heatColor+"20", color:heatColor, fontWeight:700 }}>{"🔥"} {s.heat}</span>
                </div>
                <div style={{ display:"flex", gap:16, fontSize:10, color:MUTED, marginBottom:8 }}>
                  <span>{s.count} companies</span>
                  <span>{fmt(s.totalFunding)} raised</span>
                  <span>Avg IRS: {s.avgIRS}</span>
                </div>
                <div style={{ display:"flex", gap:3, marginBottom:6 }}>
                  {Object.entries(s.stages).sort((a,b) => b[1]-a[1]).slice(0,4).map(([st,ct]) => (
                    <span key={st} style={{ fontSize:8, padding:"1px 5px", borderRadius:3, background:sc[st]+"25", color:sc[st] || MUTED }}>{sl(st)} ({ct})</span>
                  ))}
                </div>
                {s.topCompany && <div style={{ fontSize:9, color:GOLD }}>Top: {s.topCompany.name} (IRS {s.topCompany.irs})</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ─── Sector Deep-Dive ─── */
  return (
    <div style={{ padding:px, animation:"fadeIn 0.3s ease-out" }}>
      <button onClick={() => setSectorDetail(null)} style={{ background:"none", border:"none", color:GOLD, fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>{"\u2190"} All Sectors</button>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>{sectorDetail.name}</div>
        <span style={{ fontSize:12, padding:"3px 10px", borderRadius:20, background:(sectorDetail.heat >= 85 ? "#EF4444" : sectorDetail.heat >= 70 ? ORANGE : GOLD)+"20", color:sectorDetail.heat >= 85 ? "#EF4444" : sectorDetail.heat >= 70 ? ORANGE : GOLD, fontWeight:700 }}>{"🔥"} Heat {sectorDetail.heat}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
        <Stat label="Companies" value={sectorDetail.count} />
        <Stat label="Total Raised" value={fmt(sectorDetail.totalFunding)} />
        <Stat label="Avg IRS" value={sectorDetail.avgIRS} color={sectorDetail.avgIRS >= 70 ? GREEN : sectorDetail.avgIRS >= 55 ? GOLD : MUTED} />
        <Stat label="Stages" value={Object.keys(sectorDetail.stages).length} />
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:10 }}>Companies in {sectorDetail.name}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {sectorDetail.companies.sort((a,b) => b.irs - a.irs).map(c => (
          <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding: isMobile ? "10px 12px" : "12px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"60"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
            <Grade grade={c.grade} size="sm" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, fontWeight:700, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</span>
                <span style={{ fontSize:9, color:MUTED }}>{sl(c.stage)}</span>
              </div>
              <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>{c.city} · {fmt(c.funding)} · {c.employees} people</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:16, fontWeight:700, color:GOLD }}>{c.irs}</div>
              <div style={{ fontSize:8, color:MUTED }}>IRS</div>
            </div>
            <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED, cursor:"pointer", fontSize:16, padding:4 }}>{isWatched(c.id) ? "\u2605" : "\u2606"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
