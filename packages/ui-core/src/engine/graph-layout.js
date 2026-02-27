import * as d3 from 'd3';

export function computeLayout(graphData, w, h) {
  if (!graphData.nodes.length) return {nodes:[], edges:[]};
  const ns = graphData.nodes.map(n => ({...n, x: w/2+(Math.random()-0.5)*w*0.6, y: h/2+(Math.random()-0.5)*h*0.6}));
  const nById = {}; ns.forEach(n => nById[n.id] = n);
  const es = graphData.edges.filter(e => nById[e.source] && nById[e.target]).map(e => ({...e, source: nById[e.source], target: nById[e.target]}));
  const sim = d3.forceSimulation(ns)
    .force("link", d3.forceLink(es).id(d=>d.id).distance(d => {
      if (d.rel==="operates_in"||d.rel==="headquartered_in") return 60;
      if (d.rel==="eligible_for") return 80;
      if (d.rel==="program_of"||d.rel==="housed_at") return 70;
      if (d.rel==="accelerated_by"||d.rel==="won_pitch"||d.rel==="incubated_by") return 90;
      return 100;
    }).strength(d => d.rel==="invested_in"||d.rel==="founder_of"||d.rel==="program_of" ? 0.7 : d.rel==="accelerated_by"||d.rel==="housed_at" ? 0.5 : 0.3))
    .force("charge", d3.forceManyBody().strength(d => d.type==="fund"||d.type==="accelerator" ? -250 : d.type==="sector"||d.type==="ecosystem" ? -180 : d.type==="company" ? -60 : -120))
    .force("center", d3.forceCenter(w/2, h/2))
    .force("collision", d3.forceCollide().radius(d => d.type==="fund"||d.type==="accelerator" ? 28 : d.type==="company" ? 10+Math.sqrt(Math.max(0,d.funding||0))*0.2 : 18))
    .force("x", d3.forceX(w/2).strength(0.04)).force("y", d3.forceY(h/2).strength(0.04)).stop();
  const ticks = Math.min(200, Math.max(80, ns.length));
  for (let i = 0; i < ticks; i++) sim.tick();
  const pad = 25;
  ns.forEach(n => { if (isNaN(n.x)) n.x=w/2; if (isNaN(n.y)) n.y=h/2; n.x=Math.max(pad,Math.min(w-pad,n.x)); n.y=Math.max(pad,Math.min(h-pad,n.y)); });
  return {nodes:ns, edges:es};
}
