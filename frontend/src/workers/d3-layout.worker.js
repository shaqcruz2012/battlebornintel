/**
 * D3 Layout Web Worker — v4 Milky Way cigar layout
 * Offloads expensive force-simulation computations from the main thread.
 *
 * Layout concept: "cigar-shaped side view of the Milky Way"
 * The galaxy seen edge-on is an elongated ellipse — dense bright core at center,
 * disk arms extending left/right, sparse halo at the periphery.
 *
 * Key improvements:
 *  - Elliptical coordinate system: aX = width*0.42, aY = height*0.18 (cigar 2-3:1)
 *  - Companies packed in dense elliptical core, sub-grouped by region
 *  - Funds form inner disk arms (left/right of core)
 *  - Accelerators in thin disk band above/below core
 *  - Ecosystem orgs in outer disk ring
 *  - Externals scattered in wide halo
 *  - People at far periphery
 *  - Stable deterministic jitter via hashFloat (no Math.random() in cluster targets)
 *  - Company-company links use 35px ideal distance to keep core compact
 *  - fund→company invested_in edges use strength 0.12 to pull portfolio close
 *  - velocityDecay = 0.35 so elongated shape forms naturally before cooling
 */

/**
 * L-5: Deterministic hash of a string to a float in [0, 1).
 * Used for stable cluster target jitter — layout is identical across re-runs.
 */
function hashFloat(str) {
  let h = 2166136261; // FNV-1a 32-bit offset basis
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0; // FNV prime, keep 32-bit unsigned
  }
  return (h >>> 0) / 0x100000000;
}

const TILT = 15 * Math.PI / 180;
const cosTilt = Math.cos(TILT);
const sinTilt = Math.sin(TILT);

function tiltedPos(u, v, cx, cy, aX, aY) {
  const lx = u * aX;
  const ly = v * aY;
  return {
    x: cx + lx * cosTilt - ly * sinTilt,
    y: cy + lx * sinTilt + ly * cosTilt,
  };
}

/**
 * Returns the cluster target position and attraction strength for a node.
 *
 * Uses an elliptical coordinate system where x range >> y range to produce
 * a cigar / Milky Way edge-on shape:
 *   Major axis (horizontal): width * 0.42
 *   Minor axis (vertical):   height * 0.18
 *
 * @param {object} node  - graph node with at minimum { id, type, region, label }
 * @param {number} width  - canvas width in px
 * @param {number} height - canvas height in px
 * @returns {{ x: number, y: number, strength: number }}
 */
function clusterTarget(node, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const aX = width * 0.42;   // horizontal semi-axis (wide)
  const aY = height * 0.18;  // vertical semi-axis (narrow) — cigar shape

  const type = node.type || 'unknown';
  const id = node.id || '';

  switch (type) {
    case 'company': {
      // Core: tight elliptical cluster, sub-grouped by Nevada region.
      // Stable hashFloat jitter so layout is deterministic across re-runs.
      const regionOffsets = {
        las_vegas:       { x: -0.08, y:  0.00 },
        henderson:       { x: -0.04, y: -0.06 },
        las_vegas_metro: { x: -0.06, y:  0.04 },
        reno:            { x:  0.10, y:  0.05 },
        washoe:          { x:  0.12, y: -0.03 },
        northern_nevada: { x:  0.14, y:  0.08 },
        sparks:          { x:  0.16, y: -0.04 },
        elko:            { x:  0.18, y:  0.10 },
        statewide:       { x:  0.00, y:  0.00 },
      };
      const reg = node.region || 'las_vegas';
      const off = regionOffsets[reg] || { x: 0, y: 0 };
      const u = off.x + (hashFloat(id + '_jx') - 0.5) * 0.12;
      const v = off.y + (hashFloat(id + '_jy') - 0.5) * 0.25;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.10 };
    }

    case 'fund': {
      // Inner disk — funds spread deterministically left and right of core.
      const fundAngle = hashFloat(id) * Math.PI; // 0..PI maps across full arc
      const r = 0.55 + hashFloat(id + '_r') * 0.15;
      const u = Math.cos(fundAngle) * r;
      const v = Math.sin(fundAngle) * 0.6;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.18 };
    }

    case 'accelerator': {
      // Thin disk band above/below core
      const side = hashFloat(id) > 0.5 ? 1 : -1;
      const u = (hashFloat(id + '_x') - 0.5) * 1.1;
      const v = side * 0.75;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.12 };
    }

    case 'ecosystem': {
      // Outer disk, sparse wide elliptical band
      const eAngle = hashFloat(id) * Math.PI * 2;
      const u = Math.cos(eAngle) * 0.85;
      const v = Math.sin(eAngle) * 0.9;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.10 };
    }

    case 'external': {
      // Halo — wide flattened ellipse surrounding the disk
      const hAngle = hashFloat(id) * Math.PI * 2;
      const hR = 0.88 + hashFloat(id + '_r') * 0.20;
      const u = Math.cos(hAngle) * hR;
      const v = Math.sin(hAngle) * hR;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.06 };
    }

    case 'person': {
      // Far periphery — outermost sparse ring
      const pAngle = hashFloat(id) * Math.PI * 2;
      const u = Math.cos(pAngle) * 1.15;
      const v = Math.sin(pAngle) * 1.15;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.05 };
    }

    case 'sector':
    case 'region':
    case 'exchange': {
      // Categorical nodes — mid-disk ring
      const sAngle = hashFloat(id) * Math.PI * 2;
      const u = Math.cos(sAngle) * 0.70;
      const v = Math.sin(sAngle) * 0.70;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.12 };
    }

    default: {
      const dAngle = hashFloat(id) * Math.PI * 2;
      const u = Math.cos(dAngle) * 0.95;
      const v = Math.sin(dAngle) * 0.95;
      const pos = tiltedPos(u, v, cx, cy, aX, aY);
      return { ...pos, strength: 0.05 };
    }
  }
}

