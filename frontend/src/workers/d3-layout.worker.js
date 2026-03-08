/**
 * D3 Layout Web Worker — v2 with clustering, BBV/GOED anchoring, edge fix
 * Offloads expensive force-simulation computations from the main thread.
 *
 * Key improvements over v1:
 *  - Builds an id-to-index map so string-ID edges resolve correctly
 *  - Cluster force pulls each node type toward a dedicated canvas zone
 *  - BBV / GOED hub nodes are strongly attracted to canvas center
 *  - Collision avoidance prevents node overlap
 *  - Boundary force keeps nodes within canvas margins
 *  - Node positions initialized across 20-80% of canvas (avoids edge pile-up)
 */

// Hub nodes that should gravitate strongly toward the canvas center
const HUB_IDS = new Set([
  'f_bbv',
  'bbv',
  'goed',
  'x_goed',
  'f_battle-born',
  'battle-born-ventures',
]);

/**
 * Returns the cluster target position and attraction strength for a node.
 * Positions are expressed as absolute canvas coordinates derived from
 * fractions of (width, height) centered on (cx, cy).
 *
 * @param {object} node  - graph node with at minimum { id, type, region, label }
 * @param {number} width  - canvas width in px
 * @param {number} height - canvas height in px
 * @returns {{ x: number, y: number, strength: number }}
 */
