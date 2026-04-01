/**
 * Investor Matching Engine
 *
 * Neighborhood-based cosine similarity on the graph.
 * No ML/embeddings — uses structural features as the "embedding".
 *
 * For a given company, builds a feature vector from:
 *   1. Sector overlap — which sectors the company operates in
 *   2. Stage — seed/series_a/series_b/growth
 *   3. Region — las_vegas/reno/henderson/etc
 *   4. Existing investor neighborhood — which funds/investors already connected
 *   5. Funding amount bucket — 0-1M, 1-5M, 5-20M, 20-50M, 50M+
 *
 * Enhanced with:
 *   - Temporal recency weighting (exponential decay on investment age)
 *   - Deal-size weighting (log-scaled conviction signal)
 *   - Momentum fit (portfolio momentum alignment)
 *   - Stage preference learning (investor stage distribution)
 *
 * Then for each potential investor, builds an aggregate portfolio profile from
 * their portfolio companies' features and computes cosine similarity.
 */

import pool from '../db/pool.js';

/* ── Feature dimensions ── */

const STAGES = ['seed', 'series_a', 'series_b', 'growth', 'pre_seed', 'pre_ipo', 'public'];
const FUNDING_BUCKETS = ['0-1M', '1-5M', '5-20M', '20-50M', '50M+'];

// Exponential decay constant — ~2.3 year half-life (ln(2)/0.3)
const RECENCY_LAMBDA = 0.3;

function fundingBucket(fundingM) {
  if (fundingM == null || fundingM <= 0) return '0-1M';
  if (fundingM <= 1) return '0-1M';
  if (fundingM <= 5) return '1-5M';
  if (fundingM <= 20) return '5-20M';
  if (fundingM <= 50) return '20-50M';
  return '50M+';
}

/**
 * Parse a dollar amount from an edge note string.
 * Handles patterns like "$5M", "$2.5M", "$500K", "Series A $10M".
 * Returns amount in millions, or null if not found.
 */
