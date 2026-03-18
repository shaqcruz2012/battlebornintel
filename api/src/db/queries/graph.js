import pool from '../pool.js';

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
export async function getGraphData({ nodeTypes = [], yearMax = 2026, region } = {}) {
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

  // ── Step 1: Fetch ALL edges in one query ─────────────────────────────────
  const edgeRows = (await pool.query(
    `SELECT source_id, target_id, rel, event_year, event_date, note, matching_score,
            edge_category, edge_style, edge_color, edge_opacity
     FROM graph_edges WHERE event_year <= $1`,
    [yearMax]
  )).rows;

  // ── Step 2: Collect referenced node IDs & classify by prefix ─────────────
  const referencedIds = new Set();
  for (const e of edgeRows) {
    referencedIds.add(e.source_id);
    referencedIds.add(e.target_id);
  }

  // Map ID prefix → node type
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

  // Partition IDs by table, filtering to only requested node types
  const companyIds = [];
  const fundIds = [];
  const personIds = [];
  const externalIds = [];
  const acceleratorIds = [];
  const ecosystemIds = [];
  const programIds = [];

  // Also track which IDs belong to excluded types (so we can skip edges to them)
  for (const id of referencedIds) {
    const ntype = typeFromId(id);
    if (ntype === null) continue;
    // Only resolve nodes whose type was requested
    switch (ntype) {
      case 'company':     if (nodeTypeSet.has('company') || nodeTypeSet.has('sector') || nodeTypeSet.has('region'))  companyIds.push(id.slice(2)); break;
      case 'fund':        if (nodeTypeSet.has('fund'))        fundIds.push(id.slice(2)); break;
      case 'person':      if (nodeTypeSet.has('person'))      personIds.push(id); break;
      case 'program':     if (nodeTypeSet.has('program'))     programIds.push(id.slice(2)); break;
      case 'external':    if (nodeTypeSet.has('external'))    externalIds.push(id); break;
      case 'accelerator': if (nodeTypeSet.has('accelerator')) acceleratorIds.push(id); break;
      case 'ecosystem':   if (nodeTypeSet.has('ecosystem'))   ecosystemIds.push(id); break;
      // sector, region, exchange are derived — no DB lookup needed
    }
  }

  // ── Step 3: Batch-resolve nodes in parallel ──────────────────────────────
  // Only query tables that have IDs to resolve
  const queries = [];

  if (companyIds.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [companyIds, region] : [companyIds];
    queries.push(
      pool.query(
        `SELECT id, name, stage, funding_m, momentum, employees, city, region, sectors, eligible, founded
         FROM companies WHERE id = ANY($1::int[])${regionClause}`,
        params
      ).then(r => ({ type: 'company', rows: r.rows }))
    );
  }

  if (fundIds.length > 0) {
    queries.push(
      pool.query(
        `SELECT id, name, fund_type FROM graph_funds WHERE id = ANY($1::int[])`,
        [fundIds]
      ).then(r => ({ type: 'fund', rows: r.rows }))
    );
  }

  if (personIds.length > 0) {
    queries.push(
      pool.query(
        `SELECT id, name, role, company_id FROM people WHERE id = ANY($1::text[])`,
        [personIds]
      ).then(r => ({ type: 'person', rows: r.rows }))
    );
  }

  if (programIds.length > 0) {
    queries.push(
      pool.query(
        `SELECT id, slug, name, program_type FROM programs WHERE id = ANY($1::int[])`,
        [programIds]
      ).then(r => ({ type: 'program', rows: r.rows }))
    );
  }

  if (externalIds.length > 0) {
    queries.push(
      pool.query(
        `SELECT id, name, entity_type FROM externals WHERE id = ANY($1::text[])`,
        [externalIds]
      ).then(r => ({ type: 'external', rows: r.rows }))
    );
  }

  if (acceleratorIds.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [acceleratorIds, region] : [acceleratorIds];
    queries.push(
      pool.query(
        `SELECT id, name, accel_type, city, region, founded FROM accelerators WHERE id = ANY($1::text[])${regionClause}`,
        params
      ).then(r => ({ type: 'accelerator', rows: r.rows }))
    );
  }

  if (ecosystemIds.length > 0) {
    const regionClause = regionFilter ? ` AND region = $2` : '';
    const params = regionFilter ? [ecosystemIds, region] : [ecosystemIds];
    queries.push(
      pool.query(
        `SELECT id, name, entity_type, city, region FROM ecosystem_orgs WHERE id = ANY($1::text[])${regionClause}`,
        params
      ).then(r => ({ type: 'ecosystem', rows: r.rows }))
    );
  }

  // Exchange data (only if requested)
  if (nodeTypeSet.has('exchange')) {
    queries.push(
      pool.query(`SELECT company_id, exchange, ticker FROM listings`).then(r => ({ type: 'listing', rows: r.rows }))
    );
    queries.push(
      pool.query(`SELECT DISTINCT exchange FROM listings`).then(r => ({ type: 'exchange', rows: r.rows }))
    );
  }

  const results = await Promise.all(queries);

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

  // ── Step 4: Build nodes from resolved data ───────────────────────────────
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
        eligible: c.eligible,
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
    if (e.matching_score != null) edge.matching_score = parseFloat(e.matching_score);
    if (e.edge_category && e.edge_category !== 'historical') {
      edge.category = e.edge_category;
    }
    if (e.edge_style) edge.style = e.edge_style;
    if (e.edge_color) edge.color = e.edge_color;
    if (e.edge_opacity != null) edge.opacity = e.edge_opacity;
    edges.push(edge);
  }
  if (placeholderCount > 0) {
    console.log(`[graph] Added ${placeholderCount} placeholder nodes for edges with missing endpoints`);
  }

  // ── Step 6: Derived edges (from in-memory data, no extra queries) ────────
  if (nodeTypeSet.has('company') && nodeTypeSet.has('fund')) {
    for (const c of companyRows) {
      for (const f of c.eligible || []) {
        if (nodeSet.has(`f_${f}`)) {
          edges.push({ source: `c_${c.id}`, target: `f_${f}`, rel: 'eligible_for' });
        }
      }
    }
  }

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
    return { pagerank: {}, betweenness: {}, communities: {} };
  }

  if (!rows || rows.length === 0) {
    return { pagerank: {}, betweenness: {}, communities: {} };
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

  return { pagerank, betweenness, communities };
}
