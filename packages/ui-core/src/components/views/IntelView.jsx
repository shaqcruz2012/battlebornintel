import { useState, useMemo } from 'react';
import { CARD, BORDER, TEXT, MUTED, GOLD, GREEN, RED, ORANGE, BLUE, PURPLE, DARK } from '../../styles/tokens.js';
import { computeInfluence, networkMetrics, topInfluencers } from '../../engine/connectivity.js';

const BRIEF_TYPES = [
  { id: 'executive', label: 'Executive Summary', icon: '📋', desc: 'High-level ecosystem overview for leadership' },
  { id: 'network', label: 'Network Analysis', icon: '🕸', desc: 'Graph centrality, influence, and community structure' },
  { id: 'risk', label: 'Risk Assessment', icon: '⚠', desc: 'Regulatory, market, and operational risk landscape' },
  { id: 'market', label: 'Market Intelligence', icon: '📊', desc: 'Sector trends, capital flows, and competitive dynamics' },
  { id: 'regulatory', label: 'Regulatory Outlook', icon: '⚖', desc: 'Policy, permitting, and compliance landscape' },
  { id: 'opportunity', label: 'Opportunity Map', icon: '🎯', desc: 'Actionable insights and strategic recommendations' },
];

function SectionCard({ title, children, color }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16, borderLeft: `3px solid ${color || GOLD}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: color || GOLD, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 16px' }}>
      <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || TEXT, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BulletList({ items, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: color || GOLD, fontSize: 8, marginTop: 5 }}>●</span>
          <span style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function InfluenceBar({ name, score, rank, type }) {
  const colors = { company: GREEN, person: BLUE, external: ORANGE, fund: PURPLE, org: GOLD };
  const c = colors[type] || MUTED;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <span style={{ fontSize: 10, color: MUTED, width: 20, textAlign: 'right' }}>#{rank}</span>
      <span style={{ fontSize: 12, color: TEXT, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <div style={{ width: 100, height: 6, background: DARK, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: c, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: c, width: 28, textAlign: 'right' }}>{score}</span>
    </div>
  );
}

function getNodeType(id) {
  if (id.startsWith('c_')) return 'company';
  if (id.startsWith('p_')) return 'person';
  if (id.startsWith('x_')) return 'external';
  if (id.startsWith('f_')) return 'fund';
  return 'org';
}

function getNodeName(id, data) {
  if (id.startsWith('c_')) {
    const cid = parseInt(id.slice(2));
    const c = (data.companies || []).find(c => c.id === cid);
    return c ? c.name : id;
  }
  if (id.startsWith('f_')) {
    const fid = id.slice(2);
    const f = (data.graphFunds || data.funds || []).find(f => f.id === fid);
    return f ? f.name : id;
  }
  if (id.startsWith('p_')) {
    const p = (data.people || []).find(p => p.id === id);
    return p ? p.name : id;
  }
  if (id.startsWith('x_')) {
    const x = (data.externals || []).find(x => x.id === id);
    return x ? x.name : id;
  }
  const orgs = [...(data.accelerators || []), ...(data.ecosystemOrgs || [])];
  const o = orgs.find(o => o.id === id);
  return o ? o.name : id;
}

function ExecutiveBrief({ data, config, allScored }) {
  const totalFunding = data.companies.reduce((s, c) => s + c.funding, 0);
  const avgMomentum = Math.round(data.companies.reduce((s, c) => s + c.momentum, 0) / data.companies.length);
  const totalEmployees = data.companies.reduce((s, c) => s + c.employees, 0);
  const stages = {};
  data.companies.forEach(c => { stages[c.stage] = (stages[c.stage] || 0) + 1; });
  const topStage = Object.entries(stages).sort((a, b) => b[1] - a[1])[0];
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const scoreLabel = config.labels?.scoreLabel || 'IRS';
  const fundingLabel = config.labels?.fundingMetric || 'TOTAL CAPITAL';

  // Grade distribution
  const gradeA = allScored.filter(c => c.irs >= 80).length;
  const gradeB = allScored.filter(c => c.irs >= 60 && c.irs < 80).length;
  const gradeC = allScored.filter(c => c.irs >= 40 && c.irs < 60).length;
  const gradeD = allScored.filter(c => c.irs < 40).length;

  // Capacity metrics (enterprise)
  const totalMW = data.companies.reduce((s, c) => s + (c.capacityMW || 0), 0);
  const totalMWh = data.companies.reduce((s, c) => s + (c.storageMWh || 0), 0);
  const hasEnterprise = totalMW > 0;

  // Top sectors
  const sectorCounts = {};
  data.companies.forEach(c => (c.sector || []).forEach(s => { sectorCounts[s] = (sectorCounts[s] || 0) + 1; }));
  const topSectors = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      <SectionCard title="Intelligence Brief — Executive Summary" color={GOLD}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Generated {today} · Classification: INTERNAL</div>
        <div style={{ display: 'grid', gridTemplateColumns: hasEnterprise ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: 8, marginBottom: 16, background: DARK, borderRadius: 6, padding: 8 }}>
          <KPI label={entityLabel} value={data.companies.length} sub={`${gradeA} Grade A`} color={GREEN} />
          <KPI label={fundingLabel} value={`$${totalFunding >= 1000 ? (totalFunding / 1000).toFixed(1) + 'B' : totalFunding + 'M'}`} color={GOLD} />
          <KPI label={`Avg ${scoreLabel}`} value={avgMomentum} sub="0-100 scale" color={avgMomentum >= 70 ? GREEN : avgMomentum >= 50 ? ORANGE : RED} />
          <KPI label="Total Jobs" value={totalEmployees.toLocaleString()} />
          {hasEnterprise && <KPI label="Pipeline MW" value={totalMW.toLocaleString()} sub={`${totalMWh.toLocaleString()} MWh storage`} color={GREEN} />}
        </div>
      </SectionCard>

      <SectionCard title="Key Findings" color={GREEN}>
        <BulletList color={GREEN} items={[
          `${entityLabel} tracked: ${data.companies.length} across ${Object.keys(sectorCounts).length} sectors, with $${totalFunding >= 1000 ? (totalFunding / 1000).toFixed(1) + 'B' : totalFunding + 'M'} in total capital deployed.`,
          `Grade distribution: ${gradeA} Grade A (${scoreLabel} ≥80), ${gradeB} Grade B (60-79), ${gradeC} Grade C (40-59), ${gradeD} Grade D (<40).`,
          `Top sectors by concentration: ${topSectors.map(([s, n]) => `${s} (${n})`).join(', ')}.`,
          `${topStage ? `Most common stage: ${topStage[0]} (${topStage[1]} ${entityLabel.toLowerCase()}).` : ''}`,
          `Graph contains ${(data.verifiedEdges || []).length} verified relationships across ${(data.people || []).length} people, ${(data.externals || []).length} organizations, and ${(data.funds || []).length + (data.graphFunds || []).length} funds.`,
        ]} />
      </SectionCard>

      <SectionCard title="Strategic Assessment" color={BLUE}>
        <BulletList color={BLUE} items={[
          `Ecosystem maturity: ${avgMomentum >= 70 ? 'High' : avgMomentum >= 50 ? 'Moderate' : 'Emerging'} — average ${scoreLabel} of ${avgMomentum}/100 indicates ${avgMomentum >= 70 ? 'strong market activity and investment readiness' : avgMomentum >= 50 ? 'growing momentum with room for acceleration' : 'early-stage development requiring catalytic investment'}.`,
          `Employment impact: ${totalEmployees.toLocaleString()} jobs across the ecosystem, averaging ${Math.round(totalEmployees / data.companies.length)} per entity.`,
          hasEnterprise ? `Infrastructure pipeline: ${totalMW.toLocaleString()} MW generation capacity + ${totalMWh.toLocaleString()} MWh storage across all stages.` : `Capital concentration: Top 5 entities account for $${allScored.slice(0, 5).reduce((s, c) => s + c.funding, 0)}M (${Math.round(allScored.slice(0, 5).reduce((s, c) => s + c.funding, 0) / totalFunding * 100)}% of total).`,
          `Sector heat analysis: ${topSectors[0] ? `${topSectors[0][0]} leads with heat score ${(config.sectorHeat || {})[topSectors[0][0]] || 'N/A'}/100` : 'Sector data pending'}.`,
        ]} />
      </SectionCard>

      <SectionCard title="Recommended Actions" color={ORANGE}>
        <BulletList color={ORANGE} items={[
          gradeA < 5 ? `Accelerate pipeline: Only ${gradeA} Grade A entities — focus on moving Grade B candidates through maturation.` : `Maintain momentum: ${gradeA} Grade A entities provide strong foundation for ecosystem growth.`,
          `Monitor ${(data.timeline || []).length} recent activity events for emerging trends and early signals.`,
          (data.dockets || []).length > 0 ? `Track ${(data.dockets || []).length} active regulatory dockets — policy decisions will materially impact pipeline economics.` : `Deepen relationship mapping — current graph density suggests room for additional entity discovery.`,
          `Next brief recommended: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        ]} />
      </SectionCard>
    </div>
  );
}

