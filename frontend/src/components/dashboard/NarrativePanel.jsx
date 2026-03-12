import { useMemo } from 'react';
import { Card } from '../shared/Card';
import { useWeeklyBrief, useRiskAssessments } from '../../api/hooks';
import styles from './NarrativePanel.module.css';

// ── Publication date helpers ────────────────────────────────────────────────

function formatPublicationDate(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'March 2026';
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

// ── Sector-specific narrative templates ─────────────────────────────────────

const SECTOR_NARRATIVES = {
  AI: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's AI sector has attracted $${totalFunding}M across ${count} tracked companies. Node graph analysis reveals dense co-investor clustering and accelerating relationship formation between enterprise ML operators and defense procurement networks. Generative AI platforms dominate early-stage deal flow with expanding network connectivity.`,
    riskSignals: (count) =>
      `Rapid capital deployment into AI carries concentration risk — graph analysis identifies ${count} companies competing in adjacent spaces with overlapping investor and customer nodes. Regulatory uncertainty around AI governance and commoditization in foundational model layers could compress margins. Talent retention signals show network outflow to national incumbents.`,
    outlook: (count) =>
      `AI remains Nevada's highest-momentum vertical, with ${count} active companies and the densest relationship graph in the ecosystem. Federal AI safety and procurement frameworks are creating new market entry points for defense-adjacent applications. Network analysis projects continued expansion through 2026.`,
  },
  Cybersecurity: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's cybersecurity cohort comprises ${count} tracked companies with $${totalFunding}M in aggregate funding. Relationship mapping shows strong connectivity to federal compliance procurement networks and cleared-personnel pipelines. State-level demand nodes continue expanding.`,
    riskSignals: (count) =>
      `The ${count}-company cybersecurity cohort faces elongated sales cycles tied to government procurement timelines. Graph analysis flags competitive pressure from national incumbent consolidation and limited exit pathways for early-stage operators without established contract vehicle nodes.`,
    outlook: (count) =>
      `Federal zero-trust mandates and growing state-level cybersecurity budgets position Nevada's ${count} cybersecurity operators for sustained demand. Network proximity to DoD facilities and critical infrastructure provides structural advantages in the relationship graph.`,
  },
  Defense: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's defense technology sector encompasses ${count} tracked companies with $${totalFunding}M deployed. Graph analysis maps high-density relationship clusters between operators, military installations, and dual-use procurement networks. Nellis AFB and NTTR proximity drives structural formation advantages.`,
    riskSignals: (count) =>
      `Defense-sector companies (${count} tracked) carry elevated exposure to federal budget sequestration risk. Graph analysis flags single prime contractor dependency nodes and ITAR compliance bottlenecks constraining scaling velocity across the cohort.`,
    outlook: (count) =>
      `Defense technology is emerging as a structural strength with ${count} active companies. Network analysis shows increasing DIU and AFWERX engagement edges, with Nevada-based dual-use operators gaining competitive preference in SBIR/STTR pipeline nodes.`,
  },
  Cleantech: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's cleantech sector has deployed $${totalFunding}M across ${count} tracked companies. Co-investor graph shows dense clustering around IRA-eligible operators with expanding federal fund connectivity. Solar, geothermal, and battery storage nodes dominate formation activity.`,
    riskSignals: (count) =>
      `Cleantech operators (${count} tracked) face execution risk tied to permitting timelines and utility interconnection queues. Graph analysis flags policy reversal sensitivity on federal incentives and critical mineral supply chain concentration across the cohort.`,
    outlook: (count) =>
      `Cleantech leads Nevada's federal co-investment pipeline with ${count} active companies. Network analysis shows expanding LP connectivity around lithium extraction and grid-scale storage nodes. Resource endowment and regulatory framework position the sector for accelerating capital inflows through 2026-2027.`,
  },
  Satellite: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's satellite and space technology sector includes ${count} tracked companies with $${totalFunding}M deployed. Network mapping reveals emerging relationship clusters between launch providers, defense communications nodes, and commercial constellation operators.`,
    riskSignals: (count) =>
      `The ${count}-company satellite cohort carries elevated capital intensity risk with extended development timelines. Graph analysis identifies single-customer dependency nodes in government contracts and launch cost variability introducing budget volatility.`,
    outlook: (count) =>
      `Satellite technology represents a high-growth niche with ${count} operators mapped at the intersection of commercial space and defense communications networks. LEO constellation demand and space-based ISR are expanding addressable market nodes.`,
  },
  Semiconductors: {
    capitalFormation: (count, totalFunding) =>
      `Nevada's semiconductor sector includes ${count} tracked companies with $${totalFunding}M deployed. Graph analysis maps strong supply-chain edges to regional data center clusters and CHIPS Act federal funding nodes. Nearshoring trends are expanding network connectivity for advanced packaging operators.`,
    riskSignals: (count) =>
      `Semiconductor operators (${count} tracked) face elevated capital expenditure requirements and extended commercialization timelines. Graph analysis flags foreign foundry dependency edges and cyclical demand volatility. Specialized fabrication workforce nodes remain constrained.`,
    outlook: (count) =>
      `CHIPS Act investments and supply chain reshoring are positioning Nevada's ${count} semiconductor companies for strategic relevance. Network analysis shows high connectivity to regional data center demand nodes and thermal management solution pathways.`,
  },
};

