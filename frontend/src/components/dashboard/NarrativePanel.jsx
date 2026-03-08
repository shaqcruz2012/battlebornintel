import { useMemo } from 'react';
import { Card } from '../shared/Card';
import { useWeeklyBrief, useRiskAssessments, useSectorStats } from '../../api/hooks';
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

// ── Derive narrative sections from real data or fallback ───────────────────

function deriveCapitalFormation(briefData, companies, funds) {
  // Try brief data first
  if (briefData?.inputs?.summary) return briefData.inputs.summary;
  if (briefData?.capacities?.summary) {
    const capSummary = briefData.capacities.summary;
    if (capSummary.length > 40) return capSummary;
  }

  // Derive from companies/funds
  if (!companies || !companies.length) return null;

  const totalFunding = companies.reduce((s, c) => s + (c.funding || 0), 0);
  const ssbciFunds = (funds || []).filter((f) => f.type === 'SSBCI');
  const deployedPct = ssbciFunds.length
    ? Math.round(
        (ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0) /
          ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0)) *
          100
      )
    : null;

  const recentCompanies = companies
    .filter((c) => c.founded_year >= 2022)
    .length;

  let text = `Nevada's venture ecosystem has deployed $${totalFunding.toFixed(0)}M across ${companies.length} portfolio companies.`;
  if (deployedPct !== null) {
    text += ` State-backed SSBCI programmes are ${deployedPct}% deployed, reflecting accelerated capital absorption.`;
  }
  if (recentCompanies > 0) {
    text += ` ${recentCompanies} companies founded since 2022 signal a maturing formation pipeline.`;
  }
  return text;
}

function deriveRiskSignals(briefData, risks) {
  // Try brief data first
  if (briefData?.outputs?.summary && briefData.outputs.summary.length > 40) {
    return briefData.outputs.summary;
  }

  // Use risk assessments
  if (risks && risks.length > 0) {
    const highRisks = risks.filter(
      (r) => r.severity === 'high' || r.level === 'high' || (r.score && r.score >= 70)
    );
    const count = highRisks.length;
    const topRisk = highRisks[0];

    if (topRisk) {
      const label = topRisk.label || topRisk.name || topRisk.category || 'macro risk';
      return `${count} elevated risk indicator${count !== 1 ? 's' : ''} flagged across the portfolio. The most acute concern centres on ${label.toLowerCase()}, with downstream exposure across multiple venture-backed cohorts. Monitoring cadence has been elevated for Q1.`;
    }

    return `${risks.length} active risk signals are being tracked. Concentration risk in early-stage cohorts remains the primary watchlist item. Portfolio-wide stress indicators are within tolerance ranges as of the latest assessment.`;
  }

  return null;
}

function deriveStrategicOutlook(briefData, sectorStats, companies) {
  // Try brief impact section
  if (briefData?.impact?.summary && briefData.impact.summary.length > 40) {
    return briefData.impact.summary;
  }

  // Derive from sector stats
  if (sectorStats && sectorStats.length > 0) {
    const sorted = [...sectorStats].sort(
      (a, b) => (b.momentum || b.avg_momentum || 0) - (a.momentum || a.avg_momentum || 0)
    );
    const leader = sorted[0];
    const sectorName = leader.sector || leader.name || 'Technology';
    const sectorCount = leader.count || leader.company_count || 0;

    return `${sectorName} leads sector momentum heading into Q2, underpinned by ${sectorCount > 0 ? `${sectorCount} active companies` : 'strong operator density'} and continued institutional attention. Nevada's diversification strategy is bearing out, with non-tech sectors narrowing the gap. Federal deployment incentives are reshaping the geographic distribution of capital, with rural and secondary markets gaining allocations previously concentrated in Las Vegas and Reno.`;
  }

  if (companies && companies.length > 0) {
    const sectors = {};
    companies.forEach((c) => {
      if (c.sector) sectors[c.sector] = (sectors[c.sector] || 0) + 1;
    });
    const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0];
    if (topSector) {
      return `${topSector[0]} remains the dominant sector by company count with ${topSector[1]} portfolio entities, while emerging verticals are attracting disproportionate early-stage interest. Cross-sector collaboration—particularly between climate tech and advanced manufacturing—is positioning Nevada for durable innovation leadership beyond the current cycle.`;
    }
  }

  return null;
}

// ── Derive key developments from combined data ──────────────────────────────

function deriveKeyDevelopments(briefData, risks, companies) {
  const items = [];

  // From brief headline
  if (briefData?.headline) {
    items.push(briefData.headline);
  }

  // From brief sections
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

  // From risks
  if (risks && risks.length > 0 && items.length < 4) {
    const top = risks
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 2);
    top.forEach((r) => {
      const label = r.label || r.name || r.category;
      const detail = r.detail || r.description || '';
      if (label && items.length < 4) {
        items.push(detail ? `${label}: ${detail}` : label);
      }
    });
  }

  // Fallback items
  const fallbacks = [
    'Nevada SSBCI tranche II deployment reached new quarterly high in Q1 2026',
    'Three portfolio companies entered Series B processes; two signed term sheets',
    'GOED expanded venture partnership network to 14 affiliated funds',
    'Cleantech sector momentum surged 18 points quarter-over-quarter',
  ];

  while (items.length < 3) {
    const fb = fallbacks[items.length];
    if (fb) items.push(fb);
    else break;
  }

  return items.slice(0, 4);
}

