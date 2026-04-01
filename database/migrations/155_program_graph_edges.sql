-- Migration 155: Program graph edges — verifiable relationships between programs
-- and funds, accelerators, ecosystem orgs, and companies.
-- Sources: GOED public records, SSBCI allocation docs, StartUpNV portfolio,
--          gener8tor Nevada public announcements, UNLV Black Fire Innovation.
-- Idempotent: ON CONFLICT DO NOTHING
-- Generated: 2026-03-31

BEGIN;

-- ============================================================
-- 1. SSBCI Program → Fund relationships (funded_by / administers)
-- ============================================================
-- The Nevada SSBCI Capital Program ($112.9M) distributes capital through
-- three deployment vehicles: Battle Born Venture, FundNV, and 1864 Fund.
-- Source: US Treasury SSBCI allocation records, GOED press releases.

-- SSBCI program funds BBV (Battle Born Venture is the primary SSBCI equity vehicle)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_bbv', 'funds',
  'Nevada SSBCI program allocates capital to BBV as primary equity deployment vehicle. $50M allocation.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-ssbci'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- SSBCI program funds FundNV (SSBCI loan participation vehicle)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_fundnv', 'funds',
  'Nevada SSBCI program allocates capital to FundNV for pre-seed investments. SSBCI match funding.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-ssbci'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- SSBCI program funds 1864 Fund (SSBCI seed-stage vehicle)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_1864', 'funds',
  'Nevada SSBCI program allocates capital to 1864 Fund for seed-stage investments.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-ssbci'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- ============================================================
-- 2. GOED administers programs
-- ============================================================
-- GOED (e_goed) is the administering agency for multiple state programs.
-- Source: programs.administering_agency field, GOED website.

-- GOED administers the SSBCI Capital Program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Nevada SSBCI Capital Program ($112.9M federal allocation).',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-ssbci'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Battle Born Venture program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'Battle Born Venture administered by Battle Born Growth under GOED. SSBCI equity program.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'battle-born-venture'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Fund NV program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'Fund NV loan participation program administered by Battle Born Growth under GOED.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'fund-nv'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Nevada Knowledge Fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Nevada Knowledge Fund for university commercialization.',
  2016, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-knowledge-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers GOED Knowledge Fund (from migration 019)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Knowledge Fund for university-to-industry research commercialization.',
  2016, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-knowledge-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Nevada SBIR/STTR Matching program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Nevada SBIR/STTR Matching program for state supplemental funding.',
  2018, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-sbir-sttr-matching'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Nevada Catalyst Fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Nevada Catalyst Fund for economic development equity investments.',
  2018, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-catalyst-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers general GOED Grants
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers general economic development grants including workforce training and community development.',
  2015, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-grants'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers WINN Grant
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers WINN workforce training grant ($17M+).',
  2020, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-winn'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Nevada Tech Hub (CHIPS Act)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Nevada Tech Hub ($21M CHIPS and Science Act) for lithium/EV/battery ecosystem.',
  2023, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-nevada-tech-hub'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED administers Silver State Opportunity Fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED administers Silver State Opportunity Fund ($20M SSBCI venture capital).',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'silver-state-opportunity-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- GOED funds gener8tor Nevada (SSBCI-funded accelerator)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_goed', 'pr_' || p.id, 'administers',
  'GOED supports gener8tor Nevada accelerator through SSBCI Battle Born Growth funding.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'gener8tor-nevada'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 3. Accelerator → Program relationships
-- ============================================================
-- StartUpNV operates the StartUpNV Accelerator program.
-- Source: StartUpNV website, public portfolio.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'a_startupnv', 'pr_' || p.id, 'administers',
  'StartUpNV operates its accelerator program providing cohort-based programming and FundNV investments.',
  2017, 'historical', NULL
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- gener8tor LV operates the gener8tor Nevada program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'a_gener8tor_lv', 'pr_' || p.id, 'administers',
  'gener8tor Las Vegas runs 12-week accelerator cohorts with $100K/company under Battle Born Growth.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'gener8tor-nevada'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Black Fire Innovation operates the UNLV incubator program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'a_blackfire', 'pr_' || p.id, 'administers',
  'Black Fire Innovation operates UNLV incubator at Harry Reid Research & Technology Park.',
  2020, 'historical', NULL
