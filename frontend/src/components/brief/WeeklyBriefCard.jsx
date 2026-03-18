import { Card } from '../shared/Card';
import { Tooltip } from '../shared/Tooltip';
import { EventCard } from '../shared/EventCard';
import styles from './WeeklyBriefCard.module.css';

const EVENT_COLORS = {
  funding: '#10b981',
  partnership: '#3b82f6',
  hiring: '#8b5cf6',
  launch: '#f59e0b',
  award: '#ec4899',
  grant: '#06b6d4',
  patent: '#eab308',
  momentum: '#ef4444',
};

const EVENT_ICONS = {
  funding: '💰',
  partnership: '🤝',
  hiring: '👥',
  launch: '🚀',
  award: '🏆',
  grant: '🏛',
  patent: '📜',
  momentum: '📈',
};

// Taxonomy labels with hover explanations (feature 4)
const EVENT_TAXONOMY = {
  funding: { label: 'Funding', description: 'Equity investment or debt financing' },
  award: { label: 'Award', description: 'Government grant or prize' },
  partnership: { label: 'Partnership', description: 'Commercial or research collaboration' },
  launch: { label: 'Milestone', description: 'Operational achievement or product launch' },
  momentum: { label: 'Announcement', description: 'Strategic direction or leadership news' },
  hiring: { label: 'Hiring', description: 'Talent acquisition or team expansion' },
  grant: { label: 'Grant', description: 'Non-dilutive public or institutional funding' },
  patent: { label: 'Patent', description: 'Intellectual property filing or award' },
};

// REAP narrative interpretations (feature 6)
const REAP_NARRATIVES = {
  inputs: (count) =>
    count === 0
      ? 'No capital deployment activity this week.'
      : count === 1
      ? 'A single funding event signals selective investor interest.'
      : `${count} funding events indicate sustained capital inflow into the ecosystem.`,
  capacities: (count) =>
    count === 0
      ? 'No team or infrastructure expansion recorded.'
      : count === 1
      ? 'One hiring or partnership signals targeted capability growth.'
      : `${count} capacity-building events reflect active scaling across the portfolio.`,
  outputs: (count) =>
    count === 0
      ? 'No product launches or growth signals this week.'
      : count === 1
      ? 'A single launch or momentum event marks measurable output activity.'
      : `${count} output events demonstrate accelerating go-to-market velocity.`,
  impact: (count) =>
    count === 0
      ? 'No awards or grants recognized this week.'
      : count === 1
      ? 'One recognition event validates ecosystem credibility.'
      : `${count} awards and grants confirm strong external validation of the portfolio.`,
};

/**
 * Derive a 1-sentence narrative from the week's events (feature 3)
 */
function deriveEventNarrative(events, eventsByType) {
  if (!events || events.length === 0) return null;

  const typeCount = Object.keys(eventsByType).length;
  const topTypes = Object.entries(eventsByType)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 2)
    .map(([type]) => EVENT_TAXONOMY[type]?.label || type);

  const companyNames = [...new Set(events.map((e) => e.company))].slice(0, 3);
  const total = events.length;

  if (typeCount === 1) {
    const typeName = topTypes[0];
    return `This week's activity was concentrated in ${typeName.toLowerCase()} activity, with ${companyNames.join(', ')} among the key actors driving ${total} recorded event${total !== 1 ? 's' : ''}.`;
  }

  return `A diverse week spanning ${topTypes.join(' and ').toLowerCase()} activity, with ${total} events reflecting broad momentum across the Nevada ecosystem.`;
}

/**
 * Estimate reading time for a brief card (feature 5)
 * ~200 words per minute, estimate based on event count and highlights
 */
function estimateReadingTime(week) {
  // Approximate word counts
  const summaryWords = 30; // headline + summary text
  const perEventWords = 15; // company + detail per row
  const perHighlightWords = 10;
  const reapWords = 40; // 4 metrics with narratives

  const totalWords =
    summaryWords +
    (week.events?.length || 0) * perEventWords +
    (week.summary?.highlights?.length || 0) * perHighlightWords +
    reapWords;

  const minutes = Math.max(1, Math.round(totalWords / 200));
  return `${minutes} min read`;
}

