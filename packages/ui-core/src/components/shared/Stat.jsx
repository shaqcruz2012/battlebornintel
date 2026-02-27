import { useState } from 'react';
import { GOLD, CARD, BORDER, MUTED, TEXT } from '../../styles/tokens.js';

export const Stat = ({ label, value, sub, color = GOLD, isMobile = false, tooltip }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ padding: isMobile ? "12px 14px" : "16px 20px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, position:"relative" }}
      onMouseEnter={tooltip ? () => setHover(true) : undefined}
      onMouseLeave={tooltip ? () => setHover(false) : undefined}
    >
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:4, cursor: tooltip ? "help" : undefined }}>
        {label}{tooltip && <span style={{ marginLeft:4, opacity:0.4 }}>&#9432;</span>}
      </div>
      <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>{sub}</div>}
      {tooltip && hover && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:4, padding:"8px 10px", background:"#1E1D1A", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:11, color:TEXT, lineHeight:1.4, zIndex:50, boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          {tooltip}
        </div>
      )}
    </div>
  );
};
