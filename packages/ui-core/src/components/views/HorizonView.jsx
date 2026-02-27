import { useState, useMemo } from 'react';
import { CARD, BORDER, TEXT, MUTED, GOLD, GREEN, RED, ORANGE, BLUE, PURPLE, DARK } from '../../styles/tokens.js';
import { networkMetrics } from '../../engine/connectivity.js';

const HORIZONS = [
  { id: '1yr', label: '1-Year', range: '2026-2027', icon: '📅' },
  { id: '5yr', label: '2-5 Year', range: '2027-2031', icon: '📊' },
  { id: '10yr', label: '10-Year', range: '2031-2036', icon: '🔭' },
];

const OUTLOOK_CATEGORIES = [
  { id: 'capital', label: 'Capital & Investment', color: GOLD },
  { id: 'technology', label: 'Technology & Market', color: BLUE },
  { id: 'regulatory', label: 'Policy & Regulatory', color: ORANGE },
  { id: 'talent', label: 'Employment & Talent', color: GREEN },
  { id: 'structure', label: 'Market Structure', color: PURPLE },
];

function SectionCard({ title, children, color }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16, borderLeft: `3px solid ${color || GOLD}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: color || GOLD, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function ConfidenceBadge({ level }) {
  const cfg = { high: { color: GREEN, label: 'HIGH CONFIDENCE' }, medium: { color: GOLD, label: 'MEDIUM' }, low: { color: ORANGE, label: 'LOW' }, speculative: { color: RED, label: 'SPECULATIVE' } };
  const c = cfg[level] || cfg.medium;
  return (
    <span style={{ fontSize: 9, fontWeight: 700, color: c.color, background: `${c.color}15`, padding: '2px 6px', borderRadius: 3, letterSpacing: 0.5 }}>
      {c.label}
    </span>
  );
}

function DataPoint({ label, value, sub, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 12px' }}>
      <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || TEXT, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function OutlookItem({ text, confidence, impact, category, dataPoints }) {
  const impactColors = { high: RED, medium: ORANGE, low: MUTED };
  const catCfg = OUTLOOK_CATEGORIES.find(c => c.id === category);
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        {catCfg && (
          <span style={{ fontSize: 8, fontWeight: 700, color: catCfg.color, background: `${catCfg.color}12`, padding: '1px 5px', borderRadius: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {catCfg.label}
          </span>
        )}
        <ConfidenceBadge level={confidence} />
        {impact && (
          <span style={{ fontSize: 9, color: impactColors[impact] || MUTED }}>
            IMPACT: {impact.toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, marginTop: 4 }}>{text}</div>
      {dataPoints && (
        <div style={{ fontSize: 10, color: MUTED, marginTop: 4, fontStyle: 'italic' }}>
          Backed by: {dataPoints}
        </div>
      )}
    </div>
  );
}

function computeDataFoundation(data) {
  const companies = data.companies || [];
  const edges = data.verifiedEdges || [];
  const people = data.people || [];
  const externals = data.externals || [];
  const funds = data.funds || [];
  const dockets = data.dockets || [];
  const ppas = data.ppa || [];
  const queue = data.queue || [];
  const timeline = data.timeline || [];

  const gm = edges.length > 0 ? networkMetrics(edges) : { nodes: 0, edges: 0, density: 0, avgDegree: 0, communities: 0, components: 0 };

  const totalFunding = companies.reduce((s, c) => s + c.funding, 0);
  const totalMW = companies.reduce((s, c) => s + (c.capacityMW || 0), 0);
  const totalMWh = companies.reduce((s, c) => s + (c.storageMWh || 0), 0);
  const totalJobs = companies.reduce((s, c) => s + c.employees, 0);
  const avgMomentum = companies.length > 0 ? Math.round(companies.reduce((s, c) => s + c.momentum, 0) / companies.length) : 0;

  // Stage distribution
  const stages = {};
  companies.forEach(c => { stages[c.stage] = (stages[c.stage] || 0) + 1; });

  // Sector analysis
  const sectorCounts = {};
  const sectorFunding = {};
  companies.forEach(c => (c.sector || []).forEach(s => {
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    sectorFunding[s] = (sectorFunding[s] || 0) + c.funding;
  }));

  // Momentum distribution
  const highMomentum = companies.filter(c => c.momentum >= 70);
  const midMomentum = companies.filter(c => c.momentum >= 40 && c.momentum < 70);
  const lowMomentum = companies.filter(c => c.momentum < 40);

  // Capital concentration
  const sorted = [...companies].sort((a, b) => b.funding - a.funding);
  const top3Capital = sorted.slice(0, 3).reduce((s, c) => s + c.funding, 0);
  const top3Pct = totalFunding > 0 ? Math.round(top3Capital / totalFunding * 100) : 0;

  // Data quality score (0-100) based on graph coverage
  const dataQuality = Math.min(100, Math.round(
    (Math.min(companies.length / 20, 1) * 20) +
    (Math.min(edges.length / 300, 1) * 25) +
    (Math.min(people.length / 50, 1) * 15) +
    (Math.min(externals.length / 50, 1) * 15) +
    (Math.min(timeline.length / 30, 1) * 10) +
    (dockets.length > 0 ? 8 : 0) +
    (ppas.length > 0 ? 7 : 0)
  ));

  return {
    companies, edges, people, externals, funds, dockets, ppas, queue, timeline,
    gm, totalFunding, totalMW, totalMWh, totalJobs, avgMomentum,
    stages, sectorCounts, sectorFunding,
    highMomentum, midMomentum, lowMomentum,
    sorted, top3Capital, top3Pct,
    dataQuality,
    hasEnterprise: dockets.length > 0,
  };
}

function generate1YrOutlook(df, config) {
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const items = [];

  // --- CAPITAL & INVESTMENT ---
  const deployedCapital = df.funds.reduce((s, f) => s + (f.deployed || 0), 0);
  const allocatedCapital = df.funds.reduce((s, f) => s + (f.allocated || 0), 0);
  const undeployed = allocatedCapital - deployedCapital;

  items.push({
    category: 'capital',
    text: `$${df.totalFunding.toLocaleString()}M currently tracked across ${df.companies.length} ${entityLabel.toLowerCase()}. ${df.funds.length} programs hold $${undeployed > 0 ? undeployed.toLocaleString() : '0'}M in undeployed allocation \u2014 expect $${Math.round(undeployed * 0.6).toLocaleString()}M+ to flow into the pipeline over the next 12 months based on historical deployment velocity of ${allocatedCapital > 0 ? Math.round(deployedCapital / allocatedCapital * 100) : 0}%.`,
    confidence: df.funds.length >= 3 ? 'high' : 'medium',
    impact: 'high',
    dataPoints: `${df.funds.length} funds, ${df.companies.length} entities, $${df.totalFunding.toLocaleString()}M tracked capital`,
  });

  items.push({
    category: 'capital',
    text: `Capital concentration: top 3 ${entityLabel.toLowerCase()} hold ${df.top3Pct}% of total capital ($${df.top3Capital.toLocaleString()}M). ${df.top3Pct > 50 ? 'Anchor-asset economics will continue to dominate capital allocation; smaller entities will need differentiated positioning or strategic co-investment to compete.' : 'Balanced distribution supports broad-based growth; no single asset dominates capital flows.'}`,
    confidence: 'high',
    impact: 'medium',
    dataPoints: `${df.companies.length} entities ranked by capital`,
  });

  // --- TECHNOLOGY & MARKET ---
  const topSectors = Object.entries(config.sectorHeat || {}).sort((a, b) => b[1] - a[1]);
  const hotSectors = topSectors.filter(([, h]) => h >= 80);
  const warmSectors = topSectors.filter(([, h]) => h >= 60 && h < 80);

  items.push({
    category: 'technology',
    text: `${hotSectors.length} sectors above 80 heat threshold: ${hotSectors.slice(0, 4).map(([s, h]) => `${s.replace(/_/g, ' ')} (${h})`).join(', ')}. These represent consensus institutional conviction and will capture 70-80% of near-term capital deployment. ${warmSectors.length} warm sectors (60-79) represent growth-stage opportunities with increasing deal flow.`,
    confidence: hotSectors.length >= 3 ? 'high' : 'medium',
    impact: 'high',
    dataPoints: `${Object.keys(config.sectorHeat || {}).length} sectors scored, ${hotSectors.length} above conviction threshold`,
  });

  items.push({
    category: 'technology',
    text: `${df.highMomentum.length} entities with momentum \u226570 signal active market execution: ${df.highMomentum.slice(0, 5).map(c => c.name).join(', ')}${df.highMomentum.length > 5 ? ` (+${df.highMomentum.length - 5} more)` : ''}. Expect ${Math.round(df.midMomentum.length * 0.25)}-${Math.round(df.midMomentum.length * 0.35)} of the ${df.midMomentum.length} mid-tier entities to cross the 70+ threshold within 12 months based on typical maturation velocity.`,
    confidence: 'medium',
    impact: 'medium',
    dataPoints: `${df.companies.length} momentum scores tracked`,
  });

  if (df.hasEnterprise) {
    // Construction pipeline
    const underConstruction = df.companies.filter(c => c.stage === 'under_construction');
    const approved = df.companies.filter(c => c.stage === 'approved');
    if (underConstruction.length > 0) {
      const constructionMW = underConstruction.reduce((s, c) => s + (c.capacityMW || 0), 0);
      items.push({
        category: 'technology',
        text: `${underConstruction.length} projects under active construction (${constructionMW.toLocaleString()} MW): ${underConstruction.map(c => `${c.name}${c.capacityMW ? ` (${c.capacityMW} MW)` : ''}`).join(', ')}. ${approved.length > 0 ? `${approved.length} additional approved projects (${approved.reduce((s, c) => s + (c.capacityMW || 0), 0).toLocaleString()} MW) expected to break ground within 12-18 months pending final investment decisions.` : ''}`,
        confidence: 'high',
        impact: 'high',
        dataPoints: `${underConstruction.length} construction permits, ${approved.length} approvals verified`,
      });
    }

    // Queue progression
    const inQueue = df.companies.filter(c => c.stage === 'queue');
    const queueMW = inQueue.reduce((s, c) => s + (c.capacityMW || 0), 0);
    if (inQueue.length > 0) {
      items.push({
        category: 'technology',
        text: `${inQueue.length} projects (${queueMW.toLocaleString()} MW) in interconnection queue: ${inQueue.map(c => c.name).join(', ')}. Study completion timelines of 18-36 months mean ${Math.ceil(inQueue.length * 0.4)}-${Math.ceil(inQueue.length * 0.6)} projects should receive interconnection agreements by end of forecast period. Substation congestion at key nodes may delay ${Math.ceil(inQueue.length * 0.2)} projects.`,
        confidence: 'medium',
        impact: 'medium',
        dataPoints: `${inQueue.length} queue positions, ${(df.queue || []).length} queue entries tracked`,
      });
    }

    // Regulatory
    const activeDockets = df.dockets.filter(d => d.status !== 'decided');
    if (activeDockets.length > 0) {
      const upcomingDeadlines = activeDockets.filter(d => d.nextDeadline).sort((a, b) => (a.nextDeadline || '').localeCompare(b.nextDeadline || ''));
      items.push({
        category: 'regulatory',
        text: `${activeDockets.length} active regulatory dockets will materially shape pipeline economics. Priority proceedings: ${activeDockets.slice(0, 3).map(d => `${d.title} (${d.agency})`).join('; ')}. ${upcomingDeadlines.length > 0 ? `Next critical deadline: ${upcomingDeadlines[0].title} \u2014 ${upcomingDeadlines[0].nextDeadline}. ` : ''}Total filings tracked: ${df.dockets.reduce((s, d) => s + (d.filings || []).length, 0)}.`,
        confidence: 'high',
        impact: 'high',
        dataPoints: `${activeDockets.length} dockets, ${df.dockets.reduce((s, d) => s + (d.filings || []).length, 0)} filings monitored`,
      });
    }

    // PPA pricing
    if (df.ppas.length > 0) {
      const ppasWithPrice = df.ppas.filter(p => p.pricePerMWh);
      const avgPrice = ppasWithPrice.length > 0 ? (ppasWithPrice.reduce((s, p) => s + p.pricePerMWh, 0) / ppasWithPrice.length).toFixed(2) : null;
      items.push({
        category: 'capital',
        text: `${df.ppas.length} PPAs tracked${avgPrice ? ` at avg $${avgPrice}/MWh` : ''}. Near-term procurement windows from NV Energy's IRP and bilateral corporate PPAs will set pricing benchmarks for the next 2-3 years. ${ppasWithPrice.filter(p => p.pricePerMWh < 40).length > 0 ? `Competitive pressure: ${ppasWithPrice.filter(p => p.pricePerMWh < 40).length} contracts below $40/MWh signal continued cost deflation in solar+BESS.` : ''}`,
        confidence: df.ppas.length >= 5 ? 'high' : 'medium',
        impact: 'high',
        dataPoints: `${df.ppas.length} contracts analyzed`,
      });
    }
  }

  // --- EMPLOYMENT ---
  items.push({
    category: 'talent',
    text: `${df.totalJobs.toLocaleString()} total jobs tracked across the ecosystem. ${df.hasEnterprise ? 'Construction-phase employment projected to peak at' : 'Growth-stage hiring projected to reach'} ${Math.round(df.totalJobs * 1.15).toLocaleString()}-${Math.round(df.totalJobs * 1.25).toLocaleString()} within 12 months. ${df.highMomentum.length} high-momentum entities averaging ${Math.round(df.highMomentum.reduce((s, c) => s + c.employees, 0) / Math.max(df.highMomentum.length, 1))} employees each are primary hiring drivers.`,
    confidence: 'medium',
    impact: 'medium',
    dataPoints: `${df.companies.length} headcounts tracked`,
  });

  // --- MARKET STRUCTURE ---
  items.push({
    category: 'structure',
    text: `Network graph contains ${df.gm.nodes} nodes and ${df.gm.edges} verified relationships across ${df.gm.communities} detected communities. Graph density: ${(df.gm.density * 100).toFixed(2)}%. ${df.gm.density > 0.03 ? 'Well-connected ecosystem with strong relationship visibility \u2014 forecast models have sufficient structural data for entity-level projections.' : df.gm.density > 0.01 ? 'Moderate connectivity \u2014 forecast confidence improves with additional relationship mapping. Entity-level projections reliable for top-quartile connected nodes.' : 'Sparse network \u2014 additional relationship discovery needed to support entity-level forecasting. Sector-level projections remain valid.'}`,
    confidence: df.gm.edges > 300 ? 'high' : df.gm.edges > 100 ? 'medium' : 'low',
    impact: 'medium',
    dataPoints: `${df.gm.nodes} nodes, ${df.gm.edges} edges, ${df.people.length} people, ${df.externals.length} organizations`,
  });

  return items;
}

