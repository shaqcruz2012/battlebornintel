import { useMemo } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { COMPANIES } from '../../data/companies';
import { FUNDS } from '../../data/funds';
import { computeIRS } from '../../engine/scoring';
import { filterCompanies } from '../../engine/filters';
import { MainGrid } from '../layout/AppShell';
import { KpiStrip } from './KpiStrip';
import { SectorHeatStrip } from './SectorHeatStrip';
import { MomentumTable } from './MomentumTable';
import { NarrativePanel } from './NarrativePanel';
import { RiskAlerts } from './RiskAlerts';

export function ExecutiveDashboard() {
  const { filters, setSortBy, setSector } = useFilters();

  // Score all companies once
  const scored = useMemo(() => COMPANIES.map(computeIRS), []);

  // Filter based on current filter state
  const filtered = useMemo(
    () =>
      filterCompanies(scored, {
        search: filters.search,
        stage: filters.stage,
        region: filters.region,
        sector: filters.sector,
        sortBy: filters.sortBy,
      }),
    [scored, filters]
  );

  return (
    <MainGrid>
      <KpiStrip
        companies={filtered}
        funds={FUNDS}
        activeSortBy={filters.sortBy}
        onSortChange={setSortBy}
      />
      <SectorHeatStrip
        companies={scored}
        activeSector={filters.sector}
        onSectorChange={setSector}
      />
      <MomentumTable
        companies={filtered}
        sortBy={filters.sortBy}
        onSortChange={setSortBy}
      />
      <NarrativePanel companies={filtered} />
      <RiskAlerts companies={filtered} />
    </MainGrid>
  );
}
