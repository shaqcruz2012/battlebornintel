import { useState, useMemo, useCallback } from 'react';
import { useCompanies } from '../../api/hooks';
import { useFilters } from '../../hooks/useFilters';
import { MainGrid } from '../layout/AppShell';
import { FilterChip } from '../shared/FilterChip';
import { Card } from '../shared/Card';
import { CompanyRow } from './CompanyRow';
import { CompanyDetailDrawer } from './CompanyDetailDrawer';
import { downloadCsv } from '../../utils/exportCsv';
import styles from './CompaniesView.module.css';

const STAGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'growth', label: 'Growth' },
];

const REGION_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Las Vegas', label: 'Las Vegas' },
  { value: 'Reno', label: 'Reno' },
  { value: 'Rural', label: 'Rural' },
];

const TOP_SECTORS = [
  'AI', 'Cybersecurity', 'Defense', 'Cleantech', 'Mining',
  'Aerospace', 'Fintech', 'Biotech', 'Gaming', 'Energy',
];

const COLUMNS = [
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'irs', label: 'IRS', align: 'right' },
  { key: 'grade', label: 'Grade', align: 'left' },
  { key: 'stage', label: 'Stage', align: 'left', hideClass: 'colStage' },
  { key: 'funding', label: 'Funding', align: 'right', hideClass: 'colFunding' },
  { key: 'momentum', label: 'Momentum', align: 'right', hideClass: 'colMomentum' },
  { key: 'city', label: 'City', align: 'left', hideClass: 'colCity' },
  { key: 'sector', label: 'Sectors', align: 'left', hideClass: 'colSectors' },
];

const GRADE_SORT_ORDER = { A: 1, 'A-': 2, 'B+': 3, B: 4, 'B-': 5, 'C+': 6, C: 7, D: 8 };
const STAGE_SORT_ORDER = {
  pre_seed: 1, seed: 2, series_a: 3, series_b: 4, series_c_plus: 5, growth: 6,
};

function compareCompanies(a, b, sortKey, sortDir) {
  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortKey === 'grade') {
    const aOrd = GRADE_SORT_ORDER[a.grade] ?? 99;
    const bOrd = GRADE_SORT_ORDER[b.grade] ?? 99;
    return (aOrd - bOrd) * dir;
  }

  if (sortKey === 'stage') {
    const aOrd = STAGE_SORT_ORDER[a.stage] ?? 99;
    const bOrd = STAGE_SORT_ORDER[b.stage] ?? 99;
    return (aOrd - bOrd) * dir;
  }

  if (sortKey === 'sector') {
    const aVal = Array.isArray(a.sector) ? a.sector[0] || '' : a.sector || '';
    const bVal = Array.isArray(b.sector) ? b.sector[0] || '' : b.sector || '';
    return aVal.localeCompare(bVal) * dir;
  }

  if (sortKey === 'name' || sortKey === 'city') {
    const aVal = (a[sortKey] || '').toLowerCase();
    const bVal = (b[sortKey] || '').toLowerCase();
    return aVal.localeCompare(bVal) * dir;
  }

  // Numeric sort for irs, funding, momentum
  const aVal = a[sortKey] ?? -Infinity;
  const bVal = b[sortKey] ?? -Infinity;
  return (aVal - bVal) * dir;
}

function LoadingSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

