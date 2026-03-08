import { useMemo } from 'react';
import { Card } from '../shared/Card';
import { useWeeklyBrief } from '../../api/hooks';
import styles from './NarrativePanel.module.css';

function deriveNarrative(companies, funds = []) {
  const cs = companies;
  if (!cs.length) return [];

  const totalFunding = cs.reduce((s, c) => s + (c.funding || 0), 0);
  const totalEmployees = cs.reduce((s, c) => s + (c.employees || 0), 0);
  const avgMomentum = Math.round(
    cs.reduce((s, c) => s + (c.momentum || 0), 0) / cs.length
  );
  const topMomentum = cs
    .filter((c) => c.momentum >= 80)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3);

  const ssbciFunds = funds.filter((f) => f.type === 'SSBCI');
  const deployedPct = ssbciFunds.length
    ? Math.round(
        (ssbciFunds.reduce((s, f) => s + (f.deployed || 0), 0) /
          ssbciFunds.reduce((s, f) => s + (f.allocated || 0), 0)) *
          100
      )
    : 0;

  return [
    {
      dimension: 'Inputs',
      icon: '\u2192',
      color: 'var(--accent-teal)',
      text: `$${totalFunding.toFixed(0)}M deployed across ${cs.length} companies. SSBCI funds ${deployedPct}% deployed.`,
    },
    {
      dimension: 'Capacities',
      icon: '\u2295',
      color: 'var(--accent-gold)',
      text: `${totalEmployees.toLocaleString()} ecosystem employees.`,
    },
    {
      dimension: 'Outputs',
      icon: '\u25C8',
      color: '#9B72CF',
      text: `Avg momentum ${avgMomentum}/100. Leaders: ${topMomentum.map((c) => c.name).join(', ') || 'N/A'}.`,
    },
    {
      dimension: 'Impact',
      icon: '\u2605',
      color: 'var(--status-success)',
      text: `${cs.filter((c) => (c.employees || 0) >= 50).length} companies with 50+ employees driving regional economic impact.`,
    },
  ];
}

function briefToNarrative(brief) {
  if (!brief) return null;
  const dims = [];
  if (brief.inputs) {
    dims.push({
      dimension: 'Inputs',
      icon: '\u2192',
      color: 'var(--accent-teal)',
      text: brief.inputs.summary || '',
    });
  }
  if (brief.capacities) {
    dims.push({
      dimension: 'Capacities',
      icon: '\u2295',
      color: 'var(--accent-gold)',
      text: brief.capacities.summary || '',
    });
  }
  if (brief.outputs) {
    dims.push({
      dimension: 'Outputs',
      icon: '\u25C8',
      color: '#9B72CF',
      text: brief.outputs.summary || '',
    });
  }
  if (brief.impact) {
    dims.push({
      dimension: 'Impact',
      icon: '\u2605',
      color: 'var(--status-success)',
      text: brief.impact.summary || '',
    });
  }
  return dims.length > 0 ? dims : null;
}

export function NarrativePanel({ companies, funds = [] }) {
  const { data: briefResponse } = useWeeklyBrief();
  const briefData = briefResponse?.data;

  const aiNarrative = useMemo(() => briefToNarrative(briefData), [briefData]);
  const fallbackNarrative = useMemo(
    () => deriveNarrative(companies, funds),
    [companies, funds]
  );

  const narrative = aiNarrative || fallbackNarrative;
  const isAI = !!aiNarrative;

  return (
    <div className={styles.panel}>
      <Card>
        <div className={styles.sectionTitle}>
          This Week's Narrative
          {isAI && <span className={styles.aiBadge}>AI</span>}
        </div>
        {isAI && briefData?.headline && (
          <div className={styles.headline}>{briefData.headline}</div>
        )}
        <div className={styles.dimList}>
          {narrative.map((n) => (
            <div key={n.dimension} className={styles.dimItem}>
              <div
                className={styles.dimIcon}
                style={{ background: `${n.color}20`, color: n.color }}
              >
                {n.icon}
              </div>
              <div className={styles.dimText}>
                <span className={styles.dimName}>{n.dimension}</span>
                <span className={styles.dimDesc}>{n.text}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
