import { GP } from './constants';

export default function computeGraphMetrics(nodes, edges) {
  if (!nodes.length) return { pagerank:{}, betweenness:{}, communities:{}, watchlist:[] };
  const ids = nodes.map(n=>n.id);
  const idx = {}; ids.forEach((id,i) => idx[id]=i);
  const N = ids.length;

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

  // PageRank (power iteration, damping=0.85, 40 iterations)
  const d = 0.85;
  let pr = new Float64Array(N).fill(1/N);
  for(let iter=0; iter<40; iter++){
    const next = new Float64Array(N).fill((1-d)/N);
    for(let i=0;i<N;i++){
      if(adj[i].length>0){
        const share = pr[i]/adj[i].length;
        for(const j of adj[i]) next[j] += d*share;
      } else {
        for(let j=0;j<N;j++) next[j] += d*pr[i]/N;
      }
    }
    pr = next;
  }
  const prMax = Math.max(...pr), prMin = Math.min(...pr);
  const prRange = prMax-prMin||1;
  const pagerank = {};
  ids.forEach((id,i) => pagerank[id] = Math.round(((pr[i]-prMin)/prRange)*100));

  // Betweenness Centrality (Brandes' algorithm)
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
  const bcMax = Math.max(...bc)||1;
  const betweenness = {};
  ids.forEach((id,i) => betweenness[id] = Math.round((bc[i]/bcMax)*100));

  // Community Detection (Label Propagation)
  const labels = Array.from({length:N}, (_,i)=>i);
  for(let iter=0;iter<20;iter++){
    let changed=false;
    const order=[...Array(N).keys()].sort(()=>Math.random()-0.5);
    for(const i of order){
      if(adj[i].length===0) continue;
      const freq={};
      for(const j of adj[i]) freq[labels[j]]=(freq[labels[j]]||0)+1;
      const maxFreq=Math.max(...Object.values(freq));
      const candidates=Object.entries(freq).filter(([,f])=>f===maxFreq).map(([l])=>parseInt(l));
      const newLabel=candidates[Math.floor(Math.random()*candidates.length)];
      if(newLabel!==labels[i]){ labels[i]=newLabel; changed=true; }
    }
    if(!changed) break;
  }
  const labelMap={};
  let nextCid=0;
  const communities={};
  ids.forEach((id,i) => {
    if(labelMap[labels[i]]===undefined) labelMap[labels[i]]=nextCid++;
    communities[id]=labelMap[labels[i]];
  });

  // Structural Watchlist
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

    if(funding > 50 && degree <= 3) signals.push({type:"undercovered",label:"High funding, few connections",severity:Math.min(100,Math.round(funding/10)),icon:"👁"});
    if(bcScore > 60) signals.push({type:"bridge",label:"Structural bridge between clusters",severity:bcScore,icon:"🌉"});
    if(prScore > 50 && funding < 100) signals.push({type:"hidden_influence",label:"Structurally important beyond funding",severity:prScore,icon:"🔮"});
    if(funding > 200 && prScore < 20) signals.push({type:"isolated_capital",label:"Large funding but low graph connectivity",severity:Math.round(funding/50),icon:"🏝"});
    if(degree >= 8) signals.push({type:"hub",label:`Hub node: ${degree} connections`,severity:degree*5,icon:"⭐"});

    if(signals.length > 0) {
      watchlist.push({id,name:n.label||n.name,degree,pagerank:prScore,betweenness:bcScore,funding,signals,
        priority: signals.reduce((s,sig)=>s+sig.severity,0)
      });
    }
  });

  watchlist.sort((a,b) => b.priority - a.priority);

  const numCommunities = nextCid;
  const COMM_COLORS = [GP.gold,GP.green,GP.blue,GP.purple,GP.orange,GP.red,GP.cyan,GP.pink,GP.lime,GP.teal,"#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"];

  return { pagerank, betweenness, communities, watchlist, numCommunities, commColors:COMM_COLORS, adj, ids, idx };
}
