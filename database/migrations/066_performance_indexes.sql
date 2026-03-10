-- Migration 066: Performance indexes and query planner optimizations
-- Target: graph_edges full scan < 5 ms, API graph endpoint cold start < 500 ms
--
-- Analysis summary (pre-migration):
--   graph_edges: 4638 rows, seq scan 58.9 ms (cold), 3-11 ms (warm cache)
--     → predicate event_year IS NULL OR event_year <= 2026 returns 100% rows;
--       seq scan is optimal — no index helps full-table fetches.
--   companies: 127 rows, 0.16 ms — already fast; GIN/btree indexes adequate.
--   externals: 519 rows, 1.76 ms — already fast.
--   computed_scores: correlated subquery per company for MAX(computed_at) was
--     doing a seq scan; new composite index gives index-only scans (0 heap fetches).
--   stakeholder_activities: activity_date index existed but no covering index
--     for the composite filter (activity_date, activity_type, stakeholder_type).
--   timeline_events: no functional index on lower(company_name) despite all JOINs
--     using LOWER(t.company_name) = LOWER(c.name) pattern.
--   accelerators / ecosystem_orgs: tiny tables (14 / 9 rows) but queried with
--     region filter — covering indexes avoid heap fetches entirely.
--   graph_metrics_cache: correlated MAX(computed_at) subquery lacked a covering
--     index, causing unnecessary heap fetches on the hot graph-load path.

-- ---------------------------------------------------------------------------
-- 1. graph_edges — partial index for stakeholder-activities CTE path
--    Covers: WHERE event_year IS NOT NULL  (used in graph_edge_activities CTE)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edges_event_year_not_null
  ON graph_edges(event_year)
  WHERE event_year IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. timeline_events — functional index for case-insensitive company_name JOIN
--    Covers: LOWER(t.company_name) = LOWER(c.name)  (all stakeholder JOINs)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_company_name_lower
  ON timeline_events(lower(company_name));

-- ---------------------------------------------------------------------------
-- 3. timeline_events — covering index for date-range queries
--    Covers: getActivitiesByLocationAndDateRange — ORDER BY event_date DESC
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timeline_date_company_covering
  ON timeline_events(event_date DESC, company_id)
  INCLUDE (id, event_type, company_name, detail, icon);

-- ---------------------------------------------------------------------------
-- 4. stakeholder_activities — composite covering index for feed query
--    Covers: ORDER BY activity_date DESC + WHERE activity_type / stakeholder_type
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stk_act_date_type_covering
  ON stakeholder_activities(activity_date DESC, activity_type, stakeholder_type)
  INCLUDE (id, company_id, description, location, source, data_quality);

-- ---------------------------------------------------------------------------
-- 5. computed_scores — composite index for correlated MAX subquery
--    Covers: WHERE company_id = $1 AND computed_at = (SELECT MAX(computed_at) ...)
--    Result: index-only scan, 0 heap fetches (verified via EXPLAIN)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scores_company_computed_desc
  ON computed_scores(company_id, computed_at DESC);

-- ---------------------------------------------------------------------------
-- 6. accelerators — covering index for region-filtered graph queries
--    Covers: WHERE region = $1  (graph node loader with region filter)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accelerators_region_covering
  ON accelerators(region, accel_type)
  INCLUDE (id, name, city, founded);

-- ---------------------------------------------------------------------------
-- 7. ecosystem_orgs — covering index for region-filtered graph queries
--    Covers: WHERE region = $1  (graph node loader with region filter)
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ecosystem_orgs_region_covering
  ON ecosystem_orgs(region, entity_type)
  INCLUDE (id, name, city);

-- ---------------------------------------------------------------------------
-- 8. graph_metrics_cache — covering index for hot MAX(computed_at) subquery
--    Covers: WHERE computed_at = (SELECT MAX(computed_at) FROM graph_metrics_cache)
--    Result: index-only scan for both the subquery and the main scan
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_graph_metrics_computed_covering
  ON graph_metrics_cache(computed_at DESC, node_id)
  INCLUDE (pagerank, betweenness, community_id);

-- ---------------------------------------------------------------------------
-- 9. VACUUM ANALYZE — refresh planner statistics for all key tables
--    Run outside a transaction (VACUUM cannot run inside a transaction block).
-- ---------------------------------------------------------------------------
-- NOTE: The following VACUUM statements must be executed outside a transaction.
--       They are provided here as reference; the migration runner must execute
--       them as individual top-level commands (not wrapped in BEGIN/COMMIT).
--
-- VACUUM ANALYZE companies;
-- VACUUM ANALYZE graph_edges;
-- VACUUM ANALYZE externals;
-- VACUUM ANALYZE accelerators;
-- VACUUM ANALYZE ecosystem_orgs;
-- VACUUM ANALYZE timeline_events;
-- VACUUM ANALYZE stakeholder_activities;
-- VACUUM ANALYZE graph_metrics_cache;
-- VACUUM ANALYZE computed_scores;
-- VACUUM ANALYZE funds;
-- VACUUM ANALYZE people;
-- VACUUM ANALYZE programs;
