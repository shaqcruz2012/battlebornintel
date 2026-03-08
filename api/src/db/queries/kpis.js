import pool from '../pool.js';

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

  // Filter funds to those that have invested in the filtered companies
  let funds = allFunds;
  if (companies.length > 0) {
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
      secondary: `${companies.length} companies tracked`,
    },
    innovationIndex: {
      value: innovationIndex,
      label: 'Innovation Momentum',
      secondary: `${topMomentum} high-momentum cos`,
    },
  };
}

export async function getSectorStats() {
  const { rows: companies } = await pool.query(`SELECT * FROM companies`);
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
