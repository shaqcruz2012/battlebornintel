/**
 * Risk Signal Engine — institutional-grade risk intelligence.
 *
 * Pure computation module (no DB access). Takes pre-fetched data and
 * produces structured risk signals with composite portfolio scoring.
 *
 * Inspired by Palantir Foundry ontology-driven alerting,
 * Bloomberg ALRT<GO>, and Sequoia/a16z portfolio monitoring.
 */

const SEVERITY = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };

// SSBCI program parameters
const SSBCI_PROGRAM_START = new Date('2023-06-01');  // NV SSBCI program start
const SSBCI_DEPLOYMENT_WINDOW_DAYS = 365 * 4;       // 4-year deployment window

// ── Signal Generators ────────────────────────────────────────────────────────

function detectMomentumDecay(companies) {
  const signals = [];
  for (const c of companies) {
    if (c.prev_irs == null || c.irs_score == null) continue;
    const delta = c.irs_score - c.prev_irs;
    if (delta >= -9) continue;

    const severity = delta <= -20 ? SEVERITY.CRITICAL
      : delta <= -15 ? SEVERITY.HIGH
      : SEVERITY.MEDIUM;

    signals.push({
      id: `momentum_decay_${c.id}`,
      signal_type: 'momentum_decay',
      severity,
      title: `Momentum Decay: ${c.name}`,
      description: `IRS score declined ${Math.abs(delta)} points (${c.prev_irs} → ${c.irs_score}). ${
        severity === SEVERITY.CRITICAL ? 'Rapid deterioration requires immediate portfolio review.'
        : 'Trending below scoring thresholds — monitor closely.'
      }`,
      affected_entities: [{ id: c.id, name: c.name, type: 'company' }],
      metric_value: delta,
      threshold: -10,
      recommendation: `Review ${c.name}'s recent activity, funding pipeline, and team changes. Consider direct engagement.`,
    });
  }
  return signals;
}

function detectCapitalConcentration(companies) {
  const signals = [];
  const sectorFunding = {};
  let totalFunding = 0;

  for (const c of companies) {
    const funding = parseFloat(c.funding_m) || 0;
    totalFunding += funding;
    for (const sector of (c.sectors || [])) {
      sectorFunding[sector] = (sectorFunding[sector] || 0) + funding;
    }
  }

  if (totalFunding === 0) return signals;

  // Herfindahl-Hirschman Index
  let hhi = 0;
  const topSectors = [];
  for (const [sector, funding] of Object.entries(sectorFunding)) {
    const share = funding / totalFunding;
    hhi += share * share * 10000;
    topSectors.push({ sector, share, funding });
  }
  topSectors.sort((a, b) => b.share - a.share);

  const severity = hhi > 2500 ? SEVERITY.CRITICAL
    : hhi > 1500 ? SEVERITY.HIGH
    : hhi > 1000 ? SEVERITY.MEDIUM
    : null;

  if (severity) {
    const top3 = topSectors.slice(0, 3).map(s =>
      `${s.sector} (${(s.share * 100).toFixed(1)}%)`
    ).join(', ');

    signals.push({
      id: 'capital_concentration_sector',
      signal_type: 'capital_concentration',
      severity,
      title: 'Sector Capital Concentration',
      description: `HHI of ${Math.round(hhi)} indicates ${
        hhi > 2500 ? 'highly concentrated' : 'moderately concentrated'
      } capital allocation. Top sectors: ${top3}.`,
      affected_entities: topSectors.slice(0, 3).map(s => ({
        id: s.sector, name: s.sector, type: 'sector',
      })),
      metric_value: Math.round(hhi),
      threshold: 1500,
      recommendation: 'Evaluate diversification strategy. Consider pipeline development in underrepresented sectors.',
    });
  }

  return signals;
}