FROM programs p WHERE p.slug = 'unlv-black-fire-innovation'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- AFWERX operates as a military accelerator (connected to NV APEX procurement program)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'a_afwerx', 'pr_' || p.id, 'partners_with',
  'AFWERX at Nellis AFB connects defense startups with government procurement via NV APEX.',
  2018, 'historical', NULL
FROM programs p WHERE p.slug = 'nv-apex-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 4. University hubs → Program relationships
-- ============================================================
-- UNR Innevation Center connects to Nevada SBDC (hosted by UNR)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_innevation', 'pr_' || p.id, 'partners_with',
  'UNR Innevation Center hosts Nevada SBDC programming and business advising.',
  2017, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-sbdc'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- UNLV Tech Park connects to Black Fire Innovation program
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_unlvtech', 'pr_' || p.id, 'partners_with',
  'UNLV Harry Reid Research & Technology Park hosts Black Fire Innovation incubator.',
  2020, 'historical', NULL
FROM programs p WHERE p.slug = 'unlv-black-fire-innovation'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- UNR Innevation Center hosts gener8tor Reno-Tahoe
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_innevation', 'pr_' || p.id, 'partners_with',
  'UNR Innevation Center hosts gener8tor Reno-Tahoe accelerator program.',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'gener8tor-nevada'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 5. Program → Fund deployment relationships
-- ============================================================
-- Battle Born Venture program deploys through BBV fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_bbv', 'funds',
  'Battle Born Venture program deploys SSBCI equity capital through BBV fund ($50M).',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'battle-born-venture'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Fund NV program deploys through FundNV fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_fundnv', 'funds',
  'Fund NV program deploys SSBCI loan participation capital through FundNV ($25M).',
  2022, 'historical', NULL
FROM programs p WHERE p.slug = 'fund-nv'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- StartUpNV Accelerator program connects to FundNV fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_fundnv', 'funds',
  'StartUpNV Accelerator graduates receive FundNV pre-seed investment (min $100K via SSBCI match).',
  2019, 'historical', NULL
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- StartUpNV Accelerator program connects to AngelNV fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_angelnv', 'funds',
  'StartUpNV operates AngelNV annual angel investor bootcamp and pitch competition ($200K+).',
  2019, 'historical', NULL
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- StartUpNV Accelerator program connects to 1864 Fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_1864', 'funds',
  'StartUpNV Accelerator graduates may receive 1864 Fund seed investment.',
  2019, 'historical', NULL
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- FundNV Pre-Seed program deploys through FundNV fund
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'f_fundnv', 'funds',
  'FundNV Pre-Seed program provides up to $50K non-dilutive funding via FundNV.',
  2020, 'historical', NULL
FROM programs p WHERE p.slug = 'fundnv-pre-seed'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 6. Nevada Knowledge Fund → University partnerships
-- ============================================================
-- Knowledge Fund bridges UNR and UNLV research to private sector.
-- Source: GOED Knowledge Fund public records.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'e_innevation', 'partners_with',
  'Nevada Knowledge Fund supports UNR research commercialization through Innevation Center.',
  2016, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-knowledge-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'e_unlvtech', 'partners_with',
  'Nevada Knowledge Fund supports UNLV research commercialization through Tech Park.',
  2016, 'historical', NULL
FROM programs p WHERE p.slug = 'nevada-knowledge-fund'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 7. Nevada Tech Hub → Company relationships (qualifies_for)
-- ============================================================
-- Nevada Tech Hub ($21M CHIPS Act) targets lithium/EV/battery companies.
-- These are verifiable: Redwood Materials (c_1), Ioneer (c_49),
-- Dragonfly Energy (c_50), and Aqua Metals (c_73) are all NV-based
-- companies in the lithium/battery/EV supply chain.
-- Source: EDA Tech Hub designation, GOED press releases.

