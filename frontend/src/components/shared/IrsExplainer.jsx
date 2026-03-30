import { useState, useRef, useEffect, memo } from 'react';
import styles from './IrsExplainer.module.css';

const DIMENSIONS = [
  { key: 'momentum', label: 'Momentum', weight: '20%', desc: 'Company growth velocity based on recent activity and market traction' },
  { key: 'funding_velocity', label: 'Funding Velocity', weight: '15%', desc: 'Funding raised relative to stage benchmarks' },
  { key: 'team', label: 'Team Strength', weight: '15%', desc: 'Team size, growth rate, and leadership indicators' },
  { key: 'hiring', label: 'Hiring Signal', weight: '12%', desc: 'Active hiring and workforce expansion patterns' },
  { key: 'market_timing', label: 'Market Timing', weight: '10%', desc: 'How hot the company\'s sector is right now' },
  { key: 'data_quality', label: 'Data Quality', weight: '8%', desc: 'Completeness and verifiability of company data' },
  { key: 'network', label: 'Network Access', weight: '8%', desc: 'Connections to funds, accelerators, and ecosystem orgs' },
  { key: 'base_score', label: 'Base Score', weight: '12%', desc: 'Confidence floor ensuring minimum visibility' },
];

function dimBarColor(val) {
  if (val >= 70) return 'var(--accent-teal, #2DD4BF)';
  if (val >= 40) return 'var(--accent-gold, #FACC15)';
  return 'var(--status-risk, #EF4444)';
}

export const IrsExplainer = memo(function IrsExplainer({ dims, children }) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <span className={styles.container}>
      <span
        ref={triggerRef}
        className={styles.trigger}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); } }}
        aria-expanded={open}
        aria-label="Explain IRS dimensions"
      >
        {children}
      </span>

      {open && (
        <div ref={popoverRef} className={styles.popover} onClick={(e) => e.stopPropagation()}>
          <div className={styles.popoverTitle}>IRS Dimensions</div>
          <table className={styles.dimTable}>
            <thead>
              <tr>
                <th className={styles.dimTh}>Dimension</th>
                <th className={styles.dimTh}>Wt</th>
                {dims && <th className={styles.dimTh}>Score</th>}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => {
                const val = dims ? dims[d.key] : null;
                return (
                  <tr key={d.key} className={styles.dimRow}>
                    <td className={styles.dimCell}>
                      <span className={styles.dimLabel}>{d.label}</span>
                      <span className={styles.dimDesc}>{d.desc}</span>
                    </td>
                    <td className={styles.dimCellWeight}>{d.weight}</td>
                    {dims && (
                      <td className={styles.dimCellScore}>
                        {val != null ? (
                          <span className={styles.scoreWrap}>
                            <span className={styles.scoreNum}>{Math.round(val)}</span>
                            <span className={styles.miniBar}>
                              <span
                                className={styles.miniFill}
                                style={{
                                  width: `${Math.min(Math.max(val, 0), 100)}%`,
                                  background: dimBarColor(val),
                                }}
                              />
                            </span>
                          </span>
                        ) : (
                          <span className={styles.noData}>&mdash;</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </span>
  );
});
