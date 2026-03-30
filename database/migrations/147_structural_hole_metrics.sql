-- Migration 147: Structural Hole Metrics (RQ2 — Ecosystem Gaps)
-- T-GNN research analysis: accelerator connectivity, community pair gaps,
-- rural isolation, and hollow nodes.
-- Stores findings as metric_snapshots and creates v_structural_holes view.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/147_structural_hole_metrics.sql

BEGIN;

-- ============================================================
-- 1. Register structural-hole features in feature_registry
-- ============================================================
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('company',   'accelerator_connected',    'boolean',     'tgnn_analysis', false, 'Whether company has any accelerator edge (0=disconnected, 1=connected)'),
  ('company',   'rural_isolated',           'boolean',     'tgnn_analysis', false, 'Company outside Reno/Las Vegas with zero accelerator coverage'),
  ('ecosystem', 'structural_hole_severity', 'categorical', 'tgnn_analysis', false, 'Severity of structural hole between community pairs (HIGH/MEDIUM/LOW)'),
  ('ecosystem', 'cross_connectivity',       'numeric',     'tgnn_analysis', false, 'Cross-community edge density between two clusters'),
  ('ecosystem', 'hollow_node_flag',         'boolean',     'tgnn_analysis', false, 'Accelerator/program with zero portfolio edges')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- ============================================================
-- 2. Accelerator connectivity per company
--    ~103 companies disconnected, ~40 connected
--    metric_name='accelerator_connected', value=0 or 1
-- ============================================================

-- Disconnected companies (value=0): companies with no accelerated_by edges
-- We insert for ALL companies; the view will compute the live value.
-- Here we seed the known snapshot from the T-GNN analysis.

INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id)
SELECT
  'company',
  c.id::TEXT,
  'accelerator_connected',
  CASE WHEN accel.company_id IS NOT NULL THEN 1 ELSE 0 END,
  'flag',
  '2026-03-01',
  '2026-03-30',
  'month',
  0.90,
  true,
  'tgnn_structural_analysis'