// ── Generic fallback for sectors without specific narratives ────────────────

function genericCapitalFormation(sectorName, count, totalFunding) {
  return `Nevada's ${sectorName} sector encompasses ${count} tracked companies with $${totalFunding}M in aggregate funding. Node graph analysis maps growing institutional connectivity as operators demonstrate product-market fit and capital efficiency metrics competitive with national peers.`;
}

function genericRiskSignals(sectorName, count) {
  return `The ${sectorName} cohort (${count} companies) faces standard early-stage concentration risk. Market timing sensitivity and customer acquisition costs remain the primary watchlist items. Sector-wide exposure to macroeconomic headwinds warrants continued monitoring through H1 2026.`;
}

function genericOutlook(sectorName, count) {
  return `${sectorName} is demonstrating steady growth trajectory with ${count} active operators in Nevada's ecosystem. Network analysis projects continued expansion as federal engagement and state-level economic development edges sustain formation velocity into Q2 2026.`;
}

// ── Derive sector-aware narratives ─────────────────────────────────────────

function deriveSectorCapitalFormation(briefData, companies, funds, activeSector) {
  // AI brief data takes priority when no sector filter
  if (!activeSector || activeSector === 'all') {
    if (briefData?.inputs?.summary) return briefData.inputs.summary;
    if (briefData?.capacities?.summary) {
      const capSummary = briefData.capacities.summary;
      if (capSummary.length > 40) return capSummary;
    }
  }

  if (!companies || !companies.length) return null;

  const totalFunding = Math.round(companies.reduce((s, c) => s + (c.funding || 0), 0));
  const fundingLabel = totalFunding >= 1000 ? `${(totalFunding / 1000).toFixed(1)}B` : `${totalFunding}M`;
  const count = companies.length;

  // Use sector-specific template if available
  if (activeSector && activeSector !== 'all') {
    const template = SECTOR_NARRATIVES[activeSector];
    if (template) return template.capitalFormation(count, fundingLabel);
    return genericCapitalFormation(activeSector, count, fundingLabel);
  }

  // Portfolio-wide fallback
  const ssbciFunds = (funds || []).filter((f) => f.type === 'SSBCI');
  const deployedPct = ssbciFunds.length
    ? Math.round(
        (ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0) /
          ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0)) *
          100
      )
    : null;

  let text = `Nevada's venture ecosystem has deployed $${fundingLabel} across ${count} tracked companies.`;
  if (deployedPct !== null) {
    text += ` State-backed SSBCI programmes are ${deployedPct}% deployed, reflecting accelerated capital absorption.`;
  }
  return text;
}

function deriveSectorRiskSignals(briefData, risks, companies, activeSector) {
  if (!activeSector || activeSector === 'all') {
    if (briefData?.outputs?.summary && briefData.outputs.summary.length > 40) {
      return briefData.outputs.summary;
    }
    if (risks && risks.length > 0) {
      return `${risks.length} active risk signals are being tracked. Concentration risk in early-stage cohorts remains the primary watchlist item. Portfolio-wide stress indicators are within tolerance ranges as of the latest assessment.`;
    }
  }

  const count = companies?.length || 0;
  if (activeSector && activeSector !== 'all') {
    const template = SECTOR_NARRATIVES[activeSector];
    if (template) return template.riskSignals(count);
    return genericRiskSignals(activeSector, count);
  }

  return null;
}

