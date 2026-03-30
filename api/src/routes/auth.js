import { Router } from 'express';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import cfg from '../config.js';
import { authenticate } from '../middleware/auth.js';
import { logAuditEvent, AuditAction } from '../services/auditService.js';
import { logger } from '../logger.js';

const router = Router();

// ── Login rate limiter: 5 attempts per 15 minutes per IP ────────────────────
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX = 5;
setInterval(() => loginAttempts.clear(), LOGIN_WINDOW_MS).unref();

function loginRateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  const count = (loginAttempts.get(key) || 0) + 1;
  loginAttempts.set(key, count);
  if (count > LOGIN_MAX) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  next();
}

/** Hash a JWT token for session storage (SHA-256, hex). */
function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// ── POST /auth/login ────────────────────────────────────────────────────────
router.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, display_name, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      await logAuditEvent(null, AuditAction.LOGIN_FAILED, 'user', email, { reason: 'invalid_credentials' }, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await logAuditEvent(user.id, AuditAction.LOGIN_FAILED, 'user', String(user.id), { reason: 'bad_password' }, req);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Issue JWT
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      cfg.jwtSecret,
      { expiresIn: cfg.jwtExpiresIn },
    );

    // Store session
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + parseExpiry(cfg.jwtExpiresIn));
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, tokenHash, req.ip, req.headers['user-agent'] || null, expiresAt],
    );

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    await logAuditEvent(user.id, AuditAction.LOGIN, 'user', String(user.id), null, req);

    res.json({
      data: {
        token,
        user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /auth/logout ───────────────────────────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header.slice(7);
    const tokenHash = hashToken(token);

    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
    await logAuditEvent(req.user.id, AuditAction.LOGOUT, 'user', String(req.user.id), null, req);

    res.json({ data: null, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// ── GET /auth/me ────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, display_name, role, is_active, mfa_enabled, created_at, last_login_at FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ── PUT /auth/password ──────────────────────────────────────────────────────
router.put('/password', authenticate, async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }

    if (new_password.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);

    // Invalidate all other sessions for this user
    const currentToken = req.headers.authorization.slice(7);
    const currentHash = hashToken(currentToken);
    await pool.query('DELETE FROM sessions WHERE user_id = $1 AND token_hash != $2', [req.user.id, currentHash]);

    await logAuditEvent(req.user.id, AuditAction.PASSWORD_CHANGED, 'user', String(req.user.id), null, req);

    res.json({ data: null, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * Parse a JWT expiry string like '24h', '7d', '3600s' into milliseconds.
 */
function parseExpiry(val) {
  if (typeof val === 'number') return val * 1000;
  const match = String(val).match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 24 * 60 * 60 * 1000; // default 24h
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return num * multipliers[unit];
}

export default router;
