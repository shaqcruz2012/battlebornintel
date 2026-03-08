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
        <div className={styles.errorState}>
          <p>Error loading activities</p>
          <span>{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Stakeholder Activities Digest</h2>
        <p className={styles.subtitle}>
          Recent activities from ecosystem stakeholders — {displayCount} of {totalCount}
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
              ×
            </button>
          )}
        </div>

        <div className={styles.locationFilter}>
          <label className={styles.filterLabel}>Location:</label>
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
          <p>No activities found matching your filters.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {groupedByMonth.map(({ monthName, items }) => (
            <div key={monthName} className={styles.monthGroup}>
              <div className={styles.monthHeader}>
                <h3 className={styles.monthName}>{monthName}</h3>
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
