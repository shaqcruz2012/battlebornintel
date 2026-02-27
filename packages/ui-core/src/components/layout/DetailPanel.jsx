import { GOLD, CARD, DARK, BORDER, TEXT, MUTED, GREEN, BLUE } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel } from '../../engine/formatters.js';
import { computeScore, getTriggerConfig, GRADE_COLORS } from '../../engine/scoring.js';
import { Grade } from '../shared/Grade.jsx';

export default function DetailPanel({ selectedCompany, setSelectedCompany, watchlist, toggleWatchlist, isWatched, isMobile, sectorHeat, config }) {
  if (!selectedCompany) return null;
  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L = config?.labels || {};
  const triggerCfg = getTriggerConfig(config);
  const score = computeScore(selectedCompany, sectorHeat, config);
  const gc = GRADE_COLORS[score.grade] || MUTED;
  const panelStyle = isMobile
    ? { position:"fixed", inset:0, background:CARD, zIndex:300, overflowY:"auto", padding:20, animation:"slideUp 0.25s ease-out" }
    : { position:"fixed", right:0, top:0, width:420, height:"100vh", background:CARD, borderLeft:`1px solid ${BORDER}`, zIndex:300, overflowY:"auto", padding:24, animation:"slideIn 0.25s ease-out", boxShadow:`-8px 0 32px ${DARK}` };

  return (
    <div style={panelStyle}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:10, color:GOLD, letterSpacing:1.5, textTransform:"uppercase", marginBottom:4 }}>{sl(score.stage)}</div>
          <h2 style={{ fontSize:20, fontWeight:700, margin:0 }}>{score.name}</h2>
          <div style={{ fontSize:12, color:MUTED, marginTop:2 }}>{score.city} · Est. {score.founded} · {score.employees} people</div>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => toggleWatchlist(score.id)} style={{ background:"none", border:`1px solid ${isWatched(score.id) ? GOLD : MUTED}40`, color: isWatched(score.id) ? GOLD : MUTED, fontSize:16, borderRadius:6, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{isWatched(score.id) ? "\u2605" : "\u2606"}</button>
          <button onClick={() => setSelectedCompany(null)} style={{ background:"none", border:`1px solid ${MUTED}40`, color:MUTED, fontSize:16, borderRadius:6, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{"\u2715"}</button>
        </div>
      </div>

      {/* IRS Score Card */}
      <div style={{ background:GOLD+"08", border:`1px solid ${GOLD}25`, borderRadius:12, padding:16, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <Grade grade={score.grade} size="lg" />
          <div>
            <div style={{ fontSize:28, fontWeight:800, color:gc }}>{score.irs}</div>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1 }}>{L.scoreLong || "INVESTMENT READINESS"}</div>
          </div>
        </div>
        {/* Dimension bars */}
        {[
          { label:"Momentum", key:"momentum", max:100 },
          { label:"Funding Velocity", key:"funding_velocity", max:100 },
          { label:"Market Timing", key:"market_timing", max:100 },
          { label:"Hiring Signal", key:"hiring", max:100 },
          { label:"Data Quality", key:"data_quality", max:100 },
          { label:"Network", key:"network", max:100 },
          { label:"Team", key:"team", max:100 },
        ].map(d => (
          <div key={d.key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontSize:9, color:MUTED, width:90, flexShrink:0 }}>{d.label}</span>
            <div style={{ flex:1, height:4, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
              <div style={{ width:`${score.dims[d.key]}%`, height:"100%", borderRadius:2, background: score.dims[d.key] > 70 ? GREEN : score.dims[d.key] > 40 ? GOLD : MUTED, transition:"width 0.4s ease" }} />
            </div>
            <span style={{ fontSize:9, color:MUTED, minWidth:20, textAlign:"right" }}>{score.dims[d.key]}</span>
          </div>
        ))}
      </div>

      {/* Triggers */}
      {score.triggers.length > 0 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
          {score.triggers.map(t => (
            <span key={t} style={{ fontSize:10, padding:"3px 8px", borderRadius:4, background:(triggerCfg[t]?.c||MUTED)+"15", color:triggerCfg[t]?.c||MUTED, display:"flex", alignItems:"center", gap:3 }}>
              {triggerCfg[t]?.i} {triggerCfg[t]?.l}
            </span>
          ))}
        </div>
      )}

      {/* Capacity Metrics (enterprise) */}
      {(score.capacityMW || score.storageMWh || score.acreage) && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6, marginBottom:12 }}>
          {score.capacityMW && (
            <div style={{ background:"#0E0E0C", border:`1px solid ${BORDER}`, borderRadius:6, padding:8, textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:GREEN }}>{score.capacityMW.toLocaleString()}</div>
              <div style={{ fontSize:8, color:MUTED }}>MW</div>
            </div>
          )}
          {score.storageMWh && (
            <div style={{ background:"#0E0E0C", border:`1px solid ${BORDER}`, borderRadius:6, padding:8, textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:BLUE }}>{score.storageMWh.toLocaleString()}</div>
              <div style={{ fontSize:8, color:MUTED }}>MWh</div>
            </div>
          )}
          {score.acreage && (
            <div style={{ background:"#0E0E0C", border:`1px solid ${BORDER}`, borderRadius:6, padding:8, textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:700, color:GOLD }}>{score.acreage.toLocaleString()}</div>
              <div style={{ fontSize:8, color:MUTED }}>Acres</div>
            </div>
          )}
        </div>
      )}

      {/* Developer / EPC (enterprise) */}
      {(score.developer || score.epc) && (
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {score.developer && (
            <div style={{ flex:1, fontSize:10, color:MUTED }}>
              <span style={{ letterSpacing:0.5 }}>DEV: </span>
              <span style={{ color:TEXT }}>{score.developer}</span>
            </div>
          )}
          {score.epc && (
            <div style={{ flex:1, fontSize:10, color:MUTED }}>
              <span style={{ letterSpacing:0.5 }}>EPC: </span>
              <span style={{ color:TEXT }}>{score.epc}</span>
            </div>
          )}
        </div>
      )}

      {/* Risk Factors (enterprise) */}
      {(score.riskFactors || []).length > 0 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
          {score.riskFactors.map(r => (
            <span key={r} style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"#EF444415", color:"#EF4444" }}>
              {"⚠"} {r.replace(/_/g," ")}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize:12, color:TEXT, lineHeight:1.6, marginBottom:12, whiteSpace:"pre-line" }}>{score.description}</div>

      {/* Regulatory Timeline (enterprise) */}
      {(score.keyMilestones || []).length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1, marginBottom:6 }}>REGULATORY TIMELINE</div>
          {score.keyMilestones.map((m, i) => {
            const statusColor = m.status === "complete" ? GREEN : m.status === "in_progress" ? GOLD : MUTED;
            const statusIcon = m.status === "complete" ? "\u2713" : m.status === "in_progress" ? "\u25C9" : "\u25CB";
            return (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", paddingLeft:8, borderLeft:`2px solid ${statusColor}40`, marginBottom:6 }}>
                <span style={{ fontSize:10, color:statusColor, flexShrink:0 }}>{statusIcon}</span>
                <div>
                  <div style={{ fontSize:10, color:statusColor, fontWeight:600 }}>{m.date}</div>
                  <div style={{ fontSize:10, color:TEXT }}>{m.event}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sectors */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
        {(score.sector||[]).map(s => (
          <span key={s} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:BLUE+"15", color:BLUE }}>{s}</span>
        ))}
      </div>

      {/* Funding */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
        <div style={{ background:"#0E0E0C", border:`1px solid ${BORDER}`, borderRadius:8, padding:12 }}>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:1 }}>{L.fundingMetric || "TOTAL RAISED"}</div>
          <div style={{ fontSize:20, fontWeight:700, color:GREEN }}>{fmt(score.funding)}</div>
        </div>
        <div style={{ background:"#0E0E0C", border:`1px solid ${BORDER}`, borderRadius:8, padding:12 }}>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:1 }}>{L.stageLabel || "STAGE"}</div>
          <div style={{ fontSize:14, fontWeight:700, color:sc[score.stage]||MUTED, marginTop:4 }}>{sl(score.stage)}</div>
        </div>
      </div>

      {/* Eligible programs */}
      {score.eligible.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1, marginBottom:4 }}>{L.eligibleLabel || "ELIGIBLE PROGRAMS"}</div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {score.eligible.map(e => (
              <span key={e} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:GOLD+"15", color:GOLD }}>{e.toUpperCase()}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
