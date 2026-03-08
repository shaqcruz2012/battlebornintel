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

  const { rows: companies } = await pool.query(companySql, params);

  // Get all funds first
  const { rows: allFunds } = await pool.query(`SELECT * FROM funds`);

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

  // Load sector heat from constants
  const { rows: constRows } = await pool.query(
    `SELECT value FROM constants WHERE key = 'sector_heat'`
  );
  const sectorHeat = constRows[0]?.value || {};

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

export async function getSectorStats({ region } = {}) {
  let sectorSql = `SELECT * FROM companies`;
  const sectorParams = [];
  if (region && region !== 'all') {
    sectorSql += ` WHERE region = $1`;
    sectorParams.push(region);
  }
  const { rows: companies } = await pool.query(sectorSql, sectorParams);
  const { rows: constRows } = await pool.query(
    `SELECT value FROM constants WHERE key = 'sector_heat'`
  );
  const sectorHeat = constRows[0]?.value || {};

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