function detectSsbciCompliance(funds) {
  const signals = [];
  const ssbciFunds = funds.filter(f =>
    f.fund_type === 'SSBCI' || f.fund_type === 'ssbci'
  );
  if (ssbciFunds.length === 0) return signals;

  const now = new Date();
  const daysSinceStart = (now - SSBCI_PROGRAM_START) / (1000 * 60 * 60 * 24);
  const daysRemaining = Math.max(0, SSBCI_DEPLOYMENT_WINDOW_DAYS - daysSinceStart);

  let totalAllocated = 0;
  let totalDeployed = 0;
  for (const f of ssbciFunds) {
    totalAllocated += parseFloat(f.allocated_m) || 0;
    totalDeployed += parseFloat(f.deployed_m) || 0;
  }

  if (totalAllocated === 0) return signals;

  const deploymentRate = totalDeployed / totalAllocated;
  const deploymentPct = Math.round(deploymentRate * 100);

  const severity =
    (deploymentRate < 0.5 && daysRemaining < 365) ? SEVERITY.CRITICAL
    : (deploymentRate < 0.6 && daysRemaining < 540) ? SEVERITY.HIGH
    : (deploymentRate < 0.5) ? SEVERITY.MEDIUM
    : null;

  if (severity) {
    signals.push({
      id: 'ssbci_compliance_clock',
      signal_type: 'ssbci_compliance',
      severity,
      title: 'SSBCI Deployment Clock',
      description: `${deploymentPct}% deployed ($${totalDeployed.toFixed(1)}M of $${totalAllocated.toFixed(1)}M allocated). ${
        Math.round(daysRemaining)} days remaining in deployment window. ${
        severity === SEVERITY.CRITICAL ? 'Federal clawback risk is elevated.'
        : 'Deployment velocity needs acceleration.'
      }`,
      affected_entities: ssbciFunds.map(f => ({
        id: f.id, name: f.name, type: 'fund',
      })),
      metric_value: deploymentPct,
      threshold: 50,
      recommendation: `Accelerate deployment pipeline. ${
        Math.round((totalAllocated - totalDeployed) / Math.max(1, daysRemaining / 30))
      }M/month deployment rate needed to meet target.`,
    });
  }

  return signals;
}

function detectNetworkFragility(graphMetrics, edgeCounts) {
  const signals = [];
  if (!graphMetrics || graphMetrics.length === 0) return signals;

  const edgeMap = {};
  for (const ec of (edgeCounts || [])) {
    edgeMap[ec.node_id] = parseInt(ec.edge_count) || 0;
  }

  for (const node of graphMetrics) {
    const betweenness = node.betweenness || 0;
    const degree = edgeMap[node.node_id] || 0;

    if (betweenness <= 60 || degree > 3) continue;

    const severity = betweenness > 80 ? SEVERITY.CRITICAL : SEVERITY.HIGH;

    signals.push({
      id: `network_fragility_${node.node_id}`,
      signal_type: 'network_fragility',
      severity,
      title: `Network Fragility: ${node.node_id}`,
      description: `High betweenness centrality (${betweenness}) with only ${degree} connections. ` +
        `This node is a structural single point of failure in the ecosystem graph.`,
      affected_entities: [{ id: node.node_id, name: node.node_id, type: 'node' }],
      metric_value: betweenness,
      threshold: 60,
      recommendation: 'Strengthen alternative pathways. Identify and develop parallel connections to reduce structural dependency.',
    });
  }
  return signals;
}

function detectStaleIntelligence(companies) {
  const signals = [];
  const now = new Date();

  const stale = [];
  for (const c of companies) {
    if (!c.last_event_date) {
      stale.push({ ...c, daysSince: 999 });
      continue;
    }
    const lastEvent = new Date(c.last_event_date);
    const daysSince = Math.floor((now - lastEvent) / (1000 * 60 * 60 * 24));
    if (daysSince >= 90) {
      stale.push({ ...c, daysSince });
    }
  }

  if (stale.length === 0) return signals;

  const critical = stale.filter(c => c.daysSince >= 180);
  const high = stale.filter(c => c.daysSince >= 120 && c.daysSince < 180);
  const medium = stale.filter(c => c.daysSince >= 90 && c.daysSince < 120);

  for (const [group, severity] of [[critical, SEVERITY.CRITICAL], [high, SEVERITY.HIGH], [medium, SEVERITY.MEDIUM]]) {
    if (group.length === 0) continue;

    const names = group.slice(0, 5).map(c => c.name).join(', ');
    const extra = group.length > 5 ? ` +${group.length - 5} more` : '';

    signals.push({
      id: `stale_intelligence_${severity}`,
      signal_type: 'stale_intelligence',
      severity,
      title: `Stale Intelligence: ${group.length} Blind Spot${group.length > 1 ? 's' : ''}`,
      description: `${group.length} compan${group.length > 1 ? 'ies have' : 'y has'} no activity data in ${
        severity === SEVERITY.CRITICAL ? '180+' : severity === SEVERITY.HIGH ? '120-180' : '90-120'
      } days: ${names}${extra}.`,
      affected_entities: group.map(c => ({ id: c.id, name: c.name, type: 'company' })),
      metric_value: group.length,
      threshold: 1,
      recommendation: 'Prioritize intelligence collection for these companies. Check Crunchbase, LinkedIn, and state filings.',
    });
  }

  return signals;
}