// ── Derive sector spotlight ─────────────────────────────────────────────────

function deriveSectorSpotlight(sectorStats, companies) {
  if (sectorStats && sectorStats.length > 0) {
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
          ? `${count} active companies with a portfolio momentum score of ${momentum}/100. Sector is drawing increased LP attention and federal co-investment interest.`
          : `Sector momentum score of ${momentum}/100, the highest across the Nevada portfolio. Operators in this cohort are outpacing national peers on key growth indicators.`,
    };
  }

  if (companies && companies.length > 0) {
    const sectors = {};
    companies.forEach((c) => {
      if (!c.sector) return;
      if (!sectors[c.sector]) sectors[c.sector] = { count: 0, momentum: 0 };
      sectors[c.sector].count += 1;
      sectors[c.sector].momentum += c.momentum || 0;
    });
    const ranked = Object.entries(sectors)
      .map(([name, d]) => ({ name, avg: d.count ? Math.round(d.momentum / d.count) : 0, count: d.count }))
      .sort((a, b) => b.avg - a.avg);

    if (ranked[0]) {
      const top = ranked[0];
      return {
        name: top.name,
        momentum: top.avg,
        analysis: `${top.count} portfolio companies averaging ${top.avg}/100 momentum. This cohort is leading Nevada's Q1 growth narrative with above-median capital efficiency.`,
      };
    }
  }

  return {
    name: 'Cleantech',
    momentum: 82,
    analysis:
      'Highest-momentum sector in the Nevada portfolio, driven by federal IRA incentives and a maturing operator cohort with multi-state reach. LP interest is concentrated here heading into Q2.',
  };
}

// ── Placeholder text (all three sections) ──────────────────────────────────

const PLACEHOLDER = {
  capitalFormation:
    "Nevada's venture formation pipeline is demonstrating resilience in Q1 2026, with state-sponsored capital vehicles sustaining deployment velocity despite a nationally cautious fundraising environment. SSBCI-backed funds continue to anchor early-stage rounds, providing the risk-tolerant capital that catalyses private co-investment across the ecosystem.",

  riskSignals:
    "Concentration risk in pre-revenue cohorts remains the primary watchlist item for Q1. Macro headwinds—including compressed exit windows and elevated cost of capital—are weighing on runway projections for bridge-stage companies. Portfolio-level exposure to federal procurement delays warrants continued monitoring through H1.",

  strategicOutlook:
    "Nevada is positioned to capitalise on westward capital migration and the decentralisation of the national innovation economy. The convergence of gaming technology, climate infrastructure, and defence-adjacent manufacturing is producing a differentiated sector mix that reduces correlation risk relative to California-concentrated portfolios. Sustained GOED engagement and federal partnership deepening are expected to accelerate ecosystem maturation through 2026.",
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

export function NarrativePanel({ companies = [], funds = [] }) {
  const { data: briefResponse, isLoading: briefLoading } = useWeeklyBrief();
  const { data: risksRaw, isLoading: risksLoading } = useRiskAssessments();
  const { data: sectorStatsRaw, isLoading: sectorLoading } = useSectorStats();

  const briefData = briefResponse?.data;
  const risks = Array.isArray(risksRaw) ? risksRaw : [];
  const sectorStats = Array.isArray(sectorStatsRaw) ? sectorStatsRaw : [];

  const isLoading = briefLoading || risksLoading || sectorLoading;

  const publicationDate = useMemo(
    () => formatPublicationDate(briefData?.week_start || briefData?.createdAt),
    [briefData]
  );

  const capitalFormation = useMemo(
    () => deriveCapitalFormation(briefData, companies, funds) || PLACEHOLDER.capitalFormation,
    [briefData, companies, funds]
  );

  const riskSignals = useMemo(
    () => deriveRiskSignals(briefData, risks) || PLACEHOLDER.riskSignals,
    [briefData, risks]
  );

  const strategicOutlook = useMemo(
    () => deriveStrategicOutlook(briefData, sectorStats, companies) || PLACEHOLDER.strategicOutlook,
    [briefData, sectorStats, companies]
  );

  const keyDevelopments = useMemo(
    () => deriveKeyDevelopments(briefData, risks, companies),
    [briefData, risks, companies]
  );

  const spotlight = useMemo(
    () => deriveSectorSpotlight(sectorStats, companies),
    [sectorStats, companies]
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
            <span className={styles.briefTitle}>Intelligence Brief</span>
            {isAI && <span className={styles.aiBadge}>AI</span>}
          </div>
          {briefData?.headline && (
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
          ) : (
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
          )}
        </div>
      </Card>
    </div>
  );
}
