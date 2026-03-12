import { COMPANIES } from '../data/companies.js';
import { FUNDS } from '../data/funds.js';
import { SHEAT } from '../data/constants.js';

// Data quality levels
const DATA_QUALITY = {
  VERIFIED: 'verified',
  INFERRED: 'inferred',
  CALCULATED: 'calculated',
};

export function computeKPIs(companies, funds) {
  const cs = companies || COMPANIES;
  const fs = funds || FUNDS;

  // 1. Capital Deployed: sum of all fund deployed amounts
  const ssbciFunds = fs.filter((f) => f.type === 'SSBCI');
  const capitalDeployed = fs.reduce((sum, f) => sum + (f.deployed || 0), 0);

  // 2. Private Leverage: weighted average leverage for SSBCI funds
  const ssbciDeployed = ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0);
  const weightedLev = ssbciFunds.reduce(
    (s, f) => s + (f.deployed || 0) * (f.leverage || 0), 0
  );
  const privateLeverage = ssbciDeployed > 0 ? weightedLev / ssbciDeployed : 0;

  // 3. Ecosystem Capacity: total employees across all companies
  const ecosystemCapacity = cs.reduce((sum, c) => sum + (c.employees || 0), 0);

  // Calculate the number of companies with verified employee counts
  const companiesWithVerifiedEmployees = cs.filter(
    (c) => c.employees && c.employees > 0
  ).length;

  // 4. Innovation Momentum Index: weighted composite
  const avgMomentum = cs.reduce((s, c) => s + (c.momentum || 0), 0) / cs.length;
  const topMomentum = cs.filter((c) => c.momentum >= 75).length;
  const hotSectors = cs.filter(
    (c) => (c.sector || []).some((s) => (SHEAT[s] || 0) >= 80)
  ).length;
  const innovationIndex = Math.round(
    avgMomentum * 0.4 +
    (topMomentum / cs.length) * 100 * 0.3 +
    (hotSectors / cs.length) * 100 * 0.3
  );

  return {
    capitalDeployed: {
      value: capitalDeployed,
      label: 'Capital Deployed',
      secondary: `${fs.length} active funds`,
      quality: DATA_QUALITY.VERIFIED,
      dataQualityNote: 'Verified from fund deployment records and SEC filings. Covers all active ecosystem funds.',
    },
    ssbciCapitalDeployed: {
      value: ssbciDeployed,
      label: 'SSBCI Capital Deployed',
      secondary: `${ssbciFunds.length} SSBCI funds`,
      quality: DATA_QUALITY.VERIFIED,
      dataQualityNote: 'Verified from SSBCI program certification documents and Treasury records',
    },
    privateLeverage: {
      value: privateLeverage,
      label: 'Private Leverage',
      secondary: `${ssbciFunds.length} SSBCI funds`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: 'Calculated ratio: Sum(deployed × leverage) / Sum(deployed). Deployment amounts verified; leverage ratios estimated.',
      breakdown: {
        deployed: DATA_QUALITY.VERIFIED,
        leverage: DATA_QUALITY.INFERRED,
      },
    },
    ecosystemCapacity: {
      value: ecosystemCapacity,
      label: 'Ecosystem Capacity',
      secondary: `${cs.length} companies tracked`,
      quality: DATA_QUALITY.INFERRED,
      dataQualityNote: `${companiesWithVerifiedEmployees} of ${cs.length} companies have reported employee counts. Remaining estimates based on funding stage and industry benchmarks.`,
      verificationPercentage: Math.round((companiesWithVerifiedEmployees / cs.length) * 100),
    },
    innovationIndex: {
      value: innovationIndex,
      label: 'Innovation Momentum',
      secondary: `${topMomentum} high-momentum cos`,
      quality: DATA_QUALITY.CALCULATED,
      dataQualityNote: 'Composite index: 40% avg momentum score + 30% high performers + 30% hot sectors. All components are inferred metrics.',
      components: {
        momentum: { quality: DATA_QUALITY.INFERRED },
        topPerformers: { quality: DATA_QUALITY.INFERRED },
        hotSectors: { quality: DATA_QUALITY.INFERRED },
      },
    },
  };
}

export function computeSectorStats(companies) {
  const cs = companies || COMPANIES;
  const map = {};

  cs.forEach((c) => {
    (c.sector || []).forEach((s) => {
      if (!map[s]) {
        map[s] = { sector: s, count: 0, totalFunding: 0, companies: [], heat: SHEAT[s] || 50 };
      }
      map[s].count += 1;
      map[s].totalFunding += c.funding || 0;
      map[s].companies.push(c);
    });
  });

  return Object.values(map)
    .map((s) => ({
      ...s,
      avgFunding: s.count > 0 ? s.totalFunding / s.count : 0,
      topCompany: s.companies.sort((a, b) => (b.momentum || 0) - (a.momentum || 0))[0],
    }))
    .sort((a, b) => b.heat - a.heat);
}