-- Redwood Materials — battery recycling, Carson City
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_1', 'pr_' || p.id, 'qualifies_for',
  'Redwood Materials (battery recycling) qualifies for Nevada Tech Hub lithium/EV ecosystem.',
  2023, 'opportunity', 0.95
FROM programs p WHERE p.slug = 'goed-nevada-tech-hub'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Ioneer — lithium mining, Rhyolite Ridge
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_49', 'pr_' || p.id, 'qualifies_for',
  'Ioneer (lithium mining, Rhyolite Ridge) qualifies for Nevada Tech Hub lithium ecosystem.',
  2023, 'opportunity', 0.95
FROM programs p WHERE p.slug = 'goed-nevada-tech-hub'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Dragonfly Energy — lithium batteries, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_50', 'pr_' || p.id, 'qualifies_for',
  'Dragonfly Energy (lithium battery mfg) qualifies for Nevada Tech Hub battery technology.',
  2023, 'opportunity', 0.90
FROM programs p WHERE p.slug = 'goed-nevada-tech-hub'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Aqua Metals — battery recycling, Reno
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_73', 'pr_' || p.id, 'qualifies_for',
  'Aqua Metals (lithium battery recycling) qualifies for Nevada Tech Hub recycling ecosystem.',
  2023, 'opportunity', 0.90
FROM programs p WHERE p.slug = 'goed-nevada-tech-hub'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 8. EDAWN / LVGEA → Regional program partnerships
-- ============================================================
-- EDAWN and LVGEA partner with GOED programs for regional economic development.
-- Source: Public records, EDAWN and LVGEA annual reports.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_edawn', 'pr_' || p.id, 'partners_with',
  'EDAWN partners with GOED grants for Northern Nevada economic development.',
  2018, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-grants'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'e_lvgea', 'pr_' || p.id, 'partners_with',
  'LVGEA partners with GOED grants for Southern Nevada economic development.',
  2018, 'historical', NULL
FROM programs p WHERE p.slug = 'goed-grants'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 9. DOE loan program → NV companies (funded_by_program)
-- ============================================================
-- DOE Loan Programs Office has made major loans to NV companies.
-- Source: DOE LPO public announcements.

-- Redwood Materials — $2B DOE loan (2023)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'c_1', 'funded_by_program',
  'DOE SBIR/ARPA-E ecosystem: Redwood Materials received $2B DOE conditional loan commitment.',
  2023, 'historical', NULL
FROM programs p WHERE p.slug = 'doe-sbir-phase-ii'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges
    WHERE source_id = 'x_doe' AND target_id = 'c_1' AND rel = 'funded_by_program'
  )
ON CONFLICT DO NOTHING;

-- Ioneer — $996M DOE loan (2023)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, 'c_49', 'funded_by_program',
  'DOE ecosystem: Ioneer received $996M DOE conditional loan for Rhyolite Ridge.',
  2023, 'historical', NULL
FROM programs p WHERE p.slug = 'doe-sbir-phase-ii'
  AND NOT EXISTS (
    SELECT 1 FROM graph_edges
    WHERE source_id = 'x_doe' AND target_id = 'c_49' AND rel = 'funded_by_program'
  )
ON CONFLICT DO NOTHING;


-- ============================================================
-- 10. Jeff Saling → Program relationships
-- ============================================================
-- Jeff Saling is co-founder of StartUpNV and GP of FundNV.
-- Source: StartUpNV website, public bios.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'p_saling', 'pr_' || p.id, 'administers',
  'Jeff Saling co-founded StartUpNV and manages the accelerator program.',
  2017, 'historical', NULL
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 11. Companies accelerated by programs (qualifies_for historical)
-- ============================================================
-- Companies that went through StartUpNV accelerator qualify for its programs.
-- These are already connected to a_startupnv via accelerated_by edges;
-- we create the program link for companies known to have received FundNV investment.
-- Source: StartUpNV portfolio page, press releases.

