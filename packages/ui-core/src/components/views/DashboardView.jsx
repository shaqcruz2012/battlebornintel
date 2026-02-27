import { useState } from 'react';
import { Stat } from '../shared/Stat.jsx';
import { Grade } from '../shared/Grade.jsx';
import { Counter } from '../shared/Counter.jsx';
import { Spark } from '../shared/Spark.jsx';
import { MBar } from '../shared/MBar.jsx';
import { FirstUseHint, ScoreExplainer } from '../shared/Onboarding.jsx';
import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, PURPLE, ORANGE } from '../../styles/tokens.js';
import { fmt, getStageColors, getStageLabel, getStageList } from '../../engine/formatters.js';
import { GRADE_COLORS, TRIGGER_CFG } from '../../engine/irs.js';

function HeatChip({ s, hc, L, tooltip, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={tooltip ? () => setHover(true) : undefined}
      onMouseLeave={tooltip ? () => setHover(false) : undefined}
      style={{ flexShrink:0, padding:"6px 10px", borderRadius:6, background:hc+"12", border:`1px solid ${hc}30`, cursor:"pointer", textAlign:"center", minWidth:70, position:"relative" }}
    >
      <div style={{ fontSize:14, fontWeight:800, color:hc }}>{s.heat}</div>
      <div style={{ fontSize:8, color:MUTED, marginTop:1 }}>{s.name}</div>
      <div style={{ fontSize:8, color:MUTED }}>{s.count} {L.entityShort || "cos"}</div>
      {tooltip && hover && (
        <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:6, padding:"8px 10px", background:"#1E1D1A", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:10, color:TEXT, lineHeight:1.4, zIndex:50, boxShadow:"0 4px 12px rgba(0,0,0,0.5)", minWidth:180, maxWidth:240, textAlign:"left", whiteSpace:"normal" }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

export default function DashboardView({ viewProps }) {
  const {
    config, data, allScored, isMobile, isTablet,
    watchlist, setView, setSectorDetail, setSelectedCompany,
    totalFunding, avgMomentum, totalEmployees, sectorStats,
  } = viewProps;

  const sc = getStageColors(config);
  const sl = getStageLabel(config);
  const L = config?.labels || {};
  const T = config?.tooltips || {};

  const fadeIn = { animation: "fadeIn 0.3s ease-out" };
  const COMPANIES = data.companies;
  const FUNDS = data.funds;
  const showSSBCI = config?.features?.ssbci !== false;

  return (
    <div style={fadeIn}>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: isMobile ? 8 : 16, marginBottom:24 }}>
        <Stat label={L.entityPlural || "Companies"} value={<Counter end={COMPANIES.length} />} sub={`${allScored.filter(c=>c.grade.startsWith("A")).length} Grade A`} tooltip={T.entityCount} />
        <Stat label={L.fundingLabel || "Total Capital"} value={<Counter end={totalFunding} prefix="$" suffix="M" />} sub={L.fundingSub || "Private + SSBCI"} color={GREEN} tooltip={T.funding} />
        <Stat label={L.momentumLabel || "Avg Momentum"} value={<Counter end={avgMomentum} />} sub={L.momentumSub || "0-100 composite"} color={avgMomentum > 60 ? GREEN : GOLD} tooltip={T.momentum} />
        <Stat label={L.employeesLabel || "Total Jobs"} value={<Counter end={totalEmployees} />} sub={L.employeesSub || "Across ecosystem"} color={BLUE} tooltip={T.employees} />
        {!isMobile && showSSBCI && <Stat label="SSBCI Deployed" value={fmt(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+f.deployed,0))} sub={`${(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+(f.leverage||0),0)/FUNDS.filter(f=>f.type==="SSBCI"&&f.leverage).length).toFixed(1)}x leverage`} color={PURPLE} tooltip={T.ssbci} />}
        {!isMobile && <Stat label="Watchlist" value={watchlist.length} sub={`${L.entityShort || "companies"} tracked`} tooltip={T.watchlist} />}
      </div>

      {/* Sector Heat Strip */}
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <FirstUseHint id="sector-heat" text="Sector heat scores (0-100) reflect market activity, policy momentum, and capital flow. Click any sector chip to explore companies within it." position="bottom">
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase" }}>Sector Heat Map</div>
          </FirstUseHint>
          <ScoreExplainer config={config} />
        </div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
          {sectorStats.slice(0,12).map(s => {
            const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            const ST = config?.sectorTooltips || {};
            return <HeatChip key={s.name} s={s} hc={hc} L={L} tooltip={ST[s.name]} onClick={() => { setView("sectors"); setSectorDetail(s); }} />;
          })}
        </div>
      </div>

      {/* Enterprise widgets — only show when docket data exists */}
      {data.dockets && data.dockets.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap:12, marginBottom:20 }}>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Upcoming Deadlines</div>
            {data.dockets.filter(d => d.nextDeadline && new Date(d.nextDeadline) > new Date()).sort((a, b) => new Date(a.nextDeadline) - new Date(b.nextDeadline)).slice(0, 4).map(d => {
              const days = Math.round((new Date(d.nextDeadline) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={d.id} onClick={() => setView("dockets")} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${BORDER}`, cursor:"pointer" }}>
                  <span style={{ fontSize:10, color:TEXT, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{d.title}</span>
                  <span style={{ fontSize:10, fontWeight:700, color: days <= 30 ? "#EF4444" : days <= 90 ? ORANGE : MUTED, flexShrink:0, marginLeft:8 }}>{days}d</span>
                </div>
              );
            })}
            {data.dockets.filter(d => d.nextDeadline && new Date(d.nextDeadline) > new Date()).length === 0 && (
              <div style={{ fontSize:10, color:MUTED }}>No upcoming deadlines</div>
            )}
          </div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Pipeline by Stage</div>
            {(config?.stages?.list || []).filter(s => s !== "retired").map(s => {
              const inStage = COMPANIES.filter(c => c.stage === s);
              const mw = inStage.reduce((sum, c) => sum + (c.capacityMW || 0), 0);
              const pct = COMPANIES.length > 0 ? Math.round(inStage.length / COMPANIES.length * 100) : 0;
              return inStage.length > 0 ? (
                <div key={s} style={{ marginBottom:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:9 }}>
                    <span style={{ color:sc[s] || MUTED }}>{sl(s)}</span>
                    <span style={{ color:MUTED }}>{inStage.length}{mw > 0 ? " · " + mw.toLocaleString() + "MW" : ""}</span>
                  </div>
                  <div style={{ height:3, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:sc[s] || MUTED, borderRadius:2 }} />
                  </div>
                </div>
              ) : null;
            })}
          </div>
          <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14 }}>
            <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Recent Filings</div>
            {data.dockets.flatMap(d => (d.filings || []).map(f => ({ ...f, docket: d.title }))).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map((f, i) => (
              <div key={i} onClick={() => setView("dockets")} style={{ padding:"4px 0", borderBottom:`1px solid ${BORDER}`, cursor:"pointer" }}>
                <div style={{ fontSize:10, color:GOLD }}>{f.date} · {f.filer}</div>
                <div style={{ fontSize:9, color:MUTED, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.docket}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns: isTablet ? "1fr" : "2fr 1fr", gap:20 }}>
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Top Momentum — Live Rankings</div>
          {[...COMPANIES].sort((a, b) => b.momentum - a.momentum).slice(0, isMobile ? 6 : 10).map((c, i) => (
            <div key={c.id} onClick={() => { setSelectedCompany(c); }} style={{ display:"flex", alignItems:"center", padding:"8px 0", borderBottom: i < 9 ? `1px solid ${BORDER}` : "none", cursor:"pointer", gap:8 }}>
              <span style={{ width:20, fontSize:12, color: i < 3 ? GOLD : MUTED, fontWeight:600 }}>{i + 1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                <div style={{ fontSize:10, color:MUTED }}>{c.sector[0]} · {c.city}</div>
              </div>
              {!isMobile && <div style={{ marginRight:12 }}><Spark data={[c.momentum*0.7,c.momentum*0.8,c.momentum*0.85,c.momentum*0.9,c.momentum*0.95,c.momentum]} color={c.momentum > 75 ? GREEN : GOLD} /></div>}
              <MBar score={c.momentum} w={isMobile ? 50 : 80} />
            </div>
          ))}
        </div>

        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Sector Distribution</div>
          {sectorStats.slice(0, isMobile ? 6 : 10).map(s => {
            const pct = Math.round(s.count / COMPANIES.length * 100);
            const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            return (
              <div key={s.name} onClick={() => { setView("sectors"); setSectorDetail(s); }} style={{ marginBottom:10, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                  <span>{s.name}</span><span style={{ color:hc }}>{"🔥"}{s.heat} · {s.count}</span>
                </div>
                <div style={{ height:4, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:hc, borderRadius:2, transition:"width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
