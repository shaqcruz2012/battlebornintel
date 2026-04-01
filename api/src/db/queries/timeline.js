import pool from '../pool.js';
import { regionCondition } from '../../utils/regionMapping.js';

export async function getTimeline({ limit = 30, type, region } = {}) {
  let sql = `
    SELECT
      e.id,
      e.event_date,
      e.event_type,
      e.company_name,
      e.description AS detail,
      e.company_id,
      e.confidence,
      e.verified,
      e.source_url,
      c.city,
      c.region,
      c.slug AS company_slug
    FROM events e
    LEFT JOIN companies c ON c.id = e.company_id
    WHERE e.quarantined = FALSE AND e.verified = TRUE
  `;
  const params = [];
  let idx = 1;

  if (type) {
    sql += ` AND e.event_type = $${idx}`;
    params.push(type);
    idx++;
  }

  if (region && region !== 'all') {
    const rc = regionCondition(region, 'c.region', idx);
    if (rc.condition) {
      sql += ` AND ${rc.condition}`;
      params.push(...rc.params);
      idx = rc.nextIdx;
    }
  }

  sql += ` ORDER BY e.event_date DESC LIMIT $${idx}`;
  params.push(limit);

  const { rows } = await pool.query(sql, params);
  return rows.map((r) => ({
    id: r.id,
    date: r.event_date,
    type: r.event_type,
    company: r.company_name,
    companyId: r.company_id,
    companySlug: r.company_slug,
    detail: r.detail,
    icon: null,
    confidence: r.confidence,
    verified: r.verified,
    source_url: r.source_url || null,
    city: r.city,
    region: r.region,
  }));
}

/**
 * Compute MIT REAP framework metrics from timeline events.
 * Categories:
 *   inputs     – Funding, Grant
 *   capacities – Hiring, Partnership
 *   outputs    – Launch, Patent, Milestone
 *   impact     – Award, Expansion, Acquisition
 *
 * @param {Object}  opts
 * @param {string} [opts.since] - ISO date lower bound (inclusive)
 * @param {string} [opts.until] - ISO date upper bound (inclusive)
 */
export async function getREAPMetrics({ since, until } = {}) {
  const conditions = [`event_type != 'Founding'`, `quarantined = FALSE`];
  const params = [];
  let idx = 1;

  if (since) {
    conditions.push(`event_date >= $${idx}::date`);
    params.push(since);
    idx++;
  }

  if (until) {
    conditions.push(`event_date <= $${idx}::date`);
    params.push(until);
    idx++;
  }

  const sql = `
    SELECT
      CASE
        WHEN event_type IN ('Funding', 'Grant')                THEN 'inputs'
        WHEN event_type IN ('Hiring', 'Partnership')           THEN 'capacities'
        WHEN event_type IN ('Launch', 'Patent', 'Milestone')   THEN 'outputs'
        WHEN event_type IN ('Award', 'Expansion', 'Acquisition') THEN 'impact'
        ELSE 'other'
      END AS reap_category,
      COUNT(*)                       AS event_count,
      array_agg(DISTINCT event_type) AS event_types
    FROM events
    WHERE ${conditions.join(' AND ')}
    GROUP BY reap_category
    ORDER BY reap_category
  `;

  const { rows } = await pool.query(sql, params);
  return rows.map((r) => ({
    category: r.reap_category,
    eventCount: parseInt(r.event_count, 10),
    eventTypes: r.event_types,
  }));
}

/**
 * Get all weeks that have timeline events, with event counts per week.
 * Returns weeks in descending order (newest first).
 * A "week" starts on Monday (ISO week).
 */
export async function getTimelineWeeks() {
  const sql = `
    SELECT
      date_trunc('week', event_date)::date AS week_start,
      COUNT(*) AS event_count,
      array_agg(DISTINCT event_type) AS event_types
    FROM events
    WHERE quarantined = FALSE AND verified = TRUE
    GROUP BY date_trunc('week', event_date)
    ORDER BY week_start DESC
  `;
  const { rows } = await pool.query(sql);
  return rows.map((r) => ({
    weekStart: r.week_start,
    eventCount: parseInt(r.event_count, 10),
    eventTypes: r.event_types,
  }));
}

/**
 * Get all timeline events for a specific ISO week (identified by its Monday date).
 * @param {string} weekStart - ISO date string like '2024-09-23' (must be a Monday)
 */
export async function getTimelineWeek(weekStart) {
  const sql = `
    SELECT
      e.id,
      e.event_date,
      e.event_type,
      e.company_name,
      e.description AS detail,
      e.company_id,
      e.confidence,
      e.verified,
      e.source_url,
      c.city,
      c.region,
      c.slug AS company_slug
    FROM events e
    LEFT JOIN companies c ON c.id = e.company_id
    WHERE e.quarantined = FALSE AND e.verified = TRUE
      AND e.event_date >= $1::date
      AND e.event_date < ($1::date + INTERVAL '7 days')
    ORDER BY e.event_date DESC
  `;
  const { rows } = await pool.query(sql, [weekStart]);
  return rows.map((r) => ({
    id: r.id,
    date: r.event_date,
    type: r.event_type,
    company: r.company_name,
    companyId: r.company_id,
    companySlug: r.company_slug,
    detail: r.detail,
    icon: null,
    confidence: r.confidence,
    verified: r.verified,
    source_url: r.source_url || null,
    city: r.city,
    region: r.region,
  }));
}
