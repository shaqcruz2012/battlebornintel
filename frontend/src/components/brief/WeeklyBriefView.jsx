import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MainGrid } from '../layout/AppShell';
import { useWeeklyBriefs } from '../../hooks/useWeeklyBriefs';
import { getTodayWeekStart, formatDate, getISOWeekNumber } from '../../utils/weeks';
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

/**
 * Derive a weekly editorial theme sentence from the top-activity week
 */
function deriveEditorialTheme(weeks) {
  if (!weeks || weeks.length === 0) return "Nevada's innovation ecosystem continues to evolve";

  const mostActiveWeek = weeks[0]; // Newest first
  const types = Object.entries(mostActiveWeek.eventsByType || {});
  if (types.length === 0) return "Nevada's innovation ecosystem continues to evolve";

  const topType = types.sort((a, b) => b[1].length - a[1].length)[0]?.[0];
  const typeThemes = {
    funding: "Nevada's venture capital activity surges as investors bet on the Silver State",
    partnership: "Strategic alliances shape Nevada's emerging innovation clusters",
    hiring: "Nevada's talent ecosystem expands as companies scale headcount",
    launch: "New products and milestones signal accelerating startup velocity",
    award: "Recognition and prizes validate Nevada's entrepreneurial ambition",
    grant: "Federal and state grant activity underscores Nevada's policy-driven growth",
    patent: "Intellectual property filings mark deepening R&D investment in Nevada",
    momentum: "Operational announcements reflect Nevada's maturing ecosystem",
  };

  return typeThemes[topType] || "Nevada's innovation ecosystem continues to evolve";
}

/**
 * Derive 2–3 sentence editorial summary of the week's themes
 */
function deriveEditorNote(weeks) {
  if (!weeks || weeks.length === 0) return null;

  const recentWeeks = weeks.slice(0, 4);
  const totalEvents = recentWeeks.reduce((sum, w) => sum + w.eventCount, 0);
  const allTypes = {};
  recentWeeks.forEach((w) => {
    Object.entries(w.eventsByType || {}).forEach(([type, evts]) => {
      allTypes[type] = (allTypes[type] || 0) + evts.length;
    });
  });

  const topTypes = Object.entries(allTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const typeLabels = {
    funding: 'funding rounds',
    partnership: 'strategic partnerships',
    hiring: 'talent acquisitions',
    launch: 'product launches',
    award: 'awards and recognition',
    grant: 'public grants',
    patent: 'patent filings',
    momentum: 'operational milestones',
  };

  const topLabels = topTypes.map((t) => typeLabels[t] || t);

  const sentences = [
    `Over the past month, ${totalEvents} events were tracked across Nevada's innovation ecosystem, with ${topLabels[0] || 'activity'} representing the most prominent theme.`,
    topLabels[1]
      ? `${topLabels[1].charAt(0).toUpperCase() + topLabels[1].slice(1)} and ${topLabels[2] || 'other signals'} round out a period of broad-based ecosystem activity.`
      : 'Momentum remains concentrated in a few high-activity sectors.',
    'Analysts should pay close attention to the interplay between capital deployment and capacity-building as indicators of long-term ecosystem health.',
  ];

  return sentences.join(' ');
}

/**
 * Compute volume number (years since 2020) and issue number (ISO week of most recent week)
 */
function computePublicationMeta(weeks) {
  const now = new Date();
  const volume = now.getFullYear() - 2020 + 1;
  const todayWeekStart = getTodayWeekStart();
  const issue = getISOWeekNumber(todayWeekStart);
  const mostRecentWeek = weeks?.[0];

  return {
    volume,
    issue,
    dateRange: mostRecentWeek
      ? `${mostRecentWeek.weekStart} — ${mostRecentWeek.weekEnd}`
      : formatDate(now),
  };
}

/** Masthead component (feature 1) */
function Masthead({ weeks, editorialTheme }) {
  const meta = useMemo(() => computePublicationMeta(weeks), [weeks]);

  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadRule} />
      <div className={styles.mastheadCenter}>
        <div className={styles.mastheadEyebrow}>
          Vol.&nbsp;{meta.volume}&nbsp;&nbsp;|&nbsp;&nbsp;Issue&nbsp;{meta.issue}&nbsp;&nbsp;|&nbsp;&nbsp;{meta.dateRange}
        </div>
        <h1 className={styles.mastheadTitle}>Weekly Intelligence Brief</h1>
        <div className={styles.mastheadTheme}>{editorialTheme}</div>
      </div>
      <div className={styles.mastheadRule} />
    </div>
  );
}

/** Editor's Note component (feature 2) */
function EditorsNote({ note }) {
  const [open, setOpen] = useState(true);

  if (!note) return null;

  return (
    <div className={styles.editorsNote}>
      <button
        className={styles.editorsNoteToggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.editorsNoteLabel}>Editor's Note</span>
        <span className={styles.editorsNoteChevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <p className={styles.editorsNoteText}>{note}</p>
      )}
    </div>
  );
}

export function WeeklyBriefView() {
  const { weeks, isLoading, error } = useWeeklyBriefs(52);
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

  // Derive editorial theme and editor's note from real data
  const editorialTheme = useMemo(() => deriveEditorialTheme(weeks), [weeks]);
  const editorNote = useMemo(() => deriveEditorNote(weeks), [weeks]);

  // Get current week for highlighting
  const todayWeekStart = getTodayWeekStart();
  const currentWeekDate = formatDate(todayWeekStart);

  const currentWeekIndex = filteredWeeks.findIndex(
    (w) => w.weekStart === currentWeekDate
  );
  const isCurrentWeekVisible = currentWeekIndex >= 0;

  if (error) {
    return (
      <MainGrid>
        <div className={styles.emptyState}>
          <div className={styles.emptyContent}>
            Failed to load weekly briefs. Please try again.
          </div>
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div
        className={styles.container}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Masthead (feature 1) */}
        {!isLoading && <Masthead weeks={weeks} editorialTheme={editorialTheme} />}

        {/* Controls row */}
        <div className={styles.controlsRow}>
          <p className={styles.subtitle}>
            Executive summary of Nevada ecosystem activity, funding events, and strategic
            momentum over the past year. Weeks shown in reverse chronological order (newest first).
          </p>
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

        {/* Editor's Note (feature 2) */}
        {!isLoading && filterType === 'all' && (
          <EditorsNote note={editorNote} />
        )}

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