// Module-level set so getNodeRadius() doesn't allocate on every call
const _HUB_RADIUS_IDS = new Set(['f_bbv', 'goed', 'eco_goed', 'bbv', 'f_dfv', 'dfv']);

/**
 * Returns the visual radius for a node, matching GraphCanvas.nodeRadius().
 * Used by collision detection so the physics radius matches the rendered size.
 */
function getNodeRadius(node) {
  if (_HUB_RADIUS_IDS.has(node.id)) return 13;
  if (node.type === 'fund' || node.type === 'accelerator') return 8;
  if (node.type === 'sector' || node.type === 'ecosystem' || node.type === 'region') return 6;
  if (node.type === 'company') return 6;  // conservative mid-range for companies
  if (node.type === 'external') return 4;
  return 5;
}

class ForceSimulation {
  /**
   * @param {object[]} nodes  - graph nodes (must include { id, x, y, type, region, label })
   * @param {object[]} edges  - graph edges with source/target as string IDs or numeric indices
   * @param {number}   width  - canvas width in px
   * @param {number}   height - canvas height in px
   */
  constructor(nodes, edges, width, height) {
    this.width = width;
    this.height = height;

    // ── Degree map: count how many edges touch each node ID ──────────────────
    // High-degree nodes repel more strongly and are pushed to the core.
    const degree = {};
    edges.forEach((e) => {
      const s = typeof e.source === 'number' ? String(e.source) : e.source;
      const t = typeof e.target === 'number' ? String(e.target) : e.target;
      degree[s] = (degree[s] || 0) + 1;
      degree[t] = (degree[t] || 0) + 1;
    });

    // Build id-to-index map so string-ID edges resolve to the correct node
    this.idToIndex = {};
    nodes.forEach((n, i) => {
      this.idToIndex[n.id] = i;
    });

    this.nodes = nodes.map((n, i) => ({
      ...n,
      index: i,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      degree: degree[n.id] || 0,
      _r: getNodeRadius(n),                        // visual radius for collision
      _clusterTarget: clusterTarget(n, width, height),
    }));

    // Resolve edge source/target to numeric indices using the id map.
    // Edges with unresolvable or self-referential endpoints are dropped.
    // Preserve relationship type and endpoint types for distance/strength scaling.
    this.edges = edges
      .map((e) => {
        const si =
          typeof e.source === 'number' ? e.source : this.idToIndex[e.source];
        const ti =
          typeof e.target === 'number' ? e.target : this.idToIndex[e.target];
        if (si === undefined || ti === undefined || si === ti) return null;
        return {
          source: si,
          target: ti,
          rel: e.rel || e.type || '',
          sourceType: nodes[si] ? nodes[si].type : null,
          targetType: nodes[ti] ? nodes[ti].type : null,
        };
      })
      .filter(Boolean);

    this.alpha = 1;
    this.alphaDecay = 0.028;  // faster cooling — converges in ~250 ticks instead of 460
    this.alphaMin = 0.005;    // stop earlier — last 0.005→0.001 adds no visible improvement
    this.velocityDecay = 0.38; // slightly higher damping for faster convergence

    // Pre-built sets for edge spring classification — avoids re-allocating on
    // every tick call (applyEdgeAttraction is called hundreds of times).
    this._tightRels = new Set([
      'invested_in', 'loaned_to', 'founder_of', 'manages', 'funds',
      'grants_to', 'acquired',
    ]);
    this._mediumRels = new Set([
      'accelerated_by', 'incubated_by', 'won_pitch', 'partners_with',
      'contracts_with', 'collaborated_with', 'supports', 'housed_at',
    ]);
  }

