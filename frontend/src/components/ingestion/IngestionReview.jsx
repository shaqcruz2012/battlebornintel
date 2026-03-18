import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './IngestionReview.module.css';

/**
 * Fetch helper for ingestion API.
 * Auth strategy: sends JWT Bearer token from login session (admin role required),
 * with x-admin-key fallback from sessionStorage for manual key entry.
 */
async function fetchIngestion(path, opts = {}) {
  const url = new URL(`/api/ingestion${path}`, window.location.origin);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') url.searchParams.set(k, v);
    }
  }
  const headers = { 'Content-Type': 'application/json' };
  // Prefer JWT auth (same token the rest of the app uses)
  const token = localStorage.getItem('bbi_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Also send admin key if stored (fallback for non-JWT setups)
  const adminKey = sessionStorage.getItem('bbi_admin_key') || localStorage.getItem('bbi_admin_key');
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }
  const res = await fetch(url.toString(), {
    method: opts.method || 'GET',
    headers,
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

const SOURCE_STYLES = {
  news: styles.sourceNews,
  crunchbase: styles.sourceCrunchbase,
  sec: styles.sourceSec,
  sbir: styles.sourceSbir,
  manual: styles.sourceManual,
};

function summarizeEntityData(entityType, data) {
  switch (entityType) {
    case 'funding_round':
      return `${data.company || '?'} - ${data.round || 'Funding'} $${((data.amount || 0) / 1_000_000).toFixed(1)}M`;
    case 'partnership':
      return `${data.company_a || '?'} + ${data.company_b || '?'}`;
    case 'hiring':
      return `${data.company || '?'} - ${data.positions || '?'} ${data.department || ''} roles`;
    case 'edge':
      return `${data.source_id || '?'} -> ${data.target_id || '?'} (${data.rel || '?'})`;
    case 'company':
      return `${data.name || '?'} (${data.stage || '?'}) - ${data.city || '?'}`;
    default:
      return JSON.stringify(data).slice(0, 80);
  }
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  const cls = pct >= 80 ? styles.confidenceHigh : pct >= 50 ? styles.confidenceMed : styles.confidenceLow;

  return (
    <div className={styles.confidenceBar}>
      <div className={styles.confidenceTrack}>
        <div className={`${styles.confidenceFill} ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.confidenceLabel}>{pct}%</span>
    </div>
  );
}

function formatTimestamp(ts) {
  if (!ts) return '-';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function IngestionReview() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState(new Set());

  // Fetch queue items
  const { data: queueData, isLoading, error } = useQuery({
    queryKey: ['ingestion', 'queue', statusFilter, sourceFilter, entityFilter],
    queryFn: () =>
      fetchIngestion('/queue', {
        params: {
          status: statusFilter,
          source: sourceFilter !== 'all' ? sourceFilter : undefined,
          entity_type: entityFilter !== 'all' ? entityFilter : undefined,
          limit: 100,
        },
      }),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['ingestion', 'stats'],
    queryFn: () => fetchIngestion('/stats'),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const items = queueData?.data || [];
  const stats = statsData?.data || {};

  // Approve mutation
  const approveMut = useMutation({
    mutationFn: (id) => fetchIngestion(`/queue/${id}/approve`, { method: 'PUT', body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion'] });
    },
  });

  // Reject mutation
  const rejectMut = useMutation({
    mutationFn: (id) => fetchIngestion(`/queue/${id}/reject`, { method: 'PUT', body: {} }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingestion'] });
    },
  });

  // Batch mutation
  const batchMut = useMutation({
    mutationFn: ({ ids, action }) =>
      fetchIngestion('/queue/batch', { method: 'POST', body: { ids, action } }),
    onSuccess: () => {
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ['ingestion'] });
    },
  });

  const handleToggleSelect = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  }, [items, selected.size]);

  const handleBatchApprove = useCallback(() => {
    if (selected.size === 0) return;
    batchMut.mutate({ ids: [...selected], action: 'approve' });
  }, [selected, batchMut]);

  const handleBatchReject = useCallback(() => {
    if (selected.size === 0) return;
    batchMut.mutate({ ids: [...selected], action: 'reject' });
  }, [selected, batchMut]);

  const sourceBreakdown = useMemo(() => {
    if (!stats.bySource) return [];
    return Object.entries(stats.bySource).map(([src, counts]) => ({
      source: src,
      pending: counts.pending || 0,
    }));
  }, [stats.bySource]);

  const hasToken = !!localStorage.getItem('bbi_token');
  const hasAdminKey = !!(sessionStorage.getItem('bbi_admin_key') || localStorage.getItem('bbi_admin_key'));
  const [adminKeyInput, setAdminKeyInput] = useState('');

  const handleSetAdminKey = useCallback(() => {
    if (adminKeyInput.trim()) {
      sessionStorage.setItem('bbi_admin_key', adminKeyInput.trim());
      setAdminKeyInput('');
      queryClient.invalidateQueries({ queryKey: ['ingestion'] });
    }
  }, [adminKeyInput, queryClient]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ingestion Queue Review</h2>

      {/* Show admin key input if user has no JWT token and no stored key */}
      {!hasToken && !hasAdminKey && (
        <div className={styles.authPrompt}>
          <p>Admin authentication required. Log in with an admin account, or enter an admin API key:</p>
          <div className={styles.authRow}>
            <input
              type="password"
              className={styles.authInput}
              placeholder="Admin API key"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetAdminKey()}
            />
            <button className={styles.authBtn} onClick={handleSetAdminKey}>
              Set Key
            </button>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>Failed to load queue: {error.message}</div>}

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending</div>
          <div className={styles.statValuePending}>{stats.pending || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Approved Today</div>
          <div className={styles.statValueApproved}>{(stats.approvedToday || 0) + (stats.appliedToday || 0)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rejected Today</div>
          <div className={styles.statValueRejected}>{stats.rejectedToday || 0}</div>
        </div>
        {sourceBreakdown.map((s) =>
          s.pending > 0 ? (
            <div className={styles.statCard} key={s.source}>
              <div className={styles.statLabel}>{s.source}</div>
              <div className={styles.statValue}>{s.pending}</div>
            </div>
          ) : null
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="applied">Applied</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className={styles.filterSelect}
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="news">News</option>
          <option value="crunchbase">Crunchbase</option>
          <option value="sec">SEC</option>
          <option value="sbir">SBIR</option>
          <option value="manual">Manual</option>
        </select>

        <select
          className={styles.filterSelect}
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="funding_round">Funding Round</option>
          <option value="partnership">Partnership</option>
          <option value="hiring">Hiring</option>
          <option value="edge">Edge</option>
          <option value="company">Company</option>
        </select>

        {statusFilter === 'pending' && (
          <div className={styles.batchActions}>
            {selected.size > 0 && (
              <span className={styles.batchCount}>{selected.size} selected</span>
            )}
            <button
              className={`${styles.btnBatchApprove} ${selected.size === 0 ? styles.btnDisabled : ''}`}
              onClick={handleBatchApprove}
              disabled={selected.size === 0 || batchMut.isPending}
            >
              {batchMut.isPending ? 'Processing...' : `Approve (${selected.size})`}
            </button>
            <button
              className={`${styles.btnBatchReject} ${selected.size === 0 ? styles.btnDisabled : ''}`}
              onClick={handleBatchReject}
              disabled={selected.size === 0 || batchMut.isPending}
            >
              Reject ({selected.size})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className={styles.loading}>Loading queue...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No items in queue matching filters.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {statusFilter === 'pending' && (
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.size === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th>Source</th>
              <th>Type</th>
              <th>Confidence</th>
              <th>Summary</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <>
                <tr key={item.id}>
                  {statusFilter === 'pending' && (
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selected.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                      />
                    </td>
                  )}
                  <td>
                    <span className={`${styles.sourceBadge} ${SOURCE_STYLES[item.source] || ''}`}>
                      {item.source}
                    </span>
                  </td>
                  <td>
                    <span className={styles.entityBadge}>
                      {item.entity_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <ConfidenceBar value={item.confidence} />
                  </td>
                  <td>
                    <div className={styles.summary}>
                      {summarizeEntityData(item.entity_type, item.entity_data)}
                    </div>
                    {item.source_url && (
                      <a
                        className={styles.sourceLink}
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {new URL(item.source_url).hostname}
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={styles.timestamp}>{formatTimestamp(item.created_at)}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {item.status === 'pending' && (
                        <>
                          <button
                            className={styles.btnApprove}
                            onClick={() => approveMut.mutate(item.id)}
                            disabled={approveMut.isPending}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.btnReject}
                            onClick={() => rejectMut.mutate(item.id)}
                            disabled={rejectMut.isPending}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className={styles.btnExpand}
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      >
                        {expandedId === item.id ? 'Collapse' : 'Detail'}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === item.id && (
                  <tr key={`${item.id}-expanded`} className={styles.expandedRow}>
                    <td colSpan={statusFilter === 'pending' ? 7 : 6}>
                      <div className={styles.expandedContent}>
                        <pre className={styles.jsonPre}>
                          {JSON.stringify(item.entity_data, null, 2)}
                        </pre>
                        {item.notes && (
                          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        )}
                        {item.reviewer_name && (
                          <p style={{ marginTop: '0.25rem', color: 'var(--text-disabled)', fontSize: 'var(--text-body-xs)' }}>
                            Reviewed by {item.reviewer_name} at {new Date(item.reviewed_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IngestionReview;
