-- Migration 135: Analytical views for T-GNN research questions
-- Precomputes key metrics so dashboards and APIs can query them efficiently.

BEGIN;

-- ═══ 1. Accelerator Coverage Rate (RQ2) ═════════════════════════════════════
-- Answers: "72% of companies disconnected from accelerators"

CREATE OR REPLACE VIEW v_accelerator_coverage AS
SELECT
  c.location_class,
  c.region,
  COUNT(DISTINCT c.id) AS total_companies,
  COUNT(DISTINCT CASE WHEN ge.id IS NOT NULL THEN c.id END) AS accelerator_connected,
  ROUND(
    COUNT(DISTINCT CASE WHEN ge.id IS NOT NULL THEN c.id END)::NUMERIC
    / NULLIF(COUNT(DISTINCT c.id), 0), 3
  ) AS coverage_rate
FROM companies c
LEFT JOIN graph_edges ge ON (
  ge.target_id = 'c_' || c.id
  AND ge.source_id LIKE 'a_%'
  AND ge.rel IN ('accelerated_by', 'invested_in', 'supports')
)
GROUP BY c.location_class, c.region;

-- ═══ 2. Rural Isolation Metric (RQ2) ════════════════════════════════════════
-- Lists rural/suburban companies with their connectivity profile.

CREATE OR REPLACE VIEW v_rural_isolation AS
SELECT
  c.id,
  c.slug,
  c.name,
  c.city,
  c.region,
  c.location_class,
  c.funding_m,
  c.momentum,
  COALESCE(es.total_edges, 0) AS total_edges,
  COALESCE(es.accel_edges, 0) AS accelerator_edges,
  COALESCE(es.investor_edges, 0) AS investor_edges,
  COALESCE(es.total_edges, 0) = 0 AS is_isolated
FROM companies c
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_edges,
    SUM(CASE WHEN ge.source_id LIKE 'a_%' OR ge.target_id LIKE 'a_%' THEN 1 ELSE 0 END) AS accel_edges,
    SUM(CASE WHEN ge.rel IN ('invested_in', 'funded', 'funded_by') THEN 1 ELSE 0 END) AS investor_edges
  FROM graph_edges ge
  WHERE ge.source_id = 'c_' || c.id OR ge.target_id = 'c_' || c.id
) es ON TRUE
WHERE c.location_class IN ('rural', 'suburban')
;

-- ═══ 3. Public Institution Deal Origination (RQ3) ═══════════════════════════
-- Shows capital deployed and connectivity per public institution.

CREATE OR REPLACE VIEW v_public_deal_origination AS
SELECT
  er.canonical_id,
  er.label AS institution_name,
  er.institution_type,
  er.entity_type,
  COUNT(ge.id) AS total_edges,
  SUM(ge.capital_m) AS total_capital_m,
  COUNT(DISTINCT ge.target_id) AS unique_recipients,
  COUNT(DISTINCT ge.target_id) FILTER (
    WHERE ge.rel IN ('invested_in', 'funded', 'funds', 'grants_to')
  ) AS direct_investments
FROM entity_registry er
JOIN graph_edges ge ON ge.source_id = er.canonical_id
WHERE er.institution_type IN (
  'government', 'state_treasury', 'pension_fund', 'accelerator'
)
GROUP BY er.canonical_id, er.label, er.institution_type, er.entity_type
ORDER BY total_edges DESC;

-- ═══ 4. Capital Flow Edges (RQ3) ════════════════════════════════════════════
-- Investment edges enriched with institution types for weighted PageRank.

CREATE OR REPLACE VIEW v_capital_flow_edges AS
SELECT
  ge.id,
  ge.source_id,
  ge.target_id,
  ge.rel,
  ge.capital_m,
  ge.leverage_ratio,
  ge.weight,
  ge.confidence,
  ge.event_year,
  ge.event_date,
  ge.valid_from,
  ge.valid_to,
  src.institution_type AS source_institution_type,
  src.entity_type AS source_entity_type,
  tgt.entity_type AS target_entity_type
FROM graph_edges ge
LEFT JOIN entity_registry src ON ge.source_id = src.canonical_id
LEFT JOIN entity_registry tgt ON ge.target_id = tgt.canonical_id
WHERE ge.rel IN (
  'invested_in', 'funded', 'funds', 'funded_by',
  'grants_to', 'loaned_to', 'co_invested', 'lp_in'
);

-- ═══ 5. Interstate Benchmark Summary (RQ4) ══════════════════════════════════
-- Pivot-friendly view for state comparisons once data is populated.

CREATE OR REPLACE VIEW v_interstate_summary AS
SELECT
  state_code,
  state_name,
  metric_name,
  metric_value,
  metric_unit,
  period,
  verified,
  source_url
FROM interstate_benchmarks
WHERE metric_value IS NOT NULL
ORDER BY state_code, metric_name, period DESC;

-- ═══ 6. Refresh materialized views ══════════════════════════════════════════
-- Incorporate new columns into the interaction stream.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_interaction_stream') THEN
    REFRESH MATERIALIZED VIEW mv_interaction_stream;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_node_type_degree') THEN
    REFRESH MATERIALIZED VIEW mv_node_type_degree;
  END IF;
END $$;

-- ═══ Verification ════════════════════════════════════════════════════════════

SELECT 'v_accelerator_coverage' AS view_name,
       SUM(total_companies) AS total,
       SUM(accelerator_connected) AS connected,
       ROUND(SUM(accelerator_connected)::NUMERIC / NULLIF(SUM(total_companies), 0), 3) AS overall_rate
FROM v_accelerator_coverage;

SELECT 'v_rural_isolation' AS view_name,
       COUNT(*) AS total_rural,
       SUM(CASE WHEN is_isolated THEN 1 ELSE 0 END) AS isolated
FROM v_rural_isolation;

SELECT 'v_public_deal_origination' AS view_name,
       COUNT(*) AS institutions,
       SUM(total_edges) AS total_edges
FROM v_public_deal_origination;

COMMIT;
