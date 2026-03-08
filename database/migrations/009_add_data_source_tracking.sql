-- Data Quality Tracking for KPIs
-- Migration: Add data_source column to analysis_results table to track data quality levels

-- Add data_source column to track VERIFIED, INFERRED, or CALCULATED
ALTER TABLE analysis_results
ADD COLUMN IF NOT EXISTS data_source VARCHAR(20),
ADD COLUMN IF NOT EXISTS quality_metadata JSONB,
ADD COLUMN IF NOT EXISTS data_sources_list TEXT[],
ADD COLUMN IF NOT EXISTS verification_percentage INTEGER;

-- Add index for data quality queries
CREATE INDEX IF NOT EXISTS idx_analysis_data_source ON analysis_results(data_source);
CREATE INDEX IF NOT EXISTS idx_analysis_quality ON analysis_results(quality_metadata);

-- Create a kpi_data_quality table for detailed source tracking
CREATE TABLE IF NOT EXISTS kpi_data_quality (
  id            SERIAL PRIMARY KEY,
  kpi_name      VARCHAR(60) NOT NULL,
  quality_level VARCHAR(20) NOT NULL,
  data_sources  TEXT[] NOT NULL,
  last_verified TIMESTAMPTZ,
  notes         TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_quality_name ON kpi_data_quality(kpi_name);
CREATE INDEX IF NOT EXISTS idx_kpi_quality_level ON kpi_data_quality(quality_level);

-- Insert KPI data quality documentation
INSERT INTO kpi_data_quality (kpi_name, quality_level, data_sources, notes, metadata)
VALUES
  (
    'capitalDeployed',
    'verified',
    ARRAY['Fund deployment records', 'SEC SBIC filings', 'Fund administrator reports'],
    'Sum of all fund deployed amounts from verified sources. Regional allocations may be inferred.',
    jsonb_build_object(
      'sources', ARRAY['Fund administrator reports', 'SEC SBIC filings'],
      'nonVerifiedComponents', jsonb_build_object(
        'regionalAllocations', 'inferred'
      ),
      'confidence', 0.95
    )
  ),
  (
    'ssbciCapitalDeployed',
    'verified',
    ARRAY['SSBCI certification', 'Treasury reporting', 'Fund certifications'],
    'Only includes SSBCI-certified capital deployments with verified documentation.',
    jsonb_build_object(
      'sources', ARRAY['SSBCI Program', 'Treasury Department', 'Fund administrators'],
      'confidence', 0.98,
      'regulatoryApproved', true
    )
  ),
  (
    'privateLeverage',
    'calculated',
    ARRAY['Verified: deployment amounts', 'Inferred: leverage ratios'],
    'Weighted average calculated from verified deployments and estimated leverage. Leverage ratios based on fund structure analysis.',
    jsonb_build_object(
      'formula', 'Σ(fund.deployed_m × fund.leverage) / Σ(fund.deployed_m)',
      'components', jsonb_build_object(
        'deployed', 'verified',
        'leverage', 'inferred'
      ),
      'confidence', 0.80
    )
  ),
  (
    'ecosystemCapacity',
    'inferred',
    ARRAY['Company self-reports', 'Crunchbase', 'LinkedIn analysis', 'Press releases'],
    'Total employee count across portfolio companies. Only 60-75% typically have verified employee data.',
    jsonb_build_object(
      'sources', ARRAY['Company-reported', 'Crunchbase', 'LinkedIn', 'Press releases'],
      'verificationRange', jsonb_build_object('min', 0.60, 'max', 0.75),
      'estimationMethod', 'Verified + stage-based estimates for missing data',
      'confidence', 0.70
    )
  ),
  (
    'innovationIndex',
    'calculated',
    ARRAY['Proprietary momentum score', 'Sector heat analysis', 'Funding trends'],
    'Composite index: 40% momentum + 30% top performers + 30% hot sectors. All components are inferred metrics.',
    jsonb_build_object(
      'formula', '(avgMomentum × 0.4) + (topPerformers/n × 100 × 0.3) + (hotSectors/n × 100 × 0.3)',
      'components', jsonb_build_object(
        'momentum', jsonb_build_object(
          'quality', 'inferred',
          'source', 'Proprietary scoring algorithm'
        ),
        'topPerformers', jsonb_build_object(
          'quality', 'inferred',
          'source', 'Companies with momentum ≥ 75'
        ),
        'hotSectors', jsonb_build_object(
          'quality', 'inferred',
          'source', 'Market research + funding trends'
        )
      ),
      'confidence', 0.65
    )
  )
ON CONFLICT (kpi_name) DO UPDATE SET
  updated_at = NOW(),
  quality_level = EXCLUDED.quality_level,
  data_sources = EXCLUDED.data_sources,
  notes = EXCLUDED.notes,
  metadata = EXCLUDED.metadata;

-- Create function to log data quality assessments
CREATE OR REPLACE FUNCTION log_kpi_quality(
  p_kpi_name VARCHAR,
  p_quality_level VARCHAR,
  p_sources TEXT[],
  p_metadata JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO kpi_data_quality (kpi_name, quality_level, data_sources, metadata, last_verified)
  VALUES (p_kpi_name, p_quality_level, p_sources, p_metadata, NOW())
  ON CONFLICT (kpi_name) DO UPDATE SET
    last_verified = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE kpi_data_quality IS 'Tracks data sources and quality levels for each KPI. Documents which data is verified, inferred, or calculated.';
COMMENT ON COLUMN kpi_data_quality.quality_level IS 'One of: verified, inferred, calculated';
COMMENT ON COLUMN kpi_data_quality.last_verified IS 'Last date when sources were verified as current and accurate';
COMMENT ON FUNCTION log_kpi_quality IS 'Logs KPI quality assessment for audit trails and transparency';
