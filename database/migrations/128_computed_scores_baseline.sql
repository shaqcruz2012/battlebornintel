-- Migration 128: Baseline IRS (Innovation Readiness Score) Computation
-- Populates computed_scores with heuristic baseline scores derived from
-- company attributes, graph connectivity, and sector metadata.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/128_computed_scores_baseline.sql

BEGIN;

-- ============================================================
-- 0. Ensure unique constraint on company_id for upsert support
-- ============================================================
-- The computed_scores table was originally append-only, but baseline
-- scoring needs idempotent upsert semantics. Add a unique index if
-- one does not already exist.
CREATE UNIQUE INDEX IF NOT EXISTS idx_computed_scores_company_unique
  ON computed_scores (company_id);

-- ============================================================
-- 1. Archive existing scores to history before overwriting
-- ============================================================
INSERT INTO computed_scores_history
  (company_id, irs_score, grade, triggers, dims, computed_at, archived_at)
SELECT
  company_id, irs_score, grade, triggers, dims, computed_at, NOW()
FROM computed_scores
WHERE irs_score IS NOT NULL;

-- ============================================================
-- 2. Helper: archive_score_on_update trigger function
--    Copies the OLD row to history before an UPDATE overwrites it.
--    (Replaces the AFTER UPDATE trigger from migration 110 which
--     copies NEW — we want to preserve the pre-update snapshot.)
-- ============================================================
CREATE OR REPLACE FUNCTION archive_score_on_update()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO computed_scores_history
    (company_id, irs_score, grade, triggers, dims, computed_at, archived_at)
  VALUES
    (OLD.company_id, OLD.irs_score, OLD.grade, OLD.triggers, OLD.dims, OLD.computed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger (from migration 110) and replace with archive-old trigger
DROP TRIGGER IF EXISTS trg_computed_scores_history ON computed_scores;
DROP TRIGGER IF EXISTS trg_archive_score_on_update ON computed_scores;

CREATE TRIGGER trg_archive_score_on_update
  BEFORE UPDATE ON computed_scores
  FOR EACH ROW
  EXECUTE FUNCTION archive_score_on_update();

-- ============================================================
-- 3. Compute and upsert baseline IRS scores
-- ============================================================
WITH
-- Count person-type edges per company for team_dim
person_edges AS (
  SELECT
    c.id AS company_id,
    COUNT(*) AS person_edge_count
  FROM companies c
  JOIN graph_edges ge
    ON ge.source_id = 'c_' || c.slug OR ge.target_id = 'c_' || c.slug
  WHERE ge.source_id LIKE 'p\_%' ESCAPE '\'
     OR ge.target_id LIKE 'p\_%' ESCAPE '\'
  GROUP BY c.id
),

-- Best sector match per company: pick highest strategic_priority among company sectors
sector_match AS (
  SELECT
    c.id AS company_id,
    MAX(s.strategic_priority) AS best_priority,
    -- For tech_dim, use maturity of the highest-priority sector
    (ARRAY_AGG(s.maturity_stage ORDER BY s.strategic_priority DESC NULLS LAST))[1] AS best_maturity
  FROM companies c
  JOIN sectors s ON s.slug = ANY(c.sectors)
  GROUP BY c.id
),

-- Assemble dimension scores
dim_calc AS (
  SELECT
    c.id AS company_id,

    -- capital_dim: funding_m bands
    CASE
      WHEN COALESCE(c.funding_m, 0) >= 500 THEN 95
      WHEN c.funding_m >= 100             THEN 80
      WHEN c.funding_m >= 50              THEN 70
      WHEN c.funding_m >= 10              THEN 50
      WHEN c.funding_m >= 1               THEN 30
      WHEN c.funding_m > 0                THEN 15
      ELSE 10
    END AS capital_dim,

    -- traction_dim: prefer momentum, fall back to employees
    CASE
      WHEN c.momentum IS NOT NULL THEN LEAST(GREATEST(c.momentum, 0), 100)
      WHEN COALESCE(c.employees, 0) >= 1000 THEN 95
      WHEN c.employees >= 201               THEN 80
      WHEN c.employees >= 51                THEN 60
      WHEN c.employees >= 11                THEN 40
      WHEN c.employees >= 1                 THEN 20
      ELSE 30  -- default
    END AS traction_dim,

    -- team_dim: person edge count
    CASE
      WHEN COALESCE(pe.person_edge_count, 0) >= 6 THEN 85
      WHEN pe.person_edge_count >= 4               THEN 70
      WHEN pe.person_edge_count >= 2               THEN 55
      WHEN pe.person_edge_count = 1                THEN 40
      WHEN pe.person_edge_count = 0                THEN 20
      ELSE 30  -- default when NULL
    END AS team_dim,

    -- market_dim: sector strategic_priority (already 0-100)
    COALESCE(sm.best_priority, 30) AS market_dim,

    -- tech_dim: inverse maturity — emerging sectors have more opportunity
    CASE
      WHEN sm.best_maturity = 'emerging' THEN 70
      WHEN sm.best_maturity = 'growth'   THEN 60
      WHEN sm.best_maturity = 'mature'   THEN 40
      ELSE 30  -- default
    END AS tech_dim,

    -- risk_dim: inverse risk by stage (higher = safer)
    CASE
      WHEN c.stage = 'ipo'             THEN 90
      WHEN c.stage = 'public'          THEN 90
      WHEN c.stage = 'growth'          THEN 80
      WHEN c.stage = 'series_c_plus'   THEN 75
      WHEN c.stage = 'series_c'        THEN 75
      WHEN c.stage = 'series_b'        THEN 65
      WHEN c.stage = 'series_a'        THEN 55
      WHEN c.stage = 'seed'            THEN 40
      WHEN c.stage = 'pre_seed'        THEN 30
      ELSE 30  -- default
    END AS risk_dim

  FROM companies c
  LEFT JOIN person_edges pe ON pe.company_id = c.id
  LEFT JOIN sector_match sm ON sm.company_id = c.id
),

-- Compute weighted IRS and grade
scored AS (
  SELECT
    company_id,
    capital_dim,
    traction_dim,
    team_dim,
    market_dim,
    tech_dim,
    risk_dim,
    ROUND(
      capital_dim   * 0.20 +
      traction_dim  * 0.20 +
      team_dim      * 0.15 +
      market_dim    * 0.15 +
      tech_dim      * 0.15 +
      risk_dim      * 0.15
    )::INTEGER AS irs_score
  FROM dim_calc
)

INSERT INTO computed_scores
  (company_id, irs_score, grade, triggers, dims, computed_at, score_type)
SELECT
  s.company_id,
  s.irs_score,
  CASE
    WHEN s.irs_score >= 80 THEN 'A'
    WHEN s.irs_score >= 65 THEN 'B'
    WHEN s.irs_score >= 50 THEN 'C'
    WHEN s.irs_score >= 35 THEN 'D'
    ELSE 'F'
  END AS grade,
  ARRAY['baseline_computed']::TEXT[] AS triggers,
  jsonb_build_object(
    'capital_dim',   s.capital_dim,
    'traction_dim',  s.traction_dim,
    'team_dim',      s.team_dim,
    'market_dim',    s.market_dim,
    'tech_dim',      s.tech_dim,
    'risk_dim',      s.risk_dim,
    'weights', jsonb_build_object(
      'capital',  0.20,
      'traction', 0.20,
      'team',     0.15,
      'market',   0.15,
      'tech',     0.15,
      'risk',     0.15
    ),
    'method', 'heuristic_baseline_v1'
  ) AS dims,
  NOW() AS computed_at,
  'heuristic' AS score_type
FROM scored s
ON CONFLICT (company_id) DO UPDATE SET
  irs_score   = EXCLUDED.irs_score,
  grade       = EXCLUDED.grade,
  triggers    = EXCLUDED.triggers,
  dims        = EXCLUDED.dims,
  computed_at = EXCLUDED.computed_at,
  score_type  = EXCLUDED.score_type;

-- ============================================================
-- 4. Refresh materialized view so API picks up new scores
-- ============================================================
REFRESH MATERIALIZED VIEW latest_company_scores;

-- ============================================================
-- 5. Summary report
-- ============================================================
DO $$
DECLARE
  total_count INTEGER;
  avg_irs     NUMERIC;
  grade_dist  TEXT;
BEGIN
  SELECT COUNT(*), ROUND(AVG(irs_score), 1)
    INTO total_count, avg_irs
    FROM computed_scores;

  RAISE NOTICE '=== Baseline IRS Computation Complete ===';
  RAISE NOTICE 'Companies scored: %', total_count;
  RAISE NOTICE 'Average IRS: %', avg_irs;
END $$;

COMMIT;
