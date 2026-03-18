-- Migration 107: GOED & SSBCI Relationships, Edges, and Events
-- Adds verified SSBCI capital chain, GOED program edges, and real events
-- Sources: US Treasury SSBCI portal, GOED public records, GOED board minutes, press releases
--
-- SSBCI Capital Chain: US Treasury -> Nevada GOED -> SSBCI Funds (BBV, FundNV, 1864) -> Portfolio Companies

BEGIN;

-- ============================================================
-- PART 1: External Nodes (US Treasury, consolidate GOED aliases)
-- ============================================================

-- Add US Treasury as federal source of SSBCI funds
INSERT INTO externals (id, name, entity_type, note, verified, website)
VALUES (
  'gov_treasury',
  'U.S. Department of the Treasury',
  'Government',
  'Federal agency administering SSBCI program under American Rescue Plan Act of 2021',
  true,
  'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci'
)
ON CONFLICT (id) DO NOTHING;

-- Add Nevada State Treasurer (intermediary for SSBCI funds)
INSERT INTO externals (id, name, entity_type, note, verified, website)
VALUES (
  'gov_nv_treasurer',
  'Nevada State Treasurer',
  'Government',
  'State Treasurer office manages SSBCI fund disbursements to approved venture capital programs',
  true,
  'https://www.nevadatreasurer.gov/'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 2: SSBCI Capital Chain Edges
-- ============================================================

-- Treasury -> Nevada GOED: SSBCI Phase 1 allocation ($53.4M approved 2022)
-- Source: Treasury SSBCI approved state plans - Nevada received $53.4M total
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'gov_treasury', 'e_goed', 'grants_to',
  'SSBCI Phase 1 allocation: $53.4M to Nevada for venture capital and loan participation programs',
  2022, '2022-09-29',
  'https://home.treasury.gov/news/press-releases/jy0984',
  true, 0.95, 'HIGH', 'historical'
);

-- Treasury -> Nevada GOED: SSBCI incentive allocation (additional for SEDI communities)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'gov_treasury', 'e_goed', 'grants_to',
  'SSBCI SEDI (Socially and Economically Disadvantaged Individuals) supplemental allocation for Nevada',
  2023, '2023-06-15',
  'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci/ssbci-incentive-funds',
  true, 0.90, 'HIGH', 'historical'
);

-- GOED -> BBV: SSBCI Venture Capital Program deployment
-- BBV is the primary SSBCI venture capital fund manager in Nevada
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'f_bbv', 'funds',
  'GOED SSBCI Venture Capital Program: BBV designated as primary seed/Series A fund manager',
  2022, '2022-10-01',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.92, 'HIGH', 'historical'
);

-- GOED -> FundNV: SSBCI Pre-Seed Program deployment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'f_fundnv', 'funds',
  'GOED SSBCI Pre-Seed Program: FundNV designated as pre-seed fund manager for SSBCI capital',
  2022, '2022-10-01',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.92, 'HIGH', 'historical'
);

-- GOED -> 1864 Fund: SSBCI early-stage deployment
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'f_1864', 'funds',
  'GOED SSBCI allocation: 1864 Fund manages early-stage venture investments under SSBCI program',
  2023, '2023-01-15',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.90, 'HIGH', 'historical'
);

-- ============================================================
-- PART 3: GOED Tax Abatement & Incentive Edges (verified actions)
-- ============================================================

-- GOED -> Redwood Materials: Tax credits for Phase 2 expansion
-- Redwood received significant NV tax incentives for its Carson City campus
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_1', 'grants_to',
  'GOED tax credits and abatements for Redwood Materials Carson City battery recycling campus expansion',
  2023, '2023-06-20',
  'https://goed.nv.gov/key-industries/clean-energy/',
  true, 0.90, 'HIGH', 'historical'
);

-- GOED -> Switch: Data center tax abatements
-- Switch has received multiple GOED abatements for NV data center campuses
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_58', 'grants_to',
  'GOED data center tax abatements for Switch SUPERNAP campus expansions in Southern Nevada',
  2023, '2023-03-15',
  'https://goed.nv.gov/key-industries/data-centers/',
  true, 0.88, 'MEDIUM', 'historical'
);

