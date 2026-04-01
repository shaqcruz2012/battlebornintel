-- 159_accelerator_ecosystem_regions.sql
-- Audit and fix region assignments for all accelerators and ecosystem orgs.
-- Idempotent: all updates use WHERE clauses; no destructive changes.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ACCELERATORS — Fix NULL regions
-- ═══════════════════════════════════════════════════════════════════════════════

-- National accelerators without Nevada-specific location get 'other'
UPDATE accelerators SET region = 'other'
WHERE id = 'a_gener8tor' AND (region IS NULL OR region = '');

UPDATE accelerators SET region = 'other'
WHERE id = 'a_techstars' AND (region IS NULL OR region = '');

-- Safety net: any other accelerators that somehow have NULL region
-- Assign based on city if possible
UPDATE accelerators SET region = 'las_vegas'
WHERE region IS NULL AND city ILIKE '%las vegas%';

UPDATE accelerators SET region = 'reno'
WHERE region IS NULL AND city ILIKE '%reno%';

UPDATE accelerators SET region = 'reno'
WHERE region IS NULL AND city ILIKE '%carson city%';

UPDATE accelerators SET region = 'other'
WHERE region IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ECOSYSTEM ORGS — Fix incorrect and NULL regions
-- ═══════════════════════════════════════════════════════════════════════════════

-- GOED is a statewide agency, not Reno-specific
UPDATE ecosystem_orgs SET region = 'statewide'
WHERE id = 'e_goed' AND region != 'statewide';

-- UNLV entities → las_vegas
UPDATE ecosystem_orgs SET region = 'las_vegas'
WHERE (name ILIKE '%UNLV%' OR id ILIKE '%unlv%') AND (region IS NULL OR region = '');

-- UNR entities → reno
UPDATE ecosystem_orgs SET region = 'reno'
WHERE (name ILIKE '%UNR%' OR id ILIKE '%unr%' OR name ILIKE '%Innevation%') AND (region IS NULL OR region = '');

-- EDAWN → reno (verify)
UPDATE ecosystem_orgs SET region = 'reno'
WHERE id = 'e_edawn' AND (region IS NULL OR region = '');

-- LVGEA → las_vegas (verify)
UPDATE ecosystem_orgs SET region = 'las_vegas'
WHERE id = 'e_lvgea' AND (region IS NULL OR region = '');

-- Safety net: any remaining ecosystem orgs with NULL region
UPDATE ecosystem_orgs SET region = 'las_vegas'
WHERE region IS NULL AND city ILIKE '%las vegas%';

UPDATE ecosystem_orgs SET region = 'reno'
WHERE region IS NULL AND city ILIKE '%reno%';

UPDATE ecosystem_orgs SET region = 'reno'
WHERE region IS NULL AND city ILIKE '%carson city%';

UPDATE ecosystem_orgs SET region = 'statewide'
WHERE region IS NULL AND city IS NULL;

UPDATE ecosystem_orgs SET region = 'other'
WHERE region IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. VERIFICATION QUERY (logged as NOTICE for migration runners)
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  null_accel INTEGER;
  null_eco   INTEGER;
BEGIN
  SELECT count(*) INTO null_accel FROM accelerators WHERE region IS NULL OR region = '';
  SELECT count(*) INTO null_eco   FROM ecosystem_orgs WHERE region IS NULL OR region = '';

  IF null_accel > 0 THEN
    RAISE WARNING '% accelerator(s) still have NULL/empty region', null_accel;
  END IF;
  IF null_eco > 0 THEN
    RAISE WARNING '% ecosystem_org(s) still have NULL/empty region', null_eco;
  END IF;
  IF null_accel = 0 AND null_eco = 0 THEN
    RAISE NOTICE 'Region audit complete: all accelerators and ecosystem orgs have region assignments.';
  END IF;
END $$;

COMMIT;
