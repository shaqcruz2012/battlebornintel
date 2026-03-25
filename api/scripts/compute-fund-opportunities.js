/**
 * compute-fund-opportunities.js
 *
 * Computes scored fund_opportunity edges between funds and companies
 * based on multi-factor matching (stage, sector, region, funding, momentum).
 *
 * Usage: node scripts/compute-fund-opportunities.js
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5433', 10),
  user: process.env.PGUSER || 'bbi',
  password: process.env.PGPASSWORD || 'bbi_dev_password',
  database: process.env.PGDATABASE || 'battlebornintel',
});

// ── Fund criteria definitions ──────────────────────────────────────────────

const FUND_CRITERIA = {
  bbv: {
    stages: ['pre_seed', 'seed', 'series_a', 'series_b'],
    sectors: null, // null = all sectors
    regions: ['las_vegas', 'reno', 'henderson'],
    funding_range: [0, 50],
  },
  fundnv: {
    stages: ['pre_seed', 'seed'],
    sectors: null,
    regions: ['las_vegas', 'reno', 'henderson'],
    funding_range: [0, 2],
  },
  '1864': {
    stages: ['pre_seed', 'seed'],
    sectors: null,
    regions: ['las_vegas', 'reno', 'henderson'],
    funding_range: [0, 5],
  },
  startupnv: {
    stages: ['pre_seed', 'seed', 'series_a'],
    sectors: null,
    regions: ['las_vegas', 'reno', 'henderson'],
    funding_range: [0, 10],
  },
  angelnv: {
    stages: ['pre_seed', 'seed'],
    sectors: null,
    regions: ['las_vegas', 'henderson'],
    funding_range: [0, 3],
  },
  sierra: {
    stages: ['pre_seed', 'seed'],
    sectors: null,
    regions: ['reno'],
    funding_range: [0, 3],
  },
  dcvc: {
    stages: ['series_a', 'series_b', 'series_c_plus'],
    sectors: ['Cleantech', 'Energy', 'Manufacturing', 'DeepTech', 'Defense', 'AI'],
    regions: null, // null = all regions
    funding_range: [5, 500],
  },
  stripes: {
    stages: ['series_b', 'series_c_plus', 'growth'],
    sectors: ['SaaS', 'Consumer', 'Fintech', 'AI'],
    regions: null,
    funding_range: [20, 1000],
  },
};

// ── Scoring weights ────────────────────────────────────────────────────────

const WEIGHTS = {
  stage_match: 0.30,
  sector_match: 0.25,
  region_match: 0.15,
  funding_match: 0.15,
  momentum_match: 0.15,
};

// ── Scoring functions ──────────────────────────────────────────────────────

function computeStageMatch(companyStage, fundStages) {
  if (!companyStage || !fundStages || fundStages.length === 0) return 0;
  if (fundStages.includes(companyStage)) return 1.0;

  // Adjacent stage gets partial credit
  const stageOrder = ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c_plus', 'growth', 'public'];
  const compIdx = stageOrder.indexOf(companyStage);
  const fundIndices = fundStages.map(s => stageOrder.indexOf(s)).filter(i => i >= 0);

  if (compIdx < 0 || fundIndices.length === 0) return 0;

  const minDist = Math.min(...fundIndices.map(fi => Math.abs(fi - compIdx)));
  if (minDist === 1) return 0.5;
  if (minDist === 2) return 0.2;
  return 0;
}

function computeSectorMatch(companySectors, fundSectors) {
  // null fundSectors means all sectors match
  if (!fundSectors) return 0.8;
  if (!companySectors || companySectors.length === 0) return 0.2;

  const compLower = companySectors.map(s => s.toLowerCase());
  const fundLower = fundSectors.map(s => s.toLowerCase());

  const overlapCount = compLower.filter(s => fundLower.some(f => s.includes(f) || f.includes(s))).length;
  if (overlapCount === 0) return 0;

  // Ratio of overlap to company sectors, capped at 1.0
  return Math.min(1.0, overlapCount / Math.min(companySectors.length, fundSectors.length));
}

function computeRegionMatch(companyRegion, fundRegions) {
  // null fundRegions means all regions match
  if (!fundRegions) return 0.7;
  if (!companyRegion) return 0.1;

  if (fundRegions.includes(companyRegion)) return 1.0;

  // Nevada but different region still gets partial credit
  if (companyRegion !== 'other') return 0.3;
  return 0;
}

function computeFundingMatch(companyFundingM, fundRange) {
  if (companyFundingM == null || !fundRange) return 0.5;

  const funding = parseFloat(companyFundingM);
  const [minM, maxM] = fundRange;

  if (funding >= minM && funding <= maxM) return 1.0;

  // Slightly above range: decreasing score
  if (funding > maxM) {
    const overageRatio = (funding - maxM) / maxM;
    if (overageRatio < 0.5) return 0.6;
    if (overageRatio < 1.0) return 0.3;
    return 0.1;
  }

  // Below range (company might not have raised enough yet)
  return 0.7;
}

function computeMomentumMatch(momentum) {
  if (momentum == null) return 0.5;
  // Normalize 0-100 to 0-1
  return Math.min(1.0, momentum / 100);
}

function computeMatchingScore(company, fundId) {
  const criteria = FUND_CRITERIA[fundId];
  if (!criteria) return null;

  const scores = {
    stage_match: computeStageMatch(company.stage, criteria.stages),
    sector_match: computeSectorMatch(company.sectors, criteria.sectors),
    region_match: computeRegionMatch(company.region, criteria.regions),
    funding_match: computeFundingMatch(company.funding_m, criteria.funding_range),
    momentum_match: computeMomentumMatch(company.momentum),
  };

  const weightedScore = Object.entries(WEIGHTS).reduce(
    (sum, [key, weight]) => sum + (scores[key] * weight),
    0
  );

  return {
    total: Math.round(weightedScore * 1000) / 1000,
    breakdown: scores,
  };
}

function getEdgeColor(score) {
  if (score >= 0.85) return '#22C55E';
  if (score >= 0.70) return '#F59E0B';
  return '#9CA3AF';
}

function getEdgeOpacity(score) {
  if (score >= 0.85) return 0.85;
  if (score >= 0.70) return 0.70;
  if (score >= 0.55) return 0.55;
  return 0.40;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const client = await pool.connect();

  try {
    // 1. Load all companies
    const { rows: companies } = await client.query(
      'SELECT id, name, sectors, stage, region, funding_m, momentum FROM companies'
    );
    console.log(`Loaded ${companies.length} companies`);

    // 2. Load existing invested_in edges (fund -> company) to skip
    const { rows: investedEdges } = await client.query(
      "SELECT source_id, target_id FROM graph_edges WHERE rel = 'invested_in' AND source_id LIKE 'f_%'"
    );
    const investedSet = new Set(investedEdges.map(e => `${e.source_id}|${e.target_id}`));
    console.log(`Found ${investedSet.size} existing invested_in edges to skip`);

    // 3. Delete existing fund_opportunity edges (recompute from scratch)
    const { rowCount: deleted } = await client.query(
      "DELETE FROM graph_edges WHERE rel = 'fund_opportunity'"
    );
    console.log(`Deleted ${deleted} existing fund_opportunity edges`);

    // 4. Compute and insert edges
    const fundIds = Object.keys(FUND_CRITERIA);
    let totalInserted = 0;
    let totalScore = 0;
    const fundBreakdown = {};

    await client.query('BEGIN');

    for (const fundId of fundIds) {
      const fundNodeId = `f_${fundId}`;
      let fundInserted = 0;
      let fundScoreSum = 0;

      for (const company of companies) {
        const companyNodeId = `c_${company.id}`;

        // Skip if already invested
        if (investedSet.has(`${fundNodeId}|${companyNodeId}`)) continue;

        const result = computeMatchingScore(company, fundId);
        if (!result || result.total < 0.50) continue;

        const score = result.total;
        const edgeColor = getEdgeColor(score);
        const edgeOpacity = getEdgeOpacity(score);

        const note = `${FUND_CRITERIA[fundId].stages.join('/')} fund opportunity — ` +
          `score ${score.toFixed(2)} ` +
          `(stage:${result.breakdown.stage_match.toFixed(2)}, ` +
          `sector:${result.breakdown.sector_match.toFixed(2)}, ` +
          `region:${result.breakdown.region_match.toFixed(2)}, ` +
          `funding:${result.breakdown.funding_match.toFixed(2)}, ` +
          `momentum:${result.breakdown.momentum_match.toFixed(2)})`;

        await client.query(
          `INSERT INTO graph_edges (
            source_id, target_id, rel, note,
            matching_score, matching_criteria,
            edge_category, edge_style, edge_color, edge_opacity,
            confidence, data_quality, agent_id,
            valid_from, weight, bidirectional
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13,
            NOW(), $14, $15
          )`,
          [
            fundNodeId,              // $1 source_id
            companyNodeId,           // $2 target_id
            'fund_opportunity',      // $3 rel
            note,                    // $4 note
            score,                   // $5 matching_score
            JSON.stringify({         // $6 matching_criteria
              weights: WEIGHTS,
              scores: result.breakdown,
              fund_criteria: {
                stages: FUND_CRITERIA[fundId].stages,
                sectors: FUND_CRITERIA[fundId].sectors || 'all',
                regions: FUND_CRITERIA[fundId].regions || 'all',
                funding_range_m: FUND_CRITERIA[fundId].funding_range,
              },
              company_attributes: {
                stage: company.stage,
                sectors: company.sectors,
                region: company.region,
                funding_m: company.funding_m,
                momentum: company.momentum,
              },
            }),
            'opportunity',           // $7 edge_category
            '6,4',                   // $8 edge_style
            edgeColor,               // $9 edge_color
            edgeOpacity,             // $10 edge_opacity
            0.7,                     // $11 confidence
            'MEDIUM',                // $12 data_quality
            'opportunity_matcher',   // $13 agent_id
            1.0,                     // $14 weight
            false,                   // $15 bidirectional
          ]
        );

        fundInserted++;
        fundScoreSum += score;
      }

      fundBreakdown[fundId] = {
        edges: fundInserted,
        avgScore: fundInserted > 0 ? (fundScoreSum / fundInserted).toFixed(3) : 'N/A',
      };
      totalInserted += fundInserted;
      totalScore += fundScoreSum;
    }

    await client.query('COMMIT');

    // 5. Print summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  FUND OPPORTUNITY EDGE SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Total edges created:  ${totalInserted}`);
    console.log(`  Average score:        ${totalInserted > 0 ? (totalScore / totalInserted).toFixed(3) : 'N/A'}`);
    console.log('');
    console.log('  Breakdown by fund:');
    for (const [fundId, info] of Object.entries(fundBreakdown)) {
      const name = fundId.padEnd(12);
      console.log(`    ${name}  ${String(info.edges).padStart(4)} edges   avg ${info.avgScore}`);
    }
    console.log('═══════════════════════════════════════════════════════\n');

    // 6. Score distribution
    const { rows: dist } = await client.query(`
      SELECT
        CASE
          WHEN matching_score >= 0.85 THEN '0.85+ (strong)'
          WHEN matching_score >= 0.70 THEN '0.70-0.84 (good)'
          WHEN matching_score >= 0.55 THEN '0.55-0.69 (moderate)'
          ELSE '0.50-0.54 (marginal)'
        END AS tier,
        count(*) AS cnt
      FROM graph_edges
      WHERE rel = 'fund_opportunity'
      GROUP BY 1
      ORDER BY 1
    `);
    console.log('  Score distribution:');
    for (const row of dist) {
      console.log(`    ${row.tier.padEnd(25)} ${row.cnt} edges`);
    }
    console.log('');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
