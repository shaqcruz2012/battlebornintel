-- Migration 129: Feature Registry & Data Completeness Tracking
-- Catalogs all known features per entity type, tracks completeness,
-- and provides an audited ingestion function.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/129_feature_registry_system.sql

BEGIN;

-- ============================================================
-- 1. feature_registry — catalog of features per entity type
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_registry (
  id            SERIAL PRIMARY KEY,
  entity_type   VARCHAR(30)  NOT NULL,
  feature_name  VARCHAR(100) NOT NULL,
  feature_type  VARCHAR(20)  NOT NULL CHECK (feature_type IN (
                  'numeric', 'categorical', 'text', 'boolean', 'array', 'embedding')),
  source        VARCHAR(100),
  required      BOOLEAN      DEFAULT FALSE,
  description   TEXT,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, feature_name)
);

-- ============================================================
-- 2. Populate feature_registry with known features
-- ============================================================

-- Company features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('company', 'name',                'text',        'manual',      true,  'Legal company name'),
  ('company', 'slug',                'categorical', 'computed',    true,  'URL-safe identifier'),
  ('company', 'stage',               'categorical', 'manual',      true,  'Funding stage (pre_seed..public)'),
  ('company', 'sectors',             'array',       'manual',      true,  'Industry sector tags'),
  ('company', 'employees',           'numeric',     'crunchbase',  true,  'Headcount'),
  ('company', 'funding_m',           'numeric',     'crunchbase',  true,  'Total funding in millions USD'),
  ('company', 'momentum',            'numeric',     'computed',    true,  'Momentum score 0-100'),
  ('company', 'founded',             'numeric',     'crunchbase',  false, 'Year founded'),
  ('company', 'city',                'categorical', 'manual',      true,  'City of HQ'),
  ('company', 'region',              'categorical', 'manual',      true,  'Region slug'),
  ('company', 'status',              'categorical', 'manual',      true,  'Operating status (active/inactive/acquired/exited)'),
  ('company', 'description',         'text',        'manual',      false, 'Company description'),
  ('company', 'eligible',            'array',       'computed',    false, 'Eligible program slugs'),
  ('company', 'lat',                 'numeric',     'census',      false, 'Latitude'),
  ('company', 'lng',                 'numeric',     'census',      false, 'Longitude'),
  ('company', 'revenue_estimate_m',  'numeric',     'computed',    false, 'Estimated annual revenue in millions'),
  ('company', 'burn_rate_indicator', 'numeric',     'computed',    false, 'Estimated burn rate indicator'),
  ('company', 'patent_count',        'numeric',     'computed',    false, 'Number of patents'),
  ('company', 'tech_stack',          'array',       'manual',      false, 'Technology stack tags'),
  ('company', 'founder_count',       'numeric',     'crunchbase',  false, 'Number of founders'),
  ('company', 'board_size',          'numeric',     'crunchbase',  false, 'Board of directors size')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Fund features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('fund', 'name',           'text',        'manual',    true,  'Fund name'),
  ('fund', 'fund_type',      'categorical', 'manual',    true,  'Fund type (vc, ssbci, angel, etc.)'),
  ('fund', 'allocated_m',    'numeric',     'manual',    false, 'Total allocation in millions USD'),
  ('fund', 'deployed_m',     'numeric',     'manual',    true,  'Deployed capital in millions USD'),
  ('fund', 'leverage_ratio', 'numeric',     'computed',  false, 'Private leverage ratio'),
  ('fund', 'company_count',  'numeric',     'computed',  true,  'Number of portfolio companies'),
  ('fund', 'thesis',         'text',        'manual',    false, 'Investment thesis')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Region features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('region', 'name',              'text',        'manual',  true,  'Region name'),
  ('region', 'level',             'categorical', 'manual',  true,  'Hierarchy level (state/metro/county/city)'),
  ('region', 'fips',              'categorical', 'census',  false, 'FIPS code'),
  ('region', 'population',        'numeric',     'census',  false, 'Total population'),
  ('region', 'gdp_b',             'numeric',     'bls',     false, 'GDP in billions USD'),
  ('region', 'unemployment_rate', 'numeric',     'bls',     false, 'Unemployment rate'),
  ('region', 'median_hh_income',  'numeric',     'census',  false, 'Median household income'),
  ('region', 'pop_growth_rate',   'numeric',     'census',  false, 'Population growth rate')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- University features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('university', 'name',                 'text',    'manual',    true,  'University name'),
  ('university', 'slug',                 'categorical', 'computed', true, 'URL-safe identifier'),
  ('university', 'research_budget_m',    'numeric', 'manual',    false, 'Annual research budget in millions'),
  ('university', 'spinout_count',        'numeric', 'manual',    false, 'Number of spinout companies'),
  ('university', 'tech_transfer_office', 'boolean', 'manual',    false, 'Has a tech transfer office'),
  ('university', 'enrollment',           'numeric', 'manual',    false, 'Total student enrollment'),
  ('university', 'doctorates_awarded',   'numeric', 'manual',    false, 'Annual doctorates awarded')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Sector features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('sector', 'name',               'text',        'manual',   true,  'Sector display name'),
  ('sector', 'slug',               'categorical', 'computed', true,  'URL-safe identifier'),
  ('sector', 'naics_codes',        'array',       'manual',   false, 'NAICS industry codes'),
  ('sector', 'maturity_stage',     'categorical', 'manual',   false, 'Maturity (emerging/growth/mature)'),
  ('sector', 'strategic_priority', 'numeric',     'manual',   false, 'Strategic priority 0-100'),
  ('sector', 'company_count',      'numeric',     'computed', false, 'Number of companies in sector')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Person features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('person', 'name',         'text',        'manual',    true,  'Full name'),
  ('person', 'role',         'categorical', 'manual',    false, 'Primary role/title'),
  ('person', 'organization', 'text',        'manual',    false, 'Current organization'),
  ('person', 'city',         'categorical', 'manual',    false, 'City of residence'),
  ('person', 'linkedin_url', 'text',        'manual',    false, 'LinkedIn profile URL'),
  ('person', 'bio',          'text',        'manual',    false, 'Short biography')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Program features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('program', 'name',                  'text',        'manual',   true,  'Program name'),
  ('program', 'program_type',          'categorical', 'manual',   true,  'Type (grant/loan/equity/accelerator_cohort/...)'),
  ('program', 'budget_m',              'numeric',     'manual',   false, 'Total budget in millions USD'),
  ('program', 'administering_agency',  'text',        'manual',   false, 'Administering agency name'),
  ('program', 'eligible_sectors',      'array',       'manual',   false, 'Target sector slugs'),
  ('program', 'active',               'boolean',     'computed',  false, 'Whether program is currently active')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- Accelerator features
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('accelerator', 'name',              'text',        'manual',   true,  'Accelerator name'),
  ('accelerator', 'atype',             'categorical', 'manual',   true,  'Accelerator type'),
  ('accelerator', 'city',              'categorical', 'manual',   false, 'City'),
  ('accelerator', 'region',            'categorical', 'manual',   false, 'Region slug'),
  ('accelerator', 'founded',           'numeric',     'manual',   false, 'Year founded'),
  ('accelerator', 'cohort_size',       'numeric',     'manual',   false, 'Typical cohort size'),
  ('accelerator', 'investment_amount', 'numeric',     'manual',   false, 'Investment per company')
