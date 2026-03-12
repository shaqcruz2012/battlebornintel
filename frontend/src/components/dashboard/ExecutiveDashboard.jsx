import { useState } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useCompanies, useKpis, useSectorStats, useFunds } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { KpiStrip } from './KpiStrip';
import { KpiDetailPanel } from './KpiDetailPanel';
import { SectorHeatStrip } from './SectorHeatStrip';
import { SectorDetailDrawer } from './SectorDetailDrawer';
import { MomentumTable } from './MomentumTable';
import { NarrativePanel } from './NarrativePanel';

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

export function ExecutiveDashboard({ onViewChange }) {
  const { filters, setSortBy, setSector } = useFilters();
  const [selectedSector, setSelectedSector] = useState(null);
  const [activeKpi, setActiveKpi] = useState(null);

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

  const handleViewAllCompanies = (sector) => {
    if (sector) setSector(sector);
    if (onViewChange) onViewChange('companies');
    setSelectedSector(null);
  };

  return (
    <MainGrid>
      <KpiStrip
        kpis={kpis}
        funds={funds}
        activeSortBy={filters.sortBy}
        onSortChange={setSortBy}
        onKpiClick={setActiveKpi}
        activeKpi={activeKpi}
      />
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
      <SectorHeatStrip
        sectors={sectorStats}
        activeSector={filters.sector}
        onSectorChange={setSector}
        onSectorClick={setSelectedSector}
      />
      <MomentumTable
        companies={companies}
        sortBy={filters.sortBy}
        onSortChange={setSortBy}
      />
      <NarrativePanel companies={companies} funds={funds} activeSector={filters.sector} sectorStats={sectorStats} />
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