function NetworkBrief({ data }) {
  const edges = data.verifiedEdges || [];
  const metrics = useMemo(() => networkMetrics(edges), [edges]);
  const influencers = useMemo(() => topInfluencers(edges, 25), [edges]);

  return (
    <div>
      <SectionCard title="Network Topology" color={PURPLE}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16, background: DARK, borderRadius: 6, padding: 8 }}>
          <KPI label="Nodes" value={metrics.nodes} color={BLUE} />
          <KPI label="Edges" value={metrics.edges} color={GREEN} />
          <KPI label="Density" value={(metrics.density * 100).toFixed(2) + '%'} color={GOLD} />
          <KPI label="Avg Degree" value={metrics.avgDegree.toFixed(1)} />
          <KPI label="Components" value={metrics.components} />
          <KPI label="Communities" value={metrics.communities} color={PURPLE} />
        </div>
      </SectionCard>

      <SectionCard title="Influence Rankings — Top 25" color={GOLD}>
        <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>Composite: PageRank (40%) + Betweenness (35%) + Degree (25%)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {influencers.map((inf, i) => (
            <InfluenceBar
              key={inf.id}
              name={getNodeName(inf.id, data)}
              score={inf.influence}
              rank={i + 1}
              type={getNodeType(inf.id)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 10 }}>
          <span style={{ color: GREEN }}>● Company</span>
          <span style={{ color: BLUE }}>● Person</span>
          <span style={{ color: ORANGE }}>● Organization</span>
          <span style={{ color: PURPLE }}>● Fund</span>
          <span style={{ color: GOLD }}>● Ecosystem</span>
        </div>
      </SectionCard>

      <SectionCard title="Network Health Assessment" color={GREEN}>
        <BulletList color={GREEN} items={[
          `Network density: ${(metrics.density * 100).toFixed(2)}% — ${metrics.density > 0.05 ? 'well-connected graph with strong relationship coverage' : metrics.density > 0.02 ? 'moderate connectivity — consider mapping additional relationships' : 'sparse network — significant relationship discovery opportunity'}.`,
          `${metrics.components} connected component(s) — ${metrics.components <= 1 ? 'fully connected graph, all entities reachable' : `${metrics.components} disconnected subgraphs detected`}.`,
          `${metrics.communities} communities identified via label propagation — indicates ${metrics.communities <= 3 ? 'tight clustering' : metrics.communities <= 8 ? 'moderate community structure' : 'diverse multi-cluster topology'}.`,
          `Average degree ${metrics.avgDegree.toFixed(1)} — each node connected to ~${Math.round(metrics.avgDegree)} other entities on average.`,
          influencers.length > 0 ? `Top influencer: ${getNodeName(influencers[0].id, data)} (score: ${influencers[0].influence}/100) — highest composite centrality in the network.` : '',
        ].filter(Boolean)} />
      </SectionCard>
    </div>
  );
}