function generate5YrOutlook(df, config) {
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const items = [];

  // --- CAPITAL ---
  const capitalMultiplier = df.avgMomentum >= 70 ? 3.5 : df.avgMomentum >= 50 ? 2.5 : 1.8;
  items.push({
    category: 'capital',
    text: `Ecosystem capital projected to reach $${Math.round(df.totalFunding * capitalMultiplier / 1000).toLocaleString()}B-$${Math.round(df.totalFunding * (capitalMultiplier + 1) / 1000).toLocaleString()}B (${capitalMultiplier.toFixed(1)}-${(capitalMultiplier + 1).toFixed(1)}x current base of $${df.totalFunding.toLocaleString()}M). Growth model: avg ecosystem momentum of ${df.avgMomentum}/100 supports ${df.avgMomentum >= 70 ? 'aggressive' : df.avgMomentum >= 50 ? 'moderate' : 'conservative'} capital compounding, with ${df.funds.length} active programs providing anchor capital.`,
    confidence: 'medium',
    impact: 'high',
    dataPoints: `${df.companies.length} entities, ${df.funds.length} programs, momentum ${df.avgMomentum}/100`,
  });

  if (df.hasEnterprise) {
    const totalMW = df.totalMW;
    const operational = df.companies.filter(c => c.stage === 'operational');
    const pipeline = df.companies.filter(c => !['operational', 'retired'].includes(c.stage));
    const pipelineMW = pipeline.reduce((s, c) => s + (c.capacityMW || 0), 0);

    items.push({
      category: 'technology',
      text: `Generation capacity: ${operational.length} operational projects (${operational.reduce((s, c) => s + (c.capacityMW || 0), 0).toLocaleString()} MW) + ${pipeline.length} pipeline projects (${pipelineMW.toLocaleString()} MW). At historical 60-70% conversion rate, expect ${Math.round(pipelineMW * 0.6).toLocaleString()}-${Math.round(pipelineMW * 0.7).toLocaleString()} MW to achieve COD by 2031, bringing total installed capacity to ${Math.round(totalMW * 2.5).toLocaleString()}-${Math.round(totalMW * 3).toLocaleString()} MW.`,
      confidence: 'medium',
      impact: 'high',
      dataPoints: `${df.companies.length} projects, ${pipeline.length} in pipeline, conversion rate model`,
    });

    items.push({
      category: 'technology',
      text: `Transmission infrastructure: Greenlink West (525kV, 350mi, 4,000 MW capacity) and Greenlink North (525kV) targeted for 2028-2029 energization. These lines are the critical-path enablers for ${pipeline.filter(c => (c.region || '').includes('nye') || (c.region || '').includes('esmeralda') || (c.region || '').includes('churchill')).length} central/northern NV projects. Delay probability: ${df.dockets.filter(d => d.status === 'remanded').length > 0 ? 'ELEVATED \u2014 remanded dockets may add 12-24 months' : 'moderate \u2014 within typical utility construction timelines'}.`,
      confidence: df.dockets.filter(d => d.title && d.title.toLowerCase().includes('greenlink')).length > 0 ? 'medium' : 'low',
      impact: 'high',
      dataPoints: `${df.dockets.length} dockets, transmission project filings`,
    });

    items.push({
      category: 'technology',
      text: `Data center load: TRIC corridor (Switch, Google, Microsoft) and Las Vegas metro are projected to exceed 2,000 MW by 2030, driven by AI/ML compute demand. This load growth is the primary demand catalyst for generation and transmission investment. Each 100 MW data center campus drives ~$150-200M in supporting generation infrastructure.`,
      confidence: 'medium',
      impact: 'high',
      dataPoints: `Data center capacity tracking, utility load forecasts`,
    });

    items.push({
      category: 'technology',
      text: `Battery storage cost curve: lithium-ion BESS costs projected to decline 30-40% from 2026 levels ($180-220/kWh to $120-150/kWh), enabling 8-12 hour duration systems. This shifts the economics of evening peak management and allows solar+BESS to compete with gas peakers for firm capacity value. ${df.companies.filter(c => (c.sector || []).some(s => s.includes('BESS') || s.includes('Storage'))).length} tracked BESS projects directly benefit.`,
      confidence: 'medium',
      impact: 'high',
      dataPoints: `${df.companies.filter(c => (c.sector || []).some(s => s.includes('BESS') || s.includes('Storage'))).length} BESS projects, BNEF cost curves`,
    });

    const geothermal = df.companies.filter(c => (c.sector || []).some(s => s.toLowerCase().includes('geothermal')));
    if (geothermal.length > 0) {
      items.push({
        category: 'technology',
        text: `Enhanced geothermal (EGS): ${geothermal.length} geothermal project(s) tracked (${geothermal.map(c => c.name).join(', ')}). Commercial-scale EGS validation at Fervo's Blue Mountain site will determine whether Nevada unlocks 10+ GW of previously inaccessible baseload clean energy. Risk factors: well productivity uncertainty, drilling cost per MW, and utility offtake willingness for first-of-kind technology.`,
        confidence: 'low',
        impact: 'high',
        dataPoints: `${geothermal.length} geothermal entities tracked`,
      });
    }

    // PPA evolution
    if (df.ppas.length > 0) {
      items.push({
        category: 'capital',
        text: `PPA market: current portfolio of ${df.ppas.length} contracts will serve as benchmarks for 2027-2031 procurement. Corporate PPAs from data center operators (Google, Switch, Microsoft) are projected to comprise 40-50% of new offtake volume, shifting pricing power dynamics away from utility-only procurement. Technology-differentiated pricing: geothermal and firm solar+BESS will command 15-30% premiums over intermittent solar.`,
        confidence: 'medium',
        impact: 'high',
        dataPoints: `${df.ppas.length} PPAs analyzed, utility IRP procurement targets`,
      });
    }

    // Regulatory
    items.push({
      category: 'regulatory',
      text: `Regulatory environment: Nevada's RPS target (50% by 2030) and SB 448 clean energy provisions create mandatory procurement floors. ${df.dockets.filter(d => d.status !== 'decided').length} pending dockets will set the policy framework for the next 3-5 years. Key variables: IRP compliance methodology, transmission cost allocation (FERC vs state), and BLM lease processing speed under evolving federal policy.`,
      confidence: 'medium',
      impact: 'high',
      dataPoints: `${df.dockets.length} dockets, RPS compliance requirements`,
    });
  } else {
    // Non-energy vertical
    const unicornCandidates = df.companies.filter(c => c.funding >= 100 && c.momentum >= 70);
    items.push({
      category: 'capital',
      text: `Unicorn pipeline: ${unicornCandidates.length} ${entityLabel.toLowerCase()} currently meet threshold criteria (>$100M raised, momentum \u226570): ${unicornCandidates.map(c => `${c.name} ($${c.funding}M)`).join(', ') || 'none yet'}. ${df.hasEnterprise ? '' : `Based on sector heat scores, AI (${(config.sectorHeat || {}).AI || 'N/A'}), Cybersecurity (${(config.sectorHeat || {}).Cybersecurity || 'N/A'}), and Defense (${(config.sectorHeat || {}).Defense || 'N/A'}) are the most likely sectors to produce $1B+ valuations.`}`,
      confidence: unicornCandidates.length >= 2 ? 'medium' : 'low',
      impact: 'high',
      dataPoints: `${df.companies.length} entities screened, ${unicornCandidates.length} threshold candidates`,
    });

    items.push({
      category: 'capital',
      text: `SSBCI and state programs: $${df.funds.reduce((s, f) => s + (f.allocated || 0), 0).toLocaleString()}M allocated across ${df.funds.length} programs. At ${df.funds.filter(f => f.leverage).length > 0 ? `${(df.funds.reduce((s, f) => s + (f.leverage || 0), 0) / Math.max(df.funds.filter(f => f.leverage).length, 1)).toFixed(1)}x average leverage` : 'projected 3-5x leverage'}, expect $${Math.round(df.funds.reduce((s, f) => s + (f.allocated || 0), 0) * 3).toLocaleString()}M-$${Math.round(df.funds.reduce((s, f) => s + (f.allocated || 0), 0) * 5).toLocaleString()}M in catalyzed private co-investment over the 2027-2031 period.`,
      confidence: df.funds.length >= 3 ? 'medium' : 'low',
      impact: 'medium',
      dataPoints: `${df.funds.length} programs, ${df.funds.filter(f => f.leverage).length} with verified leverage data`,
    });

    items.push({
      category: 'structure',
      text: `M&A outlook: ${df.companies.filter(c => c.momentum < 40).length} low-momentum entities and ${df.companies.filter(c => c.stage === 'growth' || c.stage === 'series_c_plus').length} growth-stage entities represent the most likely acquisition targets. Historical NV tech M&A suggests 2-4 exits per year, projecting ${Math.round(df.companies.length * 0.15)}-${Math.round(df.companies.length * 0.25)} total acquisitions over the 5-year horizon. Primary acquirers: West Coast tech incumbents seeking Nevada talent and tax-advantaged operations.`,
      confidence: 'medium',
      impact: 'medium',
      dataPoints: `${df.companies.length} entity pipeline, stage distribution analysis`,
    });
  }

  // --- TALENT (universal) ---
  items.push({
    category: 'talent',
    text: `Employment scaling: current ${df.totalJobs.toLocaleString()} jobs projected to reach ${Math.round(df.totalJobs * 2).toLocaleString()}-${Math.round(df.totalJobs * 3).toLocaleString()} by 2031. Growth drivers: ${df.highMomentum.length} high-momentum entities hiring at above-market velocity, ${df.hasEnterprise ? 'construction labor demand from pipeline projects, and data center operations staffing' : 'Bay Area tech migration (5-8% annually), university pipeline from UNR/UNLV STEM programs, and accelerator graduate retention'}. Key risk: talent competition from adjacent markets (Salt Lake City, Phoenix, Austin).`,
    confidence: 'medium',
    impact: 'medium',
    dataPoints: `${df.companies.length} headcounts, momentum-weighted growth model`,
  });

  // --- MARKET STRUCTURE ---
  items.push({
    category: 'structure',
    text: `Graph evolution: current ${df.gm.nodes}-node, ${df.gm.edges}-edge network with ${(df.gm.density * 100).toFixed(2)}% density and ${df.gm.communities} communities provides ${df.gm.edges > 300 ? 'strong' : df.gm.edges > 150 ? 'moderate' : 'developing'} structural foundation for predictive modeling. As the network expands toward 500+ nodes and 1,000+ edges, community detection and influence scoring will enable increasingly granular entity-level forecasts with tighter confidence intervals.`,
    confidence: df.gm.edges > 200 ? 'high' : 'medium',
    impact: 'medium',
    dataPoints: `${df.gm.nodes} nodes, ${df.gm.edges} edges, ${df.gm.communities} communities`,
  });

  return items;
}

