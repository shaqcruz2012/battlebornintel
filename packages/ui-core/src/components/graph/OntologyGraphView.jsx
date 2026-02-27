import { useState, useMemo, useCallback } from 'react';
import { GP, NODE_CFG, REL_CFG, GSTAGE_C } from '../../styles/graph-tokens.js';
import { buildGraph } from '../../engine/graph-builder.js';
import { computeLayout } from '../../engine/graph-layout.js';
import { computeGraphMetrics } from '../../engine/graph-metrics.js';
import { usePlatform } from '../../hooks/usePlatform.js';

export default function OntologyGraphView({onSelectCompany}) {
  const { data } = usePlatform();
  const [filters, setFilters] = useState({company:true, fund:true, accelerator:true, sector:false, region:false, person:true, external:true, ecosystem:true, exchange:false});
  const [relFilters, setRelFilters] = useState({eligible_for:true,operates_in:false,headquartered_in:false,invested_in:true,loaned_to:true,partners_with:true,contracts_with:true,acquired:true,founder_of:true,manages:true,listed_on:false,accelerated_by:true,won_pitch:true,incubated_by:true,program_of:true,supports:true,housed_at:true,collaborated_with:true,funds:true,approved_by:true,filed_with:true,competes_with:true});
  const [hoverId, setHoverId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [gPanel, setGPanel] = useState("graph");
  const [layoutKey, setLayoutKey] = useState(0);
  const [gSearch, setGSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x:0,y:0});
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  // -- Intelligence states --
  const [yearFilter, setYearFilter] = useState(2026);
  const [colorMode, setColorMode] = useState("default"); // default|pagerank|betweenness|community
  const [showIntel, setShowIntel] = useState(false);
  const W = 900, H = 620;
  const graphData = useMemo(() => buildGraph(filters, relFilters, yearFilter, data), [filters, relFilters, yearFilter, data]);
  const layout = useMemo(() => computeLayout(graphData, W, H), [graphData, layoutKey]);
  // -- Compute graph intelligence metrics (keyed on graphData, NOT layout — avoids recomputing on shuffle) --
  const metrics = useMemo(() => computeGraphMetrics(layout.nodes, layout.edges), [graphData]);
  const toggleF = k => { setFilters(f => ({...f,[k]:!f[k]})); setLayoutKey(n=>n+1); };
  const toggleR = k => { setRelFilters(r => ({...r,[k]:!r[k]})); setLayoutKey(n=>n+1); };
  const searchMatches = useMemo(() => { if (!gSearch || gSearch.length < 2) return []; const q=gSearch.toLowerCase(); return layout.nodes.filter(n => n.label.toLowerCase().includes(q)).slice(0,8); }, [gSearch, layout.nodes]);
  const mob = typeof window !== "undefined" && window.innerWidth < 700;
  const selectNode = (n) => { setSelected(n); setGSearch(""); if(mob) setGPanel("detail"); };

  // 2-hop neighborhood for Palantir-style lens effect
  const connectedSet = useMemo(() => {
    if (!hoverId) return null;
    const s = new Set([hoverId]);
    const getIds = e => {
      const sid=typeof e.source==="object"?e.source.id:e.source;
      const tid=typeof e.target==="object"?e.target.id:e.target;
      return [sid,tid];
    };
    // 1-hop
    layout.edges.forEach(e => { const [sid,tid]=getIds(e); if(sid===hoverId)s.add(tid); if(tid===hoverId)s.add(sid); });
    // 2-hop (lighter)
    const hop1 = new Set(s);
    layout.edges.forEach(e => { const [sid,tid]=getIds(e); if(hop1.has(sid)&&!s.has(tid))s.add(tid); if(hop1.has(tid)&&!s.has(sid))s.add(sid); });
    return {all:s, hop1};
  }, [hoverId, layout.edges]);

  const detailEdges = useMemo(() => { if (!selected) return []; return layout.edges.filter(e => { const sid=typeof e.source==="object"?e.source.id:e.source; const tid=typeof e.target==="object"?e.target.id:e.target; return sid===selected.id||tid===selected.id; }).map(e => { const sid=typeof e.source==="object"?e.source.id:e.source; const tid=typeof e.target==="object"?e.target.id:e.target; const oid=sid===selected.id?tid:sid; const other=layout.nodes.find(n=>n.id===oid); return {...e,other,dir:sid===selected.id?"\u2192":"\u2190"}; }); }, [selected, layout]);

  const nodeR = n => {
    // In metric modes, scale nodes by their score
    if(colorMode==="pagerank" && metrics.pagerank[n.id]!==undefined) {
      return Math.max(6, 4 + metrics.pagerank[n.id]*0.22);
    }
    if(colorMode==="betweenness" && metrics.betweenness[n.id]!==undefined) {
      return Math.max(6, 4 + metrics.betweenness[n.id]*0.22);
    }
    if(n.type==="fund")return 20; if(n.type==="accelerator")return 18; if(n.type==="ecosystem")return 15; if(n.type==="sector")return 15; if(n.type==="region")return 16; if(n.type==="exchange")return 13; if(n.type==="person")return 11; if(n.type==="external")return 13; return Math.min(24,Math.max(6,5+Math.sqrt(Math.max(0,n.funding||0))*0.3));
  };
  const nodeColor = n => {
    if(colorMode==="community" && metrics.communities[n.id]!==undefined) {
      return metrics.commColors[metrics.communities[n.id] % metrics.commColors.length];
    }
    if(colorMode==="pagerank" && metrics.pagerank[n.id]!==undefined) {
      const v = metrics.pagerank[n.id];
      return v>75?GP.gold:v>50?GP.green:v>25?GP.blue:GP.dim;
    }
    if(colorMode==="betweenness" && metrics.betweenness[n.id]!==undefined) {
      const v = metrics.betweenness[n.id];
      return v>60?GP.red:v>40?GP.orange:v>20?GP.cyan:GP.dim;
    }
    if(n.type==="company")return GSTAGE_C[n.stage]||GP.muted; return NODE_CFG[n.type]?.color||GP.muted;
  };

  // Edge importance for thickness
  const edgeWeight = rel => { if(rel==="invested_in"||rel==="acquired") return 2; if(rel==="loaned_to"||rel==="funds") return 1.6; if(rel==="partners_with"||rel==="contracts_with") return 1.2; return 0.8; };

  // Curved edge path (quadratic bezier with offset for visual separation)
  const edgePath = (sx,sy,tx,ty,i) => {
    const dx=tx-sx, dy=ty-sy, dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<1) return `M${sx},${sy}L${tx},${ty}`;
    const curve = Math.min(dist*0.15, 30);
    const mx=(sx+tx)/2, my=(sy+ty)/2;
    const nx=-dy/dist, ny=dx/dist;
    const off = ((i%3)-1)*curve*0.5;
    const cx=mx+nx*off, cy=my+ny*off;
    return `M${sx},${sy}Q${cx},${cy},${tx},${ty}`;
  };

  // Zoom/pan handlers
  const handleWheel = useCallback(e => {
    e.preventDefault();
    const dz = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.3, Math.min(4, z * dz)));
  }, []);
  const handleMouseDown = useCallback(e => { if(e.button===0 && e.target.tagName==="svg"){ setDragging(true); setDragStart({x:e.clientX-pan.x,y:e.clientY-pan.y}); } }, [pan]);
  const handleMouseMove = useCallback(e => { if(dragging&&dragStart){ setPan({x:e.clientX-dragStart.x,y:e.clientY-dragStart.y}); } }, [dragging,dragStart]);
  const handleMouseUp = useCallback(() => { setDragging(false); setDragStart(null); }, []);
  const resetView = () => { setZoom(1); setPan({x:0,y:0}); };

  const showSidebar = !mob || gPanel === "filters";
  const showDetail = !mob || gPanel === "detail";
  const showGraph = !mob || gPanel === "graph";

  // Compute viewBox based on zoom/pan
  const vbW = W/zoom, vbH = H/zoom;
  const vbX = (W-vbW)/2 - pan.x/zoom;
  const vbY = (H-vbH)/2 - pan.y/zoom;

  return (
    <div style={{display:"flex",flexDirection:"column",background:GP.bg,borderRadius:10,border:`1px solid ${GP.border}`,overflow:"hidden",minHeight:500}}>
      {/* Graph header */}
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${GP.border}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:GP.surface}}>
        <span style={{color:GP.muted,fontSize:9,letterSpacing:1}}>{layout.nodes.length} ENTITIES · {layout.edges.length} LINKS</span>
        <div style={{flex:1}}/>
        {/* -- Time Slider -- */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 8px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:5}}>
          <span style={{fontSize:8,color:GP.muted,letterSpacing:1}}>{"\u23F1"}</span>
          <input type="range" min={2011} max={2026} value={yearFilter} onChange={e=>{setYearFilter(parseInt(e.target.value));setLayoutKey(n=>n+1);}}
            style={{width:mob?60:90,height:3,accentColor:GP.gold,cursor:"pointer"}}/>
          <span style={{fontSize:9,color:yearFilter<2026?GP.gold:GP.muted,fontWeight:yearFilter<2026?700:400,minWidth:28,fontVariantNumeric:"tabular-nums"}}>{yearFilter<2026?"\u2264"+yearFilter:"ALL"}</span>
        </div>
        {/* -- Color Mode -- */}
        <div style={{display:"flex",gap:1}}>
          {[["default","\u25C9"],["pagerank","PR"],["betweenness","BC"],["community","\uD83C\uDFD8"]].map(([mode,label]) => (
            <div key={mode} onClick={()=>setColorMode(mode)} style={{cursor:"pointer",padding:"3px 6px",background:colorMode===mode?GP.gold+"20":GP.bg,border:`1px solid ${colorMode===mode?GP.gold+"50":GP.border}`,fontSize:8,color:colorMode===mode?GP.gold:GP.muted,borderRadius:mode==="default"?"4px 0 0 4px":mode==="community"?"0 4px 4px 0":"0",fontWeight:colorMode===mode?700:400,letterSpacing:0.5}} title={mode==="default"?"Default":mode==="pagerank"?"PageRank":mode==="betweenness"?"Betweenness Centrality":"Communities"}>{label}</div>
          ))}
        </div>
        <div style={{position:"relative"}}>
          <input value={gSearch} onChange={e=>setGSearch(e.target.value)} placeholder="Search nodes\u2026" style={{background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:4,padding:"4px 8px 4px 22px",color:GP.text,fontSize:10,width:mob?120:160,outline:"none",fontFamily:"inherit"}}/>
          <span style={{position:"absolute",left:7,top:5,fontSize:10,color:GP.dim}}>{"\u2315"}</span>
          {searchMatches.length > 0 && (
            <div style={{position:"absolute",top:"100%",left:0,right:0,background:GP.surface,border:`1px solid ${GP.border}`,borderRadius:4,marginTop:2,zIndex:100,maxHeight:200,overflowY:"auto"}}>
              {searchMatches.map(n => (
                <div key={n.id} onClick={()=>selectNode(n)} style={{padding:"5px 8px",cursor:"pointer",borderBottom:`1px solid ${GP.border}`,fontSize:10,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:6,height:6,borderRadius:1,background:NODE_CFG[n.type]?.color||GP.dim}}/><span>{n.label}</span>
                  <span style={{marginLeft:"auto",fontSize:8,color:GP.dim}}>{n.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Zoom controls */}
        <div style={{display:"flex",gap:2}}>
          <div onClick={()=>setZoom(z=>Math.min(4,z*1.3))} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:"4px 0 0 4px",fontSize:10,color:GP.muted}}>+</div>
          <div onClick={resetView} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,fontSize:9,color:GP.muted}}>{Math.round(zoom*100)}%</div>
          <div onClick={()=>setZoom(z=>Math.max(0.3,z*0.7))} style={{cursor:"pointer",padding:"3px 7px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:"0 4px 4px 0",fontSize:10,color:GP.muted}}>{"\u2212"}</div>
        </div>
        <div onClick={()=>setShowIntel(v=>!v)} title="Toggle Intelligence Panel" style={{cursor:"pointer",padding:"3px 8px",background:showIntel?GP.red+"20":GP.bg,border:`1px solid ${showIntel?GP.red+"40":GP.border}`,borderRadius:4,fontSize:9,color:showIntel?GP.red:GP.muted,fontWeight:showIntel?700:400}}>{"\u26A1"}</div>
        <div onClick={()=>setShowLegend(v=>!v)} title="Toggle legend" style={{cursor:"pointer",padding:"3px 8px",background:showLegend?GP.gold+"20":GP.bg,border:`1px solid ${showLegend?GP.gold+"40":GP.border}`,borderRadius:4,fontSize:9,color:showLegend?GP.gold:GP.muted}}>{"\u25D0"}</div>
        <div onClick={()=>setLayoutKey(n=>n+1)} title="Shuffle layout" style={{cursor:"pointer",padding:"3px 8px",background:GP.bg,border:`1px solid ${GP.border}`,borderRadius:4,fontSize:9,color:GP.muted}}>{"\u27F3"}</div>
      </div>
      {/* Mobile tabs */}
      {mob && (
        <div style={{display:"flex",borderBottom:`1px solid ${GP.border}`}}>
          {[["filters","\u2699 Filters"],["graph","\u25CE Graph"],["detail","\u2261 Detail"],["intel","\u26A1 Intel"]].map(([k,l]) => (
            <div key={k} onClick={()=>setGPanel(k)} style={{flex:1,textAlign:"center",padding:"8px 0",fontSize:10,letterSpacing:1,color:gPanel===k?GP.gold:GP.muted,borderBottom:gPanel===k?`2px solid ${GP.gold}`:"2px solid transparent",cursor:"pointer"}}>{l}</div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:400}}>
        {/* LEFT: Filters */}
        {showSidebar && (
          <div style={{width:mob?"100%":200,borderRight:mob?"none":`1px solid ${GP.border}`,padding:10,overflowY:"auto",flexShrink:0,fontSize:10}}>
            <div style={{fontSize:9,color:GP.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Entity Types</div>
            {Object.entries(NODE_CFG).map(([k,cfg]) => (
              <div key={k} onClick={()=>toggleF(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",cursor:"pointer",opacity:filters[k]?1:0.35}}>
                <div style={{width:11,height:11,borderRadius:2,border:`1.5px solid ${cfg.color}`,background:filters[k]?cfg.color+"25":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:cfg.color}}>{filters[k]?"\u2713":""}</div>
                <span style={{color:filters[k]?GP.text:GP.muted}}>{cfg.icon} {cfg.label}</span>
              </div>
            ))}
            <div style={{height:1,background:GP.border,margin:"8px 0"}}/>
            <div style={{fontSize:9,color:GP.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Relationships</div>
            {Object.entries(REL_CFG).map(([k,cfg]) => (
              <div key={k} onClick={()=>toggleR(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0",cursor:"pointer",opacity:relFilters[k]?1:0.3}}>
                <div style={{width:10,height:10,borderRadius:2,border:`1px solid ${cfg.color}`,background:relFilters[k]?cfg.color+"25":"transparent",fontSize:6,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.color}}>{relFilters[k]?"\u2713":""}</div>
                <span style={{fontSize:9,color:relFilters[k]?GP.text:GP.dim}}>{cfg.label}</span>
              </div>
            ))}
          </div>
        )}
        {/* CENTER: SVG Canvas */}
        {showGraph && (
          <div style={{flex:1,position:"relative",overflow:"hidden",cursor:dragging?"grabbing":"grab"}}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel}>
            <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} style={{width:"100%",height:"100%",display:"block",background:"#050508"}}>
              {/* SVG Defs: glow filters, arrow markers, grid */}
              <defs>
                <filter id="glow-edge" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="glow-pulse" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="8" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* Arrow markers per rel color */}
                {Object.entries(REL_CFG).map(([k,cfg]) => (
                  <marker key={k} id={`arr-${k}`} viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,3 L0,6 Z" fill={cfg.color} fillOpacity={0.6}/>
                  </marker>
                ))}
                {/* Radial gradient for selected node */}
                <radialGradient id="sel-glow">
                  <stop offset="0%" stopColor={GP.gold} stopOpacity="0.3"/>
                  <stop offset="70%" stopColor={GP.gold} stopOpacity="0.05"/>
                  <stop offset="100%" stopColor={GP.gold} stopOpacity="0"/>
                </radialGradient>
                {/* Background grid pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="0.5" fill="#1a1a25"/>
                </pattern>
                {/* Pulse animation */}
                <style>{`
                  @keyframes pulse { 0%{r:0;opacity:0.6} 100%{r:40;opacity:0} }
                  .pulse-ring { animation: pulse 2s ease-out infinite; }
                  @keyframes glow-breathe { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
                  .breathe { animation: glow-breathe 3s ease-in-out infinite; }
                `}</style>
              </defs>

              {/* Background grid */}
              <rect x={vbX-50} y={vbY-50} width={vbW+100} height={vbH+100} fill="url(#grid)"/>

              {/* Edges: curved bezier with glow */}
              {layout.edges.map((e,i) => {
                const sx=typeof e.source==="object"?e.source.x:0,sy=typeof e.source==="object"?e.source.y:0;
                const tx=typeof e.target==="object"?e.target.x:0,ty=typeof e.target==="object"?e.target.y:0;
                const sid=typeof e.source==="object"?e.source.id:e.source,tid=typeof e.target==="object"?e.target.id:e.target;
                const cfg=REL_CFG[e.rel]||{color:GP.dim,dash:""};
                const isH=hoverId&&(sid===hoverId||tid===hoverId);
                const isSel=selected&&(sid===selected.id||tid===selected.id);
                const isDim=hoverId&&!isH;
                const w=edgeWeight(e.rel);
                const d=edgePath(sx,sy,tx,ty,i);
                // Temporal brightness: edges from yearFilter year glow brighter
                const eYear = e.y||2023;
                const isRecent = yearFilter<2026 && eYear===yearFilter;
                const temporalOp = isRecent ? 0.35 : 1;
                return <g key={i}>
                  {/* Glow underlayer for active/recent edges */}
                  {(isH||isSel||isRecent) && <path d={d} fill="none" stroke={isRecent&&!isH&&!isSel?GP.gold:cfg.color} strokeWidth={isRecent&&!isH?w*2:w*3} strokeOpacity={isRecent&&!isH?0.25:0.15} filter="url(#glow-edge)"/>}
                  <path d={d} fill="none" stroke={isRecent&&!isH&&!isSel?GP.gold:cfg.color}
                    strokeWidth={isH?w*2.5:isSel?w*1.5:isRecent?w*1.2:w*0.5}
                    strokeOpacity={isDim?0.03:isH?0.9:isSel?0.5:isRecent?0.5:0.12}
                    strokeDasharray={cfg.dash}
                    markerEnd={isH||isSel?`url(#arr-${e.rel})`:""}/>
                </g>;
              })}

              {/* Nodes */}
              {layout.nodes.map(n => {
                const r=nodeR(n),col=nodeColor(n);
                const isH=hoverId===n.id,isSel=selected?.id===n.id;
                const inHop1=connectedSet?.hop1?.has(n.id);
                const inHop2=connectedSet?.all?.has(n.id)&&!inHop1;
                const isDim=connectedSet&&!connectedSet.all.has(n.id);
                const showLabel=isH||isSel||r>13||["fund","accelerator","ecosystem","region","exchange"].includes(n.type)||(inHop1&&hoverId);
                const opacity=isDim?0.06:inHop2?0.35:1;
                return (
                  <g key={n.id} style={{cursor:"pointer",opacity,transition:"opacity 0.2s"}}
                    onMouseEnter={()=>setHoverId(n.id)} onMouseLeave={()=>setHoverId(null)}
                    onClick={e=>{e.stopPropagation();selectNode(n);}}
                    onTouchStart={e=>{e.preventDefault();selectNode(n);}}>

                    {/* Selected: pulsing ring + radial glow */}
                    {isSel && <>
                      <circle cx={n.x} cy={n.y} r={r+20} fill="url(#sel-glow)"/>
                      <circle cx={n.x} cy={n.y} r={r+8} fill="none" stroke={GP.gold} strokeWidth={1} className="pulse-ring"/>
                      <circle cx={n.x} cy={n.y} r={r+5} fill="none" stroke={GP.gold} strokeWidth={1.5} strokeDasharray="3,3" className="breathe"/>
                    </>}

                    {/* Hover: glow halo */}
                    {isH && <circle cx={n.x} cy={n.y} r={r+8} fill={col} fillOpacity={0.08} filter="url(#glow-node)"/>}

                    {/* Node shape */}
                    {n.type==="accelerator" ? (
                      <polygon points={`${n.x},${n.y-r} ${n.x-r*0.87},${n.y+r*0.5} ${n.x+r*0.87},${n.y+r*0.5}`}
                        fill={col+(isH||isSel?"40":"15")} stroke={col} strokeWidth={isH?2:isSel?1.5:0.8}
                        filter={isH?"url(#glow-node)":""}/>
                    ) : (
                      <circle cx={n.x} cy={n.y} r={r}
                        fill={col+(isH||isSel?"40":"12")} stroke={col} strokeWidth={isH?2:isSel?1.5:0.8}
                        filter={isH?"url(#glow-node)":""}/>
                    )}

                    {/* Inner icon for ecosystem */}
                    {n.type==="ecosystem" && <text x={n.x} y={n.y+3} textAnchor="middle" fill={col} fontSize={r*0.7} fontWeight={700}>{"\u2295"}</text>}

                    {/* Label */}
                    {showLabel && <>
                      {/* Shadow for readability */}
                      <text x={n.x} y={n.y+r+(isH?13:10)} textAnchor="middle" fill="#050508" fontSize={isH?10:["accelerator","ecosystem"].includes(n.type)?8.5:7.5} fontWeight={isH?700:400} stroke="#050508" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke">{n.label.length>20?n.label.slice(0,20)+"\u2026":n.label}</text>
                      <text x={n.x} y={n.y+r+(isH?13:10)} textAnchor="middle" fill={isH?GP.text:inHop1?GP.text:GP.muted} fontSize={isH?10:["accelerator","ecosystem"].includes(n.type)?8.5:7.5} fontWeight={isH?700:["accelerator","fund"].includes(n.type)?600:400}>{n.label.length>20?n.label.slice(0,20)+"\u2026":n.label}</text>
                    </>}

                    {/* Hover funding tooltip */}
                    {isH && n.type==="company" && n.funding>0 && <>
                      <text x={n.x} y={n.y-r-6} textAnchor="middle" fill="#050508" fontSize={8} fontWeight={600} stroke="#050508" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke">{n.funding>=1000?`$${(n.funding/1000).toFixed(1)}B`:`$${n.funding}M`}</text>
                      <text x={n.x} y={n.y-r-6} textAnchor="middle" fill={GP.green} fontSize={8} fontWeight={600}>{n.funding>=1000?`$${(n.funding/1000).toFixed(1)}B`:`$${n.funding}M`}</text>
                    </>}
                  </g>
                );
              })}

              {/* Floating legend overlay */}
              {showLegend && (
                <g transform={`translate(${vbX+8},${vbY+vbH-120})`}>
                  <rect x={0} y={0} width={130} height={112} rx={6} fill="#0a0a10" fillOpacity={0.9} stroke={GP.border}/>
                  <text x={8} y={14} fill={GP.muted} fontSize={7} letterSpacing="1" fontWeight={600}>ENTITY TYPES</text>
                  {Object.entries(NODE_CFG).slice(0,8).map(([k,cfg],i) => (
                    <g key={k} transform={`translate(8,${22+i*11})`}>
                      <circle cx={4} cy={0} r={3} fill={cfg.color+"50"} stroke={cfg.color} strokeWidth={0.8}/>
                      <text x={12} y={3} fill={GP.muted} fontSize={7}>{cfg.label}</text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        )}
        {/* RIGHT: Detail */}
        {showDetail && (
          <div style={{width:mob?"100%":240,borderLeft:mob?"none":`1px solid ${GP.border}`,padding:10,overflowY:"auto",flexShrink:0,fontSize:10,background:GP.surface+"80"}}>
            {selected ? (<>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <div style={{width:12,height:12,borderRadius:3,background:nodeColor(selected),boxShadow:`0 0 8px ${nodeColor(selected)}40`}}/>
                <span style={{fontWeight:700,fontSize:13,color:GP.text}}>{selected.label}</span>
              </div>
              <div style={{color:GP.muted,fontSize:9,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5,display:"flex",alignItems:"center",gap:6}}>
                <span style={{padding:"1px 6px",borderRadius:3,background:nodeColor(selected)+"15",color:nodeColor(selected),fontSize:8}}>{selected.type}</span>
              </div>
              {selected.type==="company" && (<>
                <div style={{color:GP.muted,marginBottom:2}}>{selected.city} · {(selected.sector||[]).join(", ")}</div>
                {selected.funding>0 && <div style={{color:GP.green,fontWeight:600,fontSize:12,margin:"4px 0"}}>
                  {selected.funding>=1000?`$${(selected.funding/1000).toFixed(1)}B`:`$${selected.funding}M`}
                  <span style={{fontWeight:400,fontSize:9,color:GP.muted,marginLeft:4}}>raised</span>
                </div>}
                {selected.employees>0 && <div style={{color:GP.muted}}>{selected.employees} employees · Est. {selected.founded||"\u2014"}</div>}
                {onSelectCompany && <div onClick={()=>onSelectCompany(parseInt(selected.id.replace("c_","")))} style={{marginTop:6,padding:"4px 10px",background:GP.gold+"15",border:`1px solid ${GP.gold}30`,borderRadius:4,color:GP.gold,fontSize:9,cursor:"pointer",textAlign:"center",letterSpacing:0.5}}>View Full Profile {"\u2192"}</div>}
              </>)}
              {selected.type==="fund" && selected.fundType && (
                <div style={{padding:6,background:GP.bg,borderLeft:`3px solid ${GP.blue}`,borderRadius:4,marginBottom:6}}>
                  <span style={{color:GP.blue,fontWeight:600}}>{selected.fundType}</span>
                </div>
              )}
              {selected.note && <div style={{color:GP.dim,marginTop:4,fontStyle:"italic",fontSize:9,lineHeight:1.4}}>{selected.note}</div>}
              {selected.role && <div style={{color:GP.purple,marginTop:2}}>{selected.role}</div>}
              {/* -- Structural Metrics -- */}
              {(metrics.pagerank[selected.id]!==undefined) && (
                <div style={{margin:"8px 0",padding:8,background:GP.bg,borderRadius:6,border:`1px solid ${GP.border}`}}>
                  <div style={{fontSize:8,color:GP.muted,letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>{"\u26A1"} Structural Intelligence</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <div><div style={{fontSize:7,color:GP.muted}}>PageRank</div><div style={{fontSize:14,fontWeight:700,color:metrics.pagerank[selected.id]>50?GP.gold:GP.text}}>{metrics.pagerank[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Betweenness</div><div style={{fontSize:14,fontWeight:700,color:metrics.betweenness[selected.id]>40?GP.orange:GP.text}}>{metrics.betweenness[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Community</div><div style={{fontSize:14,fontWeight:700,color:metrics.commColors[metrics.communities[selected.id]%metrics.commColors.length]}}>{metrics.communities[selected.id]}</div></div>
                    <div><div style={{fontSize:7,color:GP.muted}}>Connections</div><div style={{fontSize:14,fontWeight:700,color:GP.text}}>{detailEdges.length}</div></div>
                  </div>
                  {/* Mini bar visualization */}
                  <div style={{marginTop:6,display:"flex",gap:4,alignItems:"center"}}>
                    <div style={{flex:1,height:4,background:GP.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${metrics.pagerank[selected.id]}%`,height:"100%",background:GP.gold,borderRadius:2,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:7,color:GP.dim}}>PR</span>
                  </div>
                  <div style={{marginTop:3,display:"flex",gap:4,alignItems:"center"}}>
                    <div style={{flex:1,height:4,background:GP.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{width:`${metrics.betweenness[selected.id]}%`,height:"100%",background:GP.orange,borderRadius:2,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:7,color:GP.dim}}>BC</span>
                  </div>
                </div>
              )}
              <div style={{height:1,background:GP.border,margin:"10px 0"}}/>
              <div style={{fontSize:9,color:GP.gold,letterSpacing:1,marginBottom:6,fontWeight:600}}>CONNECTIONS ({detailEdges.length})</div>
              {detailEdges.map((e,i) => (
                <div key={i} onClick={()=>{if(e.other)selectNode(e.other);}} style={{padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${GP.border}30`,display:"flex",gap:5,alignItems:"flex-start"}}>
                  <span style={{color:REL_CFG[e.rel]?.color||GP.dim,fontSize:9,flexShrink:0,fontWeight:600}}>{e.dir}</span>
                  <div>
                    <span style={{color:GP.text,fontWeight:500}}>{e.other?.label||"?"}</span>
                    <span style={{color:REL_CFG[e.rel]?.color||GP.dim,fontSize:8,marginLeft:4,opacity:0.7}}>{REL_CFG[e.rel]?.label||e.rel}</span>
                    {e.note && <div style={{color:GP.dim,fontSize:8,marginTop:1}}>{e.note}</div>}
                  </div>
                </div>
              ))}
            </>) : showIntel ? (
              /* -- Intelligence Watchlist Panel -- */
              <div style={{padding:0}}>
                <div style={{fontSize:9,color:GP.red,letterSpacing:1.5,marginBottom:8,fontWeight:700,textTransform:"uppercase",display:"flex",alignItems:"center",gap:4}}>{"\u26A1"} Structural Watchlist</div>
                <div style={{fontSize:8,color:GP.muted,marginBottom:10,lineHeight:1.4}}>
                  Companies flagged by graph-theoretic anomalies: high funding with sparse connections, structural bridge positions, or hidden influence.
                </div>
                <div style={{fontSize:8,color:GP.dim,marginBottom:6,display:"flex",justifyContent:"space-between"}}>
                  <span>{metrics.watchlist.length} signals</span>
                  <span>{metrics.numCommunities} communities</span>
                </div>
                {metrics.watchlist.slice(0,15).map((w,i) => (
                  <div key={w.id} onClick={()=>{const n=layout.nodes.find(n=>n.id===w.id);if(n)selectNode(n);}} style={{padding:"6px 4px",cursor:"pointer",borderBottom:`1px solid ${GP.border}20`,marginBottom:2}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                      <span style={{fontSize:9,fontWeight:600,color:GP.text}}>{w.name}</span>
                      <span style={{marginLeft:"auto",fontSize:8,color:GP.dim,fontVariantNumeric:"tabular-nums"}}>{w.funding>0?(w.funding>=1000?`$${(w.funding/1000).toFixed(1)}B`:`$${w.funding}M`):""}</span>
                    </div>
                    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                      {w.signals.map((s,j) => (
                        <span key={j} style={{padding:"1px 5px",borderRadius:3,fontSize:7,background:s.type==="bridge"?GP.orange+"20":s.type==="undercovered"?GP.red+"20":s.type==="hidden_influence"?GP.purple+"20":s.type==="hub"?GP.gold+"20":GP.cyan+"20",color:s.type==="bridge"?GP.orange:s.type==="undercovered"?GP.red:s.type==="hidden_influence"?GP.purple:s.type==="hub"?GP.gold:GP.cyan,letterSpacing:0.3}}>{s.icon} {s.label}</span>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:3,fontSize:7,color:GP.dim}}>
                      <span>PR:{w.pagerank}</span><span>BC:{w.betweenness}</span><span>Edges:{w.degree}</span>
                    </div>
                  </div>
                ))}
                {/* -- Color Mode Legend -- */}
                {colorMode !== "default" && (
                  <div style={{marginTop:12,padding:8,background:GP.bg,borderRadius:6,border:`1px solid ${GP.border}`}}>
                    <div style={{fontSize:8,color:GP.muted,letterSpacing:1,marginBottom:4}}>
                      {colorMode==="pagerank"?"PAGERANK":""}
                      {colorMode==="betweenness"?"BETWEENNESS CENTRALITY":""}
                      {colorMode==="community"?`COMMUNITIES (${metrics.numCommunities})`:""}
                    </div>
                    {colorMode==="pagerank" && <div style={{fontSize:7,color:GP.dim}}>
                      <span style={{color:GP.gold}}>{"\u25A0"}</span> High (&gt;75) · <span style={{color:GP.green}}>{"\u25A0"}</span> Med (&gt;50) · <span style={{color:GP.blue}}>{"\u25A0"}</span> Low (&gt;25) · <span style={{color:GP.dim}}>{"\u25A0"}</span> Minimal
                    </div>}
                    {colorMode==="betweenness" && <div style={{fontSize:7,color:GP.dim}}>
                      <span style={{color:GP.red}}>{"\u25A0"}</span> Critical (&gt;60) · <span style={{color:GP.orange}}>{"\u25A0"}</span> High (&gt;40) · <span style={{color:GP.cyan}}>{"\u25A0"}</span> Med (&gt;20) · <span style={{color:GP.dim}}>{"\u25A0"}</span> Low
                    </div>}
                    {colorMode==="community" && <div style={{fontSize:7,color:GP.dim}}>Nodes colored by detected community cluster</div>}
                  </div>
                )}
              </div>
            ) : (
              <div style={{color:GP.dim,textAlign:"center",padding:30,lineHeight:1.6}}>
                <div style={{fontSize:20,marginBottom:8,opacity:0.3}}>{"\u229B"}</div>
                <div style={{fontSize:10}}>Click a node to inspect</div>
                <div style={{fontSize:9,marginTop:4}}>Scroll to zoom · Drag to pan</div>
                <div style={{fontSize:8,marginTop:8,color:GP.dim}}>{"\u26A1"} Intelligence panel for watchlist</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
