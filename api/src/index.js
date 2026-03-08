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

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());

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

// Routes with per-route caching
// Standard GET endpoints: browser cache 1 hour (public, max-age=3600)
app.use('/api/companies', cacheMiddleware('companies', 300000, { cacheControl: 'public, max-age=3600' }), companiesRouter);
app.use('/api/funds', cacheMiddleware('funds', 300000, { cacheControl: 'public, max-age=3600' }), fundsRouter);
app.use('/api/graph', cacheMiddleware('graph', 300000, { cacheControl: 'public, max-age=3600' }), graphRouter);
app.use('/api/kpis', cacheMiddleware('kpis', 300000, { cacheControl: 'public, max-age=3600' }), kpisRouter);
app.use('/api/timeline', cacheMiddleware('timeline', 300000, { cacheControl: 'public, max-age=3600' }), timelineRouter);
app.use('/api/constants', cacheMiddleware('constants', 600000, { cacheControl: 'public, max-age=3600' }), constantsRouter);
app.use('/api/analysis', cacheMiddleware('analysis', 300000, { cacheControl: 'public, max-age=3600' }), analysisRouter);
app.use('/api/stakeholder-activities', cacheMiddleware('stakeholderActivities', 300000, { cacheControl: 'public, max-age=3600' }), stakeholderActivitiesRouter);
app.use('/api/opportunities', cacheMiddleware('opportunities', 300000, { cacheControl: 'public, max-age=3600' }), opportunitiesRouter);
app.use('/api/admin', adminRouter);

// High-impact batch endpoint for dashboard
app.use('/api/dashboard-batch', dashboardBatchRouter);

// Error handler
app.use(errorHandler);

app.listen(cfg.port, () => {
  console.log(`BBI API listening on port ${cfg.port}`);
});
