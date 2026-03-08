/**
 * Week utility functions for the Weekly Brief timeline.
 * ISO 8601: Week starts Monday, ends Sunday.
 */

/**
 * Get the Monday of the week containing the given date
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  // ISO: Monday=1, Sunday=0. Adjust so Monday=0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get the Sunday of the week containing the given date
 */
export function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format week label: "Week of March 3-9, 2025"
 */
export function formatWeekLabel(date) {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const monthStart = start.toLocaleString('en-US', { month: 'long' });
  const monthEnd = end.toLocaleString('en-US', { month: 'long' });
  const dayStart = start.getDate();
  const dayEnd = end.getDate();
  const year = start.getFullYear();

  // If same month: "March 3-9, 2025"
  if (monthStart === monthEnd) {
    return `Week of ${monthStart} ${dayStart}-${dayEnd}, ${year}`;
  }
  // Cross-month: "Feb 28 - Mar 6, 2025"
  return `${monthStart} ${dayStart} - ${monthEnd} ${dayEnd}, ${year}`;
}

/**
 * Get week number (ISO 8601): 1-53
 */
export function getISOWeekNumber(date) {
  const d = new Date(date);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
  return weekNumber;
}

/**
 * Get year and ISO week: "2025-W12"
 */
export function getISOWeekString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = getISOWeekNumber(d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Generate array of Mondays for the past N weeks from a given date
 */
export function getWeekMondays(fromDate, weeksBack = 52) {
  const weeks = [];
  const current = new Date(fromDate);

  for (let i = 0; i < weeksBack; i++) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() - 7);
  }

  return weeks;
}

/**
 * Check if a date falls within a given week (Monday-Sunday)
 */
export function isDateInWeek(date, weekStartDate) {
  const d = new Date(date);
  const start = getWeekStart(weekStartDate);
  const end = getWeekEnd(weekStartDate);

  d.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return d >= start && d <= end;
}

/**
 * Get current week's Monday
 */
export function getTodayWeekStart() {
  return getWeekStart(new Date());
}

/**
 * Compare dates (for sorting)
 */
export function compareDates(a, b) {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateB - dateA; // Newer first
}
