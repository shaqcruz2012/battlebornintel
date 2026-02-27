import { GOLD, DARK, TEXT, MUTED, BORDER } from '../../styles/tokens.js';

export default function Header({ config, isMobile, mobileNav, setMobileNav }) {
  return (
    <div style={{ padding: isMobile ? "14px 16px" : "16px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:DARK, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12 }}>
        <span style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:TEXT, letterSpacing:"-0.02em" }}>
          <span style={{ color:GOLD }}>&#9670;</span> {config.name}
        </span>
        {!isMobile && <span style={{ fontSize:11, color:MUTED, fontWeight:400 }}>{config.subtitle}</span>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {!isMobile && <span style={{ fontSize:10, color:MUTED }}>v{config.version}</span>}
        {isMobile && (
          <button onClick={() => setMobileNav(!mobileNav)} style={{ background:"none", border:"none", color:GOLD, fontSize:22, cursor:"pointer", padding:4 }}>
            {mobileNav ? "\u2715" : "\u2630"}
          </button>
        )}
      </div>
    </div>
  );
}
