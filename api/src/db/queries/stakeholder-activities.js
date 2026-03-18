import pool from '../pool.js';

/**
 * Get stakeholder activities (from timeline events and analysis results)
 * Supports filtering by:
 * - location: Nevada region (las_vegas, reno, henderson, carson_city, etc.)
 * - since: ISO date string (e.g., 2025-01-01)
 * - until: ISO date string (e.g., 2025-12-31)
 * - limit: number of activities to return (default: 100, null for no limit)
 * - type: activity type filter
 * - stakeholderType: stakeholder category filter (gov_policy, university, corporate, risk_capital, ecosystem)
 * - countOnly: if true, returns just the total count (number) instead of rows
 */
export async function getStakeholderActivities(filters = {}) {
  const {
    location,
    since,
    until,
    limit = 100,
    type,
    stakeholderType,
    countOnly = false,
  } = filters;

  let sql = `
    WITH timeline_data AS (
      SELECT
        t.id::text,
        t.event_date as date,
        t.event_type as activity_type,
        t.company_name,
        t.detail as description,
        c.city || ', ' || c.region as location,
        'timeline_event' as source,
        t.source_url,
        true as verified,
        c.city,
        c.region,
        CASE
          WHEN t.event_type IN ('funding', 'investment') THEN 'risk_capital'
          WHEN t.event_type IN ('grant', 'legislation', 'policy') THEN 'gov_policy'
          WHEN t.event_type IN ('research', 'academic') THEN 'university'
          WHEN t.event_type IN ('partnership', 'expansion') THEN 'corporate'
          ELSE 'ecosystem'
        END as stakeholder_type
      FROM timeline_events t
      LEFT JOIN companies c ON LOWER(c.name) = LOWER(t.company_name)
    ),
    graph_edge_activities AS (
      SELECT
        'graph-' || g.id as id,
        (g.event_year::text || '-01-01')::date as date,
        CASE g.rel
          WHEN 'invested_in' THEN 'Funding'
          WHEN 'funded' THEN 'Funding'
          WHEN 'funded_by' THEN 'Funding'
          WHEN 'grants_to' THEN 'Grant'
          WHEN 'awarded' THEN 'Award'
          WHEN 'partners_with' THEN 'Partnership'
          WHEN 'contracts_with' THEN 'Partnership'
          WHEN 'corporate_partner' THEN 'Partnership'
          WHEN 'collaborated_with' THEN 'Partnership'
          WHEN 'research_partnership' THEN 'Partnership'
          WHEN 'pilots_with' THEN 'Partnership'
          WHEN 'acquired' THEN 'Acquisition'
          WHEN 'acquired_by' THEN 'Acquisition'
          WHEN 'accelerated_by' THEN 'Milestone'
          WHEN 'won_pitch' THEN 'Milestone'
          ELSE 'Milestone'
        END as activity_type,
        c.name as company_name,
        g.note as description,
        c.city || ', ' || c.region as location,
        'graph_edge' as source,
        NULL::text as source_url,
        false as verified,
        c.city,
        c.region,
        CASE
          WHEN g.source_type = 'fund' OR g.rel IN ('invested_in', 'funded', 'funded_by') THEN 'risk_capital'
          WHEN g.source_type = 'external' AND e.entity_type IN ('University', 'University System') THEN 'university'
          WHEN g.source_type = 'external' AND e.entity_type IN ('Gov Agency', 'Government', 'Federal Agency', 'Federal Program') THEN 'gov_policy'
          WHEN g.source_type = 'external' AND e.entity_type IN ('Corporation', 'PE Firm', 'Investment Co') THEN 'corporate'
          WHEN g.rel IN ('accelerated_by', 'won_pitch') THEN 'ecosystem'
          WHEN g.rel IN ('grants_to', 'awarded') THEN 'gov_policy'
          ELSE 'ecosystem'
        END as stakeholder_type
      FROM graph_edges g
      JOIN companies c ON 'c_' || c.id::text = g.target_id OR 'c_' || c.id::text = g.source_id
      LEFT JOIN externals e ON g.source_type = 'external' AND e.id = g.source_id
      WHERE g.event_year IS NOT NULL
    ),
    enriched_activities AS (
      SELECT
        'sa-' || sa.id::text as id,
        sa.activity_date as date,
        sa.activity_type,
        COALESCE(sa.display_name, c.name, sa.company_id) as company_name,
        sa.description,
        sa.location,
        sa.source,
        sa.source_url,
        (sa.data_quality = 'VERIFIED') as verified,
        split_part(sa.location, ',', 1) as city,
        TRIM(split_part(sa.location, ',', 2)) as region,
        COALESCE(sa.stakeholder_type, CASE
          WHEN sa.activity_type IN ('Funding') THEN 'risk_capital'
          WHEN sa.activity_type IN ('Grant', 'Award') THEN 'gov_policy'
          WHEN sa.activity_type IN ('Partnership', 'Expansion', 'Acquisition') THEN 'corporate'
          WHEN sa.activity_type IN ('Hiring') THEN 'corporate'
          WHEN sa.activity_type IN ('Patent', 'Milestone', 'Launch') THEN 'ecosystem'
          ELSE 'ecosystem'
        END) as stakeholder_type
      FROM stakeholder_activities sa
      LEFT JOIN LATERAL (
        SELECT name FROM companies
        WHERE slug = sa.company_id
        UNION ALL
        SELECT name FROM companies
        WHERE LOWER(name) = LOWER(sa.company_id)
          AND slug != sa.company_id
        LIMIT 1
      ) c ON true
    ),
    combined_activities AS (
      SELECT * FROM timeline_data
      UNION ALL
      SELECT * FROM graph_edge_activities
      UNION ALL
      SELECT * FROM enriched_activities
    )
    SELECT
      id,
      date,
      activity_type,
      company_name,
      description,
      location,
      source,
      source_url,
      verified,
      city,
      region,
      stakeholder_type
    FROM combined_activities
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  // Filter by location
  if (location && location !== 'all') {
    sql += ` AND (LOWER(region) = $${paramIndex} OR LOWER(city) LIKE $${paramIndex + 1})`;
    params.push(location.toLowerCase(), `%${location.toLowerCase()}%`);
    paramIndex += 2;
  }

  // Filter by since date
  if (since) {
    sql += ` AND date >= $${paramIndex}::date`;
    params.push(since);
    paramIndex++;
  }

  // Filter by until date
  if (until) {
    sql += ` AND date <= $${paramIndex}::date`;
    params.push(until);
    paramIndex++;
  }

  // Filter by activity type (case-insensitive to handle both Title Case and lowercase inputs)
  if (type && type !== 'all') {
    sql += ` AND LOWER(activity_type) = $${paramIndex}`;
    params.push(type.toLowerCase());
    paramIndex++;
  }

  // Filter by stakeholder type category
  if (stakeholderType && stakeholderType !== 'all') {
    sql += ` AND stakeholder_type = $${paramIndex}`;
    params.push(stakeholderType.toLowerCase());
    paramIndex++;
  }

  // Count-only mode: return just the total matching rows
  if (countOnly) {
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) _counted`;
    const { rows } = await pool.query(countSql, params);
    return parseInt(rows[0].total, 10);
  }

  // Wrap the filtered query with COUNT(*) OVER() so we get the total
  // matching rows and paginated data in a single round-trip.
  let finalSql = `SELECT *, COUNT(*) OVER() AS _total_count FROM (${sql}) _filtered ORDER BY date DESC`;

  if (limit != null) {
    finalSql += ` LIMIT $${paramIndex}`;
    params.push(limit);
  }

  const { rows } = await pool.query(finalSql, params);
  const totalCount = rows.length > 0 ? parseInt(rows[0]._total_count, 10) : 0;
  const mappedRows = rows.map((row) => ({
    id: row.id,
    date: row.date,
    activity_type: row.activity_type,
    company_name: row.company_name,
    description: row.description,
    location: row.location,
    source: row.source,
    source_url: row.source_url || null,
    verified: row.verified,
    stakeholder_type: row.stakeholder_type,
  }));
  return { rows: mappedRows, totalCount };
}

