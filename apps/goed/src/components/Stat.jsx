import { CARD, BORDER, MUTED, GOLD } from "@bbi/ui-core";

const Stat = ({ label, value, sub, color = GOLD, isMobile = false }) => (
  <div style={{ padding: isMobile ? "12px 14px" : "16px 20px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:10 }}>
    <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
    <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>{sub}</div>}
  </div>
);

export default Stat;
