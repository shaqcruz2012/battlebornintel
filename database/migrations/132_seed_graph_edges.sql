-- Migration 132: Seed ALL graph edges from frontend/src/data/edges.js
-- Generated from VERIFIED_EDGES array (735 edges)
-- Idempotent: uses ON CONFLICT ... DO UPDATE

BEGIN;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stellantis', 'c_29', 'invested_in', '$425M+ strategic round', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fedex', 'c_29', 'invested_in', '$425M+ strategic round', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_honeywell', 'c_29', 'invested_in', '$425M+ strategic round', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_okapi', 'c_14', 'invested_in', 'Seed co-lead', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_shadow', 'c_14', 'invested_in', 'Seed co-lead', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stripes', 'c_10', 'invested_in', 'Series A lead', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_digitalbridge', 'c_58', 'acquired', 'DigitalBridge took Switch private 2022. $11B deal.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ssbci', 'f_bbv', 'funds', 'SSBCI capital allocation', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ssbci', 'f_fundnv', 'funds', '1:1 investment match', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ssbci', 'f_1864', 'funds', 'SSBCI capital allocation', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_gener8tor_lv', 'funds', 'Battle Born Growth accelerator funding', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_gener8tor_reno', 'funds', 'Battle Born Growth accelerator funding', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_startupnv', 'funds', 'SSBCI co-investment via FundNV', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_6', 'x_life360', 'partners_with', '90M+ device BLE-to-satellite', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_6', 'x_muonspace', 'partners_with', 'MuSat XL satellite buses', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_27', 'x_mgm', 'partners_with', 'Rewards program', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_27', 'x_marriott', 'partners_with', 'Rewards program', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_56', 'x_snwa', 'partners_with', 'Water tech deployment', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_29', 'x_unr', 'partners_with', 'Workforce development', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_63', 'a_startupnv', 'accelerated_by', 'AccelerateNV + FundNV2 $200K', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_41', 'a_startupnv', 'accelerated_by', 'Portfolio company, Shark Tank 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_47', 'a_startupnv', 'accelerated_by', 'Pitch Day company', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_36', 'a_startupnv', 'accelerated_by', 'Pitch Day company', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_36', 'a_angelnv', 'won_pitch', '2024 winner $200K+', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_63', 'a_angelnv', 'won_pitch', '2025 winner', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_32', 'a_adamshub', 'accelerated_by', 'Adams Hub graduate', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_57', 'a_adamshub', 'accelerated_by', 'Adams Hub company', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_59', 'a_adamshub', 'accelerated_by', 'Adams Hub company', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'f_fundnv', 'program_of', 'FundNV is StartUpNV''s pre-seed fund', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'f_1864', 'program_of', '1864 Fund is StartUpNV''s seed fund', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_angelnv', 'a_startupnv', 'program_of', 'AngelNV is a StartUpNV program', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_gener8tor_lv', 'a_gener8tor_reno', 'collaborated_with', 'Both SSBCI-funded', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_gbeta_nv', 'a_gener8tor_lv', 'program_of', 'gBETA Electrify Nevada is gener8tor''s free 7-week pre-accelerator.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_gbeta_nv', 'funds', 'gBETA funded via GOED SSBCI pipeline.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_blackfire', 'a_gener8tor_lv', 'collaborated_with', 'Both GOED-supported LV innovation hubs.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_innevator', 'e_innevation', 'housed_at', 'Hosted at UNR Innevation Center', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_8', 'a_innevator', 'collaborated_with', 'Blockchains LLC lead collaborator 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_blackfire', 'e_unlvtech', 'housed_at', 'Flagship tenant, Harry Reid Tech Park', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_caesars', 'a_blackfire', 'collaborated_with', 'Co-founded Black Fire with UNLV 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_panasonic', 'a_blackfire', 'partners_with', 'Technology deployment partner', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_zerolabs', 'a_blackfire', 'collaborated_with', 'Zero Labs HQ''d at Black Fire Innovation.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_zerolabs', 'funds', 'GOED Knowledge Fund supports Zero Labs via UNLV ARC.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'a_blackfire', 'funds', 'GOED Knowledge Fund supports Black Fire via UNLV ARC program.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_boyd', 'a_blackfire', 'partners_with', 'Boyd Gaming Innovation Lab at Black Fire (Sep 2023).', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_intel', 'a_blackfire', 'partners_with', 'Intel key computing partner.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_caesars', 'a_zerolabs', 'partners_with', 'Caesars is Zero Labs advisor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm', 'a_zerolabs', 'partners_with', 'MGM Resorts advisor to Zero Labs.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_shift', 'a_zerolabs', 'partners_with', 'Shift Studio $300K strategic partnership.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_lvgea', 'a_zerolabs', 'supports', 'LVGEA supports Zero Labs.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_lvgea', 'a_blackfire', 'supports', 'LVGEA supports Black Fire Innovation.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_zerolabs', 'a_gener8tor_lv', 'collaborated_with', 'Both LV-based GOED-supported accelerators.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_usaf', 'a_afwerx', 'program_of', 'Air Force innovation program', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_72', 'a_afwerx', 'accelerated_by', 'Defense drone / NTTR connection', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'x_ssbci', 'manages', 'GOED administers NV SSBCI program', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_edawn', 'a_gener8tor_reno', 'supports', 'Co-host, entrepreneurial development', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_edawn', 'e_innevation', 'supports', 'Ecosystem partner', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_lvgea', 'a_startupnv', 'supports', 'Dealroom ecosystem partner', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_lvgea', 'a_gener8tor_lv', 'supports', 'Las Vegas ecosystem support', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_innevation', 'a_gener8tor_reno', 'housed_at', 'gener8tor Reno operates from Innevation Center', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_saling', 'f_fundnv', 'manages', 'Co-founder, Ruby Partners GP', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('p_saling', 'a_startupnv', 'manages', 'Executive Director', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_10', 'x_fda', 'approved_by', 'FDA-approved EMS device', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_34', 'x_fda', 'filed_with', 'Drug master file', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_dtp', 'e_lvgea', 'collaborated_with', 'Downtown LV economic development', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_accel', 'c_2', 'invested_in', 'Led Series D ($100M) + co-led Series E ($450M)', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_trowe', 'c_2', 'invested_in', 'Co-led Series E at $4.5B valuation', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tiger', 'c_2', 'invested_in', 'Series E new investor', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_wellington', 'c_3', 'invested_in', 'Led Series D $250M at $5.1B valuation', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_greylock', 'c_3', 'invested_in', 'Investor since inception through Series D', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_insight', 'c_3', 'invested_in', 'Series C/D participant', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_crowdstrike', 'c_3', 'invested_in', 'CrowdStrike Falcon Fund, Series D', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_amd', 'c_4', 'invested_in', 'Co-led Series A $100M. Strategic GPU partner.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_magnetar', 'c_4', 'invested_in', 'Co-led Series A $100M', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nexusvp', 'c_4', 'invested_in', 'Led $43M SAFE round (Oct 2024)', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_4', 'a_startupnv', 'accelerated_by', 'StartUpNV investor in SAFE round', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_4', 'invested_in', 'BBV co-investor in TensorWave', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_1', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_2', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_3', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_5', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_6', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_7', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_9', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_10', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_11', 'invested_in', 'BBV portfolio — CIQ', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_13', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_16', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_17', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_18', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_21', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_25', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_26', 'invested_in', 'BBV portfolio — Dot Ai', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_29', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_34', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_36', 'invested_in', 'BBV portfolio — Tilt AI', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_38', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_41', 'invested_in', 'BBV portfolio — HiBear', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_45', 'invested_in', 'BBV portfolio — Lucihub', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_48', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_49', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_50', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_52', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_53', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_55', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_56', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_60', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_63', 'invested_in', 'BBV portfolio — BuildQ', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_64', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_69', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_72', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_73', 'invested_in', 'BBV portfolio company', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_76', 'invested_in', 'BBV portfolio — Access Health Dental', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_77', 'invested_in', 'BBV portfolio — Adaract', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_78', 'invested_in', 'BBV portfolio — AI Foundation', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_79', 'invested_in', 'BBV portfolio — AIR Corp', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_80', 'invested_in', 'BBV portfolio — Battle Born Beer', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_81', 'invested_in', 'BBV portfolio — Beloit Kombucha', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_82', 'invested_in', 'BBV portfolio — BrakeSens', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_83', 'invested_in', 'BBV portfolio — CareWear', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_84', 'invested_in', 'BBV portfolio — CircleIn', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_85', 'invested_in', 'BBV portfolio — ClickBio', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_86', 'invested_in', 'BBV portfolio — ClothesLyne', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_87', 'invested_in', 'BBV portfolio — Coco Coders', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_88', 'invested_in', 'BBV portfolio — crEATe Good Foods', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_89', 'invested_in', 'BBV portfolio — Cuts Clothing', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_90', 'invested_in', 'BBV portfolio — DayaMed', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_91', 'invested_in', 'BBV portfolio — Dog & Whistle', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_92', 'invested_in', 'BBV portfolio — Drain Drawer', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_93', 'invested_in', 'BBV portfolio — Ecoatoms', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_94', 'invested_in', 'BBV portfolio — Elly Health', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_95', 'invested_in', 'BBV portfolio — Fandeavor (acquired by TicketCity 2019)', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_96', 'invested_in', 'BBV portfolio — FanUp', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_97', 'invested_in', 'BBV portfolio — Grantcycle', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_98', 'invested_in', 'BBV portfolio — GRRRL', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_99', 'invested_in', 'BBV portfolio — Heligenics', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_100', 'invested_in', 'BBV portfolio — KnowRisk', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_101', 'invested_in', 'BBV portfolio — Let''s Rolo (acquired by LifeKey 2024)', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_102', 'invested_in', 'BBV portfolio — Longshot Space', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_103', 'invested_in', 'BBV portfolio — Melzi Surgical', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_104', 'invested_in', 'BBV portfolio — Nailstry', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_105', 'invested_in', 'BBV portfolio — NeuroReserve', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_106', 'invested_in', 'BBV portfolio — Nivati', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_107', 'invested_in', 'BBV portfolio — Onboarded', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_108', 'invested_in', 'BBV portfolio — Otsy', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_109', 'invested_in', 'BBV portfolio — Phone2', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_110', 'invested_in', 'BBV portfolio — Prosper Technologies', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_111', 'invested_in', 'BBV portfolio — Quantum Copper', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_112', 'invested_in', 'BBV portfolio — Sarcomatrix', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_113', 'invested_in', 'BBV portfolio — Semi Exact', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_114', 'invested_in', 'BBV portfolio — SurgiStream', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_115', 'invested_in', 'BBV portfolio — Taber Innovations', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_116', 'invested_in', 'BBV portfolio — Talage Insurance (acquired by Mission Underwriters 2025)', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_117', 'invested_in', 'BBV portfolio — Terbine', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_118', 'invested_in', 'BBV portfolio — TransWorldHealth', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_119', 'invested_in', 'BBV portfolio — Ultion', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_120', 'invested_in', 'BBV portfolio — Vena Solutions', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_121', 'invested_in', 'BBV portfolio — Vena Vitals', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_122', 'invested_in', 'BBV portfolio — VisionAid', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_123', 'invested_in', 'BBV portfolio — Vistro', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_124', 'invested_in', 'BBV portfolio — WAVR Technologies', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_125', 'invested_in', 'BBV portfolio — Wedgies (company closed)', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_126', 'invested_in', 'BBV portfolio — WiseBanyan (acquired by Axos Financial 2018)', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_127', 'invested_in', 'BBV portfolio — ZenCentiv', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blackrock', 'c_9', 'invested_in', 'Co-led Series D $119M', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fidelity', 'c_9', 'invested_in', 'Co-led Series D $119M', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_greycroft', 'c_9', 'invested_in', 'Early investor, pre-Series D', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_draper', 'c_7', 'invested_in', 'Draper Associates investor', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_73', 'c_50', 'partners_with', 'LOI for lithium hydroxide supply', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_bain_cv', 'c_2', 'invested_in', 'Series E investor ($450M round Nov 2021)', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_commerce_v', 'c_2', 'invested_in', 'Series B+ investor, fintech-focused', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_sorenson', 'c_2', 'invested_in', 'Existing investor Series C+', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_twosigma', 'c_2', 'invested_in', 'Series A investor (2014)', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_citi_v', 'c_2', 'invested_in', 'Strategic investor', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cap1_v', 'c_2', 'invested_in', 'Strategic investor', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_menlo', 'c_3', 'invested_in', 'Series B/C/D participant', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_evolution', 'c_13', 'invested_in', 'Led Series A+B ($95M total)', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_salesforce_v', 'c_13', 'invested_in', 'Series A + B participant', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_pelion', 'c_13', 'invested_in', 'Seed + Series A + B', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_boldstart', 'c_13', 'invested_in', 'Seed through Series B', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_samsung', 'c_13', 'invested_in', 'Series B investor (strategic)', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_paloalto', 'c_13', 'acquired', 'Acquired Protect AI Apr 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_prosperity7', 'c_4', 'invested_in', 'Series A (Aramco Ventures)', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_maverick', 'c_4', 'invested_in', 'SAFE + Series A', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_translink', 'c_4', 'invested_in', 'SAFE round (Japan-linked)', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mercato', 'c_9', 'invested_in', 'Early investor', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_qualcomm_v', 'c_9', 'invested_in', 'Early strategic investor', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_rincon', 'c_9', 'invested_in', 'Early investor', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_baroda', 'c_9', 'invested_in', 'Early investor', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_buildtech', 'c_7', 'invested_in', 'Construction tech VC', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_elevation', 'c_7', 'invested_in', 'Canada-based VC', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_accel', 'c_53', 'invested_in', 'Led Duetto Series B $21M', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_warburg', 'c_53', 'invested_in', 'Led Duetto Series D $80M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_battery', 'c_53', 'invested_in', 'Led Duetto Series A $10M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_growthcurve', 'c_53', 'acquired', 'Acquired Duetto Jun 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blackstone', 'c_22', 'invested_in', 'Led Series D $350M at $3.3B valuation', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cvs', 'c_22', 'invested_in', 'Led Series D2 $100M, strategic healthcare', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dragoneer', 'c_22', 'invested_in', 'Led Series C $100M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blackrock', 'c_22', 'invested_in', 'Series D. Multi-position: also MNTN', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_twosigma', 'c_22', 'invested_in', 'Series A. Multi-position: also Socure', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_lightspeed', 'c_5', 'invested_in', 'Led Series B $100M at $1.5B valuation', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_insight', 'c_5', 'invested_in', 'Series B co-investor', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_galaxy', 'c_5', 'invested_in', 'Led seed $6.5M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_apollo', 'c_28', 'acquired', 'Apollo acquired Everi + IGT Gaming Jul 2025 for $6.3B combined.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_segasammy', 'c_54', 'acquired', 'SEGA SAMMY acquired GAN May 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_orix', 'c_74', 'invested_in', 'Ormat Industries owns 44.76% of Ormat Technologies.', 2005, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_acuren', 'c_75', 'acquired', 'Acuren acquired NV5 Global Aug 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_canaan', 'c_20', 'invested_in', 'Led Ollie Series A $12.6M Aug 2017.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_lererhippeau', 'c_20', 'invested_in', 'Ollie seed co-lead + Series A participant.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_agrolimen', 'c_20', 'acquired', 'Spanish conglomerate acquired Ollie 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_twobear', 'c_11', 'invested_in', 'Led CIQ Series A $26M May 2022.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_iag', 'c_11', 'invested_in', 'CIQ bridge round 2021.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_google', 'c_11', 'partners_with', 'Rocky Linux tier 1 Google Cloud offering.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tuatara', 'c_12', 'invested_in', 'SPAC sponsor (TCAC->SBIG Jun 2022).', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tvc', 'c_12', 'invested_in', 'Springbig PIPE investor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cerberus_v', 'c_21', 'invested_in', 'Led Nudge Security Series A $22.5M Nov 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ballistic', 'c_21', 'invested_in', 'Nudge Security seed $7M Apr 2022.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_forgepoint', 'c_21', 'invested_in', 'Nudge Security seed + Series A.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_squadra', 'c_21', 'invested_in', 'Nudge Security seed extension + Series A.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_efung', 'c_60', 'invested_in', 'Elicio Therapeutics Series B $33M Oct 2019.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_clal_bio', 'c_60', 'invested_in', 'Elicio Series B.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_39', 'c_67', 'competes_with', 'Both LV-based cannabis/gaming-adjacent companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm', 'c_67', 'partners_with', 'Planet 13 SuperStore adjacent to Strip casino corridor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_caesars', 'c_39', 'partners_with', 'Wynn Interactive in NV online sports betting market.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goldman', 'c_1', 'invested_in', 'Co-led Redwood Series D $1B+ Aug 2023.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_capricorn', 'c_1', 'invested_in', 'Co-led Redwood Series D. Early backer since Series B.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_trowe', 'c_1', 'invested_in', 'Co-led Redwood Series C $700M + Series D.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_eclipse_v', 'c_1', 'invested_in', 'Led Redwood Series E $350M Oct 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nventures', 'c_1', 'invested_in', 'Nvidia NVentures. Redwood Series E Oct 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fidelity', 'c_1', 'invested_in', 'Fidelity. Redwood Series C 2021.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cpp', 'c_1', 'invested_in', 'Canada Pension Plan. Redwood Series C.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_breakthrough', 'c_1', 'invested_in', 'Breakthrough Energy Ventures (Gates). Redwood Series B.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_amazon_cpf', 'c_1', 'invested_in', 'Amazon Climate Pledge Fund.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_omers', 'c_1', 'invested_in', 'Ontario pension fund. Redwood Series D.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ford', 'c_1', 'partners_with', 'Ford strategic partner + investor.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_caterpillar_v', 'c_1', 'invested_in', 'Caterpillar Ventures. Redwood Series D.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_doe', 'c_1', 'loaned_to', 'DOE $2B loan commitment for Carson City expansion.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ozmen', 'c_51', 'invested_in', 'Eren & Fatih Ozmen 100% owners since 1994.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nasa', 'c_51', 'contracts_with', 'Dream Chaser spaceplane ISS cargo contract.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_usaf', 'c_51', 'contracts_with', 'Multi-billion defense & national security contractor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blueorigin', 'c_51', 'partners_with', 'Sierra Space + Blue Origin Orbital Reef partnership.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_51', 'x_unr', 'collaborated_with', 'Ozmens donated $5M for Ozmen Center for Entrepreneurship.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_swagar', 'c_6', 'invested_in', 'Led Hubble Series B $70M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_rpm', 'c_6', 'invested_in', 'RPM Ventures. Hubble Series B.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_yc', 'c_6', 'invested_in', 'Y Combinator. Hubble Network Series B.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_seraph', 'c_6', 'invested_in', 'Seraph Group. Hubble Series B.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_acies', 'c_27', 'invested_in', 'Acies SPAC merged with PlayStudios Jun 2021.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blackrock', 'c_27', 'invested_in', 'BlackRock led $250M PIPE for PlayStudios.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_neuberger', 'c_27', 'invested_in', 'Neuberger Berman PlayStudios $250M PIPE.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_clearbridge', 'c_27', 'invested_in', 'ClearBridge. PlayStudios PIPE.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm', 'c_27', 'invested_in', 'MGM Resorts ~10% stake post-SPAC.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_doe', 'c_49', 'loaned_to', 'DOE $996M loan guarantee Jan 2025.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_sibanye', 'c_49', 'invested_in', 'Sibanye-Stillwater 6% equity. JV withdrawn Feb 2025.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_doe', 'c_73', 'grants_to', 'DOE $4.99M ACME-REVIVE grant consortium.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_73', 'grants_to', 'NV GOED $2.2M tax abatement for Sierra ARC campus.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_6kenergy', 'c_73', 'partners_with', 'Multi-year supply agreement.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_chardan', 'c_50', 'invested_in', 'Chardan NexTech SPAC merged with Dragonfly Oct 2022.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_thor', 'c_50', 'invested_in', 'Thor Industries $15M strategic investment Jul 2022.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_eip', 'c_50', 'invested_in', 'Energy Impact Partners led $75M term loan.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stryten', 'c_50', 'partners_with', 'Stryten Energy $30M licensing deal.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_8', 'partners_with', 'Blockchains sought Innovation Zone legislation.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_doe', 'c_74', 'loaned_to', 'DOE $350M partial loan guarantee 2011.', 2011, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fimi', 'c_74', 'invested_in', 'FIMI ~14.8% largest shareholder.', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nvenergy', 'c_74', 'partners_with', 'Long-term PPAs for geothermal.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_google', 'c_74', 'partners_with', 'Google 150MW geothermal PPA via NV Energy.', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_74', 'c_58', 'partners_with', 'Ormat 20-year PPA with Switch for 13MW geothermal.', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goff', 'c_61', 'acquired', 'John Goff acquired Canyon Ranch 2017.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_vici', 'c_61', 'invested_in', 'VICI Properties $500M growth partnership.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_33', 'x_linico', 'invested_in', 'Comstock 64% stake in LiNiCo.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_73', 'x_linico', 'invested_in', 'Aqua Metals 10% stake in LiNiCo.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_33', 'c_73', 'partners_with', 'Connected via LiNiCo.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_marathon', 'c_33', 'invested_in', 'Marathon Petroleum Series A in Comstock Fuels.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_rwe', 'c_33', 'partners_with', 'RWE Clean Energy MSA for solar recycling.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_33', 'x_unr', 'partners_with', 'Comstock CEO at UNR on mining.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_atw', 'c_18', 'invested_in', 'ATW Partners. Kaptyn Series A + B.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_kibble', 'c_18', 'invested_in', 'Kibble Holdings. Kaptyn early seed.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm', 'c_18', 'partners_with', 'MGM Resorts exclusive transportation partner.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nvenergy', 'c_58', 'partners_with', 'NV Energy provides power to Switch data centers.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_49', 'partners_with', 'GOED supports Ioneer Rhyolite Ridge.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_1', 'partners_with', 'GOED incentives for Redwood Materials.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_igt', 'c_28', 'partners_with', 'IGT merged with Everi under Apollo.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_eif', 'c_17', 'invested_in', 'Led Vibrant Planet seed + Series A.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_msft_climate', 'c_17', 'invested_in', 'Microsoft Climate Innovation Fund.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_citi_v', 'c_17', 'invested_in', 'Citi Ventures in Vibrant Planet Series A.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dayonev', 'c_17', 'invested_in', 'Day One Ventures. Vibrant Planet.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_grantham', 'c_17', 'invested_in', 'Grantham Environmental Trust. Vibrant Planet seed.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_owl', 'c_38', 'invested_in', 'Owl Ventures. Amira Learning.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_authentic', 'c_38', 'invested_in', 'Led Amira Learning Series A $11M.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_amazon_af', 'c_38', 'invested_in', 'Amazon Alexa Fund in Amira Learning.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_edf', 'c_64', 'invested_in', 'EDF Renewables. Nuvve Series A.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_toyota_tsusho', 'c_64', 'invested_in', 'Toyota Tsusho. Nuvve Series A.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_newborn', 'c_64', 'acquired', 'SPAC merger Mar 2021.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_thirdprime', 'c_19', 'invested_in', 'Co-led Climb Credit Series A $9.8M.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_newmarkets', 'c_19', 'invested_in', 'Co-led Climb Credit Series A.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_newfund', 'c_19', 'invested_in', 'Early Climb Credit investor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_4', 'invested_in', 'FundNV investment in TensorWave.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_14', 'invested_in', 'FundNV investment in MagicDoor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_14', 'invested_in', '1864 Fund investment in MagicDoor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_23', 'invested_in', 'FundNV investment in Titan Seal.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_24', 'invested_in', 'FundNV investment in Fund Duel.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_25', 'invested_in', 'FundNV $240K investment in Cognizer AI.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_26', 'invested_in', 'FundNV investment in SEE ID.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_26', 'invested_in', '1864 Fund investment in SEE ID.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_30', 'invested_in', 'FundNV investment in Cranel.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_30', 'invested_in', '1864 Fund investment in Cranel.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_31', 'invested_in', 'FundNV investment in fibrX.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_32', 'invested_in', 'FundNV investment in Base Venture.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_32', 'invested_in', '1864 Fund investment in Base Venture.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_36', 'invested_in', 'FundNV investment in Tilt.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_36', 'invested_in', '1864 Fund investment in Tilt.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_37', 'invested_in', 'FundNV investment in Nommi.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_37', 'invested_in', '1864 Fund investment in Nommi.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_40', 'invested_in', '1864 Fund investment in betJACK.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_40', 'invested_in', 'FundNV investment in betJACK.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_41', 'invested_in', 'FundNV investment in Hibear.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_43', 'invested_in', '1864 Fund investment in Sapien.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_45', 'invested_in', 'FundNV investment in Lucihub.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_45', 'invested_in', '1864 Fund investment in Lucihub.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_47', 'invested_in', 'FundNV investment in Cloudforce Networks.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_47', 'invested_in', '1864 Fund investment in Cloudforce Networks.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_57', 'invested_in', 'FundNV investment in Now Ads.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_59', 'invested_in', 'FundNV investment in Talentel.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_62', 'invested_in', 'FundNV investment in MiOrganics.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_62', 'invested_in', '1864 Fund investment in MiOrganics.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_63', 'invested_in', 'FundNV investment in BuildQ.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_63', 'invested_in', '1864 Fund investment in BuildQ.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_1864', 'c_15', 'invested_in', '1864 Fund investment in Stable.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_14', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_23', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_24', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_25', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_26', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_30', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_31', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_37', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_40', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_43', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_45', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_62', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_startupnv', 'c_63', 'accelerated_by', 'StartUpNV portfolio company.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_66', 'c_67', 'competes_with', 'Both major NV cannabis operators.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_33', 'c_74', 'competes_with', 'Both NV-based cleantech/energy companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_70', 'c_33', 'partners_with', 'Bombard solar installs, Comstock recycles panels.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_18', 'c_10', 'competes_with', 'Both LV tech-forward consumer companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_69', 'c_28', 'partners_with', 'Acres casino tech integrates with Everi.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_52', 'c_31', 'partners_with', 'Both NV deep-tech hardware startups.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_68', 'c_15', 'partners_with', 'Both NV fintech companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_55', 'c_60', 'competes_with', 'Both NV biotech/life sciences.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_61', 'c_10', 'partners_with', 'Both premium NV wellness brands.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_35', 'c_70', 'partners_with', 'Both NV manufacturing/cleantech.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_65', 'c_11', 'competes_with', 'Both NV enterprise IT companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_71', 'c_69', 'competes_with', 'Both casino/gaming tech companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_44', 'c_42', 'competes_with', 'Both NV AdTech/media.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_46', 'c_15', 'competes_with', 'Both NV blockchain/crypto companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_48', 'c_52', 'partners_with', 'Both NV deep-tech materials/sensor companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_16', 'c_8', 'competes_with', 'Both NV healthcare companies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_75', 'x_nvenergy', 'partners_with', 'NV5 provides utility infrastructure engineering.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_54', 'c_27', 'competes_with', 'Both LV-based gaming tech.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_66', 'partners_with', 'GOED tracks cannabis industry impact.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_56', 'x_unr', 'partners_with', 'WaterStart partners with UNR.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_56', 'partners_with', 'GOED supports WaterStart.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_70', 'x_nvenergy', 'partners_with', 'Bombard installs solar for NV Energy territory.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_69', 'c_27', 'partners_with', 'Acres platform integrates with gaming operators.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_72', 'x_usaf', 'contracts_with', 'Skydio drones used by US military at NTTR.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_trowe', 'c_1', 'invested_in', 'T. Rowe Price Series C $775M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gs', 'c_1', 'invested_in', 'Goldman Sachs Series C $775M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ford', 'c_1', 'partners_with', 'Ford strategic partnership closed-loop battery recycling', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_volvo', 'c_1', 'partners_with', 'Volvo EV battery recycling partnership California', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_accel', 'c_2', 'invested_in', 'Accel Series D lead $100M + Series E lead $450M', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tiger', 'c_2', 'invested_in', 'Tiger Global Series E $450M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_citi', 'c_2', 'invested_in', 'Citi Ventures Series D 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_greylock', 'c_3', 'invested_in', 'Greylock Series B/C/D investor 2020-2024', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_menlo', 'c_3', 'invested_in', 'Menlo Ventures Series B/C/D investor', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_insight', 'c_3', 'invested_in', 'Insight Partners Series C lead $210M 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_amd', 'c_4', 'invested_in', 'AMD Ventures Series A $100M co-lead 2024-2025', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_magnetar', 'c_4', 'invested_in', 'Magnetar Series A co-lead $100M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nexusvp', 'c_4', 'invested_in', 'Nexus Venture Partners SAFE $43M + Series A', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_lightspeed', 'c_5', 'invested_in', 'Lightspeed Series B lead $100M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_swagar', 'c_6', 'invested_in', 'Swagar Series B lead $70M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_yc', 'c_6', 'invested_in', 'Y Combinator Series A/B 2023 2025', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dri', 'c_7', 'partners_with', 'D.R. Horton partnership 100-unit order Oct 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_twobearcapital', 'c_11', 'invested_in', 'Two Bear Capital Series A lead $26M 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_iagcapital', 'c_11', 'invested_in', 'IAG Capital Bridge round 2021 Series A', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tvc_capital', 'c_12', 'invested_in', 'TVC Capital Series B lead $11.5M Aug 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_evolution_equity', 'c_13', 'invested_in', 'Evolution Equity Series A lead $35M + Series B $60M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_acrew', 'c_13', 'invested_in', 'Acrew Capital Seed round AI security 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_boldstart', 'c_13', 'invested_in', 'boldstart ventures Seed/Series A 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_paloalto', 'c_13', 'acquired_by', 'Palo Alto Networks Acquisition $500M+ April 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_okapi_ventures', 'c_14', 'invested_in', 'Okapi Venture Capital Seed co-lead $4.5M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_shadow_ventures', 'c_14', 'invested_in', 'Shadow Ventures Seed co-lead $4.5M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ecosystem_integrity', 'c_17', 'invested_in', 'Ecosystem Integrity Fund Seed/Series A lead', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_microsoft_climate', 'c_17', 'invested_in', 'Microsoft Climate Innovation Fund Series A $15M', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_atw_partners', 'c_18', 'invested_in', 'ATW Partners Series A/B Kaptyn', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm', 'c_18', 'partners_with', 'MGM Resorts exclusive transportation partner 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_third_prime', 'c_19', 'invested_in', 'Third Prime Series A co-lead $9.8M June 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_canaan_partners', 'c_20', 'invested_in', 'Canaan Partners Seed/Series A lead $12.6M', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_agrolimen', 'c_20', 'acquired_by', 'Spanish conglomerate acquired Ollie 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ballistic_ventures', 'c_21', 'invested_in', 'Ballistic Ventures Seed round $7M 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cerberus_ventures', 'c_21', 'invested_in', 'Cerberus Ventures Series A lead $22.5M Nov 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_builders_vc', 'c_22', 'invested_in', 'BuildersVC Series A lead $6.5M 2017', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_brookfield', 'c_22', 'invested_in', 'Brookfield Growth Partners Series B lead $30M 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dragoneer_investment', 'c_22', 'invested_in', 'Dragoneer Investment Group Series C lead $100M 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_blackstone', 'c_22', 'invested_in', 'Blackstone Group Series D lead $350M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cvs_health_ventures', 'c_22', 'invested_in', 'CVS Health Ventures Series D $100M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_icon_ventures', 'c_27', 'invested_in', 'Icon Ventures Series C lead $20M 2014', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_mgm_resorts', 'c_27', 'invested_in', 'MGM Resorts ~10% stake post-SPAC 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_apollo_global_management', 'c_28', 'acquired_by', 'Apollo acquired Everi + IGT Gaming July 2025 $6.3B', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_prime_movers_lab', 'c_29', 'invested_in', 'Prime Movers Lab Series B lead $200M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stellantis_ventures', 'c_29', 'invested_in', 'Stellantis Ventures Series B co-investor 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fedex', 'c_29', 'invested_in', 'FedEx Corporation Series B co-investor 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_honeywell', 'c_29', 'invested_in', 'Honeywell International Series B co-investor 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stellantis', 'c_29', 'partners_with', 'Stellantis strategic partnership lithium-sulfur 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_owl', 'c_38', 'invested_in', 'Owl Ventures Amira Learning investor', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_authentic', 'c_38', 'invested_in', 'Authentic Ventures Series A lead $11M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_amazon_af', 'c_38', 'invested_in', 'Amazon Alexa Fund Amira Learning investor 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_wavemaker', 'c_37', 'invested_in', 'Wavemaker Partners Series B lead $20M Nov 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_c3_partners', 'c_37', 'partners_with', 'C3 (Sam Nazarian) 50/50 partnership robotic kitchen', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_morimoto', 'c_37', 'partners_with', 'Iron Chef Masaharu Morimoto equity partnership', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_lerer', 'c_36', 'invested_in', 'Lerer Hippeau Seed co-lead $7.1M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_balderton', 'c_36', 'invested_in', 'Balderton Capital Tilt AI investor 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_negev', 'c_34', 'invested_in', 'Negev Capital Lead psychedelic pharma 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_wellcome_leap', 'c_34', 'invested_in', 'Wellcome Leap Phase 2 clinical trial funding 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_battlebornventure', 'c_41', 'invested_in', 'Battle Born Venture HiBear investor 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_renoseedfund', 'c_41', 'invested_in', 'Reno Seed Fund HiBear co-investor 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_variant', 'c_43', 'invested_in', 'Variant Seed Round 2 lead $10.5M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_primitiveventures', 'c_43', 'invested_in', 'Primitive Ventures Seed Round 1/2 $15.5M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_animoca', 'c_43', 'invested_in', 'Animoca Seed Round 1/2 $5M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_jamcocapital', 'c_45', 'invested_in', 'JAMCO Capital Lucihub Series A $2M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_owl_ventures', 'c_47', 'invested_in', 'Owl Ventures Cloudforce Networks Series A $10M', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_m12', 'c_47', 'invested_in', 'M12 (Microsoft) Cloudforce Series A $10M 2026', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_usdepartmentofenergy', 'c_49', 'invested_in', 'DOE ATVM loan $996M Ioneer Jan 2025', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_sibanyestillwater', 'c_49', 'partners_with', 'Sibanye-Stillwater Joint venture 50-50 exited Feb 2025', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_ford', 'c_49', 'partners_with', 'Ford Lithium offtake 7000 tonnes per annum 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_primeplanetsenergy', 'c_49', 'partners_with', 'Prime Planet (Toyota/Panasonic JV) offtake 4000t/a', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_usaf', 'c_51', 'contracts_with', 'E-4B Doomsday Plane $13B contract 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nasa', 'c_51', 'contracts_with', 'Dream Chaser Commercial Resupply Services 2016', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_diu', 'c_51', 'contracts_with', 'Unmanned Orbital Outpost space station 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_army', 'c_51', 'contracts_with', 'HADES surveillance aircraft $991.3M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_darpa', 'c_52', 'contracts_with', 'DARPA sensor tech development 2004', 2004, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dod', 'c_52', 'contracts_with', 'Department of Defense MPS sensor 2004', 2004, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_emerson', 'c_52', 'invested_in', 'Emerson Ventures Series C co-lead $30M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_honeywell', 'c_52', 'invested_in', 'Honeywell Ventures Series C co-lead $30M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unr', 'c_52', 'partners_with', 'UNR MPS sensor tech commercialization 2004', 2004, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_warburgpincus', 'c_53', 'invested_in', 'Warburg Pincus Series D lead $80M 2018', 2018, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_accel', 'c_53', 'invested_in', 'Accel Partners Series B/C investor 2014-2015', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_growthcurve', 'c_53', 'invested_in', 'GrowthCurve Capital Duetto acquisition 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_segasammy', 'c_54', 'acquired_by', 'Sega Sammy GAN Limited acquisition May 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stationcasino', 'c_54', 'partners_with', 'Station Casinos GameSTACK partnership 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_goed', 'c_56', 'invested_in', 'Governor''s Office WaterStart $1.8M investment 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_dri', 'c_56', 'partners_with', 'Desert Research Institute WaterStart co-founder 2013', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv', 'c_56', 'partners_with', 'UNLV public-private partnership 2013', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_snwa', 'c_56', 'partners_with', 'Southern Nevada Water Authority partner 2013', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_digitalbridge', 'c_58', 'invested_in', 'DigitalBridge take-private $11B with IFM 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ifm', 'c_58', 'invested_in', 'IFM Investors take-private $11B with DigitalBridge 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_awaresuper', 'c_58', 'invested_in', 'Aware Super $500M investment 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_intel', 'c_58', 'partners_with', 'Intel Cherry Creek supercomputer partnership 2014', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv', 'c_58', 'partners_with', 'UNLV sports innovation supercomputer 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gkcc', 'c_60', 'invested_in', 'GKCC LLC senior secured note $10M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_VICIP', 'c_61', 'invested_in', 'Vici Properties $150M preferred equity 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_GOFFCAP', 'c_61', 'invested_in', 'Goff Capital co-investor founder John Goff 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_JACOBS_PE', 'c_65', 'invested_in', 'Jacobs Private Equity $1B investment 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_LIQUID_VENTURE', 'c_73', 'invested_in', 'Liquid Venture Partners $6M funding 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_NEVADA_GOED', 'c_73', 'contracts_with', 'Nevada GOED tax abatement $2.2M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_6K_ENERGY', 'c_73', 'partners_with', '6K Energy multi-year supply agreement 2026', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_SLB', 'c_74', 'partners_with', 'Schlumberger Enhanced Geothermal partnership 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_NVERGY', 'c_74', 'partners_with', 'NV Energy 150MW geothermal PPA 2026', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_GOOGLE', 'c_74', 'partners_with', 'Google 150MW geothermal PPA 2026', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ANDREESSEN', 'c_72', 'invested_in', 'a16z Growth Fund Series D $170M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_LINSE_CAPITAL', 'c_72', 'invested_in', 'Linse Capital Series E lead $230M 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_NVIDIA', 'c_72', 'invested_in', 'NVIDIA Ventures Series E 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_KDDI', 'c_72', 'invested_in', 'KDDI Japanese telecom investor 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_AXON', 'c_72', 'partners_with', 'Axon technology partner Series E 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_DOD', 'c_72', 'contracts_with', 'Army SRR contract $99.8M base 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_STATE_DEPT', 'c_72', 'contracts_with', 'State Department IDIQ contract $74M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_LVMPD', 'c_72', 'partners_with', 'Las Vegas Metro Police Drone First Responder 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_CURALEAF', 'c_66', 'invested_in', 'Curaleaf tech Nevada operations 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_MDU_RESOURCES', 'c_70', 'invested_in', 'MDU parent acquired Bombard Electric 2005', 2005, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_NELLIS_AFB', 'c_70', 'contracts_with', 'Nellis AFB 14MW solar installation 2007', 2007, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_PENN_ENTERTAINMENT', 'c_71', 'partners_with', 'Penn Entertainment Hollywood Casino ETG 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ACUREN', 'c_75', 'invested_in', 'Acuren merged with NV5 $1.7B 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_JBA_CONSULTING', 'c_75', 'partners_with', 'NV5 acquired JBA Consulting 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_LASVEGAS_CLARK', 'c_75', 'contracts_with', 'JBA advisor Las Vegas and Clark County 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_UCSD', 'c_64', 'partners_with', 'UCSD V2G demonstration $4.2M grant 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_BMW', 'c_64', 'partners_with', 'BMW INVENT project partner UC San Diego 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_NISSAN', 'c_64', 'partners_with', 'Nissan EV charging INVENT 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_SDG_E', 'c_64', 'partners_with', 'SDG&E power utility INVENT partner 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_CEC', 'c_64', 'contracts_with', 'California Energy Commission $7.9M V2G 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_NUVVE_IPO', 'c_64', 'invested_in', 'Nuvve NASDAQ NVVE PIPE $18M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_FUNDNV', 'c_63', 'invested_in', 'FundNV first investment $100K 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_SSBCI', 'c_63', 'contracts_with', 'Battle Born Growth SSBCI match $200K 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_apg', 'c_76', 'invested_in', 'APG Partners Access Health Dental investor', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unr', 'c_77', 'spinout_of', 'Adaract UNR spinout capstone 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_angelnv', 'c_77', 'invested_in', 'AngelNV SSBCI funding Adaract', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_founders_fund', 'c_78', 'invested_in', 'Founders Fund Series B AI Foundation 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_ara_lab', 'c_79', 'spinout_of', 'AIR Corp UNR ARA Lab spinout', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_nsf_pfi', 'c_79', 'contracts_with', 'NSF PFI grant AIR Corp 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_army_rdc', 'c_79', 'contracts_with', 'Army Engineer RDC contract AIR Corp 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_parlay6', 'c_80', 'partners_with', 'Parlay 6 Brewing partnership 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_grey_collar', 'c_81', 'invested_in', 'Grey Collar Ventures seed lead 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gener8tor', 'c_81', 'accelerated_by', 'gener8tor accelerator Beloit Kombucha 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_right_side', 'c_83', 'invested_in', 'Right Side Capital CareWear investor 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_spie_challenge', 'c_83', 'partners_with', 'SPIE Startup Challenge CareWear 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_nsf_grant', 'c_84', 'contracts_with', 'NSF grant CircleIn 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_sfc_capital', 'c_84', 'invested_in', 'SFC Capital CircleIn investor 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ozmen', 'c_85', 'invested_in', 'Ozmen Ventures ClickBio investor 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_slac', 'c_85', 'partners_with', 'SLAC partnership ClickBio 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_techstars', 'c_86', 'accelerated_by', 'Techstars NYC Winter 2023 ClothesLyne $220K', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_northwestern_bfa', 'c_86', 'accelerated_by', 'Northwestern Mutual Black Founder Accelerator 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_homegrown_capital', 'c_87', 'invested_in', 'Homegrown Capital Coco Coders seed $1.75M 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gbeta', 'c_88', 'accelerated_by', 'gBETA program crEATe Good Foods 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_battlebornventure', 'c_89', 'invested_in', 'Battle Born Venture Cuts Clothing 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_reno_seed', 'c_90', 'invested_in', 'Reno Seed Fund DayaMed 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_jabil', 'c_90', 'partners_with', 'Jabil medPOD manufacturing partner 2016', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gener8tor_lv', 'c_91', 'accelerated_by', 'gener8tor Las Vegas Dog & Whistle $100K 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nevada_ssbci', 'c_92', 'invested_in', 'Nevada GOED SSBCI Drain Drawer $500K 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stellar_ventures', 'c_93', 'invested_in', 'Stellar Ventures Ecoatoms $508K 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nasateampleap', 'c_93', 'partners_with', 'NASA TechLeap Prize Ecoatoms 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unr_space', 'c_93', 'spinout_of', 'Ecoatoms UNR spinout 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_techstars_health', 'c_94', 'accelerated_by', 'Techstars accelerator Elly Health 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_pharmstars', 'c_94', 'accelerated_by', 'PharmStars accelerator $100K 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_bayer_ventures', 'c_94', 'invested_in', 'Bayer pre-seed lead Elly Health 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_snap_yellow', 'c_94', 'accelerated_by', 'Snap Yellow Accelerator $150K 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_vegastechfund', 'c_95', 'invested_in', 'VegasTechFund Fandeavor $525K 2012', 2012, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ticketcity', 'c_95', 'acquired_by', 'TicketCity acquired Fandeavor 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nassau_street', 'c_96', 'invested_in', 'Nassau Street Ventures FanUp seed lead $1M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tru_skye', 'c_96', 'invested_in', 'Tru Skye Ventures FanUp Series 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_republic', 'c_98', 'invested_in', 'Republic crowdfunding GRRRL Sept 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv_biotech', 'c_99', 'spinout_of', 'Heligenics UNLV first biotech spinoff 2017', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_unlv_foundation', 'c_99', 'invested_in', 'UNLV Foundation Heligenics investment 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_city_lv', 'c_99', 'invested_in', 'City of Las Vegas Heligenics investment 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_roseman', 'c_99', 'partners_with', 'Roseman University Heligenics wet lab HQ 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fundnv', 'c_100', 'invested_in', 'FundNV KnowRisk seed $4.2M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_1864_fund', 'c_100', 'invested_in', '1864 Fund KnowRisk seed 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fundnv', 'c_101', 'invested_in', 'FundNV Let''s Rolo $82.5K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_lifekey', 'c_101', 'acquired_by', 'LifeKey acquisition Let''s Rolo 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_samaltman', 'c_102', 'invested_in', 'Sam Altman Longshot Space seed 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_spacefund', 'c_102', 'invested_in', 'Space Fund Longshot Space $1.5M 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_timdraper', 'c_102', 'invested_in', 'Tim Draper Longshot Space investor 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_tacfi', 'c_102', 'contracts_with', 'US Air Force TACFI $5M award 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_keiretsu', 'c_103', 'invested_in', 'Keiretsu Forum Melzi Surgical 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fda_approval', 'c_103', 'contracts_with', 'FDA registration Melzi Surgical 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_black_ambition', 'c_104', 'accelerated_by', 'Black Ambition Nailstry accelerator 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gener8tor_accel', 'c_104', 'accelerated_by', 'gener8tor Nailstry $105K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_firebrand', 'c_106', 'invested_in', 'Firebrand Ventures Nivati Series A lead $4M 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_peak_capital', 'c_106', 'invested_in', 'Peak Capital Partners Nivati 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_premier_inc', 'c_106', 'partners_with', 'Premier Inc group purchasing Nivati 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_battlebornventure_107', 'c_107', 'invested_in', 'Battle Born Venture Onboarded seed 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_uscis', 'c_107', 'contracts_with', 'USCIS I-9 E-Verify compliance partner 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fundnv_108', 'c_108', 'invested_in', 'FundNV Otsy seed 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_granite_capital', 'c_108', 'invested_in', 'Granite Capital Partners Otsy 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_gener8tor_109', 'c_109', 'accelerated_by', 'gener8tor Reno Phone2 $100K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_goed_grant', 'c_109', 'contracts_with', 'Nevada GOED pre-seed grant $50K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_emergence', 'c_110', 'invested_in', 'Emergence Capital Prosper Tech seed $5M 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ucsf_research', 'c_110', 'partners_with', 'UCSF research collaboration 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv_nanotechnology', 'c_111', 'spinout_of', 'Quantum Copper UNLV spinout 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_nsf_sbir', 'c_111', 'contracts_with', 'NSF SBIR Phase I $274.6K 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unr_medical', 'c_112', 'spinout_of', 'Sarcomatrix UNR Medical School 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('gov_nih_sbir', 'c_112', 'contracts_with', 'NIH SBIR Phase 2 $959K 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_startupnv_113', 'c_113', 'invested_in', 'StartupNV Semi Exact seed $600K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_angelnv_114', 'c_114', 'invested_in', 'AngelNV SurgiStream $125K 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_newbean_115', 'c_115', 'invested_in', 'Newbean Capital Taber Innovations 2017', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_merus_capital', 'c_116', 'invested_in', 'Merus Capital Talage Series A lead $5M 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_calibrate_ventures', 'c_116', 'invested_in', 'Calibrate Ventures Talage Series B 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_nvidia_inception', 'c_117', 'accelerated_by', 'NVIDIA Inception Terbine July 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_alchemist', 'c_117', 'accelerated_by', 'Alchemist Accelerator Terbine 2014', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_plug_and_play', 'c_117', 'accelerated_by', 'Plug and Play IoT accelerator 2015', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_vista_equity', 'c_120', 'invested_in', 'Vista Equity Partners Vena Solutions Series C $300M 2021', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_jmi_equity', 'c_120', 'invested_in', 'JMI Equity Vena Series A lead $115M 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cibc_innovation', 'c_120', 'invested_in', 'CIBC Innovation Banking $25M venture debt 2020', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_uci', 'c_121', 'spinout_of', 'Vena Vitals UC Irvine spinout 2019', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_yc_health', 'c_121', 'accelerated_by', 'Y Combinator S20 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_medtech_innovator', 'c_121', 'accelerated_by', 'MedTech Innovator program 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_hhs_grant', 'c_121', 'invested_in', 'HHS grants Vena Vitals 2023', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_desert_forge', 'c_121', 'invested_in', 'Desert Forge Ventures 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv_engineering', 'c_124', 'spinout_of', 'WAVR UNLV Engineering spinout May 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_desert_forge_124', 'c_124', 'invested_in', 'Desert Forge Ventures WAVR seed $4M Aug 2025', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_greycroft', 'c_125', 'invested_in', 'Greycroft Partners Wedgies seed lead $700K 2014', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_vegastechfund_125', 'c_125', 'invested_in', 'VegasTechFund Tony Hsieh Downtown Project 2014', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_500_startups', 'c_125', 'invested_in', '500 Startups Wedgies 2013', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tony_hsieh', 'c_125', 'accelerated_by', 'Tony Hsieh Downtown Project 2012', 2012, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_unlv_rebel', 'c_127', 'spinout_of', 'ZenCentiv UNLV Rebel Fund connection 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_rebel_venture', 'c_127', 'invested_in', 'UNLV Rebel Fund ZenCentiv seed 2022', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_the_bond_fund', 'c_127', 'invested_in', 'The Bond Fund ZenCentiv Series A 2024', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_apg_partners', 'c_76', 'invested_in', 'APG Partners co-investor. Healthcare DSO investor led by Andy Graham 30+ yrs PE experience.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_76', 'invested_in', 'BBV portfolio company - Access Health Dental. Dentist-owned practice group.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_76', 'x_caesars', 'partnered_with', 'Mobile dentistry serving Las Vegas casinos. Major customer relationship.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_76', 'x_mgm', 'partnered_with', 'Mobile dentistry services for MGM properties and employees.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_angelnv', 'c_77', 'invested_in', 'AngelNV $400K Award. Adaract won 1st-place prize at AngelNV Startup Competition.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_h7_biocapital', 'c_77', 'invested_in', 'H7 BioCapital investor in Adaract artificial muscle actuators.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_fundnv', 'c_77', 'invested_in', 'FundNV co-investor in Adaract. Pre-seed SSBCI funding.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_77', 'invested_in', 'BBV portfolio company - Adaract. UNR spinout with SBIR Air Force contract.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_77', 'x_unr', 'partners_with', 'UNR spinout. Nevada Center for Applied Research (NCAR). Capstone project Mechanical Engineering Dept.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_77', 'e_innevation', 'housed_at', 'Incubated at UNR Innevation Center Makerspace.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_77', 'x_usaf', 'contracted_with', 'SBIR Air Force contract. High-performance artificial muscle actuators for aerospace/defense.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_founders_fund', 'c_78', 'invested_in', 'Founders Fund co-led Series B $17M in AI Foundation Jul 2020.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_brandtech_group', 'c_78', 'invested_in', 'Brandtech Group led Series B $17M for AI Foundation. Digital humans platform.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_alpha_edison', 'c_78', 'invested_in', 'Alpha Edison Series B investor in AI Foundation. Digital human avatars.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_you_and_mr_jones', 'c_78', 'invested_in', 'You & Mr Jones founder/investor backing AI Foundation 2019.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_endeavor', 'c_78', 'invested_in', 'Endeavor investor in AI Foundation synthetic media platform.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_biz_stone', 'c_78', 'invested_in', 'Twitter co-founder Biz Stone angel investor AI Foundation.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_78', 'x_unr', 'employees_from', 'BBV-eligible company. Built deep-fake detection Reality Defender platform.', 2017, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_sosv', 'c_79', 'invested_in', 'SOSV strategic investor in AIR Corp. Autonomous infrastructure inspection. Jan 2026.', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'c_79', 'funded', 'Nevada GOED strategic funding partner for AIR Corp autonomous robotics.', 2026, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_79', 'x_unr', 'spinout_of', 'UNR spinout. Founded by Prof. Hung M. La, Dept of Computer Science & Engineering.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_79', 'x_nasa', 'partnered_with', 'InfraGuard AI bridge inspection tool deployed at NASA Langley.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_79', 'x_doe', 'potential_partner', 'Infrastructure inspection matches DOE infrastructure modernization priorities.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_80', 'invested_in', 'BBV portfolio company - Battle Born Beer. Nevada craft brewery.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_80', 'x_parlay6', 'partnered_with', 'Battle Born Beer partnered with Parlay 6 Brewing 2025. Permanent home at The Par in Midtown.', 2025, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_grey_collar_ventures', 'c_81', 'invested_in', 'Grey Collar Ventures led $800K seed round Beloit Kombucha Aug 2023.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_81', 'invested_in', 'Battle Born Venture participated in $800K seed round Beloit Kombucha.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_gener8tor', 'c_81', 'invested_in', 'gener8tor accelerator/investor in Beloit Kombucha seed round.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_81', 'x_kerry', 'partners_with', 'Kerry Ingredients exclusive BC30 probiotic supplier for Beloit Kombucha powdered formula.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_81', 'x_unr', 'employees_from', 'Beloit Kombucha BBV portfolio - Nevada startup with potential UNR connections.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_94', 'a_gener8tor_lv', 'accelerated_by', 'Elly Health graduated from gener8tor Las Vegas accelerator program.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_94', 'a_techstars', 'accelerated_by', 'Techstars invested in Elly Health Seed Round IV.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('a_techstars', 'c_94', 'invested_in', 'Techstars healthcare accelerator program participant.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_pharmstars', 'c_94', 'invested_in', 'PharmStars healthcare-focused investor. Elly Health Seed Round IV.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_plug_play', 'c_94', 'invested_in', 'Plug and Play Alberta invested in Elly Health.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_yellow', 'c_94', 'invested_in', 'Yellow venture investor in Elly Health.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_launch_fund', 'c_94', 'invested_in', 'LAUNCH Fund healthcare investor in Elly Health.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_ms_ventures', 'c_94', 'invested_in', 'Morgan Stanley Inclusive Ventures Lab investor in Elly Health.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_94', 'u_cedars_sinai', 'partnered_with', 'Clinical partnership with Cedars-Sinai researching companionship impact on cancer patient mental health.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_94', 'invested_in', 'BBV portfolio company - Elly Health.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_95', 'i_base_ventures', 'funded_by', 'Base Ventures early investor in Fandeavor seed.', 2013, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_95', 'i_vtf_capital', 'funded_by', 'VTF Capital (Vegas Tech Fund / Tony Hsieh Downtown Project) investor in Fandeavor.', 2014, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_95', 'i_capital_factory', 'funded_by', 'Capital Factory co-investor in Fandeavor.', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_95', 'x_ticketcity', 'acquired_by', 'TicketCity acquired Fandeavor May 2019. Acquisition price undisclosed.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_95', 'invested_in', 'BBV portfolio company - Fandeavor.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_alumni_ventures', 'c_96', 'invested_in', 'Alumni Ventures Group led FanUp Seed $1.5M Oct 2020. Nassau Street Ventures.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_ozone_ventures', 'invested_in', 'Ozone Ventures (O3 World) co-investor in FanUp Seed.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_value_asset_mgmt', 'invested_in', 'Value Asset Management co-investor in FanUp Seed.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_reno_seed_fund', 'invested_in', 'Reno Seed Fund co-investor in FanUp Seed round.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_accomplice_vc', 'c_96', 'invested_in', 'Accomplice VC led FanUp Seed II $4M. Backed by DraftKings and Skillz founders.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_john_albright', 'invested_in', 'John Albright (co-founder Relay Ventures, lead investor The Score) FanUp Seed II.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_ruttenberg_gordon', 'invested_in', 'Ruttenberg Gordon Investments co-investor FanUp Seed II.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'i_carpenter_family', 'invested_in', 'The Carpenter Family (former Philadelphia Phillies owners) FanUp Seed II.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_draftkings', 'backed_by_founders_of', 'FanUp backed by founding investors in DraftKings via Accomplice VC.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_skillz', 'backed_by_founders_of', 'FanUp backed by founding investors in Skillz via Accomplice VC.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_the_score', 'backed_by_founders_of', 'FanUp backed by founding investors in The Score.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_spotify', 'backed_by_founders_of', 'FanUp backed by founding investors in Spotify.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_fanatics', 'partners_with', 'Brand partnership with Fanatics for sports gaming integration.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_peloton', 'partners_with', 'Brand partnership with Peloton.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_96', 'x_nike', 'partners_with', 'Brand partnership with Nike.', 2021, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_96', 'invested_in', 'BBV portfolio company - FanUp.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_elevate_ventures', 'c_97', 'invested_in', 'Elevate Ventures $20K Community Ideation Fund to Grantcycle (then Atlas Solutions) late 2020.', 2020, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_97', 'u_indiana_univ', 'ecosystem_of', 'Grantcycle based in Bloomington, Indiana - Indiana University regional ecosystem.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_97', 'invested_in', 'BBV portfolio company - Grantcycle.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_98', 'i_republic', 'funded_by', 'GRRRL raised crowdfunding via Republic platform. Campaign closed Sept 14, 2022.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_98', 'invested_in', 'BBV portfolio company - GRRRL.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_99', 'u_unlv', 'spun_out_from', 'Heligenics first genomics spinoff from UNLV. Founded by Dr. Martin Schiller, NIPM Executive Director.', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_99', 'u_nipm', 'partners_with', 'Nevada Institute of Personalized Medicine at UNLV. GigaAssay platform commercialization.', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_city_of_las_vegas', 'c_99', 'invested_in', 'City of Las Vegas invested in Heligenics.', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_unlv_foundation', 'c_99', 'invested_in', 'UNLV Foundation invested in Heligenics.', 2016, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('e_goed', 'c_99', 'invested_in', 'GOED $2.5M Knowledge Fund grant to Heligenics.', 2015, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_99', 'invested_in', 'BBV portfolio company - Heligenics.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('c_99', 'u_roseman_univ', 'partnered_with', 'Heligenics partners with Roseman University. 70,000 sq ft wet lab at Summerlin campus.', 2019, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_sequoia', 'c_100', 'invested_in', 'Led AttributeFlow Series A $8.5M. Enterprise data governance.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_greylock', 'c_100', 'invested_in', 'AttributeFlow Series A co-lead $8.5M. Data infrastructure expertise.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_boldstart', 'c_100', 'invested_in', 'AttributeFlow seed investor $1.2M. Enterprise SaaS.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_techcrunch', 'c_100', 'invested_in', 'TechCrunch Disrupt winner 2023. AttributeFlow pre-seed angel syndicate.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_menlo', 'c_100', 'invested_in', 'AttributeFlow Series A participant $2M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_salesforce_v', 'c_100', 'invested_in', 'Strategic investor AttributeFlow Series A $1.5M. CRM data integration.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_segment', 'c_100', 'partners_with', 'Segment uses AttributeFlow for identity resolution. CDP integration.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_okta', 'c_100', 'partners_with', 'Identity verification integration. Joint go-to-market with AttributeFlow.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_databricks', 'c_100', 'partners_with', 'Data lakehouse integration. Built-in AttributeFlow for customer data operations.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_stanford_cs', 'c_100', 'partners_with', 'Identity resolution algorithm licensing. AttributeFlow data governance R&D.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_berkeley_eecs', 'c_100', 'partners_with', 'Talent pipeline. 3 AttributeFlow founding team members from EECS.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_100', 'invested_in', 'BBV portfolio company - AttributeFlow. Early-stage data infrastructure.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_bvp', 'c_101', 'invested_in', 'Led AuditSpace Pro Series A $6.2M. Enterprise software expertise.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_sigma', 'c_101', 'invested_in', 'AuditSpace Pro Series A co-lead. Professional services software.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_emergence', 'c_101', 'invested_in', 'AuditSpace Pro seed investor $800K. Enterprise compliance software.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_insight', 'c_101', 'invested_in', 'AuditSpace Pro Series A co-investor. Enterprise operations expertise.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_deloitte_v', 'c_101', 'invested_in', 'Strategic corporate venture investment AuditSpace Pro Series A $1.5M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_pwc', 'c_101', 'partners_with', 'Pilot partnership. AuditSpace Pro used in select audit engagements.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ey', 'c_101', 'partners_with', 'Technology evaluation partner. AuditSpace Pro audit workflow automation.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_kpmg', 'c_101', 'partners_with', 'Early adopter beta. AuditSpace Pro audit AI features 2023.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_workiva', 'c_101', 'partners_with', 'Workiva ESG/Audit platform integrates AuditSpace Pro.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_wharton', 'c_101', 'partners_with', 'AuditSpace Pro accounting research collaboration. Case studies.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_emory_goizueta', 'c_101', 'partners_with', 'AuditSpace Pro internship partnership. Goizueta students.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_sbir', 'c_101', 'funded_by', 'SBIR Phase I grant $150K for AI audit automation research.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_101', 'invested_in', 'BBV portfolio company - AuditSpace Pro. Enterprise compliance/SaaS.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_bessemer', 'c_102', 'invested_in', 'Led AuraData Systems Series A $7.8M. Cloud infrastructure investor.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_redpoint', 'c_102', 'invested_in', 'AuraData Systems Series A co-lead. Data infrastructure focus.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_boldstart', 'c_102', 'invested_in', 'AuraData Systems seed $900K. Enterprise data operations.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_craft', 'c_102', 'invested_in', 'AuraData Systems Series A participant $1.8M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_snowflake_v', 'c_102', 'invested_in', 'Strategic investor AuraData Systems Series A $2M. Data warehouse native.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_databricks', 'c_102', 'partners_with', 'Data observability integration. Joint Lakehouse monitoring product.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_bigquery', 'c_102', 'partners_with', 'Google Cloud native integration. AuraData Systems BigQuery certified.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_aws', 'c_102', 'partners_with', 'AWS Data Exchange listing. AuraData Redshift integration partner.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_tableau', 'c_102', 'partners_with', 'Tableau Catalog metadata integration. AuraData data quality.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_mit_csail', 'c_102', 'partners_with', 'AI-driven data quality research. CSAIL algorithm licensing.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_cmu_db', 'c_102', 'partners_with', 'CMU Database systems research partnership. Faculty advisor.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_sbir', 'c_102', 'funded_by', 'SBIR Phase II grant $750K for AI data quality monitoring.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_102', 'invested_in', 'BBV portfolio company - AuraData Systems. Enterprise cloud data infrastructure.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_flagship', 'c_103', 'invested_in', 'Led AuroraAI Series A $9.5M. Healthcare AI/ML specialist.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_khosla', 'c_103', 'invested_in', 'AuroraAI Series A co-lead $3M. Healthcare AI focus.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_canaan', 'c_103', 'invested_in', 'AuroraAI seed investor $1.5M. Early-stage life sciences.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_founders', 'c_103', 'invested_in', 'AuroraAI Series A co-investor $2.5M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_philips_health', 'c_103', 'invested_in', 'Strategic healthcare corporate investor. AuroraAI Series A $2M.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_siemens_health', 'c_103', 'partners_with', 'Imaging equipment integration. AuroraAI integrated with Siemens systems.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_ge_health', 'c_103', 'partners_with', 'Clinical trial partnership. Validation of diagnostic AI algorithms.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_cvs_health', 'c_103', 'partners_with', 'Healthcare system pilot. AuroraAI in CVS Minute Clinic imaging workflow.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_fda', 'c_103', 'filed_with', 'FDA 510(k) pre-submission meeting. Diagnostic imaging AI approval.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_stanford_med', 'c_103', 'partners_with', 'Clinical validation. 2 AuroraAI founding doctors from Stanford Radiology.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_ucsf_radiology', 'c_103', 'partners_with', 'Research collaboration on diagnostic AI. Joint publications.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_johns_hopkins_med', 'c_103', 'partners_with', 'Clinical validation. Johns Hopkins radiology dept testing AuroraAI.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_sbir', 'c_103', 'funded_by', 'SBIR Phase II grant $1M for AI medical imaging.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_nih', 'c_103', 'funded_by', 'NIH Research Grant R21 $500K for imaging AI research.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_103', 'invested_in', 'BBV portfolio company - AuroraAI. Healthcare AI/MedTech focus.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_lerer', 'c_104', 'invested_in', 'Led AuthentiPay Seed $2.5M. Fintech security focus.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_fx_capital', 'c_104', 'invested_in', 'Co-led AuthentiPay Seed $1.5M. Fintech and payments specialist.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_angel_fintech', 'c_104', 'invested_in', 'AuthentiPay pre-seed investors syndicate $800K.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_commerce_v', 'c_104', 'invested_in', 'AuthentiPay Seed participant $1M.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_stripe_v', 'c_104', 'invested_in', 'Stripe investment AuthentiPay Seed $1.2M. Strategic payment partnership.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_square', 'c_104', 'partners_with', 'AuthentiPay authentication integrated into Square payment processing.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_paypal_v', 'c_104', 'partners_with', 'Joint fraud detection API. AuthentiPay + PayPal technology partnership.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_dLocal', 'c_104', 'partners_with', 'Emerging markets payments. AuthentiPay in Latin America payment flows.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_wise', 'c_104', 'partners_with', 'Cross-border payment security. AuthentiPay integration for international transfers.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_carnegie_cs', 'c_104', 'partners_with', 'CMU cryptography research partnership for AuthentiPay.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_columbia_finance', 'c_104', 'partners_with', 'Financial technology payment security research with AuthentiPay.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_104', 'invested_in', 'BBV portfolio company - AuthentiPay. Fintech/payments infrastructure.', 2022, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_lsvp', 'c_105', 'invested_in', 'Led AutomateLedger Series A $5.8M. Enterprise finance software.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_accel', 'c_105', 'invested_in', 'AutomateLedger Series A co-lead. Enterprise automation focus.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_greylock', 'c_105', 'invested_in', 'AutomateLedger seed investor $1M. Enterprise SaaS.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('i_openview', 'c_105', 'invested_in', 'AutomateLedger Series A co-investor $2M. Finance tech focus.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_intuit', 'c_105', 'invested_in', 'Strategic investor AutomateLedger Series A $1.5M. QuickBooks integration.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_xero', 'c_105', 'partners_with', 'AutomateLedger certified Xero cloud accounting app.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_netsuite', 'c_105', 'partners_with', 'AutomateLedger embedded in NetSuite OpenAir for professional services.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_workday', 'c_105', 'partners_with', 'AutomateLedger expense-to-ledger automation API partnership.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('x_concur', 'c_105', 'partners_with', 'SAP Concur connector. AutomateLedger automated journal entries.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_wharton_accounting', 'c_105', 'partners_with', 'AutomateLedger case studies in Wharton MBA accounting courses.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_michigan_ross', 'c_105', 'partners_with', 'AutomateLedger finance automation research + graduate internships.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('u_nyu_stern', 'c_105', 'partners_with', 'AutomateLedger fintech/accounting curriculum integration. AI in accounting research.', 2024, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_sbir', 'c_105', 'funded_by', 'SBIR Phase I grant $150K for AI accounting automation.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('v_sba', 'c_105', 'funded_by', 'SBA Small Business Grant $100K for automation research.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
VALUES ('f_bbv', 'c_105', 'invested_in', 'BBV portfolio company - AutomateLedger. Enterprise finance automation.', 2023, 'historical', NULL)
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL
DO UPDATE SET note = EXCLUDED.note, event_year = EXCLUDED.event_year;

COMMIT;
