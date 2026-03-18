# API Performance Optimization - Implementation Checklist

## CYCLE 1: Database Indexes ✓ PRIORITY: HIGH

### Difficulty: 1/5 | Impact: 150-200ms | Effort: 30 minutes

**Rationale:** Eliminates full table scans on filtered queries. No code changes required.

### Checklist

- [ ] Connect to production database
- [ ] Run index creation SQL script:

```sql
-- Companies filtering indexes
CREATE INDEX IF NOT EXISTS idx_companies_stage ON companies(stage);
CREATE INDEX IF NOT EXISTS idx_companies_region ON companies(region);
CREATE INDEX IF NOT EXISTS idx_companies_stage_region ON companies(stage, region);
CREATE INDEX IF NOT EXISTS idx_companies_sectors ON companies USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_companies_eligible ON companies USING GIN(eligible);

-- Graph edges indexes (critical for graph queries)
CREATE INDEX IF NOT EXISTS idx_graph_edges_source_target ON graph_edges(source_id, target_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_rel ON graph_edges(rel);
CREATE INDEX IF NOT EXISTS idx_graph_edges_rel_target ON graph_edges(rel, target_id);

-- Related table indexes
CREATE INDEX IF NOT EXISTS idx_listings_company_id ON listings(company_id);
CREATE INDEX IF NOT EXISTS idx_computed_scores_company_computed ON computed_scores(company_id, computed_at DESC);
CREATE INDEX IF NOT EXISTS idx_constants_key ON constants(key);

-- Check index sizes
SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

- [ ] Verify indexes were created: `\di` in psql
- [ ] Run ANALYZE to update statistics:
  ```sql
  ANALYZE companies;
  ANALYZE graph_edges;
  ANALYZE computed_scores;
  ```

- [ ] Test query performance with EXPLAIN:

```sql
-- Before optimization should show "Seq Scan"
-- After should show "Index Scan"
EXPLAIN ANALYZE
SELECT * FROM companies WHERE stage = 'seed' AND region = 'las_vegas';

EXPLAIN ANALYZE
SELECT * FROM graph_edges WHERE source_id = 'c_123' OR target_id = 'c_123';
```

- [ ] Document index creation in database changelog
- [ ] Monitor index performance over 1 week
- [ ] Check for unused indexes: `pg_stat_user_indexes WHERE idx_scan = 0`

### Success Criteria
- [ ] All index creation queries succeed
- [ ] Query execution times reduce by 70%+ for filtered queries
- [ ] No "Seq Scan" in EXPLAIN ANALYZE output for indexed columns

### Rollback Plan
```sql
DROP INDEX IF EXISTS idx_companies_stage;
DROP INDEX IF EXISTS idx_companies_region;
-- etc...
```

---

## CYCLE 2: Query Consolidation ✓ PRIORITY: HIGH

### Difficulty: 2/5 | Impact: 80-120ms | Effort: 4 hours

**Rationale:** Eliminates N+1 query pattern in `getCompanyById()`. Reduces DB round-trips from 3 to 1.

### Checklist

- [ ] Review current `getCompanyById()` implementation
- [ ] Create test file: `api/src/db/queries/__tests__/companies.test.js`

```javascript
import { getCompanyById } from '../companies.js';

describe('getCompanyById', () => {
  it('should return company with edges and listings in single query', async () => {
    const company = await getCompanyById(1);
    expect(company).toHaveProperty('edges');
    expect(company).toHaveProperty('listings');
    expect(Array.isArray(company.edges)).toBe(true);
    expect(Array.isArray(company.listings)).toBe(true);
  });

  it('should return null for non-existent company', async () => {
    const company = await getCompanyById(999999);
    expect(company).toBeNull();
  });

  it('should preserve all fields in formatted output', async () => {
    const company = await getCompanyById(1);
    expect(company).toHaveProperty('id');
    expect(company).toHaveProperty('name');
    expect(company).toHaveProperty('irs');
    expect(company).toHaveProperty('edges');
  });
});
```

- [ ] Update `companies.js` with combined query version
- [ ] Add `formatCompanyWithDetails()` helper function
- [ ] Run tests: `npm test -- companies.test.js`
- [ ] Verify API response structure hasn't changed
- [ ] Test with real API call: `curl http://localhost:3001/api/companies/1`
- [ ] Verify response includes `edges` and `listings` arrays
- [ ] Compare old vs new execution time with profiler

