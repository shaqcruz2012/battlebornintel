/**
 * Triadic Closure / Link Prediction Engine
 *
 * For every open triad (A-B, B-C, no A-C), score the likelihood
 * of the A-C connection forming using a Jaccard-based heuristic
 * with sector, geography, temporal, and type-compatibility features.
 */

import pool from '../db/pool.js';
import * as cache from '../utils/cache.js';

const CACHE_KEY_ALL = 'link-predictions:all';
const CACHE_KEY_NODE = 'link-predictions:node:';
const CACHE_TTL = 300_000; // 5 minutes

const WEIGHTS = {
  jaccard: 0.35,
  sectorOverlap: 0.20,
  geoProximity: 0.15,
  recency: 0.15,
  typeCompatibility: 0.15,
};

// Type pairs that commonly connect — higher = more likely
const TYPE_COMPAT = {
  'fund|company': 1.0,
  'company|fund': 1.0,
  'fund|fund': 0.6,
  'company|company': 0.7,
  'accelerator|company': 0.9,
  'company|accelerator': 0.9,
  'ecosystem|company': 0.8,
  'company|ecosystem': 0.8,
  'person|company': 0.85,
  'company|person': 0.85,
  'external|company': 0.7,
  'company|external': 0.7,
  'fund|accelerator': 0.6,
  'accelerator|fund': 0.6,
  'fund|ecosystem': 0.5,
  'ecosystem|fund': 0.5,
  'person|fund': 0.5,
  'fund|person': 0.5,
};

/**
 * Load all edges and node metadata from the database.
 */
async function loadGraphData() {
  const [edgeResult, companyResult, fundResult, personResult, externalResult, accelResult, ecoResult] =
    await Promise.all([
      pool.query(
        `SELECT source_id, target_id, rel, event_year, event_date
         FROM graph_edges`
      ),
      pool.query(
        `SELECT id, name, stage, sectors, city, region
         FROM companies`
      ),
      pool.query(
        `SELECT id, name, fund_type FROM graph_funds`
      ),
      pool.query(
        `SELECT id, name, role FROM people`
      ),
      pool.query(
        `SELECT id, name, entity_type FROM externals`
      ),
      pool.query(
        `SELECT id, name, accel_type, city, region FROM accelerators`
      ),
      pool.query(
        `SELECT id, name, entity_type, city, region FROM ecosystem_orgs`
      ),
    ]);

  // Build node metadata map
  const nodeMeta = new Map();

  for (const c of companyResult.rows) {
    nodeMeta.set(`c_${c.id}`, {
      id: `c_${c.id}`,
      label: c.name,
      type: 'company',
      sectors: c.sectors || [],
      region: c.region || null,
      city: c.city || null,
    });
  }

  for (const f of fundResult.rows) {
    nodeMeta.set(`f_${f.id}`, {
      id: `f_${f.id}`,
      label: f.name,
      type: 'fund',
      sectors: [],
      region: null,
      city: null,
    });
  }

  for (const p of personResult.rows) {
    nodeMeta.set(p.id, {
      id: p.id,
      label: p.name,
      type: 'person',
      sectors: [],
      region: null,
      city: null,
    });
  }

  for (const x of externalResult.rows) {
    nodeMeta.set(x.id, {
      id: x.id,
      label: x.name,
      type: 'external',
      sectors: [],
      region: null,
      city: null,
    });
  }

  for (const a of accelResult.rows) {
    nodeMeta.set(a.id, {
      id: a.id,
      label: a.name,
      type: 'accelerator',
      sectors: [],
      region: a.region || null,
      city: a.city || null,
    });
  }

  for (const o of ecoResult.rows) {
    nodeMeta.set(o.id, {
      id: o.id,
      label: o.name,
      type: 'ecosystem',
      sectors: [],
      region: o.region || null,
      city: o.city || null,
    });
  }

  return { edges: edgeResult.rows, nodeMeta };
}

/**
 * Build an adjacency map and an edge-date map from raw edge rows.
 */
function buildAdjacency(edges) {
  const adj = new Map();       // nodeId -> Set of neighbor IDs
  const edgeDates = new Map(); // "a|b" -> most recent date/year

  for (const e of edges) {
    const s = e.source_id;
    const t = e.target_id;
    if (s === t) continue;

    if (!adj.has(s)) adj.set(s, new Set());
    if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s).add(t);
    adj.get(t).add(s);

    // Track most recent activity on this edge
    const pairKey = s < t ? `${s}|${t}` : `${t}|${s}`;
    const dateVal = e.event_date
      ? new Date(e.event_date).getTime()
      : e.event_year
        ? new Date(`${e.event_year}-07-01`).getTime()
        : 0;
    const existing = edgeDates.get(pairKey) || 0;
    if (dateVal > existing) edgeDates.set(pairKey, dateVal);
  }

  return { adj, edgeDates };
}

