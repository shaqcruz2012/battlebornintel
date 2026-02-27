import { MUTED } from '../../styles/tokens.js';
import { GRADE_COLORS } from '../../engine/irs.js';

export const Grade = ({ grade, size = "md" }) => {
  const gc = GRADE_COLORS[grade] || MUTED;
  const sz = size === "lg" ? { w:44, h:44, fs:14, r:10 } : size === "sm" ? { w:26, h:26, fs:9, r:6 } : { w:34, h:34, fs:11, r:8 };
  return <div style={{ width:sz.w, height:sz.h, borderRadius:sz.r, display:"flex", alignItems:"center", justifyContent:"center", fontSize:sz.fs, fontWeight:900, color:gc, background:gc+"18", border:`1.5px solid ${gc}35`, flexShrink:0 }}>{grade}</div>;
};
