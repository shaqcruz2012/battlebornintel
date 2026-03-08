-- Migration 007: Compatibility Views and Utility Functions
-- Phase 6 — Creates views that present new normalised structure through
-- the same shape the API already reads. Queries do NOT need to change.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/007_views_and_functions.sql

-- ============================================================
-- VIEW: v_companies_full
-- Joins companies with regions and latest computed_scores.
-- The existing getAllCompanies() query uses a CTE for scores;
-- this view is an optional convenience for new queries.
-- ============================================================
CREATE OR REPLACE VIEW v_companies_full AS
  WITH latest_scores AS (
    SELECT DISTINCT ON (company_id)
      company_id, irs_score, grade, triggers, dims
    FROM computed_scores
    ORDER BY company_id, computed_at DESC
  )
  SELECT
    c.*,
    r.name          AS region_name,
    r.iso_code      AS region_iso,
    cs.irs_score,
    cs.grade,
    cs.triggers,
    cs.dims
  FROM companies c
  LEFT JOIN regions r        ON r.id = c.region_id
  LEFT JOIN latest_scores cs ON cs.company_id = c.id;

-- ============================================================
-- VIEW: v_funds_full
-- Enriches funds with vc_firm and ssbci_fund details.
-- Existing funds queries use SELECT * FROM funds — no breakage.
-- ============================================================
CREATE OR REPLACE VIEW v_funds_full AS
  SELECT
    f.*,
    vf.name         AS vc_firm_name,
    vf.aum_m        AS vc_firm_aum_m,
    sf.program_phase AS ssbci_phase,
    sf.leverage_ratio AS ssbci_leverage_ratio
  FROM funds f
  LEFT JOIN vc_firms    vf ON vf.id = f.vc_firm_id
  LEFT JOIN ssbci_funds sf ON sf.id = f.ssbci_fund_id;

-- ============================================================
-- VIEW: v_graph_nodes
-- Unified node catalogue across all entity tables.
-- Follows the id-prefix convention used in getGraphData().
-- ============================================================
CREATE OR REPLACE VIEW v_graph_nodes AS
  -- companies
  SELECT 'c_' || id::text AS node_id, name, 'company' AS node_type, created_at FROM companies
  UNION ALL
  -- graph_funds
  SELECT 'f_' || id AS node_id, name, 'fund' AS node_type, NOW() AS created_at FROM graph_funds
  UNION ALL
  -- people
  SELECT id AS node_id, name, 'person' AS node_type, NOW() AS created_at FROM people
  UNION ALL
  -- externals
  SELECT id AS node_id, name, 'external' AS node_type, NOW() AS created_at FROM externals
  UNION ALL
  -- accelerators
  SELECT id AS node_id, name, 'accelerator' AS node_type, NOW() AS created_at FROM accelerators
  UNION ALL
  -- ecosystem_orgs
  SELECT id AS node_id, name, 'ecosystem' AS node_type, NOW() AS created_at FROM ecosystem_orgs
  -- NOTE: The following new entity tables use prefixes (vcf_, corp_, uni_, gov_)
  -- that do NOT yet have graph_edges pointing to them. They will appear as
  -- disconnected nodes until agents create edges linking them, or until a
  -- future migration maps legacy x_ edges to these typed nodes.
  -- The existing x_ prefixed externals (which DO have edges) remain above.
  UNION ALL
  -- vc_firms (new prefix: vcf_)
  SELECT 'vcf_' || id::text AS node_id, name, 'vc_firm' AS node_type, created_at FROM vc_firms
  UNION ALL
  -- corporations (new prefix: corp_)
  SELECT 'corp_' || id::text AS node_id, name, 'corporation' AS node_type, created_at FROM corporations
  UNION ALL
  -- universities (new prefix: uni_)
  SELECT 'uni_' || id::text AS node_id, name, 'university' AS node_type, created_at FROM universities
  UNION ALL
  -- gov_agencies (new prefix: gov_)
  SELECT 'gov_' || id::text AS node_id, name, 'gov_agency' AS node_type, created_at FROM gov_agencies;

-- ============================================================
-- VIEW: v_ecosystem_summary
-- Replaces the in-memory KPI calculation in kpis.js for
-- queries that only need aggregate figures.
-- ============================================================
CREATE OR REPLACE VIEW v_ecosystem_summary AS
  SELECT
    COUNT(*)                          AS company_count,
    SUM(employees)                    AS total_employees,
    SUM(funding_m)                    AS total_funding_m,
    ROUND(AVG(momentum))              AS avg_momentum,
    COUNT(*) FILTER (WHERE momentum >= 75) AS high_momentum_count
  FROM companies;

