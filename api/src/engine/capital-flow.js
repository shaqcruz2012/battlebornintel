/**
 * Capital Flow Analytics Engine
 *
 * Builds a directed weighted funding subgraph, runs weighted PageRank
 * for "capital magnet" scoring, and performs source-sink analysis.
 */

import pool from '../db/pool.js';

// ── 1. Build directed weighted funding subgraph ─────────────────────────────

/**
 * Compute capital flow analytics across the funding subgraph.
 *
 * Queries all funds, invested_in edges, and companies, then builds:
 * - Sankey-ready fund-to-sector and sector-to-company flow arrays
 * - Weighted PageRank "capital magnet" scores
 * - Source-sink analysis (net deployers vs net attractors)
 * - Aggregations by sector, region, and stage
 *
 * @returns {Promise<{
 *   flows: Array, rawFlows: Array, capitalMagnets: Array,
 *   sourceSink: Array, byRegion: Object, bySector: Object, byStage: Object
 * }>}
 */
export async function computeCapitalFlows() {
  // Fire all independent queries in parallel
  const [
    { rows: funds },
    { rows: investedEdges },
    { rows: companies },
  ] = await Promise.all([
    pool.query(`SELECT id, name, fund_type, deployed_m, allocated_m, company_count FROM funds`),
    pool.query(`
      SELECT ge.source_id, ge.target_id, ge.note, ge.weight, ge.event_year
      FROM graph_edges ge
      WHERE ge.rel = 'invested_in'
    `),
    pool.query(`SELECT id, name, stage, sectors, region, funding_m FROM companies`),
  ]);

  // Index companies by their graph id prefix
  const companyById = {};
  for (const c of companies) {
    companyById[`c_${c.id}`] = c;
  }

  // Index funds by graph id prefix
  const fundById = {};
  for (const f of funds) {
    fundById[`f_${f.id}`] = f;
    fundById[f.id] = f;
  }

  // Count portfolio size for each fund (from invested_in edges)
  const fundPortfolioSize = {};
  for (const e of investedEdges) {
    const src = e.source_id;
    fundPortfolioSize[src] = (fundPortfolioSize[src] || 0) + 1;
  }

  // Build flow graph with estimated dollar values
  const flows = [];
  for (const e of investedEdges) {
    const fund = fundById[e.source_id];
    const company = companyById[e.target_id];

    // Skip edges that are not fund-to-company
    if (!fund && !e.source_id.startsWith('f_')) continue;

    let value = 0;

    // Try to extract dollar value from weight JSON
    if (e.weight && e.weight.deal_size_m) {
      value = parseFloat(e.weight.deal_size_m);
    }

    // Try to parse dollar amount from note
    if (!value && e.note) {
      const match = e.note.match(/\$([0-9,.]+)\s*([MBK])/i);
      if (match) {
        const num = parseFloat(match[1].replace(/,/g, ''));
        const unit = match[2].toUpperCase();
        if (unit === 'B') value = num * 1000;
        else if (unit === 'M') value = num;
        else if (unit === 'K') value = num / 1000;
      }
    }

    // Estimate from fund deployed / portfolio size
    if (!value && fund) {
      const deployed = parseFloat(fund.deployed_m || 0);
      const portfolioSize = fundPortfolioSize[e.source_id] || fund.company_count || 1;
      if (deployed > 0 && portfolioSize > 0) {
        value = deployed / portfolioSize;
      }
    }

    // Build the flow record
    const sourceName = fund ? fund.name : e.source_id.replace(/^[fx]_/, '');
    const targetName = company ? company.name : e.target_id.replace(/^c_/, '');
    const targetSectors = company ? (company.sectors || []) : [];
    const targetRegion = company ? company.region : 'unknown';
    const targetStage = company ? company.stage : 'unknown';

    flows.push({
      source: e.source_id,
      target: e.target_id,
      sourceName,
      targetName,
      value: Math.round(value * 100) / 100,
      type: 'investment',
      sectors: targetSectors,
      region: targetRegion,
      stage: targetStage,
      year: e.event_year,
    });
  }

  // ── Aggregations ──────────────────────────────────────────────────────────

  // By sector: fund → sector totals
  const bySector = {};
  for (const f of flows) {
    for (const s of f.sectors) {
      bySector[s] = (bySector[s] || 0) + f.value;
    }
  }

  // By region
  const byRegion = {};
  for (const f of flows) {
    byRegion[f.region] = (byRegion[f.region] || 0) + f.value;
  }

  // By stage
  const byStage = {};
  for (const f of flows) {
    byStage[f.stage] = (byStage[f.stage] || 0) + f.value;
  }

  // Sankey-ready: fund → sector flows
  const fundSectorFlows = {};
  for (const f of flows) {
    for (const s of f.sectors) {
      const key = `${f.source}|${s}`;
      if (!fundSectorFlows[key]) {
        fundSectorFlows[key] = { source: f.sourceName, target: s, value: 0, type: 'fund_to_sector' };
      }
      fundSectorFlows[key].value += f.value;
    }
  }

  // Sankey-ready: sector → company flows (top companies only)
  const companyTotals = {};
  for (const f of flows) {
    if (!companyTotals[f.target]) {
      companyTotals[f.target] = { id: f.target, name: f.targetName, sectors: f.sectors, value: 0 };
    }
    companyTotals[f.target].value += f.value;
  }

  const topCompanies = Object.values(companyTotals)
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  const topCompanyIds = new Set(topCompanies.map(c => c.id));

  const sectorCompanyFlows = {};
  for (const f of flows) {
    if (!topCompanyIds.has(f.target)) continue;
    for (const s of f.sectors) {
      const key = `${s}|${f.target}`;
      if (!sectorCompanyFlows[key]) {
        sectorCompanyFlows[key] = { source: s, target: f.targetName, value: 0, type: 'sector_to_company' };
      }
      sectorCompanyFlows[key].value += f.value;
    }
  }

  const sankeyFlows = [
    ...Object.values(fundSectorFlows).filter(f => f.value > 0),
    ...Object.values(sectorCompanyFlows).filter(f => f.value > 0),
  ];

  // ── 2. Weighted PageRank for capital magnet scoring ───────────────────────

  const allNodeIds = new Set();
  for (const f of flows) {
    allNodeIds.add(f.source);
    allNodeIds.add(f.target);
  }
  const nodeIds = [...allNodeIds];
  const capitalMagnets = weightedPageRank(nodeIds, flows);

  // Enrich capital magnets with names and types
  const capitalMagnetList = Object.entries(capitalMagnets)
    .map(([id, score]) => {
      const isCompany = id.startsWith('c_');
      const company = companyById[id];
      const fund = fundById[id];
      const totalAttracted = flows
        .filter(f => f.target === id)
        .reduce((sum, f) => sum + f.value, 0);

      return {
        id,
        name: company?.name || fund?.name || id,
        type: isCompany ? 'company' : 'fund',
        score: Math.round(score * 100) / 100,
        totalAttracted: Math.round(totalAttracted * 100) / 100,
        sectors: company?.sectors || [],
        region: company?.region || 'unknown',
      };
    })
    .filter(m => m.type === 'company')
    .sort((a, b) => b.score - a.score);

  // ── 3. Source-sink analysis ───────────────────────────────────────────────

  const sourceSink = computeSourceSink(nodeIds, flows, fundById, companyById);

  return {
    flows: sankeyFlows,
    rawFlows: flows,
    capitalMagnets: capitalMagnetList,
    sourceSink,
    byRegion,
    bySector,
    byStage,
  };
}

