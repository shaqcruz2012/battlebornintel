-- Migration 008: Security, Permissions, and RLS Preparation
-- Phase 7 — Least-privilege grants for the bbi application role.
--            RLS stubs for multi-tenant tables (not yet enforced,
--            but structured so enabling them later is one line).
-- Run: psql -U bbi -d battlebornintel -f database/migrations/008_security_and_permissions.sql

-- ============================================================
-- ROLE SETUP
-- The bbi application role should only have what it needs.
-- Run as superuser once; subsequent runs are idempotent.
-- ============================================================

-- Revoke default public access to the public schema
-- (prevents new objects from being world-accessible by default)
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Grant CONNECT only to the application role
-- (adjust role name 'bbi_app' to match your actual app role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bbi_app') THEN
    CREATE ROLE bbi_app LOGIN PASSWORD 'CHANGE_IN_PRODUCTION';
  END IF;
END$$;

GRANT CONNECT ON DATABASE battlebornintel TO bbi_app;
GRANT USAGE   ON SCHEMA public TO bbi_app;

-- Read-write on application tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  companies, funds, graph_edges, people, externals,
  accelerators, ecosystem_orgs, graph_funds, listings,
  timeline_events, constants,
  agent_runs, analysis_results, computed_scores, graph_metrics_cache,
  regions, sectors, exchanges, sources, models,
  vc_firms, angels, ssbci_funds, corporations, universities,
  gov_agencies, programs,
  metric_snapshots, scenarios, scenario_results
TO bbi_app;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO bbi_app;

-- Read-only role for analytics / BI tools
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bbi_reader') THEN
    CREATE ROLE bbi_reader LOGIN PASSWORD 'CHANGE_IN_PRODUCTION';
  END IF;
END$$;

GRANT CONNECT ON DATABASE battlebornintel TO bbi_reader;
GRANT USAGE   ON SCHEMA public TO bbi_reader;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbi_reader;

-- View grants
GRANT SELECT ON
  v_companies_full, v_funds_full, v_graph_nodes,
  v_ecosystem_summary, v_ssbci_kpis
TO bbi_app, bbi_reader;

-- ============================================================
-- ROW LEVEL SECURITY STUBS
-- RLS is not yet enforced (no multi-tenant requirement today),
-- but the policies are defined so enabling is one ALTER TABLE.
-- Source column: confidence and verified for agent-quality gates.
-- ============================================================

-- Example: restrict low-confidence agent records from the reader role
-- Uncomment ALTER TABLE ... ENABLE ROW LEVEL SECURITY when ready.

-- RLS is NOT enabled yet. Uncomment after migrating app to use bbi_app role.
-- Without the bbi_app role connected, enabling RLS would block all queries.
-- ALTER TABLE companies   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

-- Allow bbi_app full access (bypass RLS)
CREATE POLICY bbi_app_all_companies ON companies
  TO bbi_app USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY bbi_app_all_edges ON graph_edges
  TO bbi_app USING (TRUE) WITH CHECK (TRUE);

-- Allow bbi_reader to see only verified records
-- (set verified = TRUE after human review of agent-written rows)
CREATE POLICY reader_verified_companies ON companies
  TO bbi_reader USING (verified = TRUE OR confidence IS NULL);

CREATE POLICY reader_verified_edges ON graph_edges
  TO bbi_reader USING (verified = TRUE OR confidence IS NULL);

-- ============================================================
-- INDEXES on RLS policy columns (required for performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_companies_verified   ON companies(verified);
CREATE INDEX IF NOT EXISTS idx_graph_edges_verified ON graph_edges(verified);

-- ============================================================
-- AUDIT TRIGGER: updated_at auto-maintenance
-- Applies to tables that have an updated_at column.
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT LIKE 'v_%'   -- skip views
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_updated_at_%1$s
       BEFORE UPDATE ON %1$s
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      tbl
    );
  END LOOP;
END$$;
