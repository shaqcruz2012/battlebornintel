import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/company/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const { rows } = await pool.query(
      `SELECT sr.metric_name, sr.value, sr.unit, sr.period,
              sr.confidence_lo, sr.confidence_hi,
              s.id AS scenario_id, s.name AS scenario_name
       FROM scenario_results sr
       JOIN scenarios s ON s.id = sr.scenario_id
       WHERE sr.entity_type = 'company'
         AND sr.entity_id = $1
         AND s.status = 'complete'
       ORDER BY s.created_at DESC, sr.metric_name, sr.period`,
      [String(id)]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/sector/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const { rows } = await pool.query(
      `SELECT sr.metric_name,
              sr.period,
              SUM(sr.value)   AS total_value,
              AVG(sr.value)   AS avg_value,
              MIN(sr.value)   AS min_value,
              MAX(sr.value)   AS max_value,
              sr.unit,
              COUNT(*)::int   AS entity_count
       FROM scenario_results sr
       JOIN scenarios s ON s.id = sr.scenario_id
       WHERE sr.entity_type = 'sector'
         AND sr.entity_id = $1
         AND s.status = 'complete'
       GROUP BY sr.metric_name, sr.period, sr.unit
       ORDER BY sr.metric_name, sr.period`,
      [slug]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/ecosystem', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT sr.metric_name,
              sr.period,
              sr.value,
              sr.unit,
              sr.confidence_lo,
              sr.confidence_hi,
              s.id AS scenario_id,
              s.name AS scenario_name
       FROM scenario_results sr
       JOIN scenarios s ON s.id = sr.scenario_id
       WHERE sr.entity_type = 'ecosystem'
         AND sr.metric_name IN ('funding_m_forecast', 'employment_forecast', 'innovation_index')
         AND s.status = 'complete'
       ORDER BY s.created_at DESC, sr.metric_name, sr.period`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
