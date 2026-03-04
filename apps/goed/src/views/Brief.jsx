import { useApi } from "../hooks/useApi.js";
import { CARD, BORDER, MUTED, GOLD, GREEN, PURPLE, TEXT, fadeIn, fmt } from "@bbi/ui-core";
import { REAP_PILLARS, getReapPillar, getCompanyReapConnections } from "@bbi/ui-core/reap";
import Stat from "../components/Stat.jsx";

export default function Brief({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
  const { data: companies } = useApi("/companies" + fundParam);
  const { data: funds } = useApi("/funds");
  const { data: timeline } = useApi("/timeline" + fundParam);
  const { data: graphData } = useApi("/graph" + fundParam);

  if (!companies || !funds || !timeline || !graphData) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading brief...</div>;

  const allScored = companies;
  const entities = (graphData.nodes || []).filter(n => n.type !== "company" && n.type !== "fund");
  const edges = graphData.edges || [];
  const fundsList = funds;

  const ssbciFunds = fundsList.filter(f=>f.type==="SSBCI");
  const ssbciDeployed = ssbciFunds.reduce((s,f)=>s+f.deployed,0);
  const avgLev = ssbciFunds.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbciFunds.filter(f=>f.leverage).length;
  const privateLev = Math.round(ssbciDeployed * avgLev);
  const ssbciCompanies = allScored.filter(c=>c.eligible.some(e=>["bbv","fundnv","1864"].includes(e)));
  const ssbciAvgIRS = ssbciCompanies.length ? Math.round(ssbciCompanies.reduce((s,c)=>s+(c.irs||0),0)/ssbciCompanies.length) : 0;

  return (
    <div style={{ ...fadeIn, maxWidth:900, margin:"0 auto" }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
      <div style={{ textAlign:"center", marginBottom:24, paddingBottom:16, borderBottom:`2px solid ${GOLD}40` }}>
        <div style={{ fontSize:10, color:GOLD, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Battle Born Intelligence</div>
        <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>GOED Weekly Intelligence Brief</div>
        <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>Week Ending {new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</div>
        <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>Innovation-Based Economic Development</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:24 }}>
        <Stat label="SSBCI Deployed" value={fmt(ssbciDeployed)} sub={`${ssbciFunds.length} funds`} color={PURPLE} isMobile={isMobile} />
        <Stat label="Private Leverage" value={fmt(privateLev)} sub={`${avgLev.toFixed(1)}x ratio`} color={GREEN} isMobile={isMobile} />
        <Stat label="Portfolio Cos" value={ssbciCompanies.length} sub={`of ${companies.length}`} color={GOLD} isMobile={isMobile} />
        <Stat label="Avg IRS" value={ssbciAvgIRS} sub="SSBCI portfolio" color={ssbciAvgIRS >= 70 ? GREEN : GOLD} isMobile={isMobile} />
      </div>
      {REAP_PILLARS.filter(p => p.id !== "all").map(pillar => {
        const pillarEntities = entities.filter(e => getReapPillar(e) === pillar.id);
        const pillarFunds = fundsList.filter(f => getReapPillar(f) === pillar.id);
        const pillarCompanies = pillar.id === "entrepreneurs" ? allScored : allScored.filter(c => getCompanyReapConnections(c.id, edges, entities, fundsList).has(pillar.id));
        const pillarEvents = timeline.filter(ev => {
          if (pillar.id === "entrepreneurs") return ["funding","momentum","launch","hiring"].includes(ev.type);
          if (pillar.id === "risk_capital") return ["funding"].includes(ev.type);
          if (pillar.id === "government") return ["grant"].includes(ev.type);
          if (pillar.id === "corporations") return ["partnership"].includes(ev.type);
          return false;
        }).slice(0, 3);
        let metrics = [];
        if (pillar.id === "risk_capital") {
          const totalDeployed = pillarFunds.reduce((s,f)=>s+f.deployed,0);
          const ssbciFundsP = pillarFunds.filter(f=>f.type==="SSBCI");
          metrics = [`${pillarFunds.length} funds tracked`, `${fmt(totalDeployed)} deployed`, `${ssbciFundsP.length} SSBCI programs`];
        } else if (pillar.id === "entrepreneurs") {
          const gradeA = pillarCompanies.filter(c=>(c.grade||"").startsWith("A")).length;
          const topMover = [...pillarCompanies].sort((a,b)=>b.momentum-a.momentum)[0];
          metrics = [`${pillarCompanies.length} companies tracked`, `${gradeA} Grade A companies`, topMover ? `Top: ${topMover.name} (momentum ${topMover.momentum})` : ""].filter(Boolean);
        } else if (pillar.id === "government") {
          metrics = [`${pillarEntities.length} government entities`, `SSBCI administered by GOED`, `DOE, SBIR/STTR, AFWERX active`];
        } else if (pillar.id === "corporations") {
          metrics = [`${pillarEntities.length} corporate partners`, `${pillarCompanies.length} companies with corporate ties`];
        } else if (pillar.id === "universities") {
          metrics = [`${pillarEntities.length} university hubs`, `UNR Innevation Center + UNLV Tech Park`];
        }
        return (
          <div key={pillar.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, marginBottom:12, borderLeft:`3px solid ${pillar.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:700, color:pillar.color }}>{pillar.icon} {pillar.label}</div>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:pillar.color+"15", color:pillar.color }}>{pillarCompanies.length} companies</span>
            </div>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:10 }}>
              {metrics.map((m,i) => <span key={i} style={{ fontSize:11, color:TEXT }}>{m}</span>)}
            </div>
            {pillarEvents.length > 0 && (
              <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:8, marginTop:6 }}>
                <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Recent Activity</div>
                {pillarEvents.map((ev, i) => (
                  <div key={i} style={{ fontSize:11, color:TEXT, marginBottom:4 }}>
                    <span style={{ color:MUTED }}>{ev.date.slice(5)}</span> {ev.icon} <span style={{ fontWeight:600 }}>{ev.company}</span> — {ev.detail}
                  </div>
                ))}
              </div>
            )}
            {pillar.id !== "entrepreneurs" && pillarCompanies.length > 0 && (
              <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:8, marginTop:6 }}>
                <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Key Companies</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {pillarCompanies.sort((a,b)=>(b.irs||0)-(a.irs||0)).slice(0,6).map(c => (
                    <span key={c.id} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:pillar.color+"12", border:`1px solid ${pillar.color}25`, color:TEXT }}>{c.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ textAlign:"center", paddingTop:16, borderTop:`1px solid ${BORDER}`, marginTop:8 }}>
        <div style={{ fontSize:10, color:MUTED }}>Generated by Battle Born Intelligence · {new Date().toLocaleString()}</div>
        <button className="no-print" onClick={() => window.print()} style={{ marginTop:10, padding:"8px 20px", background:GOLD+"20", color:GOLD, border:`1px solid ${GOLD}40`, borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer" }}>{"\uD83D\uDDA8"} Print Brief</button>
      </div>
    </div>
  );
}
