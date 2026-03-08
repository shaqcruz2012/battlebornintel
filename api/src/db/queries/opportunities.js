import pool from '../pool.js';

const THRESHOLDS = { excellent: 0.85, good: 0.70, fair: 0.50 };
const FUND_THRESHOLDS = { excellent: 0.80, good: 0.65, fair: 0.50 };

function classifyMatch(score, isFund = false) {
  const t = isFund ? FUND_THRESHOLDS : THRESHOLDS;
  if (score >= t.excellent) return 'excellent';
  if (score >= t.good) return 'good';
  if (score >= t.fair) return 'fair';
  return 'poor';
}

function formatOpportunity(row) {
  const score = parseFloat(row.matching_score);
  const isFund = row.rel === 'fund_opportunity';
  return {
    id: row.edge_id,
    sourceId: row.source_id,
    targetId: row.target_id,
    companyName: row.company_name,
    companyStage: row.company_stage,
    companyRegion: row.company_region,
    targetName: row.target_name,
    targetType: isFund ? 'fund' : 'program',
    rel: row.rel,
    matchScore: score,
    matchQuality: classifyMatch(score, isFund),
    matchCriteria: row.matching_criteria || {},
    edgeCategory: row.edge_category,
    edgeStyle: row.edge_style,
    edgeColor: row.edge_color,
    edgeOpacity: row.edge_opacity ? parseFloat(row.edge_opacity) : null,
    eligibleSince: row.eligible_since,
    eligibleUntil: row.eligible_until,
    createdAt: row.created_at,
  };
}

export async function getOpportunities(filters = {}) {
  const { quality, entityType, sector, stage, search, sortBy = 'score',
    limit: rawLimit = 100, offset: rawOffset = 0 } = filters;

  const limit = Math.min(parseInt(rawLimit, 10) || 100, 500);
  const offset = parseInt(rawOffset, 10) || 0;
  const conditions = [`ge.edge_category = 'opportunity'`];
  const params = [];
  let idx = 1;

  if (quality === 'excellent') { conditions.push(`ge.matching_score >= $${idx}`); params.push(0.80); idx++; }
  else if (quality === 'good') { conditions.push(`ge.matching_score >= $${idx} AND ge.matching_score < $${idx+1}`); params.push(0.65, 0.80); idx += 2; }
  else if (quality === 'fair') { conditions.push(`ge.matching_score >= $${idx} AND ge.matching_score < $${idx+1}`); params.push(0.50, 0.65); idx += 2; }

  if (entityType === 'program') { conditions.push(`ge.rel = 'qualifies_for'`); }
  else if (entityType === 'fund') { conditions.push(`ge.rel = 'fund_opportunity'`); }

  if (sector) { conditions.push(`$${idx} = ANY(c.sectors)`); params.push(sector); idx++; }
  if (stage) { conditions.push(`c.stage = $${idx}`); params.push(stage); idx++; }
  if (search) { conditions.push(`(c.name ILIKE $${idx} OR COALESCE(p.name, f.name, '') ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

  const where = conditions.join(' AND ');
  const order = { score: 'ge.matching_score DESC', company: 'c.name ASC', recent: 'ge.created_at DESC' }[sortBy] || 'ge.matching_score DESC';

  const [countRes, dataRes] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM graph_edges ge
      JOIN companies c ON c.id = CAST(REPLACE(CASE WHEN ge.rel='fund_opportunity' THEN ge.target_id ELSE ge.source_id END, 'c_', '') AS INTEGER)
      LEFT JOIN programs p ON ge.rel='qualifies_for' AND p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
      LEFT JOIN funds f ON ge.rel='fund_opportunity' AND f.id = REPLACE(ge.source_id, 'f_', '')
      WHERE ${where}`, params),
    pool.query(`SELECT ge.id AS edge_id, ge.source_id, ge.target_id, ge.rel,
      c.name AS company_name, c.stage AS company_stage, c.region AS company_region,
      COALESCE(p.name, f.name, ge.target_id) AS target_name,
      ge.matching_score, ge.matching_criteria, ge.edge_category,
      ge.edge_style, ge.edge_color, ge.edge_opacity,
      ge.eligible_since, ge.eligible_until, ge.created_at
      FROM graph_edges ge
      JOIN companies c ON c.id = CAST(REPLACE(CASE WHEN ge.rel='fund_opportunity' THEN ge.target_id ELSE ge.source_id END, 'c_', '') AS INTEGER)
      LEFT JOIN programs p ON ge.rel='qualifies_for' AND p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
      LEFT JOIN funds f ON ge.rel='fund_opportunity' AND f.id = REPLACE(ge.source_id, 'f_', '')
      WHERE ${where}
      ORDER BY ${order}
      LIMIT $${idx} OFFSET $${idx + 1}`, [...params, limit, offset]),
  ]);

  return {
    opportunities: dataRes.rows.map(formatOpportunity),
    total: parseInt(countRes.rows[0].count, 10),
    limit, offset,
  };
}

