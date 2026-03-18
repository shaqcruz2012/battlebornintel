-- 106_normalize_node_names.sql
-- Merge exact-duplicate and near-duplicate external nodes.
-- Strategy: pick the canonical ID (shortest / cleanest slug, or the one with most edges),
-- repoint all graph_edges to it, then delete the duplicate rows.

BEGIN;

-- ============================================================
-- HELPER: repoint edges from @old to @new for a given pair
-- (source_id and target_id)
-- ============================================================

-- -------------------------------------------------------
-- 1. AngelNV  (keep x_angelnv)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_angelnv' WHERE source_id IN ('x_angelnv_114','x_angelnv_114_dup','i_angelnv');
UPDATE graph_edges SET target_id = 'x_angelnv' WHERE target_id IN ('x_angelnv_114','x_angelnv_114_dup','i_angelnv');
DELETE FROM externals WHERE id IN ('x_angelnv_114','x_angelnv_114_dup','i_angelnv');

-- -------------------------------------------------------
-- 2. FundNV  (keep x_fundnv)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_fundnv' WHERE source_id IN ('x_FUNDNV','x_fundnv_108');
UPDATE graph_edges SET target_id = 'x_fundnv' WHERE target_id IN ('x_FUNDNV','x_fundnv_108');
DELETE FROM externals WHERE id IN ('x_FUNDNV','x_fundnv_108');

-- -------------------------------------------------------
-- 3. UNLV Foundation  (keep x_unlv_foundation)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_unlv_foundation' WHERE source_id IN ('x_205','i_unlv_foundation');
UPDATE graph_edges SET target_id = 'x_unlv_foundation' WHERE target_id IN ('x_205','i_unlv_foundation');
DELETE FROM externals WHERE id IN ('x_205','i_unlv_foundation');

-- -------------------------------------------------------
-- 4. Desert Research Institute  (keep u_dri — university prefix is correct)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'u_dri' WHERE source_id IN ('x_232','x_dri');
UPDATE graph_edges SET target_id = 'u_dri' WHERE target_id IN ('x_232','x_dri');
DELETE FROM externals WHERE id IN ('x_232','x_dri');

-- -------------------------------------------------------
-- 5. Lerer Hippeau  (keep x_lerer)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_lerer' WHERE source_id IN ('x_lererhippeau','i_lerer');
UPDATE graph_edges SET target_id = 'x_lerer' WHERE target_id IN ('x_lererhippeau','i_lerer');
DELETE FROM externals WHERE id IN ('x_lererhippeau','i_lerer');

-- -------------------------------------------------------
-- 6. Founders Fund  (keep x_founders_fund)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_founders_fund' WHERE source_id IN ('i_founders','i_founders_fund');
UPDATE graph_edges SET target_id = 'x_founders_fund' WHERE target_id IN ('i_founders','i_founders_fund');
DELETE FROM externals WHERE id IN ('i_founders','i_founders_fund');

-- -------------------------------------------------------
-- 7. Canaan Partners  (keep x_canaan)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_canaan' WHERE source_id IN ('x_canaan_partners','i_canaan');
UPDATE graph_edges SET target_id = 'x_canaan' WHERE target_id IN ('x_canaan_partners','i_canaan');
DELETE FROM externals WHERE id IN ('x_canaan_partners','i_canaan');

-- -------------------------------------------------------
-- 8. CVS Health Ventures  (keep x_cvs_health)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_cvs_health' WHERE source_id IN ('x_cvs','x_cvs_health_ventures');
UPDATE graph_edges SET target_id = 'x_cvs_health' WHERE target_id IN ('x_cvs','x_cvs_health_ventures');
DELETE FROM externals WHERE id IN ('x_cvs','x_cvs_health_ventures');
UPDATE externals SET name = 'CVS Health Ventures' WHERE id = 'x_cvs_health';

-- -------------------------------------------------------
-- 9. Reno Seed Fund  (keep x_reno_seed)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_reno_seed' WHERE source_id IN ('x_renoseedfund','i_reno_seed_fund');
UPDATE graph_edges SET target_id = 'x_reno_seed' WHERE target_id IN ('x_renoseedfund','i_reno_seed_fund');
DELETE FROM externals WHERE id IN ('x_renoseedfund','i_reno_seed_fund');

-- -------------------------------------------------------
-- 10. Citi Ventures  (keep x_citi_v)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_citi_v' WHERE source_id = 'x_citi';
UPDATE graph_edges SET target_id = 'x_citi_v' WHERE target_id = 'x_citi';
DELETE FROM externals WHERE id = 'x_citi';

