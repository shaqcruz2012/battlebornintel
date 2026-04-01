import { useState, useMemo, useCallback, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilters } from '../../hooks/useFilters';
import styles from './RecommendedConnections.module.css';

const BASE = '/api';

async function fetchPredictedLinks({ limit = 50, minScore = 0.3, region } = {}) {
  const url = new URL(`${BASE}/analytics/predicted-links`, window.location.origin);
  url.searchParams.set('limit', limit);
  url.searchParams.set('minScore', minScore);
  if (region && region !== 'all') {
    url.searchParams.set('region', region);
  }
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

// Type filter labels — map normalized type pairs to readable labels
const TYPE_PAIR_LABELS = {
  'fund|company': 'Fund-Co',
  'company|company': 'Co-Co',
  'accelerator|company': 'Accel-Co',
  'ecosystem|company': 'Eco-Co',
  'person|company': 'Person-Co',
  'fund|fund': 'Fund-Fund',
  'accelerator|fund': 'Accel-Fund',
  'company|fund': 'Co-Fund',
  'external|company': 'Ext-Co',
  'fund|accelerator': 'Fund-Accel',
  'fund|ecosystem': 'Fund-Eco',
  'person|fund': 'Person-Fund',
};

// Normalize type strings from the API to canonical filter values.
// Handles variations like 'ecosystem_org' -> 'ecosystem', case differences, etc.
function normalizeType(t) {
  if (!t) return '';
  const lower = t.toLowerCase().trim();
  if (lower === 'ecosystem_org' || lower === 'ecosystem_organization') return 'ecosystem';
  if (lower === 'investor') return 'fund';
  if (lower === 'startup') return 'company';
  return lower;
}

const FEATURE_LABELS = {
  jaccard: 'Network Overlap',
  sectorOverlap: 'Sector Match',
  geoProximity: 'Proximity',
  recency: 'Recency',
  typeCompatibility: 'Type Fit',
};

const FEATURE_TOOLTIPS = {
  jaccard: 'Shared connections — how many mutual contacts these two entities have in common',
  sectorOverlap: 'Industry alignment — whether they operate in the same or related sectors',
  geoProximity: 'Geographic closeness — same city scores highest, same state scores medium',
  recency: 'How recently the bridge connection between them was active',
  typeCompatibility: 'How commonly this type of entity pairs with the other (e.g., fund-company pairs are common)',
};

function generateRecommendedAction(prediction) {
  const bridge = prediction.bridgeNode;
  const target = prediction.nodeC;

  if (!bridge) return null;

  const bridgeType = bridge.type || 'entity';

  if (bridgeType === 'fund' || bridgeType === 'investor') {
    return `Request portfolio introduction through ${bridge.label} to connect with ${target.label}`;
  }
  if (bridgeType === 'accelerator') {
    return `Apply to or engage with ${bridge.label}'s program to access ${target.label}'s network`;
  }
  if (bridgeType === 'ecosystem_org' || bridgeType === 'government') {
    return `Attend ${bridge.label} events or programs to build a pathway to ${target.label}`;
  }
  if (bridgeType === 'person') {
    return `Request a personal introduction from ${bridge.label} to ${target.label}`;
  }
  return `Connect through ${bridge.label} to reach ${target.label}`;
}

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

const PredictionCard = memo(function PredictionCard({ prediction }) {
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
            <span
              key={key}
              className={`${styles.chip} ${chipClass(val)}`}
              title={FEATURE_TOOLTIPS[key]}
              aria-label={`${FEATURE_LABELS[key]} score: ${Math.round(val * 100)}% — ${FEATURE_TOOLTIPS[key]}`}
            >
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

        {prediction.bridgeNode && (
          <div className={styles.recommendedAction}>
            <span className={styles.actionLabel}>RECOMMENDED ACTION</span>
            <span className={styles.actionText}>
              {generateRecommendedAction(prediction)}
            </span>
            <span className={styles.contactPlaceholder}>
              Contact list coming soon — connect through {prediction.bridgeNode.label}&apos;s network
            </span>
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
});

export function RecommendedConnections() {
  const { filters } = useFilters();
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  const { data, isLoading, isError, isFetching } = usePredictedLinks({ limit: 100, minScore: 0.25, region: filters.region });

  const filteredPredictions = useMemo(() => {
    if (!data?.predictions) return [];
    let items = data.predictions;

    // Filter by type pair (normalize types for robust matching)
    if (typeFilter !== 'all') {
      const [tA, tC] = typeFilter.split('|');
      items = items.filter((p) => {
        const nA = normalizeType(p.nodeA.type);
        const nC = normalizeType(p.nodeC.type);
        const matchForward = nA === tA && nC === tC;
        const matchReverse = nA === tC && nC === tA;
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

  // Build type filters dynamically from actual prediction data
  const typeFilters = useMemo(() => {
    const filters = [{ value: 'all', label: 'All' }];
    if (!data?.predictions) return filters;
    const seen = new Set();
    data.predictions.forEach(p => {
      const pair = `${normalizeType(p.nodeA.type)}|${normalizeType(p.nodeC.type)}`;
      const reversePair = `${normalizeType(p.nodeC.type)}|${normalizeType(p.nodeA.type)}`;
      // Dedupe forward/reverse
      const canonical = seen.has(reversePair) ? reversePair : pair;
      if (!seen.has(canonical) && !seen.has(reversePair)) {
        seen.add(canonical);
        filters.push({ value: canonical, label: TYPE_PAIR_LABELS[canonical] || canonical.replace('|', '-').toUpperCase() });
      }
    });
    return filters;
  }, [data]);

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
          {typeFilters.map((f) => (
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
            <option value="jaccard">Sort: Shared Connections</option>
            <option value="recency">Sort: Recency</option>
          </select>
        </div>
      </div>

      {stats && (
        <div className={styles.statsBar}>
          <span>
            Open triads (A-B-C paths without a direct A-C link): <span className={styles.statVal}>{stats.totalOpenTriads.toLocaleString()}</span>
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
        <div className={styles.skeletonFeed}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} style={{ width: '60%' }} />
              <div className={styles.skeletonLine} style={{ width: '35%', height: 10 }} />
              <div className={styles.skeletonChips}>
                {[1, 2, 3].map(j => (
                  <div key={j} className={styles.skeletonChip} />
                ))}
              </div>
            </div>
          ))}
        </div>
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
