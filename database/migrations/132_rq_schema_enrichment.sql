-- Migration 132: Schema enrichment for T-GNN research questions
-- Adds columns and tables needed to answer RQ1-RQ4 from the March 2026 report.
-- All changes are additive ALTERs — no DROP or destructive operations.

BEGIN;

-- ═══ 1. Rural/Metro classification on companies (RQ2) ═══════════════════════
-- The report identifies 40+ companies outside Reno/LV with zero accelerator coverage.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS location_class VARCHAR(10)
  CHECK (location_class IN ('metro', 'suburban', 'rural'));

-- Backfill from existing region values
UPDATE companies SET location_class = CASE
  WHEN region IN ('las_vegas', 'southern', 'reno', 'northern', 'henderson') THEN 'metro'
  WHEN region = 'carson_city' THEN 'suburban'
  ELSE 'rural'
END
WHERE location_class IS NULL;

CREATE INDEX IF NOT EXISTS idx_companies_location_class ON companies(location_class);

-- ═══ 2. Edge-level capital amount (RQ1, RQ3) ════════════════════════════════
-- Promotes deal_size_m from JSONB metadata to a proper queryable column
-- for weighted PageRank and source-sink analysis.

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS capital_m NUMERIC(12, 2);

-- Backfill from metadata->>'deal_size_m' where it exists
UPDATE graph_edges
SET capital_m = (metadata->>'deal_size_m')::NUMERIC(12, 2)
WHERE metadata->>'deal_size_m' IS NOT NULL
  AND capital_m IS NULL;

CREATE INDEX IF NOT EXISTS idx_edges_capital ON graph_edges(capital_m)
  WHERE capital_m IS NOT NULL;

-- ═══ 3. SSBCI leverage ratio on edges (RQ3) ═════════════════════════════════
-- Tracks the "$1 public generates $X private" multiplier per investment edge.

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS leverage_ratio NUMERIC(5, 2);

-- ═══ 4. Institution type on entity_registry (RQ1) ═══════════════════════════
-- Classifies entities for investor matching and capital flow analysis.

ALTER TABLE entity_registry
  ADD COLUMN IF NOT EXISTS institution_type VARCHAR(30)
  CHECK (institution_type IN (
    'pension_fund', 'state_treasury', 'family_office', 'endowment',
    'corporate_vc', 'institutional_vc', 'angel_network',
    'government', 'accelerator', 'university', 'other'
  ));

-- Backfill from entity_type
UPDATE entity_registry SET institution_type = CASE
  WHEN entity_type = 'accelerator'    THEN 'accelerator'
  WHEN entity_type = 'fund'           THEN 'institutional_vc'
  WHEN entity_type = 'person'         THEN 'other'
  WHEN entity_type = 'company'        THEN NULL
  WHEN entity_type = 'ecosystem_org'  THEN 'government'
  WHEN entity_type = 'program'        THEN 'government'
  WHEN entity_type = 'external'       THEN 'other'
  ELSE NULL
END
WHERE institution_type IS NULL;

-- Specific NV-nexus overrides from the T-GNN report
UPDATE entity_registry SET institution_type = 'pension_fund'
  WHERE canonical_id IN ('x_nv_pers', 'x_nv-pers') AND institution_type != 'pension_fund';
UPDATE entity_registry SET institution_type = 'state_treasury'
  WHERE canonical_id IN ('x_nv_state_treasurer', 'x_nv-state-treasurer') AND institution_type != 'state_treasury';
UPDATE entity_registry SET institution_type = 'family_office'
  WHERE canonical_id IN ('x_wynn_family_office', 'x_wynn-family-office', 'x_ozmen_ventures', 'x_ozmen-ventures', 'x_station_casinos', 'x_station-casinos-ventures')
  AND institution_type != 'family_office';

CREATE INDEX IF NOT EXISTS idx_er_institution_type ON entity_registry(institution_type)
  WHERE institution_type IS NOT NULL;

-- ═══ 5. Gap interventions enrichment (RQ2) ═══════════════════════════════════
-- Adds severity scoring and sector-pair labeling for structural hole tracking.

ALTER TABLE gap_interventions
  ADD COLUMN IF NOT EXISTS severity VARCHAR(10)
  CHECK (severity IN ('critical', 'high', 'medium', 'low'));

ALTER TABLE gap_interventions
  ADD COLUMN IF NOT EXISTS sector_pair TEXT;

ALTER TABLE gap_interventions
  ADD COLUMN IF NOT EXISTS metric_value NUMERIC(5, 2);

-- ═══ 6. Interstate benchmarks table (RQ4) ═══════════════════════════════════
-- Lightweight table for peer-state comparison. Seeded with state identifiers only;
-- metric values will be populated from real data sources (BLS, Crunchbase, PitchBook).

CREATE TABLE IF NOT EXISTS interstate_benchmarks (
  id            SERIAL PRIMARY KEY,
  state_code    VARCHAR(2)  NOT NULL,
  state_name    VARCHAR(40) NOT NULL,
  metric_name   VARCHAR(60) NOT NULL,
  metric_value  NUMERIC(14, 2),
  metric_unit   VARCHAR(20),
  period        VARCHAR(10),
  source_url    TEXT,
  confidence    FLOAT CHECK (confidence BETWEEN 0 AND 1),
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(state_code, metric_name, period)
);

CREATE INDEX IF NOT EXISTS idx_interstate_state ON interstate_benchmarks(state_code);
CREATE INDEX IF NOT EXISTS idx_interstate_metric ON interstate_benchmarks(metric_name);

-- Seed state identifiers only — no fabricated metrics
INSERT INTO interstate_benchmarks (state_code, state_name, metric_name, metric_unit, period)
VALUES
  ('NV', 'Nevada',   'total_vc_deployed_m',    'usd_millions', '2025'),
  ('NV', 'Nevada',   'accelerator_count',       'count',        '2025'),
  ('NV', 'Nevada',   'companies_tracked',       'count',        '2025'),
  ('UT', 'Utah',     'total_vc_deployed_m',    'usd_millions', '2025'),
  ('UT', 'Utah',     'accelerator_count',       'count',        '2025'),
  ('UT', 'Utah',     'companies_tracked',       'count',        '2025'),
  ('CO', 'Colorado', 'total_vc_deployed_m',    'usd_millions', '2025'),
  ('CO', 'Colorado', 'accelerator_count',       'count',        '2025'),
  ('CO', 'Colorado', 'companies_tracked',       'count',        '2025')
ON CONFLICT DO NOTHING;

-- ═══ Verification ════════════════════════════════════════════════════════════

SELECT location_class, COUNT(*) AS company_count
FROM companies GROUP BY location_class ORDER BY 1;

SELECT COUNT(*) AS edges_with_capital FROM graph_edges WHERE capital_m IS NOT NULL;

SELECT institution_type, COUNT(*) AS entity_count
FROM entity_registry WHERE institution_type IS NOT NULL
GROUP BY institution_type ORDER BY 2 DESC;

COMMIT;
