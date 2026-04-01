-- Migration 165: Capital Flow Data Quality Guardrails
-- Adds source_confidence classification to graph_edges and quarantines
-- financial claims that lack verifiable source attribution.
--
-- Context: The capital flow engine (api/src/engine/capital-flow.js) reads
-- invested_in edges from graph_edges. Migration 132 seeded ~120+ edges with
-- dollar amounts in the note field but NO source_url. Migrations 141/142
-- added properly sourced edges with source_url. This migration classifies
-- all edges by source quality and quarantines unsourced financial claims.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/165_capital_flow_guardrails.sql

BEGIN;

-- ============================================================
-- SECTION 1: Add source_confidence column to graph_edges
-- ============================================================
-- Values:
--   'verified'   — SEC filing, Crunchbase company profile, official gov page
--   'reported'   — News article with specific URL path (dated article)
--   'estimated'  — Computed/inferred from other data
--   'unverified' — No source or generic URL only

ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS source_confidence VARCHAR(12)
    CHECK (source_confidence IS NULL
      OR source_confidence IN ('verified', 'reported', 'estimated', 'unverified'));

CREATE INDEX IF NOT EXISTS idx_edges_source_confidence
  ON graph_edges(source_confidence);

-- Add quarantined flag for graph_edges (mirrors events table pattern from migration 126)
ALTER TABLE graph_edges
  ADD COLUMN IF NOT EXISTS quarantined BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_edges_quarantined
  ON graph_edges(quarantined) WHERE quarantined = TRUE;

-- ============================================================
-- SECTION 2: Backfill source_confidence from existing source_url
-- ============================================================

-- 2a. 'verified' — SEC, Crunchbase company profiles, official gov domains
UPDATE graph_edges
SET source_confidence = 'verified'
WHERE source_url IS NOT NULL
  AND source_confidence IS NULL
  AND (
    source_url LIKE '%sec.gov%'
    OR source_url LIKE '%crunchbase.com/organization/%'
    OR source_url LIKE '%crunchbase.com/funding-round/%'
    OR source_url LIKE '%goed.nv.gov/newsroom/%'
    OR source_url LIKE '%treasury.gov%'
    OR source_url LIKE '%sba.gov%'
    OR source_url LIKE '%sbir.gov%'
    OR source_url LIKE '%energy.gov%'
    OR source_url LIKE '%eda.gov%'
    OR source_url LIKE '%leg.state.nv.us%'
    OR source_url LIKE '%esos.nv.gov%'
    OR source_url LIKE '%unlv.edu/%'
    OR source_url LIKE '%unr.edu/%'
    OR source_url LIKE '%desertforgeventures.com/portfolio%'
  );

-- 2b. 'reported' — News articles with date-stamped paths
UPDATE graph_edges
SET source_confidence = 'reported'
WHERE source_url IS NOT NULL
  AND source_confidence IS NULL
  AND (
    source_url ~ '/20[0-9]{2}/'          -- path contains /2024/, /2025/, etc.
    OR source_url LIKE '%techcrunch.com/%'
    OR source_url LIKE '%reuters.com/%'
    OR source_url LIKE '%bloomberg.com/%'
    OR source_url LIKE '%wsj.com/%'
    OR source_url LIKE '%prnewswire.com/%'
    OR source_url LIKE '%businesswire.com/%'
    OR source_url LIKE '%nevadabusiness.com/%'
    OR source_url LIKE '%lvgea.org/%'
    OR source_url LIKE '%reviewjournal.com/%'
  );

-- 2c. 'estimated' — Computed edges (prefixed with 'computed:' in source_url or note)
UPDATE graph_edges
SET source_confidence = 'estimated'
WHERE source_confidence IS NULL
  AND (
    source_url LIKE 'computed:%'
    OR note LIKE 'computed:%'
    OR note LIKE '%inferred%'
    OR note LIKE '%estimated%'
  );

-- 2d. 'verified' — Edges explicitly marked verified=TRUE with a source_url
-- These were set by earlier verification migrations (032, 033, 034, etc.)
UPDATE graph_edges
SET source_confidence = 'verified'
WHERE source_confidence IS NULL
  AND verified = TRUE
  AND source_url IS NOT NULL
  AND LENGTH(source_url) > 10;

