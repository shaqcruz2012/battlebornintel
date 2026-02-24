import { SHEAT, STAGE_NORMS } from './constants';

export default function computeIRS(c) {
  const m = Math.min(c.momentum || 0, 100);
  const fv = Math.min((c.funding / (STAGE_NORMS[c.stage] || 3)) * 50, 100);
  const sScores = (c.sector || []).map(s => SHEAT[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs = c.employees >= 100 ? 80 : c.employees >= 30 ? 60 : c.employees >= 15 ? 45 : c.employees >= 5 ? 25 : 10;
  const hasSsbci = c.eligible.some(e => ["bbv","fundnv","1864"].includes(e));
  const hasSbir = c.eligible.includes("sbir");
  const ns = Math.min((c.eligible.length || 0) * 15 + (c.employees > 0 ? 15 : 0), 100);
  const ts = Math.min(30 + (c.employees > 10 ? 25 : 0) + (c.eligible.length * 10), 100);
  const dq = Math.min(60 + (c.description ? 20 : 0) + (c.eligible.length > 0 ? 20 : 0), 100);
  const irs = Math.round(m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 + dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12);
  const grade = irs >= 85 ? "A" : irs >= 78 ? "A-" : irs >= 72 ? "B+" : irs >= 65 ? "B" : irs >= 58 ? "B-" : irs >= 50 ? "C+" : irs >= 42 ? "C" : "D";
  const triggers = [];
  if (fv >= 75) triggers.push("rapid_funding");
  if (sh >= 85) triggers.push("hot_sector");
  if (hasSsbci) triggers.push("ssbci_eligible");
  if (hs >= 50) triggers.push("hiring_surge");
  if (m >= 80) triggers.push("high_momentum");
  if (hasSbir) triggers.push("grant_validated");
  return { ...c, irs, grade, triggers, dims: { momentum: m, funding_velocity: Math.round(fv), market_timing: sh, hiring: hs, data_quality: dq, network: ns, team: ts } };
}
