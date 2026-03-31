import { useState, useRef, useEffect, useCallback } from 'react';
import { NODE_CFG } from '../../data/constants';
import styles from './PathFinder.module.css';

const API = '';

function useNodeSearch(nodes, query, isOpen) {
  if (!isOpen || query.length < 2) return [];
  const lower = query.toLowerCase();
  return nodes
    .filter((n) => n.label?.toLowerCase().includes(lower))
    .slice(0, 10);
}

function SearchField({ label, value, nodes, onSelect, onClear }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const results = useNodeSearch(nodes, query, open);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback((node) => {
    onSelect(node);
    setQuery('');
    setOpen(false);
  }, [onSelect]);

  if (value) {
    const cfg = NODE_CFG[value.type] || { color: '#6B6A72', label: value.type };
    return (
      <div className={styles.fieldWrapper}>
        <div className={styles.fieldLabel}>{label}</div>
        <div
          className={styles.input}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => { onClear(); setQuery(''); }}
          title="Click to change"
        >
          <span className={styles.dot} style={{ backgroundColor: cfg.color }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value.label}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>&times;</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldWrapper} ref={wrapperRef}>
      <div className={styles.fieldLabel}>{label}</div>
      <input
        className={styles.input}
        placeholder={`Search ${label.toLowerCase()} node...`}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((node) => {
            const cfg = NODE_CFG[node.type] || { color: '#6B6A72', label: node.type };
            return (
              <div
                key={node.id}
                className={styles.dropdownItem}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(node); }}
              >
                <span className={styles.dot} style={{ backgroundColor: cfg.color }} />
                <span className={styles.itemLabel}>{node.label}</span>
                <span className={styles.itemType}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PathFinder({ nodes, onHighlightPath, onSelectNode }) {
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canFind = source && target && source.id !== target.id;

  const handleFind = useCallback(async () => {
    if (!canFind) return;
    setLoading(true);
    setError(null);
    setPath(null);
    try {
      const res = await fetch(`${API}/api/graph-analysis/path/${encodeURIComponent(source.id)}/${encodeURIComponent(target.id)}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'No path found between these nodes' : `Error ${res.status}`);
      const data = await res.json();
      if (!data.path || data.path.length === 0) throw new Error('No path found between these nodes');
      setPath(data);
      onHighlightPath?.(data.path.map((n) => n.id));
    } catch (err) {
      setError(err.message);
      onHighlightPath?.([]);
    } finally {
      setLoading(false);
    }
  }, [canFind, source, target, onHighlightPath]);

  const handleClear = useCallback(() => {
    setSource(null);
    setTarget(null);
    setPath(null);
    setError(null);
    onHighlightPath?.([]);
  }, [onHighlightPath]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>Path Finder</div>

      <div className={styles.searchRow}>
        <SearchField label="From" value={source} nodes={nodes} onSelect={setSource} onClear={() => setSource(null)} />
        <SearchField label="To" value={target} nodes={nodes} onSelect={setTarget} onClear={() => setTarget(null)} />
      </div>

      <div className={styles.actions}>
        <button className={styles.findBtn} disabled={!canFind || loading} onClick={handleFind}>
          {loading ? 'Searching...' : 'Find Path'}
        </button>
        {(source || target || path) && (
          <button className={styles.clearBtn} onClick={handleClear}>Clear</button>
        )}
      </div>

      {loading && <div className={styles.loading}>Searching for shortest path...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {path && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <div className={styles.hopCount}>
            {path.path.length - 1} hop{path.path.length - 1 !== 1 ? 's' : ''}
          </div>
          <div className={styles.pathChain}>
            {path.path.map((node, i) => {
              const cfg = NODE_CFG[node.type] || { color: '#6B6A72', label: node.type };
              const edge = path.edges?.[i];
              return (
                <div key={node.id}>
                  <div
                    className={styles.pathNode}
                    onClick={() => onSelectNode?.(node.id)}
                  >
                    <span className={styles.dot} style={{ backgroundColor: cfg.color }} />
                    <span className={styles.pathNodeName}>{node.label || node.id}</span>
                    <span className={styles.pathNodeType}>{cfg.label}</span>
                  </div>
                  {edge && (
                    <div className={styles.pathEdge}>
                      <span className={styles.edgeLine} />
                      <span className={styles.edgeLabel}>{edge.rel || edge.label || 'connected'}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
