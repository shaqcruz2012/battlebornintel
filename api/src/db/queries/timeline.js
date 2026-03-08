import pool from '../pool.js';

export async function getTimeline({ limit = 30, type } = {}) {
  let sql = `SELECT * FROM timeline_events`;
  const params = [];
  let idx = 1;

  if (type) {
    sql += ` WHERE event_type = $${idx}`;
    params.push(type);
    idx++;
  }

  sql += ` ORDER BY event_date DESC LIMIT $${idx}`;
  params.push(limit);

  const { rows } = await pool.query(sql, params);
  return rows.map((r) => ({
    date: r.event_date,
    type: r.event_type,
    company: r.company_name,
    detail: r.detail,
    icon: r.icon,
  }));
}
