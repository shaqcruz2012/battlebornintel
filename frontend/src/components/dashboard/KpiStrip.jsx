import { useMemo, useState, useEffect } from 'react';
import { KpiCard } from './KpiCard';
import styles from './KpiStrip.module.css';

const TOOLTIPS = {
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

function formatTimestamp() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = String(now.getDate()).padStart(2, '0');
  return `${month} ${day}  ${h}:${m}:${s} PST`;
}

export function KpiStrip({ kpis, activeSortBy, onSortChange, onKpiClick, activeKpi }) {
  const [timestamp, setTimestamp] = useState(formatTimestamp);

  // Update timestamp every 30 seconds for a "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(formatTimestamp());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Synthetic sparkline data (memoized to prevent child re-renders)
  const sparkCapital = useMemo(() => [12, 18, 22, 28, 35, 40, kpis?.capitalDeployed?.value || 0], [kpis?.capitalDeployed?.value]);
  const sparkSsbciCapital = useMemo(() => [8, 12, 15, 18, 22, kpis?.ssbciCapitalDeployed?.value || 0], [kpis?.ssbciCapitalDeployed?.value]);
  const sparkLeverage = useMemo(() => [2, 3.5, 4, 5, 6, kpis?.privateLeverage?.value || 0], [kpis?.privateLeverage?.value]);
  const sparkCapacity = useMemo(() => [800, 1200, 1600, 2000, kpis?.ecosystemCapacity?.value || 0], [kpis?.ecosystemCapacity?.value]);
  const sparkMomentum = useMemo(() => [40, 50, 55, 60, kpis?.innovationIndex?.value || 0], [kpis?.innovationIndex?.value]);

  const handleKpiCardClick = (sortKey, kpiKey) => {
    onSortChange(sortKey);
    if (onKpiClick) {
      // Toggle: clicking the active KPI closes the panel
      onKpiClick(activeKpi === kpiKey ? null : kpiKey);
    }
  };

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
        <KpiCard
          label={kpis.capitalDeployed?.label || 'Capital Deployed'}
          value={kpis.capitalDeployed?.value || 0}
          prefix="$"
          suffix="M"
          decimals={1}
          secondary={kpis.capitalDeployed?.secondary || ''}
          sparkData={sparkCapital}
          active={activeSortBy === 'funding'}
          onClick={() => handleKpiCardClick('funding', 'capitalDeployed')}
          tooltip={TOOLTIPS.capitalDeployed}
          quality={kpis.capitalDeployed?.quality}
          dataQualityNote={kpis.capitalDeployed?.dataQualityNote}
        />
        <KpiCard
          label={kpis.ssbciCapitalDeployed?.label || 'SSBCI Capital'}
          value={kpis.ssbciCapitalDeployed?.value || 0}
          prefix="$"
          suffix="M"
          decimals={1}
          secondary={kpis.ssbciCapitalDeployed?.secondary || ''}
          sparkData={sparkSsbciCapital}
          sparkColor="var(--accent-blue)"
          active={activeSortBy === 'ssbci'}
          onClick={() => handleKpiCardClick('ssbci', 'ssbciCapitalDeployed')}
          tooltip={TOOLTIPS.ssbciCapitalDeployed}
          quality={kpis.ssbciCapitalDeployed?.quality}
          dataQualityNote={kpis.ssbciCapitalDeployed?.dataQualityNote}
        />
        <KpiCard
          label={kpis.privateLeverage?.label || 'Private Leverage'}
          value={kpis.privateLeverage?.value || 0}
          suffix="x"
          decimals={1}
          secondary={kpis.privateLeverage?.secondary || ''}
          sparkData={sparkLeverage}
          sparkColor="var(--accent-gold)"
          active={activeSortBy === 'leverage'}
          onClick={() => handleKpiCardClick('leverage', 'privateLeverage')}
          tooltip={TOOLTIPS.privateLeverage}
          quality={kpis.privateLeverage?.quality}
          dataQualityNote={kpis.privateLeverage?.dataQualityNote}
        />
        <KpiCard
          label={kpis.ecosystemCapacity?.label || 'Ecosystem Capacity'}
          value={kpis.ecosystemCapacity?.value || 0}
          secondary={kpis.ecosystemCapacity?.secondary || ''}
          sparkData={sparkCapacity}
          active={activeSortBy === 'employees'}
          onClick={() => handleKpiCardClick('employees', 'ecosystemCapacity')}
          tooltip={TOOLTIPS.ecosystemCapacity}
          quality={kpis.ecosystemCapacity?.quality}
          dataQualityNote={kpis.ecosystemCapacity?.dataQualityNote}
        />
        <KpiCard
          label={kpis.innovationIndex?.label || 'Innovation Index'}
          value={kpis.innovationIndex?.value || 0}
          secondary={kpis.innovationIndex?.secondary || ''}
          sparkData={sparkMomentum}
          sparkColor="var(--status-success)"
          active={activeSortBy === 'momentum'}
          onClick={() => handleKpiCardClick('momentum', 'innovationIndex')}
          tooltip={TOOLTIPS.innovationIndex}
          quality={kpis.innovationIndex?.quality}
          dataQualityNote={kpis.innovationIndex?.dataQualityNote}
        />
      </div>
    </div>
  );
}