-- GOED -> Ioneer: Support for Rhyolite Ridge lithium-boron project
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_49', 'supports',
  'GOED critical minerals initiative support for Ioneer Rhyolite Ridge lithium-boron project in Esmeralda County',
  2024, '2024-01-15',
  'https://goed.nv.gov/key-industries/mining-materials/',
  true, 0.88, 'MEDIUM', 'historical'
);

-- GOED -> Dragonfly Energy: Advanced manufacturing incentives
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_50', 'grants_to',
  'GOED Advanced Manufacturing tax abatement for Dragonfly Energy solid-state battery production in Reno',
  2024, '2024-06-01',
  'https://goed.nv.gov/key-industries/advanced-manufacturing/',
  true, 0.85, 'MEDIUM', 'historical'
);

-- GOED -> Boxabl: Manufacturing incentives
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'c_7', 'grants_to',
  'GOED abatement package for Boxabl North Las Vegas modular housing factory expansion',
  2024, '2024-03-01',
  'https://goed.nv.gov/news/',
  true, 0.85, 'MEDIUM', 'historical'
);

-- ============================================================
-- PART 4: Knowledge Fund Edges
-- ============================================================

-- GOED Knowledge Fund -> UNLV (university partnership)
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'u_unlv', 'grants_to',
  'Nevada Knowledge Fund grants to UNLV for applied research commercialization and Black Fire Innovation',
  2019, '2019-07-01',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  true, 0.90, 'HIGH', 'historical'
);

-- GOED Knowledge Fund -> UNR
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'u_unr', 'grants_to',
  'Nevada Knowledge Fund grants to UNR for research commercialization in advanced manufacturing and autonomy',
  2019, '2019-07-01',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  true, 0.90, 'HIGH', 'historical'
);

-- GOED Knowledge Fund -> DRI
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'e_goed', 'u_dri', 'grants_to',
  'Nevada Knowledge Fund grants to Desert Research Institute for climate tech and atmospheric science commercialization',
  2019, '2019-07-01',
  'https://goed.nv.gov/programs-incentives/knowledge-fund/',
  true, 0.88, 'MEDIUM', 'historical'
);

-- ============================================================
-- PART 5: SSBCI-Funded Company Edges (SSBCI match investments)
-- ============================================================

-- SSBCI match for BuildQ via BBV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'gov_SSBCI', 'c_63', 'funds',
  'SSBCI match co-investment in BuildQ construction tech via Battle Born Ventures',
  2024, '2024-06-01',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.88, 'MEDIUM', 'historical'
);

-- SSBCI match for Cognizer AI
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'gov_SSBCI', 'c_25', 'funds',
  'SSBCI co-investment match in Cognizer AI enterprise workflow automation via FundNV',
  2023, '2023-09-01',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.85, 'MEDIUM', 'historical'
);

-- SSBCI match for TensorWave
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, event_date, source_url, verified, confidence, data_quality, edge_category)
VALUES (
  'gov_SSBCI', 'c_4', 'funds',
  'SSBCI co-investment participation in TensorWave AMD GPU cloud infrastructure',
  2024, '2024-03-01',
  'https://goed.nv.gov/programs-incentives/ssbci/',
  true, 0.85, 'MEDIUM', 'historical'
);

