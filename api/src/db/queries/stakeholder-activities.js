import pool from '../pool.js';

/**
 * Get stakeholder activities (from timeline events and analysis results)
 * Supports filtering by:
 * - location: Nevada region (las_vegas, reno, henderson, carson_city, etc.)
 * - since: ISO date string (e.g., 2025-01-01)
 * - until: ISO date string (e.g., 2025-12-31)
 * - limit: number of activities to return (default: 50)
 * - type: activity type filter
 */
export async function getStakeholderActivities(filters = {}) {
  const {
    location,
    since,
    until,
    limit = 50,
    type,
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
        true as verified,
        c.city,
        c.region
      FROM timeline_events t
      LEFT JOIN companies c ON LOWER(c.name) = LOWER(t.company_name)
    ),
    graph_edge_activities AS (
      SELECT
        'graph-' || g.id as id,
        (g.event_year::text || '-01-01')::date as date,
        CASE g.rel
          WHEN 'FUNDING' THEN 'funding'
          WHEN 'INVESTMENT' THEN 'funding'
          WHEN 'PARTNERSHIP' THEN 'partnership'
          WHEN 'ACQUISITION' THEN 'acquisition'
          ELSE 'partnership'
        END as activity_type,
        c.name as company_name,
        'Partnership: ' || g.note as description,
        c.city || ', ' || c.region as location,
        'graph_edge' as source,
        false as verified,
        c.city,
        c.region
      FROM graph_edges g
      LEFT JOIN companies c ON c.slug = g.target_id OR c.slug = g.source_id
      WHERE g.event_year IS NOT NULL
        AND c.id IS NOT NULL
    ),
    combined_activities AS (
      SELECT * FROM timeline_data
      UNION ALL
      SELECT * FROM graph_edge_activities
    )
    SELECT
      id,
      date,
      activity_type,
      company_name,
      description,
      location,
      source,
      verified,
      city,
      region
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

  // Filter by activity type
  if (type && type !== 'all') {
    sql += ` AND activity_type = $${paramIndex}`;
    params.push(type.toLowerCase());
    paramIndex++;
  }

  sql += ` ORDER BY date DESC LIMIT $${paramIndex}`;
  params.push(limit);

  try {
    const { rows } = await pool.query(sql, params);
    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      activity_type: row.activity_type,
      company_name: row.company_name,
      description: row.description,
      location: row.location,
      source: row.source,
      verified: row.verified,
    }));
  } catch (error) {
    console.error('Error fetching stakeholder activities:', error);
    throw error;
  }
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
    LEFT JOIN companies c ON c.id = $1
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
