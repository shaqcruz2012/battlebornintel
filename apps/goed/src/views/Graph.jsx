import { useEffect, useRef, useState, useMemo } from "react";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import { useApi } from "../hooks/useApi.js";
import { GP, NODE_CFG, REL_CFG, GSTAGE_C } from "@bbi/ui-core/constants";
import { getReapPillar } from "@bbi/ui-core/reap";
import ReapChipBar from "../components/ReapChipBar.jsx";
import GraphHoverPanel from "../components/GraphHoverPanel.jsx";

try { cytoscape.use(coseBilkent); } catch (_) { /* already registered */ }

export default function Graph({ isMobile, setSelectedCompany, setView, fundParam }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const { data: graphData } = useApi("/graph" + fundParam);
  const [reapFilter, setReapFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [colorMode, setColorMode] = useState("default");
  const [hoverNode, setHoverNode] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);

  // Build Cytoscape elements from API data
  const elements = useMemo(() => {
    if (!graphData) return [];
    const els = [];
    graphData.nodes.forEach(n => {
      els.push({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          stage: n.stage,
          funding: n.funding || 0,
          ...n,
        },
        classes: [n.type],
      });
    });
    graphData.edges.forEach((e, i) => {
      els.push({
        data: {
          id: `e_${i}`,
          source: e.source,
          target: e.target,
          rel: e.rel,
          note: e.note,
        },
        classes: [e.rel],
      });
    });
    return els;
  }, [graphData]);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || elements.length === 0) return;

    let cy;
    try {
    cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "font-size": 8,
            color: GP.text,
            "text-valign": "bottom",
            "text-margin-y": 4,
            "background-color": (el) => {
              const type = el.data("type");
              if (type === "company") return GSTAGE_C[el.data("stage")] || GP.muted;
              return NODE_CFG[type]?.color || GP.muted;
            },
            width: (el) => {
              const type = el.data("type");
              if (type === "fund") return 40;
              if (type === "accelerator") return 36;
              if (type === "company") return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, el.data("funding"))) * 0.6));
              return 26;
            },
            height: (el) => {
              const type = el.data("type");
              if (type === "fund") return 40;
              if (type === "accelerator") return 36;
              if (type === "company") return Math.min(48, Math.max(12, 10 + Math.sqrt(Math.max(0, el.data("funding"))) * 0.6));
              return 26;
            },
            "border-width": 1,
            "border-color": GP.border,
          },
        },
        {
          selector: "edge",
          style: {
            width: (el) => {
              const rel = el.data("rel");
              if (rel === "invested_in" || rel === "acquired") return 2;
              if (rel === "loaned_to" || rel === "funds") return 1.6;
              return 0.8;
            },
            "line-color": (el) => REL_CFG[el.data("rel")]?.color || GP.dim,
            "curve-style": "bezier",
            opacity: 0.4,
          },
        },
        {
          selector: "node.dimmed",
          style: { opacity: 0.15 },
        },
        {
          selector: "edge.dimmed",
          style: { opacity: 0.05 },
        },
      ],
      layout: {
        name: "cose-bilkent",
        animate: false,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        nodeRepulsion: 4500,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
      },
      minZoom: 0.3,
      maxZoom: 4,
    });

    let hoverTimeout = null;
    cy.on("mouseover", "node", (evt) => {
      if (pinnedRef.current) return;
      clearTimeout(hoverTimeout);
      const node = evt.target;
      const pos = node.renderedPosition();
      setHoverPos({ x: pos.x, y: pos.y });
      setHoverNode({ id: node.id(), ...node.data() });
    });
    cy.on("mouseout", "node", () => {
      if (pinnedRef.current) return;
      hoverTimeout = setTimeout(() => setHoverNode(null), 200);
    });
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setHoverNode({ id: node.id(), ...node.data() });
      const pos = node.renderedPosition();
      setHoverPos({ x: pos.x, y: pos.y });
      pinnedRef.current = true;
      setPinned(true);
    });
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        pinnedRef.current = false;
        setPinned(false);
        setHoverNode(null);
        setSelected(null);
      }
    });

    cyRef.current = cy;

    return () => cy.destroy();
    } catch (err) {
      console.error("Cytoscape init error:", err);
    }
  }, [elements]);

  // Apply REAP filter
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass("dimmed");
    cy.edges().removeClass("dimmed");

    if (reapFilter !== "all") {
      cy.nodes().forEach((node) => {
        const data = node.data();
        let match = false;
        if (data.type === "company" && reapFilter === "entrepreneurs") match = true;
        else if (getReapPillar(data) === reapFilter) match = true;
        if (!match) node.addClass("dimmed");
      });
      cy.edges().forEach((edge) => {
        const src = edge.source();
        const tgt = edge.target();
        if (src.hasClass("dimmed") && tgt.hasClass("dimmed")) edge.addClass("dimmed");
      });
    }
  }, [reapFilter]);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ fontSize: 10, color: GP.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
        Ontological Relationship Graph — Graph Intelligence Active
      </div>
      <ReapChipBar reapFilter={reapFilter} setReapFilter={setReapFilter} />
      <div style={{ display: "flex", gap: 1, marginBottom: 8 }}>
        {[["default","◉"],["pagerank","PR"],["betweenness","BC"],["community","🏘"]].map(([mode,label]) => (
          <div key={mode} onClick={() => setColorMode(mode)} style={{ cursor:"pointer", padding:"3px 6px", background:colorMode===mode?GP.gold+"20":GP.bg, border:`1px solid ${colorMode===mode?GP.gold+"50":GP.border}`, fontSize:8, color:colorMode===mode?GP.gold:GP.muted, borderRadius:mode==="default"?"4px 0 0 4px":mode==="community"?"0 4px 4px 0":"0", fontWeight:colorMode===mode?700:400 }}>{label}</div>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: isMobile ? 400 : 620,
          background: GP.bg,
          borderRadius: 10,
          border: `1px solid ${GP.border}`,
        }}
      />
      <GraphHoverPanel
        node={hoverNode || selected}
        position={hoverPos}
        isMobile={isMobile}
        onPin={() => { pinnedRef.current = true; setPinned(true); }}
      />
    </div>
  );
}