function EventTypeIcon({ type }) {
  const taxonomy = EVENT_TAXONOMY[type];
  const tooltipText = taxonomy
    ? `${taxonomy.label} — ${taxonomy.description}`
    : type;

  return (
    <Tooltip content={tooltipText}>
      <span
        className={styles.eventIcon}
        style={{ background: EVENT_COLORS[type] || '#6b7280' }}
      >
        {EVENT_ICONS[type] || '•'}
      </span>
    </Tooltip>
  );
}

function TaxonomyBadge({ type }) {
  const taxonomy = EVENT_TAXONOMY[type];
  if (!taxonomy) return null;

  return (
    <Tooltip content={taxonomy.description}>
      <span
        className={styles.taxonomyBadge}
        style={{ borderColor: EVENT_COLORS[type] || '#6b7280', color: EVENT_COLORS[type] || '#6b7280' }}
      >
        {taxonomy.label}
      </span>
    </Tooltip>
  );
}

function BriefEventCard({ event }) {
  // Map timeline event shape to unified EventCard props
  const normalized = {
    id: event.id || `${event.date}-${event.company}`,
    date: event.date,
    activity_type: event.type,
    company_name: event.company,
    description: event.detail,
    source_url: event.source_url,
    verified: event.verified,
    confidence: event.confidence,
    city: event.city,
    region: event.region,
  };

  return <EventCard event={normalized} isExpanded={false} onToggle={() => {}} compact />;
}

function ReapMetrics({ reap }) {
  if (!reap) return null;

  return (
    <div className={styles.reapGrid}>
      {Object.entries(reap).map(([key, data]) => {
        const narrative = REAP_NARRATIVES[key]?.(data.count);
        return (
          <div key={key} className={styles.reapCard}>
            <div className={styles.reapHeadline}>{data.headline}</div>
            <div className={styles.reapCount}>{data.count}</div>
            {narrative && (
              <div className={styles.reapNarrative}>{narrative}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function WeeklyBriefCard({ week, isCurrentWeek = false }) {
  if (!week) return null;

  const eventNarrative = deriveEventNarrative(week.events, week.eventsByType);
  const readingTime = estimateReadingTime(week);

  return (
    <Card
      elevated={isCurrentWeek}
      className={`${styles.card} ${isCurrentWeek ? styles.current : ''}`}
    >
      {/* Header with week label, date range, and reading time */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{week.label}</h3>
          {isCurrentWeek && <span className={styles.badge}>This Week</span>}
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.readingTime}>{readingTime}</span>
          <div className={styles.dateRange}>
            {week.weekStart} → {week.weekEnd}
          </div>
        </div>
      </div>

      {/* Summary headline */}
      <div className={styles.summary}>
        <h4 className={styles.headline}>{week.summary.headline}</h4>
        <p className={styles.summaryText}>{week.summary.summary}</p>
      </div>

      {/* MIT REAP Metrics with narrative interpretations */}
      <ReapMetrics reap={week.reap} />

      {/* Events Section */}
      <div className={styles.eventsSection}>
        <div className={styles.eventsHeader}>
          <span className={styles.eventsTitle}>
            Key Activities ({week.eventCount} total)
          </span>
          {Object.entries(week.eventsByType).length > 0 && (
            <div className={styles.eventTypeBreakdown}>
              {Object.entries(week.eventsByType).map(([type, events]) => (
                <Tooltip key={type} content={`${EVENT_TAXONOMY[type]?.label || type}: ${events.length}`}>
                  <span
                    className={styles.typeTag}
                    style={{ background: EVENT_COLORS[type] || '#6b7280' }}
                  >
                    {events.length}
                  </span>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Event narrative summary (feature 3) */}
        {eventNarrative && (
          <p className={styles.eventNarrative}>{eventNarrative}</p>
        )}

        <div className={styles.eventsList}>
          {week.events.length > 0 ? (
            week.events.map((event, idx) => (
              <BriefEventCard key={`${event.date}-${idx}`} event={event} />
            ))
          ) : (
            <div className={styles.noEvents}>No activities recorded</div>
          )}
        </div>

        {week.eventCount > week.events.length && (
          <div className={styles.moreEvents}>
            +{week.eventCount - week.events.length} more events
          </div>
        )}
      </div>

      {/* Highlights list */}
      <div className={styles.highlights}>
        <ul className={styles.highlightsList}>
          {week.summary.highlights.map((highlight, idx) => (
            <li key={idx} className={styles.highlightItem}>
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
