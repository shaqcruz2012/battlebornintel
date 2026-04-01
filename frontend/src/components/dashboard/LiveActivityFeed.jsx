import { memo, useState, useCallback } from 'react';
import { useNews } from '../../api/hooks';
import styles from './TerminalGrid.module.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NewsItem({ story, isExpanded, onToggle }) {
  const sectorColor = story.nevada_match ? '#45D7C6' : 'rgba(255,255,255,0.4)';

  return (
    <div
      style={{
        padding: '8px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        cursor: 'pointer',
      }}
      onClick={() => onToggle(story.id)}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 500,
              lineHeight: '1.3',
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 'none' : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {story.title}
          </a>
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 3,
            fontSize: 9,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'SF Mono', 'Cascadia Code', monospace",
          }}>
            <span>{story.source}</span>
            <span>{timeAgo(story.published_at)}</span>
            {story.score > 0 && <span>{story.score} pts</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          {story.nevada_match && (
            <span style={{
              fontSize: 8,
              padding: '1px 5px',
              borderRadius: 2,
              background: 'rgba(69, 215, 198, 0.12)',
              color: '#45D7C6',
              letterSpacing: '0.5px',
              fontWeight: 600,
            }}>
              NV
            </span>
          )}
          {story.matched_sectors?.[0] && (
            <span style={{
              fontSize: 8,
              padding: '1px 5px',
              borderRadius: 2,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.5px',
            }}>
              {story.matched_sectors[0]}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 6, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
          {story.company_matches?.length > 0 && (
            <div>Companies: {story.company_matches.join(' · ')}</div>
          )}
          <div style={{ marginTop: 4 }}>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#45D7C6', textDecoration: 'none', fontSize: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              Read full story ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export const LiveActivityFeed = memo(function LiveActivityFeed({ onViewChange }) {
  const { data: newsResp, isLoading, isError } = useNews({ minRelevance: 1, limit: 15 });
  const [expandedId, setExpandedId] = useState(null);
  const handleToggle = useCallback((id) => setExpandedId(prev => prev === id ? null : id), []);

  const stories = newsResp?.data || [];

  if (isLoading) {
    return (
      <div className={styles.activityLoading}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.activitySkeleton} />
        ))}
      </div>
    );
  }

  if (isError || !stories.length) {
    return <div className={styles.activityEmpty}>NO FRONTIER INTEL DATA</div>;
  }

  return (
    <div>
      {stories.map((story) => (
        <NewsItem
          key={story.id}
          story={story}
          isExpanded={expandedId === story.id}
          onToggle={handleToggle}
        />
      ))}
      {onViewChange && (
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0 4px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={() => onViewChange('frontierIntel')}
            style={{
              background: 'none',
              border: '1px solid rgba(69, 215, 198, 0.2)',
              borderRadius: 3,
              color: '#45D7C6',
              fontSize: 9,
              letterSpacing: '1px',
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: "'SF Mono', 'Cascadia Code', monospace",
            }}
          >
            VIEW ALL FRONTIER INTEL →
          </button>
        </div>
      )}
    </div>
  );
});
