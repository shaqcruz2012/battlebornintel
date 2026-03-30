import { useMemo } from 'react';
import { useTimeline } from '../api/hooks';
import {
  getWeekEnd,
  isDateInWeek,
  getWeekMondays,
  formatWeekLabel,
  formatDate,
  compareDates,
  parseDateLocal,
} from '../utils/weeks';

/**
 * Map of event type keys to human-readable plural labels.
 * Includes both Title Case (new data) and lowercase (legacy) variants.
 */
const typeLabels = {
  Funding: 'Funding',
  Partnership: 'Partnerships',
  Hiring: 'Hiring',
  Launch: 'Launches',
  Award: 'Awards',
  Grant: 'Grants',
  Patent: 'Patents',
  Milestone: 'Milestones',
  Founding: 'Founding',
  Expansion: 'Expansion',
  Acquisition: 'Acquisitions',
  // Keep lowercase for backward compat
  funding: 'Funding',
  partnership: 'Partnerships',
  hiring: 'Hiring',
  launch: 'Launches',
  award: 'Awards',
  grant: 'Grants',
  patent: 'Patents',
  milestone: 'Milestones',
  momentum: 'Momentum',
};

/**
 * Generates AI-style summary (in real impl, would call Claude API)
 * For now, returns structured data that mirrors the weekly_brief agent output
 */
function generateWeekSummary(events) {
  if (events.length === 0) {
    return {
      headline: 'Quiet Week',
      summary: 'Limited activity this week',
      highlights: [],
    };
  }

  const types = {};
  events.forEach((e) => {
    types[e.type] = (types[e.type] || 0) + 1;
  });

  const sortedTypes = Object.entries(types).sort((a, b) => b[1] - a[1]);
  const topType = sortedTypes[0]?.[0];
  const topLabel = typeLabels[topType] || topType || 'Activity';

  const headline =
    events.length >= 10
      ? `${topLabel} Surge: ${events.length} Events`
      : `${events.length} Events Led by ${topLabel}`;

  const summary = `${events.length} significant events tracked. Top categories: ${sortedTypes
    .slice(0, 3)
    .map(([type, count]) => `${typeLabels[type] || type} (${count})`)
    .join(', ')}.`;

  // Top companies and activities
  const companies = {};
  events.forEach((e) => {
    if (e.company) {
      companies[e.company] = (companies[e.company] || 0) + 1;
    }
  });

  const topCompanies = Object.entries(companies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const highlights = [
    `${events.length} tracked events across ${sortedTypes.length} categories`,
    ...topCompanies.map((c) => `${c} (${companies[c]} events)`),
  ];

  return {
    headline,
    summary,
    highlights,
  };
}

/**
 * Aggregates week data: events, metrics, activities
 */
function aggregateWeekData(weekStart, allEvents) {
  const weekEnd = getWeekEnd(weekStart);
  const weekEvents = allEvents.filter((e) => isDateInWeek(parseDateLocal(e.date), weekStart));

  // Sort by date (newest first for display)
  weekEvents.sort((a, b) => compareDates(b.date, a.date));

  const eventsByType = {};
  weekEvents.forEach((e) => {
    if (!eventsByType[e.type]) eventsByType[e.type] = [];
    eventsByType[e.type].push(e);
  });

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    label: formatWeekLabel(weekStart),
    eventCount: weekEvents.length,
    events: weekEvents.slice(0, 10), // Top 10 for display
    eventsByType,
    summary: generateWeekSummary(weekEvents),
    // MIT REAP framework data (handle both Title Case and lowercase keys)
    reap: {
      inputs: {
        headline: 'Capital Deployment',
        count:
          (eventsByType.Funding?.length || eventsByType.funding?.length || 0) +
          (eventsByType.Grant?.length || eventsByType.grant?.length || 0),
      },
      capacities: {
        headline: 'Team & Infrastructure',
        count:
          (eventsByType.Hiring?.length || eventsByType.hiring?.length || 0) +
          (eventsByType.Partnership?.length || eventsByType.partnership?.length || 0),
      },
      outputs: {
        headline: 'Products & Growth',
        count:
          (eventsByType.Launch?.length || eventsByType.launch?.length || 0) +
          (eventsByType.Patent?.length || eventsByType.patent?.length || 0) +
          (eventsByType.Milestone?.length || eventsByType.milestone?.length || 0),
      },
      impact: {
        headline: 'Recognition & Outcomes',
        count:
          (eventsByType.Award?.length || eventsByType.award?.length || 0) +
          (eventsByType.Expansion?.length || 0) +
          (eventsByType.Acquisition?.length || 0),
      },
    },
  };
}

/**
 * Hook: Load and aggregate weekly brief data from the timeline API
 * Dynamically spans from oldest event to today so no data is missed.
 * @param {number} weeksBack - Number of weeks to look back
 * @param {Object} opts - Additional options
 * @param {string} [opts.region] - Region filter (las_vegas, reno, henderson, etc.)
 */
export function useWeeklyBriefs(weeksBack = 52, { region } = {}) {
  const { data: allEvents, isLoading, error } = useTimeline({ limit: 200, region });

  const weeks = useMemo(() => {
    if (!allEvents || allEvents.length === 0) return [];

    // Find the oldest event date and compute how many weeks back we actually need
    const dates = allEvents.map((e) => parseDateLocal(e.date).getTime());
    const oldest = new Date(Math.min(...dates));
    const today = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const actualWeeksBack = Math.max(weeksBack, Math.ceil((today - oldest) / msPerWeek) + 2);

    const mondays = getWeekMondays(today, actualWeeksBack);

    return mondays
      .map((monday) => aggregateWeekData(monday, allEvents))
      .filter((w) => w.eventCount > 0);
  }, [allEvents, weeksBack]);

  return {
    weeks,
    isLoading,
    error: error || null,
  };
}

/**
 * Hook: Load single week data
 */
export function useWeeklyBrief(weekStart) {
  const { data: allEvents, isLoading, error } = useTimeline({ limit: 200 });

  const week = useMemo(() => {
    if (!weekStart || !allEvents) return null;
    return aggregateWeekData(parseDateLocal(weekStart), allEvents);
  }, [weekStart, allEvents]);

  return {
    week,
    isLoading,
    error: error || null,
  };
}
