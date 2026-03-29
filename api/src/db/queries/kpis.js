import pool from '../pool.js';

// Data quality constants
const DATA_QUALITY = {
  VERIFIED: 'verified',
  INFERRED: 'inferred',
  CALCULATED: 'calculated',
};

export async function getKpis({ stage, region, sector } = {}) {
  let companySql = `SELECT * FROM companies`;
  const conditions = [];
  const params = [];
  let idx = 1;

  if (stage && stage !== 'all') {
    const stageMap = {
      seed: ['pre_seed', 'seed'],
      early: ['series_a', 'series_b'],
      growth: ['series_c_plus', 'growth'],
    };
    conditions.push(`stage = ANY($${idx})`);
    params.push(stageMap[stage] || [stage]);
    idx++;
  }
  if (region && region !== 'all') {
    conditions.push(`region = $${idx}`);
    params.push(region);
    idx++;
  }
  if (sector && sector !== 'all') {
    conditions.push(`$${idx} = ANY(sectors)`);
    params.push(sector);
    idx++;
  }

  if (conditions.length) companySql += ' WHERE ' + conditions.join(' AND ');

  // Fire all three independent queries in parallel
  const [{ rows: companies }, { rows: allFunds }, { rows: constRows }] =
    await Promise.all([
      pool.query(companySql, params),
      pool.query(`SELECT * FROM funds`),
      pool.query(`SELECT value FROM constants WHERE key = 'sector_heat'`),
    ]);
  const sectorHeat = constRows[0]?.value || {};

  // Filter funds to those that have invested in the filtered companies.
  // When a region (or other filter) is active we must always scope funds to
  // the matching company set — even when that set is empty (→ zero capital).
  let funds;
  const isFiltered = (region && region !== 'all') ||
                     (stage && stage !== 'all') ||
                     (sector && sector !== 'all');

  if (isFiltered) {
    if (companies.length === 0) {
      // No companies match the active filter → no capital deployed in this region
      funds = [];
    } else {
      // Find funds that have invested_in edges to the filtered companies
      const { rows: investmentEdges } = await pool.query(
        `SELECT DISTINCT source_id FROM graph_edges
         WHERE rel = 'invested_in'
         AND target_id = ANY($1)`,
        [companies.map(c => `c_${c.id}`)]
      );
      // Extract fund IDs from source_id (e.g., "f_bbv" -> "bbv", "f_fundnv" -> "fundnv")
      const fundIds = investmentEdges.map(e => {
        const match = e.source_id.match(/^f_(.+)$/);
        return match ? match[1] : null;
      }).filter(Boolean);

      funds = allFunds.filter(f => fundIds.includes(f.id));
    }
  } else {
    // No filter active → statewide totals use all funds
    funds = allFunds;
  }

  // Capital Deployed - sum of all funds investing in filtered companies
  const ssbciFunds = funds.filter((f) => f.fund_type === 'SSBCI');
  const capitalDeployed = funds.reduce(
    (s, f) => s + parseFloat(f.deployed_m || 0),
    0
  );

  // Private Leverage - SSBCI funds only
  const ssbciDeployed = ssbciFunds.reduce(
    (s, f) => s + parseFloat(f.deployed_m || 0),
    0
  );
  const weightedLev = ssbciFunds.reduce(
    (s, f) =>
      s + parseFloat(f.deployed_m || 0) * parseFloat(f.leverage || 0),
    0
  );
  const privateLeverage = ssbciDeployed > 0 ? weightedLev / ssbciDeployed : 0;

  // Ecosystem Capacity
  const ecosystemCapacity = companies.reduce(
    (s, c) => s + (c.employees || 0),
    0
  );

  // Count companies with verified employee data
  const companiesWithVerifiedEmployees = companies.filter(
    (c) => c.employees && c.employees > 0
  ).length;

  // Innovation Index
  const n = companies.length || 1;
  const avgMomentum =
    companies.reduce((s, c) => s + (c.momentum || 0), 0) / n;
  const topMomentum = companies.filter((c) => c.momentum >= 75).length;
  const hotSectors = companies.filter((c) =>
    (c.sectors || []).some((s) => (sectorHeat[s] || 0) >= 80)
  ).length;
  const innovationIndex = Math.round(
    avgMomentum * 0.4 +
      (topMomentum / n) * 100 * 0.3 +
      (hotSectors / n) * 100 * 0.3
  );

  return {
    capitalDeployed: {
      value: capitalDeployed,
      label: 'Capital Deployed',
      secondary: `${funds.length} active funds`,
      quality: DATA_QUALITY.VERIFIED,
      dataQualityNote: 'Verified from fund deployment records and SEC filings',
      sources: ['Fund administrator reports', 'SEC SBIC filings'],
    },
    ssbciCapitalDeployed: {
      value: ssbciDeployed,
      label: 'SSBCI Capital Deployed',
      secondary: `${ssbciFunds.length} SSBCI funds`,
      quality: DATA_QUALITY.VERIFIED,
      dataQualityNote: 'Verified from SSBCI program certification documents and Treasury records',
      sources: ['SSBCI certification', 'Treasury reporting', 'Fund certifications'],
    },
    privateLeverage: {
      value: privateLeverage,
      label: 'Private Leverage',
      secondary: `${ssbciFunds.length} SSBCI funds`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: 'Calculated ratio: Sum(deployed × leverage) / Sum(deployed). Deployment amounts verified; leverage ratios estimated.',
      formula: 'Σ(fund.deployed_m × fund.leverage) / Σ(fund.deployed_m)',
      breakdown: {
        deployed: DATA_QUALITY.VERIFIED,
        leverage: DATA_QUALITY.INFERRED,
      },
    },
    ecosystemCapacity: {
      value: ecosystemCapacity,
      label: 'Ecosystem Capacity',
      secondary: `${companies.length} companies tracked`,
      quality: DATA_QUALITY.INFERRED,
      dataQualityNote: `${companiesWithVerifiedEmployees} of ${companies.length} companies have reported employee counts. Remaining estimates based on funding stage and industry benchmarks.`,
      verificationPercentage: Math.round((companiesWithVerifiedEmployees / n) * 100),
      sources: [
        'Company self-reports',
        'Crunchbase data',
        'LinkedIn analysis',
        'Press releases',
      ],
    },
    innovationIndex: {
      value: innovationIndex,
      label: 'Innovation Momentum',
      secondary: `${topMomentum} high-momentum cos`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: 'Composite index: 40% avg momentum score + 30% high performers + 30% hot sectors. All components are inferred metrics.',
      formula: '(avgMomentum × 0.4) + (topPerformers/n × 100 × 0.3) + (hotSectors/n × 100 × 0.3)',
      components: {
        momentum: {
          quality: DATA_QUALITY.INFERRED,
          note: 'Proprietary momentum scoring algorithm',
        },
        topPerformers: {
          quality: DATA_QUALITY.INFERRED,
          note: 'Companies with momentum score ≥ 75',
        },
        hotSectors: {
          quality: DATA_QUALITY.INFERRED,
          note: 'Sectors with heat score ≥ 80 (market research + funding trends)',
        },
      },
    },
  };
}