ON CONFLICT (entity_type, feature_name) DO NOTHING;


-- ============================================================
-- 3. node_data_completeness — materialized view
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS node_data_completeness;

CREATE MATERIALIZED VIEW node_data_completeness AS

-- Companies
SELECT
  'company'::VARCHAR(30)   AS entity_type,
  c.id::TEXT               AS entity_id,
  c.name                   AS entity_name,
  (SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'company')::INTEGER AS total_features,
  (
    CASE WHEN c.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.slug IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.stage IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.sectors IS NOT NULL AND array_length(c.sectors, 1) > 0 THEN 1 ELSE 0 END +
    CASE WHEN c.employees IS NOT NULL AND c.employees > 0 THEN 1 ELSE 0 END +
    CASE WHEN c.funding_m IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.momentum IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.founded IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.city IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.region IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.status IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.description IS NOT NULL AND c.description != '' THEN 1 ELSE 0 END +
    CASE WHEN c.eligible IS NOT NULL AND array_length(c.eligible, 1) > 0 THEN 1 ELSE 0 END +
    CASE WHEN c.lat IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN c.lng IS NOT NULL THEN 1 ELSE 0 END
    -- revenue_estimate_m, burn_rate_indicator, patent_count, tech_stack, founder_count, board_size
    -- are registry-only features not yet as columns; counted as 0
  )::INTEGER AS filled_features,
  ROUND(
    (
      CASE WHEN c.name IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.slug IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.stage IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.sectors IS NOT NULL AND array_length(c.sectors, 1) > 0 THEN 1 ELSE 0 END +
      CASE WHEN c.employees IS NOT NULL AND c.employees > 0 THEN 1 ELSE 0 END +
      CASE WHEN c.funding_m IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.momentum IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.founded IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.city IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.region IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.status IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.description IS NOT NULL AND c.description != '' THEN 1 ELSE 0 END +
      CASE WHEN c.eligible IS NOT NULL AND array_length(c.eligible, 1) > 0 THEN 1 ELSE 0 END +
      CASE WHEN c.lat IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.lng IS NOT NULL THEN 1 ELSE 0 END
    )::NUMERIC / GREATEST((SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'company'), 1) * 100,
    1
  ) AS completeness_pct,
  ARRAY(
    SELECT f.feature_name FROM feature_registry f
    WHERE f.entity_type = 'company'
      AND (
        (f.feature_name = 'name'        AND c.name IS NULL) OR
        (f.feature_name = 'slug'        AND c.slug IS NULL) OR
        (f.feature_name = 'stage'       AND c.stage IS NULL) OR
        (f.feature_name = 'sectors'     AND (c.sectors IS NULL OR array_length(c.sectors, 1) IS NULL)) OR
        (f.feature_name = 'employees'   AND (c.employees IS NULL OR c.employees = 0)) OR
        (f.feature_name = 'funding_m'   AND c.funding_m IS NULL) OR
        (f.feature_name = 'momentum'    AND c.momentum IS NULL) OR
        (f.feature_name = 'founded'     AND c.founded IS NULL) OR
        (f.feature_name = 'city'        AND c.city IS NULL) OR
        (f.feature_name = 'region'      AND c.region IS NULL) OR
        (f.feature_name = 'status'      AND c.status IS NULL) OR
        (f.feature_name = 'description' AND (c.description IS NULL OR c.description = '')) OR
        (f.feature_name = 'eligible'    AND (c.eligible IS NULL OR array_length(c.eligible, 1) IS NULL)) OR
        (f.feature_name = 'lat'         AND c.lat IS NULL) OR
        (f.feature_name = 'lng'         AND c.lng IS NULL) OR
        -- Features not yet stored as columns are always missing
        f.feature_name IN ('revenue_estimate_m', 'burn_rate_indicator', 'patent_count',
                           'tech_stack', 'founder_count', 'board_size')
      )
    ORDER BY f.feature_name
  ) AS missing_features