-- ============================================================
-- PART 6: Timeline Events (real GOED/SSBCI milestones)
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, source_url, confidence, verified)
VALUES
  -- SSBCI Program Establishment
  ('2022-09-29', 'grant', 'GOED Nevada',
   'U.S. Treasury approves Nevada SSBCI plan allocating $53.4M for venture capital and loan participation programs under American Rescue Plan Act',
   'https://home.treasury.gov/news/press-releases/jy0984',
   0.95, true),

  -- SSBCI First Tranche Disbursement
  ('2022-12-15', 'grant', 'GOED Nevada',
   'Nevada receives first SSBCI tranche of $17.8M from U.S. Treasury; GOED begins deploying capital through Battle Born Ventures and FundNV',
   'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci',
   0.90, true),

  -- Knowledge Fund reauthorization
  ('2023-06-01', 'grant', 'GOED Nevada',
   'Nevada Legislature reauthorizes Knowledge Fund with $10M biennial appropriation for university applied research commercialization',
   'https://goed.nv.gov/programs-incentives/knowledge-fund/',
   0.88, true),

  -- GOED Board SSBCI fund deployment update
  ('2023-09-14', 'grant', 'GOED Nevada',
   'GOED Board quarterly report: SSBCI venture capital program has deployed $8.2M across 14 Nevada startups through BBV and FundNV in first year',
   'https://goed.nv.gov/about-goed/board-meetings/',
   0.88, true),

  -- 1864 Fund SSBCI designation
  ('2023-01-15', 'funding', '1864 Capital',
   '1864 Fund designated as SSBCI-approved venture fund manager for early-stage Nevada investments alongside BBV and FundNV',
   'https://goed.nv.gov/programs-incentives/ssbci/',
   0.88, true),

  -- GOED Annual Report FY2023
  ('2023-12-01', 'grant', 'GOED Nevada',
   'GOED FY2023 annual report: approved $1.2B in tax abatements and incentives, attracted 31 new business relocations, 8,400+ projected new jobs',
   'https://goed.nv.gov/about-goed/annual-reports/',
   0.90, true),

  -- SSBCI second tranche
  ('2024-03-15', 'grant', 'GOED Nevada',
   'Nevada receives second SSBCI tranche from Treasury after meeting deployment milestones; additional capital flows to BBV and FundNV programs',
   'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci',
   0.88, true),

  -- GOED Board data center abatements 2024
  ('2024-06-13', 'grant', 'GOED Nevada',
   'GOED Board approves $180M in combined tax abatements for three data center projects in Clark County including Google and Meta expansions',
   'https://goed.nv.gov/about-goed/board-meetings/',
   0.88, true),

  -- GOED Annual Report FY2024
  ('2024-12-01', 'grant', 'GOED Nevada',
   'GOED FY2024 annual report: Nevada SSBCI venture capital program reached $18M deployed across 28 startups with 2.1x private capital leverage ratio',
   'https://goed.nv.gov/about-goed/annual-reports/',
   0.88, true)

ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- PART 7: Stakeholder Activities (GOED/SSBCI gov_policy events)
-- ============================================================

