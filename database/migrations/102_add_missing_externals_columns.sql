-- Add columns referenced by migrations 023-041 that were never formally added
-- These columns are used consistently across 6+ migrations for external entity metadata

ALTER TABLE externals
  ADD COLUMN IF NOT EXISTS slug         VARCHAR(80),
  ADD COLUMN IF NOT EXISTS type         VARCHAR(30),
  ADD COLUMN IF NOT EXISTS headquarters VARCHAR(120),
  ADD COLUMN IF NOT EXISTS focus_areas  TEXT[];

-- Index for type lookups (used in opportunity matching)
CREATE INDEX IF NOT EXISTS idx_externals_type ON externals(type);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_externals_slug ON externals(slug);
