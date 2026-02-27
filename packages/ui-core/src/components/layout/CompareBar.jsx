import { GOLD, DARK, CARD, TEXT, MUTED } from '../../styles/tokens.js';

export default function CompareBar({ compareList, setCompareList, setView, view, isMobile, companies }) {
  if (compareList.length === 0 || view === "compare") return null;

  return (
    <div style={{ position:"fixed", bottom: isMobile ? 12 : 20, left:"50%", transform:"translateX(-50%)", background:CARD, border:`1px solid ${GOLD}40`, borderRadius:12, padding: isMobile ? "8px 12px" : "10px 20px", display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, zIndex:200, boxShadow:`0 8px 32px ${DARK}`, animation:"slideUp 0.3s ease-out", maxWidth:"90vw" }}>
      <span style={{ fontSize:11, color:GOLD, flexShrink:0 }}>{"\u27FA"} {compareList.length}</span>
      {!isMobile && <div style={{ display:"flex", gap:4 }}>
        {compareList.map(id => { const c = companies.find(x => x.id === id); return <span key={id} style={{ fontSize:10, padding:"2px 6px", borderRadius:4, background:GOLD+"15", color:TEXT }}>{c?.name}</span>; })}
      </div>}
      <button onClick={() => setView("compare")} style={{ padding:"6px 14px", background:GOLD, color:DARK, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer" }}>Compare</button>
      <button onClick={() => setCompareList([])} style={{ background:"none", border:"none", color:MUTED, cursor:"pointer", fontSize:14, padding:4 }}>{"\u2715"}</button>
    </div>
  );
}
