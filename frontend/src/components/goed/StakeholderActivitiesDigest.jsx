import { useState, useMemo } from 'react';
import { useStakeholderActivities } from '../../api/hooks';
import {
  groupActivitiesByMonth,
  filterActivitiesByLocation,
  formatShortDate,
  formatFullDate,
  getActivityTypeLabel,
  NEVADA_REGIONS,
  NEVADA_REGION_LABELS,
} from './activity-utils';
import { ActivityCard } from './ActivityCard';
import { ActivityTypeIcon } from './ActivityTypeIcon';
import styles from './StakeholderActivitiesDigest.module.css';

// Region-aware empty-state messaging — explains each market's ecosystem
// even when there are no matching activity records to display.
const REGION_EMPTY_STATE = {
  [NEVADA_REGIONS.LAS_VEGAS]: {
    headline: 'No recorded activities for Las Vegas metro',
    body: 'Las Vegas\'s diversification drive is concentrated in hospitality tech, logistics, and health-tech. Activity tracking here depends on GOED program participation and SilverFlume business registry updates — coverage expands as GOED-backed entities report program milestones.',
  },
  [NEVADA_REGIONS.RENO]: {
    headline: 'No recorded activities for Reno / Northern Nevada',
    body: 'Reno is GOED\'s primary tech relocation target, anchored by the Tahoe-Reno Industrial Center and UNR\'s engineering pipeline. Activity spikes typically coincide with SSBCI fund deployments, SBIR phase awards, and Knowledge Fund grant cycles — check back after quarterly GOED reporting.',
  },
  [NEVADA_REGIONS.HENDERSON]: {
    headline: 'No recorded activities for Henderson',
    body: 'Henderson hosts advanced manufacturing and aerospace supply chain activity tied to the Greater Las Vegas manufacturing corridor. Recorded activities are typically sourced from GOED program participants and SBIR awardees — coverage reflects formal program enrollment.',
  },
  [NEVADA_REGIONS.CARSON_CITY]: {
    headline: 'No recorded activities for Carson City',
    body: 'Carson City is the policy and regulatory hub of Nevada\'s innovation programs. Activity here tends to be legislative and programmatic rather than company-level — expect GOED board meetings, Knowledge Fund award announcements, and CVC policy updates.',
  },
  [NEVADA_REGIONS.NORTH]: {
    headline: 'No recorded activities for Northern Nevada',
    body: 'The northern corridor — Elko, Winnemucca, Battle Mountain — is critical minerals and mining country. Coverage is growing as federal supply chain resilience programs drive more GOED engagement with mining-adjacent tech startups.',
  },
  [NEVADA_REGIONS.SOUTH]: {
    headline: 'No recorded activities for Southern Nevada',
    body: 'Southern Nevada including North Las Vegas and the Apex Industrial Park is a GOED priority zone for advanced manufacturing recruitment. Recorded activities grow as the Apex development matures and GOED program participants begin milestone reporting.',
  },
  [NEVADA_REGIONS.ALL]: {
    headline: 'No activities match your current filters',
    body: 'Try broadening your search query or clearing the search field. The activity feed is sourced from GOED program data, SBIR.gov award records, and Crunchbase — coverage reflects entities formally enrolled in state programs.',
  },
};

function getEmptyStateContent(location, hasSearch) {
  if (hasSearch) {
    return {
      headline: 'No activities match your search',
      body: 'Try different keywords — search covers company name, description, location, and activity type. Clear the search field to see all activities for the selected region.',
    };
  }
  return REGION_EMPTY_STATE[location] || REGION_EMPTY_STATE[NEVADA_REGIONS.ALL];
}

// Contextual descriptor for each month group header — explains
// what the reader is looking at in that time slice.
function MonthContextNote({ monthName }) {
  return (
    <span className={styles.monthContextNote}>
      Ecosystem events and program milestones recorded in {monthName}
    </span>
  );
}

/**
 * StakeholderActivitiesDigest component
 * Displays a timeline of stakeholder activities organized by date and location
 */
