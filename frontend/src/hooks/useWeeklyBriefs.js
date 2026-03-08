import { useMemo } from 'react';
import { TIMELINE_EVENTS } from '../data/timeline';
import {
  getWeekEnd,
  isDateInWeek,
  getWeekMondays,
  formatWeekLabel,
  formatDate,
  compareDates,
} from '../utils/weeks';

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

  const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0];
  const typeLabels = {
    funding: 'Funding',
    partnership: 'Partnerships',
    hiring: 'Hiring',
    launch: 'Launches',
    award: 'Awards',
    grant: 'Grants',
    patent: 'Patents',
    momentum: 'Momentum',
  };

  const headline = `${typeLabels[topType] || 'Activity'} Surge: ${events.length} Events`;
  const summary = `${events.length} significant events tracked. Top categories: ${Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${typeLabels[type]} (${count})`)
    .join(', ')}.`;

  // Top companies and activities
  const companies = {};
  events.forEach((e) => {
    companies[e.company] = (companies[e.company] || 0) + 1;
  });

  const topCompanies = Object.entries(companies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const highlights = [
    `${events.length} tracked events`,
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
  const weekEvents = allEvents.filter((e) => isDateInWeek(new Date(e.date), weekStart));

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
    // MIT REAP framework data (would be enriched from API)
    reap: {
      inputs: {
        headline: 'Capital Deployment',
        count: eventsByType.funding?.length || 0,
      },
      capacities: {
        headline: 'Team & Infrastructure',
        count: (eventsByType.hiring?.length || 0) + (eventsByType.partnership?.length || 0),
      },
      outputs: {
        headline: 'Products & Growth',
        count: (eventsByType.launch?.length || 0) + (eventsByType.momentum?.length || 0),
      },
      impact: {
        headline: 'Recognition & Outcomes',
        count: (eventsByType.award?.length || 0) + (eventsByType.grant?.length || 0),
      },
    },
  };
}

/**
 * Hook: Load and aggregate weekly brief data
 * Returns array of week objects with events, summaries, metrics
 */
export function useWeeklyBriefs(weeksBack = 52) {
  const allEvents = TIMELINE_EVENTS;

  const weeks = useMemo(() => {
    const today = new Date();
    const mondays = getWeekMondays(today, weeksBack);

    return mondays.map((monday) => aggregateWeekData(monday, allEvents)).filter((w) => w.eventCount > 0);
  }, [weeksBack]);

  return {
    weeks,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook: Load single week data
 */
export function useWeeklyBrief(weekStart) {
  const allEvents = TIMELINE_EVENTS;

  const week = useMemo(() => {
    if (!weekStart) return null;
    return aggregateWeekData(new Date(weekStart), allEvents);
  }, [weekStart]);

  return {
    week,
    isLoading: false,
    error: null,
  };
}
