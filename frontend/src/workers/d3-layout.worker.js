/**
 * D3 Layout Web Worker — v5 Community-first galaxy layout
 * Offloads expensive force-simulation computations from the main thread.
 *
 * Layout concept: "solar systems within a galaxy"
 * Each community forms a tight cluster (solar system) positioned around the
 * canvas center. The largest community sits at the center; remaining communities
 * are arranged in a tilted elliptical ring. Within each community, nodes
 * arrange themselves by force simulation with type-based sub-offsets.
 *
 * Key improvements over v4:
 *  - Community-first clustering: nodes cluster by community_id, not by type
 *  - Communities that span types (fund + portfolio companies + accelerator) stay together
 *  - Intra-community edges use shorter ideal distance and stronger springs
 *  - Cross-community edges use longer distances to keep clusters separated
 *  - Community centers computed from node counts and arranged in tilted ellipse
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

// Module-level community centers — set once per simulation run
let communityCenters = {};

/**
 * Pre-compute community center positions.
 * Largest community gets the center. Remaining communities are arranged in a
 * tilted elliptical ring, with larger communities closer to center.
 */
function computeCommunityCenters(nodes, width, height) {
  const commSizes = {};
  nodes.forEach(n => {
    const comm = n._communityId;
    if (comm !== undefined && comm !== null) {
      commSizes[comm] = (commSizes[comm] || 0) + 1;
    }
  });

  // Sort communities by size (largest first)
  const sorted = Object.entries(commSizes)
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) return {};

  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.32;
  const centers = {};

  // Largest community gets the center
  centers[sorted[0][0]] = { x: cx, y: cy };

  // Remaining communities arranged in a ring, tilted 15 degrees
  if (sorted.length > 1) {
    const ringCount = sorted.length - 1;
    for (let i = 1; i < sorted.length; i++) {
      const angle = ((i - 1) / ringCount) * Math.PI * 2;
      // Larger communities closer to center, smaller ones further out
      const sizeRatio = sorted[i][1] / sorted[0][1];
      const dist = R * (0.6 + (1 - sizeRatio) * 0.5);
      const rawX = Math.cos(angle) * dist;
      const rawY = Math.sin(angle) * dist * 0.4; // elliptical
      // Apply tilt
      centers[sorted[i][0]] = {
        x: cx + rawX * cosTilt - rawY * sinTilt,
        y: cy + rawX * sinTilt + rawY * cosTilt,
      };
    }
  }

  return centers;
}

/**
 * Returns the cluster target position and attraction strength for a node.
 *
 * Community-first: nodes are pulled toward their community's center position.
 * Within each community, nodes get small type-based sub-offsets so different
 * node types don't pile directly on top of each other.
 *
 * Nodes without a community fall back to a central position with weak pull.
 */
