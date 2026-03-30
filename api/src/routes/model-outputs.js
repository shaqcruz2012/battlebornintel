import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/model-outputs — scored predictions
router.get('/', async (req, res, next) => {
  try {
    const { entity_type, entity_id, output_type, limit } = req.query;
    const conditions = ['(mo.expires_at IS NULL OR mo.expires_at > NOW())'];
    const params = [];
    let idx = 1;

    if (entity_type) { conditions.push(`mo.entity_type = $${idx}`); params.push(entity_type); idx++; }
    if (entity_id) { conditions.push(`mo.entity_id = $${idx}`); params.push(entity_id); idx++; }
    if (output_type) { conditions.push(`mo.output_type = $${idx}`); params.push(output_type); idx++; }

    const lim = Math.min(parseInt(limit) || 100, 500);
    const { rows } = await pool.query(`
      SELECT mo.id, mo.entity_type, mo.entity_id, mo.output_type, mo.metric_name,
             mo.value, mo.confidence_lo, mo.confidence_hi, mo.horizon_date, mo.as_of_date,
             mo.explanation, mo.methodology_note, m.name as model_name
      FROM model_outputs mo
      LEFT JOIN models m ON m.id = mo.model_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY mo.value DESC
      LIMIT ${lim}
    `, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/model-outputs/leaderboard — top scores by type
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { output_type, limit } = req.query;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const typeFilter = output_type ? `AND mo.output_type = $2` : '';
    const params = output_type ? [lim, output_type] : [lim];

    const { rows } = await pool.query(`
      SELECT mo.entity_id, er.label as entity_name, mo.output_type, mo.metric_name,
             mo.value, mo.confidence_lo, mo.confidence_hi, mo.explanation
      FROM model_outputs mo
      LEFT JOIN entity_registry er ON er.canonical_id = mo.entity_id
      WHERE (mo.expires_at IS NULL OR mo.expires_at > NOW())
        ${typeFilter}
      ORDER BY mo.value DESC
      LIMIT $1
    `, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/model-outputs/entity/:id — all predictions for one entity
router.get('/entity/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT mo.output_type, mo.metric_name, mo.value, mo.confidence_lo, mo.confidence_hi,
             mo.horizon_date, mo.as_of_date, mo.explanation, mo.methodology_note,
             m.name as model_name
      FROM model_outputs mo
      LEFT JOIN models m ON m.id = mo.model_id
      WHERE mo.entity_id = $1 AND (mo.expires_at IS NULL OR mo.expires_at > NOW())
      ORDER BY mo.output_type, mo.as_of_date DESC
    `, [req.params.id]);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
