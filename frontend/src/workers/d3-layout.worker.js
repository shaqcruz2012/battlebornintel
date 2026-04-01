/**
 * D3 Layout Web Worker
 *
 * Offloads force-simulation from the main thread using a custom
 * multi-force engine with spatial-grid acceleration.
 *
 * Key design decisions:
 *  - Spatial grid acceleration for repulsion and collision forces
 *  - Two-pass layout: rough pass (no interims) then refinement pass
 *  - Position-only interim messages (~75% smaller structured clones)
 *  - First interim is always a full frame so consumers have complete node data
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

// ── Galactic disc rotation ──────────────────────────────────────────────
// Cluster target positions are tilted ~20 degrees clockwise to create a
// Milky Way-style skewed elliptical formation. The galactic core
// (BBV/GOED hub nodes) sits at center, with spiral arms extending
// along the tilted major axis.

/** Clockwise tilt angle in radians (~20 degrees). */
const TILT_RAD = -0.35;
/** Pre-computed cosine of the tilt angle. */
const COS_T = Math.cos(TILT_RAD);
/** Pre-computed sine of the tilt angle. */
const SIN_T = Math.sin(TILT_RAD);

/**
 * Apply elliptical stretching and galactic tilt rotation to an offset.
 *
 * @param {number} cx - Canvas center X
 * @param {number} cy - Canvas center Y
 * @param {number} dx - Horizontal offset from center (before transformation)
 * @param {number} dy - Vertical offset from center (before transformation)
 * @returns {{ x: number, y: number }} Absolute canvas position after
 *   stretching (1.3x major, 0.7x minor) and rotation by TILT_RAD.
 */
function galacticPos(cx, cy, dx, dy) {
  const sx = dx * 1.3;  // stretch along major axis
  const sy = dy * 0.7;  // compress along minor axis
  return {
    x: cx + sx * COS_T - sy * SIN_T,
    y: cy + sx * SIN_T + sy * COS_T,
  };
}

// ── Concentric orbital ring layout with Fibonacci spacing ──────────────
// Positions node types in concentric rings like a Milky Way galaxy:
//   Core:       Funds (BBV, GOED, DFV) — dense luminous center
//   Inner ring: Accelerators, ecosystem orgs — support infrastructure
//   Mid band:   Companies — the stellar disc, spread by region angle
//   Outer halo: External investors, people — sparse periphery
//   Far halo:   Sectors, regions (abstract nodes) — very outer edge
//
// Within each ring, nodes are distributed using the golden angle
// (137.508°) — the same spiral pattern found in sunflowers and
// galaxy arms. This prevents clustering and creates natural-looking
// spiral density gradients. Radius grows as sqrt(index) for uniform
// area coverage (Vogel's model / Fermat's spiral).

/** Golden angle in radians — 2π / φ² ≈ 137.508° */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Deterministic integer hash for a node ID, used to assign a stable
 * Fibonacci sequence index within its ring.
 */
function hashIndex(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (h & 0x7FFFFFFF);
}

/** Simple seeded hash for deterministic per-node angular jitter. */
function hashAngle(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (h & 0x7FFFFFFF) / 0x7FFFFFFF * Math.PI * 2;
}

/**
 * Fibonacci/golden-angle position within a ring band.
 * Uses Vogel's model: angle = index * golden_angle, radius = sqrt(index/total).
 * This fills a disc uniformly with a natural spiral pattern.
 *
 * @param {number} index - Node's position in the Fibonacci sequence
 * @param {number} total - Total nodes in this ring
 * @param {number} rMin  - Inner radius of ring band (fraction of scale)
 * @param {number} rMax  - Outer radius of ring band (fraction of scale)
 * @returns {{ radius: number, angle: number }}
 */
function fibPosition(index, total, rMin, rMax) {
  const t = total > 1 ? index / (total - 1) : 0.5;
  const radius = rMin + (rMax - rMin) * Math.sqrt(t); // sqrt for uniform area
  const angle = index * GOLDEN_ANGLE;
  return { radius, angle };
}

/** Region-to-angle mapping for company mid-band distribution (radians). */
const REGION_ANGLES = {
  las_vegas:       0.15,   // ~9° — east
  henderson:       0.55,   // ~32°
  las_vegas_metro: -0.15,  // ~-9°
  reno:            Math.PI + 0.15,     // ~189° — west
  washoe:          Math.PI - 0.15,     // ~171°
  sparks:          Math.PI + 0.40,     // ~203°
  northern_nevada: Math.PI + 1.0,      // ~237° — upper-left
  elko:            Math.PI + 1.4,      // ~260°
  statewide:       Math.PI / 2 + 0.3,  // ~120° — lower
};

/**
 * Returns the cluster target for a node using concentric ring positioning.
 *
 * @param {{ id: string, type: string, label?: string, region?: string }} node
 * @param {number} width  - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {{ x: number, y: number, strength: number }}
 */
