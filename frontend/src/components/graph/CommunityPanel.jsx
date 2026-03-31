import { useMemo, useState, useCallback } from 'react';
import { NODE_CFG } from '../../data/constants';
import { COMM_COLORS } from '../../data/constants';
import styles from './CommunityPanel.module.css';

const COMMUNITY_PALETTE = COMM_COLORS;

function CommunityCard({ communityId, members, color, pagerank, onSelectNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  const topMembers = useMemo(() => {
    return [...members]
      .sort((a, b) => (pagerank?.[b.id] ?? 0) - (pagerank?.[a.id] ?? 0))
      .slice(0, 5);
  }, [members, pagerank]);

  const sectorBreakdown = useMemo(() => {
    const counts = {};
    members.forEach((n) => {
      if (n.type === 'company' && n.sectors) {
        const secs = Array.isArray(n.sectors) ? n.sectors : [n.sectors];
        secs.forEach((s) => {
          counts[s] = (counts[s] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [members]);

  return (
    <div className={styles.communityCard}>
      <div className={styles.cardHeader} onClick={toggle}>
        <div className={styles.cardHeaderLeft}>
          <span className={styles.colorSwatch} style={{ background: color }} />
          <span className={styles.communityLabel}>Community {communityId}</span>
          <span className={styles.memberCount}>{members.length}</span>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
          &#x25BE;
        </span>
      </div>
      {open && (
        <div className={styles.cardBody}>
          {topMembers.map((node) => {
            const cfg = NODE_CFG[node.type] || {};
            const pr = pagerank?.[node.id];
            return (
              <div
                key={node.id}
                className={styles.memberRow}
                onClick={() => onSelectNode?.(node.id)}
              >
                <span className={styles.typeIcon} style={{ color: cfg.color }}>
                  {cfg.icon}
                </span>
                <span className={styles.memberName}>{node.label}</span>
                {pr !== undefined && (
                  <span className={styles.prValue}>{pr.toFixed(4)}</span>
                )}
              </div>
            );
          })}
          {members.length > 5 && (
            <div className={styles.moreCount}>+{members.length - 5} more</div>
          )}
          {sectorBreakdown.length > 0 && (
            <div className={styles.sectorBreakdown}>
              {sectorBreakdown.map(([sector, count]) => (
                <span key={sector} className={styles.sectorBadge}>
                  {sector} <strong>{count}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CommunityPanel({ communities, layout, metrics, onSelectNode, colorMode }) {
  const communityEntries = useMemo(() => {
    if (!communities || typeof communities !== 'object') return [];
    return Object.entries(communities)
      .map(([id, members]) => ({ id, members }))
      .sort((a, b) => b.members.length - a.members.length);
  }, [communities]);

  const totalNodes = useMemo(
    () => communityEntries.reduce((sum, c) => sum + c.members.length, 0),
    [communityEntries]
  );

  if (communityEntries.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>No communities detected</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Communities</span>
        <span className={styles.headerStats}>
          {communityEntries.length} clusters &middot; {totalNodes} nodes
        </span>
      </div>
      <div className={styles.list}>
        {communityEntries.map((entry, idx) => (
          <CommunityCard
            key={entry.id}
            communityId={entry.id}
            members={entry.members}
            color={COMMUNITY_PALETTE[idx % COMMUNITY_PALETTE.length]}
            pagerank={metrics?.pagerank}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </div>
  );
}
