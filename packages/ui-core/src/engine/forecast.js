/**
 * Predictive timeline engine for energy project forecasting.
 * Uses sector-specific stage-duration benchmarks and risk multipliers
 * to project timelines with confidence intervals.
 */

const STAGE_ORDER = ["proposed", "queue", "nepa_review", "approved", "under_construction", "operational"];

function getTransitionKey(from, to) {
  return `${from}_to_${to}`;
}

function monthsFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.round((now - d) / (1000 * 60 * 60 * 24 * 30.44));
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + Math.round(months));
  return d.toISOString().slice(0, 10);
}

/**
 * Compute predictive forecast for an energy project.
 *
 * @param {Object} company - Company with stage, sector, riskFactors, keyMilestones, estimatedCOD
 * @param {Object} benchmarks - { stages: STAGE_BENCHMARKS, risks: RISK_MULTIPLIERS }
 * @returns {Object|null} Forecast object or null if benchmarks unavailable
 */
export function computeForecast(company, benchmarks) {
  if (!benchmarks?.stages || !company) return null;

  const sector = (company.sector || [])[0] || "Solar+BESS";
  const sectorBench = benchmarks.stages[sector] || benchmarks.stages["Solar+BESS"];
  if (!sectorBench) return null;

  const riskMultipliers = benchmarks.risks || {};
  const currentStage = company.stage;
  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  if (currentIdx === -1) return null;

  // Calculate combined risk multiplier
  const risks = company.riskFactors || [];
  let combinedRisk = 1;
  risks.forEach(r => {
    combinedRisk *= (riskMultipliers[r] || 1);
  });

  // Find the date the project entered its current stage (from milestones)
  const milestones = company.keyMilestones || [];
  let stageEntryDate = null;

  // Try to find milestone matching current stage entry
  for (let i = milestones.length - 1; i >= 0; i--) {
    const m = milestones[i];
    if (m.status === "complete" || m.status === "in_progress") {
      stageEntryDate = m.date;
      break;
    }
  }

  if (!stageEntryDate) {
    // Fallback: estimate from founded year
    stageEntryDate = `${company.founded}-01-01`;
  }

  const timeInStage = monthsFromDate(stageEntryDate) || 0;

  // Build projected timeline for remaining stages
  const projectedTimeline = [];
  let cursor = new Date().toISOString().slice(0, 10);

  for (let i = currentIdx; i < STAGE_ORDER.length - 1; i++) {
    const from = STAGE_ORDER[i];
    const to = STAGE_ORDER[i + 1];
    const key = getTransitionKey(from, to);
    const bench = sectorBench[key];

    if (!bench) continue;

    const adjustedMedian = bench.median * combinedRisk;
    const adjustedP25 = bench.p25 * combinedRisk;
    const adjustedP75 = bench.p75 * combinedRisk;

    // If we're in the current stage, adjust for time already spent
    let remaining;
    if (i === currentIdx) {
      remaining = {
        median: Math.max(adjustedMedian - timeInStage, 1),
        p25: Math.max(adjustedP25 - timeInStage, 1),
        p75: Math.max(adjustedP75 - timeInStage, 1),
      };
    } else {
      remaining = { median: adjustedMedian, p25: adjustedP25, p75: adjustedP75 };
    }

    const estStart = cursor;
    const estEnd = addMonths(cursor, remaining.median);
    const confidence = remaining.p75 > 0
      ? Math.max(0, Math.min(100, Math.round(100 - (remaining.p75 - remaining.p25) / remaining.p75 * 80)))
      : 50;

    projectedTimeline.push({
      stage: to,
      from,
      estStart,
      estEnd,
      durationMonths: { optimistic: Math.round(remaining.p25), median: Math.round(remaining.median), pessimistic: Math.round(remaining.p75) },
      confidence,
    });

    cursor = estEnd;
  }

  // Calculate COD estimates
  const lastStep = projectedTimeline[projectedTimeline.length - 1];
  let estimatedCOD = null;
  if (currentStage === "operational") {
    estimatedCOD = { optimistic: "Operational", median: "Operational", pessimistic: "Operational" };
  } else if (lastStep) {
    const totalP25 = projectedTimeline.reduce((s, t) => s + t.durationMonths.optimistic, 0);
    const totalMedian = projectedTimeline.reduce((s, t) => s + t.durationMonths.median, 0);
    const totalP75 = projectedTimeline.reduce((s, t) => s + t.durationMonths.pessimistic, 0);
    const now = new Date().toISOString().slice(0, 10);
    estimatedCOD = {
      optimistic: addMonths(now, totalP25),
      median: addMonths(now, totalMedian),
      pessimistic: addMonths(now, totalP75),
    };
  }

  // Identify bottlenecks
  const bottlenecks = [];
  if (risks.includes("transmission_dependent")) bottlenecks.push("Depends on Greenlink transmission completion");
  if (risks.includes("blm_eis_remand")) bottlenecks.push("BLM EIS remanded — supplemental review required");
  if (risks.includes("water_constraints")) bottlenecks.push("Desert water availability constraints");
  if (risks.includes("programmatic_eis")) bottlenecks.push("Programmatic EIS covers broader scope");
  if (risks.includes("interstate_transmission")) bottlenecks.push("FERC interstate review required");
  if (risks.includes("endangered_species")) bottlenecks.push("ESA species consultation required");
  if (risks.includes("competitive_lease")) bottlenecks.push("BLM competitive lease process pending");

  const riskScore = computeRiskScore(company);

  return {
    currentStage,
    currentStageIndex: currentIdx,
    timeInStage,
    projectedTimeline,
    estimatedCOD,
    riskScore,
    combinedRiskMultiplier: Math.round(combinedRisk * 100) / 100,
    bottlenecks,
    stagesRemaining: STAGE_ORDER.length - 1 - currentIdx,
  };
}

/**
 * Compute risk score (0-100, lower = less risk) for an energy project.
 */
export function computeRiskScore(company) {
  if (!company) return 50;

  let score = 20; // baseline

  const risks = company.riskFactors || [];
  const riskWeights = {
    transmission_dependent: 15,
    blm_eis_remand: 20,
    water_constraints: 8,
    large_project: 6,
    programmatic_eis: 12,
    interstate_transmission: 10,
    endangered_species: 10,
    competitive_lease: 5,
    tribal_consultation: 5,
  };
  const riskReductions = {
    utility_owned: -10,
    existing_interconnection: -8,
    solar_energy_zone: -5,
  };

  risks.forEach(r => {
    score += riskWeights[r] || riskReductions[r] || 3;
  });

  // Stage-based risk adjustment
  const stageIdx = STAGE_ORDER.indexOf(company.stage);
  if (stageIdx >= 0) {
    // Earlier stages = more risk
    score += Math.max(0, (4 - stageIdx) * 5);
  }

  // Permitting score reduces risk
  if (company.permittingScore != null) {
    score -= Math.round(company.permittingScore * 0.15);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
