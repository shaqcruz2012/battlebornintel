import { useFilters } from '../../hooks/useFilters';
import { useCompanies, useKpis, useSectorStats, useFunds } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { KpiStrip } from './KpiStrip';
import { SectorHeatStrip } from './SectorHeatStrip';
import { MomentumTable } from './MomentumTable';
import { NarrativePanel } from './NarrativePanel';
import { RiskAlerts } from './RiskAlerts';

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
  const { data: funds = [] } = useFunds();

  const isLoading = loadingCompanies || loadingKpis || loadingSectors;

  if (isLoading) {
    return (
      <MainGrid>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading dashboard...
        </div>
      </MainGrid>
    );
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
      <NarrativePanel companies={companies} />
      <RiskAlerts companies={companies} />
    </MainGrid>
  );
}
