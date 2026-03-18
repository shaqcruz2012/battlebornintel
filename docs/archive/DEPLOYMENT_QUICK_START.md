# BattleBornIntel Deployment Quick Start

**Estimated Time: 5 hours**
**Commit: 530bc85**
**Status: Ready for Production**

---

## Prerequisites

```bash
# 1. Ensure databases/services are running
docker-compose up -d  # PostgreSQL + Redis

# 2. Backup current database
pg_dump battlebornintel > backup_$(date +%Y%m%d).sql

# 3. Stop current services
pm2 stop all
```

---

## Phase 1: Performance Optimizations (50 min)

**Target:** Database indexes, materialized views, caching

```bash
# Step 1: Connect to database
psql -U postgres -d battlebornintel

# Step 2: Run migrations in order
\i api/src/db/migrations/003-add-performance-indexes.sql
\i database/migrations/009_optimization_indexes_companies.sql
\i database/migrations/010_optimization_materialized_scores.sql
\i database/migrations/011_optimization_indexes_graph.sql
\i database/migrations/012_optimization_kpi_cache.sql
\i database/migrations/013_optimization_denormalized_graph.sql
\i database/migrations/014_optimization_query_caching.sql

# Step 3: Verify indexes
\d+ companies
SELECT * FROM information_schema.materialized_views;

# Step 4: Start API with cache
pm2 start api
pm2 logs api | head -20

# Step 5: Test performance
curl http://localhost:3001/api/companies?stage=A&region=Las%20Vegas
# Expected: 20-40ms (cache) or 120-150ms (first call → now 20-30ms)
```

**Validation:**
- [ ] No migration errors
- [ ] Indexes created successfully
- [ ] API starts without errors
- [ ] API responds in <100ms

---

## Phase 2: KPI Data Quality (2 hours)

**Target:** Quality metadata in KPIs, frontend badges

```bash
# Step 1: Database migration (already done in Phase 1)
# database/migrations/009_add_data_source_tracking.sql

# Step 2: Verify API loads changes
pm2 restart api
pm2 logs api | grep -E "started|error" | head -5

# Step 3: Test API returns quality metadata
curl http://localhost:3001/api/kpis | jq '.data[0]' | grep -E "quality|confidence"

# Step 4: Build and deploy frontend
cd frontend
npm install
npm run build

# Step 5: Deploy frontend
pm2 start "npm run preview" --name frontend
# OR copy dist/ to web server
# OR npm run deploy to Vercel/Netlify

# Step 6: Verify frontend loads
curl http://localhost:3001/ | head -20
# Should see ExecutiveDashboard component

# Step 7: Test quality display
# Open http://localhost:5173 in browser
# Navigate to Dashboard
# Look for: ✓ VERIFIED, ~ INFERRED, = CALCULATED badges
```

**Validation:**
- [ ] KPI cards show quality badges
- [ ] Tooltips show confidence %
- [ ] No console errors
- [ ] Dashboard loads in <3 seconds

---

## Phase 3: Stakeholder Activities (1 hour)

**Target:** New activity tracking and digest feature

```bash
# Step 1: Database populated (done in Phase 1)
# Verify:
psql -c "SELECT COUNT(*) FROM stakeholder_activities;"
# Should show: ~150+ records

# Step 2: Verify API routes
pm2 restart api
curl http://localhost:3001/api/stakeholder-activities | jq '.length'

# Step 3: Test filtering
curl "http://localhost:3001/api/stakeholder-activities?location=Las%20Vegas" | jq '.length'

curl "http://localhost:3001/api/stakeholder-activities?type=Funding" | jq '.length'

# Step 4: Build frontend
cd frontend
npm run build

# Step 5: Navigate to feature
# http://localhost:5173/goed (dev)
# or http://your-domain/goed (production)

# Step 6: Verify display
# - Activities appear as cards
# - Location filter works
# - Date range filter works
# - Search works
# - No errors in console
```

