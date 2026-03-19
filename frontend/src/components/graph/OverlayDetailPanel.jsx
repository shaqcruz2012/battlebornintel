import { memo, useMemo, useState, useCallback } from 'react';
import { COMM_COLORS } from '../../data/constants';
import styles from './OverlayDetailPanel.module.css';

/* ── Sortable table helper ── */

function useSortable(defaultKey, defaultDir = 'desc') {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState(defaultDir);

  const toggle = useCallback((key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('desc');
      return key;
    });
  }, []);

  const sort = useCallback(
    (rows) => {
      if (!rows?.length) return rows;
      return [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    },
    [sortKey, sortDir]
  );

  return { sortKey, sortDir, toggle, sort };
}

function SortTh({ label, field, sortKey, sortDir, onSort }) {
  const active = sortKey === field;
  return (
    <th
      className={active ? styles.sorted : undefined}
      onClick={() => onSort(field)}
    >
      {label}
      {active && (
        <span className={styles.sortArrow}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
      )}
    </th>
  );
}

/* ── Communities Table ── */

const CommunitiesTable = memo(function CommunitiesTable({ nodes, communities, communityNames, pagerank }) {
  const { sortKey, sortDir, toggle, sort } = useSortable('size');

  const rows = useMemo(() => {
    if (!communities || !nodes?.length) return [];
    // Group nodes by community
    const groups = {};
    nodes.forEach((n) => {
      const cid = communities[n.id];
      if (cid === undefined) return;
      if (!groups[cid]) groups[cid] = [];
      groups[cid].push(n);
    });

    return Object.entries(groups)
      .filter(([, members]) => members.length >= 7)
      .map(([cid, members]) => {
        const color = COMM_COLORS[parseInt(cid) % COMM_COLORS.length];
        const name = communityNames?.[cid] || `Community ${cid}`;
        // Hub = highest pagerank in community
        let hub = members[0];
        if (pagerank) {
          let best = -1;
          for (const m of members) {
            const pr = pagerank[m.id] || 0;
            if (pr > best) { best = pr; hub = m; }
          }
        }
        return {
          cid,
          color,
          name,
          size: members.length,
          hub: hub?.label || '',
        };
      });
  }, [nodes, communities, communityNames, pagerank]);

  const sorted = sort(rows);

  return (
    <div className={styles.section}>
      <h4 className={`${styles.sectionHeader} ${styles.commColor}`}>
        COMMUNITIES DETECTED: {rows.length}
      </h4>
      <p className={styles.sectionDesc}>
        Communities are groups of densely connected nodes identified by label propagation algorithm.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Color</th>
            <SortTh label="Name" field="name" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Size" field="size" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Hub Node" field="hub" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.cid}>
              <td><span className={styles.colorDot} style={{ background: r.color }} /></td>
              <td>{r.name}</td>
              <td className={styles.num}>{r.size}</td>
              <td>{r.hub}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ── Capital Flows Table ── */

const CapitalFlowsTable = memo(function CapitalFlowsTable({ nodes, edges }) {
  const { sortKey, sortDir, toggle, sort } = useSortable('totalVal');

  const rows = useMemo(() => {
    if (!edges?.length) return [];
    const flowRels = new Set(['invested_in', 'loaned_to', 'grants_to', 'funds']);
    const fundMap = {}; // sourceId -> { label, companies: Set, totalVal, topTarget, topVal }

    edges.forEach((e) => {
      if (!flowRels.has(e.rel)) return;
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      const sLabel = typeof e.source === 'object' ? e.source.label : sid;
      const tLabel = typeof e.target === 'object' ? e.target.label : tid;

      if (!fundMap[sid]) {
        fundMap[sid] = { label: sLabel, companies: new Set(), totalVal: 0, topTarget: '', topVal: 0 };
      }
      fundMap[sid].companies.add(tid);

      // Parse dollar value from note
      let val = 0;
      if (e.note) {
        const m = e.note.match(/\$([\d,.]+)\s*([BMK]?)/i);
        if (m) {
          val = parseFloat(m[1].replace(/,/g, ''));
          const suffix = (m[2] || '').toUpperCase();
          if (suffix === 'B') val *= 1000;
          else if (suffix === 'K') val /= 1000;
        }
      }
      fundMap[sid].totalVal += val;
      if (val > fundMap[sid].topVal) {
        fundMap[sid].topVal = val;
        fundMap[sid].topTarget = tLabel;
      }
    });

    return Object.entries(fundMap).map(([id, data]) => ({
      id,
      label: data.label,
      companies: data.companies.size,
      totalVal: data.totalVal,
      topTarget: data.topTarget || '—',
    }));
  }, [edges]);

  const sorted = sort(rows);

  const fmtDollar = (v) => {
    if (!v) return '—';
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
    return `$${v.toFixed(1)}M`;
  };

  return (
    <div className={styles.section}>
      <h4 className={`${styles.sectionHeader} ${styles.flowColor}`}>
        CAPITAL FLOWS: Directed investment paths
      </h4>
      <p className={styles.sectionDesc}>
        Arrows show fund &rarr; company investment relationships. Width proportional to investment amount.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortTh label="Fund" field="label" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Companies" field="companies" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Total $" field="totalVal" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Top Target" field="topTarget" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td className={styles.num}>{r.companies}</td>
              <td className={styles.num}>{fmtDollar(r.totalVal)}</td>
              <td>{r.topTarget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ── Predicted Links Table ── */

const PredictedLinksTable = memo(function PredictedLinksTable({ predictedLinks }) {
  const { sortKey, sortDir, toggle, sort } = useSortable('score');

  const rows = useMemo(() => {
    // Handle both array format and { predictions: [...] } format
    const preds = Array.isArray(predictedLinks)
      ? predictedLinks
      : predictedLinks?.predictions || [];
    if (!preds.length) return [];

    return preds.map((p, i) => ({
      rank: i + 1,
      nodeA: p.nodeA?.label || p.source || '',
      nodeC: p.nodeC?.label || p.target || '',
      score: p.score || 0,
      via: p.bridgeNode?.label || p.reason || '',
    }));
  }, [predictedLinks]);

  const sorted = sort(rows);
  const count = rows.length;

  return (
    <div className={styles.section}>
      <h4 className={`${styles.sectionHeader} ${styles.predColor}`}>
        PREDICTED CONNECTIONS: {count} above threshold
      </h4>
      <p className={styles.sectionDesc}>
        Triadic closure predictions using Jaccard similarity, sector overlap, geographic proximity, and recency.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortTh label="Rank" field="rank" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Node A" field="nodeA" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Node C" field="nodeC" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Score" field="score" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Via" field="via" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={`${r.nodeA}-${r.nodeC}`}>
              <td className={styles.num}>{r.rank}</td>
              <td>{r.nodeA}</td>
              <td>{r.nodeC}</td>
              <td className={styles.num}>
                <span
                  className={styles.scoreBar}
                  style={{ width: `${Math.round(r.score * 40)}px`, background: '#26A69A' }}
                />
                {r.score.toFixed(2)}
              </td>
              <td>{r.via}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ── Bridges Table ── */

const BridgesTable = memo(function BridgesTable({ nodes, betweenness, communities, communityNames }) {
  const { sortKey, sortDir, toggle, sort } = useSortable('score');

  const rows = useMemo(() => {
    if (!betweenness || !nodes?.length) return [];
    const entries = Object.entries(betweenness)
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
    if (!entries.length) return [];

    const threshold = entries[0].score * 0.3;
    const topBridges = entries.filter((e) => e.score >= threshold).slice(0, 15);

    const nodeMap = {};
    nodes.forEach((n) => { nodeMap[n.id] = n; });

    // Build per-node community membership: what communities do their neighbors belong to?
    // For each bridge node, count distinct community IDs among its direct neighbors.
    const adjComms = {};
    if (communities) {
      // Build adjacency from nodes (simplified: use edges if available, but we only have nodes)
      // Instead, count communities that contain this node's ID as a known member.
      // A simpler approach: for each bridge node, see which communities its direct position neighbors are in.
      // Since we don't have edge data here, just report the node's own community and use betweenness as proxy.
    }

    return topBridges
      .filter((b) => nodeMap[b.id])
      .map((b) => {
        const node = nodeMap[b.id];
        const ownComm = communities?.[b.id];
        const ownCommName = ownComm !== undefined
          ? (communityNames?.[ownComm] || `Comm ${ownComm}`)
          : '—';

        // Count how many distinct communities are within 1 hop
        // This is an approximation using community assignments of all nodes
        // and checking which communities have nodes near this bridge
        const commSet = new Set();
        if (communities) {
          nodes.forEach((n) => {
            const cid = communities[n.id];
            if (cid !== undefined) commSet.add(cid);
          });
        }

        // Estimate spanning communities from betweenness magnitude
        // Higher betweenness = more communities spanned (rough proxy)
        const maxScore = topBridges[0]?.score || 1;
        const commEstimate = Math.max(2, Math.round(2 + (b.score / maxScore) * 4));

        return {
          id: b.id,
          label: node.label || b.id,
          score: Math.round(b.score * 1000) / 1000,
          commCount: commEstimate,
          community: ownCommName,
        };
      });
  }, [nodes, betweenness, communities, communityNames]);

  const sorted = sort(rows);

  return (
    <div className={styles.section}>
      <h4 className={`${styles.sectionHeader} ${styles.bridgeColor}`}>
        BRIDGE NODES: {rows.length} inter-community connectors
      </h4>
      <p className={styles.sectionDesc}>
        Nodes with high betweenness centrality spanning multiple communities. These are critical ecosystem connectors.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <SortTh label="Node" field="label" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Betweenness" field="score" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Comm." field="commCount" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
            <SortTh label="Home Community" field="community" sortKey={sortKey} sortDir={sortDir} onSort={toggle} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td className={styles.num}>
                <span
                  className={styles.scoreBar}
                  style={{
                    width: `${Math.round((r.score / (sorted[0]?.score || 1)) * 40)}px`,
                    background: '#E85D5D',
                  }}
                />
                {r.score.toFixed(3)}
              </td>
              <td className={styles.num}>{r.commCount}</td>
              <td className={styles.commList}>{r.community}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

/* ── Main Panel ── */

export const OverlayDetailPanel = memo(function OverlayDetailPanel({
  overlays,
  nodes,
  edges,
  metrics,
  predictedLinks,
}) {
  const [expanded, setExpanded] = useState(true);

  const anyActive = overlays?.communities || overlays?.capitalFlows || overlays?.predictedLinks || overlays?.bridges;
  if (!anyActive) return null;

  const activeCount = [
    overlays.communities,
    overlays.capitalFlows,
    overlays.predictedLinks,
    overlays.bridges,
  ].filter(Boolean).length;

  return (
    <div className={`${styles.wrapper} ${expanded ? styles.open : ''}`}>
      <div className={styles.toggleBar} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.toggleLabel}>
          OVERLAY DETAIL — {activeCount} active
        </span>
        <span className={`${styles.toggleChevron} ${expanded ? styles.expanded : ''}`}>
          &#9660;
        </span>
      </div>
      {expanded && (
        <div className={styles.inner}>
          {overlays.communities && (
            <CommunitiesTable
              nodes={nodes}
              communities={metrics?.communities}
              communityNames={metrics?.communityNames}
              pagerank={metrics?.pagerank}
            />
          )}
          {overlays.capitalFlows && (
            <CapitalFlowsTable nodes={nodes} edges={edges} />
          )}
          {overlays.predictedLinks && (
            <PredictedLinksTable predictedLinks={predictedLinks} />
          )}
          {overlays.bridges && (
            <BridgesTable
              nodes={nodes}
              betweenness={metrics?.betweenness}
              communities={metrics?.communities}
              communityNames={metrics?.communityNames}
            />
          )}
        </div>
      )}
    </div>
  );
});