/**
 * Get recent activities for a specific company
 */
export async function getCompanyActivities(companyId, limit = 20) {
  const sql = `
    SELECT
      t.id,
      t.event_date as date,
      t.event_type as activity_type,
      t.company_name,
      t.detail as description,
      c.city || ', ' || c.region as location,
      'timeline_event' as source,
      true as verified
    FROM timeline_events t
    LEFT JOIN companies c ON LOWER(c.name) = LOWER(t.company_name)
    WHERE LOWER(t.company_name) = (SELECT LOWER(name) FROM companies WHERE id = $1)
    ORDER BY t.event_date DESC
    LIMIT $2
  `;

  const { rows } = await pool.query(sql, [companyId, limit]);
  return rows;
}

/**
 * Get activities by location for a given date range
 */
export async function getActivitiesByLocationAndDateRange(location, startDate, endDate) {
  const sql = `
    WITH timeline_data AS (
      SELECT
        t.id,
        t.event_date as date,
        t.event_type as activity_type,
        t.company_name,
        t.detail as description,
        c.city || ', ' || c.region as location,
        'timeline_event' as source,
        true as verified
      FROM timeline_events t
      LEFT JOIN companies c ON LOWER(c.name) = LOWER(t.company_name)
    )
    SELECT *
    FROM timeline_data
    WHERE ($1 = 'all' OR LOWER(location) ILIKE $2)
      AND date >= $3::date
      AND date <= $4::date
    ORDER BY date DESC
  `;

  const { rows } = await pool.query(sql, [
    location,
    `%${location}%`,
    startDate,
    endDate,
  ]);

  return rows;
}

/**
 * Count activities by type
 */
export async function countActivitiesByType() {
  const sql = `
    WITH timeline_data AS (
      SELECT event_type as activity_type FROM timeline_events
    )
    SELECT
      activity_type,
      COUNT(*) as count
    FROM timeline_data
    GROUP BY activity_type
    ORDER BY count DESC
  `;

  const { rows } = await pool.query(sql);
  return rows;
}

/**
 * Count activities by location
 */
export async function countActivitiesByLocation() {
  const sql = `
    WITH timeline_data AS (
      SELECT
        c.city || ', ' || c.region as location
      FROM timeline_events t
      LEFT JOIN companies c ON LOWER(c.name) = LOWER(t.company_name)
      WHERE c.id IS NOT NULL
    )
    SELECT
      location,
      COUNT(*) as count
    FROM timeline_data
    WHERE location IS NOT NULL
    GROUP BY location
    ORDER BY count DESC
  `;

  const { rows } = await pool.query(sql);
  return rows;
}
