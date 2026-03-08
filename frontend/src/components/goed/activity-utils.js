// Activity type definitions
export const ACTIVITY_TYPES = {
  FUNDING_ROUND: 'funding',
  PARTNERSHIP: 'partnership',
  AWARD: 'award',
  ACQUISITION: 'acquisition',
  EXPANSION: 'expansion',
  HIRING: 'hiring',
  MILESTONE: 'milestone',
  GRANT: 'grant',
  LAUNCH: 'launch',
  PATENT: 'patent',
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.FUNDING_ROUND]: 'Funding Round',
  [ACTIVITY_TYPES.PARTNERSHIP]: 'Partnership',
  [ACTIVITY_TYPES.AWARD]: 'Award',
  [ACTIVITY_TYPES.ACQUISITION]: 'Acquisition',
  [ACTIVITY_TYPES.EXPANSION]: 'Expansion',
  [ACTIVITY_TYPES.HIRING]: 'Hiring',
  [ACTIVITY_TYPES.MILESTONE]: 'Milestone',
  [ACTIVITY_TYPES.GRANT]: 'Grant',
  [ACTIVITY_TYPES.LAUNCH]: 'Launch',
  [ACTIVITY_TYPES.PATENT]: 'Patent',
};

// Activity type to color mapping
export const ACTIVITY_TYPE_COLORS = {
  [ACTIVITY_TYPES.FUNDING_ROUND]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.PARTNERSHIP]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.AWARD]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.ACQUISITION]: '#F5C76C', // gold - significant
  [ACTIVITY_TYPES.EXPANSION]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.HIRING]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.MILESTONE]: '#F5C76C', // gold - significant
  [ACTIVITY_TYPES.GRANT]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.LAUNCH]: '#45D7C6', // teal - positive
  [ACTIVITY_TYPES.PATENT]: '#F5C76C', // gold - significant
};

// Activity type to icon mapping
export const ACTIVITY_TYPE_ICONS = {
  [ACTIVITY_TYPES.FUNDING_ROUND]: 'dollar',
  [ACTIVITY_TYPES.PARTNERSHIP]: 'handshake',
  [ACTIVITY_TYPES.AWARD]: 'trophy',
  [ACTIVITY_TYPES.ACQUISITION]: 'trending',
  [ACTIVITY_TYPES.EXPANSION]: 'users',
  [ACTIVITY_TYPES.HIRING]: 'users',
  [ACTIVITY_TYPES.MILESTONE]: 'trending',
  [ACTIVITY_TYPES.GRANT]: 'government',
  [ACTIVITY_TYPES.LAUNCH]: 'rocket',
  [ACTIVITY_TYPES.PATENT]: 'patent',
};

// Nevada regions
export const NEVADA_REGIONS = {
  ALL: 'all',
  LAS_VEGAS: 'las_vegas',
  RENO: 'reno',
  HENDERSON: 'henderson',
  CARSON_CITY: 'carson_city',
  NORTH: 'north',
  SOUTH: 'south',
};

export const NEVADA_REGION_LABELS = {
  [NEVADA_REGIONS.ALL]: 'All Nevada',
  [NEVADA_REGIONS.LAS_VEGAS]: 'Las Vegas',
  [NEVADA_REGIONS.RENO]: 'Reno',
  [NEVADA_REGIONS.HENDERSON]: 'Henderson',
  [NEVADA_REGIONS.CARSON_CITY]: 'Carson City',
  [NEVADA_REGIONS.NORTH]: 'Northern Nevada',
  [NEVADA_REGIONS.SOUTH]: 'Southern Nevada',
};

/**
 * Format date as relative time string (e.g., "2 days ago")
 */
export function formatRelativeDate(date) {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now - activityDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Format date as short date string (e.g., "Feb 15")
 */
export function formatShortDate(date) {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

/**
 * Format date as full date string (e.g., "February 15, 2025")
 */
export function formatFullDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Group activities by date
 */
export function groupActivitiesByDate(activities) {
  const grouped = {};

  activities.forEach((activity) => {
    const date = new Date(activity.date).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(activity);
  });

  // Sort dates in reverse chronological order
  return Object.entries(grouped)
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
    .map(([date, items]) => ({
      date,
      items,
    }));
}

/**
 * Group activities by month and year
 */
export function groupActivitiesByMonth(activities) {
  const grouped = {};

  activities.forEach((activity) => {
    const d = new Date(activity.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(activity);
  });

  // Sort months in reverse chronological order
  return Object.entries(grouped)
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
    .map(([monthKey, items]) => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      return {
        monthKey,
        monthName,
        items,
      };
    });
}

/**
 * Filter activities by location
 */
export function filterActivitiesByLocation(activities, location) {
  if (location === NEVADA_REGIONS.ALL || !location) {
    return activities;
  }

  return activities.filter((activity) => {
    if (!activity.location) return false;
    return activity.location.toLowerCase().includes(location.toLowerCase());
  });
}

/**
 * Filter activities by date range
 */
export function filterActivitiesByDateRange(activities, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return activities.filter((activity) => {
    const d = new Date(activity.date);
    return d >= start && d <= end;
  });
}

/**
 * Get activity type color
 */
export function getActivityTypeColor(type) {
  return ACTIVITY_TYPE_COLORS[type] || '#9BA1B3';
}

/**
 * Get activity type icon
 */
export function getActivityTypeIcon(type) {
  return ACTIVITY_TYPE_ICONS[type] || 'circle';
}

/**
 * Get activity type label
 */
export function getActivityTypeLabel(type) {
  return ACTIVITY_TYPE_LABELS[type] || type;
}
