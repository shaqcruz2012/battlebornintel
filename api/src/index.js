import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cfg from './config.js';
import pool from './db/pool.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cacheMiddleware, getCacheStats } from './middleware/cache.js';

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
import indicatorsRouter from './routes/indicators.js';
import scenariosRouter from './routes/scenarios.js';
import forecastsRouter from './routes/forecasts.js';

const app = express();

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: '1.0.0' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Cache stats endpoint (for monitoring)
app.get('/api/cache-stats', (req, res) => {
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
app.use('/api/kpis',                   publicLimit, cacheMiddleware('kpis',                  120_000, { cacheControl: 'public, max-age=120' }),   kpisRouter);
app.use('/api/timeline',               publicLimit, cacheMiddleware('timeline',              120_000, { cacheControl: 'public, max-age=120' }),   timelineRouter);
app.use('/api/constants',              publicLimit, cacheMiddleware('constants',             600_000, { cacheControl: 'public, max-age=3600' }),  constantsRouter);
app.use('/api/analysis',               publicLimit, cacheMiddleware('analysis',               60_000, { cacheControl: 'private, max-age=60' }),   analysisRouter);
app.use('/api/stakeholder-activities', publicLimit, cacheMiddleware('stakeholderActivities',  60_000, { cacheControl: 'private, max-age=60' }),   stakeholderActivitiesRouter);
app.use('/api/opportunities',          publicLimit, cacheMiddleware('opportunities',         300_000, { cacheControl: 'public, max-age=3600' }),  opportunitiesRouter);
app.use('/api/indicators',             publicLimit, cacheMiddleware('indicators',            120_000, { cacheControl: 'public, max-age=120' }),   indicatorsRouter);
app.use('/api/scenarios',              publicLimit, cacheMiddleware('scenarios',             120_000, { cacheControl: 'public, max-age=120' }),   scenariosRouter);
app.use('/api/forecasts',              publicLimit, cacheMiddleware('forecasts',             120_000, { cacheControl: 'public, max-age=120' }),   forecastsRouter);
// Admin routes: key-gated + strict rate limit
app.use('/api/admin', adminLimit, requireAdminKey, adminRouter);

// High-impact batch endpoint for dashboard
app.use('/api/dashboard-batch', publicLimit, dashboardBatchRouter);

// Error handler
app.use(errorHandler);

app.listen(cfg.port, () => {
  console.log(`BBI API listening on port ${cfg.port}`);
});
