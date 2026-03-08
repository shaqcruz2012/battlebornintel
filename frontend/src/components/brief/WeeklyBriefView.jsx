import { useState, useEffect, useRef, useCallback } from 'react';
import { MainGrid } from '../layout/AppShell';
import { useWeeklyBriefs } from '../../hooks/useWeeklyBriefs';
import { getTodayWeekStart, formatDate } from '../../utils/weeks';
import { WeeklyBriefCard } from './WeeklyBriefCard';
import styles from './WeeklyBriefView.module.css';

const EVENT_TYPES = [
  { id: 'all', label: 'All Activities' },
  { id: 'funding', label: 'Funding' },
  { id: 'partnership', label: 'Partnerships' },
  { id: 'hiring', label: 'Hiring' },
  { id: 'launch', label: 'Launches' },
  { id: 'award', label: 'Awards' },
  { id: 'grant', label: 'Grants' },
  { id: 'patent', label: 'Patents' },
  { id: 'momentum', label: 'Momentum' },
];

function filterWeeksByType(weeks, filterType) {
  if (filterType === 'all') return weeks;

  return weeks.map((week) => ({
    ...week,
    events: week.events.filter((e) => e.type === filterType),
    eventsByType: {
      [filterType]: week.eventsByType[filterType] || [],
    },
    eventCount: week.eventsByType[filterType]?.length || 0,
  })).filter((week) => week.eventCount > 0);
}

export function WeeklyBriefView() {
  const { weeks, isLoading } = useWeeklyBriefs(52);
  const [filteredWeeks, setFilteredWeeks] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef(null);

  // Update filtered weeks when weeks or filter changes
  useEffect(() => {
    const filtered = filterWeeksByType(weeks, filterType);
    setFilteredWeeks(filtered);
  }, [weeks, filterType]);

  // Handle scroll to show/hide scroll-to-top button
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setShowScrollTop(scrollTop > 300);
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Get current week for highlighting
  const todayWeekStart = getTodayWeekStart();
  const currentWeekDate = formatDate(todayWeekStart);

  const currentWeekIndex = filteredWeeks.findIndex(
    (w) => w.weekStart === currentWeekDate
  );
  const isCurrentWeekVisible = currentWeekIndex >= 0;

  return (
    <MainGrid>
      <div
        className={styles.container}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Weekly Intelligence Brief</h1>
            <p className={styles.subtitle}>
              Executive summary of Nevada ecosystem activity, funding events, and strategic
              momentum over the past year. Weeks shown in reverse chronological order (newest first).
            </p>
          </div>

          <div className={styles.controls}>
            {!isCurrentWeekVisible && (
              <button className={styles.button} onClick={() => {
                setFilterType('all');
                setTimeout(() => {
                  scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }, 0);
              }}>
                Jump to Current
              </button>
            )}
            <button
              className={styles.button}
              onClick={() => window.print()}
              title="Print or save as PDF"
            >
              Print
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>Activity Type:</span>
          <div className={styles.filterChips}>
            {EVENT_TYPES.map((type) => (
              <button
                key={type.id}
                className={`${styles.chip} ${filterType === type.id ? styles.active : ''}`}
                onClick={() => setFilterType(type.id)}
                title={`Filter by ${type.label}`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.loadingSpinner} />
              <p style={{ marginTop: 'var(--space-md)' }}>Loading weekly briefs...</p>
            </div>
          </div>
        ) : filteredWeeks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <h3 className={styles.emptyTitle}>No data available</h3>
              <p className={styles.emptyText}>
                {filterType === 'all'
                  ? 'No weekly data found. Activities will appear as they are tracked.'
                  : `No ${EVENT_TYPES.find(t => t.id === filterType)?.label.toLowerCase()} events found in the timeline.`}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.timeline}>
            {/* Timeline axis */}
            <div className={styles.timelineAxis} />

            {/* Weeks */}
            <div className={styles.weeks}>
              {filteredWeeks.map((week) => {
                const isCurrentWeek = week.weekStart === currentWeekDate;
                return (
                  <div key={week.weekStart}>
                    {/* Week marker */}
                    <div className={styles.weekMarker}>
                      <div className={styles.weekDot} title={week.label} />
                      <div className={styles.weekNumber}>
                        W{week.weekStart.slice(5, 7)}
                      </div>
                    </div>

                    {/* Week card */}
                    <WeeklyBriefCard week={week} isCurrentWeek={isCurrentWeek} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scroll to top button */}
        <button
          className={`${styles.scrollToTop} ${showScrollTop ? styles.visible : ''}`}
          onClick={scrollToTop}
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </div>
    </MainGrid>
  );
}
