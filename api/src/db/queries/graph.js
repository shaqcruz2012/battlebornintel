import pool from '../pool.js';

export async function getGraphData({ nodeTypes = [], yearMax = 2026 } = {}) {
  const nodes = [];
  const nodeSet = new Set();

  const add = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, ...extra });
    }
  };

  // Companies
  if (nodeTypes.includes('company')) {
    const { rows } = await pool.query(`SELECT * FROM companies`);
    for (const c of rows) {
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

  // Funds
  if (nodeTypes.includes('fund')) {
    const { rows } = await pool.query(`SELECT * FROM graph_funds`);
    for (const f of rows) {
      add(`f_${f.id}`, f.name, 'fund', { fundType: f.fund_type });
    }
  }

  // People
  if (nodeTypes.includes('person')) {
    const { rows } = await pool.query(`SELECT * FROM people`);
    for (const p of rows) {
      add(p.id, p.name, 'person', {
        role: p.role,
        note: p.note,
        companyId: p.company_id,
      });
    }
  }

  // Externals
  if (nodeTypes.includes('external')) {
    const { rows } = await pool.query(`SELECT * FROM externals`);
    for (const x of rows) {
      add(x.id, x.name, 'external', { etype: x.entity_type, note: x.note });
    }
  }

  // Accelerators
  if (nodeTypes.includes('accelerator')) {
    const { rows } = await pool.query(`SELECT * FROM accelerators`);
    for (const a of rows) {
      add(a.id, a.name, 'accelerator', {
        atype: a.accel_type,
        city: a.city,
        region: a.region,
        founded: a.founded,
        note: a.note,
      });
    }
  }

  // Ecosystem orgs
  if (nodeTypes.includes('ecosystem')) {
    const { rows } = await pool.query(`SELECT * FROM ecosystem_orgs`);
    for (const o of rows) {
      add(o.id, o.name, 'ecosystem', {
        etype: o.entity_type,
        city: o.city,
        region: o.region,
        note: o.note,
      });
    }
  }

  // Sectors (derived)
  if (nodeTypes.includes('sector')) {
    const { rows } = await pool.query(`SELECT * FROM companies`);
    const sec = {};
    for (const c of rows) {
      for (const s of c.sectors || []) {
        sec[s] = (sec[s] || 0) + 1;
      }
    }
    for (const [s, n] of Object.entries(sec)) {
      if (n >= 2) add(`s_${s}`, s, 'sector', { count: n });
    }
  }

  // Regions (derived)
  if (nodeTypes.includes('region')) {
    const names = {
      las_vegas: 'Las Vegas',
      reno: 'Reno-Sparks',
      henderson: 'Henderson',
    };
    const { rows } = await pool.query(
      `SELECT DISTINCT region FROM companies`
    );
    for (const r of rows) {
      add(`r_${r.region}`, names[r.region] || r.region, 'region');
    }
  }

  // Exchanges
  if (nodeTypes.includes('exchange')) {
    const { rows } = await pool.query(
      `SELECT DISTINCT exchange FROM listings`
    );
    for (const r of rows) {
      add(`ex_${r.exchange}`, r.exchange, 'exchange');
    }
  }

  // Edges: only between nodes that exist in nodeSet
  const { rows: allEdges } = await pool.query(
    `SELECT * FROM graph_edges WHERE (event_year IS NULL OR event_year <= $1)`,
    [yearMax]
  );

  const edges = [];
  for (const e of allEdges) {
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

  // Derived edges
  if (nodeTypes.includes('company') && nodeTypes.includes('fund')) {
    const { rows: companies } = await pool.query(`SELECT * FROM companies`);
    for (const c of companies) {
      for (const f of c.eligible || []) {
        if (nodeSet.has(`f_${f}`)) {
          edges.push({
            source: `c_${c.id}`,
            target: `f_${f}`,
            rel: 'eligible_for',
          });
        }
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('sector')) {
    const { rows: companies } = await pool.query(`SELECT * FROM companies`);
    for (const c of companies) {
      for (const s of c.sectors || []) {
        if (nodeSet.has(`s_${s}`)) {
          edges.push({
            source: `c_${c.id}`,
            target: `s_${s}`,
            rel: 'operates_in',
          });
        }
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('region')) {
    const { rows: companies } = await pool.query(`SELECT * FROM companies`);
    for (const c of companies) {
      if (nodeSet.has(`r_${c.region}`)) {
        edges.push({
          source: `c_${c.id}`,
          target: `r_${c.region}`,
          rel: 'headquartered_in',
        });
      }
    }
  }

  if (nodeTypes.includes('person')) {
    const { rows: people } = await pool.query(`SELECT * FROM people`);
    for (const p of people) {
      if (p.company_id && nodeSet.has(`c_${p.company_id}`)) {
        edges.push({ source: p.id, target: `c_${p.company_id}`, rel: 'founder_of' });
      }
    }
  }

  if (nodeTypes.includes('company') && nodeTypes.includes('exchange')) {
    const { rows: listings } = await pool.query(`SELECT * FROM listings`);
    for (const l of listings) {
      if (nodeSet.has(`c_${l.company_id}`) && nodeSet.has(`ex_${l.exchange}`)) {
        edges.push({
          source: `c_${l.company_id}`,
          target: `ex_${l.exchange}`,
          rel: 'listed_on',
          ticker: l.ticker,
        });
      }
    }
  }

  return { nodes, edges };
}

export async function getGraphMetrics() {
  const { rows } = await pool.query(
    `SELECT * FROM graph_metrics_cache
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