FROM companies c

UNION ALL

-- Funds
SELECT
  'fund'::VARCHAR(30),
  fu.id::TEXT,
  fu.name,
  (SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'fund')::INTEGER,
  (
    CASE WHEN fu.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.fund_type IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.allocated_m IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.deployed_m IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.leverage IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.company_count IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN fu.thesis IS NOT NULL AND fu.thesis != '' THEN 1 ELSE 0 END
  )::INTEGER,
  ROUND(
    (
      CASE WHEN fu.name IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.fund_type IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.allocated_m IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.deployed_m IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.leverage IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.company_count IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN fu.thesis IS NOT NULL AND fu.thesis != '' THEN 1 ELSE 0 END
    )::NUMERIC / GREATEST((SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'fund'), 1) * 100,
    1
  ),
  ARRAY(
    SELECT f.feature_name FROM feature_registry f
    WHERE f.entity_type = 'fund'
      AND (
        (f.feature_name = 'name'           AND fu.name IS NULL) OR
        (f.feature_name = 'fund_type'      AND fu.fund_type IS NULL) OR
        (f.feature_name = 'allocated_m'    AND fu.allocated_m IS NULL) OR
        (f.feature_name = 'deployed_m'     AND fu.deployed_m IS NULL) OR
        (f.feature_name = 'leverage_ratio' AND fu.leverage IS NULL) OR
        (f.feature_name = 'company_count'  AND fu.company_count IS NULL) OR
        (f.feature_name = 'thesis'         AND (fu.thesis IS NULL OR fu.thesis = ''))
      )
    ORDER BY f.feature_name
  )
FROM funds fu

UNION ALL

