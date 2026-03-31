/**
 * IRS (Investment Rating Score) — pure computation.
 * Accepts constants as parameters instead of importing static data.
 *
 * computeIRS()          — backward-looking heuristic (7 weighted dimensions)
 * computeForwardScore() — forward-looking blend of forecasts + causal data
 */

import {
  getCompanyForecasts,
  getCompanyCausalData,
  getCompanySurvival,
} from '../db/queries/forecasts-for-scoring.js';

/* ------------------------------------------------------------------ */
/*  Heuristic IRS (original — preserved for backward compatibility)   */
/* ------------------------------------------------------------------ */

export function computeIRS(company, sectorHeat, stageNorms, forwardData) {
  const m = Math.min(company.momentum || 0, 100);
  const fv = Math.min(
    ((company.funding || 0) / (stageNorms[company.stage] || 3)) * 50,
    100
  );
  const sScores = (company.sector || []).map((s) => sectorHeat[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs =
    company.employees >= 100 ? 80
    : company.employees >= 30 ? 60
    : company.employees >= 15 ? 45
    : company.employees >= 5 ? 25
    : 10;
  const ns = Math.min(
    (company.eligible?.length || 0) * 15 + (company.employees > 0 ? 15 : 0),
    100
  );
  const ts = Math.min(
    30 + (company.employees > 10 ? 25 : 0) + (company.eligible?.length || 0) * 10,
    100
  );
  const dq = Math.min(
    60 + (company.description ? 20 : 0) + ((company.eligible?.length || 0) > 0 ? 20 : 0),
    100
  );

  const heuristicIrs = Math.round(
    m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 +
    dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12
  );

  const grade = irsToGrade(heuristicIrs);

  const triggers = [];
  if (fv >= 75) triggers.push('rapid_funding');
  if (sh >= 85) triggers.push('hot_sector');
  if ((company.eligible || []).some((e) => ['bbv', 'fundnv', '1864'].includes(e)))
    triggers.push('ssbci_eligible');
  if (hs >= 50) triggers.push('hiring_surge');
  if (m >= 80) triggers.push('high_momentum');
  if ((company.eligible || []).includes('sbir')) triggers.push('grant_validated');

  // Blend with forward score when available
  const hasForward = forwardData && typeof forwardData.forward_score === 'number';
  const blendedIrs = hasForward
    ? Math.round(0.6 * heuristicIrs + 0.4 * forwardData.forward_score)
    : heuristicIrs;
  const blendedGrade = hasForward ? irsToGrade(blendedIrs) : grade;

  if (hasForward && forwardData.forward_score >= 70) {
    triggers.push('strong_forecast');
  }

  return {
    irs: blendedIrs,
    grade: blendedGrade,
    triggers,
    dims: {
      momentum: m,
      funding_velocity: Math.round(fv),
      market_timing: sh,
      hiring: hs,
      data_quality: dq,
      network: ns,
      team: ts,
    },
    // Forward-score fields (additive — new consumers can use, old ignore)
    heuristic_irs: heuristicIrs,
    forward_score: hasForward ? forwardData.forward_score : null,
    forward_components: hasForward ? forwardData.components : null,
    score_type: hasForward ? 'blended' : 'heuristic',
  };
}

/* ------------------------------------------------------------------ */
/*  Forward-looking score from model predictions                      */
/* ------------------------------------------------------------------ */

/**
 * Compute a forward score (0-100) for a company by querying forecasts,
 * causal evaluation, and survival data.
 *
 * Returns null when no forecast data exists (caller should fall back
 * to pure heuristic).
 *
 * @param {number} companyId
 * @returns {Promise<{forward_score: number, components: object} | null>}
 */
export async function computeForwardScore(companyId) {
  const [forecasts, causalRow, survivalRow] = await Promise.all([
    getCompanyForecasts(companyId),
    getCompanyCausalData(companyId),
    getCompanySurvival(companyId),
  ]);

  // If there are no forecasts at all, we can't compute a forward score
  if (forecasts.length === 0 && !causalRow && !survivalRow) {
    return null;
  }

  /* --- 1. Trend component (40%) ---
   * Average predicted growth rate across forecast metrics.
   * Growth rate per metric = (last forecast value - first forecast value) / first * 100
   * Clamped to 0-100.
   */
  const trend = computeTrendComponent(forecasts);

  /* --- 2. Confidence component (20%) ---
   * Narrow confidence intervals → high score.
   * Score = 100 - avg_relative_width, clamped 0-100.
   */
  const confidence = computeConfidenceComponent(forecasts);

  /* --- 3. Causal boost (15%) ---
   * If company has been through an accelerator and DiD ATT is positive,
   * score proportional to ATT magnitude.
   */
  const causal = computeCausalComponent(causalRow);

  /* --- 4. Network / spillover component (15%) ---
   * Spillover coefficient significance from causal evaluation.
   */
  const network = computeNetworkComponent(causalRow);

  /* --- 5. Survival component (10%) ---
   * Survival probability mapped directly to 0-100.
   */
  const survival = computeSurvivalComponent(survivalRow);

  const forward_score = Math.round(
    trend * 0.40 +
    confidence * 0.20 +
    causal * 0.15 +
    network * 0.15 +
    survival * 0.10
  );

  return {
    forward_score: clamp(forward_score, 0, 100),
    components: {
      trend: Math.round(trend),
      confidence: Math.round(confidence),
      causal: Math.round(causal),
      network: Math.round(network),
      survival: Math.round(survival),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Component helpers                                                  */
/* ------------------------------------------------------------------ */

function computeTrendComponent(forecasts) {
  if (forecasts.length === 0) return 50; // neutral default

  // Group by metric_name
  const byMetric = {};
  for (const row of forecasts) {
    if (!byMetric[row.metric_name]) byMetric[row.metric_name] = [];
    byMetric[row.metric_name].push(row);
  }

  const growthRates = [];
  for (const metric of Object.keys(byMetric)) {
    const sorted = byMetric[metric].sort(
      (a, b) => new Date(a.period) - new Date(b.period)
    );
    if (sorted.length < 2) continue;
    const first = parseFloat(sorted[0].value);
    const last = parseFloat(sorted[sorted.length - 1].value);
    if (first > 0) {
      const growthPct = ((last - first) / first) * 100;
      growthRates.push(growthPct);
    }
  }

  if (growthRates.length === 0) return 50;

  const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

  // Map growth: 0% → 40, 50% → 70, 100%+ → 95
  // Negative growth: -50% → 10, -100% → 0
  const score = 40 + avgGrowth * 0.55;
  return clamp(score, 0, 100);
}

function computeConfidenceComponent(forecasts) {
  if (forecasts.length === 0) return 50; // neutral default

  const relativeWidths = [];
  for (const row of forecasts) {
    const lo = parseFloat(row.confidence_lo);
    const hi = parseFloat(row.confidence_hi);
    const val = parseFloat(row.value);
    if (!isNaN(lo) && !isNaN(hi) && val > 0) {
      const width = (hi - lo) / val * 100; // relative width as %
      relativeWidths.push(width);
    }
  }

  if (relativeWidths.length === 0) return 50;

  const avgWidth = relativeWidths.reduce((a, b) => a + b, 0) / relativeWidths.length;
  // Narrow CI (e.g. 10%) → 90 score, wide CI (e.g. 100%) → ~30
  const score = 100 - avgWidth * 0.7;
  return clamp(score, 0, 100);
}

function computeCausalComponent(causalRow) {
  if (!causalRow || !causalRow.content) return 50; // neutral default

  const content = typeof causalRow.content === 'string'
    ? JSON.parse(causalRow.content)
    : causalRow.content;

  const att = content.att ?? content.did_att ?? content.average_treatment_effect ?? null;
  const isAccelerated = content.is_accelerated ?? content.accelerated ?? false;

  if (att === null) return 50;

  if (isAccelerated && att > 0) {
    // Positive ATT for accelerated company: boost proportional to ATT
    // ATT of 0.1 (10%) → 70, ATT of 0.5 → 90
    const score = 60 + att * 60;
    return clamp(score, 50, 100);
  }

  if (att > 0) {
    // Positive ATT but not confirmed accelerated: moderate boost
    const score = 55 + att * 30;
    return clamp(score, 50, 80);
  }

  // Negative ATT: below neutral
  const score = 50 + att * 40;
  return clamp(score, 0, 50);
}

function computeNetworkComponent(causalRow) {
  if (!causalRow || !causalRow.content) return 50; // neutral default

  const content = typeof causalRow.content === 'string'
    ? JSON.parse(causalRow.content)
    : causalRow.content;

  const spillover = content.spillover_coefficient ?? content.spillover ?? null;
  const pValue = content.spillover_p_value ?? content.spillover_pval ?? null;

  if (spillover === null) return 50;

  // Significant positive spillover (p < 0.05) is strong
  const isSignificant = pValue !== null && pValue < 0.05;

  if (spillover > 0 && isSignificant) {
    const score = 70 + spillover * 60;
    return clamp(score, 70, 100);
  }

  if (spillover > 0) {
    // Positive but not significant
    const score = 55 + spillover * 30;
    return clamp(score, 50, 70);
  }

  // Negative spillover
  const score = 50 + spillover * 30;
  return clamp(score, 0, 50);
}

function computeSurvivalComponent(survivalRow) {
  if (!survivalRow) return 50; // neutral default

  const probability = parseFloat(survivalRow.value);
  if (isNaN(probability)) return 50;

  // Direct mapping: survival probability (0-1) → 0-100
  return clamp(probability * 100, 0, 100);
}

/* ------------------------------------------------------------------ */
/*  Shared utilities                                                   */
/* ------------------------------------------------------------------ */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function irsToGrade(irs) {
  return (
    irs >= 85 ? 'A'
    : irs >= 78 ? 'A-'
    : irs >= 72 ? 'B+'
    : irs >= 65 ? 'B'
    : irs >= 58 ? 'B-'
    : irs >= 50 ? 'C+'
    : irs >= 42 ? 'C'
    : 'D'
  );
}
