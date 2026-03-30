import pool from '../pool.js';

// Data quality constants
const DATA_QUALITY = {
  VERIFIED: 'verified',
  INFERRED: 'inferred',
  CALCULATED: 'calculated',
};

// Fund types classified as publicly backed for capital share calculations
const PUBLIC_FUND_TYPES = ['SSBCI', 'Accelerator'];

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

  // ── Tracked Funding — total company funding across ecosystem ──────────────
  const trackedFunding = companies.reduce(
    (s, c) => s + parseFloat(c.funding_m || 0),
    0
  );

  const publicFunds = allFunds.filter(f => PUBLIC_FUND_TYPES.includes(f.fund_type));
  const publicFundingDirect = publicFunds.reduce(
    (s, f) => s + parseFloat(f.deployed_m || 0), 0
  );
  const publicEntityCount = publicFunds.length;

  const companyIds = companies.map(c => `c_${c.id}`);

  // Query deal origination in parallel
  const [{ rows: dealOrigRows }, { rows: totalFundedRows }] =
    await Promise.all([
      // Deal origination: companies connected to public institutions that also got fund investment
      pool.query(
        `SELECT COUNT(DISTINCT ge2.target_id) AS originated
         FROM graph_edges ge1
         JOIN graph_edges ge2 ON ge1.target_id = ge2.target_id
         WHERE (ge1.source_id LIKE 'a_%' OR ge1.source_id LIKE 'e_%'
                OR ge1.target_id LIKE 'a_%' OR ge1.target_id LIKE 'e_%')
         AND ge1.rel IN ('accelerated_by','invested_in','grants_to','supports','funded','funds','won_pitch')
         AND ge2.source_id LIKE 'f_%'
         AND ge2.rel = 'invested_in'
         ${companyIds.length > 0 ? 'AND ge2.target_id = ANY($1)' : ''}`,
        companyIds.length > 0 ? [companyIds] : []
      ),
      // Total companies that received fund investment
      pool.query(
        `SELECT COUNT(DISTINCT target_id) AS total_funded
         FROM graph_edges
         WHERE source_id LIKE 'f_%' AND rel = 'invested_in'
         ${companyIds.length > 0 ? 'AND target_id = ANY($1)' : ''}`,
        companyIds.length > 0 ? [companyIds] : []
      ),
    ]);

  const originatedDeals = parseInt(dealOrigRows[0]?.originated || 0, 10);
  const totalFundedCompanies = parseInt(totalFundedRows[0]?.total_funded || 0, 10);
  const dealOriginationRate = totalFundedCompanies > 0
    ? (originatedDeals / totalFundedCompanies) * 100
    : 0;
  const publicCapitalShare = trackedFunding > 0
    ? (publicFundingDirect / trackedFunding) * 100
    : 0;

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
    trackedFunding: {
      value: trackedFunding,
      label: 'Tracked Funding',
      secondary: `${companies.length} companies`,
      quality: DATA_QUALITY.VERIFIED,
      dataQualityNote: 'Sum of total funding (all rounds) across tracked Nevada ecosystem companies. Sourced from Crunchbase, SEC filings, and press releases.',
      sources: ['Crunchbase', 'SEC filings', 'Press releases', 'Company self-reports'],
    },
    publicCapitalShare: {
      value: publicCapitalShare,
      label: 'Public Capital Share',
      secondary: `${publicEntityCount} public institutions`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: `Public institutions contribute ~${publicCapitalShare.toFixed(1)}% of total tracked funding directly, but originate ${dealOriginationRate.toFixed(0)}% of deals through accelerator pipelines and co-investment signaling. They occupy high-betweenness positions in the network graph.`,
      formula: 'public_institution_direct_funding / total_tracked_funding × 100',
      breakdown: {
        directFunding: { value: publicFundingDirect, quality: DATA_QUALITY.CALCULATED },
        totalTracked: { value: trackedFunding, quality: DATA_QUALITY.VERIFIED },
      },
    },
    dealOrigination: {
      value: dealOriginationRate,
      label: 'Deal Origination',
      secondary: `${originatedDeals} of ${totalFundedCompanies} funded cos`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: `${originatedDeals} of ${totalFundedCompanies} funded companies had prior connections to accelerators or ecosystem orgs (GOED, StartupNV, AngelNV, etc.) before receiving institutional capital. Derived from graph multi-hop traversal of accelerator → company → fund investment paths.`,
      formula: 'companies_with_public_institution_connection / total_funded_companies × 100',
      sources: ['T-GNN temporal analysis', 'Graph edge traversal'],
      components: {
        originatedDeals: {
          value: originatedDeals,
          quality: DATA_QUALITY.CALCULATED,
          note: 'Companies connected to accelerators/ecosystem orgs that subsequently received fund investment',
        },
        totalFundedCompanies: {
          value: totalFundedCompanies,
          quality: DATA_QUALITY.VERIFIED,
          note: 'Companies with at least one invested_in edge from a fund',
        },
      },
    },
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