### Implementation Steps

1. **Backup original function:**
   ```javascript
   // Keep old function for reference/rollback
   export async function getCompanyByIdOld(id) { /* ... */ }
   ```

2. **Implement new combined query:**
   - Use PostgreSQL JSON aggregation
   - Flatten edge/listing data into company object
   - Test with edge cases (company with no edges, no listings)

3. **Test with integration test:**
   ```bash
   npm run test:integration -- routes/companies.test.js
   ```

4. **Performance benchmark:**
   ```javascript
   const start = Date.now();
   const company = await getCompanyById(1);
   console.log(`Query took ${Date.now() - start}ms`);
   ```

### Success Criteria
- [ ] Single query instead of 3 queries
- [ ] API response identical to previous version
- [ ] All tests passing
- [ ] Query execution time < 50ms (down from 120ms)
- [ ] No regression in other routes

### Rollback Plan
```javascript
// Restore original multi-query function
export { getCompanyByIdOld as getCompanyById };
```

---

## CYCLE 3: Server-Side Aggregation ✓ PRIORITY: HIGH

### Difficulty: 3/5 | Impact: 120-180ms | Effort: 8 hours

**Rationale:** Move KPI calculations from JavaScript to SQL. Dramatically reduces data transfer and processing.

### Checklist

- [ ] Create test file: `api/src/db/queries/__tests__/kpis.test.js`

```javascript
import { getKpis, getSectorStats } from '../kpis.js';

describe('getKpis', () => {
  it('should return all KPI fields', async () => {
    const kpis = await getKpis({});
    expect(kpis).toHaveProperty('capitalDeployed');
    expect(kpis).toHaveProperty('ecosystemCapacity');
    expect(kpis).toHaveProperty('innovationIndex');
  });

  it('should filter by stage', async () => {
    const kpis1 = await getKpis({ stage: 'seed' });
    const kpis2 = await getKpis({ stage: 'growth' });
    expect(kpis1.capitalDeployed.value).not.toBe(kpis2.capitalDeployed.value);
  });

  it('should filter by region', async () => {
    const kpis = await getKpis({ region: 'las_vegas' });
    expect(kpis.ecosystemCapacity.value).toBeGreaterThanOrEqual(0);
  });
});

describe('getSectorStats', () => {
  it('should return sector statistics', async () => {
    const stats = await getSectorStats();
    expect(Array.isArray(stats)).toBe(true);
    expect(stats[0]).toHaveProperty('sector');
    expect(stats[0]).toHaveProperty('count');
    expect(stats[0]).toHaveProperty('heat');
  });
});
```

- [ ] Analyze current queries with `EXPLAIN`:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM companies;
  EXPLAIN ANALYZE SELECT * FROM funds;
  ```

- [ ] Create new optimized `getKpis()` with server-side aggregation
- [ ] Create new optimized `getSectorStats()` using GROUP BY
- [ ] Write unit tests for calculation logic
- [ ] Run tests: `npm test -- kpis.test.js`
- [ ] Compare old vs new data transfer size
- [ ] Profile execution time

### Implementation Steps

1. **Create aggregation queries:**
   - Use `SUM()`, `AVG()`, `COUNT()` in SQL
   - Use `LEFT JOIN` for efficient filtering
   - Use CTEs (WITH clause) for readability

2. **Test calculations:**
   - Verify innovation index calculation matches old version
   - Test with various filter combinations
   - Compare results before/after

3. **Performance testing:**
   ```bash
   # Before
   npm run test:perf -- /api/kpis?stage=seed

   # After (should be much faster)
   npm run test:perf -- /api/kpis?stage=seed
   ```

### Success Criteria
- [ ] Data transfer < 5KB (down from 50KB)
- [ ] Query execution time < 100ms
- [ ] KPI values identical to previous implementation
- [ ] All tests passing
- [ ] `getSectorStats()` completes in < 50ms

### Rollback Plan
```javascript
// Keep old functions for fallback
export { getKpisOld as getKpis };
```

---

## CYCLE 4: Redis Caching Layer ✓ PRIORITY: MEDIUM

### Difficulty: 3/5 | Impact: 150-250ms | Effort: 6 hours

**Rationale:** Cache responses for identical requests within TTL. Huge improvement for repeated queries.

### Checklist

- [ ] Install Redis: `npm install redis`
- [ ] Create Redis setup script: `api/scripts/setup-redis.sh`

```bash
#!/bin/bash
# Start Redis Docker container
docker run -d --name redis-bbi \
  -p 6379:6379 \
  -v redis-data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

