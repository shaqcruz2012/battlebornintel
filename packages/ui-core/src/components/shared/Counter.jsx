import { useState, useEffect } from 'react';

export const Counter = ({ end, prefix="", suffix="", dur=1200 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const s = performance.now();
    const t = now => { const p = Math.min((now - s) / dur, 1); setV(Math.round(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(t); };
    requestAnimationFrame(t);
  }, [end]);
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>;
};
