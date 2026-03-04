import { useMemo } from "react";
import { useApi } from "../hooks/useApi.js";
import { CARD, BORDER, MUTED, GOLD, GREEN, BLUE, PURPLE, ORANGE, TEXT, STAGE_COLORS, fadeIn, fmt, stageLabel } from "@bbi/ui-core";
import { computeIRS, SHEAT } from "@bbi/ui-core/scoring";
import Stat from "../components/Stat.jsx";
import Counter from "../components/Counter.jsx";
import Spark from "../components/Spark.jsx";
import MBar from "../components/MBar.jsx";

export default function Dashboard({ isMobile, isTablet, setSelectedCompany, setView }) {
  const { data: companies } = useApi("/companies");
  const { data: funds } = useApi("/funds");

  if (!companies || !funds) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading dashboard...</div>;

  const allScored = companies;
  const totalFunding = companies.reduce((s, c) => s + c.funding, 0);
  const totalEmployees = companies.reduce((s, c) => s + c.employees, 0);

  const sectorStats = (() => {
    const map = {};
    allScored.forEach(c => (c.sector || []).forEach(s => {
      if (!map[s]) map[s] = { name: s, count: 0, totalFunding: 0, totalIRS: 0, companies: [], stages: {} };
      map[s].count++;
      map[s].totalFunding += c.funding;
      map[s].totalIRS += (c.irs || 0);
      map[s].companies.push(c);
      map[s].stages[c.stage] = (map[s].stages[c.stage] || 0) + 1;
    }));
    return Object.values(map).map(s => ({
      ...s, avgIRS: Math.round(s.totalIRS / s.count), heat: SHEAT[s.name] || 50,
      topCompany: s.companies.sort((a, b) => (b.irs||0) - (a.irs||0))[0],
    })).sort((a, b) => b.heat - a.heat);
  })();

  const ssbciFunds = funds.filter(f=>f.type==="SSBCI");
  const ssbciDeployed = ssbciFunds.reduce((s,f)=>s+f.deployed,0);
  const avgLev = ssbciFunds.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbciFunds.filter(f=>f.leverage).length;
  const privateLev = Math.round(ssbciDeployed * avgLev);
  const ssbciCompanies = allScored.filter(c=>c.eligible.some(e=>["bbv","fundnv","1864"].includes(e)));
  const ssbciAvgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s,c)=>s+(c.irs||0),0)/ssbciCompanies.length) : 0;

  return (
    <div style={fadeIn}>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: isMobile ? 8 : 16, marginBottom:24 }}>
        <Stat label="SSBCI Deployed" value={fmt(ssbciDeployed)} sub={`${ssbciFunds.length} active funds`} color={PURPLE} isMobile={isMobile} />
        <Stat label="Private Capital Leveraged" value={fmt(privateLev)} sub={`${avgLev.toFixed(1)}x avg ratio`} color={GREEN} isMobile={isMobile} />
        <Stat label="SSBCI Portfolio" value={ssbciCompanies.length} sub={`of ${companies.length} tracked`} color={GOLD} isMobile={isMobile} />
        <Stat label="Portfolio Avg IRS" value={ssbciAvgIRS} sub="SSBCI companies" color={ssbciAvgIRS >= 70 ? GREEN : GOLD} isMobile={isMobile} />
        {!isMobile && <Stat label="Ecosystem Capital" value={<Counter end={totalFunding} prefix="$" suffix="M" />} sub="All companies" isMobile={isMobile} />}
        {!isMobile && <Stat label="Total Jobs" value={<Counter end={totalEmployees} />} sub="Across ecosystem" color={BLUE} isMobile={isMobile} />}
      </div>

      {/* Sector Heat Strip */}
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14, marginBottom:20 }}>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Sector Heat Map</div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
          {sectorStats.slice(0,12).map(s => {
            const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            return (
              <div key={s.name} onClick={() => { setView("sectors"); }} style={{ flexShrink:0, padding:"6px 10px", borderRadius:6, background:hc+"12", border:`1px solid ${hc}30`, cursor:"pointer", textAlign:"center", minWidth:70 }}>
                <div style={{ fontSize:14, fontWeight:800, color:hc }}>{s.heat}</div>
                <div style={{ fontSize:8, color:MUTED, marginTop:1 }}>{s.name}</div>
                <div style={{ fontSize:8, color:MUTED }}>{s.count} cos</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isTablet ? "1fr" : "2fr 1fr", gap:20 }}>
        <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
          <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Top Momentum — Live Rankings</div>
          {[...companies].sort((a, b) => {
            const aSSBCI = a.eligible.some(e=>["bbv","fundnv","1864"].includes(e)) ? 1 : 0;
            const bSSBCI = b.eligible.some(e=>["bbv","fundnv","1864"].includes(e)) ? 1 : 0;
            if (bSSBCI !== aSSBCI) return bSSBCI - aSSBCI;
            return b.momentum - a.momentum;
          }).slice(0, isMobile ? 6 : 10).map((c, i) => (
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
            const pct = Math.round(s.count / companies.length * 100);
            const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            return (
              <div key={s.name} onClick={() => { setView("sectors"); }} style={{ marginBottom:10, cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                  <span>{s.name}</span><span style={{ color:hc }}>{"\uD83D\uDD25"}{s.heat} · {s.count}</span>
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
