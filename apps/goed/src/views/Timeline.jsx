import { useApi } from "../hooks/useApi.js";
import { BORDER, MUTED, GOLD, GREEN, BLUE, ORANGE, PURPLE, TEXT, fadeIn } from "@bbi/ui-core";

export default function Timeline({ isMobile, isTablet, setSelectedCompany, setView }) {
  const { data: events } = useApi("/timeline");

  if (!events) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading timeline...</div>;

  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Ecosystem Activity Feed</div>
      <div style={{ borderLeft:`2px solid ${BORDER}`, marginLeft: isMobile ? 10 : 20, paddingLeft: isMobile ? 16 : 24 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ position:"relative", marginBottom:18, paddingBottom:4, ...fadeIn }}>
            <div style={{ position:"absolute", left: isMobile ? -25 : -33, top:4, width:16, height:16, borderRadius:"50%", background:"#111110", border:`2px solid ${ev.type==="funding"?GREEN:ev.type==="grant"?BLUE:ev.type==="momentum"?GOLD:ev.type==="hiring"?ORANGE:ev.type==="patent"?PURPLE:MUTED}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>{ev.icon}</div>
            <div style={{ fontSize:10, color:MUTED, marginBottom:1 }}>{ev.date}</div>
            <div style={{ fontSize:13, fontWeight:600 }}>{ev.company}</div>
            <div style={{ fontSize:12, color:TEXT }}>{ev.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
