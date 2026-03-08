/**
 * D3 Layout Web Worker
 * Offloads expensive D3 force-simulation computations from the main thread
 * Reduces UI blocking and improves responsiveness
 */

// Minimal D3-style force simulation implementation for Web Worker
class ForceSimulation {
  constructor(nodes, edges) {
    this.nodes = nodes.map((n, i) => ({
      ...n,
      index: i,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    }));
    this.edges = edges;
    this.alpha = 1;
    this.alphaDecay = 0.0228;
    this.alphaMin = 0.001;
  }

  // Apply Coulomb repulsion between nodes
  applyRepulsion(strength = -30) {
    for (let i = 0; i < this.nodes.length; ++i) {
      const a = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; ++j) {
        const b = this.nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const f = (strength * this.alpha) / (distance * distance);
        a.vx += (dx / distance) * f;
        a.vy += (dy / distance) * f;
        b.vx -= (dx / distance) * f;
        b.vy -= (dy / distance) * f;
      }
    }
  }

  // Apply spring attraction along edges
  applyAttraction(strength = 0.05) {
    for (const edge of this.edges) {
      const source = this.nodes[edge.source];
      const target = this.nodes[edge.target];
      if (!source || !target) continue;

      let dx = target.x - source.x;
      let dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = strength * this.alpha * distance;

      source.vx += (dx / distance) * f;
      source.vy += (dy / distance) * f;
      target.vx -= (dx / distance) * f;
      target.vy -= (dy / distance) * f;
    }
  }

  // Update node positions based on velocity
  tick() {
    // Apply forces
    this.applyRepulsion(-30);
    this.applyAttraction(0.1);

    // Damping
    const damping = 0.6;

    // Update positions
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

    // Decay alpha
    this.alpha += (this.alphaMin - this.alpha) * this.alphaDecay;
  }

  // Run simulation for N iterations
  run(iterations = 300) {
    for (let i = 0; i < iterations; ++i) {
      this.tick();
      if (this.alpha < this.alphaMin) break;
    }
    return this.nodes;
  }
}

// Message handler
self.addEventListener('message', (e) => {
  const { nodes, edges, iterations = 300 } = e.data;

  try {
    // Initialize node positions if not already set
    const initializedNodes = nodes.map((n, i) => ({
      ...n,
      x: n.x || Math.random() * 600,
      y: n.y || Math.random() * 600,
    }));

    // Normalize edge references to indices
    const normalizedEdges = edges.map((e) => ({
      source: typeof e.source === 'object' ? e.source.index ?? e.source.id : e.source,
      target: typeof e.target === 'object' ? e.target.index ?? e.target.id : e.target,
    }));

    // Run simulation
    const sim = new ForceSimulation(initializedNodes, normalizedEdges);
    const result = sim.run(iterations);

    // Send back computed layout
    self.postMessage({
      success: true,
      nodes: result.map(({ x, y, ...rest }) => ({ ...rest, x, y })),
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
    });
  }
});
