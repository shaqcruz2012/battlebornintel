import { useState, useMemo, useCallback, memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStakeholderActivities } from '../../api/hooks';
import styles from './StakeholderActivityFeed.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const STAKEHOLDER_CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'gov_policy', label: 'GOV/POLICY' },
  { id: 'university', label: 'UNIVERSITIES' },
  { id: 'corporate', label: 'CORPORATE' },
  { id: 'risk_capital', label: 'CAPITAL' },
  { id: 'ecosystem', label: 'ECOSYSTEM' },
];

const REGION_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'las_vegas', label: 'LAS VEGAS' },
  { id: 'reno', label: 'RENO' },
  { id: 'henderson', label: 'HENDERSON' },
  { id: 'carson_city', label: 'CARSON CITY' },
  { id: 'statewide', label: 'STATEWIDE' },
];

// Icon by stakeholder_type
const STAKEHOLDER_ICONS = {
  gov_policy: '🏛',
  university: '🎓',
  corporate: '🏢',
  risk_capital: '💰',
  ecosystem: '🌐',
};

// Left-stripe accent color per stakeholder type (CSS custom property injected inline)
const STAKEHOLDER_ACCENT_COLORS = {
  gov_policy: '#9b72cf',
  university: '#f5c76c',
  corporate: '#5b8def',
  risk_capital: '#4ade80',
  ecosystem: '#00d4aa',
};

// Human-readable section label per stakeholder type
const SECTION_LABELS = {
  gov_policy: 'GOV / POLICY',
  university: 'UNIVERSITIES',
  corporate: 'CORPORATE',
  risk_capital: 'CAPITAL',
  ecosystem: 'ECOSYSTEM',
};

// Empty state copy per category × region (region = 'all' → category-only copy)
const CATEGORY_EMPTY_STATES = {
  gov_policy: {
    headline: 'No gov/policy events recorded',
    body: 'Legislative sessions, GOED board meetings, and SBIR award announcements are captured when available. Coverage grows as GOED-backed entities formally report program milestones.',
  },
  university: {
    headline: 'No university activities recorded',
    body: 'Research partnerships, Knowledge Fund grants, and UNR/UNLV commercialization milestones are tracked here. Coverage depends on formal GOED program participation.',
  },
  corporate: {
    headline: 'No corporate events recorded',
    body: 'Funding rounds, expansions, and strategic partnerships from GOED-tracked companies appear here. Data sourced from Crunchbase, SEC EDGAR, and SilverFlume.',
  },
  risk_capital: {
    headline: 'No capital deployment events recorded',
    body: 'Fund closings, SSBCI deployments, LP commitments, and portfolio investments are tracked here. Coverage reflects formal fund disclosures and GOED program reporting.',
  },
  ecosystem: {
    headline: 'No ecosystem events recorded',
    body: 'Accelerator cohorts, incubator milestones, and network-level activities are captured when formally reported. Coverage expands as ecosystem entities enroll in GOED programs.',
  },
  all: {
    headline: 'No activities match current filters',
    body: 'Try clearing the region or category filter. The feed is sourced from GOED program data, SBIR.gov, Crunchbase, and Nevada SilverFlume — coverage reflects formally enrolled entities.',
  },
};

// ── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Format a date string or Date object as "MAR 4" (uppercase short month + day).
 */
function formatFeedDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  return `${month} ${d.getDate()}`;
}

/**
 * Compute week range string "Mar 3 – Mar 8, 2026" from the activities array.
 * Falls back to the current week if activities list is empty.
 */
function computeWeekRange(activities) {
  if (!activities || activities.length === 0) {
    // current week Mon–Sun
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diffToMon = (day + 6) % 7;
    const mon = new Date(now);
    mon.setDate(now.getDate() - diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return formatRangeLabel(mon, sun);
  }

  const dates = activities
    .map((a) => new Date(a.event_date || a.date))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a - b);

  if (dates.length === 0) return '';
  return formatRangeLabel(dates[0], dates[dates.length - 1]);
}

function formatRangeLabel(start, end) {
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const year = end.getFullYear();
  return `${fmt(start)} – ${fmt(end)}, ${year}`;
}