function detectInvestorFlight(companies, funds) {
  const signals = [];

  for (const fund of funds) {
    const portfolio = companies.filter(c =>
      (c.eligible || []).includes(fund.id)
    );
    if (portfolio.length < 3) continue;

    const declining = portfolio.filter(c => (c.momentum || 0) < 30);
    const pct = declining.length / portfolio.length;

    const severity = pct >= 0.5 ? SEVERITY.CRITICAL
      : pct >= 0.33 ? SEVERITY.HIGH
      : pct >= 0.25 ? SEVERITY.MEDIUM
      : null;

    if (severity) {
      signals.push({
        id: `investor_flight_${fund.id}`,
        signal_type: 'investor_flight',
        severity,
        title: `Portfolio Risk: ${fund.name}`,
        description: `${declining.length} of ${portfolio.length} portfolio companies (${Math.round(pct * 100)}%) ` +
          `have momentum below 30. ${severity === SEVERITY.CRITICAL
            ? 'Majority of portfolio in distress.'
            : 'Significant portion of portfolio underperforming.'}`,
        affected_entities: [
          { id: fund.id, name: fund.name, type: 'fund' },
          ...declining.slice(0, 5).map(c => ({ id: c.id, name: c.name, type: 'company' })),
        ],
        metric_value: Math.round(pct * 100),
        threshold: 25,
        recommendation: `Review ${fund.name}'s portfolio allocation. Identify common factors among declining companies.`,
      });
    }
  }

  return signals;
}

function detectSectorContagion(companies) {
  const signals = [];
  const sectorMap = {};

  for (const c of companies) {
    for (const sector of (c.sectors || [])) {
      if (!sectorMap[sector]) sectorMap[sector] = [];
      sectorMap[sector].push(c);
    }
  }

  for (const [sector, cos] of Object.entries(sectorMap)) {
    if (cos.length < 3) continue;

    const decelerating = cos.filter(c => (c.momentum || 0) < 40);
    const pct = decelerating.length / cos.length;

    const severity = pct >= 0.6 ? SEVERITY.CRITICAL
      : pct >= 0.4 ? SEVERITY.HIGH
      : pct >= 0.3 ? SEVERITY.MEDIUM
      : null;

    if (severity) {
      signals.push({
        id: `sector_contagion_${sector.replace(/\s+/g, '_').toLowerCase()}`,
        signal_type: 'sector_contagion',
        severity,
        title: `Sector Contagion: ${sector}`,
        description: `${decelerating.length} of ${cos.length} companies (${Math.round(pct * 100)}%) ` +
          `in ${sector} have momentum below 40. ${
            severity === SEVERITY.CRITICAL ? 'Systemic sector-wide deceleration detected.'
            : 'Broad sector weakness developing.'
          }`,
        affected_entities: decelerating.slice(0, 5).map(c => ({
          id: c.id, name: c.name, type: 'company',
        })),
        metric_value: Math.round(pct * 100),
        threshold: 30,
        recommendation: `Investigate macro factors affecting ${sector}. Assess whether weakness is cyclical or structural.`,
      });
    }
  }

  return signals;
}