export async function getCompanyOpportunities(companyId) {
  const { rows } = await pool.query(`
    SELECT ge.id AS edge_id, ge.source_id, ge.target_id, ge.rel,
      c.name AS company_name, c.stage AS company_stage, c.region AS company_region,
      COALESCE(p.name, f.name, '') AS target_name,
      ge.matching_score, ge.matching_criteria, ge.edge_category,
      ge.edge_style, ge.edge_color, ge.edge_opacity,
      ge.eligible_since, ge.eligible_until, ge.created_at
    FROM graph_edges ge
    JOIN companies c ON c.id = $1
    LEFT JOIN programs p ON ge.rel='qualifies_for' AND p.id = CAST(REPLACE(ge.target_id, 'p_', '') AS INTEGER)
    LEFT JOIN funds f ON ge.rel='fund_opportunity' AND f.id = REPLACE(ge.source_id, 'f_', '')
    WHERE ge.edge_category = 'opportunity'
      AND (
        (ge.rel = 'qualifies_for' AND ge.source_id = 'c_' || $1)
        OR (ge.rel = 'fund_opportunity' AND ge.target_id = 'c_' || $1)
      )
    ORDER BY ge.matching_score DESC
  `, [companyId]);

  const opps = rows.map(formatOpportunity);
  return {
    opportunities: opps,
    summary: {
      total: opps.length,
      programs: opps.filter(o => o.targetType === 'program').length,
      funds: opps.filter(o => o.targetType === 'fund').length,
      excellent: opps.filter(o => o.matchQuality === 'excellent').length,
      good: opps.filter(o => o.matchQuality === 'good').length,
      avgScore: opps.length > 0 ? Math.round(opps.reduce((s, o) => s + o.matchScore, 0) / opps.length * 100) / 100 : 0,
    },
  };
}

export async function getOpportunityStats() {
  const [qualityRes, topCompanies, edgeSummary] = await Promise.all([
    pool.query(`SELECT
      CASE WHEN matching_score >= 0.80 THEN 'excellent'
           WHEN matching_score >= 0.65 THEN 'good'
           WHEN matching_score >= 0.50 THEN 'fair'
           ELSE 'marginal' END AS quality,
      rel, COUNT(*), ROUND(AVG(matching_score), 3) AS avg_score
      FROM graph_edges WHERE edge_category = 'opportunity'
      GROUP BY 1, 2 ORDER BY MIN(matching_score) DESC`),
    pool.query(`SELECT c.name, c.stage, c.region,
      COUNT(*) AS opp_count, ROUND(AVG(ge.matching_score), 3) AS avg_score
      FROM graph_edges ge
      JOIN companies c ON c.id = CAST(REPLACE(
        CASE WHEN ge.rel='fund_opportunity' THEN ge.target_id ELSE ge.source_id END, 'c_', '') AS INTEGER)
      WHERE ge.edge_category = 'opportunity'
      GROUP BY c.name, c.stage, c.region
      HAVING COUNT(*) >= 3
      ORDER BY avg_score DESC LIMIT 15`),
    pool.query(`SELECT rel, COUNT(*) AS count, ROUND(AVG(matching_score), 3) AS avg
      FROM graph_edges WHERE edge_category = 'opportunity' GROUP BY rel`),
  ]);

  return {
    qualityDistribution: qualityRes.rows,
    topCompanies: topCompanies.rows,
    edgeSummary: edgeSummary.rows,
  };
}