-- -------------------------------------------------------
-- 11. Ballistic Ventures  (keep x_ballistic)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_ballistic' WHERE source_id = 'x_ballistic_ventures';
UPDATE graph_edges SET target_id = 'x_ballistic' WHERE target_id = 'x_ballistic_ventures';
DELETE FROM externals WHERE id = 'x_ballistic_ventures';

-- -------------------------------------------------------
-- 12. VICI Properties  (keep x_vici)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_vici' WHERE source_id = 'x_VICIP';
UPDATE graph_edges SET target_id = 'x_vici' WHERE target_id = 'x_VICIP';
DELETE FROM externals WHERE id = 'x_VICIP';

-- -------------------------------------------------------
-- 13. NV Energy  (keep x_nvenergy — has 5 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_nvenergy' WHERE source_id = 'x_NVERGY';
UPDATE graph_edges SET target_id = 'x_nvenergy' WHERE target_id = 'x_NVERGY';
DELETE FROM externals WHERE id = 'x_NVERGY';

-- -------------------------------------------------------
-- 14. City of Las Vegas  (keep x_city_lv)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_city_lv' WHERE source_id = 'i_city_of_las_vegas';
UPDATE graph_edges SET target_id = 'x_city_lv' WHERE target_id = 'i_city_of_las_vegas';
DELETE FROM externals WHERE id = 'i_city_of_las_vegas';

-- -------------------------------------------------------
-- 15. APG Partners  (keep x_apg)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_apg' WHERE source_id = 'i_apg_partners';
UPDATE graph_edges SET target_id = 'x_apg' WHERE target_id = 'i_apg_partners';
DELETE FROM externals WHERE id = 'i_apg_partners';

-- -------------------------------------------------------
-- 16. Department of Defense  (keep gov_DOD — has 3 edges, correct prefix)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'gov_DOD' WHERE source_id = 'x_dod';
UPDATE graph_edges SET target_id = 'gov_DOD' WHERE target_id = 'x_dod';
DELETE FROM externals WHERE id = 'x_dod';

-- -------------------------------------------------------
-- 17. gener8tor Las Vegas  (keep x_gener8tor_lv)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_gener8tor_lv' WHERE source_id = 'x_gener8tor_lv_91';
UPDATE graph_edges SET target_id = 'x_gener8tor_lv' WHERE target_id = 'x_gener8tor_lv_91';
DELETE FROM externals WHERE id = 'x_gener8tor_lv_91';

-- -------------------------------------------------------
-- 18. University of Nevada, Las Vegas  (keep u_unlv — university prefix)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'u_unlv' WHERE source_id = 'x_unlv';
UPDATE graph_edges SET target_id = 'u_unlv' WHERE target_id = 'x_unlv';
DELETE FROM externals WHERE id = 'x_unlv';

-- -------------------------------------------------------
-- 19. Andreessen Horowitz  (keep x_andreessen — lowercase)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_andreessen' WHERE source_id = 'x_ANDREESSEN';
UPDATE graph_edges SET target_id = 'x_andreessen' WHERE target_id = 'x_ANDREESSEN';
DELETE FROM externals WHERE id = 'x_ANDREESSEN';

-- -------------------------------------------------------
-- 20. Battle Born Venture  (keep x_battlebornventure — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_battlebornventure' WHERE source_id = 'x_battlebornventure_107';
UPDATE graph_edges SET target_id = 'x_battlebornventure' WHERE target_id = 'x_battlebornventure_107';
DELETE FROM externals WHERE id = 'x_battlebornventure_107';

-- -------------------------------------------------------
-- 21. Shadow Ventures  (keep x_shadow)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_shadow' WHERE source_id = 'x_shadow_ventures';
UPDATE graph_edges SET target_id = 'x_shadow' WHERE target_id = 'x_shadow_ventures';
DELETE FROM externals WHERE id = 'x_shadow_ventures';

-- -------------------------------------------------------
-- 22. Republic  (keep x_republic — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_republic' WHERE source_id = 'i_republic';
UPDATE graph_edges SET target_id = 'x_republic' WHERE target_id = 'i_republic';
DELETE FROM externals WHERE id = 'i_republic';

-- -------------------------------------------------------
-- 23. Bessemer Venture Partners  (keep i_bessemer)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'i_bessemer' WHERE source_id = 'i_bvp';
UPDATE graph_edges SET target_id = 'i_bessemer' WHERE target_id = 'i_bvp';
DELETE FROM externals WHERE id = 'i_bvp';

-- -------------------------------------------------------
-- 24. Boldstart Ventures  (keep x_boldstart — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_boldstart' WHERE source_id = 'i_boldstart';
UPDATE graph_edges SET target_id = 'x_boldstart' WHERE target_id = 'i_boldstart';
DELETE FROM externals WHERE id = 'i_boldstart';

-- -------------------------------------------------------
-- 25. 6K Energy  (keep x_6kenergy)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_6kenergy' WHERE source_id = 'x_6K_ENERGY';
UPDATE graph_edges SET target_id = 'x_6kenergy' WHERE target_id = 'x_6K_ENERGY';
DELETE FROM externals WHERE id = 'x_6K_ENERGY';

-- -------------------------------------------------------
-- 26. Dragoneer Investment Group  (keep x_dragoneer)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_dragoneer' WHERE source_id = 'x_dragoneer_investment';
UPDATE graph_edges SET target_id = 'x_dragoneer' WHERE target_id = 'x_dragoneer_investment';
DELETE FROM externals WHERE id = 'x_dragoneer_investment';

-- -------------------------------------------------------
-- 27. Accel  (keep x_accel — has 4 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_accel' WHERE source_id = 'i_accel';
UPDATE graph_edges SET target_id = 'x_accel' WHERE target_id = 'i_accel';
DELETE FROM externals WHERE id = 'i_accel';

-- -------------------------------------------------------
-- 28. Commerce Ventures  (keep x_commerce_v)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_commerce_v' WHERE source_id = 'i_commerce_v';
UPDATE graph_edges SET target_id = 'x_commerce_v' WHERE target_id = 'i_commerce_v';
DELETE FROM externals WHERE id = 'i_commerce_v';

-- -------------------------------------------------------
-- 29. PharmStars  (keep x_pharmstars)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_pharmstars' WHERE source_id = 'i_pharmstars';
UPDATE graph_edges SET target_id = 'x_pharmstars' WHERE target_id = 'i_pharmstars';
DELETE FROM externals WHERE id = 'i_pharmstars';

-- -------------------------------------------------------
-- 30. Owl Ventures  (keep x_owl — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_owl' WHERE source_id = 'x_owl_ventures';
UPDATE graph_edges SET target_id = 'x_owl' WHERE target_id = 'x_owl_ventures';
DELETE FROM externals WHERE id = 'x_owl_ventures';

-- -------------------------------------------------------
-- 31. Third Prime  (keep x_thirdprime)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_thirdprime' WHERE source_id = 'x_third_prime';
UPDATE graph_edges SET target_id = 'x_thirdprime' WHERE target_id = 'x_third_prime';
DELETE FROM externals WHERE id = 'x_third_prime';

-- -------------------------------------------------------
-- 32. Two Bear Capital  (keep x_twobear)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_twobear' WHERE source_id = 'x_twobearcapital';
UPDATE graph_edges SET target_id = 'x_twobear' WHERE target_id = 'x_twobearcapital';
DELETE FROM externals WHERE id = 'x_twobearcapital';

-- -------------------------------------------------------
-- 33. Apollo Global Management  (keep x_apollo)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_apollo' WHERE source_id = 'x_apollo_global_management';
UPDATE graph_edges SET target_id = 'x_apollo' WHERE target_id = 'x_apollo_global_management';
DELETE FROM externals WHERE id = 'x_apollo_global_management';

-- -------------------------------------------------------
-- 34. TVC Capital  (keep x_tvc)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_tvc' WHERE source_id = 'x_tvc_capital';
UPDATE graph_edges SET target_id = 'x_tvc' WHERE target_id = 'x_tvc_capital';
DELETE FROM externals WHERE id = 'x_tvc_capital';

-- -------------------------------------------------------
-- 35. Warburg Pincus  (keep x_warburg)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_warburg' WHERE source_id = 'x_warburgpincus';
UPDATE graph_edges SET target_id = 'x_warburg' WHERE target_id = 'x_warburgpincus';
DELETE FROM externals WHERE id = 'x_warburgpincus';

-- -------------------------------------------------------
-- 36. SEGA SAMMY Holdings  (keep x_segasammy — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_segasammy' WHERE source_id = 'x_sega_sammy';
UPDATE graph_edges SET target_id = 'x_segasammy' WHERE target_id = 'x_sega_sammy';
DELETE FROM externals WHERE id = 'x_sega_sammy';

-- -------------------------------------------------------
-- 37. Emergence Capital  (keep x_emergence)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_emergence' WHERE source_id = 'i_emergence';
UPDATE graph_edges SET target_id = 'x_emergence' WHERE target_id = 'i_emergence';
DELETE FROM externals WHERE id = 'i_emergence';

-- -------------------------------------------------------
-- 38. MGM Resorts  (keep x_mgm — has 8 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_mgm' WHERE source_id = 'x_221';
UPDATE graph_edges SET target_id = 'x_mgm' WHERE target_id = 'x_221';
DELETE FROM externals WHERE id = 'x_221';

-- -------------------------------------------------------
-- 39. Insight Partners  (keep x_insight — has 3 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_insight' WHERE source_id = 'i_insight';
UPDATE graph_edges SET target_id = 'x_insight' WHERE target_id = 'i_insight';
DELETE FROM externals WHERE id = 'i_insight';

-- -------------------------------------------------------
-- 40. Lightspeed Venture Partners  (keep x_lightspeed — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_lightspeed' WHERE source_id = 'i_lsvp';
UPDATE graph_edges SET target_id = 'x_lightspeed' WHERE target_id = 'i_lsvp';
DELETE FROM externals WHERE id = 'i_lsvp';

-- -------------------------------------------------------
-- 41. Menlo Ventures  (keep x_menlo — has 2 edges)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_menlo' WHERE source_id = 'i_menlo';
UPDATE graph_edges SET target_id = 'x_menlo' WHERE target_id = 'i_menlo';
DELETE FROM externals WHERE id = 'i_menlo';

-- -------------------------------------------------------
-- 42. Grey Collar Ventures  (keep x_grey_collar)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_grey_collar' WHERE source_id = 'i_grey_collar_ventures';
UPDATE graph_edges SET target_id = 'x_grey_collar' WHERE target_id = 'i_grey_collar_ventures';
DELETE FROM externals WHERE id = 'i_grey_collar_ventures';

-- -------------------------------------------------------
-- 43. Desert Forge Ventures  (keep x_desert_forge)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_desert_forge' WHERE source_id = 'x_desert_forge_124';
UPDATE graph_edges SET target_id = 'x_desert_forge' WHERE target_id = 'x_desert_forge_124';
DELETE FROM externals WHERE id = 'x_desert_forge_124';

-- -------------------------------------------------------
-- 44. VegasTechFund  (keep x_vegastechfund)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_vegastechfund' WHERE source_id = 'x_vegastechfund_125';
UPDATE graph_edges SET target_id = 'x_vegastechfund' WHERE target_id = 'x_vegastechfund_125';
DELETE FROM externals WHERE id = 'x_vegastechfund_125';

-- -------------------------------------------------------
-- 45. Cerberus Ventures  (keep x_cerberus_v)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_cerberus_v' WHERE source_id = 'x_cerberus_ventures';
UPDATE graph_edges SET target_id = 'x_cerberus_v' WHERE target_id = 'x_cerberus_ventures';
DELETE FROM externals WHERE id = 'x_cerberus_ventures';

-- -------------------------------------------------------
-- 46. Ecosystem Integrity Fund  (keep x_eif)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_eif' WHERE source_id = 'x_ecosystem_integrity';
UPDATE graph_edges SET target_id = 'x_eif' WHERE target_id = 'x_ecosystem_integrity';
DELETE FROM externals WHERE id = 'x_ecosystem_integrity';

-- -------------------------------------------------------
-- 47. ATW Partners  (keep x_atw)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_atw' WHERE source_id = 'x_atw_partners';
UPDATE graph_edges SET target_id = 'x_atw' WHERE target_id = 'x_atw_partners';
DELETE FROM externals WHERE id = 'x_atw_partners';

-- -------------------------------------------------------
-- 48. Acuren  (keep x_acuren, normalize name)
-- -------------------------------------------------------
UPDATE graph_edges SET source_id = 'x_acuren' WHERE source_id = 'x_ACUREN';
UPDATE graph_edges SET target_id = 'x_acuren' WHERE target_id = 'x_ACUREN';
DELETE FROM externals WHERE id = 'x_ACUREN';
UPDATE externals SET name = 'Acuren Group' WHERE id = 'x_acuren';

-- ============================================================
-- CROSS-TABLE DUPLICATES: externals that also exist as companies
-- ============================================================

-- 49. Switch Inc (company 58) — no edges on external, just delete
DELETE FROM externals WHERE id = 'x_switch-inc';

-- 50. WaterStart (company 56) — no edges on external, just delete
DELETE FROM externals WHERE id = 'x_waterstart';

-- 51. VegasTechFund (keep x_vegastechfund)
UPDATE graph_edges SET source_id = 'x_vegastechfund' WHERE source_id = 'x_vegas_tech_fund';
UPDATE graph_edges SET target_id = 'x_vegastechfund' WHERE target_id = 'x_vegas_tech_fund';
DELETE FROM externals WHERE id = 'x_vegas_tech_fund';

-- ============================================================
-- DEDUPLICATE any edges that became duplicates after merging
-- (same source_id, target_id, rel)
-- ============================================================
DELETE FROM graph_edges a
USING graph_edges b
WHERE a.id > b.id
  AND a.source_id = b.source_id
  AND a.target_id = b.target_id
  AND a.rel = b.rel;

COMMIT;