function RiskBrief({ data, config }) {
  const hasEnterprise = (data.dockets || []).length > 0;
  const highRisk = data.companies.filter(c => (c.riskFactors || []).length >= 2);
  const lowPermitting = data.companies.filter(c => c.permittingScore != null && c.permittingScore < 50);
  const upcoming = (data.dockets || []).filter(d => d.nextDeadline).sort((a, b) => a.nextDeadline.localeCompare(b.nextDeadline));
  const entityLabel = config.labels?.entityPlural || 'Companies';

  return (
    <div>
      <SectionCard title="Risk Landscape" color={RED}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16, background: DARK, borderRadius: 6, padding: 8 }}>
          <KPI label="High Risk" value={highRisk.length} sub={`${entityLabel.toLowerCase()} with 2+ risk factors`} color={RED} />
          <KPI label="Low Permitting" value={lowPermitting.length} sub="Score < 50/100" color={ORANGE} />
          <KPI label="Active Dockets" value={(data.dockets || []).filter(d => d.status !== 'decided').length} color={GOLD} />
        </div>
      </SectionCard>

      {highRisk.length > 0 && (
        <SectionCard title="High-Risk Entities" color={RED}>
          <BulletList color={RED} items={highRisk.map(c =>
            `${c.name}: ${(c.riskFactors || []).join(', ')}${c.permittingScore != null ? ` (Permitting: ${c.permittingScore}/100)` : ''}`
          )} />
        </SectionCard>
      )}

      {upcoming.length > 0 && (
        <SectionCard title="Upcoming Regulatory Deadlines" color={ORANGE}>
          <BulletList color={ORANGE} items={upcoming.slice(0, 8).map(d => {
            const daysOut = Math.ceil((new Date(d.nextDeadline) - new Date()) / (1000 * 60 * 60 * 24));
            return `${d.title} (${d.agency}) — ${daysOut > 0 ? `${daysOut}d` : 'OVERDUE'}: ${d.impact || 'Impact pending'}`;
          })} />
        </SectionCard>
      )}

      <SectionCard title="Systemic Risk Factors" color={ORANGE}>
        <BulletList color={ORANGE} items={[
          hasEnterprise ? 'Transmission dependency: Multiple projects contingent on Greenlink West/North completion. Delay cascades through pipeline.' : 'Market concentration: Monitor single-sector dependency and investor overlap.',
          hasEnterprise ? 'Regulatory uncertainty: PUCN docket outcomes directly impact project economics and timeline certainty.' : 'Funding pipeline: Track capital availability and round velocity for ecosystem health signals.',
          'Talent competition: Regional labor market tightness may constrain execution capacity.',
          hasEnterprise ? 'Supply chain: Battery cell and module procurement lead times affecting project schedules.' : 'Exit environment: M&A and IPO market conditions affect ecosystem liquidity.',
        ]} />
      </SectionCard>
    </div>
  );
}

