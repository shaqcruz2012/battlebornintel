import { useMemo, useState, useEffect, useCallback, memo } from 'react';
import { KpiCard } from './KpiCard';
import styles from './KpiStrip.module.css';

const TOOLTIPS = {
  trackedFunding:
    'Total funding across all tracked Nevada ecosystem companies (all rounds). Derived from Crunchbase, SEC filings, and press releases. Click for funding distribution analysis.',
  publicCapitalShare:
    'Percentage of total tracked funding contributed directly by public institutions (GOED, accelerators, federal programs). T-GNN analysis shows public entities contribute ~0.4% of capital but originate 15–20% of deals through pipeline signaling.',
  dealOrigination:
    'Percentage of funded companies that had prior accelerator or ecosystem org connections before receiving institutional capital. Derived from graph multi-hop traversal of accelerator → company → fund investment paths.',
  capitalDeployed:
    'Total capital deployed across ecosystem funds into tracked Nevada companies. Includes both SSBCI-backed and private venture funds. Click to see fund-level deployment matrix and GOED action items.',
  ssbciCapitalDeployed:
    'Federal SSBCI Tranche II capital deployed through certified fund managers. This is the primary metric for Treasury compliance reporting. Click for compliance status by fund.',
  privateLeverage:
    'Private co-investment dollars mobilized per SSBCI dollar — the core metric Treasury uses to evaluate program effectiveness. Treasury minimum target is 2.0x. Click for benchmarks vs. national average.',
  ecosystemCapacity:
    'Total employment across tracked ecosystem companies. Serves as a proxy for direct economic impact and job creation — a key metric for GOED legislative reporting.',
  innovationIndex:
    'Composite ecosystem health index: 40% average momentum + 30% top-performer density + 30% hot-sector exposure. Captures breadth and depth of innovation activity for federal partnership narratives.',
};

// Card definitions — one source of truth for the strip layout
const CARD_DEFS = [
  { key: 'trackedFunding',      sortKey: 'trackedFunding', label: 'Tracked Funding',      prefix: '$', suffix: 'M', decimals: 1, sparkColor: 'var(--accent-teal)',    sparkSeed: [4000, 6000, 8000, 10000, 12000] },
  { key: 'publicCapitalShare',  sortKey: 'publicCap',      label: 'Public Capital Share',  prefix: '',  suffix: '%', decimals: 1, sparkColor: 'var(--accent-blue)',    sparkSeed: [0.2, 0.3, 0.35, 0.4] },
  { key: 'dealOrigination',     sortKey: 'dealOrig',       label: 'Deal Origination',      prefix: '',  suffix: '%', decimals: 0, sparkColor: 'var(--accent-gold)',    sparkSeed: [10, 12, 15, 18] },
  { key: 'capitalDeployed',     sortKey: 'funding',        label: 'Capital Deployed',      prefix: '$', suffix: 'M', decimals: 1, sparkColor: undefined,               sparkSeed: [12, 18, 22, 28, 35, 40] },
  { key: 'ssbciCapitalDeployed',sortKey: 'ssbci',          label: 'SSBCI Capital',         prefix: '$', suffix: 'M', decimals: 1, sparkColor: 'var(--accent-blue)',    sparkSeed: [8, 12, 15, 18, 22] },
  { key: 'privateLeverage',     sortKey: 'leverage',       label: 'Private Leverage',      prefix: '',  suffix: 'x', decimals: 1, sparkColor: 'var(--accent-gold)',    sparkSeed: [2, 3.5, 4, 5, 6] },
  { key: 'ecosystemCapacity',   sortKey: 'employees',      label: 'Ecosystem Capacity',    prefix: '',  suffix: '',  decimals: 0, sparkColor: undefined,               sparkSeed: [800, 1200, 1600, 2000] },
  { key: 'innovationIndex',     sortKey: 'momentum',       label: 'Innovation Index',      prefix: '',  suffix: '',  decimals: 0, sparkColor: 'var(--status-success)', sparkSeed: [40, 50, 55, 60] },
];

function formatTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(now.getDate()).padStart(2, '0');
  return `${month} ${day}  ${h}:${m}:${s} PST`;
}

export const KpiStrip = memo(function KpiStrip({ kpis, activeSortBy, onSortChange, onKpiClick, activeKpi }) {
  const [timestamp, setTimestamp] = useState(formatTimestamp);

  useEffect(() => {
    const interval = setInterval(() => setTimestamp(formatTimestamp()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Stable click handler — card identity is passed via arguments
  const handleKpiCardClick = useCallback((sortKey, kpiKey) => {
    onSortChange(sortKey);
    if (onKpiClick) {
      onKpiClick(prev => prev === kpiKey ? null : kpiKey);
    }
  }, [onSortChange, onKpiClick]);

  // Build stable per-card callbacks (one useCallback per card via useMemo of the array)
  const cardClickHandlers = useMemo(
    () => Object.fromEntries(
      CARD_DEFS.map(d => [d.key, () => handleKpiCardClick(d.sortKey, d.key)])
    ),
    [handleKpiCardClick]
  );

  // Build sparkline data arrays (memoized per-card value)
  const sparklines = useMemo(() => {
    const out = {};
    for (const d of CARD_DEFS) {
      out[d.key] = [...d.sparkSeed, kpis?.[d.key]?.value || 0];
    }
    return out;
    // Re-derive only when the KPI values object changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpis]);

  if (!kpis) return null;

  return (
    <div className={styles.container}>
      <div className={styles.stripHeader}>
        <span className={styles.stripTitle}>Key Performance Indicators</span>
        <span className={styles.timestamp}>
          <span className={styles.liveDot} />
          {timestamp}
        </span>
      </div>
      <div className={styles.strip}>
        {CARD_DEFS.map(d => {
          const kpi = kpis[d.key];
          return (
            <KpiCard
              key={d.key}
              label={kpi?.label || d.label}
              value={kpi?.value || 0}
              prefix={d.prefix}
              suffix={d.suffix}
              decimals={d.decimals}
              secondary={kpi?.secondary || ''}
              sparkData={sparklines[d.key]}
              sparkColor={d.sparkColor}
              active={activeSortBy === d.sortKey}
              onClick={cardClickHandlers[d.key]}
              tooltip={TOOLTIPS[d.key]}
              quality={kpi?.quality}
              dataQualityNote={kpi?.dataQualityNote}
            />
          );
        })}
      </div>
    </div>
  );
});