- [ ] Test Redis connection:
  ```bash
  redis-cli ping
  # Should return: PONG
  ```

- [ ] Create `api/src/middleware/cacheMiddleware.js`:
  - Implement cache key generation
  - Implement cache get/set logic
  - Add cache headers (X-Cache: HIT/MISS)

- [ ] Create integration test for caching:

```javascript
describe('Cache Middleware', () => {
  it('should return cached response on second request', async () => {
    const res1 = await fetch('/api/companies');
    const header1 = res1.headers.get('X-Cache'); // MISS

    const res2 = await fetch('/api/companies');
    const header2 = res2.headers.get('X-Cache'); // HIT

    expect(header1).toBe('MISS');
    expect(header2).toBe('HIT');
  });

  it('should have identical response body for cache hit', async () => {
    const res1 = await fetch('/api/companies');
    const body1 = await res1.json();

    const res2 = await fetch('/api/companies');
    const body2 = await res2.json();

    expect(body1).toEqual(body2);
  });
});
```

- [ ] Apply caching middleware to GET routes:
  - `/api/constants` - 1 hour (3600s) TTL
  - `/api/kpis` - 5 minute (300s) TTL
  - `/api/graph` - 10 minute (600s) TTL
  - `/api/companies` - 10 minute (600s) TTL
  - `/api/graph/metrics` - 1 hour (3600s) TTL

- [ ] Test cache invalidation on admin updates
- [ ] Set up cache monitoring dashboard
- [ ] Configure Redis persistence (AOF)
- [ ] Set up cache key expiration strategy

### Implementation Steps

1. **Create middleware:**
   ```javascript
   // Implement Redis client
   // Generate cache keys from route + params
   // Implement cache expiration logic
   ```

2. **Add cache invalidation:**
   ```javascript
   // On POST/PUT/DELETE, invalidate related caches
   await clearCachePattern('/api/companies/*');
   ```

3. **Monitor cache effectiveness:**
   - Track hit rates per endpoint
   - Monitor Redis memory usage
   - Set up alerts for eviction events

### Success Criteria
- [ ] Redis running and accepting connections
- [ ] Cache middleware installed and working
- [ ] X-Cache headers showing HIT/MISS status
- [ ] Second identical request < 5ms (vs. 100-300ms cold)
- [ ] Cache hit ratio > 70% for typical usage patterns

### Rollback Plan
```bash
# Disable caching middleware
CACHE_ENABLED=false npm start

# Or remove cacheMiddleware calls from routes
```

---

## CYCLE 5: Field Selection API ✓ PRIORITY: MEDIUM

### Difficulty: 2/5 | Impact: 50-100ms | Effort: 4 hours

**Rationale:** Allow clients to request only needed fields, reducing payload size and JSON serialization time.

### Checklist

- [ ] Create `api/src/utils/fieldSelector.js`:
  - Implement field filtering logic
  - Implement SQL projection generation
  - Map field names to database columns

- [ ] Create tests: `api/src/utils/__tests__/fieldSelector.test.js`

```javascript
import { selectFields, getProjectionSQL } from '../fieldSelector.js';

describe('fieldSelector', () => {
  it('should select specified fields', () => {
    const data = { id: 1, name: 'Test', funding: 100, description: 'Long...' };
    const result = selectFields(data, 'id,name,funding');
    expect(result).toEqual({ id: 1, name: 'Test', funding: 100 });
    expect(result).not.toHaveProperty('description');
  });

  it('should generate SQL projection', () => {
    const sql = getProjectionSQL('id,name,funding');
    expect(sql).toContain('c.id');
    expect(sql).toContain('c.name');
    expect(sql).not.toContain('c.description');
  });
});
```

- [ ] Update routes to support `?fields=` parameter:
  - `/api/companies?fields=id,name,funding,irs`
  - `/api/funds?fields=id,name,deployed`
  - `/api/graph?fields=minimal` (predefined field sets)

