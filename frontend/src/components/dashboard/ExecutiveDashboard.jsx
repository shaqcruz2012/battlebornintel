import { useFilters } from '../../hooks/useFilters';
import { useCompanies, useKpis, useSectorStats, useFunds } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { KpiStrip } from './KpiStrip';
import { SectorHeatStrip } from './SectorHeatStrip';
import { MomentumTable } from './MomentumTable';
import { NarrativePanel } from './NarrativePanel';
import { RiskAlerts } from './RiskAlerts';

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
          padding: 'var(--space-2xl) 0',
        }}
      >
        {/* KPI strip skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            background: 'var(--border-grid)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '96px',
                background: 'var(--bg-card)',
              }}
            />
          ))}
        </div>
        {/* Table skeleton */}
        <div
          className="skeleton"
          style={{
            height: '400px',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </div>
    </MainGrid>
  );
}

export function ExecutiveDashboard() {
  const { filters, setSortBy, setSector } = useFilters();

  const { data: companies = [], isLoading: loadingCompanies } = useCompanies({
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

  const { data: sectorStats = [], isLoading: loadingSectors } = useSectorStats();
  const { data: funds = [] } = useFunds(
    filters.region && filters.region !== 'all' ? { region: filters.region } : {}
  );

  const isLoading = loadingCompanies || loadingKpis || loadingSectors;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <MainGrid>
      <KpiStrip
        kpis={kpis}
        funds={funds}
        activeSortBy={filters.sortBy}
        onSortChange={setSortBy}
      />
      <SectorHeatStrip
        sectors={sectorStats}
        activeSector={filters.sector}
        onSectorChange={setSector}
      />
      <MomentumTable
        companies={companies}
        sortBy={filters.sortBy}
        onSortChange={setSortBy}
      />
      <NarrativePanel companies={companies} funds={funds} />
      <RiskAlerts companies={companies} funds={funds} />
    </MainGrid>
  );
}
