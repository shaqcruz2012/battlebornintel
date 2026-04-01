-- Migration 160: Backfill people.region_id from company/org affiliations
-- The people table already has region_id (INTEGER FK to regions) from migration 004,
-- but no migration ever populated it. This backfills region_id using:
--   1. Direct company_id FK on the people row -> company's region_id
--   2. graph_edges relationships (employed_at, founded_by, partners_with) -> company region
--   3. Default to Las Vegas (id=2) for anyone still unassigned
-- All statements are idempotent (only update WHERE region_id IS NULL).

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- Step 1: People with a direct company_id — inherit the company's region_id
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE people p
SET region_id = c.region_id
FROM companies c
WHERE p.company_id = c.id
  AND c.region_id IS NOT NULL
  AND p.region_id IS NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- Step 2: People without company_id but linked via graph_edges
--   Look for founded_by, employed_at, partners_with edges where the person
--   is the source and a company (c_*) is the target, or vice versa.
--   Pick the company with the strongest relationship (founded > employed > partners).
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE people p
SET region_id = sub.region_id
FROM (
  SELECT DISTINCT ON (e.person_id)
    e.person_id,
    c.region_id
  FROM (
    -- Person as source, company as target
    SELECT source_id AS person_id,
           CAST(SUBSTRING(target_id FROM 3) AS INTEGER) AS cid,
           rel
    FROM graph_edges
    WHERE source_id LIKE 'p_%'
      AND target_id ~ '^c_\d+$'
      AND rel IN ('founded_by', 'employed_at', 'partners_with')

    UNION ALL

    -- Person as target, company as source (less common but possible)
    SELECT target_id AS person_id,
           CAST(SUBSTRING(source_id FROM 3) AS INTEGER) AS cid,
           rel
    FROM graph_edges
    WHERE target_id LIKE 'p_%'
      AND source_id ~ '^c_\d+$'
      AND rel IN ('founded_by', 'employed_at', 'partners_with')
  ) e
  JOIN companies c ON c.id = e.cid AND c.region_id IS NOT NULL
  ORDER BY e.person_id,
           CASE e.rel
             WHEN 'founded_by'    THEN 1
             WHEN 'employed_at'   THEN 2
             WHEN 'partners_with' THEN 3
           END
) sub
WHERE p.id = sub.person_id
  AND p.region_id IS NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- Step 3: Default remaining people to Las Vegas (region id = 2)
--   Most Nevada ecosystem activity is Vegas-based.
-- ══════════════════════════════════════════════════════════════════════════════

UPDATE people
SET region_id = (SELECT id FROM regions WHERE name = 'Las Vegas' AND level = 'metro' LIMIT 1)
WHERE region_id IS NULL;

-- ══════════════════════════════════════════════════════════════════════════════
-- Step 4: Add index for region_id lookups on people (idempotent)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_people_region_id ON people(region_id);

COMMIT;