  /**
   * Build a spatial hash grid for fast neighbor lookups.
   * Nodes are binned into cells of size `cellSize`. Only nodes in the same
   * or adjacent cells are checked for interaction, reducing O(n^2) to ~O(n).
   */
  _buildSpatialGrid(cellSize) {
    const grid = new Map();
    for (let i = 0; i < this.nodes.length; ++i) {
      const n = this.nodes[i];
      const cx = Math.floor((n.x || 0) / cellSize);
      const cy = Math.floor((n.y || 0) / cellSize);
      const key = cx + ',' + cy;
      if (!grid.has(key)) grid.set(key, { cx, cy, indices: [] });
      grid.get(key).indices.push(i);
    }
    return grid;
  }

  _gridKey(cx, cy) {
    return cx + ',' + cy;
  }

  /**
   * Many-body Coulomb repulsion — pushes all node pairs apart.
   * Uses spatial hashing with cell size = distMax so only nearby pairs
   * are checked, reducing complexity from O(n^2) to ~O(n * k) where k
   * is the average number of neighbors within distMax.
   */
  applyRepulsion() {
    const distMax = 350;
    const distMax2 = distMax * distMax;
    const cellSize = distMax;
    const grid = this._buildSpatialGrid(cellSize);

    // Iterate each cell and check against same + 4 forward neighbors
    // (right, below-left, below, below-right) to visit each pair once.
    const offsets = [[0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

    for (const [, cell] of grid) {
      const { cx, cy, indices: cellIndices } = cell;

      for (let oi = 0; oi < offsets.length; oi++) {
        const ncx = cx + offsets[oi][0];
        const ncy = cy + offsets[oi][1];
        const neighbor = oi === 0 ? cell : grid.get(this._gridKey(ncx, ncy));
        if (!neighbor) continue;
        const neighborIndices = neighbor.indices;

        const isSameCell = oi === 0;

        for (let ii = 0; ii < cellIndices.length; ii++) {
          const idxA = cellIndices[ii];
          const a = this.nodes[idxA];
          const strengthA = -40 - a.degree * 10;
          const jStart = isSameCell ? ii + 1 : 0;

          for (let jj = jStart; jj < neighborIndices.length; jj++) {
            const idxB = neighborIndices[jj];
            const b = this.nodes[idxB];
            let dx = b.x - a.x || 0.01;
            let dy = b.y - a.y || 0.01;
            const dist2 = dx * dx + dy * dy;
            if (dist2 > distMax2) continue;
            const dist = Math.sqrt(dist2);
            if (dist < 1) {
              dx = Math.random() * 2 - 1;
              dy = Math.random() * 2 - 1;
            }
            const strength = (strengthA + (-40 - b.degree * 10)) * 0.5;
            const f = (strength * this.alpha) / Math.max(dist2, 1);
            const fx = (dx / Math.max(dist, 1)) * f;
            const fy = (dy / Math.max(dist, 1)) * f;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
          }
        }
      }
    }
  }

  /**
   * Collision avoidance — prevents nodes from overlapping by enforcing
   * a minimum center-to-center distance equal to the sum of their visual
   * radii plus a 6px padding gap.
   *
   * Uses the spatial grid built by applyRepulsion() (same tick) to check
   * only nearby pairs, reducing from O(n^2) to ~O(n * k).
   * Reduced to 1 sub-iteration (from 3) — sufficient with the higher tick count.
   */
  applyCollision() {
    const strength = 0.85;
    const padding = 6;
    // Max possible collision distance: 13 + 13 + 6 = 32px.
    // Use a cell size that covers this with single-cell neighbor checks.
    const cellSize = 40;
    const grid = this._buildSpatialGrid(cellSize);
    const offsets = [[0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

    for (const [, cell] of grid) {
      const { cx, cy, indices: cellIndices } = cell;

      for (let oi = 0; oi < offsets.length; oi++) {
        const ncx = cx + offsets[oi][0];
        const ncy = cy + offsets[oi][1];
        const neighbor = oi === 0 ? cell : grid.get(this._gridKey(ncx, ncy));
        if (!neighbor) continue;
        const neighborIndices = neighbor.indices;

        const isSameCell = oi === 0;

        for (let ii = 0; ii < cellIndices.length; ii++) {
          const idxA = cellIndices[ii];
          const a = this.nodes[idxA];
          const jStart = isSameCell ? ii + 1 : 0;

          for (let jj = jStart; jj < neighborIndices.length; jj++) {
            const idxB = neighborIndices[jj];
            const b = this.nodes[idxB];
            const minDist = (a._r || 5) + (b._r || 5) + padding;
            const dx = b.x - a.x || 0.01;
            const dy = b.y - a.y || 0.01;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            if (dist < minDist) {
              const overlap = ((minDist - dist) / dist) * strength * 0.5;
              a.vx -= dx * overlap;
              a.vy -= dy * overlap;
              b.vx += dx * overlap;
              b.vy += dy * overlap;
            }
          }
        }
      }
    }
  }

  /**
   * Edge spring attraction — pulls connected nodes toward an ideal separation.
   * Ideal length and spring strength vary by relationship type and node types:
   *
   *  - Company↔Company edges use idealLength = 35px to keep the core compact
   *  - fund→company invested_in edges use strength = 0.12 to pull portfolio near fund arm
   *  - Strong ties (invested_in, founder_of, loaned_to): short distance, strong pull
   *  - Medium ties (accelerated_by, partners_with, manages): medium distance
   *  - Weak/categorical ties (operates_in, affiliated_with): long distance, weak pull
   *
   * Respects fixed (fx/fy) nodes.
   */
  applyEdgeAttraction() {
    for (const edge of this.edges) {
      const a = this.nodes[edge.source];
      const b = this.nodes[edge.target];
      if (!a || !b) continue;

      let idealLength, strength;
      const rel = edge.rel;
      const srcType = edge.sourceType || a.type;
      const tgtType = edge.targetType || b.type;

      // Company-company edges: very tight to keep the galactic core compact
      if (srcType === 'company' && tgtType === 'company') {
        idealLength = 35;
        strength = 0.06;
      } else if (this._tightRels.has(rel)) {
        idealLength = 50;
        // fund→company invested_in: stronger pull so portfolio clusters near fund arm
        if (rel === 'invested_in' && (srcType === 'fund' || tgtType === 'fund')) {
          strength = 0.12;
        } else {
          strength = 0.08;
        }
      } else if (this._mediumRels.has(rel)) {
        idealLength = 80;
        strength = 0.05;
      } else {
        idealLength = 110;
        strength = 0.03;
      }

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const displacement = dist - idealLength;
      const f = displacement * strength * this.alpha;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      if (a.fx == null) { a.vx += fx; a.vy += fy; }
      if (b.fx == null) { b.vx -= fx; b.vy -= fy; }
    }
  }

  /**
   * Cluster force — pulls each node toward its type/region zone.
   * Hub nodes use a high strength (0.6) so they gravitate firmly to center.
   */
  applyClusterForce() {
    for (const node of this.nodes) {
      if (node.fx != null) continue; // skip hard-fixed nodes
      const { x: tx, y: ty, strength } = node._clusterTarget;
      node.vx += (tx - node.x) * strength * this.alpha;
      node.vy += (ty - node.y) * strength * this.alpha;
    }
  }

  /**
   * Soft boundary force — gently pushes nodes back inside canvas margins
   * rather than hard-clamping positions (which causes visual jumps).
   */
  applyBoundary() {
    const margin = 40;
    for (const node of this.nodes) {
      if (node.fx == null) {
        if (node.x < margin)               node.vx += (margin - node.x) * 0.06;
        if (node.x > this.width - margin)  node.vx += (this.width - margin - node.x) * 0.06;
      }
      if (node.fy == null) {
        if (node.y < margin)               node.vy += (margin - node.y) * 0.06;
        if (node.y > this.height - margin) node.vy += (this.height - margin - node.y) * 0.06;
      }
    }
  }

  tick() {
    this.applyRepulsion();
    this.applyCollision();
    this.applyEdgeAttraction();
    this.applyClusterForce();
    this.applyBoundary();

    const damping = 1 - this.velocityDecay;
    for (const node of this.nodes) {
      if (node.fx != null) {
        node.x = node.fx;
        node.vx = 0;
      } else {
        node.vx *= damping;
        node.x += node.vx;
      }
      if (node.fy != null) {
        node.y = node.fy;
        node.vy = 0;
      } else {
        node.vy *= damping;
        node.y += node.vy;
      }
    }

    // Cool the simulation
    this.alpha += (this.alphaMin - this.alpha) * this.alphaDecay;
  }

  /**
   * Run the simulation for up to `iterations` ticks.
   * If `onInterim` is provided it is called every `interimEvery` ticks with
   * the current node array so the caller can stream progressive results.
   *
   * @param {number}   iterations  - maximum tick count
   * @param {Function} [onInterim] - callback(nodes) fired every interimEvery ticks
   * @param {number}   [interimEvery=60] - interval between interim callbacks
   */
  run(iterations = 600, onInterim = null, interimEvery = 60) {
    for (let i = 0; i < iterations; ++i) {
      this.tick();
      if (this.alpha < this.alphaMin) break;
      if (onInterim && (i + 1) % interimEvery === 0) {
        onInterim(this.nodes);
      }
    }
    return this.nodes;
  }
}

/**
 * Spread initial node positions across the middle 60% of the canvas
 * (20%-80% of each dimension) to avoid pathological edge-clustering on
 * first tick.
 *
 * @param {number} dim - canvas dimension (width or height) in px
 * @returns {number}
 */
function marginRand(dim) {
  return dim * 0.2 + Math.random() * dim * 0.6;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serialize only the fields consumers need, stripping internal simulation
 * state (vx, vy, fx, fy, index, degree, _r, _clusterTarget) to keep message
 * size lean and avoid polluting the node objects received by GraphCanvas.
 */
function serializeNodes(nodes) {
  // eslint-disable-next-line no-unused-vars
  return nodes.map(({ id, type, label, x, y, vx, vy, fx, fy, index, degree, _r, _clusterTarget, _cx, _cy, ...rest }) => ({
    id,
    type,
    label,
    x,
    y,
    ...rest,
  }));
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------
self.addEventListener('message', (e) => {
  const {
    nodes,
    edges,
    width = 1200,
    height = 700,
    iterations: _iterations,
  } = e.data;

  // Cap total iterations — with alphaDecay 0.028 the simulation converges
  // in ~250 ticks. 300 is a safe budget; anything beyond wastes CPU.
  const iterations = Math.min(_iterations || 300, 300);

  try {
    // Initialize positions for nodes that haven't been placed yet
    const initializedNodes = nodes.map((n) => ({
      ...n,
      x: n.x != null ? n.x : marginRand(width),
      y: n.y != null ? n.y : marginRand(height),
    }));

    const sim = new ForceSimulation(initializedNodes, edges, width, height);

    // Post only 2 interim frames (at 33% and 66%) plus the final frame.
    // This gives progressive rendering without flooding the main thread.
    const INTERIM_EVERY = Math.max(30, Math.floor(iterations / 3));

    sim.run(iterations, (currentNodes) => {
      self.postMessage({
        success: true,
        interim: true,
        nodes: serializeNodes(currentNodes),
      });
    }, INTERIM_EVERY);

    // ── Final frame ────────────────────────────────────────────────────────
    self.postMessage({
      success: true,
      interim: false,
      nodes: serializeNodes(sim.nodes),
    });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});