-- 2e. 'reported' — Remaining edges with a real source_url but not yet classified
UPDATE graph_edges
SET source_confidence = 'reported'
WHERE source_confidence IS NULL
  AND source_url IS NOT NULL
  AND LENGTH(source_url) > 10
  AND source_url NOT LIKE '%example.com%';

-- 2f. 'unverified' — Everything else (no source_url or generic URLs)
UPDATE graph_edges
SET source_confidence = 'unverified'
WHERE source_confidence IS NULL;


-- ============================================================
-- SECTION 3: Quarantine invested_in edges with dollar claims but no source
-- ============================================================
-- These edges have dollar amounts in the note field (from migration 132)
-- but were never given a source_url. They may be accurate but are unverifiable.
-- Quarantining hides them from the capital flow engine without deleting data.

UPDATE graph_edges
SET quarantined = TRUE
WHERE source_confidence = 'unverified'
  AND rel IN ('invested_in', 'funded', 'funded_by', 'grants_to', 'loaned_to')
  AND note ~ '\$[0-9]'
  AND (source_url IS NULL OR LENGTH(TRIM(source_url)) < 10);


-- ============================================================
-- SECTION 4: Create filtered view for clean capital flow queries
-- ============================================================
-- The capital flow engine should query this view instead of raw graph_edges
-- to automatically exclude quarantined/unverified financial claims.

DROP VIEW IF EXISTS graph_edges_verified_capital;
CREATE VIEW graph_edges_verified_capital AS
SELECT *
FROM graph_edges
WHERE quarantined = FALSE
  AND (
    -- Non-financial edges pass through unfiltered
    rel NOT IN ('invested_in', 'funded', 'funded_by', 'grants_to', 'loaned_to')
    OR
    -- Financial edges must have at least 'reported' confidence
    source_confidence IN ('verified', 'reported')
  );

COMMENT ON VIEW graph_edges_verified_capital IS
  'Filtered view excluding quarantined edges and unverified financial claims. '
  'Use this for capital flow analytics instead of raw graph_edges.';


-- ============================================================
-- SECTION 5: Audit report queries
-- ============================================================

-- 5a. Summary: source_confidence distribution across all edges
SELECT
  source_confidence,
  COUNT(*) AS edge_count,
  COUNT(*) FILTER (WHERE note ~ '\$[0-9]') AS has_dollar_amount,
  COUNT(*) FILTER (WHERE quarantined) AS quarantined_count
FROM graph_edges
GROUP BY source_confidence
ORDER BY edge_count DESC;

-- 5b. Quarantined edges with dollar amounts (the flagged items)
SELECT
  id, source_id, target_id, rel, note, event_year,
  source_url, source_confidence, verified
FROM graph_edges
WHERE quarantined = TRUE
  AND note ~ '\$[0-9]'
ORDER BY
  CASE WHEN note ~ '\$[0-9]+B' THEN 1
       WHEN note ~ '\$[0-9]+M' THEN 2
       ELSE 3
  END,
  event_year DESC
LIMIT 200;

-- 5c. Verified/reported edges with dollar amounts (the KEEP list)
SELECT
  id, source_id, target_id, rel, note, event_year,
  source_url, source_confidence
FROM graph_edges
WHERE quarantined = FALSE
  AND source_confidence IN ('verified', 'reported')
  AND note ~ '\$[0-9]'
ORDER BY event_year DESC
LIMIT 200;

-- 5d. Funds table audit — check which fund amounts have sources
SELECT
  f.id, f.name, f.fund_type,
  f.allocated_m, f.deployed_m,
  f.verified,
  CASE
    WHEN f.verified = TRUE THEN 'sourced'
    WHEN f.allocated_m IS NOT NULL THEN 'unsourced_amount'
    ELSE 'no_amount'
  END AS funding_status
FROM funds f
ORDER BY COALESCE(f.allocated_m, 0) DESC;

COMMIT;
