import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/regional — time-series indicators
router.get('/', async (req, res, next) => {
  try {
    const { indicator, state_code, start_date, end_date, granularity } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (indicator) {
      conditions.push(`indicator_name = $${idx}`);
      params.push(indicator);
      idx++;
    }
    if (state_code) {
      conditions.push(`state_code = $${idx}`);
      params.push(state_code);
      idx++;
    }
    if (start_date) {
      conditions.push(`period_date >= $${idx}::date`);
      params.push(start_date);
      idx++;
    }
    if (end_date) {
      conditions.push(`period_date <= $${idx}::date`);
      params.push(end_date);
      idx++;
    }
    if (granularity) {
      conditions.push(`granularity = $${idx}`);
      params.push(granularity);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT indicator_name, indicator_value, unit, period_date, state_code, granularity, source_url
       FROM regional_indicators ${where}
       ORDER BY indicator_name, period_date DESC
       LIMIT 1000`,
      params
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/regional/summary — latest value per indicator
router.get('/summary', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (indicator_name)
        indicator_name, indicator_value, unit, period_date, state_code, granularity
      FROM regional_indicators
      WHERE state_code = 'NV'
      ORDER BY indicator_name, period_date DESC
    `);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/regional/indicators — list available indicators
router.get('/indicators', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT indicator_name, COUNT(*) as data_points,
             MIN(period_date) as earliest, MAX(period_date) as latest,
             MAX(unit) as unit
      FROM regional_indicators
      GROUP BY indicator_name
      ORDER BY indicator_name
    `);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
