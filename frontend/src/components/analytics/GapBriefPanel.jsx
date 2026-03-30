import { useEffect, useRef, useCallback } from 'react';
import { generateGapBrief } from './gapBriefGenerator';
import styles from './GapBriefPanel.module.css';

/* ── Type badge class map ────────────────────────────────────────────── */

const BADGE_CLASS = {
  framework: styles.typeBadgeFramework,
  bridge: styles.typeBadgeBridge,
  island: styles.typeBadgeIsland,
  missing: styles.typeBadgeMissing,
};

const BADGE_LABEL = {
  framework: 'Framework Gap',
  bridge: 'Bridge Node',
  island: 'Isolated Community',
  missing: 'Missing Connection',
};

/* ── GapBriefPanel ───────────────────────────────────────────────────── */

export function GapBriefPanel({ gap, type, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      /* Focus trap — Tab cycles within the panel */
      if (e.key === 'Tab') {
        const focusable = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const brief = generateGapBrief(gap, type);

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-label={`Gap brief: ${brief.title}`}
      >
        {/* Header row */}
        <div className={styles.headerRow}>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close brief panel"
          >
            X CLOSE
          </button>
          <span className={BADGE_CLASS[type] || styles.typeBadge}>
            {BADGE_LABEL[type] || type}
          </span>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <h2 className={styles.briefTitle}>{brief.title}</h2>
          <hr className={styles.divider} />

          {/* What This Is */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>What This Is</span>
            <p className={styles.sectionText}>{brief.whatItIs}</p>
          </div>

          {/* Why It Matters */}
          {brief.whyItMatters && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Why It Matters</span>
              <p className={styles.sectionText}>{brief.whyItMatters}</p>
            </div>
          )}

          {/* Suggested Actions */}
          {brief.suggestedActions.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Suggested Actions</span>
              <ul className={styles.actionList}>
                {brief.suggestedActions.map((action, i) => (
                  <li key={i} className={styles.actionItem}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Entities */}
          {brief.relatedEntities.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Related Entities</span>
              <div className={styles.entityChips}>
                {brief.relatedEntities.map((entity, i) => (
                  <span key={i} className={styles.entityChip} title={entity}>
                    {entity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