/**
 * Get KPIs enriched with forecast confidence intervals from the latest
 * completed scenario.  Returns the same shape as getKpis() but each KPI
 * that has a matching forecast gains a `forecast` field:
 *   { value, lo, hi, period }
 */
export async function getKPIsWithForecasts(sector) {
  // 1. Get base KPI data (pass sector filter through)
  const kpis = await getKpis(sector ? { sector } : {});

  // 2. Pull forecast data from the latest completed scenario.
  //    We look for ecosystem-level forecasts first (aggregate KPIs),
  //    then company-level simulated metrics for per-company rollups.
  const { rows: forecastRows } = await pool.query(
    `SELECT sr.metric_name, sr.value, sr.confidence_lo, sr.confidence_hi, sr.period
     FROM scenario_results sr
     JOIN scenarios s ON s.id = sr.scenario_id
     WHERE s.status = 'complete'
       AND sr.entity_type = 'ecosystem'
       AND sr.metric_name IN (
         'funding_m_forecast', 'employment_forecast', 'innovation_index',
         'capital_deployed_forecast', 'leverage_forecast'
       )
     ORDER BY s.created_at DESC, sr.period DESC`
  );

  // Build a map of metric_name -> latest forecast row
  const forecastMap = {};
  for (const row of forecastRows) {
    // Keep only the first (latest scenario, latest period) per metric
    if (!forecastMap[row.metric_name]) {
      forecastMap[row.metric_name] = row;
    }
  }

  // 3. Map forecast metrics to KPI keys
  const kpiToForecastMetric = {
    capitalDeployed: 'capital_deployed_forecast',
    ecosystemCapacity: 'employment_forecast',
    innovationIndex: 'innovation_index',
    privateLeverage: 'leverage_forecast',
    ssbciCapitalDeployed: 'funding_m_forecast',
  };

  // 4. Enrich each KPI with forecast data where available
  const enriched = {};
  for (const [key, kpi] of Object.entries(kpis)) {
    enriched[key] = { ...kpi };
    const forecastMetric = kpiToForecastMetric[key];
    if (forecastMetric && forecastMap[forecastMetric]) {
      const f = forecastMap[forecastMetric];
      enriched[key].forecast = {
        value: parseFloat(f.value),
        lo: parseFloat(f.confidence_lo),
        hi: parseFloat(f.confidence_hi),
        period: f.period,
      };
    }
  }

  return enriched;
}

/**
 * Ecosystem-level forecast summary from the latest completed scenario.
 * Returns total funding, total employees, and average momentum — each
 * with confidence interval bands — aggregated across all companies.
 */