function clusterTarget(node, width, height) {
  const comm = node._communityId;
  if (comm !== undefined && comm !== null && communityCenters[comm]) {
    const center = communityCenters[comm];
    // Type-based sub-offset within the community — keeps different types
    // slightly separated while staying in the same cluster
    const typeOffset = {
      company:     { dx: 0,   dy: 0   },
      fund:        { dx: -20, dy: -15 },
      external:    { dx: 20,  dy: 10  },
      accelerator: { dx: -15, dy: 15  },
      ecosystem:   { dx: 15,  dy: -10 },
      person:      { dx: 10,  dy: -15 },
      sector:      { dx: -10, dy: 10  },
      region:      { dx: 12,  dy: 8   },
      exchange:    { dx: -8,  dy: -12 },
      program:     { dx: 8,   dy: 12  },
    };
    const off = typeOffset[node.type] || { dx: 0, dy: 0 };
    const jitter = 15; // small spread within community
    return {
      x: center.x + off.dx + (hashFloat(node.id + '_cx') - 0.5) * jitter,
      y: center.y + off.dy + (hashFloat(node.id + '_cy') - 0.5) * jitter,
      strength: 0.20, // strong pull to keep clusters tight
    };
  }
  // Fallback for nodes without a community — weak pull to periphery
  const cx = width / 2;
  const cy = height / 2;
  const dAngle = hashFloat(node.id) * Math.PI * 2;
  const dR = 0.6 + hashFloat(node.id + '_r') * 0.3;
  return {
    x: cx + Math.cos(dAngle) * dR * width * 0.3,
    y: cy + Math.sin(dAngle) * dR * height * 0.15,
    strength: 0.05,
  };
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
   * @param {object[]} nodes  - graph nodes (must include { id, x, y, type, _communityId })
   * @param {object[]} edges  - graph edges with source/target as string IDs or numeric indices
   * @param {number}   width  - canvas width in px
   * @param {number}   height - canvas height in px
   */
  constructor(nodes, edges, width, height) {
    this.width = width;
    this.height = height;

    // ── Compute community centers before building node targets ──────────
    communityCenters = computeCommunityCenters(nodes, width, height);

    // ── Degree map: count how many edges touch each node ID ──────────────
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
    // Preserve relationship type and community membership for spring scaling.
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
          _sameCommunity: (
            nodes[si]?._communityId !== undefined &&
            nodes[si]?._communityId !== null &&
            nodes[si]?._communityId === nodes[ti]?._communityId
          ),
        };
      })
      .filter(Boolean);

    this.alpha = 1;
    this.alphaDecay = 0.045;  // aggressive cooling — converges in ~120 ticks (~40% faster)
    this.alphaMin = 0.008;    // stop earlier — last frames add no visible improvement
    this.velocityDecay = 0.42; // higher damping for faster convergence with fewer ticks

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
    const distMax = 500;
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
    // Use a larger cell size for fewer grid lookups with 1 sub-iteration.
    const cellSize = 60;
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
   *
   * Community-aware: intra-community edges use shorter ideal distance (25-40px)
   * and stronger springs to keep community members tightly clustered.
   * Cross-community edges use longer distances and weaker springs to maintain
   * separation between clusters.
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
      const sameCommunity = edge._sameCommunity;

      if (sameCommunity) {
        // Intra-community: tight clustering — short distance, strong spring
        if (this._tightRels.has(rel)) {
          idealLength = 25;
          strength = 0.14;
        } else if (this._mediumRels.has(rel)) {
          idealLength = 35;
          strength = 0.10;
        } else {
          idealLength = 40;
          strength = 0.08;
        }
      } else {
        // Cross-community: keep clusters separated — longer distance, weaker spring
        if (this._tightRels.has(rel)) {
          idealLength = 100;
          strength = 0.03;
        } else if (this._mediumRels.has(rel)) {
          idealLength = 130;
          strength = 0.02;
        } else {
          idealLength = 160;
          strength = 0.015;
        }
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
   * Cluster force — pulls each node toward its community zone.
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
 * Preserve _communityId so the renderer can draw community labels.
 */
function serializeNodes(nodes) {
  // eslint-disable-next-line no-unused-vars
  return nodes.map(({ id, type, label, x, y, vx, vy, fx, fy, index, degree, _r, _clusterTarget, _cx, _cy, _communityId, ...rest }) => ({
    id,
    type,
    label,
    x,
    y,
    _communityId,
    ...rest,
  }));
}

/**
 * Build a transferable ArrayBuffer containing node positions.
 * Layout: [x0, y0, x1, y1, ...] as Float32.
 * Also returns an id-order array so the consumer can map indices back to node IDs.
 * Using transferable ArrayBuffers avoids the structured-clone overhead of posting
 * full node objects (saves ~2-5ms for 700+ nodes).
 */
function buildPositionBuffer(nodes) {
  const buffer = new Float32Array(nodes.length * 2);
  const ids = new Array(nodes.length);
  for (let i = 0; i < nodes.length; i++) {
    ids[i] = nodes[i].id;
    buffer[i * 2] = nodes[i].x;
    buffer[i * 2 + 1] = nodes[i].y;
  }
  return { buffer, ids };
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
    _requestId,
  } = e.data;

  // Cap total iterations — with alphaDecay 0.045 the simulation converges
  // in ~120 ticks. 150 is a safe budget; anything beyond wastes CPU.
  const iterations = Math.min(_iterations || 150, 150);

  // Check if caller requested ArrayBuffer transfer mode (faster for large graphs)
  const useTransfer = e.data.useTransfer || false;

  try {
    // Initialize positions for nodes that haven't been placed yet
    const initializedNodes = nodes.map((n) => ({
      ...n,
      x: n.x != null ? n.x : marginRand(width),
      y: n.y != null ? n.y : marginRand(height),
    }));

    const sim = new ForceSimulation(initializedNodes, edges, width, height);

    // Skip interim messages entirely — post only the final frame.
    // This eliminates 2 intermediate React re-renders (~5-15ms each) and
    // avoids structured-clone overhead for large node arrays.
    // The user sees a loading skeleton for 1-2s then the full graph appears at once.
    sim.run(iterations, null, iterations + 1);

    // ── Final frame ────────────────────────────────────────────────────────
    if (useTransfer) {
      // ArrayBuffer transfer mode: send positions as Float32Array (zero-copy)
      // plus serialized nodes for the first frame only.
      const { buffer, ids } = buildPositionBuffer(sim.nodes);
      self.postMessage({
        success: true,
        interim: false,
        transfer: true,
        positions: buffer.buffer,
        ids,
        nodes: serializeNodes(sim.nodes),
        _requestId,
      }, [buffer.buffer]);
    } else {
      self.postMessage({
        success: true,
        interim: false,
        nodes: serializeNodes(sim.nodes),
        _requestId,
      });
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message, _requestId });
  }
});
