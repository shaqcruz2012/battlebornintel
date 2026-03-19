import { memo, forwardRef } from 'react';
import styles from './GalaxyView.module.css';

// ── Text sanitizer for tooltip HTML ──────────────────────────────────────────

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Extract dollar amount from note ──────────────────────────────────────────

const DOLLAR_RE = /\$[\d,.]+[BMK]?/i;
function extractAmount(note) {
  if (!note) return null;
  const m = note.match(DOLLAR_RE);
  return m ? m[0] : null;
}

// ── Skip generic edge notes ─────────────────────────────────────────────────

const GENERIC_NOTE_RE = /^(FundNV|BBV|1864|AngelNV|Sierra)\s*(investment|portfolio)/i;
function isGenericNote(note) {
  return !note || GENERIC_NOTE_RE.test(note);
}

// ── HUD Status Bar (ref-forwarded for imperative cam dist updates) ───────────

export const GalaxyHudBar = memo(forwardRef(function GalaxyHudBar(
  { nodeCount, linkCount, clusterCount, camDist },
  ref
) {
  return (
    <div className={styles.hud} ref={ref}>
      <div className={styles.hudLeft}>
        <span className={styles.hudTitle}>GALAXY VIEW</span>
        <span className={styles.hudStatus}>
          <span className={styles.hudDot} />
          MISSION STATUS: NOMINAL
        </span>
      </div>
      <div className={styles.hudCenter}>
        <div className={styles.hudMetric}>
          <span className={styles.hudMetricValue}>{nodeCount}</span>
          <span className={styles.hudMetricLabel}>NODES</span>
        </div>
        <div className={styles.hudMetric}>
          <span className={styles.hudMetricValue}>{linkCount}</span>
          <span className={styles.hudMetricLabel}>EDGES</span>
        </div>
        <div className={styles.hudMetric}>
          <span className={styles.hudMetricValue}>{clusterCount}</span>
          <span className={styles.hudMetricLabel}>CLUSTERS</span>
        </div>
        <div className={styles.hudMetric}>
          <span className={styles.hudMetricValue} data-hud="dist">{camDist}</span>
          <span className={styles.hudMetricLabel}>CAM DIST</span>
        </div>
      </div>
    </div>
  );
}));

// ── Compass (refs for imperative arrow/distance updates) ─────────────────────

export const GalaxyCompass = memo(function GalaxyCompass({ arrowRef, distRef }) {
  return (
    <div className={styles.compass}>
      <div className={styles.compassRing}>
        <span className={`${styles.compassCardinal} ${styles.compassN}`}>N</span>
        <span className={`${styles.compassCardinal} ${styles.compassS}`}>S</span>
        <span className={`${styles.compassCardinal} ${styles.compassE}`}>E</span>
        <span className={`${styles.compassCardinal} ${styles.compassW}`}>W</span>
        <div ref={arrowRef} className={styles.compassArrow}>
          <div className={styles.compassArrowTip} />
        </div>
        <div className={styles.compassCenter} />
      </div>
      <div ref={distRef} className={styles.compassDist}>CORE 600</div>
    </div>
  );
});

// ── Detail Panel with Edge Intelligence ──────────────────────────────────────

export const GalaxyDetailPanel = memo(function GalaxyDetailPanel({ detail, onClose }) {
  if (!detail) return null;

  // Group neighbors by relationship type
  const grouped = {};
  for (const n of detail.neighbors) {
    const key = n.rel || 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  }

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <span className={styles.detailName} style={{ color: detail.node.color }}>
          {detail.node.label}
        </span>
        <button className={styles.detailClose} onClick={onClose}>{'\u2715'}</button>
      </div>
      <div className={styles.detailType}>{detail.node.type}</div>
      {detail.node.funding > 0 && (
        <div className={styles.detailMeta}>${detail.node.funding}M raised</div>
      )}
      {detail.node.city && (
        <div className={styles.detailMeta}>{detail.node.city}</div>
      )}

      <div className={styles.detailEdges}>
        <div className={styles.detailEdgesTitle}>
          {detail.neighbors.length} CONNECTION{detail.neighbors.length !== 1 ? 'S' : ''}
        </div>

        {Object.entries(grouped).map(([rel, edges]) => (
          <div key={rel} className={styles.edgeGroup}>
            <div className={styles.edgeGroupHeader}>
              {rel.replace(/_/g, ' ').toUpperCase()}
              <span className={styles.edgeGroupCount}>{edges.length}</span>
            </div>
            {edges.slice(0, 12).map((n, i) => {
              const amount = extractAmount(n.note);
              const desc = isGenericNote(n.note) ? null
                : (n.note.length > 40 ? n.note.slice(0, 37) + '...' : n.note);
              return (
                <div key={i} className={styles.edgeIntelRow}>
                  <div className={styles.edgeIntelMain}>
                    <span className={styles.detailEdgeDot} style={{ background: n.node.color }} />
                    <span className={styles.edgeIntelName}>{n.node.label}</span>
                    {amount && <span className={styles.edgeIntelAmount}>{amount}</span>}
                    {n.year && <span className={styles.edgeIntelYear}>{n.year}</span>}
                    {desc && <span className={styles.edgeIntelDesc}>{desc}</span>}
                    {n.source_url && (
                      <a
                        href={n.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.edgeInfoUrl}
                      >
                        {'\u2197'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {edges.length > 12 && (
              <div className={styles.detailMore}>+{edges.length - 12} more</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Export sanitizer for use in GalaxyView tooltip HTML
export { esc };