// ── Ecosystem Velocity ──────────────────────────────────────────────────────

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function detectEcosystemVelocity(events) {
  const signals = [];
  if (!events || events.length === 0) return signals;

  const thisMonth = events.filter(e => daysSince(e.event_date) <= 30).length;
  const lastMonth = events.filter(e => daysSince(e.event_date) > 30 && daysSince(e.event_date) <= 60).length;
  const twoMonthsAgo = events.filter(e => daysSince(e.event_date) > 60 && daysSince(e.event_date) <= 90).length;

  const velocity = thisMonth - lastMonth;
  const acceleration = velocity - (lastMonth - twoMonthsAgo);

  if (acceleration < -5) {
    signals.push({
      id: 'ecosystem_deceleration',
      signal_type: 'ecosystem_velocity',
      severity: acceleration < -10 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
      title: 'Ecosystem Activity Decelerating',
      description: `Activity dropped from ${twoMonthsAgo} to ${lastMonth} to ${thisMonth} events/month. Acceleration: ${acceleration}.`,
      metric_value: acceleration,
      threshold: -5,
      recommendation: 'Investigate root cause of declining activity. Check if data collection has gaps or if ecosystem is genuinely slowing.',
    });
  }

  return signals;
}

// ── Stage Pipeline Health ───────────────────────────────────────────────────

function detectStagePipelineHealth(stageTransitions, stalledCompanies) {
  const signals = [];

  const transitionCount = (stageTransitions || []).length;
  const stalledCount = (stalledCompanies || []).length;

  if (stalledCount >= 5) {
    const severity = stalledCount >= 20 ? SEVERITY.CRITICAL
      : stalledCount >= 10 ? SEVERITY.HIGH
      : SEVERITY.MEDIUM;

    const names = stalledCompanies.slice(0, 5).map(c => c.label).join(', ');
    const extra = stalledCount > 5 ? ` +${stalledCount - 5} more` : '';

    signals.push({
      id: 'stage_pipeline_stalled',
      signal_type: 'stage_pipeline_health',
      severity,
      title: `Pipeline Stall: ${stalledCount} Companies Without Progress`,
      description: `${stalledCount} companies have had no stage changes in 2+ years: ${names}${extra}. ` +
        `Only ${transitionCount} stage transitions occurred in the last 6 months.`,
      affected_entities: stalledCompanies.slice(0, 10).map(c => ({
        id: c.canonical_id, name: c.label, type: 'company',
      })),
      metric_value: stalledCount,
      threshold: 5,
      recommendation: 'Review stalled companies for signs of quiet failure or data gaps. Consider targeted outreach to assess current status.',
    });
  }

  if (transitionCount === 0) {
    signals.push({
      id: 'stage_pipeline_frozen',
      signal_type: 'stage_pipeline_health',
      severity: SEVERITY.HIGH,
      title: 'Stage Pipeline Frozen',
      description: 'Zero stage transitions detected in the last 6 months. Companies are not advancing through the funding pipeline.',
      metric_value: 0,
      threshold: 1,
      recommendation: 'Investigate whether stage data is being collected. Check if accelerator programs and fund deployments are being tracked.',
    });
  }

  return signals;
}

// ── Funding Gap ─────────────────────────────────────────────────────────────

function detectFundingGap(companies, funds) {
  const signals = [];

  // Group companies by stage
  const stageCompanies = {};
  for (const c of companies) {
    const stage = (c.stage || 'unknown').toLowerCase();
    if (!stageCompanies[stage]) stageCompanies[stage] = [];
    stageCompanies[stage].push(c);
  }

  // Determine fund coverage by stage (match fund_type to company stage)
  const stageFundMap = {};
  for (const f of funds) {
    const fType = (f.fund_type || f.stage_focus || '').toLowerCase();
    if (!stageFundMap[fType]) stageFundMap[fType] = [];
    stageFundMap[fType].push(f);
  }

  // Check each stage for funding gaps
  const stageAliases = {
    'seed': ['seed', 'pre-seed', 'pre_seed'],
    'series_a': ['series_a', 'series a'],
    'series_b': ['series_b', 'series b'],
    'series_c': ['series_c', 'series c', 'growth'],
  };

  for (const [stageKey, aliases] of Object.entries(stageAliases)) {
    let companyCount = 0;
    for (const alias of aliases) {
      companyCount += (stageCompanies[alias] || []).length;
    }
    if (companyCount < 3) continue;

    let investorCount = 0;
    for (const alias of aliases) {
      investorCount += (stageFundMap[alias] || []).length;
    }

    if (companyCount > 10 && investorCount < 2) {
      signals.push({
        id: `funding_gap_${stageKey}`,
        signal_type: 'funding_gap',
        severity: investorCount === 0 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
        title: `Funding Gap: ${stageKey.replace(/_/g, ' ')} Stage`,
        description: `${companyCount} companies at ${stageKey.replace(/_/g, ' ')} stage but only ${investorCount} ` +
          `fund${investorCount !== 1 ? 's' : ''} target this stage. Companies may lack viable funding pathways.`,
        metric_value: companyCount,
        threshold: 10,
        recommendation: `Recruit investors focused on ${stageKey.replace(/_/g, ' ')} stage. Consider fund-of-funds or syndication strategies to fill the gap.`,
      });
    } else if (companyCount >= 5 && investorCount === 0) {
      signals.push({
        id: `funding_gap_${stageKey}`,
        signal_type: 'funding_gap',
        severity: SEVERITY.MEDIUM,
        title: `Funding Gap: ${stageKey.replace(/_/g, ' ')} Stage`,
        description: `${companyCount} companies at ${stageKey.replace(/_/g, ' ')} stage with zero dedicated fund coverage.`,
        metric_value: companyCount,
        threshold: 5,
        recommendation: `Identify and attract investors for the ${stageKey.replace(/_/g, ' ')} stage to support pipeline progression.`,
      });
    }
  }

  return signals;
}

