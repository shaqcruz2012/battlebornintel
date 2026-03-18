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
 * Then for each potential investor, builds an aggregate portfolio profile from
 * their portfolio companies' features and computes cosine similarity.
 */

import pool from '../db/pool.js';

/* ── Feature dimensions ── */

const STAGES = ['seed', 'series_a', 'series_b', 'growth', 'pre_seed', 'pre_ipo', 'public'];
const FUNDING_BUCKETS = ['0-1M', '1-5M', '5-20M', '20-50M', '50M+'];

function fundingBucket(fundingM) {
  if (fundingM == null || fundingM <= 0) return '0-1M';
  if (fundingM <= 1) return '0-1M';
  if (fundingM <= 5) return '1-5M';
  if (fundingM <= 20) return '5-20M';
  if (fundingM <= 50) return '20-50M';
  return '50M+';
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

  return features;
}

/**
 * Build an aggregate portfolio profile from multiple company feature vectors.
 * Values are averaged across the portfolio (normalized).
 */
function buildPortfolioProfile(companyFeatures) {
  if (companyFeatures.length === 0) return new Map();

  const profile = new Map();
  const n = companyFeatures.length;

  for (const featureMap of companyFeatures) {
    for (const [dim, val] of featureMap) {
      profile.set(dim, (profile.get(dim) || 0) + val);
    }
  }

  // Normalize by portfolio size
  for (const [dim, val] of profile) {
    profile.set(dim, val / n);
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
 * Generate human-readable reasoning for a match.
 */
function generateReasoning(companyFeatures, portfolioProfile, portfolioCompanies, targetCompany) {
  const reasons = [];

  // Count sector overlaps
  const companySectors = (targetCompany.sectors || []);
  let sectorMatches = 0;
  const matchedSectors = [];
  for (const s of companySectors) {
    const profileVal = portfolioProfile.get(`sector:${s}`) || 0;
    if (profileVal > 0.1) {
      sectorMatches++;
      matchedSectors.push(s);
    }
  }
  if (sectorMatches > 0) {
    const sectorNames = matchedSectors.slice(0, 3).join(', ');
    const portfolioCount = Math.round(sectorMatches * portfolioCompanies.length);
    reasons.push(`${Math.min(portfolioCount, portfolioCompanies.length)} portfolio compan${portfolioCount === 1 ? 'y' : 'ies'} in ${sectorNames}`);
  }

  // Region overlap
  if (targetCompany.region) {
    const regionVal = portfolioProfile.get(`region:${targetCompany.region}`) || 0;
    if (regionVal > 0.1) {
      const regionCount = Math.round(regionVal * portfolioCompanies.length);
      reasons.push(`${regionCount} in same region`);
    }
  }

  // Stage focus
  if (targetCompany.stage) {
    const stageVal = portfolioProfile.get(`stage:${targetCompany.stage}`) || 0;
    if (stageVal > 0.15) {
      reasons.push(`similar stage focus`);
    }
  }

  // Funding range match
  const bucket = fundingBucket(parseFloat(targetCompany.funding_m));
  const bucketVal = portfolioProfile.get(`funding:${bucket}`) || 0;
  if (bucketVal > 0.15) {
    reasons.push(`similar funding range`);
  }

  return reasons.length > 0 ? reasons.join(', ') : 'general portfolio alignment';
}

/**
 * Find investor matches for a given company.
 *
 * @param {number|string} companyId — numeric company ID (without prefix)
 * @param {Object} opts
 * @param {number} [opts.limit=20] — max results
 * @returns {Promise<{company, matches}>}
 */
export async function findInvestorMatches(companyId, { limit = 20 } = {}) {
  const numericId = parseInt(companyId, 10);

  // 1. Get target company
  const companyResult = await pool.query(
    `SELECT id, name, stage, sectors, region, funding_m, city
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
    `SELECT id, name, stage, sectors, region, funding_m FROM companies`
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

  const targetFeatures = companyFeaturesMap.get(targetNodeId);
  if (!targetFeatures) return null;

  // 3. Get all invested_in edges to identify investors and their portfolios
  const edgesResult = await pool.query(
    `SELECT source_id, target_id, note FROM graph_edges WHERE rel = 'invested_in'`
  );

  // Build investor -> portfolio companies map
  // Investors are sources of invested_in edges
  const investorPortfolios = new Map(); // investorId -> Set of companyNodeIds
  const investorEdgeNotes = new Map();  // investorId -> Map of companyNodeId -> note

  for (const e of edgesResult.rows) {
    const investorId = e.source_id;
    const companyNodeId = e.target_id;

    if (!investorPortfolios.has(investorId)) {
      investorPortfolios.set(investorId, new Set());
      investorEdgeNotes.set(investorId, new Map());
    }
    investorPortfolios.get(investorId).add(companyNodeId);
    if (e.note) investorEdgeNotes.get(investorId).set(companyNodeId, e.note);
  }

  // 4. Get investor details from multiple tables
  // Investors can be: funds (f_ prefix), externals (x_, i_, u_, v_ prefix), graph_funds
  const investorIds = [...investorPortfolios.keys()];
  const fundInvestorIds = investorIds.filter(id => id.startsWith('f_')).map(id => id.slice(2));
  const externalInvestorIds = investorIds.filter(id =>
    id.startsWith('x_') || id.startsWith('i_') || id.startsWith('u_') || id.startsWith('v_')
  );

  // Fetch fund and external details in parallel
  const [fundDetailsResult, externalDetailsResult] = await Promise.all([
    fundInvestorIds.length > 0
      ? pool.query(`SELECT id, name, fund_type FROM graph_funds WHERE id = ANY($1::int[])`, [fundInvestorIds])
      : { rows: [] },
    externalInvestorIds.length > 0
      ? pool.query(`SELECT id, name, entity_type FROM externals WHERE id = ANY($1::text[])`, [externalInvestorIds])
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

  // 5. Compute similarity for each investor
  const matches = [];

  for (const [investorId, portfolioCompanyIds] of investorPortfolios) {
    // Skip if this investor already invested in the target company
    if (portfolioCompanyIds.has(targetNodeId)) continue;

    // Skip if we have no info about this investor
    const info = investorInfo.get(investorId);
    if (!info) continue;

    // Build portfolio profile from the investor's portfolio companies
    const portfolioFeatures = [];
    const portfolioCompanyNames = [];
    for (const cId of portfolioCompanyIds) {
      const features = companyFeaturesMap.get(cId);
      if (features) {
        portfolioFeatures.push(features);
        const comp = allCompanies.find(c => `c_${c.id}` === cId);
        if (comp) portfolioCompanyNames.push(comp.name);
      }
    }

    // Need at least 1 portfolio company with features to compute similarity
    if (portfolioFeatures.length === 0) continue;

    const portfolioProfile = buildPortfolioProfile(portfolioFeatures);
    const similarity = cosineSimilarity(targetFeatures, portfolioProfile);

    // Filter to similarity > 0.3
    if (similarity <= 0.3) continue;

    // Find companies in common ecosystem (portfolio companies in same sectors/region)
    const targetSectors = new Set(targetCompany.sectors || []);
    const overlap = [];
    for (const cId of portfolioCompanyIds) {
      const comp = allCompanies.find(c => `c_${c.id}` === cId);
      if (!comp) continue;
      const compSectors = new Set(comp.sectors || []);
      const hasCommonSector = [...targetSectors].some(s => compSectors.has(s));
      const sameRegion = comp.region === targetCompany.region;
      if (hasCommonSector || sameRegion) {
        overlap.push(comp.name);
      }
    }

    const reasoning = generateReasoning(
      targetFeatures, portfolioProfile, portfolioCompanyNames, targetCompany
    );

    matches.push({
      investorId,
      investorName: info.name,
      investorType: info.subtype || info.type,
      similarity: Math.round(similarity * 100) / 100,
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