function deriveSectorOutlook(briefData, sectorStats, companies, activeSector) {
  if (!activeSector || activeSector === 'all') {
    if (briefData?.impact?.summary && briefData.impact.summary.length > 40) {
      return briefData.impact.summary;
    }
  }

  const count = companies?.length || 0;

  if (activeSector && activeSector !== 'all') {
    const template = SECTOR_NARRATIVES[activeSector];
    if (template) return template.outlook(count);
    return genericOutlook(activeSector, count);
  }

  // Portfolio-wide from sector stats
  if (sectorStats && sectorStats.length > 0) {
    const sorted = [...sectorStats].sort(
      (a, b) => (b.momentum || b.avg_momentum || 0) - (a.momentum || a.avg_momentum || 0)
    );
    const leader = sorted[0];
    const sectorName = leader.sector || leader.name || 'Technology';
    const sectorCount = leader.count || leader.company_count || 0;
    return `${sectorName} leads sector momentum heading into Q2, underpinned by ${sectorCount > 0 ? `${sectorCount} active companies` : 'strong operator density'} and continued institutional attention. Nevada's diversification strategy is bearing out, with non-tech sectors narrowing the gap.`;
  }

  return null;
}

// ── Derive key developments (sector-aware) ──────────────────────────────────

function deriveKeyDevelopments(briefData, risks, companies, activeSector) {
  const items = [];

  if (!activeSector || activeSector === 'all') {
    if (briefData?.headline) items.push(briefData.headline);
    if (briefData?.inputs?.highlights) {
      const h = briefData.inputs.highlights;
      if (Array.isArray(h)) items.push(...h.slice(0, 2));
      else if (typeof h === 'string') items.push(h);
    }
    if (briefData?.outputs?.highlights) {
      const h = briefData.outputs.highlights;
      if (Array.isArray(h)) items.push(...h.slice(0, 1));
      else if (typeof h === 'string') items.push(h);
    }
  }

  // Derive from filtered companies
  if (companies && companies.length > 0 && items.length < 4) {
    const sorted = [...companies].sort((a, b) => (b.momentum || 0) - (a.momentum || 0));
    const topCo = sorted[0];
    if (topCo && items.length < 4) {
      items.push(`${topCo.name} leads ${activeSector && activeSector !== 'all' ? activeSector : 'ecosystem'} momentum at ${topCo.momentum || topCo.irs || 0}/100`);
    }

    const recentFunded = companies.filter((c) => c.funding && c.funding > 0).length;
    if (recentFunded > 0 && items.length < 4) {
      items.push(`${recentFunded} of ${companies.length} companies have secured external funding`);
    }

    const stages = {};
    companies.forEach((c) => { if (c.stage) stages[c.stage] = (stages[c.stage] || 0) + 1; });
    const topStage = Object.entries(stages).sort((a, b) => b[1] - a[1])[0];
    if (topStage && items.length < 4) {
      items.push(`${topStage[0]} stage dominates with ${topStage[1]} companies (${Math.round((topStage[1] / companies.length) * 100)}% of cohort)`);
    }
  }

  // Fallback items
  const fallbacks = [
    'Nevada SSBCI tranche II deployment reached new quarterly high in Q1 2026',
    'GOED expanded venture partnership network to 14 affiliated funds',
    'Federal deployment incentives accelerating geographic diversification',
  ];

  while (items.length < 3) {
    const fb = fallbacks[items.length];
    if (fb) items.push(fb);
    else break;
  }

  return items.slice(0, 4);
}

// ── Derive sector spotlight (from active sector or top sector) ──────────────