-- Regions
SELECT
  'region'::VARCHAR(30),
  r.id::TEXT,
  r.name,
  (SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'region')::INTEGER,
  (
    CASE WHEN r.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN r.level IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN r.fips IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN r.population IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN r.gdp_b IS NOT NULL THEN 1 ELSE 0 END
    -- unemployment_rate, median_hh_income, pop_growth_rate are metric_snapshots, not columns
  )::INTEGER,
  ROUND(
    (
      CASE WHEN r.name IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN r.level IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN r.fips IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN r.population IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN r.gdp_b IS NOT NULL THEN 1 ELSE 0 END
    )::NUMERIC / GREATEST((SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'region'), 1) * 100,
    1
  ),
  ARRAY(
    SELECT f.feature_name FROM feature_registry f
    WHERE f.entity_type = 'region'
      AND (
        (f.feature_name = 'name'              AND r.name IS NULL) OR
        (f.feature_name = 'level'             AND r.level IS NULL) OR
        (f.feature_name = 'fips'              AND r.fips IS NULL) OR
        (f.feature_name = 'population'        AND r.population IS NULL) OR
        (f.feature_name = 'gdp_b'             AND r.gdp_b IS NULL) OR
        -- Metric-based features always show as missing from the table perspective
        f.feature_name IN ('unemployment_rate', 'median_hh_income', 'pop_growth_rate')
      )
    ORDER BY f.feature_name
  )
FROM regions r

UNION ALL

-- Universities
SELECT
  'university'::VARCHAR(30),
  u.id::TEXT,
  u.name,
  (SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'university')::INTEGER,
  (
    CASE WHEN u.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN u.slug IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN u.research_budget_m IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN u.spinout_count IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN u.tech_transfer_office IS NOT NULL THEN 1 ELSE 0 END
    -- enrollment, doctorates_awarded not yet columns
  )::INTEGER,
  ROUND(
    (
      CASE WHEN u.name IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN u.slug IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN u.research_budget_m IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN u.spinout_count IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN u.tech_transfer_office IS NOT NULL THEN 1 ELSE 0 END
    )::NUMERIC / GREATEST((SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'university'), 1) * 100,
    1
  ),
  ARRAY(
    SELECT f.feature_name FROM feature_registry f
    WHERE f.entity_type = 'university'
      AND (
        (f.feature_name = 'name'                 AND u.name IS NULL) OR
        (f.feature_name = 'slug'                 AND u.slug IS NULL) OR
        (f.feature_name = 'research_budget_m'    AND u.research_budget_m IS NULL) OR
        (f.feature_name = 'spinout_count'        AND u.spinout_count IS NULL) OR
        (f.feature_name = 'tech_transfer_office' AND u.tech_transfer_office IS NULL) OR
        f.feature_name IN ('enrollment', 'doctorates_awarded')
      )
    ORDER BY f.feature_name
  )
FROM universities u

UNION ALL

-- Sectors
SELECT
  'sector'::VARCHAR(30),
  s.id::TEXT,
  s.name,
  (SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'sector')::INTEGER,
  (
    CASE WHEN s.name IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN s.slug IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN s.naics_codes IS NOT NULL AND array_length(s.naics_codes, 1) > 0 THEN 1 ELSE 0 END +
    CASE WHEN s.maturity_stage IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN s.strategic_priority IS NOT NULL THEN 1 ELSE 0 END
    -- company_count is computed, not a column
  )::INTEGER,
  ROUND(
    (
      CASE WHEN s.name IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN s.slug IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN s.naics_codes IS NOT NULL AND array_length(s.naics_codes, 1) > 0 THEN 1 ELSE 0 END +
      CASE WHEN s.maturity_stage IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN s.strategic_priority IS NOT NULL THEN 1 ELSE 0 END
    )::NUMERIC / GREATEST((SELECT COUNT(*) FROM feature_registry WHERE entity_type = 'sector'), 1) * 100,
    1
  ),
  ARRAY(
    SELECT f.feature_name FROM feature_registry f
    WHERE f.entity_type = 'sector'
      AND (
        (f.feature_name = 'name'               AND s.name IS NULL) OR
        (f.feature_name = 'slug'               AND s.slug IS NULL) OR
        (f.feature_name = 'naics_codes'        AND (s.naics_codes IS NULL OR array_length(s.naics_codes, 1) IS NULL)) OR
        (f.feature_name = 'maturity_stage'     AND s.maturity_stage IS NULL) OR
        (f.feature_name = 'strategic_priority' AND s.strategic_priority IS NULL) OR
        f.feature_name = 'company_count'
      )
    ORDER BY f.feature_name
  )
FROM sectors s;


-- ============================================================
-- 4. feature_ingestion_log — audit trail for feature additions
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_ingestion_log (
  id            SERIAL PRIMARY KEY,
  entity_type   VARCHAR(30),
  entity_id     VARCHAR(100),
  feature_name  VARCHAR(100),
  old_value     TEXT,
  new_value     TEXT,
  source        VARCHAR(100),
  confidence    NUMERIC(4,2),
  ingested_at   TIMESTAMPTZ DEFAULT NOW(),
  agent_id      VARCHAR(60)
);


