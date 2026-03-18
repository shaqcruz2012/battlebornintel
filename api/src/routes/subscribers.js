import { Router } from 'express';
import pool from '../db/pool.js';
import { sendWeeklyBrief } from '../services/emailService.js';

const router = Router();

// GET /api/subscribers — list all (admin only, gated at index.js)
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, name, subscription_type, is_active, created_at, updated_at
       FROM email_subscribers ORDER BY created_at DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscribers — add subscriber
router.post('/', async (req, res, next) => {
  try {
    const { email, name, subscription_type = 'weekly_brief', user_id } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const { rows } = await pool.query(
      `INSERT INTO email_subscribers (email, name, subscription_type, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, subscription_type, is_active, unsubscribe_token, created_at`,
      [email, name || null, subscription_type, user_id || null]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Subscriber already exists' });
    }
    next(err);
  }
});

// PUT /api/subscribers/:id — update subscription
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, subscription_type, is_active } = req.body;

    const { rows } = await pool.query(
      `UPDATE email_subscribers
       SET email = COALESCE($1, email),
           name = COALESCE($2, name),
           subscription_type = COALESCE($3, subscription_type),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, name, subscription_type, is_active, updated_at`,
      [email || null, name || null, subscription_type || null, is_active, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subscribers/:id — deactivate (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE email_subscribers SET is_active = false, updated_at = NOW()
       WHERE id = $1 RETURNING id, email, is_active`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Subscriber not found' });
    res.json({ data: rows[0], message: 'Subscriber deactivated' });
  } catch (err) {
    next(err);
  }
});

// GET /api/subscribers/unsubscribe/:token — public unsubscribe link (no admin key needed)
router.get('/unsubscribe/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rows } = await pool.query(
      `UPDATE email_subscribers SET is_active = false, updated_at = NOW()
       WHERE unsubscribe_token = $1 AND is_active = true
       RETURNING email`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or already unsubscribed' });
    }
    res.json({ message: `${rows[0].email} has been unsubscribed.` });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscribers/send-brief — trigger manual brief send (admin)
router.post('/send-brief', async (req, res, next) => {
  try {
    const { html, text } = req.body;
    if (!html && !text) {
      return res.status(400).json({ error: 'Provide html and/or text body for the brief' });
    }
    const results = await sendWeeklyBrief(html || '', text || '');
    res.json({ data: results, message: `Brief sent to ${results.length} subscribers` });
  } catch (err) {
    next(err);
  }
});

// GET /api/email-log — view send history (admin, mounted separately in index.js)
export const emailLogRouter = Router();
emailLogRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 500);
    const { rows } = await pool.query(
      `SELECT el.id, el.email_type, el.subject, el.status, el.error_message,
              el.sent_at, el.created_at, es.email AS subscriber_email
       FROM email_log el
       LEFT JOIN email_subscribers es ON es.id = el.subscriber_id
       ORDER BY el.created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
