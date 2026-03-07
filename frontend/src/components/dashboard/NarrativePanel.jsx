import { useMemo } from 'react';
import { Card } from '../shared/Card';
import { SHEAT } from '../../data/constants';
import { FUNDS } from '../../data/funds';
import styles from './NarrativePanel.module.css';

function deriveNarrative(companies) {
  const cs = companies;
  if (!cs.length) return [];

  // MIT REAP: Inputs -> Capacities -> Outputs -> Impact
  const totalFunding = cs.reduce((s, c) => s + (c.funding || 0), 0);
  const totalEmployees = cs.reduce((s, c) => s + (c.employees || 0), 0);
  const avgMomentum = Math.round(
    cs.reduce((s, c) => s + (c.momentum || 0), 0) / cs.length
  );
  const topMomentum = cs
    .filter((c) => c.momentum >= 80)
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3);

  const hotSectors = {};
  cs.forEach((c) =>
    (c.sector || []).forEach((s) => {
      if ((SHEAT[s] || 0) >= 80)
        hotSectors[s] = (hotSectors[s] || 0) + 1;
    })
  );
  const topSectors = Object.entries(hotSectors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const ssbciFunds = FUNDS.filter((f) => f.type === 'SSBCI');
  const deployedPct = ssbciFunds.length
    ? Math.round(
        (ssbciFunds.reduce((s, f) => s + f.deployed, 0) /
          ssbciFunds.reduce((s, f) => s + f.allocated, 0)) *
          100
      )
    : 0;

  return [
    {
      dimension: 'Inputs',
      icon: '→',
      color: 'var(--accent-teal)',
      text: `$${totalFunding.toFixed(0)}M deployed across ${cs.length} companies. SSBCI funds ${deployedPct}% deployed.`,
    },
    {
      dimension: 'Capacities',
      icon: '⊕',
      color: 'var(--accent-gold)',
      text: `${totalEmployees.toLocaleString()} ecosystem employees. Top sectors: ${topSectors.map(([s]) => s).join(', ') || 'N/A'}.`,
    },
    {
      dimension: 'Outputs',
      icon: '◈',
      color: '#9B72CF',
      text: `Avg momentum ${avgMomentum}/100. Leaders: ${topMomentum.map((c) => c.name).join(', ') || 'N/A'}.`,
    },
    {
      dimension: 'Impact',
      icon: '★',
      color: 'var(--status-success)',
      text: `${cs.filter((c) => (c.employees || 0) >= 50).length} companies with 50+ employees driving regional economic impact.`,
    },
  ];
}

export function NarrativePanel({ companies }) {
  const narrative = useMemo(() => deriveNarrative(companies), [companies]);

  return (
    <div className={styles.panel}>
      <Card>
        <div className={styles.sectionTitle}>This Week's Narrative</div>
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
