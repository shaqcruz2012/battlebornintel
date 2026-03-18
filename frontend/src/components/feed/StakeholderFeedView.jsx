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


// ── Utility functions ──────────────────────────────────────────────────────────

function formatFeedDate(dateStr) {
  if (!dateStr) return '';
  // Handle both ISO timestamps (2026-01-20T08:00:00.000Z) and date-only strings (2026-01-20)
  const datePart = String(dateStr).split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
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

function DataQualityBadge({ activity }) {
  const hasSource = !!activity.source_url;
  const isVerified = !!activity.verified;
  const confidence = activity.confidence;

  let label = 'UNVERIFIED';
  let level = 'low';
  if (isVerified && hasSource) {
    label = 'HIGH CONFIDENCE';
    level = 'high';
  } else if (hasSource || confidence >= 0.7) {
    label = 'SOURCED';
    level = 'medium';
  }

  return (
    <span className={`${styles.dataQualityBadge} ${styles[`dq_${level}`]}`}>
      {label}
    </span>
  );
}

function FeedCard({ activity, isExpanded, onToggle }) {
  const barColor = getStakeholderBarColor(activity.stakeholder_type);
  const eventBadge = getEventTypeBadge(activity.activity_type);
  const regionBadge = getRegionBadge(activity.location);
  const dateLabel = formatFeedDate(activity.date);
  const typeLabel = (activity.activity_type_label || activity.activity_type || '').toUpperCase();
  const regionLabel = activity.location_label || (activity.location || '').toUpperCase();

  const handleCardClick = useCallback(() => {
    onToggle(activity.id);
  }, [activity.id, onToggle]);

  return (
    <div className={`${styles.card} ${isExpanded ? styles.cardExpanded : ''}`}>
      <div className={styles.cardBar} style={{ backgroundColor: barColor }} />
      <div className={styles.cardBody}>
        <div className={styles.cardClickArea} onClick={handleCardClick} role="button" tabIndex={0}>
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
              <span className={styles.expandChevron}>
                {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </div>
          </div>

          <h3 className={styles.cardTitle}>{activity.company_name}</h3>

          <p className={isExpanded ? styles.cardDescriptionFull : styles.cardDescription}>
            {activity.description}
          </p>
        </div>

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
          <div className={styles.cardFooterRight}>
            {activity.source_url && (
              <a
                href={activity.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
                title={activity.source || 'Source'}
                onClick={(e) => e.stopPropagation()}
              >
                {activity.source && !activity.source.startsWith('http')
                  ? activity.source
                  : 'Source'} &#8599;
              </a>
            )}
            {!activity.source_url && activity.source && (
              <span className={styles.sourceLabel}>{activity.source}</span>
            )}
          </div>
        </div>

        {/* Expandable detail section */}
        {isExpanded && (
          <div className={styles.detailSection}>
            <div className={styles.detailGrid}>
              {activity.stakeholder_type_label && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>STAKEHOLDER TYPE</span>
                  <span className={styles.detailValue}>{activity.stakeholder_type_label}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>DATA QUALITY</span>
                <DataQualityBadge activity={activity} />
              </div>
              {activity.source_url && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>SOURCE</span>
                  <a
                    href={activity.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailSourceLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activity.source || 'View Source'} &#8599;
                  </a>
                </div>
              )}
              {activity.company_name && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>COMPANY</span>
                  <span className={styles.detailCompanyLink}>{activity.company_name}</span>
                </div>
              )}
            </div>

            {activity.description && (
              <div className={styles.detailFullDescription}>
                <span className={styles.detailLabel}>FULL DESCRIPTION</span>
                <p className={styles.detailDescriptionText}>{activity.description}</p>
              </div>
            )}
          </div>
        )}
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
                  <FeedCard
                    key={activity.id}
                    activity={activity}
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
