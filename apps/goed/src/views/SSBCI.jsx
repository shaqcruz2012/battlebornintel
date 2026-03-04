import { useApi } from "../hooks/useApi.js";
import { CARD, BORDER, MUTED, GOLD, GREEN, BLUE, PURPLE, fadeIn, fmt } from "@bbi/ui-core";
import Stat from "../components/Stat.jsx";

export default function SSBCI({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
  const { data: funds } = useApi("/funds");
  const { data: companies } = useApi("/companies" + fundParam);

  if (!funds || !companies) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading SSBCI...</div>;

  const ssbci = funds.filter(f=>f.type==="SSBCI");
  const totalAlloc = ssbci.reduce((s,f)=>s+(f.allocated||0),0);
  const totalDeployed = ssbci.reduce((s,f)=>s+f.deployed,0);
  const avgLev = ssbci.filter(f=>f.leverage).reduce((s,f)=>s+f.leverage,0)/ssbci.filter(f=>f.leverage).length;
  const privateLev = Math.round(totalDeployed * avgLev);

  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>SSBCI Program Dashboard</div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 8 : 16, marginBottom:20 }}>
        <Stat label="Total Allocated" value={fmt(totalAlloc)} color={BLUE} isMobile={isMobile} />
        <Stat label="Deployed" value={fmt(totalDeployed)} sub={`${Math.round(totalDeployed/totalAlloc*100)}% utilization`} color={GREEN} isMobile={isMobile} />
        <Stat label="Private Leverage" value={fmt(privateLev)} sub="Co-investment" color={GOLD} isMobile={isMobile} />
        <Stat label="Leverage Ratio" value={`${avgLev.toFixed(1)}x`} sub="Target: 1:1" color={PURPLE} isMobile={isMobile} />
      </div>
      {ssbci.map(f => (
        <div key={f.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:14, fontWeight:700 }}>{f.name}</div>
            <span style={{ fontSize:11, color:GREEN, fontWeight:600 }}>{f.leverage ? `${f.leverage}x` : ""}</span>
          </div>
          <div style={{ height:10, background:"#1E1D1A", borderRadius:5, overflow:"hidden", marginBottom:8 }}>
            <div style={{ width:`${(f.deployed/f.allocated)*100}%`, height:"100%", background:`linear-gradient(90deg, ${GREEN}, ${GOLD})`, borderRadius:5, transition:"width 1s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:MUTED }}>
            <span>{fmt(f.deployed)} deployed</span>
            <span>{fmt(f.allocated)} allocated</span>
          </div>
          <div style={{ marginTop:10, fontSize:11, color:MUTED }}>
            {companies.filter(c=>c.eligible.includes(f.id)).length} eligible companies · {f.companies} portfolio
          </div>
        </div>
      ))}
    </div>
  );
}
