import express from 'express';
import cors from 'cors';
import cfg from './config.js';
import pool from './db/pool.js';
import { errorHandler } from './middleware/errorHandler.js';

import companiesRouter from './routes/companies.js';
import fundsRouter from './routes/funds.js';
import graphRouter from './routes/graph.js';
import kpisRouter from './routes/kpis.js';
import timelineRouter from './routes/timeline.js';
import constantsRouter from './routes/constants.js';
import analysisRouter from './routes/analysis.js';
import adminRouter from './routes/admin.js';

const app = express();

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

// Routes
app.use('/api/companies', companiesRouter);
app.use('/api/funds', fundsRouter);
app.use('/api/graph', graphRouter);
app.use('/api/kpis', kpisRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/constants', constantsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/admin', adminRouter);

// Error handler
app.use(errorHandler);

app.listen(cfg.port, () => {
  console.log(`BBI API listening on port ${cfg.port}`);
});