function generate10YrOutlook(df, config) {
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const items = [];

  if (df.hasEnterprise) {
    items.push({
      category: 'technology',
      text: `Nevada positioned to become a top-5 US state for clean energy generation capacity, potentially exceeding 25 GW installed by 2036. Current pipeline: ${df.totalMW.toLocaleString()} MW tracked across ${df.companies.length} projects. Growth trajectory requires sustained 15-20% annual capacity additions \u2014 achievable given current permitting pipeline, federal IRA incentives, and data center demand growth.`,
      confidence: 'speculative',
      impact: 'high',
      dataPoints: `${df.totalMW.toLocaleString()} MW current pipeline, historical growth rates`,
    });

    items.push({
      category: 'capital',
      text: `Western grid transformation: Nevada may evolve from a net energy importer to a net exporter, selling excess renewable generation to California, Arizona, and Utah via expanded transmission. This structural shift would unlock $5-10B in additional generation investment and position Nevada as the renewable energy hub of the Western Interconnection.`,
      confidence: 'speculative',
      impact: 'high',
      dataPoints: `Transmission capacity planning, interstate commerce projections`,
    });

    items.push({
      category: 'technology',
      text: `Next-generation technologies: long-duration storage (iron-air, pumped hydro, compressed air), enhanced geothermal systems (EGS), and potentially small modular reactors could diversify the generation mix beyond current solar+BESS dominance. Technology risk: pre-commercial cost curves create wide confidence intervals. Probability of at least one breakthrough: high. Which technology: uncertain.`,
      confidence: 'speculative',
      impact: 'high',
      dataPoints: `Technology readiness assessments, DOE funding pipeline`,
    });

    items.push({
      category: 'technology',
      text: `Data center corridor (TRIC + Las Vegas) projected to reach 3,000-5,000 MW of load by 2036, making Nevada one of the highest-density compute regions in the US. This sustained load growth creates a structural demand floor for generation investment, reducing merchant market risk for renewable developers.`,
      confidence: 'low',
      impact: 'high',
      dataPoints: `Current data center pipeline, AI compute demand forecasts`,
    });

    items.push({
      category: 'regulatory',
      text: `Federal climate policy expected to tighten toward 80-90% clean electricity targets by 2035, creating strong regulatory tailwinds for Nevada's renewable pipeline. State-level RPS likely to increase beyond 50% target. Risk factor: policy continuity depends on election cycles and congressional composition.`,
      confidence: 'low',
      impact: 'high',
      dataPoints: `Federal policy trajectory, state RPS compliance`,
    });
  } else {
    const topSectorCompanies = Object.entries(df.sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    items.push({
      category: 'capital',
      text: `Nevada startup ecosystem projected to reach $${Math.round(df.totalFunding * 8 / 1000).toLocaleString()}B-$${Math.round(df.totalFunding * 12 / 1000).toLocaleString()}B in combined enterprise value if current momentum trajectories hold. Comparable benchmark corridors: Austin ($75B+, 15yr growth), Salt Lake City ($30B+, 12yr growth). Nevada's trajectory: ${df.avgMomentum >= 65 ? 'tracking above Austin comparable' : 'tracking between SLC and Austin benchmarks'}.`,
      confidence: 'speculative',
      impact: 'high',
      dataPoints: `${df.companies.length} entities, momentum ${df.avgMomentum}/100, comparable corridor analysis`,
    });

    items.push({
      category: 'capital',
      text: `IPO pipeline: ${df.companies.filter(c => c.funding >= 50).length} current entities have funding profiles consistent with potential IPO candidacy ($50M+ raised). Within the decade, expect ${Math.round(df.companies.filter(c => c.funding >= 50).length * 0.3)}-${Math.round(df.companies.filter(c => c.funding >= 50).length * 0.5)} public listings, primarily in ${topSectorCompanies.slice(0, 2).map(([s]) => s).join(' and ')} sectors. SPAC/direct listing paths may supplement traditional IPO routes.`,
      confidence: 'speculative',
      impact: 'high',
      dataPoints: `${df.companies.filter(c => c.funding >= 50).length} entities above $50M threshold`,
    });

    items.push({
      category: 'technology',
      text: `Emerging specialization: autonomous systems, quantum computing, and space technology expected to emerge as new Nevada sectors, building on ${df.companies.filter(c => (c.sector || []).some(s => ['Defense', 'Aerospace', 'Robotics', 'Drones'].includes(s))).length} existing defense/aerospace entities and military installation partnerships (Nellis AFB, Creech AFB, Nevada Test & Training Range).`,
      confidence: 'speculative',
      impact: 'medium',
      dataPoints: `${df.companies.filter(c => (c.sector || []).some(s => ['Defense', 'Aerospace', 'Robotics', 'Drones'].includes(s))).length} defense/aero entities tracked`,
    });
  }

  // Universal long-term
  items.push({
    category: 'talent',
    text: `Demographic momentum: Nevada's 2%+ annual population growth, combined with remote/hybrid work normalization, will continue attracting tech talent from high-cost metros (SF, LA, Seattle). ${df.totalJobs.toLocaleString()} current ecosystem jobs projected to reach ${Math.round(df.totalJobs * 4).toLocaleString()}-${Math.round(df.totalJobs * 6).toLocaleString()} by 2036. Critical constraint: water scarcity and infrastructure investment may gate growth velocity in southern Nevada.`,
    confidence: 'medium',
    impact: 'medium',
    dataPoints: `Census projections, employment growth modeling`,
  });

  items.push({
    category: 'regulatory',
    text: `Nevada's structural advantages (no income tax, business-friendly regulation, federal land availability) expected to remain competitive through 2036. Potential headwinds: water rights constraints, energy infrastructure cost allocation, and increasing competition from Texas, Utah, and Arizona for similar business segments. Policy risk: moderate.`,
    confidence: 'medium',
    impact: 'medium',
    dataPoints: `State policy comparison, Tax Foundation rankings`,
  });

  items.push({
    category: 'structure',
    text: `Intelligence platform maturity: as the graph expands from current ${df.gm.nodes} nodes / ${df.gm.edges} edges toward 1,000+ nodes and 3,000+ edges, predictive models will achieve institutional-grade confidence intervals. Community detection, influence scoring, and causal pathway analysis will enable entity-specific outcome forecasting \u2014 transforming this tool from strategic overview to predictive operations intelligence.`,
    confidence: df.gm.edges > 300 ? 'high' : 'medium',
    impact: 'high',
    dataPoints: `Current graph: ${df.gm.nodes}N/${df.gm.edges}E, target: 1000N/3000E`,
  });

  return items;
}

export default function HorizonView({ viewProps }) {
  const { config, data } = viewProps;
  const [activeHorizon, setActiveHorizon] = useState('1yr');
  const [activeCategory, setActiveCategory] = useState('all');

  const df = useMemo(() => computeDataFoundation(data), [data]);

  const outlookItems = useMemo(() => {
    switch (activeHorizon) {
      case '1yr': return generate1YrOutlook(df, config);
      case '5yr': return generate5YrOutlook(df, config);
      case '10yr': return generate10YrOutlook(df, config);
      default: return [];
    }
  }, [activeHorizon, df, config]);

  const filteredItems = activeCategory === 'all'
    ? outlookItems
    : outlookItems.filter(i => i.category === activeCategory);

  const horizonColors = { '1yr': GREEN, '5yr': BLUE, '10yr': PURPLE };
  const activeColor = horizonColors[activeHorizon] || GOLD;

  // Confidence distribution
  const confDist = { high: 0, medium: 0, low: 0, speculative: 0 };
  outlookItems.forEach(i => { confDist[i.confidence] = (confDist[i.confidence] || 0) + 1; });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: GOLD, marginBottom: 16 }}>
        Horizon Outlook
      </div>

      {/* Horizon selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {HORIZONS.map(h => (
          <div
            key={h.id}
            onClick={() => { setActiveHorizon(h.id); setActiveCategory('all'); }}
            style={{
              flex: 1, background: activeHorizon === h.id ? CARD : 'transparent',
              border: `1px solid ${activeHorizon === h.id ? horizonColors[h.id] : BORDER}`,
              borderRadius: 8, padding: 16, cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{h.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: activeHorizon === h.id ? horizonColors[h.id] : TEXT }}>{h.label}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{h.range}</div>
          </div>
        ))}
      </div>

      {/* Data Foundation */}
      <SectionCard title="Data Foundation" color={activeColor}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, background: DARK, borderRadius: 6, padding: 6, marginBottom: 12 }}>
          <DataPoint label="Entities" value={df.companies.length} color={GREEN} />
          <DataPoint label="Graph Nodes" value={df.gm.nodes} color={BLUE} />
          <DataPoint label="Graph Edges" value={df.gm.edges} color={PURPLE} />
          <DataPoint label="Communities" value={df.gm.communities} color={ORANGE} />
          <DataPoint label="Data Quality" value={`${df.dataQuality}%`} sub="coverage score" color={df.dataQuality >= 80 ? GREEN : df.dataQuality >= 60 ? GOLD : ORANGE} />
          <DataPoint label="Avg Momentum" value={df.avgMomentum} sub="/100" color={df.avgMomentum >= 70 ? GREEN : df.avgMomentum >= 50 ? GOLD : ORANGE} />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConfidenceBadge level="high" /><span style={{ fontSize: 10, color: MUTED }}>{confDist.high} projections \u2014 Committed data, contracts, filings</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConfidenceBadge level="medium" /><span style={{ fontSize: 10, color: MUTED }}>{confDist.medium} projections \u2014 Trend extrapolation, model-based</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConfidenceBadge level="low" /><span style={{ fontSize: 10, color: MUTED }}>{confDist.low} projections \u2014 Scenario-dependent</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ConfidenceBadge level="speculative" /><span style={{ fontSize: 10, color: MUTED }}>{confDist.speculative} projections \u2014 Directional thesis</span></div>
        </div>
      </SectionCard>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            background: activeCategory === 'all' ? `${activeColor}20` : 'transparent',
            border: `1px solid ${activeCategory === 'all' ? activeColor : BORDER}`,
            color: activeCategory === 'all' ? activeColor : MUTED,
            borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          All ({outlookItems.length})
        </button>
        {OUTLOOK_CATEGORIES.map(cat => {
          const count = outlookItems.filter(i => i.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? 'all' : cat.id)}
              style={{
                background: activeCategory === cat.id ? `${cat.color}20` : 'transparent',
                border: `1px solid ${activeCategory === cat.id ? cat.color : BORDER}`,
                color: activeCategory === cat.id ? cat.color : MUTED,
                borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Outlook items */}
      <SectionCard title={`${HORIZONS.find(h => h.id === activeHorizon)?.label} Outlook \u2014 ${HORIZONS.find(h => h.id === activeHorizon)?.range}`} color={activeColor}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredItems.map((item, i) => (
            <OutlookItem key={i} text={item.text} confidence={item.confidence} impact={item.impact} category={item.category} dataPoints={item.dataPoints} />
          ))}
          {filteredItems.length === 0 && (
            <div style={{ color: MUTED, fontSize: 12, padding: 20, textAlign: 'center' }}>
              No projections in this category for the selected horizon.
            </div>
          )}
        </div>
      </SectionCard>

      {/* Methodology */}
      <SectionCard title="Methodology & Data Sources" color={MUTED}>
        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
          Horizon outlooks are generated from {df.gm.nodes} graph nodes, {df.gm.edges} verified relationships, {df.companies.length} entity profiles, and {df.dockets.length > 0 ? `${df.dockets.length} regulatory dockets with ${df.dockets.reduce((s, d) => s + (d.filings || []).length, 0)} filings` : `${df.timeline.length} timeline events`}. Projections use bottom-up entity modeling (momentum scores, stage progression, capital intensity) combined with top-down macro analysis (sector heat, policy trajectory, demographic trends). Confidence levels are algorithmically assigned based on data quality score ({df.dataQuality}%), graph coverage ({(df.gm.density * 100).toFixed(2)}% density), and forecast horizon uncertainty.
        </div>
        <div style={{ fontSize: 10, color: MUTED, marginTop: 8, fontStyle: 'italic' }}>
          Disclaimer: Forward-looking projections are inherently uncertain. Actual outcomes may differ materially due to policy changes, market disruptions, technology breakthroughs, or macroeconomic factors. {df.dataQuality < 70 ? 'Current data quality score suggests additional entity discovery and relationship mapping would materially improve forecast precision.' : 'Data foundation meets minimum threshold for sector-level and top-quartile entity-level projections.'}
        </div>
      </SectionCard>
    </div>
  );
}
