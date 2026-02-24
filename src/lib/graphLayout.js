import * as d3 from "d3";
import COMPANIES from '../data/companies.json';
import GRAPH_FUNDS from '../data/graphFunds.json';
import PEOPLE from '../data/people.json';
import EXTERNALS from '../data/externals.json';
import ACCELERATORS from '../data/accelerators.json';
import ECOSYSTEM_ORGS from '../data/ecosystem.json';
import LISTINGS from '../data/listings.json';
import VERIFIED_EDGES from '../data/edges.json';

export function buildGraph(filters, relFilters, yearFilter=2026) {
  const nodes = [], edges = [], nodeSet = new Set();
  const add = (id, label, type, extra={}) => { if (!nodeSet.has(id)) { nodeSet.add(id); nodes.push({id,label,type,...extra}); } };
  const lnk = (s, t, rel, extra={}) => { if (nodeSet.has(s) && nodeSet.has(t)) edges.push({source:s,target:t,rel,...extra}); };
  if (filters.company) COMPANIES.forEach(c => add(`c_${c.id}`, c.name, "company", {stage:c.stage, funding:c.funding, momentum:c.momentum, employees:c.employees, city:c.city, region:c.region, sector:c.sector, eligible:c.eligible, founded:c.founded}));
  if (filters.fund) GRAPH_FUNDS.forEach(f => add(`f_${f.id}`, f.name, "fund", {fundType:f.type}));
  if (filters.sector) { const sec={}; COMPANIES.forEach(c => (c.sector||[]).forEach(s => { sec[s]=(sec[s]||0)+1; })); Object.entries(sec).filter(([,n])=>n>=2).forEach(([s,n]) => add(`s_${s}`,s,"sector",{count:n})); }
  if (filters.region) { const names={las_vegas:"Las Vegas",reno:"Reno-Sparks",henderson:"Henderson"}; [...new Set(COMPANIES.map(c=>c.region))].forEach(r => add(`r_${r}`,names[r]||r,"region")); }
  if (filters.person) PEOPLE.forEach(p => add(p.id, p.name, "person", {role:p.role, note:p.note, companyId:p.companyId}));
  if (filters.external) EXTERNALS.forEach(x => add(x.id, x.name, "external", {etype:x.etype, note:x.note}));
  if (filters.accelerator) ACCELERATORS.forEach(a => add(a.id, a.name, "accelerator", {atype:a.atype, city:a.city, region:a.region, founded:a.founded, note:a.note}));
  if (filters.ecosystem) ECOSYSTEM_ORGS.forEach(o => add(o.id, o.name, "ecosystem", {etype:o.etype, city:o.city, region:o.region, note:o.note}));
  if (filters.exchange) { const exs=new Set(LISTINGS.map(l=>l.exchange)); exs.forEach(e => add(`ex_${e}`,e,"exchange")); }
  if (relFilters.eligible_for && filters.fund && filters.company) COMPANIES.forEach(c => c.eligible.forEach(f => { if (nodeSet.has(`f_${f}`)) lnk(`c_${c.id}`,`f_${f}`,"eligible_for"); }));
  if (relFilters.operates_in && filters.sector && filters.company) COMPANIES.forEach(c => (c.sector||[]).forEach(s => { if (nodeSet.has(`s_${s}`)) lnk(`c_${c.id}`,`s_${s}`,"operates_in"); }));
  if (relFilters.headquartered_in && filters.region && filters.company) COMPANIES.forEach(c => { if (nodeSet.has(`r_${c.region}`)) lnk(`c_${c.id}`,`r_${c.region}`,"headquartered_in"); });
  if (filters.person) PEOPLE.forEach(p => { if (p.companyId && nodeSet.has(`c_${p.companyId}`)) lnk(p.id,`c_${p.companyId}`,"founder_of"); });
  if (relFilters.listed_on && filters.exchange && filters.company) LISTINGS.forEach(l => { if (nodeSet.has(`c_${l.companyId}`) && nodeSet.has(`ex_${l.exchange}`)) lnk(`c_${l.companyId}`,`ex_${l.exchange}`,"listed_on",{ticker:l.ticker}); });
  VERIFIED_EDGES.forEach(e => { if (nodeSet.has(e.source) && nodeSet.has(e.target) && relFilters[e.rel] !== false && (e.y||2023) <= yearFilter) lnk(e.source, e.target, e.rel, {note:e.note, y:e.y}); });
  return {nodes, edges};
}

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
  const ticks = Math.min(300, Math.max(120, ns.length * 2));
  for (let i = 0; i < ticks; i++) sim.tick();
  const pad = 25;
  ns.forEach(n => { if (isNaN(n.x)) n.x=w/2; if (isNaN(n.y)) n.y=h/2; n.x=Math.max(pad,Math.min(w-pad,n.x)); n.y=Math.max(pad,Math.min(h-pad,n.y)); });
  return {nodes:ns, edges:es};
}
