import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, TRIGGER_CFG, GRADE_COLORS } from "../lib/constants";
import { fmt, stageLabel } from "../lib/formatters";
import computeIRS from "../lib/computeIRS";
import { Grade } from "./shared";

export default function DetailPanel({ selectedCompany, setSelectedCompany, toggleWatchlist, isWatched, isMobile }) {
  if (!selectedCompany) return null;
  const sc = computeIRS(selectedCompany);
  const gc = GRADE_COLORS[sc.grade] || MUTED;
  const panelStyle = isMobile
    ? { position:"fixed", inset:0, background:CARD, zIndex:300, overflowY:"auto", padding:20, animation:"slideUp 0.25s ease-out" }
    : { position:"fixed", right:0, top:0, width:420, height:"100vh", background:CARD, borderLeft:`1px solid ${BORDER}`, zIndex:300, overflowY:"auto", padding:24, animation:"slideIn 0.25s ease-out", boxShadow:`-8px 0 32px ${DARK}` };
  return (
    <div style={panelStyle}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, color:GOLD, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>{stageLabel(sc.stage)}</div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{sc.name}</h2>
          <div style={{ fontSize:12, color:MUTED, marginTop:2 }}>{sc.city}, NV · Est. {sc.founded} · {sc.employees} people</div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => toggleWatchlist(sc.id)} style={{ background:isWatched(sc.id) ? GOLD+"20" : "none", border:`1px solid ${isWatched(sc.id) ? GOLD+"40" : BORDER}`, color:isWatched(sc.id) ? GOLD : MUTED, fontSize:16, cursor:"pointer", padding:"4px 8px", borderRadius:6, lineHeight:1 }}>{isWatched(sc.id) ? "★" : "☆"}</button>
          <button onClick={() => setSelectedCompany(null)} style={{ background:"none", border:"none", color:MUTED, fontSize:22, cursor:"pointer", padding:8, lineHeight:1 }}>✕</button>
        </div>
      </div>
      <p style={{ fontSize:13, lineHeight:1.6, color:TEXT, margin:"0 0 20px 0" }}>{sc.description}</p>

      <div style={{ background:DARK, borderRadius:10, padding:16, marginBottom:20, border:`1px solid ${BORDER}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1.5, textTransform:"uppercase" }}>Investment Readiness Score</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Grade grade={sc.grade} size="lg" />
            <div style={{ fontSize:28, fontWeight:800, color:gc }}>{sc.irs}</div>
          </div>
        </div>
        {Object.entries(sc.dims).map(([key, val]) => (
          <div key={key} style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:3 }}>
              <span style={{ color:MUTED, textTransform:"capitalize" }}>{key.replace("_"," ")}</span>
              <span style={{ color: val >= 70 ? GREEN : val >= 45 ? GOLD : MUTED, fontWeight:600 }}>{val}</span>
            </div>
            <div style={{ height:4, background:"#1a1a18", borderRadius:2, overflow:"hidden" }}>
              <div style={{ width:`${val}%`, height:"100%", borderRadius:2, background: val >= 70 ? GREEN : val >= 45 ? GOLD : MUTED+"80", transition:"width 0.5s ease" }} />
            </div>
          </div>
        ))}
        {sc.triggers.length > 0 && (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:12 }}>
            {sc.triggers.map(t => { const cfg = TRIGGER_CFG[t]; return cfg ? <span key={t} style={{ fontSize:9, padding:"3px 8px", borderRadius:10, background:cfg.c+"15", color:cfg.c, border:`1px solid ${cfg.c}30` }}>{cfg.i} {cfg.l}</span> : null; })}
          </div>
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        <div style={{ padding:12, background:DARK, borderRadius:8, border:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Funding</div>
          <div style={{ fontSize:20, fontWeight:700, color:GREEN }}>{fmt(sc.funding)}</div>
        </div>
        <div style={{ padding:12, background:DARK, borderRadius:8, border:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1 }}>Momentum</div>
          <div style={{ fontSize:20, fontWeight:700, color:sc.momentum > 75 ? GREEN : GOLD }}>{sc.momentum}</div>
        </div>
      </div>

      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Sectors</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>{sc.sector.map(s => <span key={s} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, background:BLUE+"15", color:BLUE, border:`1px solid ${BLUE}25` }}>{s}</span>)}</div>

      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>Program Eligibility</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{sc.eligible.length > 0 ? sc.eligible.map(e => <span key={e} style={{ fontSize:11, padding:"3px 10px", borderRadius:6, background:GREEN+"15", color:GREEN, border:`1px solid ${GREEN}25` }}>✓ {e.toUpperCase()}</span>) : <span style={{ fontSize:12, color:MUTED }}>No current eligibility</span>}</div>
    </div>
  );
}