export async function getEcosystemForecastSummary() {
  // Find the latest completed scenario
  const { rows: scenarioRows } = await pool.query(
    `SELECT id, name, base_period, created_at
     FROM scenarios
     WHERE status = 'complete'
     ORDER BY created_at DESC
     LIMIT 1`
  );

  if (scenarioRows.length === 0) {
    return null;
  }

  const scenario = scenarioRows[0];

  // Aggregate company-level simulated results from that scenario
  const { rows } = await pool.query(
    `SELECT
       sr.metric_name,
       CASE WHEN sr.metric_name = 'momentum_simulated' THEN AVG(sr.value)
            ELSE SUM(sr.value) END AS value,
       CASE WHEN sr.metric_name = 'momentum_simulated' THEN AVG(sr.confidence_lo)
            ELSE SUM(sr.confidence_lo) END AS confidence_lo,
       CASE WHEN sr.metric_name = 'momentum_simulated' THEN AVG(sr.confidence_hi)
            ELSE SUM(sr.confidence_hi) END AS confidence_hi,
       MAX(sr.period) AS period,
       COUNT(*)::int AS entity_count
     FROM scenario_results sr
     WHERE sr.scenario_id = $1
       AND sr.entity_type = 'company'
       AND sr.metric_name IN ('funding_m_simulated', 'employees_simulated', 'momentum_simulated')
     GROUP BY sr.metric_name`,
    [scenario.id]
  );

  // Also check for ecosystem-level rows (pre-aggregated by the model)
  const { rows: ecosystemRows } = await pool.query(
    `SELECT sr.metric_name, sr.value, sr.confidence_lo, sr.confidence_hi, sr.period
     FROM scenario_results sr
     WHERE sr.scenario_id = $1
       AND sr.entity_type = 'ecosystem'
       AND sr.metric_name IN ('funding_m_forecast', 'employment_forecast', 'innovation_index')
     ORDER BY sr.period DESC`,
    [scenario.id]
  );

  // Build result map — prefer ecosystem-level rows if present, fall back to
  // company-level aggregations
  const metricsMap = {};

  // Company-level aggregates (fallback)
  const companyMetricToKey = {
    funding_m_simulated: 'totalFunding',
    employees_simulated: 'totalEmployees',
    momentum_simulated: 'avgMomentum',
  };
  for (const row of rows) {
    const key = companyMetricToKey[row.metric_name];
    if (key) {
      metricsMap[key] = {
        value: parseFloat(row.value),
        lo: parseFloat(row.confidence_lo),
        hi: parseFloat(row.confidence_hi),
        period: row.period,
        entityCount: row.entity_count,
      };
    }
  }

  // Ecosystem-level rows (override if available)
  const ecosystemMetricToKey = {
    funding_m_forecast: 'totalFunding',
    employment_forecast: 'totalEmployees',
    innovation_index: 'avgMomentum',
  };
  for (const row of ecosystemRows) {
    const key = ecosystemMetricToKey[row.metric_name];
    if (key) {
      metricsMap[key] = {
        value: parseFloat(row.value),
        lo: parseFloat(row.confidence_lo),
        hi: parseFloat(row.confidence_hi),
        period: row.period,
        entityCount: metricsMap[key]?.entityCount || null,
      };
    }
  }

  return {
    scenario: {
      id: scenario.id,
      name: scenario.name,
      basePeriod: scenario.base_period,
      createdAt: scenario.created_at,
    },
    totalFunding: metricsMap.totalFunding || null,
    totalEmployees: metricsMap.totalEmployees || null,
    avgMomentum: metricsMap.avgMomentum || null,
  };
}

export async function getSectorStats({ region } = {}) {
  let sectorSql = `SELECT * FROM companies`;
  const sectorParams = [];
  if (region && region !== 'all') {
    sectorSql += ` WHERE region = $1`;
    sectorParams.push(region);
  }
  // Fire both queries in parallel
  const [{ rows: companies }, { rows: heatRows }] = await Promise.all([
    pool.query(sectorSql, sectorParams),
    pool.query(`SELECT value FROM constants WHERE key = 'sector_heat'`),
  ]);
  const sectorHeat = heatRows[0]?.value || {};

  const map = {};
  for (const c of companies) {
    for (const s of c.sectors || []) {
      if (!map[s]) {
        map[s] = {
          sector: s,
          count: 0,
          totalFunding: 0,
          heat: sectorHeat[s] || 50,
        };
      }
      map[s].count++;
      map[s].totalFunding += parseFloat(c.funding_m || 0);
    }
  }

  return Object.values(map)
    .map((s) => ({
      ...s,
      avgFunding: s.count > 0 ? s.totalFunding / s.count : 0,
    }))
    .sort((a, b) => b.heat - a.heat);
}
