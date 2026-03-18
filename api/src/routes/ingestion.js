import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'applied'];
const VALID_SOURCES = ['crunchbase', 'news', 'sec', 'sbir', 'manual'];
const VALID_ENTITY_TYPES = ['funding_round', 'partnership', 'hiring', 'edge', 'company'];

// ── GET /api/ingestion/queue ──────────────────────────────────────────────────
// Returns queued items for review, filterable by status and source
router.get('/queue', async (req, res, next) => {
  try {
    const { status = 'pending', source, entity_type, limit = 50, offset = 0 } = req.query;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`iq.status = $${idx++}`);
      params.push(status);
    }
    if (source) {
      conditions.push(`iq.source = $${idx++}`);
      params.push(source);
    }
    if (entity_type) {
      conditions.push(`iq.entity_type = $${idx++}`);
      params.push(entity_type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const safeOffset = parseInt(offset, 10) || 0;

    const { rows } = await pool.query(
      `SELECT iq.*, u.name AS reviewer_name
       FROM ingestion_queue iq
       LEFT JOIN users u ON iq.reviewed_by = u.id
       ${where}
       ORDER BY iq.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, safeLimit, safeOffset]
    );

    // Also get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM ingestion_queue iq ${where}`,
      params
    );

    res.json({
      data: rows,
      total: parseInt(countResult.rows[0].total, 10),
      limit: safeLimit,
      offset: safeOffset,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ingestion/queue ─────────────────────────────────────────────────
// Adds a new item to the queue (from agent or manual entry)
router.post('/queue', async (req, res, next) => {
  try {
    const { source, source_url, entity_type, entity_data, confidence } = req.body;

    if (!source || !VALID_SOURCES.includes(source)) {
      return res.status(400).json({ error: `source must be one of: ${VALID_SOURCES.join(', ')}` });
    }
    if (!entity_type || !VALID_ENTITY_TYPES.includes(entity_type)) {
      return res.status(400).json({ error: `entity_type must be one of: ${VALID_ENTITY_TYPES.join(', ')}` });
    }
    if (!entity_data || typeof entity_data !== 'object') {
      return res.status(400).json({ error: 'entity_data must be a JSON object' });
    }

    const conf = confidence != null ? Math.max(0, Math.min(1, parseFloat(confidence))) : 0.5;

    const { rows } = await pool.query(
      `INSERT INTO ingestion_queue (source, source_url, entity_type, entity_data, confidence)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [source, source_url || null, entity_type, JSON.stringify(entity_data), conf]
    );

    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/ingestion/queue/:id/approve ──────────────────────────────────────
// Marks item as approved and applies it (creates edge/event/company)
router.put('/queue/:id/approve', async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { notes } = req.body || {};

    await client.query('BEGIN');

    // Fetch the queue item
    const { rows } = await client.query(
      `SELECT * FROM ingestion_queue WHERE id = $1 AND status = 'pending'`,
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found or not in pending status' });
    }

    const item = rows[0];
    const data = item.entity_data;
    let appliedRecord = null;

    // Apply based on entity_type
    switch (item.entity_type) {
      case 'funding_round': {
        // Insert timeline event
        const eventDate = data.date || new Date().toISOString().slice(0, 10);
        const detail = `${data.round || 'Funding'}: $${((data.amount || 0) / 1_000_000).toFixed(1)}M${data.lead_investor ? ` led by ${data.lead_investor}` : ''}`;

        const eventResult = await client.query(
          `INSERT INTO timeline_events (event_date, event_type, company_name, detail)
           VALUES ($1, 'Funding', $2, $3)
           RETURNING id`,
          [eventDate, data.company, detail]
        );

        // If there's an investor, also create an invested_in edge
        if (data.lead_investor) {
          const investorSlug = data.lead_investor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
          const companySlug = data.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
          await client.query(
            `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year)
             VALUES ($1, $2, 'invested_in', $3, $4)
             ON CONFLICT DO NOTHING`,
            [investorSlug, companySlug, `${data.round || 'Investment'} - $${((data.amount || 0) / 1_000_000).toFixed(1)}M`, data.date ? parseInt(data.date.slice(0, 4), 10) : new Date().getFullYear()]
          );
        }

        appliedRecord = { timeline_event_id: eventResult.rows[0].id };
        break;
      }

      case 'partnership': {
        const companyASlug = (data.company_a || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        const companyBSlug = (data.company_b || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
        const year = data.date ? parseInt(data.date.slice(0, 4), 10) : new Date().getFullYear();

        const edgeResult = await client.query(
          `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year)
           VALUES ($1, $2, 'partners_with', $3, $4)
           RETURNING id`,
          [companyASlug, companyBSlug, data.details || `${data.type || 'Partnership'}`, year]
        );

        // Also create a timeline event for the partnership
        if (data.date) {
          await client.query(
            `INSERT INTO timeline_events (event_date, event_type, company_name, detail)
             VALUES ($1, 'Partnership', $2, $3)`,
            [data.date, data.company_a, `Partnership with ${data.company_b}: ${data.details || ''}`]
          );
        }

        appliedRecord = { edge_id: edgeResult.rows[0].id };
        break;
      }

      case 'edge': {
        const edgeResult = await client.query(
          `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [data.source_id, data.target_id, data.rel, data.note || null, data.event_year || null]
        );

        appliedRecord = { edge_id: edgeResult.rows[0].id };
        break;
      }

      case 'company': {
        const companyResult = await client.query(
          `INSERT INTO companies (slug, name, stage, sectors, city, region, founded, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (slug) DO UPDATE SET
             name = EXCLUDED.name,
             stage = EXCLUDED.stage,
             sectors = EXCLUDED.sectors,
             updated_at = NOW()
           RETURNING id`,
          [
            data.slug,
            data.name,
            data.stage || 'unknown',
            data.sectors || [],
            data.city || 'Unknown',
            data.region || 'unknown',
            data.founded || null,
            data.description || null,
          ]
        );

        appliedRecord = { company_id: companyResult.rows[0].id };
        break;
      }

      case 'hiring': {
        // Create a timeline event for hiring
        const eventDate = data.date || new Date().toISOString().slice(0, 10);
        const detail = `Hiring ${data.positions || '?'} ${data.department || ''} positions${data.details ? ': ' + data.details : ''}`;

        const eventResult = await client.query(
          `INSERT INTO timeline_events (event_date, event_type, company_name, detail)
           VALUES ($1, 'Hiring', $2, $3)
           RETURNING id`,
          [eventDate, data.company, detail]
        );

        appliedRecord = { timeline_event_id: eventResult.rows[0].id };
        break;
      }

      default:
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Unsupported entity_type: ${item.entity_type}` });
    }

    // Mark as applied
    await client.query(
      `UPDATE ingestion_queue
       SET status = 'applied', reviewed_at = NOW(), applied_at = NOW(), notes = $2
       WHERE id = $1`,
      [id, notes || null]
    );

    await client.query('COMMIT');

    res.json({
      data: { id: parseInt(id, 10), status: 'applied', applied: appliedRecord },
      message: `Item approved and applied as ${item.entity_type}`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// ── PUT /api/ingestion/queue/:id/reject ───────────────────────────────────────
// Marks item as rejected with optional notes
router.put('/queue/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body || {};

    const { rows } = await pool.query(
      `UPDATE ingestion_queue
       SET status = 'rejected', reviewed_at = NOW(), notes = $2
       WHERE id = $1 AND status = 'pending'
       RETURNING id, status`,
      [id, notes || null]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or not in pending status' });
    }

    res.json({ data: rows[0], message: 'Item rejected' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ingestion/queue/batch ───────────────────────────────────────────
// Batch approve or reject multiple items
router.post('/queue/batch', async (req, res, next) => {
  try {
    const { ids, action, notes } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve or reject' });
    }

    if (action === 'reject') {
      const { rowCount } = await pool.query(
        `UPDATE ingestion_queue
         SET status = 'rejected', reviewed_at = NOW(), notes = $2
         WHERE id = ANY($1) AND status = 'pending'`,
        [ids, notes || null]
      );
      return res.json({ data: { updated: rowCount }, message: `${rowCount} items rejected` });
    }

    // For batch approve, process each individually to apply side effects
    let approved = 0;
    const errors = [];
    for (const itemId of ids) {
      try {
        // Reuse the approve logic via an internal fetch-like approach
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const { rows } = await client.query(
            `SELECT * FROM ingestion_queue WHERE id = $1 AND status = 'pending'`,
            [itemId]
          );

          if (rows.length === 0) {
            await client.query('ROLLBACK');
            errors.push({ id: itemId, error: 'Not found or not pending' });
            continue;
          }

          const item = rows[0];
          const data = item.entity_data;

          switch (item.entity_type) {
            case 'funding_round': {
              const eventDate = data.date || new Date().toISOString().slice(0, 10);
              const detail = `${data.round || 'Funding'}: $${((data.amount || 0) / 1_000_000).toFixed(1)}M${data.lead_investor ? ` led by ${data.lead_investor}` : ''}`;
              await client.query(
                `INSERT INTO timeline_events (event_date, event_type, company_name, detail) VALUES ($1, 'Funding', $2, $3)`,
                [eventDate, data.company, detail]
              );
              if (data.lead_investor) {
                const investorSlug = data.lead_investor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
                const companySlug = data.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
                await client.query(
                  `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES ($1, $2, 'invested_in', $3, $4) ON CONFLICT DO NOTHING`,
                  [investorSlug, companySlug, `${data.round || 'Investment'} - $${((data.amount || 0) / 1_000_000).toFixed(1)}M`, data.date ? parseInt(data.date.slice(0, 4), 10) : new Date().getFullYear()]
                );
              }
              break;
            }
            case 'partnership': {
              const aSlug = (data.company_a || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
              const bSlug = (data.company_b || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
              const year = data.date ? parseInt(data.date.slice(0, 4), 10) : new Date().getFullYear();
              await client.query(
                `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES ($1, $2, 'partners_with', $3, $4)`,
                [aSlug, bSlug, data.details || '', year]
              );
              break;
            }
            case 'edge': {
              await client.query(
                `INSERT INTO graph_edges (source_id, target_id, rel, note, event_year) VALUES ($1, $2, $3, $4, $5)`,
                [data.source_id, data.target_id, data.rel, data.note || null, data.event_year || null]
              );
              break;
            }
            case 'company': {
              await client.query(
                `INSERT INTO companies (slug, name, stage, sectors, city, region, founded, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, stage = EXCLUDED.stage, sectors = EXCLUDED.sectors, updated_at = NOW()`,
                [data.slug, data.name, data.stage || 'unknown', data.sectors || [], data.city || 'Unknown', data.region || 'unknown', data.founded || null, data.description || null]
              );
              break;
            }
            case 'hiring': {
              const eventDate = data.date || new Date().toISOString().slice(0, 10);
              const detail = `Hiring ${data.positions || '?'} ${data.department || ''} positions${data.details ? ': ' + data.details : ''}`;
              await client.query(
                `INSERT INTO timeline_events (event_date, event_type, company_name, detail) VALUES ($1, 'Hiring', $2, $3)`,
                [eventDate, data.company, detail]
              );
              break;
            }
          }

          await client.query(
            `UPDATE ingestion_queue SET status = 'applied', reviewed_at = NOW(), applied_at = NOW(), notes = $2 WHERE id = $1`,
            [itemId, notes || null]
          );

          await client.query('COMMIT');
          approved++;
        } catch (innerErr) {
          await client.query('ROLLBACK');
          errors.push({ id: itemId, error: innerErr.message });
        } finally {
          client.release();
        }
      } catch (connErr) {
        errors.push({ id: itemId, error: connErr.message });
      }
    }

    res.json({
      data: { approved, errors: errors.length > 0 ? errors : undefined },
      message: `${approved} items approved${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ingestion/stats ──────────────────────────────────────────────────
// Queue stats: pending count, approved today, rejected today, by source
router.get('/stats', async (req, res, next) => {
  try {
    const [statusCounts, todayCounts, sourceCounts] = await Promise.all([
      pool.query(
        `SELECT status, COUNT(*)::int AS count FROM ingestion_queue GROUP BY status`
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM ingestion_queue
         WHERE reviewed_at >= CURRENT_DATE
         GROUP BY status`
      ),
      pool.query(
        `SELECT source, status, COUNT(*)::int AS count
         FROM ingestion_queue
         GROUP BY source, status
         ORDER BY source`
      ),
    ]);

    const byStatus = {};
    for (const row of statusCounts.rows) {
      byStatus[row.status] = row.count;
    }

    const today = {};
    for (const row of todayCounts.rows) {
      today[row.status] = row.count;
    }

    const bySource = {};
    for (const row of sourceCounts.rows) {
      if (!bySource[row.source]) bySource[row.source] = {};
      bySource[row.source][row.status] = row.count;
    }

    res.json({
      data: {
        pending: byStatus.pending || 0,
        approved: byStatus.approved || 0,
        applied: byStatus.applied || 0,
        rejected: byStatus.rejected || 0,
        approvedToday: today.approved || 0,
        appliedToday: today.applied || 0,
        rejectedToday: today.rejected || 0,
        bySource,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
