import { GP } from "./constants.js";

const COMM_COLORS = [GP.gold,GP.green,GP.blue,GP.purple,GP.orange,GP.red,GP.cyan,GP.pink,GP.lime,GP.teal,"#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"];

// --- IRS Computation ---
export const SHEAT = { AI:95, Cybersecurity:88, Defense:85, Cleantech:82, Mining:78, Aerospace:80, Cloud:80, "Data Center":80, Energy:78, Solar:75, Robotics:78, Biotech:72, Fintech:70, Gaming:68, Blockchain:50, Drones:75, Construction:65, Logistics:65, "Materials Science":70, "Real Estate":50, Computing:70, Water:72, Media:58, Payments:68, IoT:65, Manufacturing:60, Semiconductors:82, Hospitality:60, Cannabis:45, Analytics:75, Satellite:82, Identity:80, AdTech:65, Education:62, Healthcare:70, Consumer:55, Fitness:60, Mobile:58, Banking:55, Retail:52 };
export const STAGE_NORMS = { pre_seed:0.5, seed:3, series_a:15, series_b:50, series_c_plus:200, growth:500 };

export function computeIRS(c) {
  const m = Math.min(c.momentum || 0, 100);
  const fv = Math.min((c.funding / (STAGE_NORMS[c.stage] || 3)) * 50, 100);
  const sScores = (c.sector || []).map(s => SHEAT[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs = c.employees >= 100 ? 80 : c.employees >= 30 ? 60 : c.employees >= 15 ? 45 : c.employees >= 5 ? 25 : 10;
  const hasSsbci = c.eligible.some(e => ["bbv","fundnv","1864"].includes(e));
  const hasSbir = c.eligible.includes("sbir");
  const ns = Math.min((c.eligible.length || 0) * 15 + (c.employees > 0 ? 15 : 0), 100);
  const ts = Math.min(30 + (c.employees > 10 ? 25 : 0) + (c.eligible.length * 10), 100);
  const dq = Math.min(60 + (c.description ? 20 : 0) + (c.eligible.length > 0 ? 20 : 0), 100);
  const irs = Math.round(m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 + dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12);
  const grade = irs >= 85 ? "A" : irs >= 78 ? "A-" : irs >= 72 ? "B+" : irs >= 65 ? "B" : irs >= 58 ? "B-" : irs >= 50 ? "C+" : irs >= 42 ? "C" : "D";
  const triggers = [];
  if (fv >= 75) triggers.push("rapid_funding");
  if (sh >= 85) triggers.push("hot_sector");
  if (hasSsbci) triggers.push("ssbci_eligible");
  if (hs >= 50) triggers.push("hiring_surge");
  if (m >= 80) triggers.push("high_momentum");
  if (hasSbir) triggers.push("grant_validated");
  return { ...c, irs, grade, triggers, dims: { momentum: m, funding_velocity: Math.round(fv), market_timing: sh, hiring: hs, data_quality: dq, network: ns, team: ts } };
}

export function computeGraphMetrics(nodes, edges) {
  if (!nodes.length) return { pagerank:{}, betweenness:{}, communities:{}, watchlist:[] };
  const ids = nodes.map(n=>n.id);
  const idx = {}; ids.forEach((id,i) => idx[id]=i);
  const N = ids.length;

  // Build adjacency list (undirected for structural metrics)
  const adj = Array.from({length:N}, ()=>[]);
  const edgeList = [];
  edges.forEach(e => {
    const si=idx[typeof e.source==="object"?e.source.id:e.source];
    const ti=idx[typeof e.target==="object"?e.target.id:e.target];
    if(si!==undefined && ti!==undefined && si!==ti) {
      adj[si].push(ti); adj[ti].push(si);
      edgeList.push([si,ti]);
    }
  });

  // ── PageRank (power iteration, damping=0.85, 40 iterations) ──
  const d = 0.85;
  let pr = new Float64Array(N).fill(1/N);
  for(let iter=0; iter<40; iter++){
    const next = new Float64Array(N).fill((1-d)/N);
    for(let i=0;i<N;i++){
      if(adj[i].length>0){
        const share = pr[i]/adj[i].length;
        for(const j of adj[i]) next[j] += d*share;
      } else { // dangling node: distribute evenly
        for(let j=0;j<N;j++) next[j] += d*pr[i]/N;
      }
    }
    pr = next;
  }
  // Normalize to 0-100
  const prMax = Math.max(...pr), prMin = Math.min(...pr);
  const prRange = prMax-prMin||1;
  const pagerank = {};
  ids.forEach((id,i) => pagerank[id] = Math.round(((pr[i]-prMin)/prRange)*100));

  // ── Betweenness Centrality (Brandes' algorithm) ──
  const bc = new Float64Array(N).fill(0);
  for(let s=0;s<N;s++){
    const stack=[], pred=Array.from({length:N},()=>[]);
    const sigma=new Float64Array(N).fill(0); sigma[s]=1;
    const dist=new Int32Array(N).fill(-1); dist[s]=0;
    const queue=[s];
    let qi=0;
    while(qi<queue.length){
      const v=queue[qi++]; stack.push(v);
      for(const w of adj[v]){
        if(dist[w]<0){ dist[w]=dist[v]+1; queue.push(w); }
        if(dist[w]===dist[v]+1){ sigma[w]+=sigma[v]; pred[w].push(v); }
      }
    }
    const delta=new Float64Array(N).fill(0);
    while(stack.length){
      const w=stack.pop();
      for(const v of pred[w]) delta[v]+=(sigma[v]/sigma[w])*(1+delta[w]);
      if(w!==s) bc[w]+=delta[w];
    }
  }
  // Normalize
  const bcMax = Math.max(...bc)||1;
  const betweenness = {};
  ids.forEach((id,i) => betweenness[id] = Math.round((bc[i]/bcMax)*100));

  // ── Community Detection (Label Propagation — fast, good enough) ──
  const labels = Array.from({length:N}, (_,i)=>i);
  for(let iter=0;iter<20;iter++){
    let changed=false;
    // Random order
    const order=[...Array(N).keys()].sort(()=>Math.random()-0.5);
    for(const i of order){
      if(adj[i].length===0) continue;
      // Count neighbor labels
      const freq={};
      for(const j of adj[i]) freq[labels[j]]=(freq[labels[j]]||0)+1;
      const maxFreq=Math.max(...Object.values(freq));
      const candidates=Object.entries(freq).filter(([,f])=>f===maxFreq).map(([l])=>parseInt(l));
      const newLabel=candidates[Math.floor(Math.random()*candidates.length)];
      if(newLabel!==labels[i]){ labels[i]=newLabel; changed=true; }
    }
    if(!changed) break;
  }
  // Consolidate community labels to sequential IDs
  const labelMap={};
  let nextCid=0;
  const communities={};
  ids.forEach((id,i) => {
    if(labelMap[labels[i]]===undefined) labelMap[labels[i]]=nextCid++;
    communities[id]=labelMap[labels[i]];
  });

  // ── Structural Watchlist ──
  const watchlist = [];
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id]=n);

  ids.forEach((id,i) => {
    const n = nodeMap[id];
    if(!n || n.type!=="company") return;
    const degree = adj[i].length;
    const prScore = pagerank[id];
    const bcScore = betweenness[id];
    const funding = n.funding||0;
    const signals = [];

    // Signal 1: High funding, low edges (undercovered)
    if(funding > 50 && degree <= 3) signals.push({type:"undercovered",label:"High funding, few connections",severity:Math.min(100,Math.round(funding/10)),icon:"👁"});

    // Signal 2: High betweenness (bridge node)
    if(bcScore > 60) signals.push({type:"bridge",label:"Structural bridge between clusters",severity:bcScore,icon:"🌉"});

    // Signal 3: PageRank diverges from funding rank (hidden importance)
    if(prScore > 50 && funding < 100) signals.push({type:"hidden_influence",label:"Structurally important beyond funding",severity:prScore,icon:"🔮"});

    // Signal 4: Funding diverges from PageRank (overvalued structurally)
    if(funding > 200 && prScore < 20) signals.push({type:"isolated_capital",label:"Large funding but low graph connectivity",severity:Math.round(funding/50),icon:"🏝"});

    // Signal 5: High degree hub
    if(degree >= 8) signals.push({type:"hub",label:`Hub node: ${degree} connections`,severity:degree*5,icon:"⭐"});

    if(signals.length > 0) {
      watchlist.push({id,name:n.label||n.name,degree,pagerank:prScore,betweenness:bcScore,funding,signals,
        priority: signals.reduce((s,sig)=>s+sig.severity,0)
      });
    }
  });

  watchlist.sort((a,b) => b.priority - a.priority);

  const numCommunities = nextCid;

  return { pagerank, betweenness, communities, watchlist, numCommunities, commColors:COMM_COLORS, adj, ids, idx };
}