function clusterTarget(node, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) * 0.45; // radius reference (~45% of canvas)

  // ── Core: hub nodes at dead center ──
  if (
    HUB_IDS.has(node.id) ||
    (node.type === 'fund' && (node.label || '').toLowerCase().includes('battle born'))
  ) {
    return { x: cx, y: cy, strength: 0.8 };
  }

  let radius, angle, strength;
  // Use deterministic hash index for Fibonacci spiral positioning
  const idx = hashIndex(node.id);

  switch (node.type) {
    case 'fund': {
      // Core ring — tight Fibonacci spiral near galactic center
      const fib = fibPosition(idx % 30, 30, 0.04, 0.10);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.50;
      break;
    }

    case 'accelerator': {
      // Inner ring — golden-angle distribution
      const fib = fibPosition(idx % 40, 40, 0.14, 0.22);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.25;
      break;
    }

    case 'ecosystem': {
      // Inner ring — alongside accelerators, offset by half-turn
      const fib = fibPosition(idx % 25, 25, 0.12, 0.20);
      radius = fib.radius;
      angle = fib.angle + Math.PI; // offset from accelerators
      strength = 0.25;
      break;
    }

    case 'program': {
      // Inner ring — between accelerators and companies
      const fib = fibPosition(idx % 30, 30, 0.16, 0.24);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.20;
      break;
    }

    case 'company': {
      // Mid band — stellar disc with region-based angular sectors
      // Fibonacci spiral within a region's angular sector
      const baseAngle = REGION_ANGLES[node.region] ?? hashAngle(node.id);
      const fib = fibPosition(idx % 200, 200, 0.24, 0.40);
      // Blend Fibonacci angle with region angle: region dominates (70/30)
      angle = baseAngle * 0.7 + fib.angle * 0.3;
      radius = fib.radius;
      strength = 0.12;
      break;
    }

    case 'person': {
      // Outer halo — golden-angle spiral beyond companies
      const fib = fibPosition(idx % 100, 100, 0.36, 0.48);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.10;
      break;
    }

    case 'external': {
      // Outer halo — external investors in Fibonacci spiral at the periphery
      const fib = fibPosition(idx % 300, 300, 0.44, 0.58);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.10;
      break;
    }

    case 'sector': {
      // Far halo — abstract sector nodes at the rim
      const fib = fibPosition(idx % 20, 20, 0.50, 0.58);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.08;
      break;
    }

    case 'region': {
      // Far halo — abstract region nodes
      const fib = fibPosition(idx % 15, 15, 0.52, 0.60);
      radius = fib.radius;
      angle = fib.angle + Math.PI / 3; // offset from sectors
      strength = 0.08;
      break;
    }

    default: {
      const fib = fibPosition(idx % 50, 50, 0.25, 0.40);
      radius = fib.radius;
      angle = fib.angle;
      strength = 0.05;
      break;
    }
  }

  // Convert polar to cartesian, then apply galactic tilt + elliptical stretch
  const dx = radius * scale * Math.cos(angle);
  const dy = radius * scale * Math.sin(angle);
  return { ...galacticPos(cx, cy, dx, dy), strength };
}

class ForceSimulation {
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