function parseDealSize(note) {
  if (!note) return null;
  const match = note.match(/\$\s*([\d.]+)\s*(M|m|K|k|B|b)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;
  const unit = match[2].toUpperCase();
  if (unit === 'B') return num * 1000;
  if (unit === 'K') return num / 1000;
  return num; // millions
}

/**
 * Build a feature vector for a company.
 * Returns a Map<string, number> of dimension -> value.
 */
function buildCompanyFeatures(company, allSectors, allRegions) {
  const features = new Map();

  // Sector dimensions (binary)
  for (const s of allSectors) {
    const sectors = company.sectors || [];
    features.set(`sector:${s}`, sectors.includes(s) ? 1 : 0);
  }

  // Stage dimensions (one-hot)
  for (const st of STAGES) {
    features.set(`stage:${st}`, company.stage === st ? 1 : 0);
  }

  // Region dimensions (one-hot)
  for (const r of allRegions) {
    features.set(`region:${r}`, company.region === r ? 1 : 0);
  }

  // Funding bucket (one-hot)
  const bucket = fundingBucket(parseFloat(company.funding_m));
  for (const b of FUNDING_BUCKETS) {
    features.set(`funding:${b}`, b === bucket ? 1 : 0);
  }

  // Momentum dimension (normalized 0-1)
  const momentum = parseInt(company.momentum, 10);
  features.set('momentum', isNaN(momentum) ? 0.5 : momentum / 100);

  return features;
}

/**
 * Build an aggregate portfolio profile from multiple company feature vectors,
 * weighted by recency and deal-size signals.
 *
 * @param {Map[]} companyFeatures - Feature maps for each portfolio company
 * @param {number[]} weights - Per-company combined weights (recency * deal-size)
 * @returns {Map<string, number>} Weighted-average portfolio profile
 */
function buildPortfolioProfile(companyFeatures, weights) {
  if (companyFeatures.length === 0) return new Map();

  const profile = new Map();

  // If no weights provided, fall back to equal weighting
  const w = weights && weights.length === companyFeatures.length
    ? weights
    : companyFeatures.map(() => 1);

  const totalWeight = w.reduce((s, v) => s + v, 0);
  if (totalWeight === 0) return new Map();

  for (let i = 0; i < companyFeatures.length; i++) {
    const featureMap = companyFeatures[i];
    for (const [dim, val] of featureMap) {
      profile.set(dim, (profile.get(dim) || 0) + val * w[i]);
    }
  }

  // Normalize by total weight
  for (const [dim, val] of profile) {
    profile.set(dim, val / totalWeight);
  }

  return profile;
}

/**
 * Compute cosine similarity between two feature vectors (Maps).
 */
function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Collect all dimensions
  const allDims = new Set([...a.keys(), ...b.keys()]);

  for (const dim of allDims) {
    const va = a.get(dim) || 0;
    const vb = b.get(dim) || 0;
    dotProduct += va * vb;
    normA += va * va;
    normB += vb * vb;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute temporal recency weight using exponential decay.
 * @param {string|Date|null} dateVal - event_date, event_year, or created_at
 * @returns {number} Weight in (0, 1], where 1 = today
 */
function recencyWeight(dateVal) {
  if (!dateVal) return 0.5; // default for missing dates
  const ts = new Date(dateVal).getTime();
  if (isNaN(ts)) return 0.5;
  const yearsAgo = (Date.now() - ts) / (365.25 * 86400000);
  return Math.exp(-RECENCY_LAMBDA * Math.max(0, yearsAgo));
}

/**
 * Compute deal-size weight using log scaling.
 * @param {number|null} dealSizeM - Deal size in millions
 * @returns {number} Weight >= 1
 */
function dealSizeWeight(dealSizeM) {
  if (dealSizeM == null || dealSizeM <= 0) return 1;
  return Math.log(1 + dealSizeM);
}

/**
 * Learn stage preferences from an investor's portfolio.
 * Returns normalized probability distribution over stages.
 */
function learnStagePrefs(portfolioCompanies) {
  const counts = {};
  let total = 0;
  for (const c of portfolioCompanies) {
    if (c.stage) {
      counts[c.stage] = (counts[c.stage] || 0) + 1;
      total++;
    }
  }
  if (total === 0) return { prefs: {}, preferred: null };

  const prefs = {};
  let maxStage = null;
  let maxCount = 0;
  for (const [stage, count] of Object.entries(counts)) {
    prefs[stage] = count / total;
    if (count > maxCount) {
      maxCount = count;
      maxStage = stage;
    }
  }
  return { prefs, preferred: maxStage };
}

/**
 * Generate human-readable reasoning for a match.
 * Includes temporal context, deal-size info, momentum fit, and stage preference.
 */
function generateReasoning(
  portfolioProfile,
  portfolioCompanies,
  targetCompany,
  edgeMeta
) {
  const reasons = [];

  // Count sector overlaps
  const companySectors = (targetCompany.sectors || []);
  const matchedSectors = [];
  for (const s of companySectors) {
    const profileVal = portfolioProfile.get(`sector:${s}`) || 0;
    if (profileVal > 0.1) {
      matchedSectors.push(s);
    }
  }
  if (matchedSectors.length > 0) {
    const sectorNames = matchedSectors.slice(0, 3).join(', ');
    const portfolioCount = Math.round(
      matchedSectors.length * portfolioCompanies.length
    );
    const count = Math.min(portfolioCount, portfolioCompanies.length);

    // Add most-recent year if we have edge dates
    let recentSuffix = '';
    if (edgeMeta.mostRecentYear) {
      recentSuffix = ` (most recent: ${edgeMeta.mostRecentYear})`;
    }

    reasons.push(
      `${count} portfolio compan${count === 1 ? 'y' : 'ies'} in ${sectorNames}${recentSuffix}`
    );
  }

  // Average deal size
  if (edgeMeta.avgDealSizeM != null && edgeMeta.avgDealSizeM > 0) {
    const formatted = edgeMeta.avgDealSizeM >= 1
      ? `$${edgeMeta.avgDealSizeM.toFixed(1)}M`
      : `$${Math.round(edgeMeta.avgDealSizeM * 1000)}K`;
    reasons.push(`avg deal ${formatted}`);
  }

  // Stage preference
  if (edgeMeta.stagePrefs && edgeMeta.stagePrefs.preferred) {
    const pref = edgeMeta.stagePrefs.preferred.replace('_', ' ');
    const pct = Math.round(
      (edgeMeta.stagePrefs.prefs[edgeMeta.stagePrefs.preferred] || 0) * 100
    );
    if (pct >= 30) {
      const matchTag = targetCompany.stage === edgeMeta.stagePrefs.preferred
        ? 'matches target'
        : '';
      reasons.push(
        `strong ${pref} preference (${pct}%)${matchTag ? ' — ' + matchTag : ''}`
      );
    }
  }

  // Region overlap
  if (targetCompany.region) {
    const regionVal = portfolioProfile.get(`region:${targetCompany.region}`) || 0;
    if (regionVal > 0.1) {
      const regionCount = Math.round(regionVal * portfolioCompanies.length);
      reasons.push(`${regionCount} in same region`);
    }
  }

  // Momentum fit
  if (edgeMeta.momentumFit != null && edgeMeta.momentumFit > 0.7) {
    reasons.push('strong momentum alignment');
  }

  // Funding range match
  const bucket = fundingBucket(parseFloat(targetCompany.funding_m));
  const bucketVal = portfolioProfile.get(`funding:${bucket}`) || 0;
  if (bucketVal > 0.15) {
    reasons.push('similar funding range');
  }

  return reasons.length > 0 ? reasons.join(', ') : 'general portfolio alignment';
}

/**
 * Find investor matches for a given company using neighborhood-based
 * cosine similarity on structural graph features.
 *
 * Builds feature vectors from sector, stage, region, funding, and momentum
 * dimensions, then computes cosine similarity between the target company and
 * each investor's aggregate portfolio profile (weighted by temporal recency
 * and deal-size conviction).
 *
 * @param {number|string} companyId - Numeric company ID (without c_ prefix)
 * @param {Object} [opts]
 * @param {number} [opts.limit=20] - Maximum number of matches to return
 * @returns {Promise<{ company: Object, matches: Array<{ investorId: string, investorName: string, similarity: number, reasoning: string }> } | null>}
 */
export async function findInvestorMatches(companyId, { limit = 20 } = {}) {
  const numericId = parseInt(companyId, 10);

  // 1. Get target company
  const companyResult = await pool.query(
    `SELECT id, name, stage, sectors, region, funding_m, city, momentum
     FROM companies WHERE id = $1`,
    [numericId]
  );

  if (companyResult.rows.length === 0) {
    return null;
  }

  const targetCompany = companyResult.rows[0];
  const targetNodeId = `c_${targetCompany.id}`;

  // 2. Get all companies for sector/region universe
  const allCompaniesResult = await pool.query(
    `SELECT id, name, stage, sectors, region, funding_m, momentum FROM companies`
  );
  const allCompanies = allCompaniesResult.rows;

  // Build universe of sectors and regions
  const allSectors = new Set();
  const allRegions = new Set();
  for (const c of allCompanies) {
    for (const s of (c.sectors || [])) allSectors.add(s);
    if (c.region) allRegions.add(c.region);
  }
  const sectorArr = [...allSectors];
  const regionArr = [...allRegions];

  // Build feature vectors for all companies (indexed by c_<id>)
  const companyFeaturesMap = new Map();
  for (const c of allCompanies) {
    companyFeaturesMap.set(`c_${c.id}`, buildCompanyFeatures(c, sectorArr, regionArr));
  }

  // Build company lookup by node ID for quick access
  const companyByNodeId = new Map();
  for (const c of allCompanies) {
    companyByNodeId.set(`c_${c.id}`, c);
  }

  const targetFeatures = companyFeaturesMap.get(targetNodeId);
  if (!targetFeatures) return null;

  // 3. Get all invested_in edges with temporal data
  const edgesResult = await pool.query(
    `SELECT source_id, target_id, note, event_date, event_year, created_at
     FROM graph_edges WHERE rel = 'invested_in'
       AND (quarantined IS NULL OR quarantined = false)`
  );

  // Build investor -> portfolio companies map with edge metadata
  const investorPortfolios = new Map();  // investorId -> Set of companyNodeIds
  const investorEdges = new Map();       // investorId -> Map of companyNodeId -> edge data

  for (const e of edgesResult.rows) {
    const investorId = e.source_id;
    const companyNodeId = e.target_id;

    if (!investorPortfolios.has(investorId)) {
      investorPortfolios.set(investorId, new Set());
      investorEdges.set(investorId, new Map());
    }
    investorPortfolios.get(investorId).add(companyNodeId);
    investorEdges.get(investorId).set(companyNodeId, {
      note: e.note,
      event_date: e.event_date,
      event_year: e.event_year,
      created_at: e.created_at,
    });
  }

  // 4. Get investor details from multiple tables
  const investorIds = [...investorPortfolios.keys()];
  const fundInvestorIds = investorIds
    .filter(id => id.startsWith('f_'))
    .map(id => id.slice(2));
  const externalInvestorIds = investorIds.filter(id =>
    id.startsWith('x_') || id.startsWith('i_') || id.startsWith('u_') || id.startsWith('v_')
  );

  // Also fetch fund details for deal-size fallback (deployed_m / company_count)
  const [fundDetailsResult, externalDetailsResult, fundsResult] = await Promise.all([
    fundInvestorIds.length > 0
      ? pool.query(
          `SELECT id, name, fund_type FROM graph_funds WHERE id = ANY($1::text[])`,
          [fundInvestorIds]
        )
      : { rows: [] },
    externalInvestorIds.length > 0
      ? pool.query(
          `SELECT id, name, entity_type FROM externals WHERE id = ANY($1::text[])`,
          [externalInvestorIds]
        )
      : { rows: [] },
    fundInvestorIds.length > 0
      ? pool.query(
          `SELECT id, deployed_m, company_count FROM funds WHERE id = ANY($1::text[])`,
          [fundInvestorIds]
        )
      : { rows: [] },
  ]);

  // Build investor info lookup
  const investorInfo = new Map();
  for (const f of fundDetailsResult.rows) {
    investorInfo.set(`f_${f.id}`, { name: f.name, type: 'fund', subtype: f.fund_type });
  }
  for (const x of externalDetailsResult.rows) {
    investorInfo.set(x.id, { name: x.name, type: 'external', subtype: x.entity_type });
  }

  // Build fund financial lookup for deal-size fallback
  const fundFinancials = new Map();
  for (const f of fundsResult.rows) {
    const deployedM = parseFloat(f.deployed_m) || 0;
    const count = parseInt(f.company_count, 10) || 1;
    fundFinancials.set(`f_${f.id}`, { deployed_m: deployedM, company_count: count });
  }

  // Target company momentum (normalized 0-1)
  const targetMomentum = parseInt(targetCompany.momentum, 10);
  const targetMomNorm = isNaN(targetMomentum) ? 0.5 : targetMomentum / 100;

  // 5. Compute similarity for each investor
  const matches = [];

  for (const [investorId, portfolioCompanyIds] of investorPortfolios) {
    // Skip if this investor already invested in the target company
    if (portfolioCompanyIds.has(targetNodeId)) continue;

    // Skip if we have no info about this investor
    const info = investorInfo.get(investorId);
    if (!info) continue;

    // Build portfolio profile with temporal and deal-size weighting
    const portfolioFeatures = [];
    const portfolioWeights = [];
    const portfolioCompanyObjs = [];
    const portfolioCompanyNames = [];
    const dealSizes = [];
    let mostRecentYear = null;

    const edges = investorEdges.get(investorId);
    const fin = fundFinancials.get(investorId);
    const fallbackDealSize = fin
      ? fin.deployed_m / fin.company_count
      : null;

    for (const cId of portfolioCompanyIds) {
      const features = companyFeaturesMap.get(cId);
      if (!features) continue;

      const comp = companyByNodeId.get(cId);
      if (!comp) continue;

      const edge = edges.get(cId) || {};

      // Temporal recency weight
      const dateVal = edge.event_date || (edge.event_year ? `${edge.event_year}-01-01` : null) || edge.created_at;
      const rWeight = recencyWeight(dateVal);

      // Deal-size weight
      const dealSize = parseDealSize(edge.note) || fallbackDealSize;
      const dWeight = dealSizeWeight(dealSize);

      // Combined weight
      portfolioFeatures.push(features);
      portfolioWeights.push(rWeight * dWeight);
      portfolioCompanyObjs.push(comp);
      portfolioCompanyNames.push(comp.name);

      if (dealSize != null && dealSize > 0) dealSizes.push(dealSize);

      // Track most recent investment year
      const year = edge.event_date
        ? new Date(edge.event_date).getFullYear()
        : edge.event_year || null;
      if (year && (mostRecentYear == null || year > mostRecentYear)) {
        mostRecentYear = year;
      }
    }

    // Need at least 1 portfolio company with features
    if (portfolioFeatures.length === 0) continue;

    const portfolioProfile = buildPortfolioProfile(portfolioFeatures, portfolioWeights);
    const similarity = cosineSimilarity(targetFeatures, portfolioProfile);

    // Stage preference learning
    const stagePrefs = learnStagePrefs(portfolioCompanyObjs);
    const stageBonus = (targetCompany.stage && stagePrefs.prefs[targetCompany.stage])
      ? stagePrefs.prefs[targetCompany.stage] * 0.1
      : 0;

    // Momentum fit: how close is target momentum to portfolio avg momentum?
    const avgPortfolioMomentum = portfolioProfile.get('momentum') || 0.5;
    const momentumFit = 1 - Math.abs(targetMomNorm - avgPortfolioMomentum);
    const momentumBonus = momentumFit * 0.05;

    // Final score: cosine similarity enhanced with stage and momentum bonuses
    const finalScore = Math.min(1, similarity + stageBonus + momentumBonus);

    // Filter to score > 0.3
    if (finalScore <= 0.3) continue;

    // Compute average deal size for reasoning
    const avgDealSizeM = dealSizes.length > 0
      ? dealSizes.reduce((s, v) => s + v, 0) / dealSizes.length
      : null;

    // Find companies in common ecosystem (portfolio companies in same sectors/region)
    const targetSectors = new Set(targetCompany.sectors || []);
    const overlap = [];
    for (const cId of portfolioCompanyIds) {
      const comp = companyByNodeId.get(cId);
      if (!comp) continue;
      const compSectors = new Set(comp.sectors || []);
      const hasCommonSector = [...targetSectors].some(s => compSectors.has(s));
      const sameRegion = comp.region === targetCompany.region;
      if (hasCommonSector || sameRegion) {
        overlap.push(comp.name);
      }
    }

    const reasoning = generateReasoning(
      portfolioProfile,
      portfolioCompanyNames,
      targetCompany,
      { mostRecentYear, avgDealSizeM, stagePrefs, momentumFit }
    );

    matches.push({
      investorId,
      investorName: info.name,
      investorType: info.subtype || info.type,
      similarity: Math.round(finalScore * 100) / 100,
      reasoning,
      portfolioOverlap: overlap.slice(0, 5),
      portfolioSize: portfolioCompanyIds.size,
    });
  }

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  return {
    company: {
      id: targetCompany.id,
      name: targetCompany.name,
      stage: targetCompany.stage,
      sectors: targetCompany.sectors || [],
      region: targetCompany.region,
      funding: parseFloat(targetCompany.funding_m),
    },
    matches: matches.slice(0, limit),
  };
}