function clusterTarget(node, width, height) {
  const cx = width / 2;
  const cy = height / 2;

  // Hub nodes strongly attracted to center
  if (
    HUB_IDS.has(node.id) ||
    (node.type === 'fund' && (node.label || '').toLowerCase().includes('battle born'))
  ) {
    return { x: cx, y: cy, strength: 0.6 };
  }

  switch (node.type) {
    case 'fund':
      // Other funds cluster near center, spread slightly around BBV
      return {
        x: cx + (Math.random() - 0.5) * width * 0.15,
        y: cy + (Math.random() - 0.5) * height * 0.15,
        strength: 0.25,
      };

    case 'company': {
      // Portfolio companies cluster by Nevada region around the canvas
      const regionZones = {
        las_vegas:       { x: cx + width * 0.28, y: cy + height * 0.10 },  // right
        henderson:       { x: cx + width * 0.25, y: cy + height * 0.22 },  // lower-right
        las_vegas_metro: { x: cx + width * 0.22, y: cy + height * 0.05 },
        reno:            { x: cx - width * 0.28, y: cy - height * 0.10 },  // left
        washoe:          { x: cx - width * 0.25, y: cy - height * 0.05 },
        northern_nevada: { x: cx - width * 0.10, y: cy - height * 0.28 },  // upper
        sparks:          { x: cx - width * 0.20, y: cy - height * 0.08 },
        elko:            { x: cx + width * 0.05, y: cy - height * 0.32 },  // upper-right
        statewide:       { x: cx,                y: cy + height * 0.30 },  // lower-center
      };
      const zone = regionZones[node.region] || { x: cx, y: cy + height * 0.20 };
      return { ...zone, strength: 0.18 };
    }

    case 'person':
      // People rely primarily on edge force to stay near their company;
      // light cluster toward lower-center keeps them from drifting off-canvas
      return { x: cx, y: cy + height * 0.28, strength: 0.08 };

    case 'accelerator':
      // Accelerators — innovation support layer — lower-left
      return { x: cx - width * 0.30, y: cy + height * 0.25, strength: 0.22 };

    case 'ecosystem':
      // Ecosystem / government / policy — upper-right
      return { x: cx + width * 0.28, y: cy - height * 0.22, strength: 0.22 };

    case 'external':
      // National / external players — outer ring right
      return { x: cx + width * 0.35, y: cy + height * 0.30, strength: 0.15 };

    case 'sector':
      return { x: cx - width * 0.35, y: cy + height * 0.30, strength: 0.15 };

    case 'region':
      return { x: cx - width * 0.35, y: cy - height * 0.30, strength: 0.15 };

    default:
      return { x: cx, y: cy, strength: 0.05 };
  }
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
      _clusterTarget: clusterTarget(n, width, height),
    }));

    // Resolve edge source/target to numeric indices using the id map.
    // Edges with unresolvable or self-referential endpoints are dropped.
    this.edges = edges
      .map((e) => {
        const si =
          typeof e.source === 'number' ? e.source : this.idToIndex[e.source];
        const ti =
          typeof e.target === 'number' ? e.target : this.idToIndex[e.target];
        return si !== undefined && ti !== undefined && si !== ti
          ? { source: si, target: ti }
          : null;
      })
      .filter(Boolean);

    this.alpha = 1;
    this.alphaDecay = 0.04;   // faster convergence than D3 default (0.0228)
    this.alphaMin = 0.008;    // stop earlier than D3 default (0.001)
    this.velocityDecay = 0.35;
  }

  /**
   * Many-body Coulomb repulsion — pushes all node pairs apart.
   * Strength -55 gives more breathing room than the old -30.
   */
  applyRepulsion() {
    const strength = -55;
    for (let i = 0; i < this.nodes.length; ++i) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; ++j) {
        const b = this.nodes[j];
        let dx = b.x - a.x || 0.01;
        let dy = b.y - a.y || 0.01;
        const dist2 = dx * dx + dy * dy;
        const dist = Math.sqrt(dist2);
        // Jitter if nodes are stacked on top of each other
        if (dist < 1) {
          dx = Math.random() * 2 - 1;
          dy = Math.random() * 2 - 1;
        }
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

  /**
   * Collision avoidance — prevents nodes from overlapping by enforcing
   * a minimum center-to-center distance.
   */
  applyCollision() {
    const minDist = 14;
    for (let i = 0; i < this.nodes.length; ++i) {
      for (let j = i + 1; j < this.nodes.length; ++j) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          const overlap = ((minDist - dist) / dist) * 0.5;
          a.vx -= dx * overlap;
          a.vy -= dy * overlap;
          b.vx += dx * overlap;
          b.vy += dy * overlap;
        }
      }
    }
  }

  /**
   * Edge spring attraction — pulls connected nodes toward an ideal separation.
   * Respects fixed (fx/fy) nodes.
   */
  applyEdgeAttraction() {
    const idealLength = 80;  // target edge length in pixels
    const strength = 0.04;
    for (const edge of this.edges) {
      const a = this.nodes[edge.source];
      const b = this.nodes[edge.target];
      if (!a || !b) continue;
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
        if (node.x < margin)               node.vx += (margin - node.x) * 0.1;
        if (node.x > this.width - margin)  node.vx += (this.width - margin - node.x) * 0.1;
      }
      if (node.fy == null) {
        if (node.y < margin)               node.vy += (margin - node.y) * 0.1;
        if (node.y > this.height - margin) node.vy += (this.height - margin - node.y) * 0.1;
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

  run(iterations = 400) {
    for (let i = 0; i < iterations; ++i) {
      this.tick();
      if (this.alpha < this.alphaMin) break;
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
// Message handler
// ---------------------------------------------------------------------------
self.addEventListener('message', (e) => {
  const {
    nodes,
    edges,
    width = 1200,
    height = 700,
    iterations = 400,
  } = e.data;

  try {
    // Initialize positions for nodes that haven't been placed yet
    const initializedNodes = nodes.map((n) => ({
      ...n,
      x: n.x != null ? n.x : marginRand(width),
      y: n.y != null ? n.y : marginRand(height),
    }));

    const sim = new ForceSimulation(initializedNodes, edges, width, height);
    const result = sim.run(iterations);

    self.postMessage({
      success: true,
      // Return only the fields consumers need; strip internal simulation state
      nodes: result.map(({ id, type, label, x, y, ...rest }) => ({
        id,
        type,
        label,
        ...rest,
        x,
        y,
      })),
    });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});