- [ ] Create field set presets:
  ```javascript
  const fieldPresets = {
    minimal: ['id', 'name', 'funding'],
    standard: ['id', 'name', 'funding', 'momentum', 'region'],
    full: ['*'], // all fields
  };
  ```

- [ ] Test with real API calls:
  ```bash
  curl "http://localhost:3001/api/companies?fields=id,name,funding"
  # Should return only requested fields
  ```

- [ ] Performance test:
  ```bash
  # Compare response sizes
  curl -w '%{size_download}\n' http://localhost:3001/api/companies > full.json
  curl -w '%{size_download}\n' "http://localhost:3001/api/companies?fields=id,name" > minimal.json
  ```

- [ ] Document field names in API docs
- [ ] Add TypeScript types for field selectors (optional)

### Implementation Steps

1. **Build field map:**
   - Map user-facing field names to SQL columns
   - Support nested fields (e.g., `score.irs`)

2. **Update all GET routes:**
   - Extract `fields` parameter
   - Call `getProjectionSQL()` to build SELECT clause
   - Filter response with `selectFields()`

3. **Create migration guide:**
   - Document available fields per endpoint
   - Show example requests with field selection

### Success Criteria
- [ ] Field selector utility working correctly
- [ ] Response size reduced by 30-50% with minimal fields
- [ ] JSON serialization time reduced proportionally
- [ ] All field combinations validated
- [ ] Documentation updated with field list

### Rollback Plan
```javascript
// Make fields optional, default to all fields
const projection = getProjectionSQL(fields || '*');
```

---

## CYCLE 6: Middleware Optimization ✓ PRIORITY: HIGH

### Difficulty: 1/5 | Impact: 30-50ms | Effort: 2 hours

**Rationale:** Reorder middleware for faster execution, reduce unnecessary body parsing.

### Checklist

- [ ] Review current middleware stack in `index.js`
- [ ] Test current middleware performance:
  ```javascript
  // Add simple profiling
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`Middleware time: ${Date.now() - start}ms`);
    });
    next();
  });
  ```

- [ ] Reorder middleware as specified:
  1. compression()
  2. cors()
  3. cache headers (lightweight)
  4. request logging (conditional)
  5. express.json()
  6. Routes
  7. errorHandler()

- [ ] Update `express.json()` options:
  ```javascript
  app.use(express.json({
    limit: '1mb',
    strict: true,
    type: ['application/json'],
  }));
  ```

- [ ] Add compression threshold:
  ```javascript
  app.use(compression({
    threshold: 1024, // Only compress > 1KB
    level: 6,
  }));
  ```

- [ ] Update CORS options:
  ```javascript
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    maxAge: 86400, // Cache preflight 24h
  }));
  ```

- [ ] Add health check BEFORE middleware (optional):
  ```javascript
  app.get('/api/health', (req, res) => { /* ... */ });
  ```

- [ ] Test all route types:
  ```bash
  # GET - should work
  curl http://localhost:3001/api/companies

  # POST - should work with compression
  curl -X POST http://localhost:3001/api/admin/... -H "Content-Type: application/json"

  # OPTIONS (CORS preflight) - should be cached
  curl -X OPTIONS http://localhost:3001/api/companies -v
  ```

- [ ] Measure middleware execution time:
  ```javascript
  // Before: ~30-50ms
  // After: ~10-20ms
  ```

- [ ] Verify compression working:
  ```bash
  curl -v http://localhost:3001/api/graph | head -20
  # Should show: Content-Encoding: gzip
  ```

### Implementation Steps

1. **Update `index.js` with new middleware order**
2. **Configure compression and CORS options**
3. **Test all HTTP methods and CORS scenarios**
4. **Monitor middleware overhead in logs**

### Success Criteria
- [ ] Middleware execution time < 20ms
- [ ] All routes functioning correctly
- [ ] CORS working with preflight caching
- [ ] Compression active for responses > 1KB
- [ ] No regression in API functionality

### Rollback Plan
```javascript
// Restore original middleware order in index.js
```

---

## CYCLE 7: Connection Pooling ✓ PRIORITY: MEDIUM

### Difficulty: 2/5 | Impact: 50-100ms | Effort: 3 hours

**Rationale:** Optimize database connection reuse and TCP keep-alive for persistent connections.

### Checklist

