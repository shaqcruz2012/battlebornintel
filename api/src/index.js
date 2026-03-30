import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import cfg from './config.js';
import pool from './db/pool.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cacheMiddleware, getCacheStats } from './middleware/cache.js';
import { requestLogger } from './middleware/requestLogger.js';
import { enforceHttps, securityHeaders } from './middleware/security.js';
import logger, { runWithRequestContext } from './logger.js';

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
import graphAnalyticsRouter from './routes/graph-analytics.js';
import authRouter from './routes/auth.js';
import { optionalAuth } from './middleware/auth.js';

const app = express();

app.use(enforceHttps);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // needed for inline styles in React
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:5173'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
app.use(securityHeaders);
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-ID', req.id);
  runWithRequestContext(req.id, () => next());
});
app.use(requestLogger);
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

// ── Versioned API router ────────────────────────────────────────────────────
// All API routes are mounted on a sub-router, which is then mounted at both
// /api (backwards compat) and /api/v1 (versioned).
const apiRouter = express.Router();

// Auth routes (login/logout/me — no auth required for login)
apiRouter.use('/auth', authRouter);

// Optional auth on all routes — sets req.user if valid token present
apiRouter.use(optionalAuth);

// Health check
apiRouter.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: '1.0.0' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Cache stats endpoint (for monitoring)
apiRouter.get('/cache-stats', (req, res) => {
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
apiRouter.use('/companies',              publicLimit, cacheMiddleware('companies',             300_000, { cacheControl: 'public, max-age=3600' }),  companiesRouter);
apiRouter.use('/funds',                  publicLimit, cacheMiddleware('funds',                 300_000, { cacheControl: 'public, max-age=3600' }),  fundsRouter);
apiRouter.use('/graph',                  publicLimit, cacheMiddleware('graph',                 300_000, { cacheControl: 'public, max-age=3600' }),  graphRouter);
apiRouter.use('/kpis',                   publicLimit, cacheMiddleware('kpis',                  120_000, { cacheControl: 'public, max-age=120' }),   kpisRouter);
apiRouter.use('/timeline',               publicLimit, cacheMiddleware('timeline',              120_000, { cacheControl: 'public, max-age=120' }),   timelineRouter);
apiRouter.use('/constants',              publicLimit, cacheMiddleware('constants',             600_000, { cacheControl: 'public, max-age=3600' }),  constantsRouter);
apiRouter.use('/analysis',               publicLimit, cacheMiddleware('analysis',               60_000, { cacheControl: 'private, max-age=60' }),   analysisRouter);
apiRouter.use('/stakeholder-activities', publicLimit, cacheMiddleware('stakeholderActivities',  60_000, { cacheControl: 'private, max-age=60' }),   stakeholderActivitiesRouter);
apiRouter.use('/opportunities',          publicLimit, cacheMiddleware('opportunities',         300_000, { cacheControl: 'public, max-age=3600' }),  opportunitiesRouter);
apiRouter.use('/indicators',             publicLimit, cacheMiddleware('indicators',            120_000, { cacheControl: 'public, max-age=120' }),   indicatorsRouter);
apiRouter.use('/scenarios',              publicLimit, cacheMiddleware('scenarios',             120_000, { cacheControl: 'public, max-age=120' }),   scenariosRouter);
apiRouter.use('/forecasts',              publicLimit, cacheMiddleware('forecasts',             120_000, { cacheControl: 'public, max-age=120' }),   forecastsRouter);
apiRouter.use('/graph-analytics',        publicLimit, cacheMiddleware('graphAnalytics',       120_000, { cacheControl: 'public, max-age=120' }),   graphAnalyticsRouter);
// Admin routes: key-gated + strict rate limit
apiRouter.use('/admin', adminLimit, requireAdminKey, adminRouter);

// High-impact batch endpoint for dashboard
apiRouter.use('/dashboard-batch', publicLimit, dashboardBatchRouter);

// Mount the API router at both /api (backwards compat) and /api/v1 (versioned)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Error handler
app.use(errorHandler);

const server = app.listen(cfg.port, () => {
  logger.info('BBI API listening', { port: cfg.port });
});

async function shutdown(signal) {
  logger.info('Shutdown initiated', { signal });
  server.close(() => {
    logger.info('HTTP server closed');
    pool.end().then(() => {
      logger.info('Database pool closed');
      process.exit(0);
    }).catch(() => process.exit(1));
  });
  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
