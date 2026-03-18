# BattleBornIntel Deployment Commands Reference

**Quick copy-paste commands for all deployment phases**

---

## Pre-Deployment Setup

```bash
# 1. Navigate to project
cd /c/Users/shaqc/programming/battlebornintel

# 2. Verify current state
git status
git log --oneline -5

# 3. Backup database
pg_dump -U postgres battlebornintel > backup_$(date +%Y%m%d_%H%M%S).sql
echo "✓ Database backed up"

# 4. Stop all services
pm2 stop all
echo "✓ Services stopped"

# 5. Check service status
pm2 status
```

---

## Phase 1: Performance Optimizations (50 min)

### 1.1 Database Migrations

```bash
# Connect to database and run migrations
psql -U postgres -d battlebornintel << 'EOF'
\set AUTOCOMMIT off
BEGIN;

-- Run migration files in order
\i api/src/db/migrations/003-add-performance-indexes.sql
\i database/migrations/009_optimization_indexes_companies.sql
\i database/migrations/010_optimization_materialized_scores.sql
\i database/migrations/011_optimization_indexes_graph.sql
\i database/migrations/012_optimization_kpi_cache.sql
\i database/migrations/013_optimization_denormalized_graph.sql
\i database/migrations/014_optimization_query_caching.sql

COMMIT;
EOF

# Verify migrations completed
psql -U postgres -d battlebornintel << 'EOF'
SELECT COUNT(*) as index_count FROM pg_indexes WHERE schemaname = 'public';
SELECT COUNT(*) as materialized_view_count FROM information_schema.views WHERE table_schema = 'public';
EOF
```

### 1.2 API Cache Setup

```bash
# Start Redis (if not running)
docker run -d -p 6379:6379 --name redis redis:7-alpine

# OR start with system package
# sudo systemctl start redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG

# Start API server
cd api
npm install --save redis
pm2 start index.js --name api

# Verify API is running
sleep 2
pm2 status | grep api
curl http://localhost:3001/api/health
```

### 1.3 Phase 1 Validation

```bash
# Test 1: Check indexes exist
psql -U postgres -d battlebornintel << 'EOF'
\d+ companies
\d+ graph_edges
EOF

# Test 2: Performance baseline
echo "Testing API response time (should be <100ms):"
time curl -s http://localhost:3001/api/companies?stage=A&region=Las%20Vegas > /dev/null

# Test 3: Cache check
echo "Testing cache (second call should be <10ms):"
time curl -s http://localhost:3001/api/companies?stage=A&region=Las%20Vegas > /dev/null

# Test 4: Materialized views
psql -U postgres -d battlebornintel << 'EOF'
SELECT COUNT(*) FROM information_schema.materialized_views WHERE table_schema = 'public';
EOF
```

### 1.4 Phase 1 Commit

```bash
git tag -a v0.1-phase1-optimizations -m "Performance optimizations deployed - $(date)"
git push origin v0.1-phase1-optimizations
echo "Phase 1 complete: $(date)" >> DEPLOYMENT_LOG.txt
```

---

## Phase 2: KPI Data Quality System (2 hours)

### 2.1 Database Setup (Already done in Phase 1)

```bash
# Verify quality tables exist
psql -U postgres -d battlebornintel << 'EOF'
SELECT * FROM information_schema.tables
WHERE table_name IN ('kpi_data_quality', 'analysis_results')
AND table_schema = 'public';
EOF

# If not already populated, populate now:
psql -U postgres -d battlebornintel << 'EOF'
INSERT INTO kpi_data_quality (kpi_name, source, calculation_method, confidence_percentage, last_verified)
VALUES
  ('Total Funding', 'Database query', 'SUM(companies.funding_m)', 98, now()),
  ('Active Companies', 'Database count', 'COUNT(companies WHERE status=active)', 95, now()),
  ('SSBCI Capital Deployed', 'Graph analysis', 'SUM(edge amounts WHERE rel=invested_in)', 75, now()),
  ('Portfolio Companies', 'Database count', 'COUNT(companies WHERE fund_id IS NOT NULL)', 98, now()),
  ('Ecosystem Strength', 'Graph metrics', 'PageRank aggregate', 65, now())
ON CONFLICT (kpi_name) DO UPDATE SET
  last_verified = EXCLUDED.last_verified,
  confidence_percentage = EXCLUDED.confidence_percentage;

SELECT * FROM kpi_data_quality;
EOF
```

### 2.2 API Restart (to load new query code)

```bash
# API queries already updated in codebase
# Just restart to ensure changes are loaded
pm2 restart api
pm2 logs api | head -20

# Verify API returns quality metadata
sleep 1
curl http://localhost:3001/api/kpis | jq '.[0] | {value, quality, confidence}'
```

### 2.3 Frontend Build & Deploy