// ── Composite Score ──────────────────────────────────────────────────────────

function computePortfolioRiskScore(signals, hhi) {
  let score = 0;
  let criticalPts = 0, highPts = 0, mediumPts = 0, lowPts = 0;

  for (const s of signals) {
    switch (s.severity) {
      case SEVERITY.CRITICAL:
        criticalPts += 25;
        break;
      case SEVERITY.HIGH:
        highPts += 12;
        break;
      case SEVERITY.MEDIUM:
        mediumPts += 5;
        break;
      case SEVERITY.LOW:
        lowPts += 2;
        break;
    }
  }

  score += Math.min(criticalPts, 40);
  score += Math.min(highPts, 30);
  score += Math.min(mediumPts, 20);
  score += Math.min(lowPts, 10);

  // HHI base component
  if (hhi) score += Math.min(hhi / 100, 15);

  return Math.min(Math.round(score), 100);
}

function riskGrade(score) {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'ELEVATED';
  if (score >= 25) return 'MODERATE';
  return 'LOW';
}

// ── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Compute all risk signals from pre-fetched data.
 *
 * @param {Object} data
 * @param {Array} data.companies - Companies with IRS scores, prev scores, event freshness
 * @param {Array} data.funds - Fund allocation/deployment data
 * @param {Array} data.graph_metrics - Node-level PageRank/betweenness
 * @param {Array} data.edge_counts - Edge degree per node
 * @param {Array} data.events - Recent events with event_date for velocity analysis
 * @param {Array} data.stage_transitions - Stage change records from entity_state_history
 * @param {Array} data.stalled_companies - Companies with no state changes in 2+ years
 * @returns {{ portfolioRiskScore: number, riskGrade: string, signalCounts: Object, signals: Array }}
 */
export function computeRiskSignals({
  companies = [], funds = [], graph_metrics = [], edge_counts = [],
  events = [], stage_transitions = [], stalled_companies = [],
}) {
  const signals = [
    ...detectMomentumDecay(companies),
    ...detectCapitalConcentration(companies),
    ...detectSsbciCompliance(funds),
    ...detectNetworkFragility(graph_metrics, edge_counts),
    ...detectStaleIntelligence(companies),
    ...detectInvestorFlight(companies, funds),
    ...detectSectorContagion(companies),
    ...detectEcosystemVelocity(events),
    ...detectStagePipelineHealth(stage_transitions, stalled_companies),
    ...detectFundingGap(companies, funds),
  ];

  // Sort by severity priority
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  signals.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  // Count by severity
  const signalCounts = { critical: 0, high: 0, medium: 0, low: 0, total: signals.length };
  for (const s of signals) {
    signalCounts[s.severity] = (signalCounts[s.severity] || 0) + 1;
  }

  // Extract HHI for composite score
  const hhiSignal = signals.find(s => s.signal_type === 'capital_concentration');
  const hhi = hhiSignal ? hhiSignal.metric_value : 0;

  const portfolioRiskScore = computePortfolioRiskScore(signals, hhi);

  return {
    portfolioRiskScore,
    riskGrade: riskGrade(portfolioRiskScore),
    signalCounts,
    signals,
  };
}
