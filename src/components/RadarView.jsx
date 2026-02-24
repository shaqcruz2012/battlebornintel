import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, RED, STAGE_COLORS, TRIGGER_CFG, GRADE_COLORS, fadeIn } from "../lib/constants";
import { fmt, stageLabel } from "../lib/formatters";
import { Grade } from "./shared";

export default function RadarView({ scored, isMobile, setSelectedCompany, toggleWatchlist, isWatched }) {
  return (
    <div style={fadeIn}>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 8 : 12, marginBottom:20 }}>
        {[
          { l:"Pipeline", v:scored.length, c:TEXT },
          { l:"Avg IRS", v:scored.length ? Math.round(scored.reduce((s,c) => s+c.irs,0)/scored.length) : 0, c:GREEN },
          { l:"Grade A", v:scored.filter(c=>c.grade.startsWith("A")).length, c:GREEN },
          { l:"Hot Deals", v:scored.filter(c=>c.triggers.length>=4).length, c:RED },
        ].map(s => (
          <div key={s.l} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 12 : 16 }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:10, color:MUTED }}>{s.l}</div>
          </div>
        ))}
      </div>

      {scored.filter(c=>c.triggers.length>=4).length > 0 && (
        <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, padding: isMobile ? 12 : 16, marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#EF4444", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>🔥 Hot Deals — 4+ triggers</div>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {scored.filter(c=>c.triggers.length>=4).slice(0,6).map(c => (
              <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ flexShrink:0, background:DARK, border:`1px solid ${BORDER}`, borderRadius:10, padding:12, minWidth: isMobile ? 160 : 200, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700 }}>{c.name}</span>
                  <Grade grade={c.grade} size="sm" />
                </div>
                <div style={{ fontSize:10, color:MUTED, marginBottom:6 }}>{c.sector.slice(0,2).join(" · ")} · {fmt(c.funding)}</div>
                <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                  {c.triggers.slice(0,3).map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:8, padding:"2px 5px", borderRadius:6, background:cfg.c+"15", color:cfg.c }}>{cfg.i}</span> : null; })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {scored.slice(0, isMobile ? 25 : 40).map((c, idx) => {
          const gc = GRADE_COLORS[c.grade] || MUTED;
          return (
            <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, padding: isMobile ? "10px 10px" : "10px 16px", background: idx % 2 === 0 ? DARK : CARD+"80", border:`1px solid ${BORDER}60`, borderRadius:8, cursor:"pointer", transition:"all 0.15s" }}>
              <span style={{ width:18, fontSize:10, color: idx < 3 ? GOLD : MUTED, fontWeight:700 }}>{idx+1}</span>
              <Grade grade={c.grade} size="sm" />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>{c.name}</span>
                  {!isMobile && <span style={{ fontSize:9, padding:"1px 6px", background:(STAGE_COLORS[c.stage]||MUTED)+"20", borderRadius:4, color:STAGE_COLORS[c.stage]||MUTED, fontWeight:600 }}>{stageLabel(c.stage)}</span>}
                </div>
                <div style={{ fontSize:10, color:MUTED, marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.sector.slice(0,2).join(" · ")} · {c.city} · {fmt(c.funding)}</div>
              </div>
              {!isMobile && <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"flex-end", maxWidth:200 }}>
                {c.triggers.slice(0,4).map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:8, padding:"2px 6px", borderRadius:8, background:cfg.c+"12", color:cfg.c }}>{cfg.i} {cfg.l}</span> : null; })}
              </div>}
              <div style={{ fontSize:13, fontWeight:700, color:gc, width:28, textAlign:"right" }}>{c.irs}</div>
              <button onClick={e => { e.stopPropagation(); toggleWatchlist(c.id); }} style={{ background:"none", border:"none", color:isWatched(c.id) ? GOLD : MUTED+"60", cursor:"pointer", fontSize:14, padding:2, transition:"color 0.15s" }}>{isWatched(c.id) ? "★" : "☆"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