/**
 * Compute Jaccard similarity: |intersection| / |union|
 */
function jaccardScore(neighborsA, neighborsC) {
  if (neighborsA.size === 0 && neighborsC.size === 0) return 0;
  let intersection = 0;
  const smaller = neighborsA.size <= neighborsC.size ? neighborsA : neighborsC;
  const larger = neighborsA.size <= neighborsC.size ? neighborsC : neighborsA;
  for (const n of smaller) {
    if (larger.has(n)) intersection++;
  }
  const union = neighborsA.size + neighborsC.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Compute sector overlap: |shared sectors| / |union sectors|
 */
function sectorOverlapScore(metaA, metaC) {
  const sA = metaA.sectors || [];
  const sC = metaC.sectors || [];
  if (sA.length === 0 && sC.length === 0) return 0.5; // neutral if no data
  if (sA.length === 0 || sC.length === 0) return 0.2;
  const setA = new Set(sA);
  const setC = new Set(sC);
  let shared = 0;
  for (const s of setA) {
    if (setC.has(s)) shared++;
  }
  const union = new Set([...sA, ...sC]).size;
  return union === 0 ? 0 : shared / union;
}

/**
 * Compute geographic proximity.
 * Same city = 1.0, same region = 0.5, different/unknown = 0.0
 */
function geoProximityScore(metaA, metaC) {
  if (!metaA.region && !metaC.region) return 0.3; // neutral
  if (metaA.city && metaC.city && metaA.city === metaC.city) return 1.0;
  if (metaA.region && metaC.region && metaA.region === metaC.region) return 0.5;
  return 0.0;
}

/**
 * Compute temporal recency: how recent are the B-A and B-C edges?
 * Returns 0-1 where 1 = very recent.
 */
function recencyScore(nodeA, nodeB, nodeC, edgeDates) {
  const now = Date.now();
  const maxAge = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years

  const keyAB = nodeA < nodeB ? `${nodeA}|${nodeB}` : `${nodeB}|${nodeA}`;
  const keyBC = nodeB < nodeC ? `${nodeB}|${nodeC}` : `${nodeC}|${nodeB}`;

  const dateAB = edgeDates.get(keyAB) || 0;
  const dateBC = edgeDates.get(keyBC) || 0;

  if (dateAB === 0 && dateBC === 0) return 0.3; // neutral if no dates

  const ageAB = dateAB > 0 ? Math.max(0, 1 - (now - dateAB) / maxAge) : 0.3;
  const ageBC = dateBC > 0 ? Math.max(0, 1 - (now - dateBC) / maxAge) : 0.3;

  return (ageAB + ageBC) / 2;
}

/**
 * Compute type compatibility score.
 */
function typeCompatibilityScore(metaA, metaC) {
  const key = `${metaA.type}|${metaC.type}`;
  return TYPE_COMPAT[key] || 0.3;
}

/**
 * Generate a natural-language opportunity summary explaining WHY
 * this predicted connection would be valuable.
 */
function generateOpportunitySummary(nodeA, nodeC, bridgeNode, features, score) {
  const parts = [];

  // Opening based on connection type
  if (nodeA.type === 'fund' && nodeC.type === 'company') {
    parts.push(`${nodeA.label} should evaluate ${nodeC.label} as a potential investment.`);
  } else if (nodeA.type === 'company' && nodeC.type === 'fund') {
    parts.push(`${nodeC.label} should evaluate ${nodeA.label} as a potential investment.`);
  } else if (nodeA.type === 'company' && nodeC.type === 'company') {
    parts.push(`${nodeA.label} and ${nodeC.label} have strong partnership potential.`);
  } else if (nodeA.type === 'accelerator' && nodeC.type === 'company') {
    parts.push(`${nodeC.label} could benefit from ${nodeA.label}'s accelerator program.`);
  } else if (nodeA.type === 'company' && nodeC.type === 'accelerator') {
    parts.push(`${nodeA.label} could benefit from ${nodeC.label}'s accelerator program.`);
  } else {
    parts.push(`A connection between ${nodeA.label} and ${nodeC.label} would strengthen the ecosystem.`);
  }

  // Evidence based on features
  if (features.jaccard > 0.3) {
    parts.push(`They share ${Math.round(features.jaccard * 100)}% of their network connections through ${bridgeNode.label}.`);
  }
  if (features.sectorOverlap > 0.5) {
    parts.push(`Both operate in overlapping sectors, suggesting strategic alignment.`);
  }
  if (features.geoProximity >= 1.0) {
    parts.push(`Co-located in the same region, enabling face-to-face collaboration.`);
  }
  if (features.recency > 0.7) {
    parts.push(`Recent activity from the bridge connection suggests timely relevance.`);
  }

  // Closing with strength assessment
  if (score > 0.7) {
    parts.push(`High confidence recommendation — multiple strong signals.`);
  } else if (score > 0.5) {
    parts.push(`Moderate confidence — worth exploring through the shared connection.`);
  }

  return parts.join(' ');
}

/**
 * Generate a human-readable reasoning string.
 */
function generateReasoning(features, metaA, metaC, commonCount) {
  const parts = [];
  if (commonCount > 0) parts.push(`${commonCount} common neighbor${commonCount > 1 ? 's' : ''}`);

  const sharedSectors = [];
  const sA = new Set(metaA.sectors || []);
  for (const s of (metaC.sectors || [])) {
    if (sA.has(s)) sharedSectors.push(s);
  }
  if (sharedSectors.length > 0) parts.push(`both in ${sharedSectors.join(', ')}`);

  if (features.geoProximity >= 0.9) parts.push('same city');
  else if (features.geoProximity >= 0.4) parts.push('same region');

  if (features.recency >= 0.7) parts.push('recent activity');
  if (features.typeCompatibility >= 0.8) parts.push(`strong ${metaA.type}-${metaC.type} affinity`);

  return parts.join(', ') || 'structural proximity';
}

/**
 * Count common neighbors between two nodes.
 */
function countCommon(neighborsA, neighborsC) {
  let count = 0;
  const smaller = neighborsA.size <= neighborsC.size ? neighborsA : neighborsC;
  const larger = neighborsA.size <= neighborsC.size ? neighborsC : neighborsA;
  for (const n of smaller) {
    if (larger.has(n)) count++;
  }
  return count;
}

/**
 * Predict missing links across the entire graph.
 */
export async function predictMissingLinks({ limit = 50, minScore = 0.3 } = {}) {
  // Check cache
  const cacheKey = `${CACHE_KEY_ALL}:${limit}:${minScore}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { edges, nodeMeta } = await loadGraphData();
  const { adj, edgeDates } = buildAdjacency(edges);

  const predictions = [];
  const seen = new Set(); // track A-C pairs we've already scored
  let totalOpenTriads = 0;

  // For each node B, look at all pairs of B's neighbors (A, C)
  for (const [nodeB, neighborsB] of adj) {
    const metaB = nodeMeta.get(nodeB);
    if (!metaB) continue;

    const neighborArr = Array.from(neighborsB);
    for (let i = 0; i < neighborArr.length; i++) {
      for (let j = i + 1; j < neighborArr.length; j++) {
        const nodeA = neighborArr[i];
        const nodeC = neighborArr[j];

        // Skip if A-C already connected
        const neighborsA = adj.get(nodeA);
        if (neighborsA && neighborsA.has(nodeC)) continue;

        // Skip if already scored this pair
        const pairKey = nodeA < nodeC ? `${nodeA}|${nodeC}` : `${nodeC}|${nodeA}`;
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);

        totalOpenTriads++;

        const metaA = nodeMeta.get(nodeA);
        const metaC = nodeMeta.get(nodeC);
        if (!metaA || !metaC) continue;

        const neighborsC = adj.get(nodeC) || new Set();

        // Compute features
        const features = {
          jaccard: jaccardScore(neighborsA || new Set(), neighborsC),
          sectorOverlap: sectorOverlapScore(metaA, metaC),
          geoProximity: geoProximityScore(metaA, metaC),
          recency: recencyScore(nodeA, nodeB, nodeC, edgeDates),
          typeCompatibility: typeCompatibilityScore(metaA, metaC),
        };

        const score =
          features.jaccard * WEIGHTS.jaccard +
          features.sectorOverlap * WEIGHTS.sectorOverlap +
          features.geoProximity * WEIGHTS.geoProximity +
          features.recency * WEIGHTS.recency +
          features.typeCompatibility * WEIGHTS.typeCompatibility;

        if (score >= minScore) {
          const commonCount = countCommon(neighborsA || new Set(), neighborsC);
          const nodeAObj = { id: metaA.id, label: metaA.label, type: metaA.type };
          const nodeCObj = { id: metaC.id, label: metaC.label, type: metaC.type };
          const bridgeObj = { id: metaB.id, label: metaB.label, type: metaB.type };
          predictions.push({
            nodeA: nodeAObj,
            nodeC: nodeCObj,
            bridgeNode: bridgeObj,
            score: Math.round(score * 1000) / 1000,
            features: {
              jaccard: Math.round(features.jaccard * 1000) / 1000,
              sectorOverlap: Math.round(features.sectorOverlap * 1000) / 1000,
              geoProximity: Math.round(features.geoProximity * 1000) / 1000,
              recency: Math.round(features.recency * 1000) / 1000,
              typeCompatibility: Math.round(features.typeCompatibility * 1000) / 1000,
            },
            reasoning: generateReasoning(features, metaA, metaC, commonCount),
            opportunity: generateOpportunitySummary(nodeAObj, nodeCObj, bridgeObj, features, score),
          });
        }
      }
    }
  }

  // Sort descending by score
  predictions.sort((a, b) => b.score - a.score);

  const topPredictions = predictions.slice(0, limit);
  const avgScore = topPredictions.length > 0
    ? Math.round((topPredictions.reduce((s, p) => s + p.score, 0) / topPredictions.length) * 1000) / 1000
    : 0;

  const result = {
    predictions: topPredictions,
    stats: {
      totalOpenTriads,
      predictionsAboveThreshold: predictions.length,
      avgScore,
    },
  };

  cache.set(cacheKey, result, CACHE_TTL);
  return result;
}

/**
 * Predict links for a specific node.
 */
export async function predictLinksForNode(nodeId, { limit = 20, minScore = 0.3 } = {}) {
  // Check cache
  const cacheKey = `${CACHE_KEY_NODE}${nodeId}:${limit}:${minScore}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { edges, nodeMeta } = await loadGraphData();
  const { adj, edgeDates } = buildAdjacency(edges);

  const neighborsTarget = adj.get(nodeId);
  if (!neighborsTarget) {
    return { predictions: [], stats: { totalOpenTriads: 0, predictionsAboveThreshold: 0, avgScore: 0 } };
  }

  const metaTarget = nodeMeta.get(nodeId);
  if (!metaTarget) {
    return { predictions: [], stats: { totalOpenTriads: 0, predictionsAboveThreshold: 0, avgScore: 0 } };
  }

  const predictions = [];
  const seen = new Set();
  let totalOpenTriads = 0;

  // For each neighbor B of nodeId (acting as A), look at B's other neighbors (C)
  for (const nodeB of neighborsTarget) {
    const neighborsB = adj.get(nodeB);
    if (!neighborsB) continue;
    const metaB = nodeMeta.get(nodeB);
    if (!metaB) continue;

    for (const nodeC of neighborsB) {
      if (nodeC === nodeId) continue;
      if (neighborsTarget.has(nodeC)) continue; // already connected

      if (seen.has(nodeC)) continue;
      seen.add(nodeC);

      totalOpenTriads++;

      const metaC = nodeMeta.get(nodeC);
      if (!metaC) continue;

      const neighborsC = adj.get(nodeC) || new Set();

      const features = {
        jaccard: jaccardScore(neighborsTarget, neighborsC),
        sectorOverlap: sectorOverlapScore(metaTarget, metaC),
        geoProximity: geoProximityScore(metaTarget, metaC),
        recency: recencyScore(nodeId, nodeB, nodeC, edgeDates),
        typeCompatibility: typeCompatibilityScore(metaTarget, metaC),
      };

      const score =
        features.jaccard * WEIGHTS.jaccard +
        features.sectorOverlap * WEIGHTS.sectorOverlap +
        features.geoProximity * WEIGHTS.geoProximity +
        features.recency * WEIGHTS.recency +
        features.typeCompatibility * WEIGHTS.typeCompatibility;

      if (score >= minScore) {
        const commonCount = countCommon(neighborsTarget, neighborsC);
        const nodeAObj = { id: metaTarget.id, label: metaTarget.label, type: metaTarget.type };
        const nodeCObj = { id: metaC.id, label: metaC.label, type: metaC.type };
        const bridgeObj = { id: metaB.id, label: metaB.label, type: metaB.type };
        predictions.push({
          nodeA: nodeAObj,
          nodeC: nodeCObj,
          bridgeNode: bridgeObj,
          score: Math.round(score * 1000) / 1000,
          features: {
            jaccard: Math.round(features.jaccard * 1000) / 1000,
            sectorOverlap: Math.round(features.sectorOverlap * 1000) / 1000,
            geoProximity: Math.round(features.geoProximity * 1000) / 1000,
            recency: Math.round(features.recency * 1000) / 1000,
            typeCompatibility: Math.round(features.typeCompatibility * 1000) / 1000,
          },
          reasoning: generateReasoning(features, metaTarget, metaC, commonCount),
          opportunity: generateOpportunitySummary(nodeAObj, nodeCObj, bridgeObj, features, score),
        });
      }
    }
  }

  predictions.sort((a, b) => b.score - a.score);

  const topPredictions = predictions.slice(0, limit);
  const avgScore = topPredictions.length > 0
    ? Math.round((topPredictions.reduce((s, p) => s + p.score, 0) / topPredictions.length) * 1000) / 1000
    : 0;

  const result = {
    predictions: topPredictions,
    stats: {
      totalOpenTriads,
      predictionsAboveThreshold: predictions.length,
      avgScore,
    },
  };

  cache.set(cacheKey, result, CACHE_TTL);
  return result;
}
