import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cfg from './config.js';
import pool from './db/pool.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cacheMiddleware, getCacheStats } from './middleware/cache.js';

import authRouter from './routes/auth.js';
import { optionalAuth } from './middleware/auth.js';
import companiesRouter from './routes/companies.js';
import fundsRouter from './routes/funds.js';
import graphRouter from './routes/graph.js';
import kpisRouter from './routes/kpis.js';
import timelineRouter from './routes/timeline.js';
import constantsRouter from './routes/constants.js';
import analysisRouter from './routes/analysis.js';
import adminRouter from './routes/admin.js';
import dashboardBatchRouter from './routes/dashboard-batch.js';
import stakeholderActivitiesRouter from './routes/stakeholder-activities.js';
import opportunitiesRouter from './routes/opportunities.js';
import graphTraversalRouter from './routes/graph-traversal.js';
import analyticsRouter from './routes/analytics.js';
import analyticsStructuralRouter from './routes/analytics-structural.js';
import analyticsPredictionsRouter from './routes/analytics-predictions.js';
import analyticsFlowRouter from './routes/analytics-flow.js';
import ingestionRouter from './routes/ingestion.js';
import subscribersRouter, { emailLogRouter } from './routes/subscribers.js';
import investorsRouter from './routes/investors.js';

const app = express();

app.use(compression());
app.use(cors({
  origin: cfg.nodeEnv === 'production'
    ? (process.env.CORS_ORIGIN || 'https://battlebornintel.com')
    : true,
  credentials: true,
}));
app.use(express.json());

// ── Simple in-memory rate limiter (no extra deps) ───────────────────────────
function makeRateLimiter({ windowMs = 60_000, max = 200, message = 'Too many requests' } = {}) {
  const counts = new Map();
  setInterval(() => counts.clear(), windowMs).unref();
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const current = (counts.get(key) || 0) + 1;
    counts.set(key, current);
    if (current > max) return res.status(429).json({ error: message });
    next();
  };
}

const publicLimit = makeRateLimiter({ windowMs: 60_000, max: 300 });
const adminLimit  = makeRateLimiter({ windowMs: 60_000, max: 10, message: 'Admin rate limit exceeded' });

// ── Admin API key guard ─────────────────────────────────────────────────────
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!cfg.adminApiKey || key !== cfg.adminApiKey) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Optional auth — populates req.user when a valid token is present
app.use(optionalAuth);

// Audit logging — logs requests when req.user exists
app.use(async (req, res, next) => {
  if (req.user && req.method !== 'OPTIONS') {
    // Fire-and-forget: don't block the request
    pool.query(
      `INSERT INTO audit_log (user_id, action, resource, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, req.method, req.originalUrl, req.ip, req.headers['user-agent']]
    ).catch(() => {}); // silently ignore audit failures
  }
  next();
});

// Auth routes (public — no auth required)
app.use('/api/auth', authRouter);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: '1.0.0' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Cache stats endpoint (admin-only)
app.get('/api/cache-stats', adminLimit, requireAdminKey, (req, res) => {
  res.json(getCacheStats());
});

// Routes with per-route caching + rate limiting on public routes
//
// TTL reference (server-side in-memory cache):
//   60s  — activity feed, analysis/brief, analysis/risks  (data changes moderately often)
//   120s — timeline, kpis/sectors                         (data changes rarely)
//   300s — companies, funds, graph, constants, opportunities (very stable data)
//
// Cache-Control header strategy:
//   private — user-specific or frequently changing data (activity feed, analysis)
//   public  — shared, stable data safe for CDN/proxy caching
app.use('/api/companies',              publicLimit, cacheMiddleware('companies',             300_000, { cacheControl: 'public, max-age=3600' }),  companiesRouter);
app.use('/api/funds',                  publicLimit, cacheMiddleware('funds',                 300_000, { cacheControl: 'public, max-age=3600' }),  fundsRouter);
app.use('/api/graph',                  publicLimit, cacheMiddleware('graph',                 300_000, { cacheControl: 'public, max-age=3600' }),  graphRouter);
app.use('/api/graph',                  publicLimit, cacheMiddleware('graphTraversal',        300_000, { cacheControl: 'public, max-age=300' }),   graphTraversalRouter);
app.use('/api/kpis',                   publicLimit, cacheMiddleware('kpis',                  120_000, { cacheControl: 'public, max-age=120' }),   kpisRouter);
app.use('/api/timeline',               publicLimit, cacheMiddleware('timeline',              120_000, { cacheControl: 'public, max-age=120' }),   timelineRouter);
app.use('/api/constants',              publicLimit, cacheMiddleware('constants',             600_000, { cacheControl: 'public, max-age=3600' }),  constantsRouter);
app.use('/api/analysis',               publicLimit, cacheMiddleware('analysis',               60_000, { cacheControl: 'private, max-age=60' }),   analysisRouter);
app.use('/api/stakeholder-activities', publicLimit, cacheMiddleware('stakeholderActivities',  60_000, { cacheControl: 'private, max-age=60' }),   stakeholderActivitiesRouter);
app.use('/api/opportunities',          publicLimit, cacheMiddleware('opportunities',         300_000, { cacheControl: 'public, max-age=3600' }),  opportunitiesRouter);
app.use('/api/investors',              publicLimit, cacheMiddleware('investors',             300_000, { cacheControl: 'public, max-age=3600' }),  investorsRouter);
// Analytics routes (Phase 2 engines)
app.use('/api/analytics', publicLimit, cacheMiddleware('analytics',           300_000, { cacheControl: 'public, max-age=300' }), analyticsRouter);
app.use('/api/analytics', publicLimit, cacheMiddleware('analyticsStructural', 300_000, { cacheControl: 'public, max-age=300' }), analyticsStructuralRouter);
app.use('/api/analytics', publicLimit, cacheMiddleware('analyticsPredictions',300_000, { cacheControl: 'public, max-age=300' }), analyticsPredictionsRouter);
app.use('/api/analytics', publicLimit, cacheMiddleware('analyticsFlow',       300_000, { cacheControl: 'public, max-age=300' }), analyticsFlowRouter);

// Admin routes: key-gated + strict rate limit
app.use('/api/admin', adminLimit, requireAdminKey, adminRouter);

// Ingestion queue: admin-key-gated for write ops, read ops for analysts
app.use('/api/ingestion', adminLimit, requireAdminKey, ingestionRouter);

// Email subscribers & log: admin-key-gated
app.use('/api/subscribers', adminLimit, requireAdminKey, subscribersRouter);
app.use('/api/email-log', adminLimit, requireAdminKey, emailLogRouter);

// High-impact batch endpoint for dashboard
app.use('/api/dashboard-batch', publicLimit, dashboardBatchRouter);

// Error handler
app.use(errorHandler);

app.listen(cfg.port, () => {
  console.log(`BBI API listening on port ${cfg.port}`);

  // Pre-warm the graph cache so the first user request hits warm cache
  setTimeout(async () => {
    try {
      const base = `http://localhost:${cfg.port}/api/graph`;
      console.log('[cache-warm] Pre-warming graph cache...');
      // Warm both the full and lightweight endpoints in parallel
      const [res1, res2] = await Promise.all([
        fetch(base),
        fetch(`${base}/light`),
      ]);
      if (res1.ok && res2.ok) {
        console.log('[cache-warm] Graph cache warmed successfully (full + light)');
      } else {
        console.warn(`[cache-warm] Graph warm-up partial: full=${res1.status}, light=${res2.status}`);
      }
    } catch (err) {
      console.warn('[cache-warm] Graph warm-up failed:', err.message);
    }
  }, 1000);
});