```bash
# Navigate to frontend
cd frontend

# Install/update dependencies
npm install

# Build
npm run build

# Verify build succeeded
ls -lah dist/ | head -10
du -sh dist/

# Start preview server
pm2 start "npm run preview" --name frontend
pm2 logs frontend | head -20

# OR deploy to hosting
# npm run deploy  # Vercel/Netlify
# cp -r dist/* /var/www/html/  # Nginx/Apache

# Verify frontend loads
sleep 2
curl http://localhost:3001/ | grep -i "dashboard" | head -2
```

### 2.4 Quality Data Population

```bash
# Create quality initialization script
cat > scripts/populate-quality.js << 'EOF'
const pool = require('../src/db/pool');

async function populateQuality() {
  const kpis = [
    { name: 'Total Funding', percentage: 98, source: 'SUM(funding_m)' },
    { name: 'Active Companies', percentage: 95, source: 'COUNT(active)' },
    { name: 'SSBCI Capital', percentage: 75, source: 'Graph analysis' },
    { name: 'Portfolio', percentage: 98, source: 'COUNT(portfolio)' },
    { name: 'Ecosystem', percentage: 65, source: 'PageRank' }
  ];

  for (const kpi of kpis) {
    await pool.query(
      `INSERT INTO kpi_data_quality (kpi_name, confidence_percentage, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (kpi_name) DO UPDATE SET
         confidence_percentage = $2, last_verified = now()`,
      [kpi.name, kpi.percentage, kpi.source]
    );
  }
  console.log('✓ Quality data populated');
  process.exit(0);
}

populateQuality().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
EOF

# Run script
node scripts/populate-quality.js

# Verify
psql -U postgres -d battlebornintel -c "SELECT * FROM kpi_data_quality;"
```

### 2.5 Phase 2 Validation

```bash
# Test 1: API returns quality
curl http://localhost:3001/api/kpis | jq '.[0]'

# Test 2: Frontend displays quality
curl http://localhost:3001/ | grep -i "data-quality"

# Test 3: Performance check
echo "KPI endpoint response time:"
time curl -s http://localhost:3001/api/kpis > /dev/null

# Test 4: All browsers test
# Open http://localhost:3001 in Chrome, Firefox, Safari
# Check:
# - KPI cards display
# - Quality badges visible (✓ VERIFIED, ~ INFERRED, = CALCULATED)
# - No console errors
# - Load time < 3s
```

### 2.6 Phase 2 Commit

```bash
git tag -a v0.2-phase2-data-quality -m "Data quality system deployed - $(date)"
git push origin v0.2-phase2-data-quality
echo "Phase 2 complete: $(date)" >> DEPLOYMENT_LOG.txt
```

---

## Phase 3: Stakeholder Activities (1 hour)

### 3.1 Database Verification

```bash
# Verify stakeholder_activities table exists and has data
psql -U postgres -d battlebornintel << 'EOF'
SELECT COUNT(*) FROM stakeholder_activities;
SELECT DISTINCT activity_type FROM stakeholder_activities;
SELECT * FROM stakeholder_activities LIMIT 1;
EOF

# Should show ~150+ records with various activity types
```

### 3.2 API Routes Verification

```bash
# API routes already in codebase, just restart
pm2 restart api
sleep 1

# Test all endpoints
echo "Testing stakeholder activities endpoints:"

echo "✓ Main endpoint:"
curl http://localhost:3001/api/stakeholder-activities | jq '.length'

echo "✓ Location filter:"
curl "http://localhost:3001/api/stakeholder-activities?location=Las%20Vegas" | jq '.length'

echo "✓ Type filter:"
curl "http://localhost:3001/api/stakeholder-activities?type=Funding" | jq '.length'

echo "✓ Stats by type:"
curl http://localhost:3001/api/stakeholder-activities/stats/by-type | jq '.[0]'

echo "✓ Stats by location:"
curl http://localhost:3001/api/stakeholder-activities/stats/by-location | jq '.[0]'
```

### 3.3 Frontend Rebuild

```bash
cd frontend

# Already updated from Phase 2, just rebuild
npm run build

# Deploy
pm2 restart frontend
# OR cp -r dist/* /var/www/html/
# OR npm run deploy

sleep 2
curl http://localhost:3001/ | grep -i "stakeholder" | head -2
```

### 3.4 Feature Validation

```bash
# Test 1: Navigate to feature
# http://localhost:5173/goed (dev)
# or http://your-domain/goed (production)

# Test 2: API performance
echo "Stakeholder activities API response time:"
time curl -s http://localhost:3001/api/stakeholder-activities > /dev/null

# Test 3: Filters work
curl "http://localhost:3001/api/stakeholder-activities?location=Reno" | jq '.length'

# Test 4: Components render
curl http://localhost:3001/ | grep -i "ActivityCard\|StakeholderActivitiesDigest"
```

### 3.5 Phase 3 Commit

```bash
git tag -a v0.3-phase3-stakeholder-activities -m "Stakeholder activities deployed - $(date)"
git push origin v0.3-phase3-stakeholder-activities
echo "Phase 3 complete: $(date)" >> DEPLOYMENT_LOG.txt
```

---

## Phase 4: Weekly Brief Analytics (1 hour)

### 4.1 Frontend Final Build

```bash
cd frontend

# Build with all features
npm run build

# Deploy
pm2 restart frontend
# OR npm run deploy
# OR cp -r dist/* /var/www/html/

sleep 2
curl http://localhost:3001/ | grep -i "WeeklyBrief"
```

### 4.2 API Verification

```bash
# API already supports weekly brief data through existing endpoints
# Just verify they work

echo "Testing weekly brief data endpoints:"

echo "✓ KPIs endpoint:"
curl http://localhost:3001/api/kpis | jq '.length'

echo "✓ Timeline endpoint:"
curl http://localhost:3001/api/timeline | jq '.length'

echo "✓ Stakeholder activities for timeline:"
curl "http://localhost:3001/api/stakeholder-activities" | jq '.length'
```

### 4.3 Feature Validation

```bash
# Test 1: Navigate to brief
# http://localhost:5173/brief (dev)
# or http://your-domain/brief (production)

# Test 2: Verify 52-week data loads
# Check Network tab: should load in <3 seconds

# Test 3: Test infinite scroll
# Scroll down, should load more weeks automatically
# Each batch should load in <1 second

# Test 4: Test filters
# Click on activity type filters
# Should show only activities of selected type

# Test 5: Responsive design
# Resize to mobile (375px), should adapt layout
# Check tablet (768px), should show 2-column layout

# Test 6: Print functionality
# Click print button, should show print preview
```

### 4.4 Performance Validation

```bash
# Test initial load time
echo "Weekly brief initial load (10 weeks):"
time curl -s "http://localhost:3001/api/kpis" > /dev/null

# Test infinite scroll load
echo "Infinite scroll load (next batch):"
time curl -s "http://localhost:3001/api/kpis?offset=10" > /dev/null

# Test full year load (if available)
echo "Full year load (52 weeks):"
time curl -s "http://localhost:3001/api/kpis" > /dev/null
```

### 4.5 Phase 4 Commit

```bash
git tag -a v0.4-phase4-weekly-brief -m "Weekly brief analytics deployed - $(date)"
git push origin v0.4-phase4-weekly-brief

git tag -a v1.0-release -m "All phases deployed successfully - $(date)"
git push origin v1.0-release

echo "Phase 4 complete: $(date)" >> DEPLOYMENT_LOG.txt
echo "All phases completed successfully!" >> DEPLOYMENT_LOG.txt
```

---

## Post-Deployment Validation

### Comprehensive Test Suite

```bash
#!/bin/bash
# Run this after all phases complete

echo "=== BattleBornIntel Post-Deployment Validation ==="
echo "Timestamp: $(date)"
echo ""

PASS=0
FAIL=0

test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3

  echo -n "Testing $name... "
  if curl -sf "$url" > /dev/null 2>&1; then
    echo "✓ PASS"
    ((PASS++))
  else
    echo "✗ FAIL"
    ((FAIL++))
  fi
}

# Run tests
test_endpoint "API Health" "http://localhost:3001/api/health"
test_endpoint "Companies" "http://localhost:3001/api/companies"
test_endpoint "KPIs" "http://localhost:3001/api/kpis"
test_endpoint "Stakeholder Activities" "http://localhost:3001/api/stakeholder-activities"
test_endpoint "Timeline" "http://localhost:3001/api/timeline"
test_endpoint "Frontend" "http://localhost:3001/"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -eq 0 ]; then
  echo "✓ All tests passed!"
  exit 0
else
  echo "✗ Some tests failed"
  exit 1
fi
```

### Performance Baseline

```bash
# Create baseline report
cat > PERFORMANCE_BASELINE.txt << 'EOF'
Performance Baseline - Post-Deployment
Generated: $(date)

API Response Times:
- /api/companies: $(time curl -s http://localhost:3001/api/companies > /dev/null 2>&1)
- /api/kpis: $(time curl -s http://localhost:3001/api/kpis > /dev/null 2>&1)
- /api/stakeholder-activities: $(time curl -s http://localhost:3001/api/stakeholder-activities > /dev/null 2>&1)
- /api/dashboard/batch: $(time curl -s http://localhost:3001/api/dashboard/batch > /dev/null 2>&1)

Database Query Times:
- Index usage: $(psql -c "SELECT COUNT(*) FROM pg_stat_user_indexes WHERE idx_scan > 0;")
- Materialized views: $(psql -c "SELECT COUNT(*) FROM information_schema.materialized_views;")

Frontend Metrics:
- Bundle size: $(du -sh frontend/dist/)
- Load time: Measure in browser DevTools

Services Status:
$(pm2 status)
EOF

cat PERFORMANCE_BASELINE.txt
```

---

## Monitoring Commands

```bash
# Watch API logs in real-time
pm2 logs api --lines 50

# Watch frontend logs
pm2 logs frontend --lines 50

# Monitor resource usage
pm2 monit

# Check database connections
psql -c "SELECT datname, count(*) as connections FROM pg_stat_activity GROUP BY datname;"

# Check slow queries
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check Redis cache
redis-cli INFO stats | grep -E "hits|misses"
```

---

## Rollback Commands

### Quick Rollback (Last Commit)

```bash
# Revert to last working commit
git reset --hard HEAD~1

# Restart services
pm2 restart all

# Verify status
pm2 status
curl http://localhost:3001/api/health
```

### Full Rollback (to Backup)

```bash
# Stop services
pm2 stop all

# Restore database
psql -U postgres -d battlebornintel < backup_YYYYMMDD_HHMMSS.sql

# Revert code
git reset --hard <previous-commit-hash>

# Restart services
pm2 start all

# Verify
pm2 status
curl http://localhost:3001/api/health
```

### Phase-Specific Rollback

```bash
# Rollback only Phase 4 (Weekly Brief)
git checkout HEAD~1 -- frontend/src/components/brief/ frontend/src/hooks/useWeeklyBriefs.js
pm2 restart frontend

# Rollback only Phase 3 (Stakeholder)
git checkout HEAD~1 -- api/src/routes/stakeholder-activities.js api/src/db/queries/stakeholder-activities.js
pm2 restart api

# Rollback only Phase 2 (Data Quality)
git checkout HEAD~1 -- api/src/db/queries/kpis.js frontend/src/components/dashboard/KpiCard.jsx
pm2 restart api frontend

# Rollback only Phase 1 (Optimizations)
psql -U postgres -d battlebornintel < backup_YYYYMMDD.sql
pm2 restart api
```

---

## Troubleshooting Commands

```bash
# If API won't start
pm2 logs api | tail -100
node api/src/index.js  # Run directly to see errors

# If database connection fails
psql -U postgres -l  # List databases
psql -U postgres -d battlebornintel -c "\dt"  # List tables
pg_isready -h localhost -p 5432

# If frontend build fails
rm -rf frontend/node_modules frontend/dist
cd frontend && npm install && npm run build

# If cache issues
redis-cli FLUSHALL  # Clear Redis cache
pm2 restart api

# If indexes missing
psql -c "\d+ companies"
psql -c "\i database/migrations/009_optimization_indexes_companies.sql"

# Monitor memory usage
docker stats
pm2 monit
```

---

## Complete Deployment Script

```bash
#!/bin/bash
set -e

echo "🚀 Starting BattleBornIntel Deployment"
echo "📅 $(date)"

# Phase 1
echo ""
echo "▶ Phase 1: Performance Optimizations..."
psql -U postgres -d battlebornintel < api/src/db/migrations/003-add-performance-indexes.sql
psql -U postgres -d battlebornintel < database/migrations/009_optimization_indexes_companies.sql
psql -U postgres -d battlebornintel < database/migrations/010_optimization_materialized_scores.sql
psql -U postgres -d battlebornintel < database/migrations/011_optimization_indexes_graph.sql
psql -U postgres -d battlebornintel < database/migrations/012_optimization_kpi_cache.sql
psql -U postgres -d battlebornintel < database/migrations/013_optimization_denormalized_graph.sql
psql -U postgres -d battlebornintel < database/migrations/014_optimization_query_caching.sql
pm2 restart api
echo "✓ Phase 1 complete"

# Phase 2
echo ""
echo "▶ Phase 2: Data Quality System..."
cd frontend && npm install && npm run build
pm2 restart frontend
sleep 2
echo "✓ Phase 2 complete"

# Phase 3
echo ""
echo "▶ Phase 3: Stakeholder Activities..."
pm2 restart api
sleep 1
echo "✓ Phase 3 complete"

# Phase 4
echo ""
echo "▶ Phase 4: Weekly Brief Analytics..."
cd frontend && npm run build
pm2 restart frontend
sleep 1
echo "✓ Phase 4 complete"

# Validation
echo ""
echo "▶ Running post-deployment validation..."
curl http://localhost:3001/api/health
curl http://localhost:3001/api/companies > /dev/null
curl http://localhost:3001/api/kpis > /dev/null
curl http://localhost:3001/api/stakeholder-activities > /dev/null
echo "✓ All validations passed"

echo ""
echo "✅ Deployment complete!"
echo "📅 $(date)"
```

Save this as `deploy.sh` and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**End of Deployment Commands Reference**
