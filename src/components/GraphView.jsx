import { useState, useMemo, useCallback, useRef } from "react";
import { GP, NODE_CFG, REL_CFG, GSTAGE_C } from "../lib/constants";
import { buildGraph } from "../lib/graphLayout";
import computeGraphMetrics from "../lib/graphIntel";
import { toCytoscapeElements, buildAdjacencyIndex } from "../lib/cytoscapeAdapter";
import { LAYOUTS, LAYOUT_ORDER } from "../lib/layoutConfigs";
import {
  createExpandState, initProgressiveMode, expandNode,
  collapseNode, expandAll, resetToSeed, getVisibleElements,
} from "../lib/expandEngine";
import CytoscapeGraph from "./CytoscapeGraph";

export default function GraphView({ onSelectCompany }) {
  // ── Filters ──
  const [filters, setFilters] = useState({ company: true, fund: true, accelerator: true, sector: false, region: false, person: true, external: true, ecosystem: true, exchange: false });
  const [relFilters, setRelFilters] = useState({ eligible_for: true, operates_in: false, headquartered_in: false, invested_in: true, loaned_to: true, partners_with: true, contracts_with: true, acquired: true, founder_of: true, manages: true, listed_on: false, accelerated_by: true, won_pitch: true, incubated_by: true, program_of: true, supports: true, housed_at: true, collaborated_with: true, funds: true, approved_by: true, filed_with: true, competes_with: true });
  const [yearFilter, setYearFilter] = useState(2026);

  // ── Selection & UI ──
  const [hoverId, setHoverId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [gPanel, setGPanel] = useState("graph");
  const [gSearch, setGSearch] = useState("");
  const [colorMode, setColorMode] = useState("default");
  const [showIntel, setShowIntel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // ── Layout switcher ──
  const [activeLayout, setActiveLayout] = useState("force");

  // ── Progressive expand ──
  const [expandMode, setExpandMode] = useState(false);
  const [expandState, setExpandState] = useState(null);

  const cyRef = useRef(null);

  // ── Computed data ──
  const graphData = useMemo(() => buildGraph(filters, relFilters, yearFilter), [filters, relFilters, yearFilter]);
  const metrics = useMemo(() => computeGraphMetrics(graphData.nodes, graphData.edges), [graphData]);
  const cyElements = useMemo(() => toCytoscapeElements(graphData), [graphData]);
  const adjacencyIndex = useMemo(() => buildAdjacencyIndex(cyElements), [cyElements]);

  // Update expand state when elements change
  const currentExpandState = useMemo(() => {
    if (!expandMode || !expandState) return null;
    return { ...expandState, allElements: cyElements, adjacencyIndex };
  }, [expandMode, expandState, cyElements, adjacencyIndex]);

  const visibleElements = useMemo(() => {
    if (!expandMode || !currentExpandState) return cyElements;
    return getVisibleElements(currentExpandState);
  }, [expandMode, currentExpandState, cyElements]);

  // ── Toggles ──
  const toggleF = k => setFilters(f => ({ ...f, [k]: !f[k] }));
  const toggleR = k => setRelFilters(r => ({ ...r, [k]: !r[k] }));

  // ── Search ──
  const searchMatches = useMemo(() => {
    if (!gSearch || gSearch.length < 2) return [];
    const q = gSearch.toLowerCase();
    return graphData.nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0, 8);
  }, [gSearch, graphData.nodes]);

  const mob = typeof window !== "undefined" && window.innerWidth < 700;

  const selectNode = (n) => {
    setSelected(n);
    setGSearch("");
    if (mob) setGPanel("detail");
  };

  // ── Detail edges (for selected node panel) ──
  const detailEdges = useMemo(() => {
    if (!selected) return [];
    return graphData.edges
      .filter(e => {
        const sid = typeof e.source === "object" ? e.source.id : e.source;
        const tid = typeof e.target === "object" ? e.target.id : e.target;
        return sid === selected.id || tid === selected.id;
      })
      .map(e => {
        const sid = typeof e.source === "object" ? e.source.id : e.source;
        const tid = typeof e.target === "object" ? e.target.id : e.target;
        const oid = sid === selected.id ? tid : sid;
        const other = graphData.nodes.find(n => n.id === oid);
        return { ...e, other, dir: sid === selected.id ? "→" : "←" };
      });
  }, [selected, graphData]);

  // ── Node color helper (for detail panel badges) ──
  const nodeColor = n => {
    if (!n) return GP.muted;
    if (colorMode === "community" && metrics.communities[n.id] !== undefined) return metrics.commColors[metrics.communities[n.id] % metrics.commColors.length];
    if (colorMode === "pagerank" && metrics.pagerank[n.id] !== undefined) { const v = metrics.pagerank[n.id]; return v > 75 ? GP.gold : v > 50 ? GP.green : v > 25 ? GP.blue : GP.dim; }
    if (colorMode === "betweenness" && metrics.betweenness[n.id] !== undefined) { const v = metrics.betweenness[n.id]; return v > 60 ? GP.red : v > 40 ? GP.orange : v > 20 ? GP.cyan : GP.dim; }
    if (n.type === "company") return GSTAGE_C[n.stage] || GP.muted;
    return NODE_CFG[n.type]?.color || GP.muted;
  };

  // ── Cytoscape event handlers ──
  const handleNodeSelect = useCallback((data) => {
    if (data) {
      const node = graphData.nodes.find(n => n.id === data.id);
      selectNode(node || data);
    } else {
      setSelected(null);
    }
  }, [graphData.nodes, mob]);

  const handleNodeContext = useCallback((nodeId) => {
    if (expandMode && currentExpandState) {
      if (currentExpandState.expandedNodeIds.has(nodeId)) {
        setExpandState(collapseNode(currentExpandState, nodeId));
      } else {
        setExpandState(expandNode(currentExpandState, nodeId));
      }
    }
  }, [expandMode, currentExpandState]);

  // ── Progressive expand controls ──
  const startExpand = (seedId) => {
    const state = createExpandState(cyElements, adjacencyIndex);
    const progState = initProgressiveMode(state, seedId);
    setExpandState(progState);
    setExpandMode(true);
  };

  const handleExpandAll = () => {
    if (currentExpandState) setExpandState(expandAll(currentExpandState));
  };

  const handleReset = () => {
    if (currentExpandState) setExpandState(resetToSeed(currentExpandState));
  };

  const toggleExpandMode = () => {
    if (expandMode) {
      setExpandMode(false);
      setExpandState(null);
    } else if (selected) {
      startExpand(selected.id);
    } else {
      // No seed selected — just enable mode, user picks seed next
      setExpandMode(true);
      setExpandState(createExpandState(cyElements, adjacencyIndex));
    }
  };

  // ── Layout config ──
  const layoutConfig = LAYOUTS[activeLayout]?.config || LAYOUTS.force.config;

  const showSidebar = !mob || gPanel === "filters";
  const showDetail = !mob || gPanel === "detail";
  const showGraph = !mob || gPanel === "graph";

  const totalNodes = cyElements.filter(e => e.group === "nodes").length;
  const visibleNodeCount = expandMode && currentExpandState
    ? currentExpandState.visibleNodeIds.size
    : totalNodes;

  return (
    <div style={{ display: "flex", flexDirection: "column", background: GP.bg, borderRadius: 10, border: `1px solid ${GP.border}`, overflow: "hidden", minHeight: 500 }}>
      {/* ═══ TOOLBAR ═══ */}
      <div style={{ padding: "8px 14px", borderBottom: `1px solid ${GP.border}`, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: GP.surface }}>
        <span style={{ color: GP.muted, fontSize: 9, letterSpacing: 1 }}>{visibleNodeCount} ENTITIES · {graphData.edges.length} LINKS</span>
        <div style={{ flex: 1 }} />

        {/* Year slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 8px", background: GP.bg, border: `1px solid ${GP.border}`, borderRadius: 5 }}>
          <span style={{ fontSize: 8, color: GP.muted, letterSpacing: 1 }}>⏱</span>
          <input type="range" min={2011} max={2026} value={yearFilter} onChange={e => setYearFilter(parseInt(e.target.value))}
            style={{ width: mob ? 60 : 90, height: 3, accentColor: GP.gold, cursor: "pointer" }} />
          <span style={{ fontSize: 9, color: yearFilter < 2026 ? GP.gold : GP.muted, fontWeight: yearFilter < 2026 ? 700 : 400, minWidth: 28, fontVariantNumeric: "tabular-nums" }}>
            {yearFilter < 2026 ? "≤" + yearFilter : "ALL"}
          </span>
        </div>

        {/* Layout switcher */}
        <div style={{ display: "flex", gap: 1 }}>
          {LAYOUT_ORDER.map((key, i) => {
            const L = LAYOUTS[key];
            return (
              <div key={key} onClick={() => setActiveLayout(key)}
                style={{
                  cursor: "pointer", padding: "3px 6px",
                  background: activeLayout === key ? GP.blue + "20" : GP.bg,
                  border: `1px solid ${activeLayout === key ? GP.blue + "50" : GP.border}`,
                  fontSize: 8, color: activeLayout === key ? GP.blue : GP.muted,
                  borderRadius: i === 0 ? "4px 0 0 4px" : i === LAYOUT_ORDER.length - 1 ? "0 4px 4px 0" : "0",
                  fontWeight: activeLayout === key ? 700 : 400, letterSpacing: 0.5,
                }}
                title={L.label}>
                {L.icon}
              </div>
            );
          })}
        </div>

        {/* Color mode */}
        <div style={{ display: "flex", gap: 1 }}>
          {[["default", "◉"], ["pagerank", "PR"], ["betweenness", "BC"], ["community", "🏘"]].map(([mode, label]) => (
            <div key={mode} onClick={() => setColorMode(mode)}
              style={{
                cursor: "pointer", padding: "3px 6px",
                background: colorMode === mode ? GP.gold + "20" : GP.bg,
                border: `1px solid ${colorMode === mode ? GP.gold + "50" : GP.border}`,
                fontSize: 8, color: colorMode === mode ? GP.gold : GP.muted,
                borderRadius: mode === "default" ? "4px 0 0 4px" : mode === "community" ? "0 4px 4px 0" : "0",
                fontWeight: colorMode === mode ? 700 : 400, letterSpacing: 0.5,
              }}
              title={mode === "default" ? "Default" : mode === "pagerank" ? "PageRank" : mode === "betweenness" ? "Betweenness Centrality" : "Communities"}>
              {label}
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <input value={gSearch} onChange={e => setGSearch(e.target.value)} placeholder="Search nodes…"
            style={{ background: GP.bg, border: `1px solid ${GP.border}`, borderRadius: 4, padding: "4px 8px 4px 22px", color: GP.text, fontSize: 10, width: mob ? 120 : 160, outline: "none", fontFamily: "inherit" }} />
          <span style={{ position: "absolute", left: 7, top: 5, fontSize: 10, color: GP.dim }}>⌕</span>
          {searchMatches.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: GP.surface, border: `1px solid ${GP.border}`, borderRadius: 4, marginTop: 2, zIndex: 100, maxHeight: 200, overflowY: "auto" }}>
              {searchMatches.map(n => (
                <div key={n.id} onClick={() => { selectNode(n); if (expandMode && !currentExpandState?.seedId) startExpand(n.id); }}
                  style={{ padding: "5px 8px", cursor: "pointer", borderBottom: `1px solid ${GP.border}`, fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 1, background: NODE_CFG[n.type]?.color || GP.dim }} />
                  <span>{n.label}</span>
                  <span style={{ marginLeft: "auto", fontSize: 8, color: GP.dim }}>{n.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progressive expand toggle */}
        <div onClick={toggleExpandMode}
          title={expandMode ? "Exit Progressive Mode" : "Progressive Expand (right-click to expand)"}
          style={{
            cursor: "pointer", padding: "3px 8px",
            background: expandMode ? GP.cyan + "20" : GP.bg,
            border: `1px solid ${expandMode ? GP.cyan + "40" : GP.border}`,
            borderRadius: 4, fontSize: 9,
            color: expandMode ? GP.cyan : GP.muted,
            fontWeight: expandMode ? 700 : 400,
          }}>
          ⊕
        </div>

        {/* Intelligence panel toggle */}
        <div onClick={() => setShowIntel(v => !v)} title="Toggle Intelligence Panel"
          style={{ cursor: "pointer", padding: "3px 8px", background: showIntel ? GP.red + "20" : GP.bg, border: `1px solid ${showIntel ? GP.red + "40" : GP.border}`, borderRadius: 4, fontSize: 9, color: showIntel ? GP.red : GP.muted, fontWeight: showIntel ? 700 : 400 }}>
          ⚡
        </div>

        {/* Legend toggle */}
        <div onClick={() => setShowLegend(v => !v)} title="Toggle legend"
          style={{ cursor: "pointer", padding: "3px 8px", background: showLegend ? GP.gold + "20" : GP.bg, border: `1px solid ${showLegend ? GP.gold + "40" : GP.border}`, borderRadius: 4, fontSize: 9, color: showLegend ? GP.gold : GP.muted }}>
          ◐
        </div>

        {/* Fit to screen */}
        <div onClick={() => cyRef.current?.fit()} title="Fit to screen"
          style={{ cursor: "pointer", padding: "3px 8px", background: GP.bg, border: `1px solid ${GP.border}`, borderRadius: 4, fontSize: 9, color: GP.muted }}>
          ⟳
        </div>
      </div>

      {/* ═══ MOBILE TABS ═══ */}
      {mob && (
        <div style={{ display: "flex", borderBottom: `1px solid ${GP.border}` }}>
          {[["filters", "⚙ Filters"], ["graph", "◎ Graph"], ["detail", "≡ Detail"], ["intel", "⚡ Intel"]].map(([k, l]) => (
            <div key={k} onClick={() => setGPanel(k)}
              style={{ flex: 1, textAlign: "center", padding: "8px 0", fontSize: 10, letterSpacing: 1, color: gPanel === k ? GP.gold : GP.muted, borderBottom: gPanel === k ? `2px solid ${GP.gold}` : "2px solid transparent", cursor: "pointer" }}>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 400 }}>
        {/* ── Filter sidebar ── */}
        {showSidebar && (
          <div style={{ width: mob ? "100%" : 200, borderRight: mob ? "none" : `1px solid ${GP.border}`, padding: 10, overflowY: "auto", flexShrink: 0, fontSize: 10 }}>
            <div style={{ fontSize: 9, color: GP.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Entity Types</div>
            {Object.entries(NODE_CFG).map(([k, cfg]) => (
              <div key={k} onClick={() => toggleF(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", cursor: "pointer", opacity: filters[k] ? 1 : 0.35 }}>
                <div style={{ width: 11, height: 11, borderRadius: 2, border: `1.5px solid ${cfg.color}`, background: filters[k] ? cfg.color + "25" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: cfg.color }}>{filters[k] ? "✓" : ""}</div>
                <span style={{ color: filters[k] ? GP.text : GP.muted }}>{cfg.icon} {cfg.label}</span>
              </div>
            ))}
            <div style={{ height: 1, background: GP.border, margin: "8px 0" }} />
            <div style={{ fontSize: 9, color: GP.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Relationships</div>
            {Object.entries(REL_CFG).map(([k, cfg]) => (
              <div key={k} onClick={() => toggleR(k)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0", cursor: "pointer", opacity: relFilters[k] ? 1 : 0.3 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, border: `1px solid ${cfg.color}`, background: relFilters[k] ? cfg.color + "25" : "transparent", fontSize: 6, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color }}>{relFilters[k] ? "✓" : ""}</div>
                <span style={{ fontSize: 9, color: relFilters[k] ? GP.text : GP.dim }}>{cfg.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Graph canvas (Cytoscape.js) ── */}
        {showGraph && (
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <CytoscapeGraph
              ref={cyRef}
              elements={visibleElements}
              layoutName={activeLayout}
              layoutConfig={layoutConfig}
              colorMode={colorMode}
              metrics={metrics}
              onNodeHover={setHoverId}
              onNodeSelect={handleNodeSelect}
              onNodeContext={handleNodeContext}
              expandedNodeIds={currentExpandState?.expandedNodeIds || null}
              seedId={currentExpandState?.seedId || null}
            />

            {/* Legend overlay */}
            {showLegend && (
              <div style={{ position: "absolute", bottom: 12, left: 12, background: "#0a0a10ee", border: `1px solid ${GP.border}`, borderRadius: 6, padding: "8px 12px", zIndex: 10 }}>
                <div style={{ fontSize: 7, color: GP.muted, letterSpacing: 1, fontWeight: 600, marginBottom: 4 }}>ENTITY TYPES</div>
                {Object.entries(NODE_CFG).slice(0, 8).map(([k, cfg]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "1px 0" }}>
                    <div style={{ width: 6, height: 6, borderRadius: 1, background: cfg.color + "50", border: `1px solid ${cfg.color}` }} />
                    <span style={{ fontSize: 7, color: GP.muted }}>{cfg.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Expand mode controls overlay */}
            {expandMode && (
              <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 4, zIndex: 10 }}>
                <div onClick={handleExpandAll}
                  style={{ padding: "4px 10px", background: GP.surface + "ee", border: `1px solid ${GP.border}`, borderRadius: 4, fontSize: 9, color: GP.cyan, cursor: "pointer" }}>
                  Expand All
                </div>
                <div onClick={handleReset}
                  style={{ padding: "4px 10px", background: GP.surface + "ee", border: `1px solid ${GP.border}`, borderRadius: 4, fontSize: 9, color: GP.muted, cursor: "pointer" }}>
                  Reset
                </div>
                <span style={{ padding: "4px 8px", fontSize: 8, color: GP.dim, alignSelf: "center", background: GP.surface + "ee", borderRadius: 4 }}>
                  {visibleNodeCount} / {totalNodes}
                </span>
              </div>
            )}

            {/* Expand hint */}
            {expandMode && !currentExpandState?.seedId && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: GP.surface + "ee", border: `1px solid ${GP.cyan}40`, borderRadius: 8, padding: "16px 24px", zIndex: 10, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: GP.cyan, fontWeight: 600, marginBottom: 4 }}>Progressive Expand</div>
                <div style={{ fontSize: 9, color: GP.muted }}>Search for a node or click one to set as seed</div>
              </div>
            )}
          </div>
        )}

        {/* ── Detail panel ── */}
        {showDetail && (
          <div style={{ width: mob ? "100%" : 240, borderLeft: mob ? "none" : `1px solid ${GP.border}`, padding: 10, overflowY: "auto", flexShrink: 0, fontSize: 10, background: GP.surface + "80" }}>
            {selected ? (<>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: nodeColor(selected), boxShadow: `0 0 8px ${nodeColor(selected)}40` }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: GP.text }}>{selected.label}</span>
              </div>
              <div style={{ color: GP.muted, fontSize: 9, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ padding: "1px 6px", borderRadius: 3, background: nodeColor(selected) + "15", color: nodeColor(selected), fontSize: 8 }}>{selected.type}</span>
                {expandMode && (
                  <span onClick={() => startExpand(selected.id)}
                    style={{ padding: "1px 6px", borderRadius: 3, background: GP.cyan + "15", color: GP.cyan, fontSize: 8, cursor: "pointer" }}>
                    Set as seed
                  </span>
                )}
              </div>
              {selected.type === "company" && (<>
                <div style={{ color: GP.muted, marginBottom: 2 }}>{selected.city} · {(selected.sector || []).join(", ")}</div>
                {selected.funding > 0 && <div style={{ color: GP.green, fontWeight: 600, fontSize: 12, margin: "4px 0" }}>
                  {selected.funding >= 1000 ? `$${(selected.funding / 1000).toFixed(1)}B` : `$${selected.funding}M`}
                  <span style={{ fontWeight: 400, fontSize: 9, color: GP.muted, marginLeft: 4 }}>raised</span>
                </div>}
                {selected.employees > 0 && <div style={{ color: GP.muted }}>{selected.employees} employees · Est. {selected.founded || "—"}</div>}
                {onSelectCompany && <div onClick={() => onSelectCompany(parseInt(selected.id.replace("c_", "")))}
                  style={{ marginTop: 6, padding: "4px 10px", background: GP.gold + "15", border: `1px solid ${GP.gold}30`, borderRadius: 4, color: GP.gold, fontSize: 9, cursor: "pointer", textAlign: "center", letterSpacing: 0.5 }}>
                  View Full Profile →
                </div>}
              </>)}
              {selected.type === "fund" && selected.fundType && (
                <div style={{ padding: 6, background: GP.bg, borderLeft: `3px solid ${GP.blue}`, borderRadius: 4, marginBottom: 6 }}>
                  <span style={{ color: GP.blue, fontWeight: 600 }}>{selected.fundType}</span>
                </div>
              )}
              {selected.note && <div style={{ color: GP.dim, marginTop: 4, fontStyle: "italic", fontSize: 9, lineHeight: 1.4 }}>{selected.note}</div>}
              {selected.role && <div style={{ color: GP.purple, marginTop: 2 }}>{selected.role}</div>}
              {(metrics.pagerank[selected.id] !== undefined) && (
                <div style={{ margin: "8px 0", padding: 8, background: GP.bg, borderRadius: 6, border: `1px solid ${GP.border}` }}>
                  <div style={{ fontSize: 8, color: GP.muted, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>⚡ Structural Intelligence</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div><div style={{ fontSize: 7, color: GP.muted }}>PageRank</div><div style={{ fontSize: 14, fontWeight: 700, color: metrics.pagerank[selected.id] > 50 ? GP.gold : GP.text }}>{metrics.pagerank[selected.id]}</div></div>
                    <div><div style={{ fontSize: 7, color: GP.muted }}>Betweenness</div><div style={{ fontSize: 14, fontWeight: 700, color: metrics.betweenness[selected.id] > 40 ? GP.orange : GP.text }}>{metrics.betweenness[selected.id]}</div></div>
                    <div><div style={{ fontSize: 7, color: GP.muted }}>Community</div><div style={{ fontSize: 14, fontWeight: 700, color: metrics.commColors[metrics.communities[selected.id] % metrics.commColors.length] }}>{metrics.communities[selected.id]}</div></div>
                    <div><div style={{ fontSize: 7, color: GP.muted }}>Connections</div><div style={{ fontSize: 14, fontWeight: 700, color: GP.text }}>{detailEdges.length}</div></div>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
                    <div style={{ flex: 1, height: 4, background: GP.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${metrics.pagerank[selected.id]}%`, height: "100%", background: GP.gold, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 7, color: GP.dim }}>PR</span>
                  </div>
                  <div style={{ marginTop: 3, display: "flex", gap: 4, alignItems: "center" }}>
                    <div style={{ flex: 1, height: 4, background: GP.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${metrics.betweenness[selected.id]}%`, height: "100%", background: GP.orange, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 7, color: GP.dim }}>BC</span>
                  </div>
                </div>
              )}
              <div style={{ height: 1, background: GP.border, margin: "10px 0" }} />
              <div style={{ fontSize: 9, color: GP.gold, letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>CONNECTIONS ({detailEdges.length})</div>
              {detailEdges.map((e, i) => (
                <div key={i} onClick={() => { if (e.other) selectNode(e.other); }}
                  style={{ padding: "5px 0", cursor: "pointer", borderBottom: `1px solid ${GP.border}30`, display: "flex", gap: 5, alignItems: "flex-start" }}>
                  <span style={{ color: REL_CFG[e.rel]?.color || GP.dim, fontSize: 9, flexShrink: 0, fontWeight: 600 }}>{e.dir}</span>
                  <div>
                    <span style={{ color: GP.text, fontWeight: 500 }}>{e.other?.label || "?"}</span>
                    <span style={{ color: REL_CFG[e.rel]?.color || GP.dim, fontSize: 8, marginLeft: 4, opacity: 0.7 }}>{REL_CFG[e.rel]?.label || e.rel}</span>
                    {e.note && <div style={{ color: GP.dim, fontSize: 8, marginTop: 1 }}>{e.note}</div>}
                  </div>
                </div>
              ))}
            </>) : showIntel ? (
              <div style={{ padding: 0 }}>
                <div style={{ fontSize: 9, color: GP.red, letterSpacing: 1.5, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>⚡ Structural Watchlist</div>
                <div style={{ fontSize: 8, color: GP.muted, marginBottom: 10, lineHeight: 1.4 }}>
                  Companies flagged by graph-theoretic anomalies: high funding with sparse connections, structural bridge positions, or hidden influence.
                </div>
                <div style={{ fontSize: 8, color: GP.dim, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                  <span>{metrics.watchlist.length} signals</span>
                  <span>{metrics.numCommunities} communities</span>
                </div>
                {metrics.watchlist.slice(0, 15).map((w) => (
                  <div key={w.id} onClick={() => { const n = graphData.nodes.find(n => n.id === w.id); if (n) selectNode(n); }}
                    style={{ padding: "6px 4px", cursor: "pointer", borderBottom: `1px solid ${GP.border}20`, marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: GP.text }}>{w.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 8, color: GP.dim, fontVariantNumeric: "tabular-nums" }}>{w.funding > 0 ? (w.funding >= 1000 ? `$${(w.funding / 1000).toFixed(1)}B` : `$${w.funding}M`) : ""}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {w.signals.map((s, j) => (
                        <span key={j} style={{ padding: "1px 5px", borderRadius: 3, fontSize: 7, background: s.type === "bridge" ? GP.orange + "20" : s.type === "undercovered" ? GP.red + "20" : s.type === "hidden_influence" ? GP.purple + "20" : s.type === "hub" ? GP.gold + "20" : GP.cyan + "20", color: s.type === "bridge" ? GP.orange : s.type === "undercovered" ? GP.red : s.type === "hidden_influence" ? GP.purple : s.type === "hub" ? GP.gold : GP.cyan, letterSpacing: 0.3 }}>{s.icon} {s.label}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 7, color: GP.dim }}>
                      <span>PR:{w.pagerank}</span><span>BC:{w.betweenness}</span><span>Edges:{w.degree}</span>
                    </div>
                  </div>
                ))}
                {colorMode !== "default" && (
                  <div style={{ marginTop: 12, padding: 8, background: GP.bg, borderRadius: 6, border: `1px solid ${GP.border}` }}>
                    <div style={{ fontSize: 8, color: GP.muted, letterSpacing: 1, marginBottom: 4 }}>
                      {colorMode === "pagerank" ? "PAGERANK" : ""}
                      {colorMode === "betweenness" ? "BETWEENNESS CENTRALITY" : ""}
                      {colorMode === "community" ? `COMMUNITIES (${metrics.numCommunities})` : ""}
                    </div>
                    {colorMode === "pagerank" && <div style={{ fontSize: 7, color: GP.dim }}>
                      <span style={{ color: GP.gold }}>■</span> High (&gt;75) · <span style={{ color: GP.green }}>■</span> Med (&gt;50) · <span style={{ color: GP.blue }}>■</span> Low (&gt;25) · <span style={{ color: GP.dim }}>■</span> Minimal
                    </div>}
                    {colorMode === "betweenness" && <div style={{ fontSize: 7, color: GP.dim }}>
                      <span style={{ color: GP.red }}>■</span> Critical (&gt;60) · <span style={{ color: GP.orange }}>■</span> High (&gt;40) · <span style={{ color: GP.cyan }}>■</span> Med (&gt;20) · <span style={{ color: GP.dim }}>■</span> Low
                    </div>}
                    {colorMode === "community" && <div style={{ fontSize: 7, color: GP.dim }}>Nodes colored by detected community cluster</div>}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: GP.dim, textAlign: "center", padding: 30, lineHeight: 1.6 }}>
                <div style={{ fontSize: 20, marginBottom: 8, opacity: 0.3 }}>⊛</div>
                <div style={{ fontSize: 10 }}>Click a node to inspect</div>
                <div style={{ fontSize: 9, marginTop: 4 }}>Scroll to zoom · Drag to pan · Drag node to move</div>
                <div style={{ fontSize: 8, marginTop: 4, color: GP.dim }}>Right-click to expand in ⊕ mode</div>
                <div style={{ fontSize: 8, marginTop: 8, color: GP.dim }}>⚡ Intelligence panel for watchlist</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
