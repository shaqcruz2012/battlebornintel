import { useState, useMemo, useCallback } from 'react';
import { useNews, useNewsSectors, useNewsRefresh } from '../../api/hooks';
import styles from './FrontierIntelligence.module.css';

const FILTER_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'nevada', label: 'NEVADA DIRECT' },
  { id: 'AI/ML', label: 'AI/ML' },
  { id: 'CleanTech', label: 'CLEANTECH' },
  { id: 'Defense', label: 'DEFENSE' },
  { id: 'Data Centers', label: 'DATA CENTERS' },
  { id: 'Biotech', label: 'BIOTECH' },
  { id: 'Space', label: 'SPACE' },
  { id: 'Mining/Materials', label: 'MINING' },
  { id: 'Fintech', label: 'FINTECH' },
];

const SECTOR_CLASS_MAP = {
  'AI/ML': styles.sectorAI,
  'CleanTech': styles.sectorClean,
  'Defense': styles.sectorDefense,
  'Data Centers': styles.sectorData,
  'Gaming/Entertainment': styles.sectorGaming,
  'Biotech': styles.sectorBiotech,
  'Space': styles.sectorSpace,
  'Water': styles.sectorWater,
  'Mining/Materials': styles.sectorMining,
  'Fintech': styles.sectorFintech,
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function RelevanceBar({ value }) {
  const capped = Math.min(value, 100);
  const cls = capped >= 60 ? styles.relevanceHigh : capped >= 30 ? styles.relevanceMed : styles.relevanceLow;
  return (
    <div className={styles.relevanceRow}>
      <span>Relevance:</span>
      <div className={styles.relevanceBar}>
        <div className={`${styles.relevanceFill} ${cls}`} style={{ width: `${capped}%` }} />
      </div>
      <span>{Math.round(value)}</span>
    </div>
  );
}

function NewsCard({ story }) {
  const sectorCls = story.matched_sectors?.length
    ? (SECTOR_CLASS_MAP[story.matched_sectors[0]] || styles.sectorDefault)
    : null;

  return (
    <div className={`${styles.card} ${story.nevada_match ? styles.cardNevada : ''}`}>
      <div className={styles.scoreCol}>
        <span className={styles.scoreArrow}>&#9650;</span>
        <span className={styles.scoreNum}>{story.score}</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          {story.matched_sectors?.length > 0 && (
            <span className={`${styles.sectorPill} ${sectorCls}`}>
              {story.matched_sectors[0]}
            </span>
          )}
          <a
            className={styles.cardTitle}
            href={story.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {story.title}
          </a>
        </div>

        <div className={styles.cardMeta}>
          <span>{story.source}</span>
          <span>{timeAgo(story.published_at)}</span>
          {story.comments > 0 && (
            <a
              href={`https://news.ycombinator.com/item?id=${story.id?.replace('hn_', '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {story.comments} comments
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <RelevanceBar value={story.relevance} />
          {story.nevada_match && <span className={styles.nevadaBadge}>NEVADA DIRECT</span>}
        </div>

        {story.company_matches?.length > 0 && (
          <div className={styles.companyMatches}>
            Companies: {story.company_matches.map((c, i) => (
              <span key={c}>
                {i > 0 && ' \u00B7 '}
                <span className={styles.companyLink}>{c}</span>
              </span>
            ))}
            {story.matched_sectors?.length > 0 && (
              <span> \u00B7 Sector: {story.matched_sectors.join(', ')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectorHeatmap({ data }) {
  if (!data?.length) return null;
  const maxCount = Math.max(...data.map(d => Number(d.count)), 1);

  return (
    <div className={styles.sidebarSection}>
      <h3 className={styles.sidebarTitle}>Sector Heatmap (24h)</h3>
      {data.map(row => (
        <div key={row.sector} className={styles.heatmapRow}>
          <span className={styles.heatmapLabel}>{row.sector}</span>
          <div className={styles.heatmapBarWrap}>
            <div
              className={styles.heatmapBar}
              style={{ width: `${(Number(row.count) / maxCount) * 100}%` }}
            />
          </div>
          <span className={styles.heatmapCount}>{row.count}</span>
        </div>
      ))}
    </div>
  );
}

export function FrontierIntelligence() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { data: newsResp, isLoading } = useNews({ minRelevance: 1, limit: 100 });
  const { data: sectorData } = useNewsSectors();
  const refreshMutation = useNewsRefresh();

  const stories = newsResp?.data || [];
  const lastRefreshAt = newsResp?.meta?.lastRefreshAt;

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return stories;
    if (activeFilter === 'nevada') return stories.filter(s => s.nevada_match);
    return stories.filter(s => s.matched_sectors?.includes(activeFilter));
  }, [stories, activeFilter]);

  const handleRefresh = useCallback(() => {
    refreshMutation.mutate();
  }, [refreshMutation]);

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.title}>FRONTIER INTELLIGENCE</h2>
          <div className={styles.headerMeta}>
            {lastRefreshAt && (
              <span>Updated {timeAgo(lastRefreshAt)}</span>
            )}
            <span className={styles.autoRefresh}>AUTO-REFRESH 30m</span>
            <button
              className={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? 'REFRESHING...' : 'REFRESH NOW'}
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className={styles.filters}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.filterTab} ${activeFilter === tab.id ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* News list */}
        <div className={styles.newsList}>
          {isLoading && <div className={styles.loading}>SCANNING FRONTIER SOURCES...</div>}
          {!isLoading && filtered.length === 0 && (
            <div className={styles.empty}>
              No stories matching current filter. Adjust filter or wait for next refresh.
            </div>
          )}
          {filtered.map(story => (
            <NewsCard key={story.id} story={story} />
          ))}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <SectorHeatmap data={sectorData} />

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Feed Stats</h3>
            <div className={styles.heatmapRow}>
              <span className={styles.heatmapLabel}>Total stories</span>
              <span className={styles.heatmapCount}>{stories.length}</span>
            </div>
            <div className={styles.heatmapRow}>
              <span className={styles.heatmapLabel}>Nevada direct</span>
              <span className={styles.heatmapCount}>
                {stories.filter(s => s.nevada_match).length}
              </span>
            </div>
            <div className={styles.heatmapRow}>
              <span className={styles.heatmapLabel}>High relevance</span>
              <span className={styles.heatmapCount}>
                {stories.filter(s => s.relevance >= 50).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FrontierIntelligence;
