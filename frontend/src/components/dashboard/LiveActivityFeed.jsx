import { useEffect } from 'react';
import { useStakeholderActivities } from '../../api/hooks';
import { useQueryClient } from '@tanstack/react-query';
import styles from './TerminalGrid.module.css';

function relativeTime(dateStr) {
  if (!dateStr) return '??';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '??';
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '<1m';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d`;
  const diffMon = Math.floor(diffDay / 30);
  return `${diffMon}mo`;
}

function dotClass(type) {
  if (!type) return styles.activityDotDefault;
  const t = type.toLowerCase();
  if (t.includes('fund') || t.includes('capital') || t.includes('invest')) return styles.activityDotFunding;
  if (t.includes('partner') || t.includes('collab')) return styles.activityDotPartnership;
  if (t.includes('hir') || t.includes('team') || t.includes('employ')) return styles.activityDotHiring;
  if (t.includes('product') || t.includes('launch') || t.includes('release')) return styles.activityDotProduct;
  if (t.includes('grant') || t.includes('award') || t.includes('ssbci')) return styles.activityDotGrant;
  return styles.activityDotDefault;
}

export function LiveActivityFeed() {
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading } = useStakeholderActivities({ limit: 20 });

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

  if (!activities.length) {
    return <div className={styles.activityEmpty}>NO ACTIVITY DATA</div>;
  }

  return (
    <>
      {activities.map((a, i) => (
        <div key={a.id || i} className={styles.activityItem}>
          <span className={styles.activityTime}>
            {relativeTime(a.activity_date || a.date || a.created_at)}
          </span>
          <span className={`${styles.activityDot} ${dotClass(a.activity_type || a.type)}`} />
          <div className={styles.activityBody}>
            <span className={styles.activityCompany}>
              {a.stakeholder_name || a.company_name || a.entity || 'Unknown'}
            </span>
            <div className={styles.activityDesc}>
              {a.description || a.title || a.activity_type || ''}
            </div>
            {(a.activity_type || a.type) && (
              <div className={styles.activityType}>
                {a.activity_type || a.type}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
