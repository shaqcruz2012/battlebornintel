import { useState, useMemo, useCallback } from 'react';
import { useStakeholderActivities } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
import { EventCard } from '../shared/EventCard';
import styles from './StakeholderFeedView.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const REGIONS = [
  { id: 'all', label: 'ALL' },
  { id: 'las_vegas', label: 'LAS VEGAS' },
  { id: 'reno', label: 'RENO' },
  { id: 'henderson', label: 'HENDERSON' },
  { id: 'carson_city', label: 'CARSON CITY' },
  { id: 'statewide', label: 'STATEWIDE' },
];

const STAKEHOLDER_TYPES = [
  { id: 'all', label: 'ALL' },
  { id: 'gov', label: 'GOV/POLICY' },
  { id: 'university', label: 'UNIVERSITIES' },
  { id: 'corporate', label: 'CORPORATE' },
  { id: 'capital', label: 'CAPITAL' },
  { id: 'ecosystem', label: 'ECOSYSTEM' },
];

const EVENT_TYPES = [
  { id: 'all', label: 'ALL' },
  { id: 'funding', label: 'FUNDING' },
  { id: 'grant', label: 'GRANTS' },
  { id: 'legislation', label: 'LEGISLATION' },
  { id: 'partnership', label: 'PARTNERSHIP' },
  { id: 'milestone', label: 'MILESTONE' },
];

const DATE_RANGES = [
  { id: 'week', label: 'THIS WEEK' },
  { id: 'month', label: 'THIS MONTH' },
  { id: '30d', label: 'LAST 30 DAYS' },
  { id: 'all', label: 'ALL TIME' },
];

// ── Utility functions ──────────────────────────────────────────────────────────

