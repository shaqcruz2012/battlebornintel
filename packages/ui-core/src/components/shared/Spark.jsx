import { GOLD } from '../../styles/tokens.js';

export const Spark = ({ data, color = GOLD, w = 60, h = 20 }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display:"block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} /></svg>;
};
