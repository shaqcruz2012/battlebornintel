import { useState, useMemo, useCallback } from 'react';
import { useStakeholderActivities } from '../../api/hooks';
import { MainGrid } from '../layout/AppShell';
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

// Stakeholder type → left-bar accent color
const STAKEHOLDER_TYPE_COLORS = {
  gov: '#5B8DEF',
  government: '#5B8DEF',
  university: '#9B72CF',
  corporate: '#F5C76C',
  capital: '#34C9A8',
  ecosystem: '#45D7C6',
  default: '#45D7C6',
};

// Event type badge colors
const EVENT_TYPE_COLORS = {
  funding: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  grant: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  grant_award: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  legislation: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  partnership: { bg: 'rgba(155, 114, 207, 0.12)', text: '#9B72CF' },
  milestone: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  award: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  expansion: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  launch: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  default: { bg: 'rgba(139, 146, 165, 0.12)', text: '#8B92A5' },
};

// Region badge colors
const REGION_BADGE_COLORS = {
  las_vegas: { bg: 'rgba(232, 83, 76, 0.12)', text: '#E8534C' },
  reno: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  henderson: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  carson_city: { bg: 'rgba(155, 114, 207, 0.12)', text: '#9B72CF' },
  statewide: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  north: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  south: { bg: 'rgba(232, 83, 76, 0.10)', text: '#E8534C' },
  default: { bg: 'rgba(139, 146, 165, 0.12)', text: '#8B92A5' },
};

// ── Mock fallback data ─────────────────────────────────────────────────────────

const MOCK_ACTIVITIES = [
  {
    id: 'mock-1',
    date: '2026-03-05',
    location: 'las_vegas',
    location_label: 'LAS VEGAS',
    activity_type: 'grant_award',
    activity_type_label: 'GRANT AWARD',
    company_name: 'GOED Awards $2.1M SBIR Matching Grants',
    description:
      'Nevada GOED announced a new cohort of SBIR matching grants targeting defense tech and cleantech startups across Southern Nevada. Fifteen companies selected from 60+ applicants.',
    amount: '$2.1M',
    stakeholder_type: 'gov',
    stakeholder_type_label: 'Gov/Policy',
    company_count: 15,
    source: 'GOED',
    verified: true,
  },
  {
    id: 'mock-2',
    date: '2026-03-04',
    location: 'reno',
    location_label: 'RENO',
    activity_type: 'funding',
    activity_type_label: 'FUNDING ROUND',
    company_name: 'Redwood Materials closes $1.4B Series D',
    description:
      'Battery recycling pioneer Redwood Materials raised a $1.4B Series D to expand its Tahoe-Reno Industrial Center campus, targeting 1,500 new jobs in Northern Nevada.',
    amount: '$1.4B',
    stakeholder_type: 'capital',
    stakeholder_type_label: 'Capital',
    company_count: 1,
    source: 'Crunchbase',
    verified: true,
  },
  {
    id: 'mock-3',
    date: '2026-03-03',
    location: 'carson_city',
    location_label: 'CARSON CITY',
    activity_type: 'legislation',
    activity_type_label: 'LEGISLATION',
    company_name: 'Nevada SB 312 — CVC Tax Credit Expansion',
    description:
      'State Senate passed SB 312 expanding the Corporate Venture Capital tax credit program, increasing the annual cap from $10M to $25M and broadening eligible sectors to include defense and biotech.',
    amount: '$25M cap',
    stakeholder_type: 'gov',
    stakeholder_type_label: 'Gov/Policy',
    company_count: null,
    source: 'Nevada Legislature',
    verified: true,
  },
  {
    id: 'mock-4',
    date: '2026-03-03',
    location: 'reno',
    location_label: 'RENO',
    activity_type: 'partnership',
    activity_type_label: 'PARTNERSHIP',
    company_name: 'UNR–Switch Data Center Research Pact',
    description:
      'University of Nevada Reno and Switch signed a 5-year joint research agreement to develop next-generation cooling technology for hyperscale data centers, backed by $8M in Knowledge Fund support.',
    amount: '$8M',
    stakeholder_type: 'university',
    stakeholder_type_label: 'Universities',
    company_count: 2,
    source: 'UNR',
    verified: true,
  },
  {
    id: 'mock-5',
    date: '2026-03-01',
    location: 'las_vegas',
    location_label: 'LAS VEGAS',
    activity_type: 'milestone',
    activity_type_label: 'MILESTONE',
    company_name: 'Allegiant Travel Labs — 50th AI patent granted',
    description:
      "Allegiant's internal technology arm received its 50th US patent in AI-driven revenue management, reinforcing Las Vegas hospitality tech credentials ahead of a planned $120M Series B.",
    amount: null,
    stakeholder_type: 'corporate',
    stakeholder_type_label: 'Corporate',
    company_count: 1,
    source: 'USPTO',
    verified: false,
  },
  {
    id: 'mock-6',
    date: '2026-02-28',
    location: 'henderson',
    location_label: 'HENDERSON',
    activity_type: 'expansion',
    activity_type_label: 'EXPANSION',
    company_name: 'Amentum Henderson Advanced Mfg Campus',
    description:
      "Defense contractor Amentum broke ground on a 220,000 sq ft advanced manufacturing facility in Henderson's industrial corridor, creating an estimated 400 direct jobs and 1,200 indirect.",
    amount: '$95M',
    stakeholder_type: 'corporate',
    stakeholder_type_label: 'Corporate',
    company_count: 1,
    source: 'GOED',
    verified: true,
  },
  {
    id: 'mock-7',
    date: '2026-02-26',
    location: 'statewide',
    location_label: 'STATEWIDE',
    activity_type: 'grant',
    activity_type_label: 'GRANT',
    company_name: 'SSBCI Deployment — Q1 2026 Cohort',
    description:
      'Nevada GOED deployed $18.3M in SSBCI capital across 7 approved funds in Q1 2026, generating a 4.2x leverage ratio and $76M in total capital committed to Nevada small businesses.',
    amount: '$18.3M',
    stakeholder_type: 'gov',
    stakeholder_type_label: 'Gov/Policy',
    company_count: 7,
    source: 'GOED',
    verified: true,
  },
  {
    id: 'mock-8',
    date: '2026-02-24',
    location: 'reno',
    location_label: 'RENO',
    activity_type: 'funding',
    activity_type_label: 'FUNDING ROUND',
    company_name: 'Aqua-Pure Ventures — $22M Series A',
    description:
      'Water tech startup Aqua-Pure Ventures raised $22M led by Prelude Ventures to scale its closed-loop water recycling system for data centers in Nevada and Arizona.',
    amount: '$22M',
    stakeholder_type: 'capital',
    stakeholder_type_label: 'Capital',
    company_count: 1,
    source: 'Crunchbase',
    verified: true,
  },
];