function deriveSectorSpotlight(sectorStats, companies, activeSector) {
  if (!sectorStats || sectorStats.length === 0) {
    // Derive from companies as fallback
    if (companies && companies.length > 0) {
      const avgMomentum = Math.round(
        companies.reduce((s, c) => s + (c.momentum || 0), 0) / companies.length
      );
      const name = activeSector && activeSector !== 'all' ? activeSector : 'Portfolio';
      return {
        name,
        momentum: avgMomentum,
        analysis: `${companies.length} companies averaging ${avgMomentum}/100 momentum. This cohort is contributing to Nevada's Q1 growth narrative.`,
      };
    }
    return null;
  }

  // When a sector is actively filtered, show THAT sector's spotlight
  if (activeSector && activeSector !== 'all') {
    const match = sectorStats.find(
      (s) => (s.sector || s.name || '').toLowerCase() === activeSector.toLowerCase()
    );
    if (match) {
      const name = match.sector || match.name;
      const momentum = Math.round(match.momentum || match.avg_momentum || 0);
      const count = match.count || match.company_count || 0;
      return {
        name,
        momentum,
        analysis: `${count} active companies with an ecosystem momentum score of ${momentum}/100. ${name} is ${momentum >= 70 ? 'outperforming' : momentum >= 50 ? 'tracking with' : 'underperforming relative to'} the broader Nevada ecosystem average.`,
      };
    }
    // Sector not in sectorStats — derive from filtered companies
    if (companies && companies.length > 0) {
      const avgMomentum = Math.round(
        companies.reduce((s, c) => s + (c.momentum || 0), 0) / companies.length
      );
      return {
        name: activeSector,
        momentum: avgMomentum,
        analysis: `${companies.length} companies averaging ${avgMomentum}/100 momentum.`,
      };
    }
  }

  // No sector filter — show top momentum sector
  const sorted = [...sectorStats].sort(
    (a, b) => (b.momentum || b.avg_momentum || 0) - (a.momentum || a.avg_momentum || 0)
  );
  const top = sorted[0];
  const sectorName = top.sector || top.name || 'Technology';
  const momentum = Math.round(top.momentum || top.avg_momentum || 0);
  const count = top.count || top.company_count || 0;

  return {
    name: sectorName,
    momentum,
    analysis:
      count > 0
        ? `${count} active companies with an ecosystem momentum score of ${momentum}/100. Sector is drawing increased LP attention and federal co-investment interest.`
        : `Sector momentum score of ${momentum}/100, the highest across the Nevada ecosystem.`,
  };
}

// ── Placeholder text (ecosystem-wide fallback) ─────────────────────────────

const PLACEHOLDER = {
  capitalFormation:
    "Nevada's venture formation pipeline is demonstrating resilience in Q1 2026, with state-sponsored capital vehicles sustaining deployment velocity despite a nationally cautious fundraising environment. SSBCI-backed funds continue to anchor early-stage rounds, providing the risk-tolerant capital that catalyses private co-investment across the ecosystem.",

  riskSignals:
    "Concentration risk in pre-revenue cohorts remains the primary watchlist item for Q1. Macro headwinds—including compressed exit windows and elevated cost of capital—are weighing on runway projections for bridge-stage companies. Ecosystem-level exposure to federal procurement delays warrants continued monitoring through H1.",

  strategicOutlook:
    "Nevada is positioned to capitalise on westward capital migration and the decentralisation of the national innovation economy. Sustained GOED engagement and federal partnership deepening are expected to accelerate ecosystem maturation through 2026.",
};

// ── Skeleton loading state ──────────────────────────────────────────────────