FROM companies c
LEFT JOIN (
  SELECT DISTINCT
    CASE
      WHEN source_id LIKE 'c_%' THEN CAST(SUBSTRING(source_id FROM 3) AS TEXT)
      ELSE source_id
    END AS company_id
  FROM graph_edges
  WHERE rel = 'accelerated_by'
  UNION
  SELECT DISTINCT
    CASE
      WHEN target_id LIKE 'c_%' THEN CAST(SUBSTRING(target_id FROM 3) AS TEXT)
      ELSE target_id
    END AS company_id
  FROM graph_edges
  WHERE rel = 'accelerated_by'
) accel ON accel.company_id = c.id::TEXT
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 3. Community pair structural holes
--    Stored as ecosystem metrics with entity_id='gap_X'
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  -- CleanTech/Reno <-> AI/Las Vegas: severity HIGH (near-zero cross edges)
  ('ecosystem', 'gap_cleantech_ai',       'structural_hole_severity', 3, 'severity_level', '2026-03-01', '2026-03-30', 'month', 0.85, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'gap_cleantech_ai',       'cross_connectivity',       0.02, 'density', '2026-03-01', '2026-03-30', 'month', 0.85, true, 'tgnn_structural_analysis'),

  -- HealthTech <-> Enterprise SaaS: severity HIGH
  ('ecosystem', 'gap_health_saas',        'structural_hole_severity', 3, 'severity_level', '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'gap_health_saas',        'cross_connectivity',       0.01, 'density', '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_structural_analysis'),

  -- Defense/Nellis <-> Civilian AI: severity MEDIUM
  ('ecosystem', 'gap_defense_civilian',   'structural_hole_severity', 2, 'severity_level', '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'gap_defense_civilian',   'cross_connectivity',       0.05, 'density', '2026-03-01', '2026-03-30', 'month', 0.75, true, 'tgnn_structural_analysis'),

  -- University Research <-> Growth-stage ($50M+): severity HIGH
  ('ecosystem', 'gap_university_growth',  'structural_hole_severity', 3, 'severity_level', '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'gap_university_growth',  'cross_connectivity',       0.01, 'density', '2026-03-01', '2026-03-30', 'month', 0.80, true, 'tgnn_structural_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 4. Rural isolation flags
--    Companies outside Reno/Las Vegas => rural_isolated=1
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id)
SELECT
  'company',
  c.id::TEXT,
  'rural_isolated',
  CASE WHEN c.region NOT IN ('las_vegas', 'reno') THEN 1 ELSE 0 END,
  'flag',
  '2026-03-01',
  '2026-03-30',
  'month',
  0.95,
  true,
  'tgnn_structural_analysis'
FROM companies c
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 5. Hollow nodes: accelerators/programs with zero portfolio edges
-- ============================================================
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, agent_id) VALUES
  ('ecosystem', 'a_audacity', 'hollow_node_flag',   1, 'flag', '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'a_audacity', 'portfolio_edge_count', 0, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'a_dtp',      'hollow_node_flag',   1, 'flag', '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_structural_analysis'),
  ('ecosystem', 'a_dtp',      'portfolio_edge_count', 2, 'count', '2026-03-01', '2026-03-30', 'month', 0.70, true, 'tgnn_structural_analysis')
ON CONFLICT (entity_type, entity_id, metric_name, period_start, period_end) DO NOTHING;

-- ============================================================
-- 6. VIEW: v_structural_holes
--    Unified view of all structural gaps in the ecosystem
-- ============================================================
DROP VIEW IF EXISTS v_structural_holes;

CREATE VIEW v_structural_holes AS

-- Part A: Companies with no accelerator edges
WITH accel_edges AS (
  SELECT DISTINCT
    CASE
      WHEN source_id LIKE 'c_%' THEN SUBSTRING(source_id FROM 3)
      ELSE source_id
    END AS company_id
  FROM graph_edges
  WHERE rel = 'accelerated_by'
  UNION
  SELECT DISTINCT
    CASE
      WHEN target_id LIKE 'c_%' THEN SUBSTRING(target_id FROM 3)
      ELSE target_id
    END AS company_id
  FROM graph_edges
  WHERE rel = 'accelerated_by'
),
disconnected_companies AS (
  SELECT
    'accelerator_gap' AS hole_type,
    'company' AS entity_type,
    c.id::TEXT AS entity_id,
    c.name AS entity_name,
    c.region,
    NULL::TEXT AS pair_label,
    'HIGH' AS severity,
    'No accelerator edges found' AS description
  FROM companies c
  LEFT JOIN accel_edges ae ON ae.company_id = c.id::TEXT
  WHERE ae.company_id IS NULL
    AND c.status = 'active'
),

-- Part B: Community pairs with low cross-connectivity
community_pairs AS (
  SELECT
    'community_pair_gap' AS hole_type,
    'ecosystem' AS entity_type,
    ms.entity_id,
    ms.entity_id AS entity_name,
    NULL::VARCHAR AS region,
    CASE ms.entity_id
      WHEN 'gap_cleantech_ai'      THEN 'CleanTech/Reno <-> AI/Las Vegas'
      WHEN 'gap_health_saas'        THEN 'HealthTech <-> Enterprise SaaS'
      WHEN 'gap_defense_civilian'   THEN 'Defense/Nellis <-> Civilian AI'
      WHEN 'gap_university_growth'  THEN 'University Research <-> Growth-stage ($50M+)'
    END AS pair_label,
    CASE ms.value
      WHEN 3 THEN 'HIGH'
      WHEN 2 THEN 'MEDIUM'
      WHEN 1 THEN 'LOW'
      ELSE 'UNKNOWN'
    END AS severity,
    'Near-zero cross-community connectivity' AS description
  FROM metric_snapshots ms
  WHERE ms.entity_type = 'ecosystem'
    AND ms.metric_name = 'structural_hole_severity'
    AND ms.agent_id = 'tgnn_structural_analysis'
),

-- Part C: Rural companies with no ecosystem connections
rural_isolated AS (
  SELECT
    'rural_isolation' AS hole_type,
    'company' AS entity_type,
    c.id::TEXT AS entity_id,
    c.name AS entity_name,
    c.region,
    NULL::TEXT AS pair_label,
    'HIGH' AS severity,
    'Rural company with zero accelerator coverage' AS description
  FROM companies c
  WHERE c.region NOT IN ('las_vegas', 'reno')
    AND c.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM graph_edges ge
      WHERE (ge.source_id = 'c_' || c.id::TEXT OR ge.target_id = 'c_' || c.id::TEXT)
        AND ge.rel IN ('accelerated_by', 'partners_with', 'invested_in')
    )
)

SELECT * FROM disconnected_companies
UNION ALL
SELECT * FROM community_pairs
UNION ALL
SELECT * FROM rural_isolated;

COMMENT ON VIEW v_structural_holes IS 'T-GNN RQ2: Structural holes in Nevada innovation ecosystem — accelerator gaps, community pair disconnections, rural isolation';

COMMIT;