-- ============================================================
-- VIEW: v_ssbci_kpis
-- Pre-aggregated SSBCI metrics; replaces the in-memory
-- ssbciFunds filter in kpis.js.
-- ============================================================
CREATE OR REPLACE VIEW v_ssbci_kpis AS
  SELECT
    COUNT(*)                          AS fund_count,
    SUM(allocated_m)                  AS total_allocated_m,
    SUM(deployed_m)                   AS total_deployed_m,
    CASE
      WHEN SUM(deployed_m) > 0
      THEN SUM(deployed_m * COALESCE(leverage_ratio, 0)) / SUM(deployed_m)
      ELSE 0
    END                               AS weighted_avg_leverage
  FROM ssbci_funds;

-- ============================================================
-- FUNCTION: entity_metric_series(type, id, metric, periods)
-- Returns time-series of actual snapshots for an entity.
-- ============================================================
CREATE OR REPLACE FUNCTION entity_metric_series(
  p_entity_type  TEXT,
  p_entity_id    TEXT,
  p_metric_name  TEXT,
  p_limit        INTEGER DEFAULT 12
)
RETURNS TABLE (
  period_start   DATE,
  period_end     DATE,
  value          NUMERIC,
  unit           VARCHAR,
  granularity    VARCHAR,
  confidence     FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT period_start, period_end, value, unit, granularity, confidence
  FROM   metric_snapshots
  WHERE  entity_type  = p_entity_type
    AND  entity_id    = p_entity_id
    AND  metric_name  = p_metric_name
  ORDER  BY period_start DESC
  LIMIT  p_limit;
$$;

-- ============================================================
-- FUNCTION: scenario_vs_actual(scenario_id, entity_type, entity_id, metric)
-- Compares scenario predictions against realised metric snapshots.
-- ============================================================
CREATE OR REPLACE FUNCTION scenario_vs_actual(
  p_scenario_id  INTEGER,
  p_entity_type  TEXT,
  p_entity_id    TEXT,
  p_metric_name  TEXT
)
RETURNS TABLE (
  period         DATE,
  predicted      NUMERIC,
  actual         NUMERIC,
  variance       NUMERIC,
  confidence_lo  NUMERIC,
  confidence_hi  NUMERIC
)
LANGUAGE sql STABLE AS $$
  SELECT
    sr.period,
    sr.value                                            AS predicted,
    ms.value                                            AS actual,
    (sr.value - ms.value)                               AS variance,
    sr.confidence_lo,
    sr.confidence_hi
  FROM scenario_results sr
  LEFT JOIN metric_snapshots ms
    ON  ms.entity_type  = sr.entity_type
    AND ms.entity_id    = sr.entity_id
    AND ms.metric_name  = sr.metric_name
    AND ms.period_start = sr.period
  WHERE sr.scenario_id  = p_scenario_id
    AND sr.entity_type  = p_entity_type
    AND sr.entity_id    = p_entity_id
    AND sr.metric_name  = p_metric_name
  ORDER BY sr.period;
$$;

-- ============================================================
-- FUNCTION: upsert_metric_snapshot
-- Agent-friendly upsert so agents can write metrics idempotently.
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_metric_snapshot(
  p_entity_type  TEXT,
  p_entity_id    TEXT,
  p_metric_name  TEXT,
  p_value        NUMERIC,
  p_unit         TEXT,
  p_period_start DATE,
  p_period_end   DATE,
  p_granularity  TEXT DEFAULT 'quarter',
  p_source_id    INTEGER DEFAULT NULL,
  p_agent_id     TEXT DEFAULT NULL,
  p_confidence   FLOAT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql AS $$
  INSERT INTO metric_snapshots
    (entity_type, entity_id, metric_name, value, unit,
     period_start, period_end, granularity, source_id, agent_id, confidence)
  VALUES
    (p_entity_type, p_entity_id, p_metric_name, p_value, p_unit,
     p_period_start, p_period_end, p_granularity, p_source_id, p_agent_id, p_confidence)
  ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end)
  DO UPDATE SET
    value      = EXCLUDED.value,
    confidence = EXCLUDED.confidence,
    agent_id   = EXCLUDED.agent_id,
    source_id  = EXCLUDED.source_id
  RETURNING id;
$$;
