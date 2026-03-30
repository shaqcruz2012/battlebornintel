import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/macro-events — documented shocks and policy changes
router.get('/', async (req, res, next) => {
  try {
    const { event_type, severity } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (event_type) { conditions.push(`event_type = $${idx}`); params.push(event_type); idx++; }
    if (severity) { conditions.push(`severity = $${idx}`); params.push(severity); idx++; }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM macro_events ${where} ORDER BY event_date DESC LIMIT 50`, params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/macro-events/exposure — company shock exposure
router.get('/exposure', async (req, res, next) => {
  try {
    const { shock_type, limit } = req.query;
    const lim = Math.min(parseInt(limit) || 50, 200);
    const typeFilter = shock_type ? `WHERE shock_type = $2` : '';
    const params = shock_type ? [lim, shock_type] : [lim];

    const { rows } = await pool.query(`
      SELECT company_id, company_name, shock_type,
             avg_sector_elasticity, max_exposure, exposed_sectors
      FROM v_shock_exposure
      ${typeFilter}
      ORDER BY ABS(avg_sector_elasticity) DESC
      LIMIT $1
    `, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
