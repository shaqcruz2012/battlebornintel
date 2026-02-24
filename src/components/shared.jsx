import { useState, useEffect } from "react";
import { GOLD, MUTED, GREEN, ORANGE, RED, CARD, BORDER, GRADE_COLORS } from "../lib/constants";

export const useW = () => {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
};

export const Spark = ({ data, color = GOLD, w = 60, h = 20 }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display:"block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
};

export const MBar = ({ score, w = 80 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <div style={{ width:w, height:6, background:"#1E1D1A", borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${score}%`, height:"100%", borderRadius:3, background: score > 75 ? GREEN : score > 50 ? GOLD : score > 30 ? ORANGE : RED, transition:"width 0.6s ease" }} />
    </div>
    <span style={{ fontSize:11, color: score > 75 ? GREEN : score > 50 ? GOLD : MUTED, fontWeight:600, minWidth:20 }}>{score}</span>
  </div>
);

export const Counter = ({ end, prefix="", suffix="", dur=1200 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const s = performance.now();
    const t = now => { const p = Math.min((now - s) / dur, 1); setV(Math.round(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(t); };
    requestAnimationFrame(t);
  }, [end]);
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
};

export const Stat = ({ label, value, sub, color = GOLD }) => {
  const w = useW();
  const isMobile = w < 768;
  return (
    <div style={{ padding: isMobile ? "12px 14px" : "16px 20px", background:CARD, border:`1px solid ${BORDER}`, borderRadius:10 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 22 : 28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:MUTED, marginTop:4 }}>{sub}</div>}
    </div>
  );
};

export const Grade = ({ grade, size = "md" }) => {
  const gc = GRADE_COLORS[grade] || MUTED;
  const sz = size === "lg" ? { w:44, h:44, fs:14, r:10 } : size === "sm" ? { w:26, h:26, fs:9, r:6 } : { w:34, h:34, fs:11, r:8 };
  return <div style={{ width:sz.w, height:sz.h, borderRadius:sz.r, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz.fs, fontWeight:900, color:gc, background:gc+"18", border:`1.5px solid ${gc}35`, flexShrink:0 }}>{grade}</div>;
};