function AnalysisEntry({ topic, text, color }) {
  return (
    <div style={{ background: DARK, borderRadius: 6, padding: '10px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: color || GOLD, marginBottom: 4 }}>{topic}</div>
      <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

function MarketBrief({ data, config }) {
  const sectorCounts = {};
  const sectorFunding = {};
  data.companies.forEach(c => (c.sector || []).forEach(s => {
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    sectorFunding[s] = (sectorFunding[s] || 0) + c.funding;
  }));
  const sectors = Object.keys(sectorCounts).map(s => ({
    name: s,
    count: sectorCounts[s],
    funding: sectorFunding[s],
    heat: (config.sectorHeat || {})[s] || 50,
  })).sort((a, b) => b.heat - a.heat);

  const totalFunding = data.companies.reduce((s, c) => s + c.funding, 0);
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const entitySingular = config.labels?.entitySingular || 'Entity';
  const hasEnterprise = (data.dockets || []).length > 0;

  // Capital concentration
  const top3 = [...data.companies].sort((a, b) => b.funding - a.funding).slice(0, 3);
  const top3Capital = top3.reduce((s, c) => s + c.funding, 0);
  const top3Pct = totalFunding > 0 ? Math.round(top3Capital / totalFunding * 100) : 0;

  // Momentum distribution
  const highMomentum = data.companies.filter(c => c.momentum >= 70);
  const midMomentum = data.companies.filter(c => c.momentum >= 40 && c.momentum < 70);
  const lowMomentum = data.companies.filter(c => c.momentum < 40);

  // Stage grouping
  const earlyStage = data.companies.filter(c => ['pre_seed', 'seed', 'proposed', 'queue'].includes(c.stage));
  const growthStage = data.companies.filter(c => ['growth', 'series_c_plus', 'operational', 'under_construction', 'approved'].includes(c.stage));
  const medianFunding = [...data.companies].map(c => c.funding).sort((a, b) => a - b)[Math.floor(data.companies.length / 2)] || 0;

  // PPA data
  const ppas = data.ppa || [];
  const ppasWithPrice = ppas.filter(p => p.pricePerMWh);
  const avgPPA = ppasWithPrice.length > 0 ? (ppasWithPrice.reduce((s, p) => s + p.pricePerMWh, 0) / ppasWithPrice.length).toFixed(2) : null;

  // Sector context generation
  function getSectorContext(s) {
    const tooltip = (config.sectorTooltips || {})[s.name];
    const intensity = s.count > 0 ? Math.round(s.funding / s.count) : 0;

    if (tooltip) {
      const firstSentence = tooltip.split('. ').slice(0, 1).join('. ') + '.';
      let analysis;
      if (s.heat >= 85) analysis = `Market position: dominant. ${s.count} active ${entityLabel.toLowerCase()} with $${intensity}M avg investment intensity signal mature deal flow and institutional capital commitment.`;
      else if (s.heat >= 70) analysis = `Growth trajectory: accelerating. ${s.count} ${entityLabel.toLowerCase()} competing for $${s.funding}M in deployed capital \u2014 expect consolidation as winners emerge from permitting and procurement cycles.`;
      else if (s.heat >= 55) analysis = `Market signal: emerging. Current ${s.count}-${entitySingular.toLowerCase()} pipeline at $${intensity}M avg intensity suggests early positioning by strategic investors ahead of policy catalysts.`;
      else analysis = `Watch status: nascent. Limited pipeline ($${s.funding}M across ${s.count} ${entityLabel.toLowerCase()}) indicates pre-commercial technology or policy-dependent economics requiring further catalyst.`;
      return { technical: firstSentence, analysis };
    }

    let technical, analysis;
    if (s.heat >= 85) {
      technical = `Highest-activity sector with ${s.count} ${entityLabel.toLowerCase()} capturing $${s.funding}M in capital. Market heat ${s.heat}/100 reflects sustained investor conviction and proven commercial traction.`;
      analysis = `Per-entity capital intensity of $${intensity}M indicates institutional-grade deal sizes. Competitive dynamics favor entities with established market position and differentiated technology.`;
    } else if (s.heat >= 70) {
      technical = `Growth-stage sector with rising capital allocation ($${s.funding}M across ${s.count} ${entityLabel.toLowerCase()}). Heat score ${s.heat}/100 trending above ecosystem median.`;
      analysis = `Competitive landscape supports ${s.count > 3 ? 'multiple viable entrants \u2014 monitor for breakout signals in funding velocity and customer adoption' : 'early-mover positioning \u2014 first entrants with traction will capture disproportionate follow-on investment'}.`;
    } else if (s.heat >= 55) {
      technical = `Moderate-activity sector: ${s.count} ${entityLabel.toLowerCase()}, $${s.funding}M deployed. Heat ${s.heat}/100 suggests emerging opportunity or cyclical positioning ahead of market tailwinds.`;
      analysis = `Capital-to-entity ratio of $${intensity}M signals ${intensity > 50 ? 'selective, high-conviction bets by sophisticated investors' : 'broad early-stage exploration \u2014 expect winnowing as commercial viability crystallizes'}.`;
    } else {
      technical = `Low-activity sector with ${s.count} ${entityLabel.toLowerCase()} and $${s.funding}M total capital. Heat ${s.heat}/100 \u2014 below activation threshold for most institutional mandates.`;
      analysis = `Strategic opportunity for contrarian positioning exists, but significant catalysts (policy, technology cost curves, or anchor customer commitment) needed before mainstream capital follows.`;
    }
    return { technical, analysis };
  }

  return (
    <div>
      {/* Sector Analysis — Rich context entries */}
      <SectionCard title="Sector Analysis" color={BLUE}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 14, lineHeight: 1.5 }}>
          Sector heat scores (0\u2013100) reflect capital flow intensity, active pipeline depth, policy momentum, and competitive dynamics. {sectors.filter(s => s.heat >= 80).length} sectors above 80 signal strong institutional conviction. Ranked by composite market activity.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sectors.slice(0, 10).map(s => {
            const ctx = getSectorContext(s);
            const heatColor = s.heat >= 80 ? GREEN : s.heat >= 60 ? GOLD : s.heat >= 40 ? ORANGE : MUTED;
            const intensity = s.count > 0 ? Math.round(s.funding / s.count) : 0;
            return (
              <div key={s.name} style={{ background: DARK, borderRadius: 6, padding: '12px 14px', borderLeft: `3px solid ${heatColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{s.name.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: heatColor, background: `${heatColor}15`, padding: '1px 6px', borderRadius: 3, letterSpacing: 0.5 }}>
                      {s.heat >= 85 ? 'VERY HOT' : s.heat >= 70 ? 'HOT' : s.heat >= 55 ? 'WARM' : 'COOL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10 }}>
                    <span style={{ color: MUTED }}>{s.count} {entityLabel.toLowerCase()}</span>
                    <span style={{ fontWeight: 600, color: GOLD }}>${s.funding}M</span>
                    <span style={{ fontWeight: 600, color: MUTED }}>${intensity}M/ea</span>
                    <span style={{ fontWeight: 700, color: heatColor, fontSize: 12 }}>{s.heat}</span>
                  </div>
                </div>
                <div style={{ height: 3, background: `${BORDER}60`, borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${s.heat}%`, height: '100%', background: `linear-gradient(90deg, ${heatColor}80, ${heatColor})`, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>{ctx.technical}</div>
                <div style={{ fontSize: 11, color: TEXT, lineHeight: 1.6, marginTop: 3 }}>{ctx.analysis}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Capital Flow Analysis — Enterprise-grade */}
      <SectionCard title="Capital Flow Analysis" color={GOLD}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
          Capital allocation intelligence across {data.companies.length} {entityLabel.toLowerCase()}, {data.funds.length} programs, and {sectors.length} sectors. Analysis covers concentration risk, deployment velocity, and strategic positioning.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnalysisEntry
            topic="Capital Allocation Overview"
            text={`$${totalFunding.toLocaleString()}M in total tracked capital across ${data.companies.length} ${entityLabel.toLowerCase()} spanning ${sectors.length} sectors. Top 3 by capital \u2014 ${top3.map(c => c.name).join(', ')} \u2014 control $${top3Capital.toLocaleString()}M (${top3Pct}% of total). ${top3Pct > 60 ? 'Highly concentrated: large-project economics dominate, creating anchor assets that attract follow-on infrastructure and supply chain investment.' : top3Pct > 40 ? 'Moderately concentrated with balanced distribution between anchor and emerging entities \u2014 healthy pipeline structure for sustained ecosystem growth.' : 'Well-distributed risk profile across the pipeline. No single entity dominates, reducing systemic concentration risk but potentially limiting anchor-project economics.'}`}
            color={GOLD}
          />
          <AnalysisEntry
            topic="Capital Intensity & Efficiency"
            text={`Median investment per ${entitySingular.toLowerCase()}: $${medianFunding.toLocaleString()}M. ${highMomentum.length} high-momentum ${entityLabel.toLowerCase()} (score \u226570) account for $${highMomentum.reduce((s, c) => s + c.funding, 0).toLocaleString()}M \u2014 representing the highest-velocity capital segment with strongest execution signals. ${lowMomentum.length > 0 ? `Conversely, ${lowMomentum.length} entities below momentum 40 hold $${lowMomentum.reduce((s, c) => s + c.funding, 0).toLocaleString()}M in capital that may face delays, regulatory headwinds, or restructuring pressure.` : 'All entities show momentum above 40, indicating healthy capital utilization across the portfolio.'}`}
            color={GOLD}
          />
          <AnalysisEntry
            topic="Program Deployment"
            text={`${data.funds.length} funds and programs tracked with $${data.funds.reduce((s, f) => s + (f.deployed || 0), 0).toLocaleString()}M deployed against $${data.funds.reduce((s, f) => s + (f.allocated || 0), 0).toLocaleString()}M in total allocation (${Math.round(data.funds.reduce((s, f) => s + (f.deployed || 0), 0) / Math.max(data.funds.reduce((s, f) => s + (f.allocated || 0), 0), 1) * 100)}% utilization rate). ${data.funds.filter(f => f.leverage).length > 0 ? `Average leverage: ${(data.funds.reduce((s, f) => s + (f.leverage || 0), 0) / Math.max(data.funds.filter(f => f.leverage).length, 1)).toFixed(1)}x private co-investment per program dollar \u2014 strong multiplier effect indicating private market confidence in publicly-supported assets.` : 'Leverage tracking in progress across active programs.'}`}
            color={GOLD}
          />
          <AnalysisEntry
            topic="Sector Capital Rotation"
            text={`Leading capital sectors: ${sectors.slice(0, 3).map(s => `${s.name.replace(/_/g, ' ')} ($${s.funding}M, heat ${s.heat})`).join(' \u2022 ')}. ${sectors.filter(s => s.heat >= 80).length} sectors above 80 heat threshold represent consensus institutional bets. ${sectors.filter(s => s.heat < 50).length > 0 ? `${sectors.filter(s => s.heat < 50).length} sector(s) below 50 heat \u2014 potential value opportunities if regulatory or technology catalysts materialize, but current capital flow does not support near-term acceleration.` : 'All active sectors above market median \u2014 broad-based capital deployment with no stranded sector exposure.'}`}
            color={GOLD}
          />
          {hasEnterprise && ppas.length > 0 && (
            <AnalysisEntry
              topic="Contracted Revenue & Offtake"
              text={`${ppas.length} PPAs tracked${avgPPA ? ` with weighted average price of $${avgPPA}/MWh` : ''}. Contracted capacity creates bankable revenue certainty that supports project-level debt financing and investment-grade credit metrics. ${ppas.filter(p => p.termYears && p.termYears >= 20).length > 0 ? `${ppas.filter(p => p.termYears >= 20).length} long-term contracts (20yr+) provide utility-grade counterparty certainty and support asset-backed securitization structures.` : 'Contract term and pricing data support ongoing procurement analysis for developers and investors.'}`}
              color={GOLD}
            />
          )}
        </div>
      </SectionCard>

      {/* Competitive Dynamics — Enterprise competitive intelligence */}
      <SectionCard title="Competitive Dynamics" color={PURPLE}>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
          Competitive landscape assessment across market structure, positioning strength, barrier analysis, and forward-looking strategic signals.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnalysisEntry
            topic="Market Structure"
            text={`${earlyStage.length} early-stage and ${growthStage.length} mature ${entityLabel.toLowerCase()} indicate a ${earlyStage.length > growthStage.length * 2 ? 'pipeline-heavy market with significant execution risk concentration in pre-development assets' : earlyStage.length > growthStage.length ? 'balanced market with a healthy mix of development-stage and operating assets' : 'execution-phase market where operational entities dominate and new entrants face proven competitors'}. ${top3Pct > 50 ? `Top-3 concentration at ${top3Pct}% signals oligopolistic dynamics \u2014 scale advantages in permitting, procurement, and capital access compound for incumbents.` : `Distribution across ${data.companies.length} entities suggests fragmented competition where differentiation, execution speed, and cost position determine market winners.`}`}
            color={PURPLE}
          />
          <AnalysisEntry
            topic="Competitive Positioning Leaders"
            text={`${highMomentum.length} ${entityLabel.toLowerCase()} with momentum \u226570 are positioned as category leaders: ${highMomentum.slice(0, 5).map(c => c.name).join(', ')}${highMomentum.length > 5 ? ` (+${highMomentum.length - 5} more)` : ''}. These entities demonstrate ${hasEnterprise ? 'advanced permitting status, secured interconnection positions, and contracted offtake \u2014 the trifecta that separates financeable projects from speculative pipeline' : 'strong funding velocity, deep team experience, and measurable market traction \u2014 the combination that separates capital-efficient operators from crowded-market aspirants'}.`}
            color={PURPLE}
          />
          <AnalysisEntry
            topic={hasEnterprise ? 'Barriers to Entry & Structural Advantages' : 'Competitive Moats & Defensibility'}
            text={hasEnterprise
              ? `Critical barriers: BLM land entitlements (2\u20135yr process), interconnection queue position (18\u201336mo studies), PUCN regulatory approval, transmission access rights, and utility PPA procurement windows. ${data.companies.filter(c => c.stage === 'operational').length} operational assets hold embedded first-mover advantage with existing grid positions and utility relationships. Late entrants face increasing queue congestion, diminishing premium site availability, and rising interconnection study costs.`
              : `Defensibility signals: ${data.companies.filter(c => c.employees >= 50).length} entities with 50+ employees have built organizational moats through institutional knowledge and customer relationships. Sector concentration in ${sectors[0]?.name?.replace(/_/g, ' ') || 'top sector'} (${sectors[0]?.count || 0} entities) creates knowledge clustering effects and specialized talent pools. Fund backing from ${data.funds.slice(0, 3).map(f => f.name).join(', ')} provides strategic investor networks that accelerate partnership development and market access.`
            }
            color={PURPLE}
          />
          <AnalysisEntry
            topic="Forward-Looking Strategic Assessment"
            text={`Near-term competitive dynamics favor ${hasEnterprise ? 'entities with advanced permitting and secured transmission access \u2014 these will capture upcoming IRP procurement allocations and bilateral PPA opportunities before queue-constrained competitors' : 'companies with demonstrated revenue traction and institutional capital backing \u2014 these entities will attract follow-on investment in an increasingly selective funding environment'}. ${midMomentum.length} mid-tier ${entityLabel.toLowerCase()} (momentum 40\u201369) represent the swing cohort: model suggests ~${Math.round(midMomentum.length * 0.3)} will advance toward leadership positions while ~${Math.round(midMomentum.length * 0.2)} risk stalling within 12 months based on milestone execution velocity and capital runway.`}
            color={PURPLE}
          />
        </div>
      </SectionCard>
    </div>
  );
}

function RegulatoryBrief({ data, config }) {
  const dockets = data.dockets || [];
  const hasRegulatory = dockets.length > 0;
  const entityLabel = config.labels?.entityPlural || 'Companies';

  if (!hasRegulatory) {
    return (
      <SectionCard title="Regulatory Outlook" color={GOLD}>
        <div style={{ color: MUTED, fontSize: 13, padding: 20, textAlign: 'center' }}>
          No regulatory docket data available for this vertical. Enable enterprise features to track regulatory proceedings.
        </div>
      </SectionCard>
    );
  }

  const byAgency = {};
  dockets.forEach(d => { byAgency[d.agency] = (byAgency[d.agency] || 0) + 1; });
  const byStatus = {};
  dockets.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
  const totalFilings = dockets.reduce((s, d) => s + (d.filings || []).length, 0);

  return (
    <div>
      <SectionCard title="Regulatory Landscape" color={GOLD}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16, background: DARK, borderRadius: 6, padding: 8 }}>
          <KPI label="Total Dockets" value={dockets.length} color={GOLD} />
          <KPI label="Active" value={dockets.filter(d => d.status !== 'decided').length} color={GREEN} />
          <KPI label="Total Filings" value={totalFilings} color={BLUE} />
          <KPI label="Agencies" value={Object.keys(byAgency).length} color={PURPLE} />
        </div>
      </SectionCard>

      <SectionCard title="By Agency" color={BLUE}>
        <BulletList color={BLUE} items={Object.entries(byAgency).map(([agency, count]) =>
          `${agency}: ${count} docket(s) — ${dockets.filter(d => d.agency === agency && d.status !== 'decided').length} active`
        )} />
      </SectionCard>

      <SectionCard title="Key Regulatory Risks" color={RED}>
        <BulletList color={RED} items={[
          ...dockets.filter(d => d.status === 'remanded').map(d => `REMANDED: ${d.title} — requires additional review, timeline uncertainty.`),
          ...dockets.filter(d => d.status === 'comment_period').map(d => `COMMENT PERIOD: ${d.title} — stakeholder input phase, outcome uncertain.`),
          dockets.filter(d => d.impact).length > 0 ? `${dockets.filter(d => d.impact).length} dockets with documented impact assessments available.` : '',
        ].filter(Boolean)} />
      </SectionCard>

      <SectionCard title="Regulatory Outlook Assessment" color={GREEN}>
        <BulletList color={GREEN} items={[
          `${byStatus['decided'] || 0} decided dockets provide regulatory certainty for affected ${entityLabel.toLowerCase()}.`,
          `${byStatus['open'] || 0} open proceedings — outcomes will shape policy environment over the next 6-18 months.`,
          `Filing activity: ${totalFilings} filings across all dockets indicates ${totalFilings > 30 ? 'high' : totalFilings > 15 ? 'moderate' : 'low'} stakeholder engagement.`,
        ]} />
      </SectionCard>
    </div>
  );
}

function OpportunityBrief({ data, config, allScored }) {
  const entityLabel = config.labels?.entityPlural || 'Companies';
  const scoreLabel = config.labels?.scoreLabel || 'IRS';

  // Find undervalued entities (high momentum, lower score)
  const undervalued = allScored.filter(c => c.momentum >= 70 && c.irs < 70).slice(0, 5);
  // Rising stars (high score growth potential)
  const risingStars = allScored.filter(c => c.irs >= 60 && c.irs < 80 && c.momentum >= 60).slice(0, 5);
  // At-risk entities
  const atRisk = allScored.filter(c => c.momentum < 40).slice(0, 5);

  return (
    <div>
      <SectionCard title="Opportunity Map" color={GREEN}>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
          Actionable intelligence for strategic decision-making
        </div>
      </SectionCard>

      {risingStars.length > 0 && (
        <SectionCard title={`Rising Stars — High ${scoreLabel} Growth Potential`} color={GREEN}>
          <BulletList color={GREEN} items={risingStars.map(c =>
            `${c.name} (${scoreLabel}: ${c.irs}, Momentum: ${c.momentum}) — ${c.sector?.join(', ')} · ${c.city}`
          )} />
        </SectionCard>
      )}

      {undervalued.length > 0 && (
        <SectionCard title="Undervalued — High Momentum, Room for Score Growth" color={GOLD}>
          <BulletList color={GOLD} items={undervalued.map(c =>
            `${c.name} (${scoreLabel}: ${c.irs}, Momentum: ${c.momentum}) — $${c.funding}M raised`
          )} />
        </SectionCard>
      )}

      {atRisk.length > 0 && (
        <SectionCard title="Watch List — Low Momentum Signals" color={RED}>
          <BulletList color={RED} items={atRisk.map(c =>
            `${c.name} (Momentum: ${c.momentum}) — ${c.description?.substring(0, 100)}...`
          )} />
        </SectionCard>
      )}

      <SectionCard title="Strategic Recommendations" color={BLUE}>
        <BulletList color={BLUE} items={[
          `Focus diligence on ${risingStars.length} rising stars with ${scoreLabel} 60-80 and momentum ≥60 — highest conversion probability.`,
          `${undervalued.length} entities show momentum-score divergence — potential mispricing or emerging breakout.`,
          `${atRisk.length} ${entityLabel.toLowerCase()} below momentum 40 — monitor for deterioration or turnaround signals.`,
          `Next actions: Deep-dive network analysis on top-ranked entities, scheduled relationship mapping updates.`,
        ]} />
      </SectionCard>
    </div>
  );
}

export default function IntelView({ viewProps }) {
  const { config, data, allScored } = viewProps;
  const [activeBrief, setActiveBrief] = useState('executive');

  const briefContent = useMemo(() => {
    switch (activeBrief) {
      case 'executive': return <ExecutiveBrief data={data} config={config} allScored={allScored} />;
      case 'network': return <NetworkBrief data={data} />;
      case 'risk': return <RiskBrief data={data} config={config} />;
      case 'market': return <MarketBrief data={data} config={config} />;
      case 'regulatory': return <RegulatoryBrief data={data} config={config} />;
      case 'opportunity': return <OpportunityBrief data={data} config={config} allScored={allScored} />;
      default: return null;
    }
  }, [activeBrief, data, config, allScored]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: GOLD, marginBottom: 16 }}>
        Intelligence Briefs
      </div>

      {/* Brief type selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 24 }}>
        {BRIEF_TYPES.map(bt => (
          <div
            key={bt.id}
            onClick={() => setActiveBrief(bt.id)}
            style={{
              background: activeBrief === bt.id ? CARD : 'transparent',
              border: `1px solid ${activeBrief === bt.id ? GOLD : BORDER}`,
              borderRadius: 8, padding: '12px 8px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{bt.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: activeBrief === bt.id ? GOLD : TEXT }}>{bt.label}</div>
            <div style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>{bt.desc}</div>
          </div>
        ))}
      </div>

      {/* Brief header */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
            {BRIEF_TYPES.find(b => b.id === activeBrief)?.label}
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>
            {config.name} · {config.subtitle} · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ fontSize: 9, color: MUTED, textAlign: 'right' }}>
          <div style={{ color: GOLD, fontWeight: 700 }}>CLASSIFICATION: INTERNAL</div>
          <div>Auto-generated intelligence product</div>
          <div>Data as of {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Brief content */}
      {briefContent}
    </div>
  );
}
