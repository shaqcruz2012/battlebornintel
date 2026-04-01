-- 158_external_regions.sql
-- Audit and assign region_id to all external entities for the filter system.
-- Idempotent: all UPDATEs guard with WHERE region_id IS NULL.
-- Region FK points to regions(id): Nevada(state), Las Vegas(metro),
-- Reno-Sparks(metro), Henderson(city), Carson City(city).

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. LAS VEGAS metro — casinos, entertainment, UNLV, local corps
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE externals SET region_id = (SELECT id FROM regions WHERE name = 'Las Vegas' AND level = 'metro')
WHERE region_id IS NULL AND id IN (
  'x_221',                -- MGM Resorts
  'x_224',                -- Las Vegas Convention Center
  'x_233',                -- UNLV
  'x_205',                -- UNLV Foundation
  'x_unlv',               -- University of Nevada, Las Vegas
  'x_unlv_foundation',    -- UNLV Foundation
  'x_boyd',               -- Boyd Gaming
  'x_stationcasino',      -- Station Casinos
  'x_223',                -- Station Casinos LLC
  'x_201',                -- Station Casinos Ventures
  'x_caesars',            -- Caesars Entertainment
  'x_caesars_cie',        -- Caesars Interactive
  'x_wynn_resorts',       -- Wynn Resorts
  'x_200',                -- Wynn Family Office
  'x_wynn_fo',            -- Wynn Family Office
  'x_draftkings',         -- DraftKings (Vegas operations)
  'x_PENN_ENTERTAINMENT', -- Penn Entertainment
  'x_fanatics',           -- Fanatics (Vegas sports)
  'x_the_score',          -- The Score
  'x_skillz',             -- Skillz
  'x_igt',                -- IGT Gaming
  'x_sightline',          -- Sightline Payments
  'x_credit_one',         -- Credit One Bank (Las Vegas HQ)
  'x_zappos',             -- Zappos (Las Vegas HQ)
  'x_tony_hsieh',         -- Tony Hsieh
  'x_aoki',               -- Steve Aoki / Aoki Labs
  'x_adelson_fo',         -- Adelson Family Office
  'x_fertitta_cap',       -- Fertitta Capital
  'x_ruffin_fo',          -- Phil Ruffin
  'x_duffield_fo',        -- Duffield Family Office
  'x_desert_forge',       -- Desert Forge Ventures
  'x_desert_forge_124',   -- Desert Forge Ventures (dup)
  'x_battlebornventure',  -- Battle Born Venture
  'x_battlebornventure_107', -- Battle Born Venture (dup)
  'x_1864_fund',          -- 1864 Capital Fund
  'x_tots_ventures',      -- Tip of the Spear Ventures
  'x_grey_collar',        -- Grey Collar Ventures
  'x_incline_vc',         -- Incline Venture Capital
  'x_varkain',            -- Varkain
  'x_elevate_blue',       -- Elevate Blue
  'x_startupnv_113',      -- StartupNV
  'x_ain',                -- Angel Investors Network
  'x_bitangels',          -- BitAngels
  'x_angelnv',            -- AngelNV
  'x_angelnv_114',        -- AngelNV (dup)
  'x_angelnv_114_dup',    -- AngelNV (dup)
  'x_FUNDNV',             -- FundNV
  'x_apex_park',          -- APEX Industrial Park
  'x_tmobile_cx',         -- T-Mobile Business CX Center
  'x_drs-technologies',   -- DRS Technologies LV
  'x_umc_vegas',          -- University Medical Center (UMC)
  'x_dignity_health_nv',  -- Dignity Health Nevada
  'x_snwa',               -- Southern Nevada Water Authority
  'x_NVERGY',             -- NV Energy (Las Vegas HQ)
  'x_VICIP',              -- VICI Properties
  'x_vici',               -- VICI Properties (dup)
  'x_gkcc',               -- GKCC LLC
  'x_swsie',              -- SW Sustainability Innovation Engine
  'x_cox_comm',           -- Cox Communications (LV)
  'x_dasco',              -- DASCO Inc.
  'x_cumulus_weather',    -- Cumulus Weather Solutions LLC
  'x_dxdiscovery',       -- DxDiscovery
  'x_geocomply',         -- GeoComply
  'x_strykagen',         -- Strykagen
  'x_gbank_founders',    -- GBank Financial Founders Group
  'x_roseman',           -- Roseman University
  'x_google_nv'          -- Google Nevada
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. RENO-SPARKS metro — Tesla Giga, Switch, UNR, Reno ecosystem
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE externals SET region_id = (SELECT id FROM regions WHERE name = 'Reno-Sparks' AND level = 'metro')
WHERE region_id IS NULL AND id IN (
  'x_222',                -- Tesla Gigafactory Nevada
  'x_220',                -- Switch
  'x_switch-inc',         -- Switch Inc
  'x_unr',                -- UNR
  'x_232',                -- Desert Research Institute
  'x_dri',                -- Desert Research Institute (dup)
  'x_234',                -- Sierra Angels
  'x_235',                -- Reno Spark Ecosystem
  'x_tric',               -- Tahoe Reno Industrial Center (TRIC)
  'x_sierra-nevada-corp', -- Sierra Nevada Corporation
  'x_sierra-nevada-energy', -- Sierra Nevada Energy
  'x_waterstart',         -- WaterStart
  'x_abaco-systems-nv',  -- Abaco Systems Nevada
  'x_air_liquide_nv',    -- Air Liquide Nevada
  'x_homegrown_capital',  -- Homegrown Capital
  'x_204'                 -- Intermountain Ventures Group
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. HENDERSON — Henderson-based orgs
-- ═══════════════════════════════════════════════════════════════════════════════

-- (Henderson entities are few; most are captured under Las Vegas metro.
--  Add specific ones here if identified.)

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. STATEWIDE — Nevada state agencies and statewide orgs
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE externals SET region_id = (SELECT id FROM regions WHERE name = 'Nevada' AND level = 'state')
WHERE region_id IS NULL AND id IN (
  'x_231',                -- Nevada GOED
  'x_230',                -- Nevada Governor's Office
  'x_208',                -- Nevada State Treasurer
  'x_207',                -- Nevada PERS
  'x_ssbci',              -- NV SSBCI
  'x_abtc'                -- American Battery Technology Co. (NV statewide ops)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. OUT-OF-STATE — National/global firms left as NULL region_id
--    (No UPDATE needed; listing for audit completeness)
-- ═══════════════════════════════════════════════════════════════════════════════
-- The following externals are intentionally left with region_id = NULL
-- because they are national or out-of-state entities:
--   x_intel, x_GOOGLE, x_google, x_amazon, x_apple, x_NVIDIA,
--   x_209 (Goldman Sachs PE), x_210 (JPMorgan), x_a16z, x_andreessen,
--   x_ANDREESSEN, x_accel, x_sequoia_heritage, x_greylock, x_index,
--   x_tiger, x_blackrock, x_blackstone, x_warburg, x_Goldman, x_gs,
--   x_gs_pe, x_fidelity, x_trowe, x_500_startups, x_yc, x_techstars,
--   x_acrew, x_ballistic, x_bain_cv, x_battery, x_boldstart,
--   x_breakthrough, x_capricorn, x_cerberus_v, x_citi, x_cpp,
--   x_dayonev, x_dcvc_ext, x_dfj_growth, x_digitalbridge, x_draper,
--   x_dragoneer, x_eclipse_v, x_elevation, x_emergence, x_evolution,
--   x_forgepoint, x_galaxy, x_greycroft, x_growthcurve, x_lightspeed,
--   x_samsung, x_stellantis, x_ford, x_BMW, x_NISSAN, x_honeywell,
--   x_crowdstrike, x_databricks, x_snowflake_v, x_stripe_v, x_salesforce_v,
--   x_doe, x_army, x_usaf, x_fema, etc.

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. INDEX for region_id filter performance (if not already present)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_externals_region_id ON externals(region_id);

COMMIT;