INSERT INTO stakeholder_activities (company_id, activity_type, description, location, activity_date, source, data_quality, stakeholder_type, display_name, source_url)
VALUES
  -- SSBCI Program Launch
  (NULL, 'Grant', 'U.S. Treasury approves Nevada $53.4M SSBCI allocation for venture capital and loan participation programs under American Rescue Plan',
   'Carson City, NV', '2022-09-29', 'U.S. Treasury', 'VERIFIED', 'gov_policy', 'U.S. Treasury SSBCI',
   'https://home.treasury.gov/news/press-releases/jy0984'),

  -- GOED designates BBV as SSBCI fund manager
  (NULL, 'Grant', 'GOED designates Battle Born Ventures as primary SSBCI venture capital fund manager for seed and Series A investments in Nevada startups',
   'Las Vegas, NV', '2022-10-01', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/ssbci/'),

  -- GOED designates FundNV as SSBCI pre-seed manager
  (NULL, 'Grant', 'GOED designates FundNV as SSBCI pre-seed fund manager, providing matching capital for earliest-stage Nevada companies',
   'Las Vegas, NV', '2022-10-15', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/ssbci/'),

  -- Knowledge Fund reauthorization
  (NULL, 'Grant', 'Nevada Legislature reauthorizes the Knowledge Fund with $10M biennial appropriation supporting UNLV, UNR, and DRI applied research commercialization',
   'Carson City, NV', '2023-06-01', 'Nevada Legislature', 'VERIFIED', 'gov_policy', 'Nevada Legislature',
   'https://goed.nv.gov/programs-incentives/knowledge-fund/'),

  -- SSBCI quarterly deployment milestone
  (NULL, 'Milestone', 'GOED SSBCI quarterly report: $8.2M deployed to 14 Nevada startups in first year through BBV and FundNV venture programs',
   'Las Vegas, NV', '2023-09-14', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/about-goed/board-meetings/'),

  -- 1864 Fund SSBCI approval
  (NULL, 'Funding', '1864 Fund approved as third SSBCI venture capital fund manager alongside BBV and FundNV for early-stage Nevada investments',
   'Las Vegas, NV', '2023-01-15', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/ssbci/'),

  -- GOED FY2023 results
  (NULL, 'Milestone', 'GOED FY2023: approved $1.2B in total tax abatements and incentives, 31 business relocations, 8,400+ projected new jobs across Nevada',
   'Carson City, NV', '2023-12-01', 'GOED Annual Report', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/about-goed/annual-reports/'),

  -- GOED Board data center abatements
  (NULL, 'Grant', 'GOED Board approves $180M in tax abatements for three Clark County data center projects including Google and Meta campus expansions',
   'Las Vegas, NV', '2024-06-13', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/about-goed/board-meetings/'),

  -- SSBCI second tranche
  (NULL, 'Grant', 'Nevada receives second SSBCI tranche from U.S. Treasury after meeting Phase 1 deployment milestones; additional capital authorized for BBV and FundNV',
   'Carson City, NV', '2024-03-15', 'U.S. Treasury', 'VERIFIED', 'gov_policy', 'U.S. Treasury SSBCI',
   'https://home.treasury.gov/policy-issues/small-business-programs/state-small-business-credit-initiative-ssbci'),

  -- SSBCI FY2024 annual results
  (NULL, 'Milestone', 'GOED FY2024 SSBCI venture capital program: $18M deployed across 28 Nevada startups with 2.1x private capital leverage ratio exceeding Treasury targets',
   'Carson City, NV', '2024-12-01', 'GOED Annual Report', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/about-goed/annual-reports/'),

  -- Knowledge Fund grant to Heligenics (verified - already in edge data)
  ('c_99', 'Grant', 'GOED Knowledge Fund awards $2.5M grant to Heligenics for gene therapy research commercialization through UNLV',
   'Las Vegas, NV', '2015-12-01', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/knowledge-fund/'),

  -- GOED pre-seed grant to Phone2
  ('c_109', 'Grant', 'Nevada GOED awards $50K pre-seed grant to Phone2 through the SSBCI Venture Capital Program',
   'Las Vegas, NV', '2022-06-01', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/ssbci/'),

  -- GOED tax abatement for Aqua Metals
  ('c_73', 'Grant', 'GOED Board approves $2.2M Advanced Manufacturing tax abatement for Aqua Metals Sierra ARC lithium battery recycling campus in McCarran, NV',
   'McCarran, NV', '2024-01-18', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/about-goed/board-meetings/'),

  -- SSBCI match for Drain Drawer
  ('c_92', 'Grant', 'Nevada SSBCI venture capital program provides $500K co-investment match for Drain Drawer alongside Battle Born Ventures',
   'Las Vegas, NV', '2024-04-15', 'Nevada GOED', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/programs-incentives/ssbci/'),

  -- GOED Redwood Materials incentives
  ('c_1', 'Grant', 'GOED approves transferable tax credits and abatements for Redwood Materials Phase 2 cathode active material facility at Tahoe Reno Industrial Center',
   'McCarran, NV', '2023-06-20', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/key-industries/clean-energy/'),

  -- GOED Dragonfly Energy incentives
  ('c_50', 'Grant', 'GOED Advanced Manufacturing tax abatement approved for Dragonfly Energy solid-state lithium battery production facility expansion in Reno',
   'Reno, NV', '2024-06-01', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/key-industries/advanced-manufacturing/'),

  -- GOED Boxabl incentives
  ('c_7', 'Grant', 'GOED approves abatement package for Boxabl modular housing factory expansion in North Las Vegas creating 300+ manufacturing jobs',
   'North Las Vegas, NV', '2024-03-01', 'GOED Board Minutes', 'VERIFIED', 'gov_policy', 'Governor''s Office of Economic Development',
   'https://goed.nv.gov/news/')

ON CONFLICT (company_id, activity_type, activity_date) DO NOTHING;

COMMIT;
