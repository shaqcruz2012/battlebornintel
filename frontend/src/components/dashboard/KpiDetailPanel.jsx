import { memo, lazy, Suspense } from 'react';
import styles from './KpiDetailPanel.module.css';

// Lazy-load each detail view — only the active panel's JS is fetched
const TrackedFundingDetail = lazy(() => import('./kpi-details/TrackedFundingDetail'));
const PublicCapitalShareDetail = lazy(() => import('./kpi-details/PublicCapitalShareDetail'));
const DealOriginationDetail = lazy(() => import('./kpi-details/DealOriginationDetail'));
const CapitalDeployedDetail = lazy(() => import('./kpi-details/CapitalDeployedDetail'));
const SsbciCapitalDetail = lazy(() => import('./kpi-details/SsbciCapitalDetail'));
const PrivateLeverageDetail = lazy(() => import('./kpi-details/PrivateLeverageDetail'));
const EcosystemCapacityDetail = lazy(() => import('./kpi-details/EcosystemCapacityDetail'));
const InnovationMomentumDetail = lazy(() => import('./kpi-details/InnovationMomentumDetail'));

const PANEL_CONFIG = {
  trackedFunding: {
    title: 'Tracked Funding',
    subtitle: 'Total Ecosystem Capital Analysis',
    icon: '\u25C6',
  },
  publicCapitalShare: {
    title: 'Public Capital Share',
    subtitle: 'Public Institution Funding & Network Bridging',
    icon: '\u25A0',
  },
  dealOrigination: {
    title: 'Deal Origination',
    subtitle: 'Accelerator Pipeline \u2192 Institutional Capital',
    icon: '\u25B6',
  },
  capitalDeployed: {
    title: 'Capital Deployed',
    subtitle: 'Ecosystem Fund Deployment Analysis',
    icon: '\u25C8',
  },
  ssbciCapitalDeployed: {
    title: 'SSBCI Capital',
    subtitle: 'Federal Program Compliance & Deployment',
    icon: '\u25A3',
  },
  privateLeverage: {
    title: 'Private Leverage',
    subtitle: 'Treasury Co-Investment Multiplier',
    icon: '\u25B3',
  },
  ecosystemCapacity: {
    title: 'Ecosystem Capacity',
    subtitle: 'Employment & Economic Footprint',
    icon: '\u25CF',
  },
  innovationIndex: {
    title: 'Innovation Momentum',
    subtitle: 'Composite Ecosystem Health Index',
    icon: '\u26A1',
  },
};

function DetailFallback() {
  return (
    <div className={styles.detailContent} style={{ padding: '2rem', opacity: 0.5 }}>
      Loading detail view...
    </div>
  );
}

export const KpiDetailPanel = memo(function KpiDetailPanel({
  activeKpi,
  kpis,
  funds = [],
  companies = [],
  sectorStats = [],
  onClose,
}) {
  if (!activeKpi) return null;

  const config = PANEL_CONFIG[activeKpi] || { title: 'KPI Detail', subtitle: '', icon: '\u25C8' };

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>{config.icon}</span>
            <div className={styles.headerTitleGroup}>
              <span className={styles.headerTitle}>{config.title}</span>
              {config.subtitle && (
                <span className={styles.headerSubtitle}>{config.subtitle}</span>
              )}
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Close detail panel"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Content — lazy-loaded by activeKpi */}
        <Suspense fallback={<DetailFallback />}>
          {activeKpi === 'trackedFunding' && (
            <TrackedFundingDetail companies={companies} />
          )}
          {activeKpi === 'publicCapitalShare' && (
            <PublicCapitalShareDetail kpi={kpis?.publicCapitalShare} />
          )}
          {activeKpi === 'dealOrigination' && (
            <DealOriginationDetail kpi={kpis?.dealOrigination} />
          )}
          {activeKpi === 'capitalDeployed' && (
            <CapitalDeployedDetail funds={funds} companies={companies} />
          )}
          {activeKpi === 'ssbciCapitalDeployed' && (
            <SsbciCapitalDetail funds={funds} />
          )}
          {activeKpi === 'privateLeverage' && (
            <PrivateLeverageDetail funds={funds} />
          )}
          {activeKpi === 'ecosystemCapacity' && (
            <EcosystemCapacityDetail companies={companies} />
          )}
          {activeKpi === 'innovationIndex' && (
            <InnovationMomentumDetail companies={companies} sectorStats={sectorStats} />
          )}
        </Suspense>
      </div>
    </div>
  );
});
