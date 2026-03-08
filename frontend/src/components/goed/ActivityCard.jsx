import { memo } from 'react';
import {
  getActivityTypeIcon,
  getActivityTypeColor,
  getActivityTypeLabel,
} from './activity-utils';
import { ActivityTypeIcon } from './ActivityTypeIcon';
import styles from './ActivityCard.module.css';

/**
 * ActivityCard component
 * Displays a single stakeholder activity
 */
export const ActivityCard = memo(function ActivityCard({ activity }) {
  const {
    company_name,
    activity_type,
    description,
    location,
    source,
    verified,
  } = activity;

  const icon = getActivityTypeIcon(activity_type);
  const color = getActivityTypeColor(activity_type);
  const label = getActivityTypeLabel(activity_type);

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper} style={{ borderColor: color }}>
        <ActivityTypeIcon icon={icon} color={color} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.company}>{company_name}</h4>
          <span className={styles.activityType} style={{ backgroundColor: `${color}20` }}>
            {label}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          {location && (
            <span className={styles.location} title={`Location: ${location}`}>
              📍 {location}
            </span>
          )}

          <div className={styles.rightGroup}>
            {verified && (
              <span className={styles.verified} title="Verified source">
                ✓
              </span>
            )}

            {source && (
              <span className={styles.source} title={`Source: ${source}`}>
                {source}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
