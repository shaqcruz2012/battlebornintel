import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import ForceGraph3DImport from '3d-force-graph';
import * as THREE from 'three';

// Handle both default and named export patterns
const ForceGraph3D = ForceGraph3DImport.default || ForceGraph3DImport;
import { useGraphLight, useGraphMetrics } from '../../api/hooks';
import { NODE_CFG, REL_CFG, GP, COMM_COLORS } from '../../data/constants';
import styles from './GalaxyView.module.css';
import { GalaxyHudBar, GalaxyCompass, GalaxyDetailPanel, esc } from './GalaxyHud';

// ── Node sizing ──────────────────────────────────────────────────────────────

const HUB_IDS = new Set(['f_bbv', 'e_goed', 'f_fundnv', 'a_startupnv']);

function nodeVal(node, pagerank) {
  if (HUB_IDS.has(node.id)) return 14;
  const pr = pagerank?.[node.id] || 0;
  if (node.type === 'fund' || node.type === 'accelerator') return 5 + pr * 0.06;
  if (node.type === 'company') return 2 + pr * 0.08;
  return 2;
}

function nodeColor(node) {
  return NODE_CFG[node.type]?.color || '#888';
}

function linkColor(edge, selectedNode) {
  if (!selectedNode) return REL_CFG[edge.rel]?.color || '#333';
  const sid = typeof edge.source === 'object' ? edge.source.id : edge.source;
  const tid = typeof edge.target === 'object' ? edge.target.id : edge.target;
  if (sid === selectedNode || tid === selectedNode) {
    return REL_CFG[edge.rel]?.color || '#45d7c6';
  }
  return 'rgba(30,30,40,0.3)';
}

// ── Sprite text label helper (cached to avoid GPU memory leaks) ──────────────

const _spriteCache = new Map();

function makeTextSprite(text, color) {
  if (!THREE?.CanvasTexture) return null;
  const key = `${text}|${color}`;
  if (_spriteCache.has(key)) return _spriteCache.get(key).clone();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const fontSize = 48;
  const font = `600 ${fontSize}px "IBM Plex Mono", monospace`;
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;
  canvas.width = Math.min(textWidth + 24, 1024);
  canvas.height = fontSize + 16;
  ctx.font = font;
  ctx.fillStyle = color || '#d4d0c8';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 12, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(aspect * 5, 5, 1);
  _spriteCache.set(key, sprite);
  return sprite.clone();
}

// ── Starfield helper ─────────────────────────────────────────────────────────

