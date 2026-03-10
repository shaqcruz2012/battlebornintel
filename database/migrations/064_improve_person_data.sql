-- Migration 064: Improve person node data quality
--
-- AUDIT FINDINGS (2026-03-09):
--
-- 1. people table contains 6 person nodes: p_barron, p_kurtzer, p_reynolds,
--    p_saling, p_straubel, p_tomasik.
--    All have valid, non-generic names. No empty or placeholder names found.
--
-- 2. Jeff Saling (p_saling) has role='Exec Director' which is too terse and
--    ambiguous. His graph_edges show:
--      p_saling → f_fundnv    (manages, note='Co-founder, Ruby Partners GP')
--      p_saling → a_startupnv (manages, note='Executive Director')
--    Fix: expand role to the canonical dual-title form.
--
-- 3. p_barron, p_kurtzer, p_reynolds, p_straubel, p_tomasik: no changes needed.
--    All have descriptive roles and valid company_id foreign keys. The API
--    auto-generates founder_of edges from company_id at query time.
--
-- 4. No orphaned person-like IDs found in graph_edges that lack a people row.
--    (p_1..p_25 are PROGRAM nodes, correctly resolved via the programs table.)
--
-- 5. externals entry 'arcadeiq-ai': name='ArcadeIQ AI', entity_type='Startup'.
--    Label is correct. One edge exists: x_201 → arcadeiq-ai (invested_in).
--    No action needed.
--
-- Run: psql -U bbi -d battlebornintel -h localhost -p 5433 \
--        -f database/migrations/064_improve_person_data.sql

BEGIN;

-- ============================================================
-- SECTION 1: Jeff Saling — expand role label
-- ============================================================
-- Current: 'Exec Director'
-- Updated: 'Executive Director, StartupNV / Co-Founder, Ruby Partners'
-- Rationale: The current value is ambiguous (Executive Director of what?).
-- His graph edges make both roles explicit; the role field should match.

UPDATE people
SET role = 'Executive Director, StartupNV / Co-Founder, Ruby Partners'
WHERE id = 'p_saling'
  AND role = 'Exec Director';

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM people
  WHERE id = 'p_saling'
    AND role = 'Executive Director, StartupNV / Co-Founder, Ruby Partners';

  IF v_count = 1 THEN
    RAISE NOTICE 'Section 1 passed: p_saling role updated to full dual-title form.';
  ELSE
    RAISE EXCEPTION 'Section 1 failed: p_saling role update did not apply as expected.';
  END IF;
END;
$$;

-- ============================================================
-- SECTION 2: Integrity check — no orphaned person-like IDs
-- ============================================================
-- Confirm that every named p_* ID in graph_edges (excluding numeric p_<n>
-- program nodes) resolves to a row in the people table.

DO $$
DECLARE
  v_orphans INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_orphans
  FROM (
    SELECT DISTINCT source_id AS node_id
    FROM graph_edges
    WHERE source_id ~ '^p_[a-z]'
      AND source_id NOT IN (SELECT id FROM people)
    UNION
    SELECT DISTINCT target_id
    FROM graph_edges
    WHERE target_id ~ '^p_[a-z]'
      AND target_id NOT IN (SELECT id FROM people)
  ) orphans;

  IF v_orphans > 0 THEN
    RAISE WARNING
      'Section 2: % named p_* graph_edge node(s) have no matching people row. '
      'Investigate and add INSERT INTO people rows above.',
      v_orphans;
  ELSE
    RAISE NOTICE 'Section 2 passed: all named p_* graph_edge nodes resolve to people rows.';
  END IF;
END;
$$;

-- ============================================================
-- SECTION 3: Integrity check — arcadeiq-ai label in externals
-- ============================================================

DO $$
DECLARE
  v_name TEXT;
BEGIN
  SELECT name INTO v_name FROM externals WHERE id = 'arcadeiq-ai';

  IF v_name IS NULL THEN
    RAISE WARNING 'Section 3: arcadeiq-ai not found in externals table.';
  ELSIF v_name = 'ArcadeIQ AI' THEN
    RAISE NOTICE 'Section 3 passed: arcadeiq-ai label is correctly "ArcadeIQ AI".';
  ELSE
    RAISE NOTICE 'Section 3: arcadeiq-ai label is "%" — updating to "ArcadeIQ AI".', v_name;
    UPDATE externals SET name = 'ArcadeIQ AI' WHERE id = 'arcadeiq-ai';
  END IF;
END;
$$;

-- ============================================================
-- SECTION 4: Verification queries
-- ============================================================

-- 4a. Final state of all person nodes
SELECT
  id,
  name,
  role,
  company_id,
  'person' AS node_type
FROM people
ORDER BY id;

-- 4b. All graph_edges involving named person nodes
SELECT
  ge.source_id,
  ge.target_id,
  ge.rel,
  ge.note,
  p.name AS person_name,
  p.role AS person_role
FROM graph_edges ge
JOIN people p
  ON p.id = ge.source_id OR p.id = ge.target_id
WHERE ge.source_id ~ '^p_[a-z]' OR ge.target_id ~ '^p_[a-z]'
ORDER BY ge.source_id, ge.target_id;

-- 4c. arcadeiq-ai external node
SELECT id, name, entity_type, note
FROM externals
WHERE id = 'arcadeiq-ai';

COMMIT;
