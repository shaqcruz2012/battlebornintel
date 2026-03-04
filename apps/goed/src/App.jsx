import { useState } from "react";
import { VIEWS, DARK, CARD, BORDER, GOLD, GREEN, MUTED, TEXT, css, fadeIn } from "@bbi/ui-core";
import useW from "./hooks/useW.js";
import DetailPanel from "./components/DetailPanel.jsx";
import Dashboard from "./views/Dashboard.jsx";
import SSBCI from "./views/SSBCI.jsx";
import Radar from "./views/Radar.jsx";
import Companies from "./views/Companies.jsx";
import Funds from "./views/Funds.jsx";
import Sectors from "./views/Sectors.jsx";
import Graph from "./views/Graph.jsx";
import Timeline from "./views/Timeline.jsx";
import MapView from "./views/Map.jsx";
import Brief from "./views/Brief.jsx";

const VIEW_MAP = {
  dashboard: Dashboard,
  ssbci: SSBCI,
  radar: Radar,
  companies: Companies,
  investors: Funds,
  sectors: Sectors,
  graph: Graph,
  timeline: Timeline,
  map: MapView,
  brief: Brief,
};

export default function App() {
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;
  const [view, setView] = useState("dashboard");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const px = isMobile ? 12 : 24;

  const ActiveView = VIEW_MAP[view] || Dashboard;

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily:"'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`10px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:DARK+"F0", backdropFilter:"blur(12px)", zIndex:200 }}>
        <div style={{ display:"flex", alignItems:"center", gap:isMobile ? 8 : 12 }}>
          <span style={{ color:GOLD, fontSize:isMobile ? 16 : 18 }}>{"\u25C6"}</span>
          <span style={{ fontWeight:700, fontSize:isMobile ? 11 : 14, letterSpacing:isMobile ? 1 : 2, textTransform:"uppercase" }}>{isMobile ? "BBI" : "Battle Born Intelligence"}</span>
          <span style={{ fontSize:9, color:MUTED, background:"#1A1814", padding:"2px 6px", borderRadius:4 }}>v6.0</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, color:MUTED }}>LIVE</span>
          </div>
          {isMobile && <button onClick={() => setMobileNav(!mobileNav)} style={{ background:"none", border:"none", color:GOLD, fontSize:20, cursor:"pointer", padding:4 }}>{mobileNav ? "\u2715" : "\u2630"}</button>}
        </div>
      </div>

      {/* NAV */}
      {(!isMobile || mobileNav) && (
        <div style={{ borderBottom:`1px solid ${BORDER}`, padding:`0 ${px}px`, display:"flex", gap:0, overflowX:"auto", ...(isMobile && mobileNav ? { flexWrap:"wrap", background:CARD, ...fadeIn } : {}) }}>
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => { setView(v.id); setMobileNav(false); }} style={{ padding: isMobile ? "10px 12px" : "10px 16px", background:"none", border:"none", borderBottom: view === v.id ? `2px solid ${GOLD}` : "2px solid transparent", color: view === v.id ? GOLD : MUTED, fontSize: isMobile ? 11 : 12, fontWeight:600, cursor:"pointer", letterSpacing:0.5, display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"all 0.2s", minWidth: isMobile && mobileNav ? "33%" : "auto" }}>
              <span style={{ fontSize:13 }}>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding:px, maxWidth:1400, margin:"0 auto" }}>
        <ActiveView
          isMobile={isMobile}
          isTablet={isTablet}
          setSelectedCompany={setSelectedCompany}
          setView={setView}
        />
      </div>

      {/* DETAIL PANEL */}
      <DetailPanel
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        isMobile={isMobile}
      />
    </div>
  );
}
