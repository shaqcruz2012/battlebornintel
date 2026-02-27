import { computeIRS, TRIGGER_CFG as IRS_TRIGGER_CFG, GRADE_COLORS, STAGE_NORMS as DEFAULT_STAGE_NORMS } from './irs.js';

/**
 * Regulatory Progress Score (RPS) — energy project scoring engine.
 * Same 7-dimension structure as IRS but with energy-domain semantics:
 *   momentum → regulatory progress, fv → cost efficiency,
 *   sh → sector heat, hs → jobs impact, ns → connections,
 *   ts → permitting depth, dq → data quality
 */
function computeRPS(c, sectorHeat, config) {
  const norms = config?.stages?.fundingNorms || DEFAULT_STAGE_NORMS;
  const m = Math.min(c.momentum || 0, 100);
  const fv = Math.min((c.funding / (norms[c.stage] || 100)) * 50, 100);
  const sScores = (c.sector || []).map(s => (sectorHeat || {})[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs = c.employees >= 500 ? 80 : c.employees >= 200 ? 65 : c.employees >= 50 ? 50 : c.employees >= 10 ? 30 : 10;
  const hasPPA = (c.eligible || []).some(e => e.includes("ppa") || e.includes("nv_energy"));
  const hasBLM = (c.eligible || []).some(e => e.includes("blm"));
  const hasFederal = (c.eligible || []).some(e => e.includes("doe") || e.includes("itc") || e.includes("ptc"));
  const ns = Math.min((c.eligible?.length || 0) * 12 + (hasPPA ? 15 : 0) + (hasFederal ? 10 : 0), 100);
  const ts = Math.min(30 + (hasBLM ? 20 : 0) + (hasPPA ? 20 : 0) + ((c.eligible?.length || 0) * 8), 100);
  const dq = Math.min(60 + (c.description ? 20 : 0) + ((c.eligible?.length || 0) > 0 ? 20 : 0), 100);
  const irs = Math.round(m * 0.25 + fv * 0.10 + sh * 0.10 + hs * 0.10 + dq * 0.08 + ns * 0.12 + ts * 0.15 + 50 * 0.10);
  const grade = irs >= 85 ? "A" : irs >= 78 ? "A-" : irs >= 72 ? "B+" : irs >= 65 ? "B" : irs >= 58 ? "B-" : irs >= 50 ? "C+" : irs >= 42 ? "C" : "D";
  const triggers = [];
  if (sh >= 85) triggers.push("hot_sector");
  if (m >= 80) triggers.push("high_momentum");
  if (hasPPA) triggers.push("ppa_secured");
  if (hasBLM) triggers.push("blm_approved");
  if (hasFederal) triggers.push("federal_incentive");
  if (fv >= 75) triggers.push("large_project");
  if (hs >= 50) triggers.push("jobs_impact");
  return { ...c, irs, grade, triggers, dims: { momentum: m, funding_velocity: Math.round(fv), market_timing: sh, hiring: hs, data_quality: dq, network: ns, team: ts } };
}

const RPS_TRIGGER_CFG = {
  hot_sector:       { i:"\uD83C\uDF21\uFE0F", l:"Hot Sector",        c:"#F97316" },
  high_momentum:    { i:"\u26A1",              l:"High Progress",     c:"#22C55E" },
  ppa_secured:      { i:"\uD83D\uDD0C",        l:"PPA Secured",       c:"#3B82F6" },
  blm_approved:     { i:"\uD83C\uDFDC\uFE0F",  l:"BLM Approved",      c:"#8B5CF6" },
  federal_incentive:{ i:"\uD83C\uDFDB\uFE0F",  l:"Federal Incentive", c:"#EF4444" },
  large_project:    { i:"\uD83D\uDD25",         l:"Large Project",     c:"#F59E0B" },
  jobs_impact:      { i:"\uD83D\uDCC8",         l:"Jobs Impact",       c:"#06B6D4" },
};

/** Config-aware score dispatcher. */
export function computeScore(c, sectorHeat, config) {
  const engine = config?.scoring?.engine;
  if (engine === "rps") return computeRPS(c, sectorHeat, config);
  return computeIRS(c, sectorHeat);
}

export function getTriggerConfig(config) {
  const engine = config?.scoring?.engine;
  if (engine === "rps") return config?.scoring?.triggerConfig || RPS_TRIGGER_CFG;
  return IRS_TRIGGER_CFG;
}

export { GRADE_COLORS };
