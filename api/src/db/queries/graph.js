import pool from '../pool.js';
import { resolveNodesFromRegistry } from './entities.js';

/**
 * Optimized graph data loader.
 *
 * Strategy: edge-first, lazy node resolution.
 *   1. Fetch all edges in a single query (fast — graph_edges is a narrow table).
 *   2. Collect unique node IDs referenced by those edges.
 *   3. Batch-resolve nodes from all entity tables using a single UNION ALL query
 *      so we only load nodes that are actually connected (no wasted rows).
 *   4. Build derived sector/region/exchange nodes from already-loaded company data.
 *   5. Produce derived edges (eligible_for, operates_in, etc.) from in-memory data.
 */
export async function getGraphData({ nodeTypes = [], yearMax = 2026, region, includeOpportunities = false } = {}) {
  const nodes = [];
  const nodeSet = new Set();

  const add = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
  };

  const regionFilter = region && region !== 'all';
  const nodeTypeSet = new Set(nodeTypes);

  // ── Step 1: Fetch edges ──────────────────────────────────────────────────
  // By default, exclude opportunity edges (fund_opportunity, qualifies_for, potential_lp)
  // to keep the graph clean. Include them only when the Opportunities toggle is ON.
  const yearParam = parseInt(yearMax, 10) || 2026;
  const edgeQuery = includeOpportunities
    ? `SELECT source_id, target_id, rel, event_year, event_date, note, matching_score,
              edge_category, edge_style, edge_color, edge_opacity, source_url
       FROM graph_edges WHERE event_year <= $1::int`
    : `SELECT source_id, target_id, rel, event_year, event_date, note, matching_score,
              edge_category, edge_style, edge_color, edge_opacity, source_url
       FROM graph_edges WHERE event_year <= $1::int
         AND (edge_category IS NULL OR edge_category != 'opportunity')`;
  const edgeRows = (await pool.query(edgeQuery, [yearParam])).rows;

  // ── Step 2: Collect referenced node IDs ──────────────────────────────────
  const referencedIds = new Set();
  for (const e of edgeRows) {
    referencedIds.add(e.source_id);
    referencedIds.add(e.target_id);
  }

  // Map ID prefix → node type (still needed for filtering and derived nodes)
  const typeFromId = (id) => {
    const pfx = id.split('_')[0];
    switch (pfx) {
      case 'c':   return 'company';
      case 'f':   return 'fund';
      case 'p':   return /^p_\d/.test(id) ? 'program' : 'person';
      case 'a':   return 'accelerator';
      case 'e':   return 'ecosystem';
      case 'x':
      case 'i':
      case 'u':
      case 'v':
      case 'gov': return 'external';
      case 's':   return 'sector';
      case 'r':   return 'region';
      case 'ex':  return 'exchange';
      default:    return null;
    }
  };

  // Filter to only IDs whose type was requested
  const idsToResolve = [];
  const companyIdsForDetail = [];
  for (const id of referencedIds) {
    const ntype = typeFromId(id);
    if (ntype === null) continue;
    if (ntype === 'sector' || ntype === 'region' || ntype === 'exchange') continue; // derived
    if (ntype === 'company' && (nodeTypeSet.has('company') || nodeTypeSet.has('sector') || nodeTypeSet.has('region'))) {
      idsToResolve.push(id);
      companyIdsForDetail.push(id.slice(2));
    } else if (nodeTypeSet.has(ntype)) {
      idsToResolve.push(id);
    }
  }

  // ── Step 3: Resolve nodes from unified entity_registry + detail queries ──
  const detailQueries = [];

  // Company detail query (D3 needs funding, momentum, stage, etc. for sizing/coloring)
  if (companyIdsForDetail.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [companyIdsForDetail, region] : [companyIdsForDetail];
    detailQueries.push(
      pool.query(
        `SELECT id, name, stage, funding_m, momentum, employees, city, region, sectors, eligible, founded
         FROM companies WHERE id = ANY($1::int[])${regionClause}`,
        params
      ).then(r => ({ type: 'company', rows: r.rows }))
    );
  }

  // Fund detail (fund_type for legend)
  const fundIdsForDetail = idsToResolve.filter(id => id.startsWith('f_')).map(id => id.slice(2));
  if (fundIdsForDetail.length > 0) {
    detailQueries.push(
      pool.query(`SELECT id, name, fund_type FROM graph_funds WHERE id = ANY($1::text[])`, [fundIdsForDetail])
        .then(r => ({ type: 'fund', rows: r.rows }))
    );
  }

  // Person detail (role, company_id for derived edges)
  const personIdsForDetail = idsToResolve.filter(id => {
    const pfx = id.split('_')[0];
    return pfx === 'p' && !/^p_\d/.test(id);
  });
  if (personIdsForDetail.length > 0) {
    detailQueries.push(
      pool.query(`SELECT id, name, role, company_id FROM people WHERE id = ANY($1::text[])`, [personIdsForDetail])
        .then(r => ({ type: 'person', rows: r.rows }))
    );
  }

  // Program detail (slug, program_type)
  const programIdsForDetail = idsToResolve.filter(id => /^p_\d/.test(id)).map(id => id.slice(2));
  if (programIdsForDetail.length > 0) {
    detailQueries.push(
      pool.query(`SELECT id, slug, name, program_type FROM programs WHERE id = ANY($1::int[])`, [programIdsForDetail])
        .then(r => ({ type: 'program', rows: r.rows }))
    );
  }

  // External detail (entity_type)
  const externalIdsForDetail = idsToResolve.filter(id => {
    const pfx = id.split('_')[0];
    return ['x', 'i', 'u', 'v', 'gov'].includes(pfx);
  });
  if (externalIdsForDetail.length > 0) {
    detailQueries.push(
      pool.query(`SELECT id, name, entity_type FROM externals WHERE id = ANY($1::text[])`, [externalIdsForDetail])
        .then(r => ({ type: 'external', rows: r.rows }))
    );
  }

  // Accelerator detail (accel_type, city, region, founded)
  const accelIdsForDetail = idsToResolve.filter(id => id.startsWith('a_'));
  if (accelIdsForDetail.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [accelIdsForDetail, region] : [accelIdsForDetail];
    detailQueries.push(
      pool.query(
        `SELECT id, name, accel_type, city, region, founded FROM accelerators WHERE id = ANY($1::text[])${regionClause}`,
        params
      ).then(r => ({ type: 'accelerator', rows: r.rows }))
    );
  }

  // Ecosystem detail (entity_type, city, region)
  const ecoIdsForDetail = idsToResolve.filter(id => id.startsWith('e_'));
  if (ecoIdsForDetail.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [ecoIdsForDetail, region] : [ecoIdsForDetail];
    detailQueries.push(
      pool.query(
        `SELECT id, name, entity_type, city, region FROM ecosystem_orgs WHERE id = ANY($1::text[])${regionClause}`,
        params
      ).then(r => ({ type: 'ecosystem', rows: r.rows }))
    );
  }

  // Exchange data (only if requested)
  if (nodeTypeSet.has('exchange')) {
    detailQueries.push(
      pool.query(`SELECT company_id, exchange, ticker FROM listings`).then(r => ({ type: 'listing', rows: r.rows }))
    );
    detailQueries.push(
      pool.query(`SELECT DISTINCT exchange FROM listings`).then(r => ({ type: 'exchange', rows: r.rows }))
    );
  }

  const results = await Promise.all(detailQueries);

  // Index results by type for easy access
  const resultsByType = {};
  for (const r of results) {
    if (resultsByType[r.type]) {
      resultsByType[r.type] = resultsByType[r.type].concat(r.rows);
    } else {
      resultsByType[r.type] = r.rows;
    }
  }

  const companyRows = resultsByType.company || [];
  const fundRows = resultsByType.fund || [];
  const peopleRows = resultsByType.person || [];
  const programRows = resultsByType.program || [];
  const externalRows = resultsByType.external || [];
  const accelRows = resultsByType.accelerator || [];
  const ecoRows = resultsByType.ecosystem || [];
  const listingRows = resultsByType.listing || [];
  const exchangeRows = resultsByType.exchange || [];

  // ── Step 4: Build nodes from detail data ─────────────────────────────────
  if (nodeTypeSet.has('company')) {
    for (const c of companyRows) {
      add(`c_${c.id}`, c.name, 'company', {
        stage: c.stage,
        funding: parseFloat(c.funding_m),
        momentum: c.momentum,
        employees: c.employees,
        city: c.city,
        region: c.region,
        sector: c.sectors,
        founded: c.founded,
      });
    }
  }

  if (nodeTypeSet.has('fund')) {
    for (const f of fundRows) {
      add(`f_${f.id}`, f.name, 'fund', { fundType: f.fund_type });
    }
  }

  if (nodeTypeSet.has('person')) {
    for (const p of peopleRows) {
      add(p.id, p.name, 'person', {
        role: p.role,
        companyId: p.company_id,
      });
    }
  }

  if (nodeTypeSet.has('external')) {
    for (const x of externalRows) {
      add(x.id, x.name, 'external', { etype: x.entity_type });
    }
  }

  if (nodeTypeSet.has('program')) {
    for (const p of programRows) {
      add(`p_${p.id}`, p.name, 'program', {
        slug: p.slug,
        programType: p.program_type,
      });
    }
  }

  if (nodeTypeSet.has('accelerator')) {
    for (const a of accelRows) {
      add(a.id, a.name, 'accelerator', {
        atype: a.accel_type,
        city: a.city,
        region: a.region,
        founded: a.founded,
      });
    }
  }

  if (nodeTypeSet.has('ecosystem')) {
    for (const o of ecoRows) {
      add(o.id, o.name, 'ecosystem', {
        etype: o.entity_type,
        city: o.city,
        region: o.region,
      });
    }
  }

  // Derived sector nodes
  if (nodeTypeSet.has('sector')) {
    const sec = {};
    for (const c of companyRows) {
      for (const s of c.sectors || []) {
        sec[s] = (sec[s] || 0) + 1;
      }
    }
    for (const [s, n] of Object.entries(sec)) {
      if (n >= 2) add(`s_${s}`, s, 'sector', { count: n });
    }
  }

  // Derived region nodes
  if (nodeTypeSet.has('region')) {
    const names = {
      las_vegas: 'Las Vegas',
      reno: 'Reno-Sparks',
      henderson: 'Henderson',
    };
    const seen = new Set();
    for (const c of companyRows) {
      if (c.region && !seen.has(c.region)) {
        seen.add(c.region);
        add(`r_${c.region}`, names[c.region] || c.region, 'region');
      }
    }
  }

  // Exchange nodes
  if (nodeTypeSet.has('exchange')) {
    for (const r of exchangeRows) {
      add(`ex_${r.exchange}`, r.exchange, 'exchange');
    }
  }

  // ── Step 5: Build edge array with placeholder handling ───────────────────
  const edges = [];
  let placeholderCount = 0;
  for (const e of edgeRows) {
    const hasSource = nodeSet.has(e.source_id);
    const hasTarget = nodeSet.has(e.target_id);
    if (!hasSource && !hasTarget) continue;

    if (!hasSource) {
      const inferredType = typeFromId(e.source_id);
      if (inferredType !== null && !nodeTypeSet.has(inferredType)) continue;
      add(e.source_id, e.source_id, 'unknown');
      placeholderCount++;
    }
    if (!hasTarget) {
      const inferredType = typeFromId(e.target_id);
      if (inferredType !== null && !nodeTypeSet.has(inferredType)) continue;
      add(e.target_id, e.target_id, 'unknown');
      placeholderCount++;
    }

    const edge = {
      source: e.source_id,
      target: e.target_id,
      rel: e.rel,
      y: e.event_year,
    };
    if (e.event_date) edge.event_date = e.event_date;
    if (e.note) edge.note = e.note;
    if (e.source_url) edge.source_url = e.source_url;
    if (e.matching_score != null) edge.matching_score = parseFloat(e.matching_score);
    if (e.edge_category) {
      edge.category = e.edge_category;
    }
    if (e.edge_style) edge.style = e.edge_style;
    if (e.edge_color) edge.color = e.edge_color;
    if (e.edge_opacity != null) edge.opacity = e.edge_opacity;
    edges.push(edge);
  }
  // placeholderCount tracked for diagnostics; omitted from production logs

  // ── Step 6: Derived edges (from in-memory data, no extra queries) ────────
  // NOTE: eligible_for edges removed — replaced by scored fund_opportunity edges
  // stored in graph_edges with matching_score and matching_criteria (migration 125+).
  // The fund_opportunity edges are loaded in Step 1 with all other graph_edges.

  if (nodeTypeSet.has('company') && nodeTypeSet.has('sector')) {
    for (const c of companyRows) {
      for (const s of c.sectors || []) {
        if (nodeSet.has(`s_${s}`)) {
          edges.push({ source: `c_${c.id}`, target: `s_${s}`, rel: 'operates_in' });
        }
      }
    }
  }

  if (nodeTypeSet.has('company') && nodeTypeSet.has('region')) {
    for (const c of companyRows) {
      if (nodeSet.has(`r_${c.region}`)) {
        edges.push({ source: `c_${c.id}`, target: `r_${c.region}`, rel: 'headquartered_in' });
      }
    }
  }

  if (nodeTypeSet.has('person')) {
    for (const p of peopleRows) {
      if (p.company_id && nodeSet.has(`c_${p.company_id}`)) {
        edges.push({ source: p.id, target: `c_${p.company_id}`, rel: 'founder_of' });
      }
    }
  }

  if (nodeTypeSet.has('company') && nodeTypeSet.has('exchange')) {
    for (const l of listingRows) {
      if (nodeSet.has(`c_${l.company_id}`) && nodeSet.has(`ex_${l.exchange}`)) {
        edges.push({ source: `c_${l.company_id}`, target: `ex_${l.exchange}`, rel: 'listed_on', ticker: l.ticker });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Returns a lightweight version of graph data optimized for initial render.
 * Strips heavy fields from nodes (eligible, sector arrays) and edges (note, style, color, opacity).
 * Nodes get only: id, label, type + type-specific sizing fields (funding, region, stage for companies).
 * Edges get only: source, target, rel, y, category.
 * Full detail is available from the main getGraphData() endpoint on demand.
 */
export async function getGraphDataLight(params) {
  const { nodes, edges } = await getGraphData(params);

  // Strip nodes to essential render fields
  const lightNodes = nodes.map(n => {
    const light = { id: n.id, label: n.label, type: n.type };
    // Keep only fields needed for layout positioning and sizing
    if (n.type === 'company') {
      if (n.funding != null) light.funding = n.funding;
      if (n.region) light.region = n.region;
      if (n.stage) light.stage = n.stage;
      if (n.momentum != null) light.momentum = n.momentum;
      if (n.employees != null) light.employees = n.employees;
    } else if (n.type === 'fund') {
      if (n.fundType) light.fundType = n.fundType;
    } else if (n.type === 'external') {
      if (n.etype) light.etype = n.etype;
    }
    return light;
  });

  // Strip edges to render fields — keep note and source_url for tooltips
  const lightEdges = edges.map(e => {
    const light = { source: e.source, target: e.target, rel: e.rel };
    if (e.y) light.y = e.y;
    if (e.category) light.category = e.category;
    if (e.note) light.note = e.note;
    if (e.source_url) light.source_url = e.source_url;
    return light;
  });

  return { nodes: lightNodes, edges: lightEdges };
}

export async function getGraphMetrics() {
  let rows;
  try {
    const result = await pool.query(
      `SELECT node_id, pagerank, betweenness, community_id
       FROM graph_metrics_cache
       WHERE computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)`
    );
    rows = result.rows;
  } catch (err) {
    console.error('[graph] graph_metrics_cache query failed:', err.message);
    return { pagerank: {}, betweenness: {}, communities: {}, communityNames: {} };
  }

  if (!rows || rows.length === 0) {
    return { pagerank: {}, betweenness: {}, communities: {}, communityNames: {} };
  }

  const pagerank = {};
  const betweenness = {};
  const communities = {};

  const prValues = rows.map((r) => r.pagerank ?? 0);
  const bcValues = rows.map((r) => r.betweenness ?? 0);
  const prMax = Math.max(...prValues, 1);
  const bcMax = Math.max(...bcValues, 1);

  for (const r of rows) {
    pagerank[r.node_id] = (r.pagerank ?? 0) / prMax;
    betweenness[r.node_id] = (r.betweenness ?? 0) / bcMax;
    communities[r.node_id] = r.community_id;
  }

  // Build community names from node attributes
  const communityNames = await buildCommunityNames(rows, communities);

  return { pagerank, betweenness, communities, communityNames };
}

/**
 * Build descriptive community names by loading node metadata for each community's members.
 * Queries only company data (which has sector/region) to keep it lightweight.
 */
async function buildCommunityNames(metricsRows, communities) {
  // Group node IDs by community
  const communityMembers = {}; // cid -> [node_id]
  for (const r of metricsRows) {
    const cid = r.community_id;
    if (cid == null) continue;
    if (!communityMembers[cid]) communityMembers[cid] = [];
    communityMembers[cid].push(r.node_id);
  }

  // Collect all company IDs to fetch their sectors/regions
  const companyIds = [];
  const allNodeIds = new Set();
  for (const members of Object.values(communityMembers)) {
    for (const nid of members) {
      allNodeIds.add(nid);
      if (nid.startsWith('c_')) companyIds.push(nid.slice(2));
    }
  }

  // Batch-load company metadata (sector, region, name)
  const companyMap = {}; // c_<id> -> { name, sectors, region }
  if (companyIds.length > 0) {
    try {
      const result = await pool.query(
        `SELECT id, name, sectors, region FROM companies WHERE id = ANY($1::int[])`,
        [companyIds]
      );
      for (const row of result.rows) {
        companyMap[`c_${row.id}`] = {
          label: row.name,
          sectors: row.sectors || [],
          region: row.region,
          type: 'company',
        };
      }
    } catch (err) {
      console.error('[graph] company metadata query for community names failed:', err.message);
    }
  }

  // Also load fund names for hub resolution
  const fundIds = [];
  for (const nid of allNodeIds) {
    if (nid.startsWith('f_')) fundIds.push(nid.slice(2));
  }
  const fundMap = {};
  if (fundIds.length > 0) {
    try {
      const result = await pool.query(
        `SELECT id, name FROM graph_funds WHERE id = ANY($1::text[])`,
        [fundIds]
      );
      for (const row of result.rows) {
        fundMap[`f_${row.id}`] = { label: row.name, type: 'fund' };
      }
    } catch (err) {
      console.error('[graph] fund metadata query for community names failed:', err.message);
    }
  }

  const regionNames = {
    las_vegas: 'Las Vegas',
    reno: 'Reno',
    henderson: 'Henderson',
    'reno-sparks': 'Reno-Sparks',
    rural: 'Rural NV',
    statewide: 'Statewide',
  };

  function titleCase(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Build degree map from edges for hub detection (use pagerank as proxy from cache)
  const prByNode = {};
  for (const r of metricsRows) {
    prByNode[r.node_id] = r.pagerank ?? 0;
  }

  const communityNames = {};
  for (const [cid, memberIds] of Object.entries(communityMembers)) {
    // Sector frequency
    const sectorCounts = {};
    const regionCounts = {};
    const typeCounts = {};
    let hubNode = null;
    let hubPr = -1;

    for (const nid of memberIds) {
      // Determine type from prefix
      const pfx = nid.split('_')[0];
      const typeMap = { c: 'company', f: 'fund', p: 'person', a: 'accelerator', e: 'ecosystem', x: 'external', s: 'sector', r: 'region' };
      const ntype = typeMap[pfx] || 'unknown';
      typeCounts[ntype] = (typeCounts[ntype] || 0) + 1;

      // Track hub by pagerank
      const pr = prByNode[nid] || 0;
      if (pr > hubPr) {
        hubPr = pr;
        hubNode = companyMap[nid] || fundMap[nid] || { label: nid, type: ntype };
      }

      // Gather sectors/regions from company data
      const cData = companyMap[nid];
      if (cData) {
        const sectors = Array.isArray(cData.sectors) ? cData.sectors : [cData.sectors];
        sectors.forEach(s => { if (s) sectorCounts[s] = (sectorCounts[s] || 0) + 1; });
        if (cData.region) regionCounts[cData.region] = (regionCounts[cData.region] || 0) + 1;
      }
    }

    const topSector = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1])[0];
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    const parts = [];
    if (topSector && topSector[1] >= 2) parts.push(topSector[0]);
    if (topRegion && topRegion[1] >= 2) parts.push(regionNames[topRegion[0]] || titleCase(topRegion[0]));

    if (!parts.length) {
      if (hubNode && hubNode.label && hubNode.label !== hubNode.id) {
        parts.push(hubNode.label);
      } else if (topType) {
        parts.push(titleCase(topType[0]) + ' Group');
      }
    }

    communityNames[cid] = parts.length ? parts.join(' \u00B7 ') : `Cluster ${memberIds.length}`;
  }

  return communityNames;
}
