-- Migration 115: Remove fabricated entities and events (Wave 3)
--
-- Migrations 043/044/050 caught wave 1. Migration 112 caught wave 2.
-- This migration removes the THIRD wave discovered by comprehensive audit
-- on 2026-03-30 using web-search verification of ALL entity names.
--
-- CATEGORIES OF FABRICATED DATA REMOVED:
--
-- A. FABRICATED UNIVERSITY SPINOUT COMPANIES (migration 025)
--    All zero web presence — invented by AI agent:
--    QuantumEdge NV, ArtemisAg, TitanShield, HelioPath, NanoShield NV,
--    AquaGenica, PackBot AI, NevadaMed, DesertDrive, ClearVault, LunarBuild,
--    BioNVate Therapeutics, Sagebrush Research Consortium
--
-- B. FABRICATED COMPANIES FROM MILESTONE EVENTS (migration 029)
--    VegasLogic AI, PayVault Financial, DesertWing Autonomous,
--    GreatBasin Genomics, NeonMind AI, ShieldWall Security,
--    CasinoIQ Analytics, TableMetrics — all zero web presence
--    Batjac Ventures (migration 030) — zero web presence
--
-- C. FABRICATED GOVERNMENT LEGISLATION (migrations 024, 042)
--    SB 47 "AI Innovation Tax Credit" — no such bill exists
--    SB 127 "Nevada AI Innovation Act" — no such bill exists
--    HB 223 "Advanced Manufacturing Incentive Package" — no such bill exists
--    SB 189 — fabricated bill number
--    "$15M Innovation District Phase 3 bond" — fabricated
--    "NSF Award #2602315" — fabricated award number
--
-- D. FABRICATED LP DOLLAR AMOUNTS (migration 023/052)
--    NV PERS "$50M venture allocation" — fabricated specific amount
--    CalPERS "$200M Innovation Fund" — fabricated Nevada-specific commitment
--    The entities are REAL but the specific dollar commitments are fabricated.
--    We clean the note fields but keep the entities.
--
-- Safe to run multiple times (all operations are idempotent).

BEGIN;

-- ============================================================
-- A. Remove fabricated university spinout companies
-- ============================================================

-- Remove timeline events
DELETE FROM timeline_events
WHERE company_name IN (
  'QuantumEdge NV', 'ArtemisAg', 'TitanShield', 'HelioPath',
  'NanoShield NV', 'AquaGenica', 'PackBot AI', 'NevadaMed',
  'DesertDrive', 'ClearVault', 'LunarBuild',
  'BioNVate Therapeutics', 'Sagebrush Research Consortium'
);

-- Remove stakeholder activities
DELETE FROM stakeholder_activities
WHERE company_id IN (
  'quantumedge-nv', 'artemisag', 'titanshield', 'heliopath',
  'nanoshield-nv', 'aquagenica', 'packbot-ai', 'nevadamed',
  'desertdrive', 'clearvault', 'lunarbuild',
  'bionvate-therapeutics', 'sagebrush-research-consortium'
)
OR description ILIKE ANY(ARRAY[
  '%QuantumEdge NV%', '%ArtemisAg%', '%TitanShield%', '%HelioPath%',
  '%NanoShield NV%', '%AquaGenica%', '%PackBot AI%', '%NevadaMed%',
  '%DesertDrive%', '%ClearVault%', '%LunarBuild%',
  '%BioNVate%', '%Sagebrush Research%'
]);

-- Remove graph edges
DELETE FROM graph_edges
WHERE source_id IN (
  'x_quantumedge-nv', 'x_artemisag', 'x_titanshield', 'x_heliopath',
  'x_nanoshield-nv', 'x_aquagenica', 'x_packbot-ai', 'x_nevadamed',
  'x_desertdrive', 'x_clearvault', 'x_lunarbuild',
  'x_bionvate', 'x_sagebrush-research',
  'quantumedge-nv', 'artemisag', 'titanshield', 'heliopath',
  'nanoshield-nv', 'aquagenica', 'packbot-ai', 'nevadamed',
  'desertdrive', 'clearvault', 'lunarbuild',
  'bionvate-therapeutics', 'sagebrush-research-consortium'
)
OR target_id IN (
  'x_quantumedge-nv', 'x_artemisag', 'x_titanshield', 'x_heliopath',
  'x_nanoshield-nv', 'x_aquagenica', 'x_packbot-ai', 'x_nevadamed',
  'x_desertdrive', 'x_clearvault', 'x_lunarbuild',
  'x_bionvate', 'x_sagebrush-research',
  'quantumedge-nv', 'artemisag', 'titanshield', 'heliopath',
  'nanoshield-nv', 'aquagenica', 'packbot-ai', 'nevadamed',
  'desertdrive', 'clearvault', 'lunarbuild',
  'bionvate-therapeutics', 'sagebrush-research-consortium'
);

