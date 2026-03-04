import { MUTED, GOLD, CARD, BORDER, fadeIn } from "@bbi/ui-core";

export default function Graph({ isMobile, isTablet, setSelectedCompany, setView }) {
  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Ontological Relationship Graph</div>
      <div style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>{"\uD83D\uDD78"}</div>
        <div style={{ fontSize:16, fontWeight:700, color:GOLD, marginBottom:8 }}>Graph view — Cytoscape migration pending</div>
        <div style={{ fontSize:12, color:MUTED }}>The ontology graph visualization will be migrated to Cytoscape.js in a subsequent task.</div>
      </div>
    </div>
  );
}