- [ ] Update `api/src/db/pool.js` with optimized settings:
  ```javascript
  max: 30, // Increased from 20
  min: 5, // Increased from 2
  idleTimeoutMillis: 45_000, // Increased from 30s
  connectionTimeoutMillis: 10_000, // Increased from 5s
  keepalives: true,
  keepalives_idle: 30,
  ```

- [ ] Add environment variables for configuration:
  ```bash
  # .env
  DB_POOL_MAX=30
  DB_POOL_MIN=5
  DB_STATEMENT_TIMEOUT=15000
  ```

- [ ] Update `index.js` with HTTP keep-alive:
  ```javascript
  const server = http.createServer(app);
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 70_000;
  server.listen(cfg.port);
  ```

- [ ] Add graceful shutdown handling:
  ```javascript
  process.on('SIGTERM', async () => {
    await pool.end();
    server.close();
  });
  ```

- [ ] Test connection pool under load:
  ```bash
  # Load test
  npm run load-test -- --duration 60 --rps 100

  # Check connection stats
  psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'battlebornintel';"
  ```

- [ ] Verify keep-alive is working:
  ```bash
  # tcpdump to check for TCP keep-alive packets
  sudo tcpdump -i any -n 'tcp port 5432'
  ```

- [ ] Monitor connection pool metrics:
  ```sql
  -- Check active connections
  SELECT usename, count(*)
  FROM pg_stat_activity
  GROUP BY usename;

  -- Check idle connections
  SELECT state, count(*)
  FROM pg_stat_activity
  GROUP BY state;
  ```

- [ ] Create monitoring script: `api/scripts/monitor-pool.js`

```javascript
import pool from './src/db/pool.js';

setInterval(() => {
  const idleCount = pool.idleCount;
  const waitingCount = pool.waitingCount;
  const totalConnections = pool._allClients.length;

  console.log(`Pool: ${totalConnections} total, ${idleCount} idle, ${waitingCount} waiting`);

  if (waitingCount > 0) {
    console.warn('WARNING: Requests waiting for database connection!');
  }
}, 5000);
```

- [ ] Test connection reuse:
  ```bash
  # Run rapid requests
  for i in {1..100}; do curl http://localhost:3001/api/companies; done

  # Check if connection count stays constant (reuse) or grows (no reuse)
  ```

### Implementation Steps

1. **Update pool configuration in `pool.js`**
2. **Add environment variables to `.env`**
3. **Update HTTP server configuration in `index.js`**
4. **Add graceful shutdown handler**
5. **Test under load**
6. **Monitor pool metrics**

### Success Criteria
- [ ] Connection pool size stable under sustained load
- [ ] Idle connections properly cleaned up (after 45s)
- [ ] No "pool starvation" warnings
- [ ] TCP keep-alive packets visible in network trace
- [ ] Connection reuse reducing handshake overhead

### Rollback Plan
```javascript
// Restore original pool settings
max: 20,
min: 2,
idleTimeoutMillis: 30_000,
```

---

## Integration Testing

After implementing each cycle, run integration tests:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- routes/companies.test.js

# Run with coverage
npm test -- --coverage

# Load test (requires separate load test suite)
npm run load-test
```

## Performance Validation

Compare before/after metrics:

```bash
# Measure endpoint response times
# Use Apache Bench or similar
ab -n 1000 -c 10 http://localhost:3001/api/companies

# Check database query performance
psql < scripts/analyze-performance.sql

# Monitor application metrics
# (Requires monitoring setup)
```

## Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Performance metrics validated
- [ ] Database backups taken
- [ ] Rollback plan tested
- [ ] Team notified of changes
- [ ] Monitoring alerts configured
- [ ] Deployment scheduled during low-traffic window

## Post-Deployment

- [ ] Monitor error rates for 1 hour
- [ ] Check database connection pool health
- [ ] Verify cache hit rates
- [ ] Confirm response times improved
- [ ] Check for any regressions in functionality
- [ ] Document actual performance improvements
- [ ] Update API documentation if needed

---

## Timeline Estimate

- **Phase 1 (Week 1):** Cycles 1, 6, 7 = 2-3 hours
- **Phase 2 (Week 2-3):** Cycles 2, 3 = 12 hours
- **Phase 3 (Week 3-4):** Cycles 4, 5 = 10 hours

**Total: 24-25 hours of implementation + testing**

Expected latency improvement: **630-1000ms reduction** across typical API workflows.
