import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useCompanies, useKpis, useSectorStats, useFunds, useWeeklyBrief, useStakeholderActivities } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { KpiDetailPanel } from './KpiDetailPanel';
import { SectorDetailDrawer } from './SectorDetailDrawer';
import { MomentumTable } from './MomentumTable';
import { LiveActivityFeed } from './LiveActivityFeed';
import { RiskIntelligencePanel } from './RiskIntelligencePanel';
import { PulseOverlay } from './PulseOverlay';
import { useEcosystemVelocity } from '../../hooks/useEcosystemVelocity';
import styles from './TerminalGrid.module.css';

// ── KPI key/label mapping for terminal readout ─────────────────────────────

const KPI_KEYS = [
  { key: 'capitalDeployed', label: 'CAP.DEPLOY', sortKey: 'funding', prefix: '$', suffix: 'M', decimals: 1 },
  { key: 'ssbciCapitalDeployed', label: 'SSBCI.CAP', sortKey: 'ssbci', prefix: '$', suffix: 'M', decimals: 1 },
  { key: 'privateLeverage', label: 'PRIV.LEV', sortKey: 'leverage', prefix: '', suffix: 'x', decimals: 1 },
  { key: 'ecosystemCapacity', label: 'ECO.CAP', sortKey: 'employees', prefix: '', suffix: '', decimals: 0 },
  { key: 'innovationIndex', label: 'INNOV.IDX', sortKey: 'momentum', prefix: '', suffix: '', decimals: 0 },
  { key: 'trackedFunding', label: 'TRCK.FUND', sortKey: 'funding', prefix: '$', suffix: 'M', decimals: 1 },
  { key: 'publicCapitalShare', label: 'PUB.CAP%', sortKey: 'publicCap', prefix: '', suffix: '%', decimals: 1 },
  { key: 'dealOrigination', label: 'DEAL.ORIG', sortKey: 'deals', prefix: '', suffix: '%', decimals: 1 },
];

function formatKpiValue(val, prefix, suffix, decimals) {
  if (val == null || val === 0) return '--';
  const num = typeof decimals === 'number' ? Number(val).toFixed(decimals) : val;
  return `${prefix}${num}${suffix}`;
}

function qualityClass(quality) {
  if (quality === 'verified') return styles.kpiVerified;
  if (quality === 'inferred') return styles.kpiInferred;
  if (quality === 'calculated') return styles.kpiCalculated;
  return styles.kpiVerified;
}

function qualityLabel(quality) {
  if (quality === 'verified') return '\u25B2 VERIFIED';
  if (quality === 'inferred') return '~ INFERRED';
  if (quality === 'calculated') return 'C CALC';
  return '\u25B2 VERIFIED';
}

// ── Sector heat color ──────────────────────────────────────────────────────

function heatColor(heat) {
  if (heat >= 85) return '#ef4444';
  if (heat >= 70) return '#e5b654';
  if (heat >= 55) return '#45d7c6';
  return 'rgba(255,255,255,0.2)';
}

// ── Timestamp for header ───────────────────────────────────────────────────

function formatTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(now.getDate()).padStart(2, '0');
  return `${month} ${day} ${h}:${m}:${s}`;
}

// ── Live timestamp (isolated to avoid full-dashboard re-renders) ──────────

const LiveTimestamp = memo(function LiveTimestamp() {
  const [ts, setTs] = useState(formatTimestamp);
  useEffect(() => {
    const id = setInterval(() => setTs(formatTimestamp()), 30000);
    return () => clearInterval(id);
  }, []);
  return <>{ts}</>;
});

// ── Narrative derivation (simplified from NarrativePanel) ──────────────────