**Validation:**
- [ ] API endpoint returns data
- [ ] Frontend component renders
- [ ] All filters work
- [ ] No console errors
- [ ] Load time <2 seconds

---

## Phase 4: Weekly Brief Analytics (1 hour)

**Target:** 52-week timeline with MIT REAP metrics

```bash
# Step 1: Frontend already has components from previous steps
# Just verify they load

# Step 2: Test API endpoints
curl http://localhost:3001/api/kpis | jq '.length'
# Should return multiple KPI entries

# Step 3: Navigate to brief
# http://localhost:5173/brief (dev)
# or http://your-domain/brief (production)

# Step 4: Verify timeline
# - 52 weeks display
# - REAP metrics visible (Macroeconomic, Indicators, Technology, Returns, Accessibility, Portfolio)
# - Activity filters work
# - Infinite scroll works
# - Print button works
# - Responsive on mobile

# Step 5: Check performance
# - First 10 weeks load in <2 seconds
# - Infinite scroll adds weeks in <1 second
# - No memory leaks with 52 weeks loaded
```

**Validation:**
- [ ] Timeline displays correctly
- [ ] Metrics calculated accurately
- [ ] Filters work
- [ ] No performance issues
- [ ] Responsive design works

---

## Post-Deployment Checklist

Run this validation script:

```bash
#!/bin/bash
echo "=== Deployment Validation ==="

# 1. API Health
echo "✓ API health..."
curl -f http://localhost:3001/api/health || echo "✗ FAILED"

# 2. Database check
echo "✓ Database connectivity..."
curl -s http://localhost:3001/api/companies | jq '.length > 70' > /dev/null && echo "✓ OK" || echo "✗ FAILED"

# 3. Performance check
echo "✓ API performance (should be <100ms)..."
time curl -s http://localhost:3001/api/companies > /dev/null

# 4. Quality metadata check
echo "✓ KPI quality metadata..."
curl -s http://localhost:3001/api/kpis | jq '.[0].quality' || echo "✗ FAILED"

# 5. Stakeholder activities
echo "✓ Stakeholder activities..."
curl -s http://localhost:3001/api/stakeholder-activities | jq '.length > 100' > /dev/null && echo "✓ OK" || echo "✗ FAILED"

# 6. Frontend check
echo "✓ Frontend loads..."
curl -s http://localhost:3001/ | grep -q "Dashboard" && echo "✓ OK" || echo "✗ FAILED"

echo ""
echo "=== If all checks pass, deployment is complete! ==="
```

---

## Rollback (if needed)

```bash
# Quick rollback to previous state
git reset --hard <previous-commit>

# Restore database
psql -U postgres -d battlebornintel < backup_YYYYMMDD.sql

# Restart services
pm2 restart all
```

---

## Monitoring

After deployment, monitor these metrics:

```bash
# API performance
pm2 logs api

# Database performance
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"

# Frontend health (check browser console)
# - No errors
# - No warnings about deprecated APIs
# - All images/fonts load successfully

# System resources
pm2 status
docker stats
```

---

## Need Help?

**Check logs:**
```bash
pm2 logs api | tail -50
pm2 logs frontend | tail -50
```

**Test API directly:**
```bash
curl -v http://localhost:3001/api/health
curl -v http://localhost:3001/api/companies
```

**Check database:**
```bash
psql -l  # List databases
psql -d battlebornintel  # Connect
\d  # List tables
SELECT COUNT(*) FROM companies;
```

**Frontend issues:**
```bash
# Clear cache
rm -rf frontend/node_modules frontend/dist
cd frontend && npm install && npm run build
```

---

## Success Indicators

✅ Deployment complete when:

- All 4 phases finish without critical errors
- API responds in <100ms with caching
- Frontend loads in <3 seconds
- KPI quality badges display correctly
- Stakeholder activities feature works
- Weekly brief timeline displays
- No critical errors in logs
- Database queries show 80%+ improvement

**Total Time: ~5 hours**
**Status: Production Ready**
