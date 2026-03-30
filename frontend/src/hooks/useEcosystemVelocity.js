import { useMemo } from 'react';

/**
 * Compute an ecosystem velocity score (0-100) from activity recency,
 * sector heat, and innovation index. Returns the score, a tier label,
 * and CSS custom-property values for driving the pulse animation.
 *
 * Tiers:
 *   LOW      (0-33)  : 6s cycle, 0.08 opacity, 8px glow
 *   MODERATE (34-66) : 4s cycle, 0.12 opacity, 12px glow
 *   HIGH     (67-100): 2.5s cycle, 0.18 opacity, 18px glow
 */

const TIERS = {
  LOW:      { label: 'LOW',      duration: '6s',   opacity: '0.2',  glow: '8px'  },
  MODERATE: { label: 'MODERATE', duration: '4s',   opacity: '0.35', glow: '14px' },
  HIGH:     { label: 'HIGH',     duration: '2.5s', opacity: '0.5',  glow: '22px' },
};

function tierFor(score) {
  if (score >= 67) return TIERS.HIGH;
  if (score >= 34) return TIERS.MODERATE;
  return TIERS.LOW;
}

function recencyScore(activities) {
  if (!activities?.length) return 0;
  const now = Date.now();
  const DAY = 86_400_000;
  let score = 0;
  const cap = Math.min(activities.length, 20);
  for (let i = 0; i < cap; i++) {
    const age = now - new Date(activities[i].event_date || activities[i].date || 0).getTime();
    if (age < DAY)       score += 5;
    else if (age < 7  * DAY) score += 3;
    else if (age < 30 * DAY) score += 1;
  }
  return Math.min(score, 100);
}

function sectorHeatScore(sectorStats) {
  if (!sectorStats?.length) return 0;
  const avg = sectorStats.reduce((s, sec) => s + (sec.heat || sec.avg_momentum || 0), 0) / sectorStats.length;
  return Math.min(Math.round(avg), 100);
}

export function useEcosystemVelocity({ activities, sectorStats, kpis } = {}) {
  return useMemo(() => {
    const r = recencyScore(activities);
    const h = sectorHeatScore(sectorStats);
    const innov = kpis?.innovationIndex?.value ?? 50;

    // Weighted blend: 40% recency, 30% sector heat, 30% innovation
    const velocity = Math.round(r * 0.4 + h * 0.3 + innov * 0.3);
    const clamped = Math.max(0, Math.min(100, velocity));
    const tier = tierFor(clamped);

    return {
      velocity: clamped,
      tier: tier.label,
      cssVars: {
        '--pulse-duration': tier.duration,
        '--pulse-opacity': tier.opacity,
        '--pulse-glow':    tier.glow,
      },
    };
  }, [activities, sectorStats, kpis]);
}