export function StakeholderActivitiesDigest() {
  const [selectedLocation, setSelectedLocation] = useState(NEVADA_REGIONS.ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: activities = [], isLoading, error } = useStakeholderActivities();

  // Filter by location
  const locationFiltered = useMemo(() => {
    return filterActivitiesByLocation(activities, selectedLocation);
  }, [activities, selectedLocation]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return locationFiltered;

    const query = searchQuery.toLowerCase();
    return locationFiltered.filter((activity) => {
      const searchableText = [
        activity.company_name,
        activity.description,
        activity.location,
        getActivityTypeLabel(activity.activity_type),
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [locationFiltered, searchQuery]);

  // Group by month
  const groupedByMonth = useMemo(() => {
    return groupActivitiesByMonth(filtered);
  }, [filtered]);

  const totalCount = activities.length;
  const displayCount = filtered.length;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.sectionPreamble}>
          <h2 className={styles.sectionPreambleTitle}>Stakeholder Activity Feed</h2>
          <p className={styles.sectionPreambleBody}>
            A chronological record of funding rounds, grants, partnerships, expansions, and
            milestones reported by GOED-tracked entities across Nevada&rsquo;s innovation
            ecosystem. Filter by region to focus on a specific market cluster.
          </p>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading stakeholder activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.sectionPreamble}>
          <h2 className={styles.sectionPreambleTitle}>Stakeholder Activity Feed</h2>
        </div>
        <div className={styles.errorState}>
          <p>Error loading activities</p>
          <span>{error.message}</span>
        </div>
      </div>
    );
  }

  const emptyStateContent = getEmptyStateContent(selectedLocation, !!searchQuery.trim());

  return (
    <div className={styles.container}>
      {/* ── Section header with explanatory preamble ─────── */}
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Stakeholder Activities Digest</h2>
          <p className={styles.subtitle}>
            Recent activities from ecosystem stakeholders &mdash; {displayCount} of {totalCount}
          </p>
        </div>
      </div>

      {/* ── Descriptive preamble explaining the data ─────── */}
      <div className={styles.sectionPreamble}>
        <p className={styles.sectionPreambleBody}>
          A chronological record of funding rounds, SBIR/STTR awards, strategic partnerships,
          corporate expansions, and program milestones across GOED-tracked entities. Use the
          region filter to focus on a specific market cluster, or search by company, activity
          type, or keyword. Data is sourced from SBIR.gov, Crunchbase, and GOED program reports.
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search activities by company, location, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <div className={styles.locationFilter}>
          <label className={styles.filterLabel}>Filter by region:</label>
          <div className={styles.locationButtons}>
            {Object.entries(NEVADA_REGION_LABELS).map(([regionKey, label]) => (
              <button
                key={regionKey}
                className={`${styles.locationButton} ${
                  selectedLocation === regionKey ? styles.active : ''
                }`}
                onClick={() => setSelectedLocation(regionKey)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {displayCount === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateInner}>
            <p className={styles.emptyStateHeadline}>{emptyStateContent.headline}</p>
            <p className={styles.emptyStateBody}>{emptyStateContent.body}</p>
          </div>
        </div>
      ) : (
        <div className={styles.timeline}>
          {groupedByMonth.map(({ monthName, items }) => (
            <div key={monthName} className={styles.monthGroup}>
              <div className={styles.monthHeader}>
                <div className={styles.monthHeaderLeft}>
                  <h3 className={styles.monthName}>{monthName}</h3>
                  <MonthContextNote monthName={monthName} />
                </div>
                <span className={styles.monthCount}>{items.length} activities</span>
              </div>

              <div className={styles.dateGroups}>
                {items.reduce((acc, activity) => {
                  const dateKey = activity.date;
                  const existing = acc.find((g) => g.date === dateKey);
                  if (existing) {
                    existing.items.push(activity);
                  } else {
                    acc.push({ date: dateKey, items: [activity] });
                  }
                  return acc;
                }, []).map(({ date, items: dateItems }) => (
                  <div key={date} className={styles.dateGroup}>
                    <div className={styles.dateHeader}>
                      <time className={styles.shortDate}>
                        {formatShortDate(date)}
                      </time>
                      <span className={styles.fullDate} title={formatFullDate(date)}>
                        {formatFullDate(date)}
                      </span>
                      <span className={styles.dateItemCount}>
                        {dateItems.length} {dateItems.length === 1 ? 'event' : 'events'}
                      </span>
                    </div>

                    <div className={styles.activities}>
                      {dateItems.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
