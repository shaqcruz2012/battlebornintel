import { COMPANIES } from '../data/companies.js';
import { FUNDS } from '../data/funds.js';
import { SHEAT } from '../data/constants.js';

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
    },
    ssbciCapitalDeployed: {
      value: ssbciDeployed,
      label: 'SSBCI Capital Deployed',
      secondary: `${ssbciFunds.length} SSBCI funds`,
    },
    privateLeverage: {
      value: privateLeverage,
      label: 'Private Leverage',
      secondary: `${ssbciFunds.length} SSBCI funds`,
    },
    ecosystemCapacity: {
      value: ecosystemCapacity,
      label: 'Ecosystem Capacity',
      secondary: `${cs.length} companies tracked`,
    },
    innovationIndex: {
      value: innovationIndex,
      label: 'Innovation Momentum',
      secondary: `${topMomentum} high-momentum cos`,
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
