import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cfg from '../config.js';
import pool from '../db/pool.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '24h';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    cfg.jwtSecret,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// POST /api/auth/register — create account (admin only, or first user is auto-admin)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, organization } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if any users exist — first user becomes admin
    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
    const isFirstUser = countRows[0].cnt === 0;

    // If not the first user, require admin auth
    if (!isFirstUser) {
      const header = req.headers.authorization;
      const token = header && header.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Authentication required' });
      try {
        const caller = jwt.verify(token, cfg.jwtSecret);
        if (caller.role !== 'admin') {
          return res.status(403).json({ error: 'Only admins can register new users' });
        }
      } catch {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
    }

    // Check for duplicate email
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const role = isFirstUser ? 'admin' : (req.body.role || 'viewer');

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, organization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, organization, is_active, created_at`,
      [email, passwordHash, name, role, organization || null]
    );

    const user = rows[0];
    const token = signToken(user);

    res.status(201).json({ data: { user, token } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — returns JWT token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, name, role, organization, is_active FROM users WHERE email = $1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = signToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({ data: { user: safeUser, token } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — returns current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, role, organization, is_active, last_login, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me — update profile
router.put('/me', authenticateToken, async (req, res, next) => {
  try {
    const { name, organization } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (name) { updates.push(`name = $${idx++}`); values.push(name); }
    if (organization !== undefined) { updates.push(`organization = $${idx++}`); values.push(organization || null); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, email, name, role, organization, is_active, last_login, created_at`,
      values
    );

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
