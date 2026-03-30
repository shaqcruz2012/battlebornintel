# API Development Context

Use this when creating or modifying Express.js routes in `api/src/`.

## Structure
```
api/src/
  index.js          — App setup, middleware, route mounting
  config.js         — Environment config (port, DB, admin key)
  db/pool.js        — pg Pool instance
  db/queries/       — Query functions (one file per domain)
  routes/           — Express routers (one file per domain)
  engine/           — Scoring (IRS), graph metrics computation
  middleware/        — errorHandler, cache
  services/         — scoringService, graphService
```

## Route Pattern
```javascript
import { Router } from 'express';
import { getThings, getThing } from '../db/queries/things.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getThings(req.query);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

export default router;
```

## Mounting in index.js
```javascript
import thingsRouter from './routes/things.js';
app.use('/api/things', publicLimit, cacheMiddleware('things', 120_000, { cacheControl: 'public, max-age=120' }), thingsRouter);
```

Cache TTL guidelines:
- 60s: frequently changing (analysis, activities)
- 120s: moderate (kpis, timeline, indicators, scenarios, forecasts)
- 300s: stable (companies, funds, graph, opportunities)
- 600s: very stable (constants)

## Query Pattern
```javascript
import pool from '../pool.js';

export async function getThings(filters = {}) {
  const { rows } = await pool.query('SELECT * FROM things WHERE ...');
  return rows;
}
```

## Middleware
- `publicLimit` — 300 req/min rate limiter
- `adminLimit` — 10 req/min for admin routes
- `requireAdminKey` — checks `x-admin-key` header
- `cacheMiddleware(name, ttlMs, { cacheControl })` — in-memory response cache
- `errorHandler` — catches errors, returns JSON

## Current Routes
| Route | Router File | Query File |
|-------|------------|------------|
| /api/companies | routes/companies.js | queries/companies.js |
| /api/funds | routes/funds.js | queries/funds.js |
| /api/graph | routes/graph.js | queries/graph.js |
| /api/kpis | routes/kpis.js | queries/kpis.js |
| /api/timeline | routes/timeline.js | queries/timeline.js |
| /api/analysis | routes/analysis.js | queries/analysis.js |
| /api/constants | routes/constants.js | — |
| /api/indicators | routes/indicators.js | queries/indicators.js |
| /api/scenarios | routes/scenarios.js | queries/scenarios.js |
| /api/forecasts | routes/forecasts.js | queries/scenarios.js |
| /api/opportunities | routes/opportunities.js | queries/opportunities.js |
| /api/stakeholder-activities | routes/stakeholder-activities.js | queries/stakeholder-activities.js |
| /api/admin | routes/admin.js | — |
| /api/dashboard-batch | routes/dashboard-batch.js | — |
