-- Migration 051: Fix graph_edges that reference companies by slug instead of numeric ID
--
-- Problem: Several graph_edges rows were inserted with source_id or target_id values
-- that use company slugs (e.g. 'c_cognizer-ai', 'c_magicdoor') or a 'slug:' prefix
-- (e.g. 'slug:nevadavolt-energy'), instead of the canonical numeric format
-- 'c_{id}' (e.g. 'c_25', 'c_14').
--
-- Additionally, three edges reference external companies (Ford, Prime Planet Energy,
-- Sibanye-Stillwater) that are not tracked in the companies table, and two edges
-- reference portfolio-company slugs (cooledge-thermal, nevadavolt-energy) that also
-- have no corresponding companies row.
--
-- Resolution strategy:
--   - REMAP:  Slug-based c_ IDs whose company exists in the DB → corrected numeric ID
--   - DELETE: Slug-based IDs with no matching company row (external partners, fabricated)
--
-- Affected edges:
--   id 4927: f_fundnv → c_cognizer-ai   (REMAP → c_25)
--   id 4928: f_fundnv → c_magicdoor     (REMAP → c_14)
--   id  722: c_sibanyestillwater → c_49  (DELETE — Sibanye-Stillwater not a tracked company)
--   id  723: c_ford → c_49              (DELETE — Ford not a tracked company)
--   id  724: c_primeplanetsenergy → c_49 (DELETE — Prime Planet not a tracked company)
--   id 4941: x_202 → cooledge-thermal   (DELETE — CoolEdge Thermal not in companies table)
--   id 4968: x_232 → slug:nevadavolt-energy (DELETE — NevadaVolt Energy not in companies table)
--
-- Idempotency: All UPDATE/DELETE statements are written so that re-running the
-- migration is a no-op when the target rows no longer contain the bad values.

BEGIN;

-- ─── REMAP: c_cognizer-ai → c_25 (Cognizer AI) ───────────────────────────────
-- Edge 4927: FundNV Q1 2026 pre-seed investment into Cognizer AI
UPDATE graph_edges
   SET target_id = 'c_25'
 WHERE target_id = 'c_cognizer-ai';

UPDATE graph_edges
   SET source_id = 'c_25'
 WHERE source_id = 'c_cognizer-ai';

-- ─── REMAP: c_magicdoor → c_14 (MagicDoor) ──────────────────────────────────
-- Edge 4928: FundNV Q1 2026 pre-seed investment into MagicDoor
UPDATE graph_edges
   SET target_id = 'c_14'
 WHERE target_id = 'c_magicdoor';

UPDATE graph_edges
   SET source_id = 'c_14'
 WHERE source_id = 'c_magicdoor';

-- ─── DELETE: c_sibanyestillwater (Sibanye-Stillwater, id 722) ────────────────
-- Edge 722: Sibanye-Stillwater 50/50 JV with Ioneer (c_49) — exited Feb 2025.
-- Sibanye-Stillwater is a large external mining company, not tracked in companies.
DELETE FROM graph_edges
 WHERE id = 722
   AND source_id = 'c_sibanyestillwater';

-- ─── DELETE: c_ford (Ford Motor, id 723) ─────────────────────────────────────
-- Edge 723: Ford lithium offtake 7 000 t/a 2022 agreement with Ioneer (c_49).
-- Ford is a large external OEM, not tracked in companies.
DELETE FROM graph_edges
 WHERE id = 723
   AND source_id = 'c_ford';

-- ─── DELETE: c_primeplanetsenergy (Prime Planet Energy, id 724) ──────────────
-- Edge 724: Prime Planet (Toyota/Panasonic JV) offtake 4 000 t/a with Ioneer (c_49).
-- Prime Planet Energy is an external JV, not tracked in companies.
DELETE FROM graph_edges
 WHERE id = 724
   AND source_id = 'c_primeplanetsenergy';

-- ─── DELETE: cooledge-thermal (bare slug, id 4941) ────────────────────────────
-- Edge 4941: x_202 (Switch Ventures) invested_in CoolEdge Thermal.
-- The target was recorded without a node-type prefix and the company does not
-- exist in the companies table (fabricated edge).
DELETE FROM graph_edges
 WHERE id = 4941
   AND target_id = 'cooledge-thermal';

-- ─── DELETE: slug:nevadavolt-energy (slug: prefix, id 4968) ──────────────────
-- Edge 4968: x_232 (DRI) research_partnership with NevadaVolt Energy.
-- The target was recorded with a 'slug:' prefix, which is not a valid node-ID
-- format, and NevadaVolt Energy has no corresponding companies row.
DELETE FROM graph_edges
 WHERE id = 4968
   AND target_id = 'slug:nevadavolt-energy';

-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
-- The following query must return zero rows; any result indicates a remaining
-- bad edge that was not addressed by this migration.
DO $$
DECLARE
  bad_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bad_count
  FROM graph_edges
  WHERE (
    -- c_ slugs that don't resolve to a numeric company ID
    (source_id LIKE 'c_%' AND source_id NOT IN (SELECT 'c_' || id::text FROM companies))
    OR
    (target_id LIKE 'c_%' AND target_id NOT IN (SELECT 'c_' || id::text FROM companies))
    OR
    -- any remaining slug: prefix
    source_id LIKE 'slug:%'
    OR
    target_id LIKE 'slug:%'
  );

  IF bad_count > 0 THEN
    RAISE EXCEPTION
      'Migration 051 verification FAILED: % unresolved slug edge(s) remain. '
      'Roll back and investigate before committing.',
      bad_count;
  END IF;

  RAISE NOTICE 'Migration 051 verification PASSED: 0 unresolved slug edges remain.';
END;
$$;

COMMIT;
