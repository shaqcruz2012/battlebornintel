-- Migration 009: Performance indexes for hot query paths
-- Based on EXPLAIN ANALYZE of heaviest queries (2026-03-26)

-- 1. Events: partial index for verified+not-quarantined queries sorted by date.
--    The main events query filters quarantined=FALSE AND verified=TRUE then
--    sorts by event_date DESC. A partial index avoids scanning quarantined/unverified rows.
CREATE INDEX IF NOT EXISTS idx_events_verified_date
  ON events(event_date DESC)
  WHERE quarantined = FALSE AND verified = TRUE;

-- 2. Graph edges: composite index on (event_year, edge_category) for the main
--    graph loader query which filters by year <= $1 AND edge_category != 'opportunity'.
--    Planner currently does a seq scan; this index helps as the table grows.
CREATE INDEX IF NOT EXISTS idx_edges_category_year
  ON graph_edges(event_year, edge_category);

-- 3. Entity registry: composite index on (entity_type, confidence DESC) for
--    type-filtered queries that sort by confidence score.
CREATE INDEX IF NOT EXISTS idx_er_type_conf
  ON entity_registry(entity_type, confidence DESC);

-- 4. Events: partial index for location-based stakeholder activity queries.
--    Covers getActivitiesByLocationAndDateRange and countActivitiesByLocation.
CREATE INDEX IF NOT EXISTS idx_events_location_active
  ON events(location, event_date DESC)
  WHERE location IS NOT NULL AND quarantined = FALSE;

-- 5. Events: index for company activity lookups (company_id + date).
--    Covers getCompanyActivities which filters by company_id with date sort.
CREATE INDEX IF NOT EXISTS idx_events_company_verified
  ON events(company_id, event_date DESC)
  WHERE quarantined = FALSE AND verified = TRUE AND company_id IS NOT NULL;

-- 6. Events: index for stakeholder_type filtering (stakeholder activity dashboard).
CREATE INDEX IF NOT EXISTS idx_events_stakeholder_verified
  ON events(stakeholder_type, event_date DESC)
  WHERE quarantined = FALSE AND verified = TRUE;

-- Update statistics on all indexed tables
ANALYZE events;
ANALYZE graph_edges;
ANALYZE entity_registry;
