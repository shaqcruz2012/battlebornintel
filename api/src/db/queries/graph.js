import pool from '../pool.js';
import { logger } from '../../logger.js';
import { expandRegion } from '../../utils/regionMapping.js';

export async function getGraphData({ nodeTypes = [], yearMax = 2026, region } = {}) {
  const nodes = [];
  const nodeSet = new Set();

  const add = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
  };

  // Determine which tables are needed up-front so all queries run in a single
  // parallel batch (eliminates sequential round-trips to the database).
  const needCompanies = ['company', 'sector', 'region'].some(t => nodeTypes.includes(t))
    || (nodeTypes.includes('fund') || nodeTypes.includes('exchange'));
  const needPeople = nodeTypes.includes('person');
  const needPrograms = nodeTypes.includes('program');

  // Build conditional SQL strings before launching the parallel batch
  const regionFilter = region && region !== 'all';
  const expandedRegions = expandRegion(region);

  let companySql = `SELECT id, name, stage, funding_m, momentum, employees, city, region, sectors, eligible, founded FROM companies`;
  const companyParams = [];
  if (needCompanies && regionFilter && expandedRegions) {
    if (expandedRegions.length === 1) {
      companySql += ` WHERE region = $1`;
      companyParams.push(expandedRegions[0]);
    } else {
      companySql += ` WHERE region = ANY($1)`;
      companyParams.push(expandedRegions);
    }
  }

  const accelSql = nodeTypes.includes('accelerator')
    ? `SELECT id, name, accel_type, city, region, founded FROM accelerators${regionFilter && expandedRegions ? (expandedRegions.length === 1 ? ` WHERE region = $1` : ` WHERE region = ANY($1)`) : ''}`
    : null;
  const ecoSql = nodeTypes.includes('ecosystem')
    ? `SELECT id, name, entity_type, city, region FROM ecosystem_orgs${regionFilter && expandedRegions ? (expandedRegions.length === 1 ? ` WHERE region = $1` : ` WHERE region = ANY($1)`) : ''}`
    : null;
  const regionParam = expandedRegions ? (expandedRegions.length === 1 ? expandedRegions[0] : expandedRegions) : null;

  // All DB queries run in parallel — no sequential awaits
  // note column included: contains dollar amounts for edge labels
  // event_year IS NULL check removed: all rows have an event_year value so the
  // simpler predicate event_year <= $1 enables the covering index path.
  const [
    companyRows,
    peopleRows,
    programRows,
    fundRows,
    externalRows,
    accelRows,
    ecoRows,
    edgeRows,
    listingRows,
    exchangeRows,
  ] = await Promise.all([
    needCompanies
      ? pool.query(companySql, companyParams).then(r => r.rows)
      : [],
    // note column excluded: free-text blob not needed for graph visualization
    needPeople
      ? pool.query(`SELECT id, name, role, company_id FROM people`).then(r => r.rows)
      : [],
    // Programs always loaded when requested so qualifies_for / fund_opportunity
    // edges resolve to named nodes instead of 'unknown'.
    needPrograms
      ? pool.query(`SELECT id, slug, name, program_type FROM programs ORDER BY id`).then(r => r.rows)
      : [],
    nodeTypes.includes('fund')
      ? pool.query(`SELECT id, name, fund_type FROM graph_funds`).then(r => r.rows)
      : [],
    // note excluded: free-text not needed for graph visualization
    nodeTypes.includes('external')
      ? pool.query(`SELECT id, name, entity_type FROM externals`).then(r => r.rows)
      : [],
    // note columns excluded from accelerators and ecosystem_orgs — free-text
    // not needed for graph visualization and adds unnecessary payload weight
    accelSql
      ? pool.query(accelSql, regionFilter && regionParam ? [regionParam] : []).then(r => r.rows)
      : [],
    ecoSql
      ? pool.query(ecoSql, regionFilter && regionParam ? [regionParam] : []).then(r => r.rows)
      : [],
    pool.query(
      `SELECT source_id, target_id, rel, event_year, note, source_url, matching_score, edge_category, edge_style, edge_color, edge_opacity FROM graph_edges WHERE event_year <= $1`,
      [yearMax]
    ).then(r => r.rows),
    nodeTypes.includes('exchange')
      ? pool.query(`SELECT company_id, exchange, ticker FROM listings`).then(r => r.rows)
      : [],
    nodeTypes.includes('exchange')
      ? pool.query(`SELECT DISTINCT exchange FROM listings`).then(r => r.rows)
      : [],
  ]);

  // Build nodes from loaded data
  if (nodeTypes.includes('company')) {
    for (const c of companyRows) {
      add(`c_${c.id}`, c.name, 'company', {
        stage: c.stage,
        funding: parseFloat(c.funding_m),
        momentum: c.momentum,
        employees: c.employees,
        city: c.city,
        region: c.region,
        sector: c.sectors,
        eligible: c.eligible,
        founded: c.founded,
      });
    }
  }

  if (nodeTypes.includes('fund')) {
    for (const f of fundRows) {
      add(`f_${f.id}`, f.name, 'fund', { fundType: f.fund_type });
    }
  }

  if (nodeTypes.includes('person')) {
    for (const p of peopleRows) {
      add(p.id, p.name, 'person', {
        role: p.role,
        companyId: p.company_id,
      });
    }
  }

  if (nodeTypes.includes('external')) {
    for (const x of externalRows) {
      add(x.id, x.name, 'external', { etype: x.entity_type });
    }
  }

  if (nodeTypes.includes('program')) {
    for (const p of programRows) {
      add(`p_${p.id}`, p.name, 'program', {
        slug: p.slug,
        programType: p.program_type,
      });
    }
  }

  if (nodeTypes.includes('accelerator')) {
    for (const a of accelRows) {
      add(a.id, a.name, 'accelerator', {
        atype: a.accel_type,
        city: a.city,
        region: a.region,
        founded: a.founded,
      });
    }
  }

  if (nodeTypes.includes('ecosystem')) {
    for (const o of ecoRows) {
      add(o.id, o.name, 'ecosystem', {
        etype: o.entity_type,
        city: o.city,
        region: o.region,
      });
    }
  }

  // Derived sector nodes
  if (nodeTypes.includes('sector')) {
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
  if (nodeTypes.includes('region')) {
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
  if (nodeTypes.includes('exchange')) {
    for (const r of exchangeRows) {
      add(`ex_${r.exchange}`, r.exchange, 'exchange');
    }
  }

  // Map ID prefix → node type so we can decide whether a missing endpoint
  // belongs to a type that was simply not requested (in which case we drop
  // the edge cleanly) vs. a genuinely unknown node (in which case we add a
  // placeholder so the renderer can still draw the dangling edge).
  //
  // Prefixes used in graph_edges:
  //   c_  → company      f_  → fund         p_  → program
  //   a_  → accelerator  e_  → ecosystem     x_  → external
  //   i_  → external     u_  → external      v_  → external
  //   gov_→ external     s_  → sector        r_  → region
  //   ex_ → exchange
  const nodeTypeSet = new Set(nodeTypes);
  const typeFromId = (id) => {
    const pfx = id.split('_')[0];
    switch (pfx) {
      case 'c':   return 'company';
      case 'f':   return 'fund';
      // p_ prefix is shared: p_<digit> = program node, p_<alpha> = person node
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
      default:    return null;   // truly unknown prefix
    }
  };

  // Explicit edges (from graph_edges table)
  // Include an edge when at least one endpoint is already loaded.
  // If the other endpoint is missing:
  //   • and its type is known but was not requested → drop the edge silently
  //     (avoids "unknown" placeholder nodes for excluded node types)
  //   • and its type is genuinely unknown → add a minimal placeholder so the
  //     renderer can still draw the dangling edge
  const edges = [];
  let placeholderCount = 0;
  for (const e of edgeRows) {
    const hasSource = nodeSet.has(e.source_id);
    const hasTarget = nodeSet.has(e.target_id);
    if (!hasSource && !hasTarget) continue;

    // Determine whether each missing side should produce a placeholder or
    // cause the entire edge to be skipped.
    if (!hasSource) {
      const inferredType = typeFromId(e.source_id);
      if (inferredType !== null && !nodeTypeSet.has(inferredType)) continue; // excluded type — drop edge
      add(e.source_id, e.source_id, 'unknown');
      placeholderCount++;
    }
    if (!hasTarget) {
      const inferredType = typeFromId(e.target_id);
      if (inferredType !== null && !nodeTypeSet.has(inferredType)) continue; // excluded type — drop edge
      add(e.target_id, e.target_id, 'unknown');
      placeholderCount++;
    }

    const edge = {
      source: e.source_id,
      target: e.target_id,
      rel: e.rel,
      y: e.event_year,
    };
    // Include note when present (contains dollar amounts and context for edge labels)
    if (e.note) edge.note = e.note;
    // Include source_url for evidence/source links in sidebar
    if (e.source_url) edge.source_url = e.source_url;
    // Include matching score for opportunity edges
    if (e.matching_score != null) edge.matching_score = parseFloat(e.matching_score);
    // Include visual metadata only when present to keep payload lean
    if (e.edge_category && e.edge_category !== 'historical') {
      edge.category = e.edge_category;
    }
    if (e.edge_style) edge.style = e.edge_style;
    if (e.edge_color) edge.color = e.edge_color;
    if (e.edge_opacity != null) edge.opacity = e.edge_opacity;
    edges.push(edge);
  }
  if (placeholderCount > 0) {
    logger.info(`[graph] Added ${placeholderCount} placeholder nodes for edges with missing endpoints`);
  }

  // Derived edges — all from already-loaded data, no extra queries
  if (nodeTypes.includes('company') && nodeTypes.includes('fund')) {
    for (const c of companyRows) {
      for (const f of c.eligible || []) {
        if (nodeSet.has(`f_${f}`)) {
          edges.push({ source: `c_${c.id}`, target: `f_${f}`, rel: 'eligible_for' });
        }
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('sector')) {
    for (const c of companyRows) {
      for (const s of c.sectors || []) {
        if (nodeSet.has(`s_${s}`)) {
          edges.push({ source: `c_${c.id}`, target: `s_${s}`, rel: 'operates_in' });
        }
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('region')) {
    for (const c of companyRows) {
      if (nodeSet.has(`r_${c.region}`)) {
        edges.push({ source: `c_${c.id}`, target: `r_${c.region}`, rel: 'headquartered_in' });
      }
    }
  }

  if (nodeTypes.includes('person')) {
    for (const p of peopleRows) {
      if (p.company_id && nodeSet.has(`c_${p.company_id}`)) {
        edges.push({ source: p.id, target: `c_${p.company_id}`, rel: 'founder_of' });
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('exchange')) {
    for (const l of listingRows) {
      if (nodeSet.has(`c_${l.company_id}`) && nodeSet.has(`ex_${l.exchange}`)) {
        edges.push({ source: `c_${l.company_id}`, target: `ex_${l.exchange}`, rel: 'listed_on', ticker: l.ticker });
      }
    }
  }

  return { nodes, edges };
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
    // Table may not exist or be empty — return empty metrics so the
    // caller can fall back to live computation gracefully.
    logger.error('[graph] graph_metrics_cache query failed:', err.message);
    return { pagerank: {}, betweenness: {}, communities: {}, coInvestmentDensity: {}, founderMobility: {}, structuralHole: {} };
  }

  if (!rows || rows.length === 0) {
    return { pagerank: {}, betweenness: {}, communities: {}, coInvestmentDensity: {}, founderMobility: {}, structuralHole: {} };
  }

  const pagerank = {};
  const betweenness = {};
  const communities = {};

  // The cache stores values as integers in the 0–100 range (legacy schema uses INTEGER columns).
  // Normalize back to 0–1 floats so the frontend always receives a consistent scale.
  const prValues = rows.map((r) => r.pagerank ?? 0);
  const bcValues = rows.map((r) => r.betweenness ?? 0);
  const prMax = Math.max(...prValues, 1);
  const bcMax = Math.max(...bcValues, 1);

  for (const r of rows) {
    pagerank[r.node_id] = (r.pagerank ?? 0) / prMax;
    betweenness[r.node_id] = (r.betweenness ?? 0) / bcMax;
    communities[r.node_id] = r.community_id;
  }

  // Advanced network features are computed live (not stored in the cache table),
  // so return empty containers here. The /api/graph/metrics endpoint falls back
  // to live computation when the cache is empty, which populates these fully.
  return { pagerank, betweenness, communities, coInvestmentDensity: {}, founderMobility: {}, structuralHole: {} };
}