// ── Utility functions ──────────────────────────────────────────────────────────

function formatFeedDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

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

function getStakeholderBarColor(type) {
  return STAKEHOLDER_TYPE_COLORS[type] || STAKEHOLDER_TYPE_COLORS.default;
}

function getEventTypeBadge(type) {
  const key = (type || '').toLowerCase().replace(/\s+/g, '_');
  return EVENT_TYPE_COLORS[key] || EVENT_TYPE_COLORS.default;
}

function getRegionBadge(location) {
  const key = (location || '').toLowerCase().replace(/\s+/g, '_');
  return REGION_BADGE_COLORS[key] || REGION_BADGE_COLORS.default;
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
  return activity.date >= bounds.since;
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

function FeedCard({ activity }) {
  const barColor = getStakeholderBarColor(activity.stakeholder_type);
  const eventBadge = getEventTypeBadge(activity.activity_type);
  const regionBadge = getRegionBadge(activity.location);
  const dateLabel = formatFeedDate(activity.date);
  const typeLabel = (activity.activity_type_label || activity.activity_type || '').toUpperCase();
  const regionLabel = activity.location_label || (activity.location || '').toUpperCase();

  return (
    <div className={styles.card}>
      <div className={styles.cardBar} style={{ backgroundColor: barColor }} />
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <div className={styles.cardMetaLeft}>
            <span className={styles.cardLiveIndicator} />
            <time className={styles.cardTimestamp}>{dateLabel}</time>
          </div>
          <div className={styles.cardMetaRight}>
            <span
              className={styles.regionBadge}
              style={{ backgroundColor: regionBadge.bg, color: regionBadge.text }}
            >
              {regionLabel}
            </span>
            <span
              className={styles.eventTypeBadge}
              style={{ backgroundColor: eventBadge.bg, color: eventBadge.text }}
            >
              {typeLabel}
            </span>
          </div>
        </div>

        <h3 className={styles.cardTitle}>{activity.company_name}</h3>

        <p className={styles.cardDescription}>{activity.description}</p>

        <div className={styles.cardFooter}>
          <div className={styles.cardFooterLeft}>
            {activity.amount && (
              <span className={styles.cardAmount}>{activity.amount}</span>
            )}
            {activity.stakeholder_type_label && (
              <span className={styles.cardStakeholder}>{activity.stakeholder_type_label}</span>
            )}
            {activity.company_count != null && (
              <span className={styles.cardCount}>
                {activity.company_count}{' '}
                {activity.company_count === 1 ? 'company' : 'companies'}
              </span>
            )}
            {activity.verified && (
              <span className={styles.cardVerified} title="Verified source">
                VERIFIED
              </span>
            )}
          </div>
          <button className={styles.cardReadMore} type="button">
            READ MORE &#x2192;
          </button>
        </div>
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
  const [dateRange, setDateRange] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');

  const apiParams = useMemo(() => {
    const bounds = getDateRangeBounds(dateRange);
    return {
      region: region !== 'all' ? region : undefined,
      type: eventType !== 'all' ? eventType : undefined,
      stakeholderType: stakeholderType !== 'all' ? stakeholderType : undefined,
      ...bounds,
      limit: 100,
    };
  }, [region, eventType, stakeholderType, dateRange]);

  const { data: apiActivities, isLoading, error } = useStakeholderActivities(apiParams);

  // Prefer real API data; fall back to mock when API returns empty or errors
  const baseActivities = useMemo(() => {
    if (apiActivities && apiActivities.length > 0) return apiActivities;
    return MOCK_ACTIVITIES;
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
    dateRange !== 'week' ||
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
                <p className={styles.errorBody}>
                  Showing sample data. {error.message}
                </p>
                {MOCK_ACTIVITIES.filter((a) =>
                  matchesRegion(a, region) &&
                  matchesStakeholderType(a, stakeholderType) &&
                  matchesEventType(a, eventType) &&
                  matchesDateRange(a, dateRange) &&
                  matchesSearch(a, searchQuery)
                ).map((activity) => (
                  <FeedCard key={activity.id} activity={activity} />
                ))}
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
                        setDateRange('week');
                        setSearchQuery('');
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {filtered.map((activity) => (
                  <FeedCard key={activity.id} activity={activity} />
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
