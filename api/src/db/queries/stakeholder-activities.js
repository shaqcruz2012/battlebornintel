import pool from '../pool.js';

/**
 * Get stakeholder activities from the unified events table.
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
    SELECT
      e.id::text AS id,
      e.event_date AS date,
      e.event_type AS activity_type,
      e.company_name,
      e.description,
      e.location,
      e.source,
      e.source_url,
      e.verified,
      e.confidence,
      e.stakeholder_type,
      split_part(e.location, ',', 1) AS city,
      TRIM(split_part(e.location, ',', 2)) AS region
    FROM events e
    WHERE e.quarantined = FALSE AND e.verified = TRUE
  `;

  const params = [];
  let paramIndex = 1;

  // Filter by location
  if (location && location !== 'all') {
    sql += ` AND (LOWER(TRIM(split_part(e.location, ',', 2))) = $${paramIndex} OR LOWER(split_part(e.location, ',', 1)) LIKE $${paramIndex + 1})`;
    params.push(location.toLowerCase(), `%${location.toLowerCase()}%`);
    paramIndex += 2;
  }

  // Filter by since date
  if (since) {
    sql += ` AND e.event_date >= $${paramIndex}::date`;
    params.push(since);
    paramIndex++;
  }

  // Filter by until date
  if (until) {
    sql += ` AND e.event_date <= $${paramIndex}::date`;
    params.push(until);
    paramIndex++;
  }

  // Filter by activity type (case-insensitive to handle both Title Case and lowercase inputs)
  if (type && type !== 'all') {
    sql += ` AND LOWER(e.event_type) = $${paramIndex}`;
    params.push(type.toLowerCase());
    paramIndex++;
  }

  // Filter by stakeholder type category
  if (stakeholderType && stakeholderType !== 'all') {
    sql += ` AND e.stakeholder_type = $${paramIndex}`;
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
  // Use a CTE to resolve the company name once, then match by either
  // company_id or company_name — avoids re-executing subquery per row.
  const sql = `
    WITH target AS (
      SELECT id, LOWER(name) AS lname FROM companies WHERE id = $1
    )
    SELECT
      e.id,
      e.event_date AS date,
      e.event_type AS activity_type,
      e.company_name,
      e.description,
      e.location,
      e.source,
      e.source_url,
      e.verified
    FROM events e, target t
    WHERE e.quarantined = FALSE AND e.verified = TRUE
      AND (e.company_id = t.id OR LOWER(e.company_name) = t.lname)
    ORDER BY e.event_date DESC
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
    SELECT
      e.id,
      e.event_date AS date,
      e.event_type AS activity_type,
      e.company_name,
      e.description,
      e.location,
      e.source,
      e.source_url,
      e.verified
    FROM events e
    WHERE e.quarantined = FALSE AND e.verified = TRUE
      AND ($1 = 'all' OR LOWER(e.location) ILIKE $2)
      AND e.event_date >= $3::date
      AND e.event_date <= $4::date
    ORDER BY e.event_date DESC
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
    SELECT
      event_type AS activity_type,
      COUNT(*) AS count
    FROM events
    WHERE quarantined = FALSE AND verified = TRUE
    GROUP BY event_type
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
    SELECT
      location,
      COUNT(*) AS count
    FROM events
    WHERE location IS NOT NULL AND quarantined = FALSE
    GROUP BY location
    ORDER BY count DESC
  `;

  const { rows } = await pool.query(sql);
  return rows;
}