function getDateRangeBounds(rangeId) {
  const now = new Date();
  if (rangeId === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return { since: startOfWeek.toISOString().split('T')[0] };
  }
  if (rangeId === 'month') {
    return { since: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01` };
  }
  if (rangeId === '30d') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { since: d.toISOString().split('T')[0] };
  }
  return {};
}

function normalizeLocation(location) {
  if (!location) return 'all';
  return location.toLowerCase().replace(/[\s/-]+/g, '_');
}

function matchesRegion(activity, regionId) {
  if (regionId === 'all') return true;
  const loc = normalizeLocation(activity.location);
  return loc === regionId || loc.includes(regionId);
}

function matchesStakeholderType(activity, typeId) {
  if (typeId === 'all') return true;
  const t = (activity.stakeholder_type || '').toLowerCase();
  return t === typeId || t.startsWith(typeId);
}

function matchesEventType(activity, typeId) {
  if (typeId === 'all') return true;
  const t = (activity.activity_type || '').toLowerCase().replace(/\s+/g, '_');
  return t === typeId || t.includes(typeId);
}

function matchesDateRange(activity, rangeId) {
  if (rangeId === 'all') return true;
  const bounds = getDateRangeBounds(rangeId);
  if (!bounds.since) return true;
  // Compare date-only portion to handle ISO timestamps
  const activityDate = String(activity.date).split('T')[0];
  return activityDate >= bounds.since;
}

function matchesSearch(activity, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const haystack = [
    activity.company_name,
    activity.description,
    activity.location_label,
    activity.activity_type_label,
    activity.stakeholder_type_label,
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}

// ── Week label for header ──────────────────────────────────────────────────────

function getCurrentWeekLabel() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 4); // Friday

  const opts = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `Week of ${startStr}–${endStr}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      className={`${styles.filterChip} ${active ? styles.filterChipActive : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterGroupLabel}>{label}:</span>
      <div className={styles.filterChips}>
        {options.map((opt) => (
          <FilterChip
            key={opt.id}
            label={opt.label}
            active={value === opt.id}
            onClick={() => onChange(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarStats({ activities }) {
  const totalCapital = useMemo(() => {
    const amounts = activities
      .map((a) => a.amount)
      .filter(Boolean)
      .map((s) => {
        const n = s.replace(/[$,BMK]/gi, '').trim();
        const num = parseFloat(n);
        if (isNaN(num)) return 0;
        if (s.includes('B')) return num * 1000;
        if (s.includes('K')) return num / 1000;
        return num;
      });
    const total = amounts.reduce((acc, n) => acc + n, 0);
    if (total === 0) return '—';
    if (total >= 1000) return `$${(total / 1000).toFixed(1)}B`;
    return `$${total.toFixed(0)}M`;
  }, [activities]);

  const regionCounts = useMemo(() => {
    const counts = {};
    activities.forEach((a) => {
      const loc = a.location_label || a.location || 'Unknown';
      counts[loc] = (counts[loc] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [activities]);

  const maxCount = regionCounts[0]?.[1] || 1;
  const mostActiveRegion = regionCounts[0]?.[0] || '—';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>WEEK AT A GLANCE</h4>
        <div className={styles.sidebarStats}>
          <div className={styles.sidebarStat}>
            <span className={styles.sidebarStatValue}>{activities.length}</span>
            <span className={styles.sidebarStatLabel}>Total Events</span>
          </div>
          <div className={styles.sidebarStat}>
            <span className={styles.sidebarStatValue} style={{ color: 'var(--accent-teal)' }}>
              {totalCapital}
            </span>
            <span className={styles.sidebarStatLabel}>Capital Deployed</span>
          </div>
          <div className={styles.sidebarStat}>
            <span className={styles.sidebarStatValue} style={{ fontSize: '14px' }}>
              {mostActiveRegion}
            </span>
            <span className={styles.sidebarStatLabel}>Most Active Region</span>
          </div>
        </div>
      </div>

      {regionCounts.length > 0 && (
        <div className={styles.sidebarSection}>
          <h4 className={styles.sidebarTitle}>EVENTS BY REGION</h4>
          <div className={styles.regionChart}>
            {regionCounts.map(([region, count]) => (
              <div key={region} className={styles.regionChartRow}>
                <span className={styles.regionChartLabel}>{region}</span>
                <div className={styles.regionChartBar}>
                  <div
                    className={styles.regionChartFill}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className={styles.regionChartCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.sidebarSection}>
        <h4 className={styles.sidebarTitle}>DATA SOURCES</h4>
        <div className={styles.sourcesList}>
          {['GOED', 'SBIR.gov', 'Crunchbase', 'Nevada Legislature', 'USPTO'].map((s) => (
            <span key={s} className={styles.sourceTag}>{s}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>&#9643;</div>
      <p className={styles.emptyTitle}>
        {hasFilters ? 'No events match your filters' : 'No activities recorded'}
      </p>
      <p className={styles.emptyBody}>
        {hasFilters
          ? 'Try broadening your filters or clearing the search field. The activity feed is sourced from GOED program data, SBIR.gov award records, and Crunchbase.'
          : 'Stakeholder activities will appear here as they are recorded from GOED program data, SBIR.gov, and Crunchbase.'}
      </p>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

export function StakeholderFeedView() {
  const [region, setRegion] = useState('all');
  const [stakeholderType, setStakeholderType] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleToggleExpand = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const apiParams = useMemo(() => {
    const bounds = getDateRangeBounds(dateRange);
    return {
      region: region !== 'all' ? region : undefined,
      type: eventType !== 'all' ? eventType : undefined,
      stakeholderType: stakeholderType !== 'all' ? stakeholderType : undefined,
      ...bounds,
      limit: 200,
    };
  }, [region, eventType, stakeholderType, dateRange]);

  const { data: apiActivities, isLoading, error } = useStakeholderActivities(apiParams);

  const baseActivities = useMemo(() => {
    return apiActivities ?? [];
  }, [apiActivities]);

  const filtered = useMemo(() => {
    return baseActivities.filter((a) => {
      return (
        matchesRegion(a, region) &&
        matchesStakeholderType(a, stakeholderType) &&
        matchesEventType(a, eventType) &&
        matchesDateRange(a, dateRange) &&
        matchesSearch(a, searchQuery)
      );
    });
  }, [baseActivities, region, stakeholderType, eventType, dateRange, searchQuery]);

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  const hasFilters =
    region !== 'all' ||
    stakeholderType !== 'all' ||
    eventType !== 'all' ||
    dateRange !== 'all' ||
    !!searchQuery.trim();

  const weekLabel = getCurrentWeekLabel();

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        {/* ── Terminal header ───────────────────────────────── */}
        <div className={styles.terminalHeader}>
          <div className={styles.terminalHeaderTop}>
            <h1 className={styles.terminalTitle}>STAKEHOLDER INTELLIGENCE FEED</h1>
            <div className={styles.terminalMeta}>
              <span className={styles.terminalWeek}>{weekLabel}</span>
              <span className={styles.terminalLive}>
                <span className={styles.terminalLiveDot} />
                LIVE
              </span>
            </div>
          </div>
          <div className={styles.terminalDivider} />
        </div>

        {/* ── Filter bar ────────────────────────────────────── */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroups}>
            <FilterGroup
              label="REGION"
              options={REGIONS}
              value={region}
              onChange={setRegion}
            />
            <FilterGroup
              label="TYPE"
              options={EVENT_TYPES}
              value={eventType}
              onChange={setEventType}
            />
            <FilterGroup
              label="STAKEHOLDER"
              options={STAKEHOLDER_TYPES}
              value={stakeholderType}
              onChange={setStakeholderType}
            />
            <FilterGroup
              label="DATE"
              options={DATE_RANGES}
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>&#128269;</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search activities"
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={handleClearSearch}
                type="button"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        {/* ── Main content area ─────────────────────────────── */}
        <div className={styles.contentArea}>
          {/* Feed column */}
          <div className={styles.feedColumn}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <span>Loading stakeholder activities...</span>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p className={styles.errorTitle}>Error loading activities</p>
                <p className={styles.errorBody}>{error.message}</p>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              <div className={styles.feedList}>
                <div className={styles.feedResultsBar}>
                  <span className={styles.feedResultsCount}>
                    {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
                    {hasFilters ? ' matching filters' : ''}
                  </span>
                  {hasFilters && (
                    <button
                      className={styles.clearFiltersBtn}
                      type="button"
                      onClick={() => {
                        setRegion('all');
                        setStakeholderType('all');
                        setEventType('all');
                        setDateRange('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {filtered.map((activity) => (
                  <EventCard
                    key={activity.id}
                    event={activity}
                    isExpanded={expandedId === activity.id}
                    onToggle={handleToggleExpand}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <SidebarStats activities={filtered.length > 0 ? filtered : baseActivities} />
        </div>
      </div>
    </MainGrid>
  );
}
