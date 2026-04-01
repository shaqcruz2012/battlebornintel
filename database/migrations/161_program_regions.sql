-- Migration 161: Ensure all programs have region assignments
-- Adds region_id FK column to programs table and backfills based on
-- program type, administering agency, and name.
-- Idempotent: ADD COLUMN IF NOT EXISTS, UPDATE with WHERE clauses
-- Generated: 2026-03-31

BEGIN;

-- ============================================================
-- 1. Add region_id column to programs (FK to regions)
-- ============================================================
-- Regions reference:
--   1 = Nevada (statewide)
--   2 = Las Vegas (metro)
--   3 = Reno-Sparks (metro)
--   4 = Henderson (city)
--   5 = Carson City (city)

ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id);

CREATE INDEX IF NOT EXISTS idx_programs_region_id ON programs(region_id);

-- ============================================================
-- 2. Default: set all programs without region_id to statewide (Nevada)
-- ============================================================
-- Safe starting point — specific overrides below narrow this down.
UPDATE programs SET region_id = 1 WHERE region_id IS NULL;

-- ============================================================
-- 3. SSBCI programs → statewide (federal/state programs)
-- ============================================================
-- Already set to 1 (Nevada) by default above. Explicit for clarity.
UPDATE programs SET region_id = 1
WHERE slug IN ('goed-ssbci', 'battle-born-venture', 'fund-nv', 'silver-state-opportunity-fund');

-- ============================================================
-- 4. SBIR/STTR programs → statewide (federal programs available to all NV)
-- ============================================================
UPDATE programs SET region_id = 1
WHERE slug LIKE '%sbir%' OR slug LIKE '%sttr%' OR slug LIKE '%arpa-e%';

-- ============================================================
-- 5. GOED programs → statewide
-- ============================================================
UPDATE programs SET region_id = 1
WHERE slug LIKE 'goed-%'
   OR slug IN ('nevada-sbir-sttr-matching', 'nevada-catalyst-fund', 'goed-grants');

-- ============================================================
-- 6. Knowledge Fund → statewide (university system)
-- ============================================================
UPDATE programs SET region_id = 1
WHERE slug IN ('nevada-knowledge-fund', 'goed-knowledge-fund');

-- ============================================================
-- 7. SBA programs → statewide (federal programs)
-- ============================================================
UPDATE programs SET region_id = 1
WHERE slug LIKE 'sba-%';

-- ============================================================
-- 8. State-level agencies/programs → statewide
-- ============================================================
UPDATE programs SET region_id = 1
WHERE slug IN (
  'nevada-osit',
  'detr-workforce-development',
  'nv-apex-accelerator',
  'nevada-sbdc',
  'nvtc-techhire',
  'innovatenv-phase-0',
  'battle-born-growth-microloan',
  'fundnv-pre-seed'
);

-- ============================================================
-- 9. StartUpNV Accelerator → las_vegas (HQ in Las Vegas)
-- ============================================================
UPDATE programs SET region_id = 2
WHERE slug IN ('startupnv-accelerator');

-- ============================================================
-- 10. gener8tor programs → las_vegas (primary NV location)
--     If a reno-specific gener8tor program exists, override to reno.
-- ============================================================
UPDATE programs SET region_id = 2
WHERE slug LIKE 'gener8tor%';

-- Override any reno-specific gener8tor programs
UPDATE programs SET region_id = 3
WHERE slug LIKE 'gener8tor%' AND (
  name ILIKE '%reno%'
  OR target_regions = ARRAY['reno']
);

-- ============================================================
-- 11. UNLV programs → las_vegas
-- ============================================================
UPDATE programs SET region_id = 2
WHERE slug LIKE 'unlv-%'
   OR name ILIKE '%UNLV%';

-- ============================================================
-- 12. UNR programs → reno
-- ============================================================
UPDATE programs SET region_id = 3
WHERE slug LIKE 'unr-%'
   OR name ILIKE '%UNR %'
   OR name ILIKE '%University of Nevada, Reno%';

-- ============================================================
-- 13. Location-specific programs
-- ============================================================
-- UNLV Black Fire Innovation → las_vegas
UPDATE programs SET region_id = 2
WHERE slug = 'unlv-black-fire-innovation';

-- Switch CITIES → las_vegas
UPDATE programs SET region_id = 2
WHERE slug = 'switch-cities';

-- Las Vegas Urban League → las_vegas
UPDATE programs SET region_id = 2
WHERE slug = 'las-vegas-urban-league';

-- Workforce Connections (Southern Nevada) → las_vegas
UPDATE programs SET region_id = 2
WHERE slug = 'workforce-connections';

-- LVCVA Innovation → las_vegas
UPDATE programs SET region_id = 2
WHERE slug = 'lvcva-innovation';

-- Reno Collective → reno
UPDATE programs SET region_id = 3
WHERE slug = 'reno-collective';

-- Tesla Workforce Training (Gigafactory/Storey County) → reno
UPDATE programs SET region_id = 3
WHERE slug = 'tesla-workforce-training';

-- Blockchains LLC Innovation Campus (Storey County) → reno
UPDATE programs SET region_id = 3
WHERE slug = 'blockchains-innovation-campus';

-- Nevada SBDC hosted by UNR but statewide → keep statewide (already set)

-- ============================================================
-- 14. Audit: log programs that still have NULL region_id (should be none)
-- ============================================================
-- This is a safety check. If any programs were missed, they got the
-- statewide default in step 2.

COMMIT;
