import COMPANIES from '../data/companies.json';
import FUNDS from '../data/funds.json';
import { GOLD, GREEN, BLUE, PURPLE, ORANGE, MUTED, CARD, BORDER, DARK, STAGE_COLORS, fadeIn } from "../lib/constants";
import { fmt } from "../lib/formatters";
import { Stat, Counter, Spark, MBar } from "./shared";

export default function Dashboard({ isMobile, isTablet, allScored, totalFunding, avgMomentum, totalEmployees, watchlist, sectorStats, setSelectedCompany, setView, setSectorDetail }) {
  return (
    <div style={fadeIn}>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))", gap: isMobile ? 8 : 16, marginBottom:24 }}>
        <Stat label="Companies" value={<Counter end={COMPANIES.length} />} sub={`${allScored.filter(c=>c.grade.startsWith("A")).length} Grade A`} />
        <Stat label="Total Capital" value={<Counter end={totalFunding} prefix="$" suffix="M" />} sub="Private + SSBCI" color={GREEN} />
        <Stat label="Avg Momentum" value={<Counter end={avgMomentum} />} sub="0-100 composite" color={avgMomentum > 60 ? GREEN : GOLD} />
        <Stat label="Total Jobs" value={<Counter end={totalEmployees} />} sub="Across ecosystem" color={BLUE} />
        {!isMobile && <Stat label="SSBCI Deployed" value={fmt(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+f.deployed,0))} sub={`${(FUNDS.filter(f=>f.type==="SSBCI").reduce((s,f)=>s+(f.leverage||0),0)/FUNDS.filter(f=>f.type==="SSBCI"&&f.leverage).length).toFixed(1)}x leverage`} color={PURPLE} />}
        {!isMobile && <Stat label="Watchlist" value={watchlist.length} sub="companies tracked" />}
      </div>

      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 10 : 14, marginBottom:20 }}>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:10 }}>Sector Heat Map</div>
        <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
          {sectorStats.slice(0,12).map(s => {
            const hc = s.heat >= 85 ? "#EF4444" : s.heat >= 70 ? ORANGE : s.heat >= 55 ? GOLD : MUTED;
            return (
              <div key={s.name} onClick={() => { setView("sectors"); setSectorDetail(s); }} style={{ flexShrink:0, padding:"6px 10px", borderRadius:6, background:hc+"12", border:`1px solid ${hc}30`, cursor:"pointer", textAlign:"center", minWidth:70 }}>
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
                  <span>{s.name}</span><span style={{ color:hc }}>🔥{s.heat} · {s.count}</span>
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