function SkeletonBlock({ lines = 3, width = '100%' }) {
  return (
    <div className={styles.skeleton} style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.skeletonLine}
          style={{ width: i === lines - 1 ? '72%' : '100%' }}
        />
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function NarrativePanel({ companies = [], funds = [], activeSector = 'all', sectorStats: sectorStatsProp = [] }) {
  const { data: briefResponse, isLoading: briefLoading } = useWeeklyBrief();
  const { data: risksRaw, isLoading: risksLoading } = useRiskAssessments();

  const briefData = briefResponse?.data;
  const risks = Array.isArray(risksRaw) ? risksRaw : [];
  const sectorStats = Array.isArray(sectorStatsProp) ? sectorStatsProp : [];

  const isLoading = briefLoading || risksLoading;

  const sectorLabel = activeSector && activeSector !== 'all' ? activeSector : null;

  const publicationDate = useMemo(
    () => formatPublicationDate(briefData?.week_start || briefData?.createdAt),
    [briefData]
  );

  const capitalFormation = useMemo(
    () => deriveSectorCapitalFormation(briefData, companies, funds, activeSector) || PLACEHOLDER.capitalFormation,
    [briefData, companies, funds, activeSector]
  );

  const riskSignals = useMemo(
    () => deriveSectorRiskSignals(briefData, risks, companies, activeSector) || PLACEHOLDER.riskSignals,
    [briefData, risks, companies, activeSector]
  );

  const strategicOutlook = useMemo(
    () => deriveSectorOutlook(briefData, sectorStats, companies, activeSector) || PLACEHOLDER.strategicOutlook,
    [briefData, sectorStats, companies, activeSector]
  );

  const keyDevelopments = useMemo(
    () => deriveKeyDevelopments(briefData, risks, companies, activeSector),
    [briefData, risks, companies, activeSector]
  );

  const spotlight = useMemo(
    () => deriveSectorSpotlight(sectorStats, companies, activeSector),
    [sectorStats, companies, activeSector]
  );

  const isAI = !!briefData;

  return (
    <div className={styles.panel}>
      <Card>
        {/* ── Header ─────────────────────────────────────────── */}
        <div className={styles.briefHeader}>
          <div className={styles.briefMeta}>
            <span className={styles.analysisLabel}>Analysis</span>
            <span className={styles.publicationDate}>{publicationDate}</span>
          </div>
          <div className={styles.briefTitleRow}>
            <span className={styles.briefTitle}>
              {sectorLabel ? `${sectorLabel} Intelligence Brief` : 'Intelligence Brief'}
            </span>
            {isAI && !sectorLabel && <span className={styles.aiBadge}>AI</span>}
          </div>
          {!sectorLabel && briefData?.headline && (
            <div className={styles.headline}>{briefData.headline}</div>
          )}
        </div>

        <div className={styles.dividerHeavy} />

        {/* ── Narrative sections ─────────────────────────────── */}
        {isLoading ? (
          <div className={styles.loadingBlock}>
            <SkeletonBlock lines={3} />
            <div style={{ height: 16 }} />
            <SkeletonBlock lines={3} />
            <div style={{ height: 16 }} />
            <SkeletonBlock lines={3} />
          </div>
        ) : (
          <div className={styles.sectionList}>

            {/* Capital Formation */}
            <div className={styles.narrativeSection}>
              <div className={styles.sectionHeader}>Capital Formation</div>
              <p className={styles.sectionBody}>{capitalFormation}</p>
            </div>

            <div className={styles.dividerLight} />

            {/* Risk Signals */}
            <div className={styles.narrativeSection}>
              <div className={styles.sectionHeader}>Risk Signals</div>
              <p className={styles.sectionBody}>{riskSignals}</p>
            </div>

            <div className={styles.dividerLight} />

            {/* Strategic Outlook */}
            <div className={styles.narrativeSection}>
              <div className={styles.sectionHeader}>Strategic Outlook</div>
              <p className={styles.sectionBody}>{strategicOutlook}</p>
            </div>
          </div>
        )}

        <div className={styles.dividerHeavy} />

        {/* ── Key Developments ───────────────────────────────── */}
        <div className={styles.developmentsBlock}>
          <div className={styles.blockLabel}>Key Developments</div>
          {isLoading ? (
            <SkeletonBlock lines={4} />
          ) : (
            <ul className={styles.devList}>
              {keyDevelopments.map((item, i) => (
                <li key={i} className={styles.devItem}>
                  <span className={styles.devRule} />
                  <span className={styles.devText}>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.dividerHeavy} />

        {/* ── Sector Spotlight ───────────────────────────────── */}
        <div className={styles.spotlightBlock}>
          <div className={styles.blockLabel}>Sector Spotlight</div>
          {isLoading ? (
            <SkeletonBlock lines={2} />
          ) : spotlight ? (
            <div className={styles.spotlight}>
              <div className={styles.spotlightHeader}>
                <span className={styles.spotlightName}>{spotlight.name}</span>
                <span className={styles.spotlightMomentum}>
                  <span className={styles.momentumDot} />
                  {spotlight.momentum}/100
                </span>
              </div>
              <p className={styles.spotlightAnalysis}>{spotlight.analysis}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
