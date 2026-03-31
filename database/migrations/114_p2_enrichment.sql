-- Migration 114: P2 Enrichment — Programs metadata, missing graph edges, event_year backfill
--
-- P2-2: Populate programs.target_sectors / target_stages from program_type and name
-- P2-3: Add missing graph edges (university→spinout, sector→program)
-- P2-4: Backfill NULL event_year from note field dates
--
-- All operations are idempotent (WHERE guards, ON CONFLICT DO NOTHING).
-- Safe to run multiple times.
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/114_p2_enrichment.sql

BEGIN;

-- ============================================================
-- P2-2: Populate programs.target_stages based on program_type
-- ============================================================

-- accelerator_cohort → pre_seed, seed
UPDATE programs
SET target_stages = '{pre_seed,seed}'
WHERE program_type = 'accelerator_cohort'
  AND (target_stages IS NULL OR target_stages = '{}');

-- grant → seed, series_a
UPDATE programs
SET target_stages = '{seed,series_a}'
WHERE program_type = 'grant'
  AND (target_stages IS NULL OR target_stages = '{}');

-- equity → seed, series_a, series_b
UPDATE programs
SET target_stages = '{seed,series_a,series_b}'
WHERE program_type = 'equity'
  AND (target_stages IS NULL OR target_stages = '{}');

-- incubator → pre_seed
UPDATE programs
SET target_stages = '{pre_seed}'
WHERE program_type = 'incubator'
  AND (target_stages IS NULL OR target_stages = '{}');

-- ============================================================
-- P2-2b: Infer target_sectors from program name/description
-- ============================================================

-- Cleantech / Energy
UPDATE programs
SET target_sectors = array_cat(
  COALESCE(target_sectors, '{}'),
  '{Cleantech}'::TEXT[]
)
WHERE (target_sectors IS NULL OR NOT target_sectors @> '{Cleantech}')
  AND (
    LOWER(name) ~ '(clean|energy|solar|wind|renewable|climate|green)'
    OR LOWER(COALESCE(description, '')) ~ '(clean|energy|solar|wind|renewable|climate|green)'
  );

-- Healthcare / Biotech
UPDATE programs
SET target_sectors = array_cat(
  COALESCE(target_sectors, '{}'),
  '{Healthcare}'::TEXT[]
)
WHERE (target_sectors IS NULL OR NOT target_sectors @> '{Healthcare}')
  AND (
    LOWER(name) ~ '(health|biotech|medical|pharma|life.?science)'
    OR LOWER(COALESCE(description, '')) ~ '(health|biotech|medical|pharma|life.?science)'
  );

-- Technology / Software
UPDATE programs
SET target_sectors = array_cat(
  COALESCE(target_sectors, '{}'),
  '{Technology}'::TEXT[]
)
WHERE (target_sectors IS NULL OR NOT target_sectors @> '{Technology}')
  AND (
    LOWER(name) ~ '(tech|software|cyber|ai|machine.?learn|data|digital)'
    OR LOWER(COALESCE(description, '')) ~ '(tech|software|cyber|ai|machine.?learn|data|digital)'
  );

-- Manufacturing / Advanced Manufacturing
UPDATE programs
SET target_sectors = array_cat(
  COALESCE(target_sectors, '{}'),
  '{Manufacturing}'::TEXT[]
)
WHERE (target_sectors IS NULL OR NOT target_sectors @> '{Manufacturing}')
  AND (
    LOWER(name) ~ '(manufactur|industrial|aerospace|defense)'
    OR LOWER(COALESCE(description, '')) ~ '(manufactur|industrial|aerospace|defense)'
  );

-- Mining / Natural Resources
UPDATE programs
SET target_sectors = array_cat(
  COALESCE(target_sectors, '{}'),
  '{Mining}'::TEXT[]
)
WHERE (target_sectors IS NULL OR NOT target_sectors @> '{Mining}')
  AND (
    LOWER(name) ~ '(mining|mineral|lithium|natural.?resource)'
    OR LOWER(COALESCE(description, '')) ~ '(mining|mineral|lithium|natural.?resource)'
  );


-- ============================================================
-- P2-3a: Add university → spinout company edges (research_spinout)
-- ============================================================
-- Match externals with entity_type containing 'startup' (or companies)
-- that reference a university in their description/note, and link to
-- the university record.

-- From externals referencing university names
INSERT INTO graph_edges (source_id, target_id, rel, note, edge_category, confidence, agent_id)
SELECT DISTINCT
  'x_' || u.slug                       AS source_id,
  x.id                                 AS target_id,
  'research_spinout'                   AS rel,
  'Spinout from ' || u.name || ' (inferred from description, migration 114)' AS note,
  'historical'                         AS edge_category,
  0.60                                 AS confidence,
  'migration-114'                      AS agent_id
FROM universities u
JOIN externals x ON (
  LOWER(x.note) LIKE '%' || LOWER(u.name) || '%'
  OR LOWER(x.note) LIKE '%' || LOWER(u.slug) || '%'
)
WHERE x.entity_type IN ('startup', 'Startup', 'company', 'Company')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge
    WHERE ge.source_id = 'x_' || u.slug
      AND ge.target_id = x.id
      AND ge.rel = 'research_spinout'
  )
