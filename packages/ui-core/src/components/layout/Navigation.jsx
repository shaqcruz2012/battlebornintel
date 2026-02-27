import { GOLD, DARK, TEXT, MUTED, BORDER } from '../../styles/tokens.js';
import { NewBadge } from '../shared/Onboarding.jsx';

const NEW_VIEW_IDS = new Set(['intel', 'horizon', 'feed']);

export default function Navigation({ views, view, setView, isMobile, mobileNav, setMobileNav }) {
  if (isMobile && !mobileNav) return null;

  return (
    <div style={{
      display:"flex",
      flexWrap:"wrap",
      gap: isMobile ? 0 : 2,
      padding: isMobile ? "8px 12px" : "0 24px",
      borderBottom: `1px solid ${BORDER}`,
      background: DARK,
      flexDirection: isMobile ? "column" : "row",
      ...(isMobile && mobileNav ? { position:"fixed", top:52, left:0, right:0, zIndex:99, padding:"12px 16px", boxShadow:`0 8px 32px ${DARK}` } : {})
    }}>
      {views.map(v => (
        <button key={v.id} onClick={() => { setView(v.id); if (isMobile) setMobileNav(false); }}
          style={{
            background: view === v.id ? `${GOLD}15` : "transparent",
            border: "none",
            borderBottom: !isMobile && view === v.id ? `2px solid ${GOLD}` : "2px solid transparent",
            color: view === v.id ? GOLD : MUTED,
            padding: isMobile ? "10px 12px" : "10px 14px",
            fontSize: 12,
            fontWeight: view === v.id ? 700 : 400,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            textAlign: "left",
            fontFamily: "inherit",
            width: isMobile ? "100%" : "auto",
            transition: "color 0.2s",
          }}>
          <span style={{ fontSize: isMobile ? 14 : 12 }}>{v.icon}</span> {v.label}
          {NEW_VIEW_IDS.has(v.id) && <NewBadge id={`nav_${v.id}`} />}
        </button>
      ))}
    </div>
  );
}