// ── Event type badge classification ──────────────────────────────────────────

// Maps normalized event_type strings to CSS module class suffixes (e.g. 'Grant' → styles.badgeGrant)
const EVENT_TYPE_VARIANT_MAP = {
  legislation: 'Legislation',
  bill: 'Legislation',
  regulation: 'Legislation',
  policy: 'Legislation',
  grant: 'Grant',
  grant_award: 'Grant',
  sbir_award: 'Grant',
  sttr_award: 'Grant',
  knowledge_fund: 'Grant',
  award: 'Grant',
  funding: 'Funding',
  funding_round: 'Funding',
  investment: 'Funding',
  seed: 'Funding',
  series_a: 'Funding',
  series_b: 'Funding',
  series_c: 'Funding',
  partnership: 'Partnership',
  research_partnership: 'Partnership',
  mou: 'Partnership',
  collaboration: 'Partnership',
  acquisition: 'Acquisition',
  merger: 'Acquisition',
  expansion: 'Expansion',
  hiring: 'Expansion',
  launch: 'Expansion',
};

/**
 * Returns the CSS module class key for the badge color variant, e.g. 'badgeFunding'.
 */
function getEventTypeBadgeVariant(eventType) {
  if (!eventType) return 'badgeDefault';
  const normalized = eventType.toLowerCase().replace(/[- ]/g, '_');
  const suffix = EVENT_TYPE_VARIANT_MAP[normalized] || 'Default';
  return `badge${suffix}`;
}

function formatEventTypeLabel(eventType) {
  if (!eventType) return 'EVENT';
  return eventType
    .replace(/_/g, ' ')
    .toUpperCase();
}

// ── Region normalization ──────────────────────────────────────────────────────

function normalizeRegion(region) {
  if (!region) return '';
  return region.toLowerCase().replace(/[- ]/g, '_');
}

function formatRegionDisplay(region) {
  if (!region) return '';
  return region.toUpperCase().replace(/_/g, ' ');
}

function matchesRegion(activity, selectedRegion) {
  if (selectedRegion === 'all') return true;
  const actRegion = normalizeRegion(activity.region || activity.location || '');
  return actRegion.includes(selectedRegion) || selectedRegion.includes(actRegion);
}

// ── Filtering helpers ─────────────────────────────────────────────────────────

function matchesCategory(activity, selectedCategory) {
  if (selectedCategory === 'all') return true;
  const type = (activity.stakeholder_type || '').toLowerCase();
  return type === selectedCategory;
}

function matchesSearch(activity, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    activity.title,
    activity.company_name,
    activity.description,
    activity.event_type,
    activity.region,
    activity.location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return fields.includes(q);
}

// ── Grouping ─────────────────────────────────────────────────────────────────

const CATEGORY_ORDER = ['gov_policy', 'university', 'corporate', 'risk_capital', 'ecosystem'];