function createStarfield(scene) {
  if (!THREE?.BufferGeometry) return null;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(2500 * 3);
  for (let i = 0; i < 2500; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = 2000 * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = 2000 * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = 2000 * Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.5, transparent: true,
    opacity: 0.3, depthWrite: false, sizeAttenuation: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  return points;
}

// ── Component ────────────────────────────────────────────────────────────────

export function GalaxyView() {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const rotationRef = useRef(null);
  const compassRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [colorMode, setColorMode] = useState('type');
  const compassBearingRef = useRef(0);
  const camDistRef = useRef(600);
  const hudRef = useRef(null);
  const compassArrowRef = useRef(null);
  const compassDistRef = useRef(null);
  const [initError, setInitError] = useState(null);

  const { data: graphData, isLoading } = useGraphLight();
  const { data: metrics } = useGraphMetrics();

  // Cluster count for HUD
  const clusterCount = useMemo(() => {
    if (!metrics?.communities) return 0;
    return new Set(Object.values(metrics.communities)).size;
  }, [metrics]);

  // Build graph data for 3d-force-graph
  const graphInput = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] };

    const nodeMap = new Map();
    const gNodes = graphData.nodes.map((n) => {
      const commId = metrics?.communities?.[n.id];
      const commColor = commId != null
        ? COMM_COLORS[commId % COMM_COLORS.length]
        : '#888';
      const obj = {
        id: n.id,
        label: n.label || n.name || n.id,
        type: n.type,
        val: nodeVal(n, metrics?.pagerank),
        color: colorMode === 'community' ? commColor : nodeColor(n),
        typeColor: nodeColor(n),
        commColor,
        funding: n.funding,
        stage: n.stage,
        sectors: n.sectors,
        city: n.city,
      };
      nodeMap.set(n.id, obj);
      return obj;
    });

    const gLinks = graphData.edges
      .filter((e) => {
        const sid = e.source?.id || e.source;
        const tid = e.target?.id || e.target;
        return nodeMap.has(sid) && nodeMap.has(tid);
      })
      .map((e) => ({
        source: e.source?.id || e.source,
        target: e.target?.id || e.target,
        rel: e.rel,
        note: e.note,
        source_url: e.source_url,
        year: e.y || e.event_year,
        sourceName: nodeMap.get(e.source?.id || e.source)?.label || e.source?.id || e.source,
        targetName: nodeMap.get(e.target?.id || e.target)?.label || e.target?.id || e.target,
      }));

    return { nodes: gNodes, links: gLinks };
  }, [graphData, metrics, colorMode]);

  // Connected IDs for focus effect
  const connectedIds = useMemo(() => {
    const cIds = new Set();
    if (!selectedNode) return cIds;
    cIds.add(selectedNode);
    graphInput.links.forEach((l) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source;
      const tid = typeof l.target === 'object' ? l.target.id : l.target;
      if (sid === selectedNode || tid === selectedNode) {
        cIds.add(sid);
        cIds.add(tid);
      }
    });
    return cIds;
  }, [selectedNode, graphInput.links]);

  // Initialize 3d-force-graph
  useEffect(() => {
    if (!containerRef.current || graphRef.current) return;

    let graph;
    try {
    graph = ForceGraph3D()(containerRef.current)
      .backgroundColor(GP.bg)
      .showNavInfo(false)
      .nodeRelSize(4)
      .nodeResolution(16)
      .linkWidth(0.3)
      .linkOpacity(0.12)
      .linkDirectionalParticles(0)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleWidth(1.5)
      .d3AlphaDecay(0.025)
      .d3VelocityDecay(0.25)
      .warmupTicks(100)
      .cooldownTicks(150)
      .nodeColor((n) => n.color)
      .nodeVal((n) => n.val)
      .nodeLabel((node) => {
        const label = esc(node.label || node.id);
        const type = esc(node.type || '');
        const extra = node.funding ? ` \u00B7 $${node.funding}M` : '';
        return `<div style="font-family:'IBM Plex Mono',monospace;font-size:11px;background:rgba(10,14,20,0.92);color:#d4d0c8;padding:4px 8px;border-radius:3px;border:1px solid #1c2733;pointer-events:none"><div style="color:${esc(node.color)};font-weight:600">${label}</div><div style="font-size:9px;color:#6b6a72">${type}${extra}</div></div>`;
      })
      .nodeThreeObjectExtend(true)
      .nodeThreeObject((node) => {
        const isHub = HUB_IDS.has(node.id);
        if (!isHub && (node.val || 2) < 5) return null;
        const truncated = (node.label || node.id).slice(0, 18);
        const sprite = makeTextSprite(truncated, node.color);
        if (!sprite) return null;
        sprite.position.y = 6;
        return sprite;
      })
      .linkLabel((link) => {
        const rel = esc((link.rel || '').replace(/_/g, ' '));
        const note = link.note ? `<div style="font-size:9px;color:rgba(255,255,255,0.5);line-height:1.4">${esc(link.note)}</div>` : '';
        const url = link.source_url ? `<div style="color:#45d7c6;font-size:8px;margin-top:4px">Click edge to open source</div>` : '';
        return `<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;background:rgba(10,14,20,0.95);color:#d4d0c8;padding:6px 10px;border-radius:3px;border:1px solid #1c2733;max-width:320px;pointer-events:none"><div style="font-size:8px;color:#6b6a72;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px">${rel}</div><div style="font-size:9px;color:#45d7c6;margin-bottom:2px">${esc(link.sourceName || '')} \u2192 ${esc(link.targetName || '')}</div>${note}${url}</div>`;
      })
      .onLinkClick((link) => {
        if (link.source_url) {
          window.open(link.source_url, '_blank', 'noopener');
        }
      })
      .linkHoverPrecision(6)
      .onNodeClick((node) => {
        setSelectedNode((prev) => prev === node.id ? null : node.id);
        // Fly camera to node
        const distance = 180;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        graph.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1200
        );
      })
      .onBackgroundClick(() => setSelectedNode(null));

    // Bloom post-processing removed for stability — the starfield and
    // node glow provide sufficient visual depth without it.

    graphRef.current = graph;
    } catch (err) {
      console.error('[galaxy] Init failed:', err);
      setInitError(err.message);
    }

    return () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
      if (graphRef.current) {
        graphRef.current._destructor?.();
        graphRef.current = null;
      }
    };
  }, []);

  // Feed data into graph when ready
  useEffect(() => {
    if (!graphRef.current || graphInput.nodes.length === 0) return;
    graphRef.current.graphData({
      nodes: [...graphInput.nodes],
      links: [...graphInput.links],
    });
  }, [graphInput]);

  // Auto-rotation when no node is selected
  useEffect(() => {
    if (!graphRef.current) return;

    if (selectedNode) {
      // Stop rotation when a node is selected
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
      return;
    }

    let animId;
    function rotate() {
      if (!graphRef.current) return;
      const angle = Date.now() * 0.0001;
      const dist = 600;
      graphRef.current.cameraPosition({
        x: dist * Math.sin(angle),
        y: 50,
        z: dist * Math.cos(angle),
      });
      animId = requestAnimationFrame(rotate);
    }
    animId = requestAnimationFrame(rotate);
    rotationRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      rotationRef.current = null;
    };
  }, [selectedNode]);

  // Update visual appearance on selection
  useEffect(() => {
    if (!graphRef.current) return;
    const sel = selectedNode;
    const cIds = connectedIds;

    graphRef.current
      .nodeOpacity((node) => {
        if (!sel) return 0.85;
        return cIds.has(node.id) ? 1.0 : 0.06;
      })
      .nodeVal((node) => {
        const base = node.val || 2;
        if (sel === node.id) return base * 2;
        return base;
      })
      .nodeThreeObject((node) => {
        const isHub = HUB_IDS.has(node.id);
        const isConnected = sel && cIds.has(node.id);
        const isSelected = sel === node.id;
        if (!isHub && !isSelected && !isConnected && (node.val || 2) < 5) {
          return null;
        }
        const truncated = (node.label || node.id).slice(0, 18);
        const sprite = makeTextSprite(truncated, node.color);
        if (!sprite) return null;
        sprite.position.y = 6;
        return sprite;
      })
      .linkWidth((link) => {
        if (!sel) return 0.3;
        const sid = typeof link.source === 'object' ? link.source.id : link.source;
        const tid = typeof link.target === 'object' ? link.target.id : link.target;
        return (sid === sel || tid === sel) ? 2 : 0.05;
      })
      .linkOpacity((link) => {
        if (!sel) return 0.12;
        const sid = typeof link.source === 'object' ? link.source.id : link.source;
        const tid = typeof link.target === 'object' ? link.target.id : link.target;
        return (sid === sel || tid === sel) ? 0.85 : 0.015;
      })
      .linkColor((link) => linkColor(link, sel))
      .linkDirectionalParticles((link) => {
        if (!sel) return 0;
        const sid = typeof link.source === 'object' ? link.source.id : link.source;
        const tid = typeof link.target === 'object' ? link.target.id : link.target;
        return (sid === sel || tid === sel) ? 4 : 0;
      })
      .linkDirectionalParticleColor((link) => {
        const relColor = REL_CFG[link.rel]?.color;
        return relColor || '#45d7c6';
      });
  }, [selectedNode, connectedIds]);

  // Handle container resize
  useEffect(() => {
    if (!graphRef.current || !containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      graphRef.current.width(width).height(height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Starfield background particles
  useEffect(() => {
    if (!graphRef.current) return;
    let sf = null;
    try { sf = createStarfield(graphRef.current.scene()); }
    catch (err) { console.warn('[galaxy] Starfield init error:', err.message); }
    return () => {
      if (sf && graphRef.current) {
        try {
          sf.geometry?.dispose();
          sf.material?.dispose();
          graphRef.current.scene().remove(sf);
        } catch (_) { /* noop */ }
      }
    };
  }, [graphInput.nodes.length]);

  // Compass / camera tracking — imperative DOM updates to avoid 30 re-renders/sec
  useEffect(() => {
    if (!graphRef.current) return;
    let animId, last = 0;
    const tick = (t) => {
      if (!graphRef.current) return;
      if (t - last > 100) { // ~10fps is plenty for compass
        last = t;
        try {
          const c = graphRef.current.camera().position;
          const dist = Math.round(Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z));
          const bearing = Math.atan2(c.x, c.z) * (180 / Math.PI);
          camDistRef.current = dist;
          compassBearingRef.current = bearing;
          // Imperative DOM updates — no React re-render
          if (compassArrowRef.current) {
            compassArrowRef.current.style.transform = `translate(-50%, -100%) rotate(${-bearing}deg)`;
          }
          if (compassDistRef.current) {
            compassDistRef.current.textContent = `CORE ${dist}`;
          }
          if (hudRef.current) {
            const distEl = hudRef.current.querySelector('[data-hud="dist"]');
            if (distEl) distEl.textContent = dist;
          }
        } catch (_) { /* noop */ }
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [graphInput.nodes.length]);

  const handleDeselect = useCallback(() => {
    setSelectedNode(null);
    if (graphRef.current) {
      graphRef.current.cameraPosition({ x: 0, y: 0, z: 600 }, { x: 0, y: 0, z: 0 }, 1200);
    }
  }, []);

  // Selected node detail data
  const selectedDetail = useMemo(() => {
    if (!selectedNode || !graphInput.nodes.length) return null;
    const node = graphInput.nodes.find((n) => n.id === selectedNode);
    if (!node) return null;
    const neighbors = [];
    graphInput.links.forEach((l) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source;
      const tid = typeof l.target === 'object' ? l.target.id : l.target;
      if (sid === selectedNode) {
        const t = graphInput.nodes.find((n) => n.id === tid);
        if (t) neighbors.push({ node: t, rel: l.rel, note: l.note, source_url: l.source_url, year: l.year });
      } else if (tid === selectedNode) {
        const s = graphInput.nodes.find((n) => n.id === sid);
        if (s) neighbors.push({ node: s, rel: l.rel, note: l.note, source_url: l.source_url, year: l.year });
      }
    });
    return { node, neighbors };
  }, [selectedNode, graphInput]);

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>INITIALIZING GALAXY VIEW...</div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>
          GALAXY INIT ERROR: {initError}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.canvas} />

      <GalaxyHudBar
        ref={hudRef}
        nodeCount={graphInput.nodes.length}
        linkCount={graphInput.links.length}
        clusterCount={clusterCount}
        camDist={600}
      />

      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={handleDeselect} title="Reset camera">
          RESET
        </button>
      </div>

      <div className={styles.colorControls}>
        <button
          className={colorMode === 'type' ? styles.colorBtnActive : styles.colorBtn}
          onClick={() => setColorMode('type')}
        >
          TYPE
        </button>
        <button
          className={colorMode === 'community' ? styles.colorBtnActive : styles.colorBtn}
          onClick={() => setColorMode('community')}
        >
          CLUSTER
        </button>
      </div>

      <GalaxyCompass arrowRef={compassArrowRef} distRef={compassDistRef} />

      <div className={styles.legend}>
        {Object.entries(NODE_CFG)
          .filter(([k]) => ['company', 'fund', 'accelerator', 'external', 'ecosystem', 'person'].includes(k))
          .map(([key, cfg]) => (
            <div key={key} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: cfg.color }} />
              <span>{cfg.label}</span>
            </div>
          ))}
      </div>

      <GalaxyDetailPanel detail={selectedDetail} onClose={handleDeselect} />
    </div>
  );
}