-- Remove external nodes
DELETE FROM externals
WHERE id IN (
  'x_quantumedge-nv', 'x_artemisag', 'x_titanshield', 'x_heliopath',
  'x_nanoshield-nv', 'x_aquagenica', 'x_packbot-ai', 'x_nevadamed',
  'x_desertdrive', 'x_clearvault', 'x_lunarbuild',
  'x_bionvate', 'x_sagebrush-research',
  'quantumedge-nv', 'artemisag', 'titanshield', 'heliopath',
  'nanoshield-nv', 'aquagenica', 'packbot-ai', 'nevadamed',
  'desertdrive', 'clearvault', 'lunarbuild',
  'bionvate-therapeutics', 'sagebrush-research-consortium'
)
OR name IN (
  'QuantumEdge NV', 'ArtemisAg', 'TitanShield', 'HelioPath',
  'NanoShield NV', 'AquaGenica', 'PackBot AI', 'NevadaMed',
  'DesertDrive', 'ClearVault', 'LunarBuild',
  'BioNVate Therapeutics', 'Sagebrush Research Consortium'
);

-- ============================================================
-- B. Remove fabricated companies from migration 029
-- ============================================================

DELETE FROM timeline_events
WHERE company_name IN (
  'VegasLogic AI', 'VegasLogic', 'PayVault Financial', 'PayVault',
  'DesertWing Autonomous', 'GreatBasin Genomics', 'NeonMind AI',
  'ShieldWall Security', 'CasinoIQ Analytics', 'TableMetrics',
  'Batjac Ventures'
);

DELETE FROM stakeholder_activities
WHERE company_id IN (
  'vegaslogic-ai', 'vegaslogic', 'payvault-financial', 'payvault',
  'desertwing-autonomous', 'greatbasin-genomics', 'neonmind-ai',
  'shieldwall-security', 'casinoiq-analytics', 'tablemetrics',
  'batjac-ventures'
)
OR description ILIKE ANY(ARRAY[
  '%DesertWing Autonomous%', '%GreatBasin Genomics%', '%NeonMind AI%',
  '%ShieldWall Security%', '%CasinoIQ Analytics%', '%TableMetrics%',
  '%Batjac Ventures%'
]);

DELETE FROM graph_edges
WHERE source_id IN (
  'vegaslogic-ai', 'payvault-financial', 'x_vegaslogic', 'x_payvault',
  'desertwing-autonomous', 'greatbasin-genomics', 'neonmind-ai',
  'shieldwall-security', 'casinoiq-analytics', 'tablemetrics',
  'batjac-ventures', 'x_desertwing', 'x_greatbasin', 'x_neonmind',
  'x_shieldwall', 'x_casinoiq', 'x_tablemetrics', 'x_batjac'
)
OR target_id IN (
  'vegaslogic-ai', 'payvault-financial', 'x_vegaslogic', 'x_payvault',
  'desertwing-autonomous', 'greatbasin-genomics', 'neonmind-ai',
  'shieldwall-security', 'casinoiq-analytics', 'tablemetrics',
  'batjac-ventures', 'x_desertwing', 'x_greatbasin', 'x_neonmind',
  'x_shieldwall', 'x_casinoiq', 'x_tablemetrics', 'x_batjac'
);

DELETE FROM externals
WHERE id IN (
  'vegaslogic-ai', 'payvault-financial', 'x_vegaslogic', 'x_payvault',
  'desertwing-autonomous', 'greatbasin-genomics', 'neonmind-ai',
  'shieldwall-security', 'casinoiq-analytics', 'tablemetrics',
  'batjac-ventures', 'x_desertwing', 'x_greatbasin', 'x_neonmind',
  'x_shieldwall', 'x_casinoiq', 'x_tablemetrics', 'x_batjac'
)
OR name IN (
  'VegasLogic AI', 'PayVault Financial', 'DesertWing Autonomous',
  'GreatBasin Genomics', 'NeonMind AI', 'ShieldWall Security',
  'CasinoIQ Analytics', 'TableMetrics', 'Batjac Ventures'
);

-- ============================================================
-- C. Remove fabricated government legislation events
-- ============================================================

-- Remove fake bills from timeline_events
DELETE FROM timeline_events
WHERE detail ILIKE '%SB 47%AI Innovation Tax%'
   OR detail ILIKE '%SB 127%AI Innovation Act%'
   OR detail ILIKE '%HB 223%Advanced Manufacturing%'
   OR detail ILIKE '%SB 189%'
   OR detail ILIKE '%Innovation District Phase 3 bond%'
   OR detail ILIKE '%NSF Award #2602315%';

