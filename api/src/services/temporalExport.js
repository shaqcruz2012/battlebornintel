import pool from '../db/pool.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// ---------------------------------------------------------------------------
// Vocabularies — must match Python export exactly
// ---------------------------------------------------------------------------
const NODE_TYPES = ['company', 'fund', 'graph_fund', 'person', 'external', 'accelerator', 'ecosystem_org'];
const STAGES = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'public'];
const REGIONS = ['reno', 'las-vegas', 'vegas', 'carson-city', 'rural', 'tahoe', 'henderson', 'other'];
const FEAT_DIM = NODE_TYPES.length + STAGES.length + REGIONS.length + 4; // 26

function oneHot(value, vocab) {
  return vocab.map(v => (v === value ? 1.0 : 0.0));
}

function normalize(value, maxVal) {
  if (!maxVal || maxVal === 0) return 0.0;
  return Math.min(Number(value || 0) / Number(maxVal), 1.0);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export async function exportTemporalData() {
  const outputDir = resolve(process.cwd(), '..', 'agents', 'data', 'temporal');
  mkdirSync(outputDir, { recursive: true });

  // 1. Build node mapping (string ID -> contiguous integer index)
  const { rows: nodeRows } = await pool.query(`
    SELECT DISTINCT id FROM (
      SELECT source_id AS id FROM graph_edges WHERE (quarantined IS NULL OR quarantined = false)
      UNION SELECT target_id AS id FROM graph_edges WHERE (quarantined IS NULL OR quarantined = false)
    ) t ORDER BY id
  `);
  const nodeMap = {};
  nodeRows.forEach((r, i) => { nodeMap[r.id] = i; });
  writeFileSync(resolve(outputDir, 'node_mapping.json'), JSON.stringify(nodeMap, null, 2));

  // 2. Fetch entity data for feature vectors
  const { rows: companyRows } = await pool.query(
    'SELECT id, slug, stage, sectors, region, funding_m, momentum, employees FROM companies'
  );
  const companies = {};
  for (const c of companyRows) {
    companies[String(c.id)] = c;
    if (c.slug) companies[c.slug] = c;
  }

  const { rows: fundRows } = await pool.query('SELECT id, fund_type, deployed_m FROM funds');
  const funds = {};
  for (const f of fundRows) funds[f.id] = f;

  const { rows: gfRows } = await pool.query('SELECT id, fund_type FROM graph_funds');
  const graphFunds = {};
  for (const gf of gfRows) graphFunds[gf.id] = gf;

  const { rows: peopleRows } = await pool.query('SELECT id FROM people');
  const people = new Set(peopleRows.map(r => r.id));

  const { rows: extRows } = await pool.query('SELECT id FROM externals');
  const externals = new Set(extRows.map(r => r.id));

  const { rows: accelRows } = await pool.query('SELECT id, region FROM accelerators');
  const accelerators = {};
  for (const a of accelRows) accelerators[a.id] = a;

  const { rows: ecoRows } = await pool.query('SELECT id, region FROM ecosystem_orgs');
  const ecosystemOrgs = {};
  for (const eo of ecoRows) ecosystemOrgs[eo.id] = eo;

  // Normalization ceilings
  const maxFunding = Math.max(...companyRows.map(c => Number(c.funding_m || 0)), 1);
  const maxMomentum = 100.0;
  const maxEmployees = Math.max(...companyRows.map(c => Number(c.employees || 0)), 1);
  const maxDeployed = Math.max(...fundRows.map(f => Number(f.deployed_m || 0)), 1);

  function classifyNode(nodeId) {
    if (nodeId in companies) return 'company';
    if (nodeId in funds) return 'fund';
    if (nodeId in graphFunds) return 'graph_fund';
    if (people.has(nodeId)) return 'person';
    if (externals.has(nodeId)) return 'external';
    if (nodeId in accelerators) return 'accelerator';
    if (nodeId in ecosystemOrgs) return 'ecosystem_org';
    if (nodeId.startsWith('f_')) return 'fund';
    if (nodeId.startsWith('p_')) return 'person';
    if (nodeId.startsWith('x_')) return 'external';
    return 'external';
  }

  function buildFeatures(nodeId) {
    const ntype = classifyNode(nodeId);
    const feats = [...oneHot(ntype, NODE_TYPES)];

    if (ntype === 'company' && nodeId in companies) {
      const c = companies[nodeId];
      feats.push(...oneHot(c.stage, STAGES));
      feats.push(...oneHot(c.region, REGIONS));
      feats.push(normalize(c.funding_m, maxFunding));
      feats.push(normalize(c.momentum, maxMomentum));
      feats.push(normalize(c.employees, maxEmployees));
      feats.push(0.0); // deployed_m placeholder
    } else if (ntype === 'fund' && nodeId in funds) {
      const fu = funds[nodeId];
      feats.push(...oneHot('', STAGES));
      feats.push(...oneHot('', REGIONS));
      feats.push(0.0, 0.0, 0.0);
      feats.push(normalize(fu.deployed_m, maxDeployed));
    } else if (ntype === 'accelerator' && nodeId in accelerators) {
      const a = accelerators[nodeId];
      feats.push(...oneHot('', STAGES));
      feats.push(...oneHot(a.region || '', REGIONS));
      feats.push(0.0, 0.0, 0.0, 0.0);
    } else if (ntype === 'ecosystem_org' && nodeId in ecosystemOrgs) {
      const eo = ecosystemOrgs[nodeId];
      feats.push(...oneHot('', STAGES));
      feats.push(...oneHot(eo.region || '', REGIONS));
      feats.push(0.0, 0.0, 0.0, 0.0);
    } else {
      // Person, external, graph_fund, or unknown — zero-pad
      feats.push(...new Array(STAGES.length + REGIONS.length + 4).fill(0.0));
    }

    return feats;
  }

  // Write node_features.csv
  const featHeader = ['node_idx', ...Array.from({ length: FEAT_DIM }, (_, i) => `feat_${i}`)];
  const nodeEntries = Object.entries(nodeMap).sort((a, b) => a[1] - b[1]);
  let nodesCsv = featHeader.join(',') + '\n';
  for (const [nodeId, idx] of nodeEntries) {
    const feats = buildFeatures(nodeId);
    nodesCsv += `${idx},${feats.join(',')}\n`;
  }
  writeFileSync(resolve(outputDir, 'node_features.csv'), nodesCsv);

  // 3. Export temporal edges
  const { rows: edges } = await pool.query(`
    SELECT source_id, target_id, rel, event_date, event_year, matching_score
    FROM graph_edges WHERE event_date IS NOT NULL
      AND (quarantined IS NULL OR quarantined = false)
    ORDER BY event_date ASC
  `);

  // Build relationship type vocabulary
  const relTypes = [...new Set(edges.map(e => e.rel))].sort();
  const relMap = {};
  relTypes.forEach((r, i) => { relMap[r] = i; });

  let edgesCsv = 'source,target,timestamp,rel_idx,matching_score\n';
  let skipped = 0;
  for (const e of edges) {
    const src = nodeMap[e.source_id];
    const tgt = nodeMap[e.target_id];
    if (src === undefined || tgt === undefined) { skipped++; continue; }
    const ts = e.event_date ? Math.floor(new Date(e.event_date).getTime() / 1000) : 0;
    edgesCsv += `${src},${tgt},${ts},${relMap[e.rel] ?? 0},${Number(e.matching_score || 0)}\n`;
  }
  writeFileSync(resolve(outputDir, 'temporal_edges.csv'), edgesCsv);

  // 4. Compute date range
  const datedEdges = edges.filter(e => e.event_date);
  const dates = datedEdges.map(e => new Date(e.event_date));
  const minDate = dates.length ? new Date(Math.min(...dates)).toISOString().split('T')[0] : null;
  const maxDate = dates.length ? new Date(Math.max(...dates)).toISOString().split('T')[0] : null;

  // 5. Metadata
  const meta = {
    num_nodes: Object.keys(nodeMap).length,
    num_edges: edges.length,
    num_edges_written: edges.length - skipped,
    num_edges_skipped: skipped,
    num_node_features: FEAT_DIM,
    num_rel_types: relTypes.length,
    rel_types: relTypes,
    rel_map: relMap,
    node_types: NODE_TYPES,
    stages: STAGES,
    regions: REGIONS,
    exported_at: new Date().toISOString(),
    date_range: { min: minDate, max: maxDate },
    export_source: 'node.js',
  };
  writeFileSync(resolve(outputDir, 'metadata.json'), JSON.stringify(meta, null, 2));

  return meta;
}

/**
 * Verify that exported data exists and return summary stats.
 */
export function verifyExport() {
  const outputDir = resolve(process.cwd(), '..', 'agents', 'data', 'temporal');
  const files = ['metadata.json', 'node_mapping.json', 'node_features.csv', 'temporal_edges.csv'];
  const result = { exists: true, files: {} };

  for (const file of files) {
    const path = resolve(outputDir, file);
    const exists = existsSync(path);
    result.files[file] = { exists };
    if (!exists) result.exists = false;
  }

  if (result.exists) {
    try {
      const meta = JSON.parse(readFileSync(resolve(outputDir, 'metadata.json'), 'utf-8'));
      result.metadata = meta;
    } catch {
      result.metadata = null;
    }
  }

  return result;
}
