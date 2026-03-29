-- Migration 105: Query Performance Indexes for Common Access Patterns
-- Adds missing indexes identified by query audit of stakeholder-activities,
-- scenarios, opportunities, and metric_snapshots queries.
--
-- NOTE: idx_companies_name_lower already exists (migration 039) — not repeated here.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/105_query_performance_indexes.sql

-- ============================================================
-- 1. Scenario Results: entity_type + scenario_id composite
-- ============================================================
-- Supports: WHERE sr.entity_type = $1 AND sr.scenario_id = $2
-- Used by: getScenarioResults(), getLatestForecasts(), compareScenarios()
-- Existing idx_scenario_results_scenario is (scenario_id, entity_type, entity_id, metric_name)
-- which works when scenario_id is the leading filter. This new index serves
-- queries that filter by entity_type first (e.g. "all company forecasts").
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_results_entity_scenario
  ON scenario_results (entity_type, scenario_id);

-- ============================================================
-- 2. Scenarios: status + created_at DESC composite
-- ============================================================
-- Supports: WHERE s.status = 'complete' ORDER BY s.created_at DESC
-- Used by: getLatestForecasts() JOIN scenarios, listScenarios() ORDER BY
-- Existing idx_scenarios_status covers (status) only — no sort acceleration.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenarios_status_created
  ON scenarios (status, created_at DESC);

-- ============================================================
-- 3. Opportunity Edges: partial index on edge_category = 'opportunity'
-- ============================================================
-- Supports: WHERE edge_category = 'opportunity' ORDER BY matching_score DESC
-- Used by: getOpportunities(), getCompanyOpportunities(), getOpportunityStats()
-- Existing idx_edges_opportunity_score has WHERE rel = 'qualifies_for' which
-- excludes fund_opportunity edges. This index covers ALL opportunity edges.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_edges_opportunity_score_all
  ON graph_edges (matching_score DESC)
  WHERE edge_category = 'opportunity';

-- ============================================================
-- 4. Metric Snapshots: entity_type + metric_name composite
-- ============================================================
-- Supports: WHERE entity_type = $1 AND metric_name = ANY($2)
--           ORDER BY entity_id, period_start
-- Used by: panel_forecaster load_panel_data(), FRED/BLS ingestor queries
-- Existing idx_metric_snapshots_entity_type is (entity_type, period_end DESC)
-- which does not cover metric_name filtering or period_start ordering.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metric_snapshots_entity_metric
  ON metric_snapshots (entity_type, metric_name, entity_id, period_start);

-- ============================================================
-- Update statistics for affected tables
-- ============================================================
ANALYZE scenario_results;
ANALYZE scenarios;
ANALYZE graph_edges;
ANALYZE metric_snapshots;