function groupByStakeholderType(activities) {
  const map = {};
  for (const cat of CATEGORY_ORDER) {
    map[cat] = [];
  }

  for (const a of activities) {
    const type = (a.stakeholder_type || 'ecosystem').toLowerCase();
    if (map[type]) {
      map[type].push(a);
    } else {
      // put unknown types in ecosystem bucket
      map['ecosystem'].push(a);
    }
  }

  // sort each group by event_date desc
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => {
      const da = new Date(a.event_date || a.date || 0);
      const db = new Date(b.event_date || b.date || 0);
      return db - da;
    });
  }

  return map;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SkeletonFeed = memo(function SkeletonFeed() {
  return (
    <>
      {[1, 2].map((si) => (
        <div key={si} className={styles.skeletonSection}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonBar} style={{ width: 80 }} />
            <div className={styles.skeletonBar} style={{ width: 120 }} />
          </div>
          <div className={styles.skeletonCardList}>
            {[1, 2, 3].map((ci) => (
              <div key={ci} className={styles.skeletonCard}>
                <div
                  className={styles.skeletonLine}
                  style={{ width: `${60 + ci * 10}%` }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{ width: `${40 + ci * 5}%`, opacity: 0.6 }}
                />
                <div
                  className={styles.skeletonLine}
                  style={{ width: '90%', opacity: 0.4 }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
});

const ActivityCard = memo(function ActivityCard({ activity }) {
  const {
    title,
    company_name,
    event_type,
    event_date,
    date,
    region,
    location,
    description,
    amount_m,
    stakeholder_type,
    source_url,
  } = activity;

  const displayDate = formatFeedDate(event_date || date);
  const displayRegion = formatRegionDisplay(region || location || '');
  const stakeholderIcon = STAKEHOLDER_ICONS[stakeholder_type] || '🌐';
  const accentColor = STAKEHOLDER_ACCENT_COLORS[stakeholder_type] || '#1a2236';
  const badgeVariant = getEventTypeBadgeVariant(event_type);
  const badgeLabel = formatEventTypeLabel(event_type);

  return (
    <div
      className={styles.activityCard}
      style={{ '--card-accent': accentColor }}
    >
      {/* Top row: icon, title/company, date */}
      <div className={styles.cardTopRow}>
        <span className={styles.cardStakeholderIcon} aria-hidden="true">
          {stakeholderIcon}
        </span>
        <div className={styles.cardTitleGroup}>
          <p className={styles.cardTitle} title={title}>
            {title || company_name || 'Untitled Event'}
          </p>
          {company_name && title && (
            <p className={styles.cardCompany}>{company_name}</p>
          )}
        </div>
        {displayDate && (
          <time className={styles.cardDate} dateTime={event_date || date}>
            {displayDate}
          </time>
        )}
      </div>

      {/* Badges row */}
      <div className={styles.cardBadgeRow}>
        {displayRegion && (
          <span className={styles.regionBadge}>{displayRegion}</span>
        )}
        {event_type && (
          <span
            className={`${styles.eventTypeBadge} ${styles[badgeVariant] || styles.badgeDefault}`}
          >
            {badgeLabel}
          </span>
        )}
        {amount_m != null && (
          <span className={styles.amountHighlight}>
            ${Number(amount_m).toFixed(1)}M
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className={styles.cardDescription}>{description}</p>
      )}

      {/* Read more */}
      {source_url && (
        <a
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.readMore}
        >
          READ MORE &rarr;
        </a>
      )}
    </div>
  );
});

const CategorySection = memo(function CategorySection({
  categoryKey,
  activities,
  searchQuery,
  selectedRegion,
}) {
  const [collapsed, setCollapsed] = useState(false);

  const icon = STAKEHOLDER_ICONS[categoryKey] || '🌐';
  const label = SECTION_LABELS[categoryKey] || categoryKey.toUpperCase();
  const emptyState = CATEGORY_EMPTY_STATES[categoryKey] || CATEGORY_EMPTY_STATES['all'];
  const hasActivities = activities.length > 0;

  return (
    <div className={styles.categorySection}>
      <button
        className={styles.sectionHeader}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span
          className={`${styles.sectionChevron}${collapsed ? ` ${styles.collapsed}` : ''}`}
        >
          ▶
        </span>
        <span className={styles.sectionIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.sectionLabel}>{label}</span>
        <span className={styles.sectionCount}>
          {activities.length} {activities.length === 1 ? 'event' : 'events'}
        </span>
      </button>

      {!collapsed && (
        hasActivities ? (
          <div className={styles.cardList}>
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className={styles.categoryEmpty}>
            <p className={styles.categoryEmptyHeadline}>
              {emptyState.headline}
            </p>
            <p className={styles.categoryEmptyBody}>{emptyState.body}</p>
          </div>
        )
      )}
    </div>
  );
});

// ── Main component ────────────────────────────────────────────────────────────

export function StakeholderActivityFeed() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();
  const { data: rawActivities = [], isLoading, error } = useStakeholderActivities();

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['stakeholderActivities'] });
  }, [queryClient]);

  // Normalize: the existing API may return items with `date` instead of `event_date`
  // and `activity_type` instead of `event_type`. Map both to the expected shape.
  // Also generate a stable key for each activity if `id` is missing.
  const activities = useMemo(
    () =>
      rawActivities.map((a, idx) => ({
        ...a,
        id: a.id || `activity-${idx}-${(a.title || a.company_name || '').slice(0, 20)}`,
        event_type: a.event_type || a.activity_type,
        event_date: a.event_date || a.date,
        region: a.region || a.location,
        title: a.title || a.company_name,
        stakeholder_type: a.stakeholder_type || 'ecosystem',
      })),
    [rawActivities]
  );

  // Apply region + search filters
  const filtered = useMemo(() => {
    return activities.filter(
      (a) =>
        matchesCategory(a, selectedCategory) &&
        matchesRegion(a, selectedRegion) &&
        matchesSearch(a, searchQuery)
    );
  }, [activities, selectedCategory, selectedRegion, searchQuery]);

  // When category = 'all', group by stakeholder type; otherwise show flat filtered list
  const grouped = useMemo(() => groupByStakeholderType(filtered), [filtered]);

  const weekRange = useMemo(() => computeWeekRange(activities), [activities]);

  const visibleCategoryKeys =
    selectedCategory === 'all'
      ? CATEGORY_ORDER
      : [selectedCategory];

  const totalFiltered = filtered.length;
  const totalAll = activities.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.feed} role="region" aria-label="Stakeholder Activity Feed">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.feedHeader}>
        <div className={styles.feedHeaderLeft}>
          <h2 className={styles.feedTitle}>Stakeholder Activity Feed</h2>
          <p className={styles.feedMeta}>
            {isLoading
              ? 'Loading...'
              : `${visibleCategoryKeys.length} ${visibleCategoryKeys.length === 1 ? 'category' : 'categories'} · ${totalFiltered} ${totalFiltered === 1 ? 'event' : 'events'} · ${weekRange}`}
          </p>
        </div>
        <div className={styles.feedHeaderRight}>
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} aria-hidden="true" />
            LIVE
          </span>
        </div>
      </div>

      {/* ── Category tabs ───────────────────────────────────────────────────── */}
      <nav className={styles.filterBar} aria-label="Stakeholder category filter">
        {STAKEHOLDER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryTab}${selectedCategory === cat.id ? ` ${styles.active}` : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
            aria-pressed={selectedCategory === cat.id}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {/* ── Region tabs ─────────────────────────────────────────────────────── */}
      <div className={styles.regionBar} aria-label="Region filter">
        <span className={styles.regionBarLabel}>REGION</span>
        {REGION_TABS.map((r) => (
          <button
            key={r.id}
            className={`${styles.regionTab}${selectedRegion === r.id ? ` ${styles.active}` : ''}`}
            onClick={() => setSelectedRegion(r.id)}
            aria-pressed={selectedRegion === r.id}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className={styles.searchRow}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by company, event type, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search activities"
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        {!isLoading && (
          <span className={styles.resultCount}>
            {totalFiltered} / {totalAll}
          </span>
        )}
      </div>

      {/* ── Feed body ───────────────────────────────────────────────────────── */}
      <div className={styles.feedBody} role="feed">
        {isLoading && <SkeletonFeed />}

        {!isLoading && error && (
          <div className={styles.errorState} role="alert">
            <p className={styles.errorTitle}>Feed Unavailable</p>
            <p className={styles.errorMessage}>
              {error.message || 'Unable to load stakeholder activities.'}
            </p>
            <button
              className={styles.retryButton}
              onClick={handleRetry}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && totalFiltered === 0 && (
          <div className={styles.feedEmpty}>
            <p className={styles.feedEmptyHeadline}>
              {CATEGORY_EMPTY_STATES['all'].headline}
            </p>
            <p className={styles.feedEmptyBody}>
              {CATEGORY_EMPTY_STATES['all'].body}
            </p>
          </div>
        )}

        {!isLoading && !error && totalFiltered > 0 &&
          visibleCategoryKeys.map((catKey) => (
            <CategorySection
              key={catKey}
              categoryKey={catKey}
              activities={grouped[catKey] || []}
              searchQuery={searchQuery}
              selectedRegion={selectedRegion}
            />
          ))}
      </div>
    </div>
  );
}