-- TensorWave (c_4) — received FundNV investment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_4', 'pr_' || p.id, 'qualifies_for',
  'TensorWave received StartUpNV/FundNV pre-seed investment via accelerator program.',
  2023, 'historical', 0.95
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- MagicDoor (c_14) — StartUpNV portfolio, FundNV investment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_14', 'pr_' || p.id, 'qualifies_for',
  'MagicDoor is StartUpNV portfolio company with FundNV investment.',
  2023, 'historical', 0.95
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- BuildQ (c_63) — AngelNV 2025 winner, FundNV investment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_63', 'pr_' || p.id, 'qualifies_for',
  'BuildQ won AngelNV 2025 pitch competition, received FundNV $200K investment.',
  2025, 'historical', 0.95
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;

-- Cognizer AI (c_25) — FundNV $240K investment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_25', 'pr_' || p.id, 'qualifies_for',
  'Cognizer AI received FundNV $240K investment through StartUpNV program.',
  2023, 'historical', 0.95
FROM programs p WHERE p.slug = 'startupnv-accelerator'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 12. gener8tor Nevada → Company relationships
-- ============================================================
-- Companies that went through gener8tor Las Vegas accelerator.
-- Source: gener8tor portfolio announcements.

-- Dog & Whistle (c_91) — gener8tor Las Vegas 2024, $100K
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'c_91', 'pr_' || p.id, 'qualifies_for',
  'Dog & Whistle accepted into gener8tor Las Vegas accelerator 2024, $100K investment.',
  2024, 'historical', 0.90
FROM programs p WHERE p.slug = 'gener8tor-nevada'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 13. UNLV Black Fire Innovation → Company relationships
-- ============================================================
-- Companies connected to the UNLV Black Fire Innovation incubator.
-- Source: Black Fire Innovation website, UNLV press releases.

-- Zero Labs (a_zerolabs) accelerator is based at Black Fire
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'a_zerolabs', 'pr_' || p.id, 'partners_with',
  'Zero Labs gaming/hospitality accelerator operates in partnership with UNLV Black Fire Innovation.',
  2020, 'historical', NULL
FROM programs p WHERE p.slug = 'unlv-black-fire-innovation'
ON CONFLICT (source_id, target_id, rel) WHERE edge_category IS NOT NULL DO NOTHING;


-- ============================================================
-- 14. BBV program → Companies (funded_by_program for BBV portfolio)
-- ============================================================
-- BBV portfolio companies are funded through the Battle Born Venture program.
-- These are companies where f_bbv invested_in edges already exist.
-- We link the program node to the top verified BBV portfolio companies.
-- Source: BBV portfolio, SSBCI deployment reports.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, ge.target_id, 'funded_by_program',
  'Company funded through Battle Born Venture SSBCI equity program.',
  ge.event_year, 'historical', NULL
FROM programs p
CROSS JOIN graph_edges ge
WHERE p.slug = 'battle-born-venture'
  AND ge.source_id = 'f_bbv'
  AND ge.rel = 'invested_in'
  AND ge.target_id LIKE 'c_%'
ON CONFLICT DO NOTHING;


-- ============================================================
-- 15. FundNV program → Companies (funded_by_program)
-- ============================================================
-- FundNV portfolio companies funded through the Fund NV SSBCI loan program.
-- Source: FundNV portfolio, StartUpNV announcements.

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, edge_category, matching_score)
SELECT 'pr_' || p.id, ge.target_id, 'funded_by_program',
  'Company funded through Fund NV SSBCI loan participation program.',
  ge.event_year, 'historical', NULL
FROM programs p
CROSS JOIN graph_edges ge
WHERE p.slug = 'fund-nv'
  AND ge.source_id = 'f_fundnv'
  AND ge.rel = 'invested_in'
  AND ge.target_id LIKE 'c_%'
ON CONFLICT DO NOTHING;


COMMIT;
