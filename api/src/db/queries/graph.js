import pool from '../pool.js';

export async function getGraphData({ nodeTypes = [], yearMax = 2026, region } = {}) {
  const nodes = [];
  const nodeSet = new Set();

  const add = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
  };

  // Load companies once — reused for nodes, sectors, regions, and derived edges
  const needCompanies = ['company', 'sector', 'region'].some(t => nodeTypes.includes(t))
    || (nodeTypes.includes('fund') || nodeTypes.includes('exchange'));
  let companySql = `SELECT id, name, stage, funding_m, momentum, employees, city, region, sectors, eligible, founded FROM companies`;
  const companyParams = [];
  if (needCompanies && region && region !== 'all') {
    companySql += ` WHERE region = $1`;
    companyParams.push(region);
  }
  const companyRows = needCompanies
    ? (await pool.query(companySql, companyParams)).rows
    : [];

  // Load people once — reused for nodes and founder edges
  const needPeople = nodeTypes.includes('person');
  const peopleRows = needPeople
    ? (await pool.query(`SELECT id, name, role, note, company_id FROM people`)).rows
    : [];

  // Parallel fetch for independent tables
  const accelSql = nodeTypes.includes('accelerator')
    ? `SELECT id, name, accel_type, city, region, founded, note FROM accelerators${region && region !== 'all' ? ` WHERE region = $1` : ''}`
    : null;
  const ecoSql = nodeTypes.includes('ecosystem')
    ? `SELECT id, name, entity_type, city, region, note FROM ecosystem_orgs${region && region !== 'all' ? ` WHERE region = $1` : ''}`
    : null;

  const [fundRows, externalRows, accelRows, ecoRows, edgeRows, listingRows, exchangeRows] = await Promise.all([
    nodeTypes.includes('fund')
      ? pool.query(`SELECT id, name, fund_type FROM graph_funds`).then(r => r.rows)
      : [],
    nodeTypes.includes('external')
      ? pool.query(`SELECT id, name, entity_type, note FROM externals`).then(r => r.rows)
      : [],
    accelSql
      ? pool.query(accelSql, region && region !== 'all' ? [region] : []).then(r => r.rows)
      : [],
    ecoSql
      ? pool.query(ecoSql, region && region !== 'all' ? [region] : []).then(r => r.rows)
      : [],
    pool.query(
      `SELECT source_id, target_id, rel, note, event_year FROM graph_edges WHERE (event_year IS NULL OR event_year <= $1)`,
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
        note: p.note,
        companyId: p.company_id,
      });
    }
  }

  if (nodeTypes.includes('external')) {
    for (const x of externalRows) {
      add(x.id, x.name, 'external', { etype: x.entity_type, note: x.note });
    }
  }

  if (nodeTypes.includes('accelerator')) {
    for (const a of accelRows) {
      add(a.id, a.name, 'accelerator', {
        atype: a.accel_type,
        city: a.city,
        region: a.region,
        founded: a.founded,
        note: a.note,
      });
    }
  }

  if (nodeTypes.includes('ecosystem')) {
    for (const o of ecoRows) {
      add(o.id, o.name, 'ecosystem', {
        etype: o.entity_type,
        city: o.city,
        region: o.region,
        note: o.note,
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

  // Explicit edges (from graph_edges table)
  const edges = [];
  for (const e of edgeRows) {
    if (nodeSet.has(e.source_id) && nodeSet.has(e.target_id)) {
      edges.push({
        source: e.source_id,
        target: e.target_id,
        rel: e.rel,
        note: e.note,
        y: e.event_year,
      });
    }
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
  const { rows } = await pool.query(
    `SELECT node_id, pagerank, betweenness, community_id
     FROM graph_metrics_cache
     WHERE computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)`
  );

  const pagerank = {};
  const betweenness = {};
  const communities = {};

  for (const r of rows) {
    pagerank[r.node_id] = r.pagerank;
    betweenness[r.node_id] = r.betweenness;
    communities[r.node_id] = r.community_id;
  }

  return { pagerank, betweenness, communities };
}
