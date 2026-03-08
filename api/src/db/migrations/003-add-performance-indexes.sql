/**
 * Migration: Add Performance Indexes
 * Expected improvement: 120ms on filtered company queries
 *
 * This migration creates indexes on frequently-filtered columns in the companies table
 * to significantly speed up dashboard queries with stage, region, and sector filters.
 */

-- Index on stage column (used in getAllCompanies with stage filter)
CREATE INDEX IF NOT EXISTS idx_companies_stage
  ON companies(stage)
  WHERE stage IS NOT NULL;

-- Index on region column (used in getAllCompanies with region filter)
CREATE INDEX IF NOT EXISTS idx_companies_region
  ON companies(region)
  WHERE region IS NOT NULL;

-- Index on sectors array column (used in getAllCompanies with sector filter)
CREATE INDEX IF NOT EXISTS idx_companies_sectors
  ON companies USING GIN(sectors);

-- Composite index on stage + region (common combined filter)
CREATE INDEX IF NOT EXISTS idx_companies_stage_region
  ON companies(stage, region)
  WHERE stage IS NOT NULL AND region IS NOT NULL;

-- Index on IRS score for sorting (used in getAllCompanies ORDER BY irs_score)
CREATE INDEX IF NOT EXISTS idx_computed_scores_company_id_created
  ON computed_scores(company_id, computed_at DESC)
  WHERE computed_at IS NOT NULL;

-- Index on momentum for sorting
CREATE INDEX IF NOT EXISTS idx_companies_momentum
  ON companies(momentum DESC NULLS LAST)
  WHERE momentum IS NOT NULL;

-- Index on funding_m for sorting
CREATE INDEX IF NOT EXISTS idx_companies_funding
  ON companies(funding_m DESC NULLS LAST)
  WHERE funding_m IS NOT NULL;

-- Index on company name for search
CREATE INDEX IF NOT EXISTS idx_companies_name
  ON companies USING GIST(name gist_trgm_ops);

-- Index on city for search
CREATE INDEX IF NOT EXISTS idx_companies_city
  ON companies USING GIST(city gist_trgm_ops);

-- Analyze tables to update statistics
ANALYZE companies;
ANALYZE computed_scores;
ANALYZE graph_edges;