export function CompaniesView() {
  const { filters } = useFilters();

  const apiFilters = useMemo(() => {
    const f = {};
    if (filters.region && filters.region !== 'all') {
      f.region = filters.region;
    }
    return f;
  }, [filters.region]);

  const { data: companies, isLoading } = useCompanies(apiFilters);

  // Local UI state
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sectorFilters, setSectorFilters] = useState([]);
  const [sortKey, setSortKey] = useState('irs');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const handleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('desc');
      return key;
    });
  }, []);

  const handleToggleSector = useCallback((sector) => {
    setSectorFilters((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  }, []);

  const handleToggleRow = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleExportCsv = useCallback(() => {
    downloadCsv(displayedCompanies, [
      { label: 'Name', accessor: (r) => r.name },
      { label: 'IRS Score', accessor: (r) => r.irs },
      { label: 'Grade', accessor: (r) => r.grade },
      { label: 'Stage', accessor: (r) => r.stage },
      { label: 'Funding ($M)', accessor: (r) => r.funding },
      { label: 'Momentum', accessor: (r) => r.momentum },
      { label: 'City', accessor: (r) => r.city },
      { label: 'Sectors', accessor: (r) => Array.isArray(r.sector) ? r.sector.join('; ') : r.sector },
    ], 'bbi-companies.csv');
  }, [displayedCompanies]);

  // Filtered + sorted list
  const displayedCompanies = useMemo(() => {
    if (!companies) return [];

    const lowerSearch = search.toLowerCase().trim();

    const filtered = companies.filter((c) => {
      // Search filter
      if (lowerSearch) {
        const nameMatch = (c.name || '').toLowerCase().includes(lowerSearch);
        const cityMatch = (c.city || '').toLowerCase().includes(lowerSearch);
        const sectorMatch = Array.isArray(c.sector)
          ? c.sector.some((s) => s.toLowerCase().includes(lowerSearch))
          : false;
        if (!nameMatch && !cityMatch && !sectorMatch) return false;
      }

      // Stage filter
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false;

      // Region filter
      if (regionFilter !== 'all') {
        const regionLower = regionFilter.toLowerCase();
        const cityLower = (c.city || '').toLowerCase();
        const compRegion = (c.region || '').toLowerCase();
        if (!cityLower.includes(regionLower) && !compRegion.includes(regionLower)) {
          return false;
        }
      }

      // Sector filter (AND logic: company must have all selected sectors)
      if (sectorFilters.length > 0) {
        const companySectors = Array.isArray(c.sector) ? c.sector : [];
        const hasAll = sectorFilters.every((sf) =>
          companySectors.some((cs) => cs.toLowerCase() === sf.toLowerCase())
        );
        if (!hasAll) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) =>
      compareCompanies(a, b, sortKey, sortDir)
    );

    return sorted;
  }, [companies, search, stageFilter, regionFilter, sectorFilters, sortKey, sortDir]);

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* ── Toolbar ────────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <span className={styles.separator} />

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Stage</span>
            {STAGE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={stageFilter === opt.value}
                onClick={() => setStageFilter(opt.value)}
                small
              />
            ))}
          </div>

          <span className={styles.separator} />

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Region</span>
            {REGION_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={regionFilter === opt.value}
                onClick={() => setRegionFilter(opt.value)}
                small
              />
            ))}
          </div>

          <span className={styles.separator} />

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Sector</span>
            {TOP_SECTORS.map((sector) => (
              <FilterChip
                key={sector}
                label={sector}
                active={sectorFilters.includes(sector)}
                onClick={() => handleToggleSector(sector)}
                small
              />
            ))}
          </div>

          <span className={styles.separator} />

          <button
            className={styles.csvBtn}
            onClick={handleExportCsv}
            disabled={displayedCompanies.length === 0}
            title="Download filtered companies as CSV"
          >
            &#8595; CSV
          </button>
        </div>

        {/* ── Loading ────────────────────────────────────────── */}
        {isLoading && <LoadingSkeleton />}

        {/* ── Table ──────────────────────────────────────────── */}
        {!isLoading && displayedCompanies.length > 0 && (
          <div style={{ overflow: 'auto', flex: 1 }}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={[
                        styles.th,
                        sortKey === col.key ? styles.sorted : '',
                        col.align === 'right' ? styles.thRight : '',
                        col.hideClass ? styles[col.hideClass] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key && (
                        <span className={styles.sortArrow}>
                          {sortDir === 'asc' ? '\u25B2' : '\u25BC'}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className={styles.th} style={{ width: 28 }} />
                </tr>
              </thead>
              <tbody>
                {displayedCompanies.map((company) => (
                  <CompanyRow
                    key={company.id || company.slug}
                    company={company}
                    isExpanded={expandedId === (company.id || company.slug)}
                    onToggle={() => handleToggleRow(company.id || company.slug)}
                    onViewDetail={setDetailId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────── */}
        {!isLoading && displayedCompanies.length === 0 && (
          <div className={styles.empty}>
            No companies match the current filters.
          </div>
        )}

        {/* ── Status bar ─────────────────────────────────────── */}
        <div className={styles.statusBar}>
          <span>
            <span className={styles.statusCount}>{displayedCompanies.length}</span>
            {' '}of{' '}
            <span className={styles.statusCount}>{companies?.length || 0}</span>
            {' '}companies
          </span>
          <span>
            Sort: {COLUMNS.find((c) => c.key === sortKey)?.label || sortKey}{' '}
            {sortDir === 'asc' ? 'ASC' : 'DESC'}
          </span>
        </div>
      </div>

      {/* ── Company detail drawer ─────────────────────────── */}
      {detailId && (
        <CompanyDetailDrawer
          companyId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </MainGrid>
  );
}