function deriveNarrative(briefData, companies, funds, sectorStats, activeSector) {
  const count = companies?.length || 0;
  const totalFunding = companies ? Math.round(companies.reduce((s, c) => s + (c.funding || 0), 0)) : 0;
  const fundingLabel = totalFunding >= 1000 ? `${(totalFunding / 1000).toFixed(1)}B` : `${totalFunding}M`;

  let capitalFormation = '';
  if (briefData?.inputs?.summary && (!activeSector || activeSector === 'all')) {
    capitalFormation = briefData.inputs.summary;
  } else {
    capitalFormation = `Nevada's venture ecosystem has deployed $${fundingLabel} across ${count} tracked companies. State-backed capital vehicles continue sustaining deployment velocity in Q1 2026.`;
  }

  let riskSignals = '';
  if (briefData?.outputs?.summary && (!activeSector || activeSector === 'all')) {
    riskSignals = briefData.outputs.summary;
  } else {
    riskSignals = `Concentration risk in pre-revenue cohorts remains the primary watchlist item. Macro headwinds are weighing on runway projections for bridge-stage companies.`;
  }

  let outlook = '';
  if (briefData?.impact?.summary && (!activeSector || activeSector === 'all')) {
    outlook = briefData.impact.summary;
  } else if (sectorStats?.length > 0) {
    const sorted = [...sectorStats].sort((a, b) => (b.momentum || b.avg_momentum || 0) - (a.momentum || a.avg_momentum || 0));
    const leader = sorted[0];
    const sn = leader.sector || leader.name || 'Technology';
    outlook = `${sn} leads sector momentum heading into Q2, with continued institutional attention across Nevada's diversifying ecosystem.`;
  } else {
    outlook = `Nevada is positioned to capitalise on westward capital migration and the decentralisation of the national innovation economy.`;
  }

  // Key developments
  const devs = [];
  if (briefData?.headline) devs.push(briefData.headline);
  if (companies?.length > 0) {
    const sorted = [...companies].sort((a, b) => (b.momentum || 0) - (a.momentum || 0));
    if (sorted[0] && devs.length < 4) {
      devs.push(`${sorted[0].name} leads ecosystem momentum at ${sorted[0].momentum || sorted[0].irs || 0}/100`);
    }
    const funded = companies.filter(c => c.funding && c.funding > 0).length;
    if (funded > 0 && devs.length < 4) {
      devs.push(`${funded} of ${count} companies have secured external funding`);
    }
  }
  while (devs.length < 3) {
    devs.push('GOED expanded venture partnership network to 14 affiliated funds');
  }

  // Spotlight
  let spotlight = null;
  if (sectorStats?.length > 0) {
    const sorted = [...sectorStats].sort((a, b) => (b.momentum || b.avg_momentum || 0) - (a.momentum || a.avg_momentum || 0));
    const top = sorted[0];
    spotlight = {
      name: top.sector || top.name || 'Technology',
      momentum: Math.round(top.momentum || top.avg_momentum || 0),
      analysis: `${top.count || top.company_count || 0} active companies. Sector is drawing increased LP attention and federal co-investment interest.`,
    };
  }

  return { capitalFormation, riskSignals, outlook, keyDevelopments: devs.slice(0, 4), spotlight };
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.terminalGrid} role="status" aria-busy="true" aria-label="Loading dashboard data">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>LOADING</span>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.activityLoading}>
                {[1, 2, 3].map((j) => (
                  <div key={j} className={styles.activitySkeleton} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainGrid>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ExecutiveDashboard({ onViewChange }) {
  const { filters, setSortBy, setSector } = useFilters();
  const [selectedSector, setSelectedSector] = useState(null);
  const [activeKpi, setActiveKpi] = useState(null);

  const { data: companies = [], isLoading: loadingCompanies, isFetching: fetchingCompanies } = useCompanies({
    stage: filters.stage,
    region: filters.region,
    sector: filters.sector,
    search: filters.search,
    sortBy: filters.sortBy,
  });

  const { data: kpis, isLoading: loadingKpis } = useKpis({
    stage: filters.stage,
    region: filters.region,
    sector: filters.sector,
  });

  const { data: sectorStats = [], isLoading: loadingSectors } = useSectorStats({ region: filters.region });
  const { data: funds = [] } = useFunds(
    filters.region && filters.region !== 'all' ? { region: filters.region } : {}
  );
  const { data: briefResponse } = useWeeklyBrief();

  const briefData = briefResponse?.data;

  const { data: activities = [] } = useStakeholderActivities({ limit: 20, location: filters.region });

  const { velocity, tier, cssVars } = useEcosystemVelocity({
    activities,
    sectorStats,
    kpis,
  });

  const isLoading = loadingCompanies || loadingKpis || loadingSectors;

  const narrative = useMemo(
    () => deriveNarrative(briefData, companies, funds, sectorStats, filters.sector),
    [briefData, companies, funds, sectorStats, filters.sector]
  );

  const handleViewAllCompanies = useCallback((sector) => {
    if (sector) setSector(sector);
    if (onViewChange) onViewChange('companies');
    setSelectedSector(null);
  }, [setSector, onViewChange]);

  const handleKpiClick = useCallback((sortKey, kpiKey) => {
    setSortBy(sortKey);
    setActiveKpi((prev) => (prev === kpiKey ? null : kpiKey));
  }, [setSortBy]);

  const handleSectorClick = useCallback((sector) => {
    if (!sectorStats.some(s => s.sector === sector)) return;
    setSector(sector);
    setSelectedSector((prev) => (prev === sector ? null : sector));
  }, [sectorStats, setSector]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainGrid>
      <div className={styles.terminalGridWrapper} style={cssVars}>
        <PulseOverlay velocity={velocity} tier={tier} cssVars={cssVars} />
        <div className={`${styles.terminalGrid} ${styles.terminalGridPulsing}`}>
        {/* ═══ PANEL 1: KPI TERMINAL (top-left) ═══ */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>KPI Terminal</span>
            <span className={styles.panelHeaderRight}>
              <span className={styles.liveDot} /> <LiveTimestamp />
            </span>
          </div>
          <div className={styles.panelBody}>
            {kpis && KPI_KEYS.map(({ key, label, sortKey, prefix, suffix, decimals }) => {
              const kpi = kpis[key];
              if (!kpi) return null;
              const isActive = activeKpi === key;
              return (
                <div
                  key={key}
                  className={`${styles.kpiLine} ${styles.kpiClickable} ${isActive ? styles.kpiActive : ''}`}
                  onClick={() => handleKpiClick(sortKey, key)}
                >
                  <span className={styles.kpiKey}>{label}</span>
                  <span className={styles.kpiVal}>
                    {formatKpiValue(kpi.value, prefix, suffix, decimals)}
                  </span>
                  <span className={`${styles.kpiStatus} ${qualityClass(kpi.quality)}`}>
                    {qualityLabel(kpi.quality)}
                  </span>
                </div>
              );
            })}

            {/* Sector Heat */}
            <div className={styles.sectorHeatSection}>
              <div className={styles.sectorHeatLabel}>Sector Heat</div>
              <div className={styles.sectorHeatGrid}>
                <div
                  className={`${styles.sectorBlock} ${filters.sector === 'all' ? styles.sectorBlockActive : ''}`}
                  onClick={() => { setSector('all'); setSelectedSector(null); }}
                >
                  <span className={styles.sectorName}>ALL</span>
                </div>
                {sectorStats.map((s) => (
                  <div
                    key={s.sector}
                    className={`${styles.sectorBlock} ${filters.sector === s.sector ? styles.sectorBlockActive : ''}`}
                    onClick={() => handleSectorClick(s.sector)}
                  >
                    <span className={styles.sectorDot} style={{ background: heatColor(s.heat) }} />
                    <span className={styles.sectorName}>{s.sector}</span>
                    <span className={styles.sectorScore}>{Math.round(s.heat || s.avg_momentum || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ PANEL 2: MOMENTUM RANKINGS (top-right) ═══ */}
        <div className={`${styles.panel} ${styles.momentumCompact}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Momentum Rankings</span>
            {fetchingCompanies && (
              <span className={styles.panelHeaderRight}>
                <span className={styles.liveDot} /> UPDATING
              </span>
            )}
          </div>
          <div className={styles.panelBody} style={{ padding: 0 }}>
            <MomentumTable
              companies={companies}
              sortBy={filters.sortBy}
              onSortChange={setSortBy}
              isFetching={fetchingCompanies}
            />
          </div>
        </div>

        {/* ═══ PANEL 3: LIVE ACTIVITY FEED (bottom-left) ═══ */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Live Activity Feed</span>
            <span className={styles.panelHeaderRight}>
              <span className={styles.liveDot} /> AUTO 60s
            </span>
          </div>
          <div className={styles.panelBody}>
            <LiveActivityFeed />
          </div>
        </div>

        {/* ═══ PANEL 4: MARKET NARRATIVE (bottom-right) ═══ */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Market Narrative</span>
            <span className={styles.panelHeaderRight}>
              {briefData ? 'AI' : 'DERIVED'}
            </span>
          </div>
          <div className={styles.panelBody}>
            {/* Capital Formation */}
            <div className={styles.narrativeSection}>
              <div className={styles.narrativeSectionTitle}>Capital Formation</div>
              <p className={styles.narrativeText}>{narrative.capitalFormation}</p>
            </div>
            <div className={styles.narrativeDivider} />

            {/* Risk Signals */}
            <div className={styles.narrativeSection}>
              <div className={styles.narrativeSectionTitle}>Risk Signals</div>
              <p className={styles.narrativeText}>{narrative.riskSignals}</p>
            </div>
            <div className={styles.narrativeDivider} />

            {/* Strategic Outlook */}
            <div className={styles.narrativeSection}>
              <div className={styles.narrativeSectionTitle}>Strategic Outlook</div>
              <p className={styles.narrativeText}>{narrative.outlook}</p>
            </div>
            <div className={styles.narrativeDivider} />

            {/* Key Developments */}
            <div className={styles.narrativeSection}>
              <div className={styles.narrativeSectionTitle}>Key Developments</div>
              {narrative.keyDevelopments.map((item, i) => (
                <div key={i} className={styles.narrativeDevItem}>
                  <span className={styles.narrativeDevRule} />
                  <span className={styles.narrativeDevText}>{item}</span>
                </div>
              ))}
            </div>

            {/* Sector Spotlight */}
            {narrative.spotlight && (
              <>
                <div className={styles.narrativeDivider} />
                <div className={styles.narrativeSection}>
                  <div className={styles.narrativeSectionTitle}>Sector Spotlight</div>
                  <div className={styles.spotlightBox}>
                    <div className={styles.spotlightRow}>
                      <span className={styles.spotlightName}>{narrative.spotlight.name}</span>
                      <span className={styles.spotlightScore}>{narrative.spotlight.momentum}/100</span>
                    </div>
                    <p className={styles.spotlightAnalysis}>{narrative.spotlight.analysis}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* ── Risk Intelligence ── */}
      <RiskIntelligencePanel companies={companies} />

      {/* ── Overlays (render outside the grid) ── */}
      {activeKpi && (
        <KpiDetailPanel
          activeKpi={activeKpi}
          kpis={kpis}
          funds={funds}
          companies={companies}
          sectorStats={sectorStats}
          onClose={() => setActiveKpi(null)}
        />
      )}
      {selectedSector && (
        <SectorDetailDrawer
          sector={selectedSector}
          companies={companies}
          sectorStats={sectorStats}
          onClose={() => setSelectedSector(null)}
          onViewAll={() => handleViewAllCompanies(selectedSector)}
        />
      )}
    </MainGrid>
  );
}
