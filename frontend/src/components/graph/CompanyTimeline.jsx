import { useState, useEffect } from 'react';
import { STAGE_COLORS } from '../../data/constants';
import styles from './CompanyTimeline.module.css';

const API_BASE = '';

const STAGE_LABELS = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c_plus: 'Series C+',
  growth: 'Growth',
};

function confidenceColor(c) {
  if (c >= 0.8) return '#4ADE80';
  if (c >= 0.6) return '#FACC15';
  return '#F87171';
}

const EVIDENCE_LABELS = {
  timeline_event: 'Event',
  funding_round: 'Funding',
  inferred: 'Inferred',
};

export function CompanyTimeline({ companyId, companyName }) {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/graph/stage-transitions/${companyId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load transitions (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setTransitions(Array.isArray(data) ? data : data.transitions || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{companyName || 'Company'} Timeline</div>
        <div className={styles.empty}>Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{companyName || 'Company'} Timeline</div>
        <div className={styles.empty}>{error}</div>
      </div>
    );
  }

  if (transitions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.title}>{companyName || 'Company'} Timeline</div>
        <div className={styles.empty}>No stage transitions recorded</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{companyName || 'Company'} Timeline</div>
      <div className={styles.timeline}>
        {transitions.map((t, i) => {
          const year = t.transition_year || (t.transition_date ? t.transition_date.slice(0, 4) : '—');
          const conf = typeof t.confidence === 'number' ? t.confidence : null;
          const evLabel = EVIDENCE_LABELS[t.evidence_type] || t.evidence_type || 'Unknown';

          return (
            <div className={styles.event} key={i}>
              <div
                className={styles.dot}
                style={{ background: STAGE_COLORS[t.to_stage] || 'var(--accent-teal)' }}
              />
              <div className={styles.card}>
                <div className={styles.year}>{year}</div>
                <div className={styles.stages}>
                  <span
                    className={styles.stageBadge}
                    style={{ background: `${STAGE_COLORS[t.from_stage] || '#5B6170'}22`, color: STAGE_COLORS[t.from_stage] || '#5B6170' }}
                  >
                    {STAGE_LABELS[t.from_stage] || t.from_stage}
                  </span>
                  <span className={styles.arrow}>&rarr;</span>
                  <span
                    className={styles.stageBadge}
                    style={{ background: `${STAGE_COLORS[t.to_stage] || '#5B6170'}22`, color: STAGE_COLORS[t.to_stage] || '#5B6170' }}
                  >
                    {STAGE_LABELS[t.to_stage] || t.to_stage}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span className={styles.evidenceBadge}>{evLabel}</span>
                  {conf !== null && (
                    <div className={styles.confidenceBar}>
                      <div
                        className={styles.confidenceFill}
                        style={{ width: `${Math.round(conf * 100)}%`, background: confidenceColor(conf) }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
