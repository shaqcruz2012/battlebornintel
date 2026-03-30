import { useMemo } from 'react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const TIERS = [
  { max: 33, label: 'LOW',      duration: '6s',   opacity: 0.08, glow: '8px' },
  { max: 66, label: 'MODERATE', duration: '4s',   opacity: 0.15, glow: '15px' },
  { max: 100, label: 'HIGH',    duration: '2.5s', opacity: 0.3,  glow: '25px' },
];

function tierFor(score) {
  return TIERS.find(t => score <= t.max) || TIERS[2];
}

/**
 * Computes an ecosystem velocity score (0-100) from three data sources.
 * Returns { score, tier, cssVars } for driving the Pulse Mode animation.
 *
 * @param {Object} params
 * @param {Array}  params.activities  - Recent stakeholder activities (up to 20)
 * @param {Array}  params.sectorStats - Sector heat objects ({ heat: number })
 * @param {Object} params.kpis        - KPI object with innovationIndex.value
 */
export function useEcosystemVelocity({ activities, sectorStats, kpis }) {
  return useMemo(() => {
    // Activity recency: what fraction of recent activities are from the last 7 days
    const now = Date.now();
    const recentCount = (activities || []).filter(a => {
      const date = new Date(a.activity_date || a.date || a.created_at);
      return now - date.getTime() < SEVEN_DAYS_MS;
    }).length;
    const activityRecency = Math.min(100, (recentCount / 10) * 100);

    // Average sector heat (already 0-100 per sector)
    const heats = (sectorStats || []).map(s => s.heat || 0);
    const avgSectorHeat = heats.length > 0
      ? heats.reduce((sum, h) => sum + h, 0) / heats.length
      : 0;

    // Innovation index (already 0-100)
    const innovationIndex = kpis?.innovationIndex?.value || 0;

    // Composite velocity
    const raw = (activityRecency * 0.5) + (avgSectorHeat * 0.3) + (innovationIndex * 0.2);
    const score = Math.round(Math.min(100, Math.max(0, raw)));

    const tier = tierFor(score);

    return {
      score,
      tier: tier.label,
      cssVars: {
        '--pulse-duration': tier.duration,
        '--pulse-opacity': String(tier.opacity),
        '--pulse-color': `rgba(69, 215, 198, ${tier.opacity})`,
        '--pulse-glow-radius': tier.glow,
      },
    };
  }, [activities, sectorStats, kpis]);
}
