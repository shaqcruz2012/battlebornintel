-- Migration 068: Consolidate duplicate external nodes
--
-- There are 78 external entities with duplicate names. For each group we:
--   1. Reassign all graph_edges (source_id & target_id) from duplicates → canonical ID
--   2. Delete the duplicate externals rows (non-canonical)
--   3. Deduplicate any edges that became identical after merging
--
-- This migration is IDEMPOTENT: safe to run multiple times.

BEGIN;

-- ============================================================
-- STEP 1: Reassign edges from duplicate IDs to canonical IDs
-- ============================================================
-- We use a CTE-driven approach: define all mappings, then apply them.

-- Create a temp table of (duplicate_id → canonical_id) mappings
CREATE TEMP TABLE dup_map (dup_id VARCHAR(40) PRIMARY KEY, canonical_id VARCHAR(40) NOT NULL)
ON COMMIT DROP;

INSERT INTO dup_map (dup_id, canonical_id) VALUES
  -- 1. DRI: keep u_dri
  ('dri',          'u_dri'),
  ('x_232',        'u_dri'),
  ('x_dri',        'u_dri'),
  -- 2. Canaan Partners: keep i_canaan
  ('x_canaan',         'i_canaan'),
  ('x_canaan_partners','i_canaan'),
  -- 3. Reno Seed Fund: keep i_reno_seed_fund
  ('x_reno_seed',   'i_reno_seed_fund'),
  ('x_renoseedfund','i_reno_seed_fund'),
  -- 4. UNLV Foundation: keep i_unlv_foundation
  ('x_205',             'i_unlv_foundation'),
  ('x_unlv_foundation', 'i_unlv_foundation'),
  -- 5. UNR: keep u_unr
  ('unr',       'u_unr'),
  ('u_unr_main','u_unr'),
  -- 6. Founders Fund: keep i_founders_fund
  ('i_founders',      'i_founders_fund'),
  ('x_founders_fund', 'i_founders_fund'),
  -- 7. Lerer Hippeau: keep i_lerer
  ('x_lererhippeau','i_lerer'),
  ('x_lerer',       'i_lerer'),
  -- 8. MGM Resorts: keep x_mgm
  ('x_221', 'x_mgm'),
  -- 9. 6K Energy: keep x_6kenergy
  ('x_6K_ENERGY', 'x_6kenergy'),
  -- 10. Citi Ventures: keep x_citi_v
  ('x_citi', 'x_citi_v'),
  -- 11. AquaGenica: keep x_aquagenica
  ('aquagenica', 'x_aquagenica'),
  -- 12. Ballistic Ventures: keep x_ballistic
  ('x_ballistic_ventures', 'x_ballistic'),
  -- 13. VICI Properties: keep x_vici
  ('x_VICIP', 'x_vici'),
  -- 14. NV Energy: keep x_nvenergy
  ('x_NVERGY', 'x_nvenergy'),
  -- 15. City of Las Vegas: keep i_city_of_las_vegas
  ('x_city_lv', 'i_city_of_las_vegas'),
  -- 16. APG Partners: keep i_apg_partners
  ('x_apg', 'i_apg_partners'),
  -- 17. GOED variant: keep goed-nv
  ('x_goed-nv', 'goed-nv'),
  -- 18. DoD: keep gov_DOD
  ('x_dod', 'gov_DOD'),
  -- 19. PackBot AI: keep x_packbot-ai
  ('packbot-ai', 'x_packbot-ai'),
  -- 20. UNLV: keep u_unlv
  ('x_233', 'u_unlv'),
  -- 21. Insight Partners: keep i_insight
  ('x_insight', 'i_insight'),
  -- 22. BioNVate: keep x_bionvate
  ('bionvate', 'x_bionvate'),
  -- 23. Emergence Capital: keep i_emergence
  ('x_emergence', 'i_emergence'),
  -- 24. Third Prime: keep x_thirdprime
  ('x_third_prime', 'x_thirdprime'),
  -- 25. Two Bear Capital: keep x_twobear
  ('x_twobearcapital', 'x_twobear'),
  -- 26. Apollo Global: keep x_apollo
  ('x_apollo_global_management', 'x_apollo'),
  -- 27. TVC Capital: keep x_tvc
  ('x_tvc_capital', 'x_tvc'),
  -- 28. NSF Climate Tech: keep x_nsf-climate-tech
  ('nsf-climate-tech', 'x_nsf-climate-tech'),
  -- 29. University of Nevada, Las Vegas (separate from UNLV above): keep u_unlv
  --     'unlv' has name "University of Nevada, Las Vegas", 'x_unlv' also
  --     We map both to u_unlv since it's the canonical UNLV node
  ('unlv',   'u_unlv'),
  ('x_unlv', 'u_unlv'),

  -- ============================================================
  -- Additional duplicates from the full query (not in the 29 named groups above)
  -- Pattern: {base_name, x_base_name} — keep x_ version
  -- ============================================================
  -- ATW Partners: {x_atw, x_atw_partners} — keep x_atw
  ('x_atw_partners', 'x_atw'),
  -- Abaco Systems Nevada: {abaco-systems-nv, x_abaco-systems-nv} — keep x_abaco-systems-nv
  ('abaco-systems-nv', 'x_abaco-systems-nv'),
  -- Accel: {i_accel, x_accel} — keep i_accel (investor prefix)
  ('x_accel', 'i_accel'),
  -- Andreessen Horowitz: {x_ANDREESSEN, x_andreessen} — keep x_andreessen
  ('x_ANDREESSEN', 'x_andreessen'),
  -- AngelNV: {i_angelnv, x_angelnv, x_angelnv_114} — keep i_angelnv
  ('x_angelnv',     'i_angelnv'),
  ('x_angelnv_114', 'i_angelnv'),
  -- ArtemisAg: {artemis-ag, x_artemis-ag} — keep x_artemis-ag
  ('artemis-ag', 'x_artemis-ag'),
  -- Battle Born Venture: {x_battlebornventure, x_battlebornventure_107} — keep x_battlebornventure
  ('x_battlebornventure_107', 'x_battlebornventure'),
  -- Bessemer Venture Partners: {i_bessemer, i_bvp} — keep i_bessemer (cleaner name)
  ('i_bvp', 'i_bessemer'),
  -- Boldstart Ventures: {i_boldstart, x_boldstart} — keep i_boldstart
  ('x_boldstart', 'i_boldstart'),
  -- CVS Health Ventures: {x_cvs, x_cvs_health_ventures} — keep x_cvs
  ('x_cvs_health_ventures', 'x_cvs'),
  -- Cerberus Ventures: {x_cerberus_v, x_cerberus_ventures} — keep x_cerberus_v
  ('x_cerberus_ventures', 'x_cerberus_v'),
  -- City of Las Vegas Economic Development: {lv-econ-dev, x_lv-econ-dev} — keep x_lv-econ-dev
  ('lv-econ-dev', 'x_lv-econ-dev'),
  -- City of Reno Innovation Office: {reno-innovation, x_reno-innovation} — keep x_reno-innovation
  ('reno-innovation', 'x_reno-innovation'),
  -- ClearVault: {clearvault, x_clearvault} — keep x_clearvault
  ('clearvault', 'x_clearvault'),
  -- Commerce Ventures: {i_commerce_v, x_commerce_v} — keep i_commerce_v
  ('x_commerce_v', 'i_commerce_v'),
  -- DRS Technologies LV: {drs-technologies, x_drs-technologies} — keep x_drs-technologies
  ('drs-technologies', 'x_drs-technologies'),
  -- Desert Forge Ventures: {x_desert_forge, x_desert_forge_124} — keep x_desert_forge
  ('x_desert_forge_124', 'x_desert_forge'),
  -- DesertDrive: {desertdrive, x_desertdrive} — keep x_desertdrive
  ('desertdrive', 'x_desertdrive'),
  -- Dragoneer Investment Group: {x_dragoneer, x_dragoneer_investment} — keep x_dragoneer
  ('x_dragoneer_investment', 'x_dragoneer'),
  -- Ecosystem Integrity Fund: {x_ecosystem_integrity, x_eif} — keep x_ecosystem_integrity
  ('x_eif', 'x_ecosystem_integrity'),
  -- FundNV: {x_FUNDNV, x_fundnv, x_fundnv_108} — keep x_fundnv
  ('x_FUNDNV',     'x_fundnv'),
  ('x_fundnv_108', 'x_fundnv'),
  -- Grey Collar Ventures: {i_grey_collar_ventures, x_grey_collar} — keep i_grey_collar_ventures
  ('x_grey_collar', 'i_grey_collar_ventures'),
  -- HelioPath: {heliopath, x_heliopath} — keep x_heliopath
  ('heliopath', 'x_heliopath'),
  -- IBM Research: {ibm-research, x_ibm-research} — keep x_ibm-research
  ('ibm-research', 'x_ibm-research'),
  -- Lightspeed Venture Partners: {i_lsvp, x_lightspeed} — keep i_lsvp
  ('x_lightspeed', 'i_lsvp'),
  -- Lockheed Martin: {lockheed-martin, x_lockheed-martin} — keep x_lockheed-martin
  ('lockheed-martin', 'x_lockheed-martin'),
  -- LunarBuild: {lunarbuild, x_lunarbuild} — keep x_lunarbuild
  ('lunarbuild', 'x_lunarbuild'),
  -- Menlo Ventures: {i_menlo, x_menlo} — keep i_menlo
  ('x_menlo', 'i_menlo'),
  -- NSF I-Corps Nevada: {nsf-icorps-nv, x_nsf-icorps-nv} — keep x_nsf-icorps-nv
  ('nsf-icorps-nv', 'x_nsf-icorps-nv'),
  -- NanoShield NV: {nanoshield-nv, x_nanoshield-nv} — keep x_nanoshield-nv
  ('nanoshield-nv', 'x_nanoshield-nv'),
  -- Nevada Legislature: {nv-legislature, x_nv-legislature} — keep x_nv-legislature
  ('nv-legislature', 'x_nv-legislature'),
  -- Nevada SBIR/STTR Program Office: {nv-sbir-office, x_nv-sbir-office} — keep x_nv-sbir-office
  ('nv-sbir-office', 'x_nv-sbir-office'),
  -- Nevada State University: {nevada-state, x_nevada-state} — keep x_nevada-state
  ('nevada-state', 'x_nevada-state'),
  -- NevadaMed: {nevadamed, x_nevadamed} — keep x_nevadamed
  ('nevadamed', 'x_nevadamed'),
  -- Owl Ventures: {x_owl, x_owl_ventures} — keep x_owl
  ('x_owl_ventures', 'x_owl'),
  -- Panasonic Energy: {panasonic-energy, x_panasonic-energy} — keep x_panasonic-energy
  ('panasonic-energy', 'x_panasonic-energy'),
  -- PharmStars: {i_pharmstars, x_pharmstars} — keep i_pharmstars
  ('x_pharmstars', 'i_pharmstars'),
  -- QuantumEdge NV: {quantumedge-nv, x_quantumedge-nv} — keep x_quantumedge-nv
  ('quantumedge-nv', 'x_quantumedge-nv'),
  -- Raytheon Technologies: {raytheon-technologies, x_raytheon-technologies} — keep x_raytheon-technologies
  ('raytheon-technologies', 'x_raytheon-technologies'),
  -- Republic: {i_republic, x_republic} — keep i_republic
  ('x_republic', 'i_republic'),
  -- Shadow Ventures: {x_shadow, x_shadow_ventures} — keep x_shadow
  ('x_shadow_ventures', 'x_shadow'),
  -- Sierra Nevada Energy: {sierra-nevada-energy, x_sierra-nevada-energy} — keep x_sierra-nevada-energy
  ('sierra-nevada-energy', 'x_sierra-nevada-energy'),
  -- TitanShield: {titanshield, x_titanshield} — keep x_titanshield
  ('titanshield', 'x_titanshield'),
  -- UNLV Rebel Fund: {u_unlv_rebel, x_rebel_venture} — keep u_unlv_rebel
  ('x_rebel_venture', 'u_unlv_rebel'),
  -- VegasTechFund: {x_vegastechfund, x_vegastechfund_125} — keep x_vegastechfund
  ('x_vegastechfund_125', 'x_vegastechfund'),
  -- Volvo Cars: {x_VOLVO, x_volvo} — keep x_volvo
  ('x_VOLVO', 'x_volvo'),
  -- Warburg Pincus: {x_warburg, x_warburgpincus} — keep x_warburg
  ('x_warburgpincus', 'x_warburg'),
  -- WaterStart: {waterstart, x_waterstart} — keep x_waterstart
  ('waterstart', 'x_waterstart'),
  -- gener8tor: {x_gener8tor, x_gener8tor_109, x_gener8tor_accel} — keep x_gener8tor
  ('x_gener8tor_109',   'x_gener8tor'),
  ('x_gener8tor_accel', 'x_gener8tor')