ON CONFLICT DO NOTHING;

-- Also match companies that reference universities in their description
INSERT INTO graph_edges (source_id, target_id, rel, note, edge_category, confidence, agent_id)
SELECT DISTINCT
  'x_' || u.slug                       AS source_id,
  'c_' || c.id                         AS target_id,
  'research_spinout'                   AS rel,
  'Spinout from ' || u.name || ' (inferred from company description, migration 114)' AS note,
  'historical'                         AS edge_category,
  0.55                                 AS confidence,
  'migration-114'                      AS agent_id
FROM universities u
JOIN companies c ON (
  LOWER(c.description) LIKE '%' || LOWER(u.name) || '%'
)
WHERE NOT EXISTS (
    SELECT 1 FROM graph_edges ge
    WHERE ge.source_id = 'x_' || u.slug
      AND ge.target_id = 'c_' || c.id
      AND ge.rel = 'research_spinout'
  )
ON CONFLICT DO NOTHING;

-- Also try matching via legacy_external_id for universities
INSERT INTO graph_edges (source_id, target_id, rel, note, edge_category, confidence, agent_id)
SELECT DISTINCT
  u.legacy_external_id                 AS source_id,
  x.id                                 AS target_id,
  'research_spinout'                   AS rel,
  'Spinout from ' || u.name || ' (inferred from description, migration 114)' AS note,
  'historical'                         AS edge_category,
  0.60                                 AS confidence,
  'migration-114'                      AS agent_id
FROM universities u
JOIN externals x ON (
  LOWER(x.note) LIKE '%' || LOWER(u.name) || '%'
  OR LOWER(x.note) LIKE '%' || LOWER(u.slug) || '%'
)
WHERE u.legacy_external_id IS NOT NULL
  AND x.entity_type IN ('startup', 'Startup', 'company', 'Company')
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge
    WHERE ge.source_id = u.legacy_external_id
      AND ge.target_id = x.id
      AND ge.rel = 'research_spinout'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- P2-3b: Add sector → program edges (program_serves)
-- ============================================================
-- For each program that has target_sectors populated, create an edge
-- from the matching sector node to the program node.

INSERT INTO graph_edges (source_id, target_id, rel, note, edge_category, confidence, agent_id)
SELECT DISTINCT
  's_' || s.slug                       AS source_id,
  'pr_' || p.id                        AS target_id,
  'program_serves'                     AS rel,
  p.name || ' targets ' || s.name || ' sector (migration 114)' AS note,
  'historical'                         AS edge_category,
  0.80                                 AS confidence,
  'migration-114'                      AS agent_id
FROM programs p
CROSS JOIN LATERAL unnest(p.target_sectors) AS ts(sector_name)
JOIN sectors s ON (
  LOWER(s.name) = LOWER(ts.sector_name)
  OR LOWER(s.slug) = LOWER(ts.sector_name)
)
WHERE p.target_sectors IS NOT NULL
  AND p.target_sectors != '{}'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges ge
    WHERE ge.source_id = 's_' || s.slug
      AND ge.target_id = 'pr_' || p.id
      AND ge.rel = 'program_serves'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- P2-4: Backfill NULL event_year from note field dates
-- ============================================================
-- Extract the first 4-digit year (19xx or 20xx) from the note field
-- and set event_year where it is currently NULL.

UPDATE graph_edges
SET event_year = (regexp_match(note, '((?:19|20)\d{2})'))[1]::INTEGER
WHERE event_year IS NULL
  AND note IS NOT NULL
  AND regexp_match(note, '((?:19|20)\d{2})') IS NOT NULL;


COMMIT;

-- ============================================================
-- Verification queries (run outside transaction)
-- ============================================================

-- P2-2: Check target_stages population
SELECT program_type,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE target_stages IS NOT NULL AND target_stages != '{}') AS has_stages,
       COUNT(*) FILTER (WHERE target_sectors IS NOT NULL AND target_sectors != '{}') AS has_sectors
FROM programs
GROUP BY program_type
ORDER BY program_type;

-- P2-3a: Count research_spinout edges
SELECT rel, COUNT(*) AS edge_count
FROM graph_edges
WHERE rel = 'research_spinout'
GROUP BY rel;

-- P2-3b: Count program_serves edges
SELECT rel, COUNT(*) AS edge_count
FROM graph_edges
WHERE rel = 'program_serves'
GROUP BY rel;

-- P2-4: Check event_year backfill coverage
SELECT
  COUNT(*) AS total_edges,
  COUNT(event_year) AS has_event_year,
  COUNT(*) - COUNT(event_year) AS still_null,
  ROUND(100.0 * COUNT(event_year) / NULLIF(COUNT(*), 0), 1) AS pct_populated
FROM graph_edges;

-- P2-4: Sample of backfilled event_years
SELECT id, source_id, target_id, rel, event_year,
       LEFT(note, 80) AS note_excerpt
FROM graph_edges
WHERE agent_id = 'migration-114'
   OR (event_year IS NOT NULL AND note ~ '(19|20)\d{2}')
ORDER BY id DESC
LIMIT 10;
