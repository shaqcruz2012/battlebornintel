export function buildGraph(filters, relFilters, yearFilter, data) {
  const { companies, graphFunds, people, externals, accelerators, ecosystemOrgs, listings, verifiedEdges } = data;
  const nodes = [], edges = [], nodeSet = new Set();
  const add = (id, label, type, extra={}) => { if (!nodeSet.has(id)) { nodeSet.add(id); nodes.push({id,label,type,...extra}); } };
  const lnk = (s, t, rel, extra={}) => { if (nodeSet.has(s) && nodeSet.has(t)) edges.push({source:s,target:t,rel,...extra}); };
  if (filters.company) companies.forEach(c => add(`c_${c.id}`, c.name, "company", {stage:c.stage, funding:c.funding, momentum:c.momentum, employees:c.employees, city:c.city, region:c.region, sector:c.sector, eligible:c.eligible, founded:c.founded}));
  if (filters.fund) graphFunds.forEach(f => add(`f_${f.id}`, f.name, "fund", {fundType:f.type}));
  if (filters.sector) { const sec={}; companies.forEach(c => (c.sector||[]).forEach(s => { sec[s]=(sec[s]||0)+1; })); Object.entries(sec).filter(([,n])=>n>=2).forEach(([s,n]) => add(`s_${s}`,s,"sector",{count:n})); }
  if (filters.region) { const names={las_vegas:"Las Vegas",reno:"Reno-Sparks",henderson:"Henderson"}; [...new Set(companies.map(c=>c.region))].forEach(r => add(`r_${r}`,names[r]||r,"region")); }
  if (filters.person) people.forEach(p => add(p.id, p.name, "person", {role:p.role, note:p.note, companyId:p.companyId}));
  if (filters.external) externals.forEach(x => add(x.id, x.name, "external", {etype:x.etype, note:x.note}));
  if (filters.accelerator) accelerators.forEach(a => add(a.id, a.name, "accelerator", {atype:a.atype, city:a.city, region:a.region, founded:a.founded, note:a.note}));
  if (filters.ecosystem) ecosystemOrgs.forEach(o => add(o.id, o.name, "ecosystem", {etype:o.etype, city:o.city, region:o.region, note:o.note}));
  if (filters.exchange) { const exs=new Set(listings.map(l=>l.exchange)); exs.forEach(e => add(`ex_${e}`,e,"exchange")); }
  if (relFilters.eligible_for && filters.fund && filters.company) companies.forEach(c => c.eligible.forEach(f => { if (nodeSet.has(`f_${f}`)) lnk(`c_${c.id}`,`f_${f}`,"eligible_for"); }));
  if (relFilters.operates_in && filters.sector && filters.company) companies.forEach(c => (c.sector||[]).forEach(s => { if (nodeSet.has(`s_${s}`)) lnk(`c_${c.id}`,`s_${s}`,"operates_in"); }));
  if (relFilters.headquartered_in && filters.region && filters.company) companies.forEach(c => { if (nodeSet.has(`r_${c.region}`)) lnk(`c_${c.id}`,`r_${c.region}`,"headquartered_in"); });
  if (filters.person) people.forEach(p => { if (p.companyId && nodeSet.has(`c_${p.companyId}`)) lnk(p.id,`c_${p.companyId}`,"founder_of"); });
  if (relFilters.listed_on && filters.exchange && filters.company) listings.forEach(l => { if (nodeSet.has(`c_${l.companyId}`) && nodeSet.has(`ex_${l.exchange}`)) lnk(`c_${l.companyId}`,`ex_${l.exchange}`,"listed_on",{ticker:l.ticker}); });
  verifiedEdges.forEach(e => { if (nodeSet.has(e.source) && nodeSet.has(e.target) && relFilters[e.rel] !== false && (e.y||2023) <= yearFilter) lnk(e.source, e.target, e.rel, {note:e.note, y:e.y}); });
  return {nodes, edges};
}