ON CONFLICT (dup_id) DO NOTHING;  -- idempotent

-- ============================================================
-- STEP 2: Reassign graph_edges source_id
-- ============================================================
UPDATE graph_edges ge
SET source_id = dm.canonical_id
FROM dup_map dm
WHERE ge.source_id = dm.dup_id;

-- ============================================================
-- STEP 3: Reassign graph_edges target_id
-- ============================================================
UPDATE graph_edges ge
SET target_id = dm.canonical_id
FROM dup_map dm
WHERE ge.target_id = dm.dup_id;

-- ============================================================
-- STEP 4: Deduplicate edges that became identical after merging
-- ============================================================
-- Keep the edge with the lowest id (oldest), delete later duplicates.
-- Two edges are "identical" if they share (source_id, target_id, rel).
DELETE FROM graph_edges
WHERE id IN (
  SELECT ge.id
  FROM graph_edges ge
  INNER JOIN (
    SELECT source_id, target_id, rel, MIN(id) AS keep_id
    FROM graph_edges
    GROUP BY source_id, target_id, rel
    HAVING COUNT(*) > 1
  ) dups
    ON ge.source_id = dups.source_id
   AND ge.target_id = dups.target_id
   AND ge.rel       = dups.rel
   AND ge.id        > dups.keep_id
);

-- ============================================================
-- STEP 5: Clear any legacy_external_id FK references pointing to duplicates
-- ============================================================
-- (Currently none exist, but guard against future additions)
UPDATE corporations SET legacy_external_id = dm.canonical_id
FROM dup_map dm
WHERE corporations.legacy_external_id = dm.dup_id;

UPDATE universities SET legacy_external_id = dm.canonical_id
FROM dup_map dm
WHERE universities.legacy_external_id = dm.dup_id;

UPDATE gov_agencies SET legacy_external_id = dm.canonical_id
FROM dup_map dm
WHERE gov_agencies.legacy_external_id = dm.dup_id;

-- ============================================================
-- STEP 6: Delete duplicate externals
-- ============================================================
-- Only delete rows that exist in the externals table AND are in our dup_map.
DELETE FROM externals
WHERE id IN (SELECT dup_id FROM dup_map);

COMMIT;
