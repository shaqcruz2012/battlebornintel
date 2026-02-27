import { GREEN, GOLD, ORANGE, RED, MUTED } from '../../styles/tokens.js';

export const MBar = ({ score, w = 80 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:w, height:6, background:"#1E1D1A", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${score}%`, height:"100%", borderRadius:3, background: score > 75 ? GREEN : score > 50 ? GOLD : score > 30 ? ORANGE : RED, transition:"width 0.6s ease" }} />
    </div>
    <span style={{ fontSize:11, color: score > 75 ? GREEN : score > 50 ? GOLD : MUTED, fontWeight:600, minWidth:20 }}>{score}</span>
  </div>
);