// ── Weighted PageRank ─────────────────────────────────────────────────────────

export function weightedPageRank(nodeIds, edges, { damping = 0.85, iterations = 40 } = {}) {
  const N = nodeIds.length;
  if (N === 0) return {};

  const idx = {};
  nodeIds.forEach((id, i) => { idx[id] = i; });

  // Build weighted adjacency: outgoing weights per node
  const outWeights = new Float64Array(N).fill(0);
  const edgeList = [];

  for (const e of edges) {
    const si = idx[e.source];
    const ti = idx[e.target];
    if (si === undefined || ti === undefined || si === ti) continue;
    const w = Math.max(e.value || 0, 0.01); // minimum weight to avoid zeros
    outWeights[si] += w;
    edgeList.push({ si, ti, w });
  }

  // Power iteration
  let pr = new Float64Array(N).fill(1 / N);
  for (let iter = 0; iter < iterations; iter++) {
    const next = new Float64Array(N).fill((1 - damping) / N);
    for (let i = 0; i < N; i++) {
      if (outWeights[i] === 0) {
        // Dangling node: distribute evenly
        for (let j = 0; j < N; j++) next[j] += (damping * pr[i]) / N;
      }
    }
    for (const { si, ti, w } of edgeList) {
      next[ti] += damping * pr[si] * (w / outWeights[si]);
    }
    pr = next;
  }

  // Normalize to 0-100
  const prMax = Math.max(...pr);
  const prMin = Math.min(...pr);
  const range = prMax - prMin || 1;
  const result = {};
  nodeIds.forEach((id, i) => {
    result[id] = Math.round(((pr[i] - prMin) / range) * 100);
  });

  return result;
}

// ── Source-Sink Analysis ──────────────────────────────────────────────────────

function computeSourceSink(nodeIds, flows, fundById, companyById) {
  const deployed = {};
  const attracted = {};

  for (const f of flows) {
    deployed[f.source] = (deployed[f.source] || 0) + f.value;
    attracted[f.target] = (attracted[f.target] || 0) + f.value;
  }

  const results = [];
  const seen = new Set();

  for (const id of nodeIds) {
    if (seen.has(id)) continue;
    seen.add(id);

    const dep = deployed[id] || 0;
    const att = attracted[id] || 0;
    if (dep === 0 && att === 0) continue;

    const netFlow = dep - att;
    const fund = fundById[id];
    const company = companyById[id];

    results.push({
      id,
      name: fund?.name || company?.name || id,
      type: fund ? 'fund' : (company ? 'company' : 'external'),
      deployed: Math.round(dep * 100) / 100,
      attracted: Math.round(att * 100) / 100,
      netFlow: Math.round(netFlow * 100) / 100,
      category: netFlow > 0 ? 'net_deployer' : 'net_attractor',
    });
  }

  return results.sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow));
}
