/**
 * BBI API Server
 * Express + better-sqlite3 backend for Battle Born Intelligence
 */

import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import dataRouter from './routes/data.js';
import companiesRouter from './routes/companies.js';
import fundsRouter from './routes/funds.js';
import timelineRouter from './routes/timeline.js';
import graphRouter from './routes/graph.js';
import enterpriseRouter from './routes/enterprise.js';
import searchRouter from './routes/search.js';
import metricsRouter from './routes/metrics.js';

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
    'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/:vertical/data', dataRouter);
app.use('/api/:vertical/companies', companiesRouter);
app.use('/api/:vertical/funds', fundsRouter);
app.use('/api/:vertical/timeline', timelineRouter);
app.use('/api/:vertical/graph', graphRouter);
app.use('/api/:vertical/enterprise', enterpriseRouter);
app.use('/api/:vertical/search', searchRouter);
app.use('/api/:vertical/graph/metrics', metricsRouter);

// Health check
app.get('/api/health', (req, res) => {
  const db = getDb();
  const verticals = db.prepare('SELECT id, name FROM verticals').all();
  res.json({ status: 'ok', verticals });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('API Error:', err.message);
  res.status(500).json({ error: err.message });
});

// Start
const db = getDb();
const verticals = db.prepare("SELECT id FROM verticals").all().map(v => v.id);
app.listen(PORT, () => {
  console.log(`\n  BBI API Server running on http://localhost:${PORT}`);
  console.log(`  Verticals: ${verticals.length > 0 ? verticals.join(', ') : '(none — run migrate first)'}\n`);
});
