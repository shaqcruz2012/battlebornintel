import { useState, useMemo, useCallback } from 'react';
import { useSectorStats } from '../../api/hooks';
import { useCompanies } from '../../api/hooks';
import { useFilters } from '../../hooks/useFilters';
import { MainGrid } from '../layout/AppShell';
import { SectorDetailDrawer } from '../dashboard/SectorDetailDrawer';
import styles from './SectorsView.module.css';

/* ── Constants ──────────────────────────────────────────────── */

const SORT_OPTIONS = [
  { key: 'heat', label: 'Heat Score' },
  { key: 'count', label: 'Companies' },
  { key: 'name', label: 'Name' },
];

/* ── Heat color helpers ────────────────────────────────────── */

function heatColor(heat) {
  if (heat >= 85) return 'var(--status-risk)';
  if (heat >= 70) return 'var(--accent-gold)';
  if (heat >= 55) return 'var(--accent-teal)';
  return 'var(--text-disabled)';
}

function heatLabel(heat) {
  if (heat >= 85) return 'Critical';
  if (heat >= 70) return 'High';
  if (heat >= 55) return 'Moderate';
  return 'Low';
}

/* ── Loading Skeleton ──────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.loadingWrapper}>
        <div className={styles.skeletonKpi}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`skeleton ${styles.skeletonKpiCell}`} />
          ))}
        </div>
        <div className={styles.skeletonTable} />
      </div>
    </MainGrid>
  );
}

/* ── Sector Card ───────────────────────────────────────────── */

function SectorCard({ sector, onClick }) {
  const heat = sector.heat ?? 0;
  const count = sector.count ?? 0;
  const avgMomentum = sector.avg_momentum ?? sector.momentum ?? 0;
  const totalFunding = sector.totalFunding ?? 0;
  const fundingLabel = totalFunding >= 1000
    ? `$${(totalFunding / 1000).toFixed(1)}B`
    : totalFunding > 0
      ? `$${Math.round(totalFunding)}M`
      : '--';

  return (
    <div
      className={styles.sectorCard}
      onClick={() => onClick(sector.sector)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(sector.sector); } }}
    >
      <div className={styles.cardHeader}>
        <span className={styles.sectorName}>{sector.sector}</span>
        <div
          className={styles.heatBadge}
          style={{
            color: heatColor(heat),
            background: `color-mix(in srgb, ${heatColor(heat)} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${heatColor(heat)} 25%, transparent)`,
          }}
        >
          <span className={styles.heatDot} style={{ background: heatColor(heat) }} />
          {heat}
          <span className={styles.heatSuffix}>{heatLabel(heat)}</span>
        </div>
      </div>

      <div className={styles.cardStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{count}</span>
          <span className={styles.statLabel}>Companies</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{fundingLabel}</span>
          <span className={styles.statLabel}>Funding</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{avgMomentum > 0 ? Math.round(avgMomentum) : '--'}</span>
          <span className={styles.statLabel}>Momentum</span>
        </div>
      </div>

      {/* Heat bar */}
      <div className={styles.heatBar}>
        <div
          className={styles.heatFill}
          style={{ width: `${Math.min(heat, 100)}%`, background: heatColor(heat) }}
        />
      </div>
    </div>
  );
}

/* ── Main View ─────────────────────────────────────────────── */

export function SectorsView() {
  const { filters } = useFilters();
  const { data: sectorStats = [], isLoading: loadingSectors } = useSectorStats({ region: filters.region });
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies({
    region: filters.region,
  });

  const [sortBy, setSortBy] = useState('heat');
  const [selectedSector, setSelectedSector] = useState(null);

  /* Sort sectors */
  const sortedSectors = useMemo(() => {
    const sorted = [...sectorStats];
    switch (sortBy) {
      case 'heat':
        sorted.sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0));
        break;
      case 'count':
        sorted.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
        break;
      case 'name':
        sorted.sort((a, b) => (a.sector || '').localeCompare(b.sector || ''));
        break;
      default:
        break;
    }
    return sorted;
  }, [sectorStats, sortBy]);

  /* Aggregate KPIs */
  const kpis = useMemo(() => {
    const totalCompanies = sectorStats.reduce((s, sec) => s + (sec.count ?? 0), 0);
    const totalFunding = sectorStats.reduce((s, sec) => s + (sec.totalFunding ?? 0), 0);
    const avgHeat = sectorStats.length > 0
      ? Math.round(sectorStats.reduce((s, sec) => s + (sec.heat ?? 0), 0) / sectorStats.length)
      : 0;
    const hotSectors = sectorStats.filter((s) => (s.heat ?? 0) >= 70).length;
    return { totalCompanies, totalFunding, avgHeat, hotSectors, totalSectors: sectorStats.length };
  }, [sectorStats]);

  /* Companies for selected sector (used by drawer) */
  const sectorCompanies = useMemo(() => {
    if (!selectedSector) return [];
    return companies.filter((c) => {
      const sectors = c.sectors || c.sector || [];
      if (Array.isArray(sectors)) return sectors.includes(selectedSector);
      return sectors === selectedSector;
    });
  }, [companies, selectedSector]);

  const handleSectorClick = useCallback((sectorName) => {
    setSelectedSector(sectorName);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedSector(null);
  }, []);

  if (loadingSectors) {
    return <LoadingSkeleton />;
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* ── KPI Strip ────────────────────────────────────── */}
        <div className={styles.kpiStrip}>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{kpis.totalSectors}</span>
            <span className={styles.kpiLabel}>Tracked Sectors</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{kpis.totalCompanies}</span>
            <span className={styles.kpiLabel}>Total Companies</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>
              {kpis.totalFunding >= 1000
                ? `$${(kpis.totalFunding / 1000).toFixed(1)}B`
                : kpis.totalFunding > 0
                  ? `$${Math.round(kpis.totalFunding)}M`
                  : '--'}
            </span>
            <span className={styles.kpiLabel}>Total Funding</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{kpis.avgHeat}</span>
            <span className={styles.kpiLabel}>Avg Heat Score</span>
          </div>
          <div className={styles.kpiCell}>
            <span className={styles.kpiValue}>{kpis.hotSectors}</span>
            <span className={styles.kpiLabel}>Hot Sectors (70+)</span>
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────── */}
        <div className={styles.controls}>
          <span className={styles.controlsLabel}>Sort</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.sortBtn} ${sortBy === opt.key ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy(opt.key)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
          <span className={styles.sectionCount}>{sortedSectors.length} sectors</span>
        </div>

        {/* ── Sector Cards Grid ────────────────────────────── */}
        <div className={styles.sectorsGrid}>
          {sortedSectors.map((sector) => (
            <SectorCard
              key={sector.sector}
              sector={sector}
              onClick={handleSectorClick}
            />
          ))}
        </div>

        {sortedSectors.length === 0 && (
          <div className={styles.emptyState}>
            No sector data available.
          </div>
        )}
      </div>

      {/* ── Sector Detail Drawer (reuse existing) ──────── */}
      {selectedSector && (
        <SectorDetailDrawer
          sector={selectedSector}
          companies={sectorCompanies}
          sectorStats={sectorStats}
          onClose={handleCloseDrawer}
        />
      )}
    </MainGrid>
  );
}
