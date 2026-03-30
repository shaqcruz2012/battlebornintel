// NOTE: For future optimization, split into separate FilterContext and FilterActionsContext
// to allow components that only dispatch actions to avoid re-rendering on filter changes.
import { createContext, useContext, useState, useMemo } from 'react';

const FilterContext = createContext(null);

const DEFAULTS = {
  region: 'all',
  sector: 'all',
  stage: 'all',
  search: '',
  sortBy: 'irs',
  timeframe: 'all',
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULTS);

  const actions = useMemo(
    () => ({
      setRegion: (region) => setFilters((f) => ({ ...f, region })),
      setSector: (sector) => setFilters((f) => ({ ...f, sector })),
      setStage: (stage) => setFilters((f) => ({ ...f, stage })),
      setSearch: (search) => setFilters((f) => ({ ...f, search })),
      setSortBy: (sortBy) => setFilters((f) => ({ ...f, sortBy })),
      setTimeframe: (timeframe) => setFilters((f) => ({ ...f, timeframe })),
      reset: () => setFilters(DEFAULTS),
    }),
    []
  );

  const value = useMemo(() => ({ filters, ...actions }), [filters, actions]);

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
