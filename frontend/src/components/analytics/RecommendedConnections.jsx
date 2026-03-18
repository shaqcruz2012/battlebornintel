import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './RecommendedConnections.module.css';

const BASE = '/api';

async function fetchPredictedLinks({ limit = 50, minScore = 0.3 } = {}) {
  const url = new URL(`${BASE}/analytics/predicted-links`, window.location.origin);
  url.searchParams.set('limit', limit);
  url.searchParams.set('minScore', minScore);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.data;
}

function usePredictedLinks(opts = {}) {
  return useQuery({
    queryKey: ['predictedLinks', opts],
    queryFn: () => fetchPredictedLinks(opts),
    staleTime: 300_000,
    placeholderData: (prev) => prev,
  });
}

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'fund|company', label: 'Fund-Co' },
  { value: 'company|company', label: 'Co-Co' },
  { value: 'accelerator|company', label: 'Accel-Co' },
  { value: 'ecosystem|company', label: 'Eco-Co' },
  { value: 'person|company', label: 'Person-Co' },
];

const FEATURE_LABELS = {
  jaccard: 'JAC',
  sectorOverlap: 'SEC',
  geoProximity: 'GEO',
  recency: 'REC',
  typeCompatibility: 'TYP',
};

function scoreClass(score) {
  if (score >= 0.6) return styles.scoreHigh;
  if (score >= 0.4) return styles.scoreMid;
  return styles.scoreLow;
}

function scoreBarColor(score) {
  if (score >= 0.6) return '#34d399';
  if (score >= 0.4) return '#fbbf24';
  return '#f87171';
}

function chipClass(val) {
  if (val >= 0.6) return styles.chipHigh;
  if (val >= 0.4) return styles.chipMid;
  return '';
}

function nodeTypeClass(type) {
  switch (type) {
    case 'company': return styles.nodeTypeCompany;
    case 'fund': return styles.nodeTypeFund;
    case 'person': return styles.nodeTypePerson;
    case 'accelerator': return styles.nodeTypeAccelerator;
    case 'ecosystem': return styles.nodeTypeEcosystem;
    case 'external': return styles.nodeTypeExternal;
    default: return '';
  }
}

function PredictionCard({ prediction }) {
  const { nodeA, nodeC, bridgeNode, score, features, reasoning, opportunity } = prediction;
  const pct = Math.round(score * 100);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.connectionRow}>
          <span className={styles.nodeTag}>
            <span className={`${styles.nodeType} ${nodeTypeClass(nodeA.type)}`}>{nodeA.type}</span>
            {nodeA.label}
          </span>
          <span className={styles.arrow}>&mdash;</span>
          <span className={styles.nodeTag}>
            <span className={`${styles.nodeType} ${nodeTypeClass(nodeC.type)}`}>{nodeC.type}</span>
            {nodeC.label}
          </span>
          <span className={styles.reasoningTrigger}>
            ?
            <span className={styles.reasoningTooltip}>{reasoning}</span>
          </span>
        </div>

        <div className={styles.bridgeLabel}>
          via <span className={styles.bridgeName}>{bridgeNode.label}</span>
        </div>

        <div className={styles.featureRow}>
          {Object.entries(features).map(([key, val]) => (
            <span key={key} className={`${styles.chip} ${chipClass(val)}`}>
              <span className={styles.chipLabel}>{FEATURE_LABELS[key]}</span>
              <span className={styles.chipVal}>{Math.round(val * 100)}</span>
            </span>
          ))}
        </div>

        {opportunity && (
          <div className={styles.opportunitySection}>
            <button
              type="button"
              className={styles.opportunityToggle}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? '\u25BE' : '\u25B8'} Opportunity
              {!expanded && (
                <span className={styles.opportunityTooltip}>{opportunity}</span>
              )}
            </button>
            {expanded && (
              <div className={styles.opportunitySummary}>{opportunity}</div>
            )}
          </div>
        )}
      </div>

      <div className={styles.scoreCol}>
        <span className={`${styles.scoreValue} ${scoreClass(score)}`}>{pct}</span>
        <div className={styles.scoreBar}>
          <div
            className={styles.scoreBarFill}
            style={{ width: `${pct}%`, background: scoreBarColor(score) }}
          />
        </div>
      </div>
    </div>
  );
}

export function RecommendedConnections() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const { data, isLoading, isError, isFetching } = usePredictedLinks({ limit: 100, minScore: 0.25 });

  const filteredPredictions = useMemo(() => {
    if (!data?.predictions) return [];
    let items = data.predictions;

    // Filter by type pair
    if (typeFilter !== 'all') {
      const [tA, tC] = typeFilter.split('|');
      items = items.filter((p) => {
        const matchForward = p.nodeA.type === tA && p.nodeC.type === tC;
        const matchReverse = p.nodeA.type === tC && p.nodeC.type === tA;
        return matchForward || matchReverse;
      });
    }

    // Sort
    if (sortBy === 'score') {
      items = [...items].sort((a, b) => b.score - a.score);
    } else if (sortBy === 'jaccard') {
      items = [...items].sort((a, b) => b.features.jaccard - a.features.jaccard);
    } else if (sortBy === 'recency') {
      items = [...items].sort((a, b) => b.features.recency - a.features.recency);
    }

    return items;
  }, [data, typeFilter, sortBy]);

  const handleFilterChange = useCallback((val) => setTypeFilter(val), []);
  const handleSortChange = useCallback((e) => setSortBy(e.target.value), []);

  const stats = data?.stats;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>
            Recommended Connections
            {isFetching && <span className={styles.fetchingDot} title="Updating..." />}
          </h2>
          {stats && (
            <span className={styles.badge}>
              {stats.predictionsAboveThreshold} predictions
            </span>
          )}
        </div>

        <div className={styles.controls}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles.filterBtn} ${typeFilter === f.value ? styles.filterActive : ''}`}
              onClick={() => handleFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="score">Sort: Score</option>
            <option value="jaccard">Sort: Jaccard</option>
            <option value="recency">Sort: Recency</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className={styles.statsBar}>
          <span>
            Open triads: <span className={styles.statVal}>{stats.totalOpenTriads.toLocaleString()}</span>
          </span>
          <span>
            Above threshold: <span className={styles.statVal}>{stats.predictionsAboveThreshold}</span>
          </span>
          <span>
            Avg score: <span className={styles.statVal}>{Math.round(stats.avgScore * 100)}%</span>
          </span>
          <span>
            Showing: <span className={styles.statVal}>{filteredPredictions.length}</span>
          </span>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Computing triadic closure predictions...</div>
      ) : isError ? (
        <div className={styles.error}>Failed to load predictions. Check API connection.</div>
      ) : filteredPredictions.length === 0 ? (
        <div className={styles.empty}>No predictions match current filters</div>
      ) : (
        <div className={styles.feed}>
          {filteredPredictions.map((p, i) => (
            <PredictionCard key={`${p.nodeA.id}-${p.nodeC.id}-${i}`} prediction={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecommendedConnections;
