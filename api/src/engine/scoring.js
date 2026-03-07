/**
 * IRS (Investment Rating Score) — pure computation.
 * Accepts constants as parameters instead of importing static data.
 */

export function computeIRS(company, sectorHeat, stageNorms) {
  const m = Math.min(company.momentum || 0, 100);
  const fv = Math.min(
    ((company.funding || 0) / (stageNorms[company.stage] || 3)) * 50,
    100
  );
  const sScores = (company.sector || []).map((s) => sectorHeat[s] || 50);
  const sh = sScores.length ? Math.max(...sScores) : 50;
  const hs =
    company.employees >= 100 ? 80
    : company.employees >= 30 ? 60
    : company.employees >= 15 ? 45
    : company.employees >= 5 ? 25
    : 10;
  const ns = Math.min(
    (company.eligible?.length || 0) * 15 + (company.employees > 0 ? 15 : 0),
    100
  );
  const ts = Math.min(
    30 + (company.employees > 10 ? 25 : 0) + (company.eligible?.length || 0) * 10,
    100
  );
  const dq = Math.min(
    60 + (company.description ? 20 : 0) + ((company.eligible?.length || 0) > 0 ? 20 : 0),
    100
  );

  const irs = Math.round(
    m * 0.20 + fv * 0.15 + sh * 0.10 + hs * 0.12 +
    dq * 0.08 + ns * 0.08 + ts * 0.15 + 50 * 0.12
  );

  const grade =
    irs >= 85 ? 'A'
    : irs >= 78 ? 'A-'
    : irs >= 72 ? 'B+'
    : irs >= 65 ? 'B'
    : irs >= 58 ? 'B-'
    : irs >= 50 ? 'C+'
    : irs >= 42 ? 'C'
    : 'D';

  const triggers = [];
  if (fv >= 75) triggers.push('rapid_funding');
  if (sh >= 85) triggers.push('hot_sector');
  if ((company.eligible || []).some((e) => ['bbv', 'fundnv', '1864'].includes(e)))
    triggers.push('ssbci_eligible');
  if (hs >= 50) triggers.push('hiring_surge');
  if (m >= 80) triggers.push('high_momentum');
  if ((company.eligible || []).includes('sbir')) triggers.push('grant_validated');

  return {
    irs,
    grade,
    triggers,
    dims: {
      momentum: m,
      funding_velocity: Math.round(fv),
      market_timing: sh,
      hiring: hs,
      data_quality: dq,
      network: ns,
      team: ts,
    },
  };
}