-- ============================================================
-- 5. ingest_feature() — stored procedure for feature ingestion
-- ============================================================
CREATE OR REPLACE FUNCTION ingest_feature(
  p_entity_type  VARCHAR(30),
  p_entity_id    VARCHAR(100),
  p_feature_name VARCHAR(100),
  p_new_value    TEXT,
  p_source       VARCHAR(100) DEFAULT NULL,
  p_confidence   NUMERIC(4,2) DEFAULT NULL,
  p_agent_id     VARCHAR(60)  DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_old_value TEXT;
  v_log_id   INTEGER;
  v_sql      TEXT;
BEGIN
  -- Validate feature exists in registry
  IF NOT EXISTS (
    SELECT 1 FROM feature_registry
    WHERE entity_type = p_entity_type AND feature_name = p_feature_name
  ) THEN
    RAISE EXCEPTION 'Feature "%" not registered for entity type "%"', p_feature_name, p_entity_type;
  END IF;

  -- Retrieve old value and perform update per entity type
  CASE p_entity_type
    WHEN 'company' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM companies WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id::INTEGER;

      EXECUTE format(
        'UPDATE companies SET %I = $1, updated_at = NOW() WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id::INTEGER;

    WHEN 'fund' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM funds WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id;

      EXECUTE format(
        'UPDATE funds SET %I = $1, updated_at = NOW() WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id;

    WHEN 'region' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM regions WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id::INTEGER;

      EXECUTE format(
        'UPDATE regions SET %I = $1 WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id::INTEGER;

    WHEN 'university' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM universities WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id::INTEGER;

      EXECUTE format(
        'UPDATE universities SET %I = $1, updated_at = NOW() WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id::INTEGER;

    WHEN 'sector' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM sectors WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id::INTEGER;

      EXECUTE format(
        'UPDATE sectors SET %I = $1 WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id::INTEGER;

    WHEN 'person' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM people WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id;

      EXECUTE format(
        'UPDATE people SET %I = $1 WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id;

    WHEN 'program' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM programs WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id::INTEGER;

      EXECUTE format(
        'UPDATE programs SET %I = $1, updated_at = NOW() WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id::INTEGER;

    WHEN 'accelerator' THEN
      EXECUTE format(
        'SELECT %I::TEXT FROM accelerators WHERE id = $1',
        p_feature_name
      ) INTO v_old_value USING p_entity_id;

      EXECUTE format(
        'UPDATE accelerators SET %I = $1 WHERE id = $2',
        p_feature_name
      ) USING p_new_value, p_entity_id;

    ELSE
      RAISE EXCEPTION 'Unsupported entity type: %', p_entity_type;
  END CASE;

  -- Log the ingestion
  INSERT INTO feature_ingestion_log (
    entity_type, entity_id, feature_name, old_value, new_value,
    source, confidence, agent_id
  ) VALUES (
    p_entity_type, p_entity_id, p_feature_name, v_old_value, p_new_value,
    p_source, p_confidence, p_agent_id
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 6. Indexes
-- ============================================================

-- feature_registry
CREATE INDEX IF NOT EXISTS idx_feature_registry_entity_type
  ON feature_registry (entity_type);

CREATE INDEX IF NOT EXISTS idx_feature_registry_source
  ON feature_registry (source);

CREATE INDEX IF NOT EXISTS idx_feature_registry_required
  ON feature_registry (entity_type) WHERE required = true;

-- feature_ingestion_log
CREATE INDEX IF NOT EXISTS idx_ingestion_log_entity
  ON feature_ingestion_log (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_feature
  ON feature_ingestion_log (feature_name);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_ingested_at
  ON feature_ingestion_log (ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_agent
  ON feature_ingestion_log (agent_id)
  WHERE agent_id IS NOT NULL;

-- node_data_completeness materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_completeness_entity
  ON node_data_completeness (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_completeness_pct
  ON node_data_completeness (completeness_pct);

CREATE INDEX IF NOT EXISTS idx_completeness_type_pct
  ON node_data_completeness (entity_type, completeness_pct);


-- ============================================================
-- 7. Refresh helper
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_node_data_completeness() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY node_data_completeness;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- Update statistics
-- ============================================================
ANALYZE feature_registry;
ANALYZE feature_ingestion_log;
ANALYZE node_data_completeness;

COMMIT;