    // Simulation parameters tuned for concentric ring layout
    this.alpha = 1;
    this.alphaDecay = 0.014;   // slightly slower to let rings form properly
    this.alphaMin = 0.005;
    this.velocityDecay = 0.38; // more damping for stable ring structure
  }

  /**
   * Build a uniform spatial grid mapping integer cell keys to arrays of
   * node indices. Uses an integer hash to handle negative coordinates
   * (nodes can drift below 0 before boundary force takes effect).
   */
  _buildGrid(cellSize) {
    const grid = new Map();
    const invCell = 1 / cellSize;
    for (let i = 0; i < this.nodes.length; ++i) {
      const n = this.nodes[i];
      const cx = Math.floor((n.x || 0) * invCell);
      const cy = Math.floor((n.y || 0) * invCell);
      const key = cx * 73856093 + cy; // fast integer hash, no string alloc
      const bucket = grid.get(key);
      if (bucket) bucket.push(i);
      else grid.set(key, [i]);
    }
    return grid;
  }

  /**
   * Many-body repulsion — spatial-grid-accelerated.
   *
   * Uses cellSize=150 with a radius-2 neighborhood (5x5 = 25 cells).
   * maxDist=300 ensures proper milky-way spread across the canvas.
   */
  applyRepulsion() {
    const strength = -80;  // stronger repulsion for ring separation
    const maxDist = 300;
    const maxDist2 = maxDist * maxDist;
    const cellSize = 150;
    const radius = 2;          // ceil(300 / 150) = 2
    const invCell = 1 / cellSize;

    const grid = this._buildGrid(cellSize);

    for (let i = 0; i < this.nodes.length; ++i) {
      const a = this.nodes[i];
      const acx = Math.floor((a.x || 0) * invCell);
      const acy = Math.floor((a.y || 0) * invCell);

      for (let dcx = -radius; dcx <= radius; ++dcx) {
        const ncx = acx + dcx;
        for (let dcy = -radius; dcy <= radius; ++dcy) {
          const key = ncx * 73856093 + (acy + dcy);
          const bucket = grid.get(key);
          if (!bucket) continue;

          for (let bi = 0; bi < bucket.length; ++bi) {
            const j = bucket[bi];
            if (j <= i) continue;
            const b = this.nodes[j];
            let dx = b.x - a.x || 0.01;
            let dy = b.y - a.y || 0.01;
            const dist2 = dx * dx + dy * dy;
            if (dist2 > maxDist2) continue;
            const dist = Math.sqrt(dist2);
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
    }
  }

  /**
   * Collision avoidance — spatial-grid-accelerated.
   * Fine grid (cellSize=36) means most cells have 0-2 nodes.
   */
  applyCollision() {
    const minDist = 18;
    const cellSize = 36;
    const invCell = 1 / cellSize;

    const grid = this._buildGrid(cellSize);

    for (let i = 0; i < this.nodes.length; ++i) {
      const a = this.nodes[i];
      const acx = Math.floor((a.x || 0) * invCell);
      const acy = Math.floor((a.y || 0) * invCell);

      for (let dcx = -1; dcx <= 1; ++dcx) {
        for (let dcy = -1; dcy <= 1; ++dcy) {
          const key = (acx + dcx) * 73856093 + (acy + dcy);
          const bucket = grid.get(key);
          if (!bucket) continue;

          for (let bi = 0; bi < bucket.length; ++bi) {
            const j = bucket[bi];
            if (j <= i) continue;
            const b = this.nodes[j];
            const dx = b.x - a.x || 0.01;
            const dy = b.y - a.y || 0.01;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              const overlap = ((minDist - dist) / dist) * 0.35;
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
   */
  applyEdgeAttraction() {
    const idealLength = 150;  // longer edges prevent ring collapse
    const strength = 0.025;  // slightly weaker to respect ring structure
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
   */
  applyClusterForce() {
    for (const node of this.nodes) {
      if (node.fx != null) continue;
      const { x: tx, y: ty, strength } = node._clusterTarget;
      node.vx += (tx - node.x) * strength * this.alpha;
      node.vy += (ty - node.y) * strength * this.alpha;
    }
  }

  /**
   * Soft boundary force — gently pushes nodes back inside canvas margins.
   */
  applyBoundary() {
    const margin = 20;  // tighter margin to use more canvas for the galaxy
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

    this.alpha += (this.alphaMin - this.alpha) * this.alphaDecay;
  }

  /**
   * Run the simulation for up to `iterations` ticks.
   * If `onInterim` is provided it is called every `interimEvery` ticks.
   */
  run(iterations = 450, onInterim = null, interimEvery = 80) {
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

/** Random position within the middle 80% of a dimension (10% margin each side). */
function marginRand(dim) {
  return dim * 0.1 + Math.random() * dim * 0.8;
}

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

/**
 * Full node serialization for postMessage transfer.
 * Explicitly picks properties to avoid structured-clone overhead of
 * internal fields (vx, vy, fx, fy, _clusterTarget, index).
 *
 * Consumers: GalaxyView (rendering), GalaxyHud (detail panel), GraphCanvas.
 */
function serializeNodes(nodes) {
  return nodes.map(n => ({
    id: n.id,
    type: n.type,
    label: n.label,
    x: n.x,
    y: n.y,
    region: n.region,
    funding: n.funding,
    stage: n.stage,
    employees: n.employees,
    momentum: n.momentum,
    category: n.category,
    _communityId: n._communityId,
    sectors: n.sectors,
    city: n.city,       // used by GalaxyHud detail panel
  }));
}

/**
 * Lightweight serialization for interim frames — only x/y change between ticks.
 * ~75% smaller than full serialization.
 */
function serializePositions(nodes) {
  return nodes.map(n => ({ id: n.id, x: n.x, y: n.y }));
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
    iterations = 450,
    requestId,
  } = e.data;

  try {
    const initializedNodes = nodes.map((n) => ({
      ...n,
      x: n.x != null ? n.x : marginRand(width),
      y: n.y != null ? n.y : marginRand(height),
    }));

    const sim = new ForceSimulation(initializedNodes, edges, width, height);

    // ── Pass 1: rough layout (no interims — positions still chaotic) ─────
    const PASS1_TICKS = 150;
    const INTERIM_EVERY = 80;

    sim.run(PASS1_TICKS, null);

    // First interim is a full frame so consumers can merge subsequent
    // position-only frames without missing type/label/region data.
    self.postMessage({
      success: true,
      interim: true,
      positionOnly: false,
      nodes: serializeNodes(sim.nodes),
      requestId,
    });

    // ── Pass 2: refinement with position-only interim frames ──────────────
    const remainingTicks = Math.max(0, iterations - PASS1_TICKS);

    sim.run(remainingTicks, (currentNodes) => {
      self.postMessage({
        success: true,
        interim: true,
        positionOnly: true,
        nodes: serializePositions(currentNodes),
        requestId,
      });
    }, INTERIM_EVERY);

    // ── Final frame ────────────────────────────────────────────────────────
    self.postMessage({
      success: true,
      interim: false,
      nodes: serializeNodes(sim.nodes),
      requestId,
    });
  } catch (error) {
    self.postMessage({ success: false, error: error.message, requestId });
  }
});