-- Remove fake bills from stakeholder_activities
DELETE FROM stakeholder_activities
WHERE description ILIKE '%SB 47%AI Innovation Tax%'
   OR description ILIKE '%SB 127%AI Innovation Act%'
   OR description ILIKE '%HB 223%Advanced Manufacturing%'
   OR description ILIKE '%SB 189%'
   OR description ILIKE '%Innovation District Phase 3 bond%'
   OR description ILIKE '%NSF Award #2602315%';

-- ============================================================
-- D. Clean fabricated dollar amounts from real LP entity notes
-- ============================================================

-- Nevada PERS — real entity, but "$50M venture allocation" and
-- specific LP commitment amounts to BBV are unverified
UPDATE externals
SET note = 'Nevada Public Employees Retirement System. State pension fund. '
        || 'Any venture allocation details are unverified and should not be treated '
        || 'as confirmed commitments.'
WHERE id = 'x_207'
  AND note ILIKE '%$15M LP commitment%';

-- Nevada State Treasurer — real entity, but Innovation Fund details unverified
UPDATE externals
SET note = 'Nevada State Treasurer''s Office. Manages state investment portfolio. '
        || 'Any specific fund commitment details are unverified.'
WHERE id = 'x_208'
  AND note ILIKE '%$5M co-investment%';

-- JPMorgan Alternative Assets — real entity, but BBV LP commitment unverified
UPDATE externals
SET note = 'JPMorgan Alternative Assets. Global alternative investment platform.'
WHERE id = 'x_210'
  AND note ILIKE '%$8M LP commitment%';

-- Las Vegas Convention Center — real entity, but smart venue pilot details unverified
UPDATE externals
SET note = 'Las Vegas Convention Center (LVCVA). Major convention venue in Las Vegas.'
WHERE id = 'x_224'
  AND note ILIKE '%smart venue pilot%';

-- Nevada Governor's Office — real entity, but SBIR letter claim unverified
UPDATE externals
SET note = 'Nevada Governor''s Office. State of Nevada executive branch.'
WHERE id = 'x_230'
  AND note ILIKE '%SBIR Letter of Support%';

-- ============================================================
-- E. Mark remaining unverifiable forward-looking events
-- ============================================================
-- Events from migrations 024-030 that reference real companies but with
-- fabricated details (amounts, dates, partnerships) are marked as unverified.
-- We don't delete them wholesale since some may be partially accurate,
-- but we flag them for human review.

UPDATE timeline_events
SET icon = '⚠️'
WHERE event_date >= '2026-02-01'
  AND event_date <= '2026-03-31'
  AND icon != '⚠️'
  AND (
    -- Events from fabricated-heavy migrations 024-030
    detail ILIKE '%$%M%'  -- Contains dollar amounts
    OR detail ILIKE '%partnership%'
    OR detail ILIKE '%MOU%'
    OR detail ILIKE '%pilot%'
  )
  -- Exclude known-verified events (from migration 050/093)
  AND company_name NOT IN (
    'TensorWave', 'Longshot Space', 'Adaract', 'Reality Defender',
    'WAVR Technologies', 'Nevada Nano', 'Kaptyn', 'Redwood Materials',
    'Hubble Network', 'Vena Vitals'
  );

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'fabricated_entities_remaining' AS check_name,
  COUNT(*) AS count
FROM externals
WHERE name IN (
  'QuantumEdge NV', 'ArtemisAg', 'TitanShield', 'HelioPath',
  'NanoShield NV', 'AquaGenica', 'PackBot AI', 'NevadaMed',
  'DesertDrive', 'ClearVault', 'LunarBuild',
  'BioNVate Therapeutics', 'Sagebrush Research Consortium',
  'VegasLogic AI', 'PayVault Financial',
  'DesertWing Autonomous', 'GreatBasin Genomics', 'NeonMind AI',
  'ShieldWall Security', 'CasinoIQ Analytics', 'TableMetrics',
  'Batjac Ventures'
);

SELECT 'fabricated_legislation_remaining' AS check_name,
  COUNT(*) AS count
FROM timeline_events
WHERE detail ILIKE '%SB 47%AI Innovation%'
   OR detail ILIKE '%SB 127%AI Innovation%'
   OR detail ILIKE '%HB 223%Advanced Manufacturing%';

SELECT 'flagged_unverified_events' AS check_name,
  COUNT(*) AS count
FROM timeline_events
WHERE icon = '⚠️';

COMMIT;
