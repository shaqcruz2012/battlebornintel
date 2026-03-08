import { Card } from '../shared/Card';
import { Tooltip } from '../shared/Tooltip';
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

function EventTypeIcon({ type }) {
  return (
    <span
      className={styles.eventIcon}
      style={{ background: EVENT_COLORS[type] || '#6b7280' }}
      title={type}
    >
      {EVENT_ICONS[type] || '•'}
    </span>
  );
}

function EventRow({ event }) {
  return (
    <div className={styles.eventRow}>
      <EventTypeIcon type={event.type} />
      <div className={styles.eventContent}>
        <Tooltip content={event.detail}>
          <div className={styles.eventCompany}>{event.company}</div>
          <div className={styles.eventDetail}>{event.detail}</div>
        </Tooltip>
      </div>
    </div>
  );
}

function ReapMetrics({ reap }) {
  if (!reap) return null;

  return (
    <div className={styles.reapGrid}>
      {Object.entries(reap).map(([key, data]) => (
        <div key={key} className={styles.reapCard}>
          <div className={styles.reapHeadline}>{data.headline}</div>
          <div className={styles.reapCount}>{data.count}</div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyBriefCard({ week, isCurrentWeek = false }) {
  if (!week) return null;

  return (
    <Card
      elevated={isCurrentWeek}
      className={`${styles.card} ${isCurrentWeek ? styles.current : ''}`}
    >
      {/* Header with week label and date range */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h3 className={styles.title}>{week.label}</h3>
          {isCurrentWeek && <span className={styles.badge}>This Week</span>}
        </div>
        <div className={styles.dateRange}>
          {week.weekStart} → {week.weekEnd}
        </div>
      </div>

      {/* Summary headline */}
      <div className={styles.summary}>
        <h4 className={styles.headline}>{week.summary.headline}</h4>
        <p className={styles.summaryText}>{week.summary.summary}</p>
      </div>

      {/* MIT REAP Metrics */}
      <ReapMetrics reap={week.reap} />

      {/* Events List */}
      <div className={styles.eventsSection}>
        <div className={styles.eventsHeader}>
          <span className={styles.eventsTitle}>
            Key Activities ({week.eventCount} total)
          </span>
          {Object.entries(week.eventsByType).length > 0 && (
            <div className={styles.eventTypeBreakdown}>
              {Object.entries(week.eventsByType).map(([type, events]) => (
                <Tooltip key={type} content={`${type}: ${events.length}`}>
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

        <div className={styles.eventsList}>
          {week.events.length > 0 ? (
            week.events.map((event, idx) => (
              <EventRow key={`${event.date}-${idx}`} event={event} />
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
