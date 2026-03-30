import { memo, useEffect } from 'react';
import { useStakeholderActivities } from '../../api/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { EventCard } from '../shared/EventCard';
import styles from './TerminalGrid.module.css';

export const LiveActivityFeed = memo(function LiveActivityFeed() {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading, isError } = useStakeholderActivities({ limit: 20 });

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['stakeholderActivities'] });
    }, 60000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className={styles.activityLoading}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.activitySkeleton} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className={styles.activityEmpty}>FAILED TO LOAD ACTIVITY DATA</div>;
  }

  if (!activities.length) {
    return <div className={styles.activityEmpty}>NO ACTIVITY DATA</div>;
  }

  return (
    <div aria-live="polite" aria-label="Live ecosystem activity feed">
      {activities.map((a, i) => (
        <EventCard
          key={a.id || i}
          event={{
            id: a.id || i,
            date: a.activity_date || a.date || a.created_at,
            activity_type: a.activity_type || a.type || '',
            company_name: a.stakeholder_name || a.company_name || a.entity || 'Unknown',
            description: a.description || a.title || a.activity_type || '',
            location: a.location || '',
            stakeholder_type: a.stakeholder_type || '',
            source_url: a.source_url,
            source: a.source,
            verified: a.verified,
            confidence: a.confidence,
          }}
          isExpanded={false}
          onToggle={() => {}}
          compact
        />
      ))}
    </div>
  );
});
