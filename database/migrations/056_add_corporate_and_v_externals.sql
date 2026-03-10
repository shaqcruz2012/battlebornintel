-- Migration 056: Add missing corporate/tech x_ external nodes and v_ grant program nodes
-- to the externals table.
--
-- Source: All x_ IDs present in graph_edges but absent from externals as of 2026-03-09,
-- filtered to corporate entities, tech companies, government agencies, universities,
-- research orgs, grant programs, and other institutional nodes referenced by the graph.
-- Also includes the lone unresolved v_-prefixed company node (vaultgrid-technologies).
--
-- Uses ON CONFLICT DO NOTHING so re-running is safe.

BEGIN;

-- ─── Tech Corporations (specified target list) ────────────────────────────────
-- x_aws, x_google, x_nvidia, x_amd, x_intel, x_samsung, x_blueorigin,
-- x_microsoft, x_amazon, x_apple already exist or are partially covered;
-- the UPPERCASE variants (x_GOOGLE, x_NVIDIA) are distinct rows used by
-- INVENT-era edges and need their own records.

INSERT INTO externals (id, name, entity_type, note) VALUES
  -- Uppercase INVENT / legacy variants (distinct from existing lowercase rows)
  ('x_GOOGLE',            'Google LLC',                          'Corporation',    'INVENT project partner; 150MW geothermal PPA with NV Energy 2026'),
  ('x_NVIDIA',            'NVIDIA Corporation',                  'Corporation',    'NVIDIA Ventures co-investor Series E 2023'),
  ('x_AXON',              'Axon Enterprise',                     'Corporation',    'Axon technology partner; INVENT Series E 2023'),
  ('x_BMW',               'BMW Group',                           'Corporation',    'BMW INVENT project partner UC San Diego 2020'),
  ('x_NISSAN',            'Nissan Motor Company',                'Corporation',    'Nissan EV charging INVENT project 2020'),
  ('x_SDG_E',             'San Diego Gas & Electric',            'Corporation',    'SDG&E power utility INVENT partner 2020'),
  ('x_NVERGY',            'NV Energy (NVergy)',                  'Corporation',    'NV Energy 150MW geothermal PPA with Ormat 2026'),
  ('x_SLB',               'SLB (Schlumberger)',                  'Corporation',    'Schlumberger Enhanced Geothermal partnership 2025'),
  ('x_VOLVO',             'Volvo Cars',                          'Corporation',    'Volvo EV battery recycling partnership California'),
  ('x_ACUREN',            'Acuren Group',                        'Corporation',    'Acuren merged with NV5; $1.7B transaction 2025'),
  ('x_MDU_RESOURCES',     'MDU Resources Group',                 'Corporation',    'MDU parent acquired Bombard Electric 2005'),
  ('x_PENN_ENTERTAINMENT','Penn Entertainment',                  'Corporation',    'Penn Entertainment Hollywood Casino ETG partnership 2023'),
  ('x_VICIP',             'VICI Properties',                     'Corporation',    'VICI Properties $150M preferred equity 2022'),
  ('x_CURALEAF',          'Curaleaf Holdings',                   'Corporation',    'Curaleaf tech Nevada operations 2021'),
  ('x_NUVVE_IPO',         'Nuvve Holding Corp (IPO)',            'Corporation',    'Nuvve NASDAQ NVVE PIPE $18M 2021'),

  -- Microsoft-related nodes (microsoft_climate already exists as x_msft_climate)
  ('x_microsoft_climate', 'Microsoft Climate Innovation Fund',   'Corporation',    'Microsoft Climate Innovation Fund Series A $15M'),
  ('x_m12',               'M12 (Microsoft Ventures)',            'Corporation',    'M12 Microsoft venture arm; Cloudforce Series A $10M 2026'),

  -- Amazon / AWS variants
  ('x_amazon',            'Amazon.com',                          'Corporation',    'Amazon parent entity; supply chain and logistics partnerships'),

  -- Apple
  ('x_apple',             'Apple Inc.',                          'Corporation',    'Apple Inc. consumer tech; referenced in Nevada ecosystem edges'),

  -- NVIDIA Inception accelerator program (distinct from x_NVIDIA investor node)
  ('x_nvidia_inception',  'NVIDIA Inception',                    'Corporation',    'NVIDIA Inception accelerator program; Terbine July 2025'),

  -- Other tech corporations referenced in graph edges
  ('x_volvo',             'Volvo Cars',                          'Corporation',    'Volvo EV battery recycling partnership California'),
  ('x_jabil',             'Jabil Inc.',                          'Corporation',    'Jabil medPOD manufacturing partner 2016'),
  ('x_morimoto',          'Masaharu Morimoto (Iron Chef)',       'Corporation',    'Iron Chef Masaharu Morimoto equity partnership'),
  ('x_premier_inc',       'Premier Inc.',                        'Corporation',    'Premier Inc. group purchasing Nivati partnership 2024'),
  ('x_ucsf_research',     'UCSF Research',                      'Research Org',   'UCSF research collaboration 2023'),
  ('x_roseman',           'Roseman University of Health Sciences','University',    'Roseman University Heligenics wet lab HQ 2023'),
  ('x_c3_partners',       'C3 (Sam Nazarian / sbe)',             'Corporation',    'C3 Sam Nazarian 50/50 robotic kitchen partnership')
ON CONFLICT (id) DO NOTHING;

-- ─── Defense / Aerospace Corporations ────────────────────────────────────────

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_lockheed-martin',      'Lockheed Martin',                  'Corporation',    'Lockheed Martin Advanced Research 25,000 sq ft at UNLV Harry Reid Research & Technology Park Feb 2026'),
  ('x_raytheon-technologies','Raytheon Technologies',            'Corporation',    'Raytheon Technologies Nevada Lab 18,000 sq ft at UNLV Harry Reid Research & Technology Park Feb 2026'),
  ('x_sierra-nevada-corp',   'Sierra Nevada Corporation',        'Corporation',    'UNR autonomous ISR drone systems $4.2M 2-year research agreement Feb 2026'),
  ('x_sierra-nevada-energy', 'Sierra Nevada Energy',             'Corporation',    'DRI NSF climate tech grant — real-time climate data pipeline with geothermal sensor arrays Mar 2026'),
  ('x_abaco-systems-nv',     'Abaco Systems Nevada',             'Corporation',    'UNR Advanced Autonomous Systems Lab partner — ruggedized computing for autonomous ground vehicles Feb 2026'),
  ('x_drs-technologies',     'DRS Technologies Las Vegas',       'Corporation',    'UNR Advanced Autonomous Systems Lab — AI-based target recognition systems Feb 2026'),
  ('x_ibm-research',         'IBM Research',                     'Corporation',    'UNLV $18M Quantum Computing Center co-investment and hardware partnership March 2026'),
  ('x_panasonic-energy',     'Panasonic Energy',                 'Corporation',    'Panasonic Energy R&D 12,000 sq ft at UNLV Harry Reid Research & Technology Park Feb 2026')
ON CONFLICT (id) DO NOTHING;

-- ─── Government Agencies ─────────────────────────────────────────────────────

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_dod',               'US Department of Defense',            'Government',     'Department of Defense MPS sensor contract 2004'),
  ('x_darpa',             'DARPA',                               'Government',     'DARPA sensor technology development contract 2004'),
  ('x_diu',               'Defense Innovation Unit (DIU)',       'Government',     'DIU Unmanned Orbital Outpost space station contract 2020'),
  ('x_army',              'US Army',                             'Government',     'HADES surveillance aircraft contract $991.3M 2024'),
  ('x_usdepartmentofenergy','US Department of Energy',           'Government',     'DOE ATVM loan $996M Ioneer Jan 2025; referenced alongside x_doe'),
  ('x_fda_approval',      'FDA (Approval Node)',                 'Government',     'FDA registration / approval node for Melzi Surgical 2023'),
  ('x_hhs_grant',         'US Dept of Health & Human Services', 'Government',     'HHS grants Vena Vitals 2023'),
  ('x_nv-legislature',    'Nevada State Legislature',            'Government',     'HB 223 Advanced Manufacturing Incentive Package $45M Mar 2026; SB 47 AI Innovation Tax Credit 15% Mar 2026'),
  ('x_nv-sbir-office',    'Nevada SBIR Office',                  'Government',     'InnovateNV Phase 0 spring 2026; SBIR Pitch Day Mar 2026; shared portal with GOED Q3 2026'),
  ('x_goed-nv',           'Nevada GOED',                         'Government',     'Governor''s Office of Economic Development Q1 2026 SBIR Matching Grant $2.1M; Innovation District partner'),
  ('x_nevada_ssbci',      'Nevada SSBCI Program',                'Government',     'Nevada GOED SSBCI Drain Drawer $500K 2024'),
  ('x_lv-econ-dev',       'City of Las Vegas Economic Development','Government',   'Las Vegas Innovation District Phase 2 groundbreaking Mar 2026 — 1.2M sq ft, 4,000 tech jobs by 2029'),
  ('x_reno-innovation',   'City of Reno Innovation Office',      'Government',     '340-acre University Research Park expansion zone Feb 2026 — $12M infrastructure co-investment fund'),
  ('x_nevada-state',      'Nevada State University',             'University',     'NSU $5M endowment Center for Tech Entrepreneurship — 50 student startup grants/year Feb 2026'),
  ('x_city_lv',           'City of Las Vegas',                   'Government',     'City of Las Vegas Heligenics investment 2019'),
  ('x_nsf-icorps-nv',     'NSF I-Corps Nevada',                  'Federal Program','UNLV/UNR co-led NSF I-Corps Nevada Mar 2026 cohort — 12 teams, $50K NSF stipends'),
  ('x_nsf-climate-tech',  'NSF Climate Tech Grant #2601847',     'Federal Program','NSF $12M Climate Tech Grant to Desert Research Institute for atmospheric carbon capture Mar 2026'),
  ('x_dri',               'Desert Research Institute (DRI)',     'Research Org',   'NSF $12M climate tech grant; WaterStart and Sierra Nevada Energy partnerships Mar 2026')
ON CONFLICT (id) DO NOTHING;

-- ─── Universities & Research Institutions ────────────────────────────────────

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_unlv',              'UNLV',                                'University',     'University of Nevada Las Vegas; Harry Reid Research & Technology Park host; NSF I-Corps co-lead; quantum computing center'),
  ('x_unlv_foundation',   'UNLV Foundation',                    'University',     'UNLV Foundation Heligenics investment 2019'),
  ('x_waterstart',        'WaterStart',                          'Research Org',   'DRI NSF climate tech grant — field sensor network integration for water and atmospheric monitoring Mar 2026'),
  ('x_switch-inc',        'Switch Inc.',                         'Corporation',    'Switch Inc. contributed to Nevada State University $5M tech entrepreneurship endowment Feb 2026')
ON CONFLICT (id) DO NOTHING;

-- ─── VC Firms & Investment Vehicles ──────────────────────────────────────────

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_ANDREESSEN',        'Andreessen Horowitz (a16z)',          'VC Firm',        'a16z Growth Fund Series D $170M 2021'),
  ('x_GOFFCAP',           'Goff Capital',                       'PE Firm',        'Goff Capital co-investor; founder John Goff 2023'),
  ('x_JACOBS_PE',         'Jacobs Private Equity',              'PE Firm',        'Jacobs Private Equity $1B investment 2023'),
  ('x_LINSE_CAPITAL',     'Linse Capital',                      'VC Firm',        'Linse Capital Series E lead $230M 2023'),
  ('x_LIQUID_VENTURE',    'Liquid Venture Partners',            'VC Firm',        'Liquid Venture Partners $6M funding 2024'),
  ('x_KDDI',              'KDDI Corporation',                   'Corporation',    'KDDI Japanese telecom investor 2024'),
  ('x_JBA_CONSULTING',    'JBA Consulting',                     'Corporation',    'NV5 acquired JBA Consulting 2020'),
  ('x_acrew',             'Acrew Capital',                      'VC Firm',        'Acrew Capital Seed round AI security 2022'),
  ('x_alchemist',         'Alchemist Accelerator',              'Accelerator',    'Alchemist Accelerator Terbine 2014'),
  ('x_angelnv',           'AngelNV',                            'Angel Program',  'AngelNV SSBCI funding'),
  ('x_angelnv_114',       'AngelNV',                            'Angel Program',  'AngelNV SurgiStream $125K 2022'),
  ('x_animoca',           'Animoca Brands',                     'VC Firm',        'Animoca Brands Seed Round 1/2 $5M 2024'),
  ('x_apg',               'APG Partners',                       'VC Firm',        'APG Partners Access Health Dental investor'),
  ('x_apollo_global_management','Apollo Global Management',     'PE Firm',        'Apollo acquired Everi + IGT Gaming July 2025 $6.3B'),
  ('x_atw_partners',      'ATW Partners',                       'VC Firm',        'ATW Partners Series A/B Kaptyn'),
  ('x_awaresuper',        'Aware Super',                        'PE Firm',        'Aware Super $500M investment 2024'),
  ('x_balderton',         'Balderton Capital',                  'VC Firm',        'Balderton Capital Tilt AI investor 2024'),
  ('x_ballistic_ventures','Ballistic Ventures',                 'VC Firm',        'Ballistic Ventures Seed round $7M 2022'),
  ('x_battlebornventure', 'Battle Born Ventures',               'VC Firm',        'Battle Born Venture Cuts Clothing 2020; HiBear investor 2021'),
  ('x_battlebornventure_107','Battle Born Ventures',            'VC Firm',        'Battle Born Venture Onboarded seed 2022'),
  ('x_bayer_ventures',    'Bayer Ventures',                     'VC Firm',        'Bayer pre-seed lead Elly Health 2020'),
  ('x_black_ambition',    'Black Ambition',                     'Accelerator',    'Black Ambition Nailstry accelerator 2023'),
  ('x_brookfield',        'Brookfield Growth Partners',         'PE Firm',        'Brookfield Growth Partners Series B lead $30M 2019'),
  ('x_builders_vc',       'BuildersVC',                         'VC Firm',        'BuildersVC Series A lead $6.5M 2017'),
  ('x_calibrate_ventures','Calibrate Ventures',                 'VC Firm',        'Calibrate Ventures Talage Series B 2022'),
  ('x_canaan_partners',   'Canaan Partners',                    'VC Firm',        'Canaan Partners Seed/Series A lead $12.6M'),
  ('x_cerberus_ventures', 'Cerberus Ventures',                  'VC Firm',        'Cerberus Ventures Series A lead $22.5M Nov 2025'),
  ('x_cibc_innovation',   'CIBC Innovation Banking',            'VC Firm',        'CIBC Innovation Banking $25M venture debt 2020'),
  ('x_citi',              'Citi Ventures',                      'VC Firm',        'Citi Ventures Series D 2021'),
  ('x_cvs_health_ventures','CVS Health Ventures',              'VC Firm',        'CVS Health Ventures Series D $100M 2023'),
  ('x_desert_forge',      'Desert Forge Ventures',              'VC Firm',        'Desert Forge Ventures 2025'),
  ('x_desert_forge_124',  'Desert Forge Ventures',              'VC Firm',        'Desert Forge Ventures WAVR seed $4M Aug 2025'),
  ('x_dragoneer_investment','Dragoneer Investment Group',       'VC Firm',        'Dragoneer Investment Group Series C lead $100M 2020'),
  ('x_ecosystem_integrity','Ecosystem Integrity Fund',          'VC Firm',        'Ecosystem Integrity Fund Seed/Series A lead'),
  ('x_emergence',         'Emergence Capital',                  'VC Firm',        'Emergence Capital Prosper Tech seed $5M 2025'),
  ('x_emerson',           'Emerson Ventures',                   'VC Firm',        'Emerson Ventures Series C co-lead $30M 2023'),
  ('x_evolution_equity',  'Evolution Equity Partners',          'VC Firm',        'Evolution Equity Series A lead $35M + Series B $60M'),
  ('x_firebrand',         'Firebrand Ventures',                 'VC Firm',        'Firebrand Ventures Nivati Series A lead $4M 2022'),
  ('x_founders_fund',     'Founders Fund',                      'VC Firm',        'Founders Fund Series B AI Foundation 2022'),
  ('x_fundnv',            'FundNV',                             'Angel Program',  'FundNV KnowRisk seed $4.2M 2025; Let''s Rolo $82.5K 2022'),
  ('x_fundnv_108',        'FundNV',                             'Angel Program',  'FundNV Otsy seed 2022'),
  ('x_FUNDNV',            'FundNV',                             'Angel Program',  'FundNV first investment $100K 2025'),
  ('x_gbeta',             'gBETA',                              'Accelerator',    'gBETA program crEATe Good Foods 2022'),
  ('x_gener8tor',         'gener8tor',                          'Accelerator',    'gener8tor accelerator Beloit Kombucha 2023'),
  ('x_gener8tor_109',     'gener8tor',                          'Accelerator',    'gener8tor Reno Phone2 $100K 2022'),
  ('x_gener8tor_accel',   'gener8tor',                          'Accelerator',    'gener8tor Nailstry $105K 2022'),
  ('x_gener8tor_lv',      'gener8tor Las Vegas',                'Accelerator',    'gener8tor Las Vegas Dog & Whistle $100K 2024'),
  ('x_gkcc',              'GKCC LLC',                           'Investment Co',  'GKCC LLC senior secured note $10M 2025'),
  ('x_granite_capital',   'Granite Capital Partners',           'VC Firm',        'Granite Capital Partners Otsy 2023'),
  ('x_grey_collar',       'Grey Collar Ventures',               'VC Firm',        'Grey Collar Ventures seed lead 2023'),
  ('x_gs',                'Goldman Sachs',                      'PE Firm',        'Goldman Sachs Series C $775M 2021'),
  ('x_homegrown_capital', 'Homegrown Capital',                  'VC Firm',        'Homegrown Capital Coco Coders seed $1.75M 2024'),
  ('x_iagcapital',        'IAG Capital',                        'VC Firm',        'IAG Capital Bridge round 2021 Series A'),
  ('x_icon_ventures',     'Icon Ventures',                      'VC Firm',        'Icon Ventures Series C lead $20M 2014'),
  ('x_ifm',               'IFM Investors',                      'PE Firm',        'IFM Investors take-private $11B with DigitalBridge 2022'),
  ('x_jamcocapital',      'JAMCO Capital',                      'VC Firm',        'JAMCO Capital Lucihub Series A $2M 2023'),
  ('x_jmi_equity',        'JMI Equity',                         'VC Firm',        'JMI Equity Vena Series A lead $115M 2019'),
  ('x_keiretsu',          'Keiretsu Forum',                     'Angel Program',  'Keiretsu Forum Melzi Surgical 2024'),
  ('x_lerer',             'Lerer Hippeau',                      'VC Firm',        'Lerer Hippeau Seed co-lead $7.1M 2024'),
  ('x_lifekey',           'LifeKey',                            'Corporation',    'LifeKey acquisition of Let''s Rolo 2024'),
  ('x_medtech_innovator', 'MedTech Innovator',                  'Accelerator',    'MedTech Innovator accelerator program 2023'),
  ('x_merus_capital',     'Merus Capital',                      'VC Firm',        'Merus Capital Talage Series A lead $5M 2020'),
  ('x_mgm_resorts',       'MGM Resorts International',          'Corporation',    'MGM Resorts ~10% stake post-SPAC 2021'),
  ('x_nassau_street',     'Nassau Street Ventures',             'VC Firm',        'Nassau Street Ventures FanUp seed lead $1M 2021'),
  ('x_negev',             'Negev Capital',                      'VC Firm',        'Negev Capital lead psychedelic pharma 2023'),
  ('x_newbean_115',       'Newbean Capital',                    'VC Firm',        'Newbean Capital Taber Innovations 2017'),
  ('x_northwestern_bfa',  'Northwestern Mutual Black Founder Accelerator','Accelerator','Northwestern Mutual Black Founder Accelerator 2022'),
  ('x_okapi_ventures',    'Okapi Venture Capital',              'VC Firm',        'Okapi Venture Capital Seed co-lead $4.5M 2025'),
  ('x_owl_ventures',      'Owl Ventures',                       'VC Firm',        'Owl Ventures Cloudforce Networks Series A $10M'),
  ('x_peak_capital',      'Peak Capital Partners',              'VC Firm',        'Peak Capital Partners Nivati 2022'),
  ('x_pharmstars',        'PharmStars',                         'Accelerator',    'PharmStars accelerator $100K 2024'),
  ('x_plug_and_play',     'Plug and Play Tech Center',          'Accelerator',    'Plug and Play IoT accelerator 2015'),
  ('x_prime_movers_lab',  'Prime Movers Lab',                   'VC Firm',        'Prime Movers Lab Series B lead $200M 2023'),
  ('x_primitiveventures', 'Primitive Ventures',                 'VC Firm',        'Primitive Ventures Seed Round 1/2 $15.5M 2024'),
  ('x_rebel_venture',     'UNLV Rebel Fund',                    'VC Firm',        'UNLV Rebel Fund ZenCentiv seed 2022'),
  ('x_reno_seed',         'Reno Seed Fund',                     'VC Firm',        'Reno Seed Fund DayaMed 2021'),
  ('x_renoseedfund',      'Reno Seed Fund',                     'VC Firm',        'Reno Seed Fund HiBear co-investor 2021'),
  ('x_republic',          'Republic',                           'Crowdfunding',   'Republic crowdfunding GRRRL Sept 2022'),
  ('x_right_side',        'Right Side Capital',                 'VC Firm',        'Right Side Capital CareWear investor 2023'),
  ('x_samaltman',         'Sam Altman',                         'Angel',          'Sam Altman Longshot Space seed investment 2020'),
  ('x_sfc_capital',       'SFC Capital',                        'VC Firm',        'SFC Capital CircleIn investor 2021'),
  ('x_shadow_ventures',   'Shadow Ventures',                    'VC Firm',        'Shadow Ventures Seed co-lead $4.5M 2025'),
  ('x_snap_yellow',       'Snap Yellow Accelerator',            'Accelerator',    'Snap Yellow Accelerator $150K 2021'),
  ('x_spacefund',         'Space Fund',                         'VC Firm',        'Space Fund Longshot Space $1.5M 2020'),
  ('x_spie_challenge',    'SPIE Startup Challenge',             'Accelerator',    'SPIE Startup Challenge CareWear 2023'),
  ('x_startupnv_113',     'StartupNV',                          'Angel Program',  'StartupNV Semi Exact seed $600K 2022'),
  ('x_stationcasino',     'Station Casinos',                    'Corporation',    'Station Casinos GameSTACK partnership 2023'),
  ('x_stellantis_ventures','Stellantis Ventures',               'VC Firm',        'Stellantis Ventures Series B co-investor 2023'),
  ('x_stellar_ventures',  'Stellar Ventures',                   'VC Firm',        'Stellar Ventures Ecoatoms $508K 2023'),
  ('x_techstars',         'Techstars',                          'Accelerator',    'Techstars NYC Winter 2023 ClothesLyne $220K'),
  ('x_techstars_health',  'Techstars Health',                   'Accelerator',    'Techstars Health accelerator Elly Health 2021'),
  ('x_the_bond_fund',     'The Bond Fund',                      'VC Firm',        'The Bond Fund ZenCentiv Series A 2024'),
  ('x_third_prime',       'Third Prime',                        'VC Firm',        'Third Prime Series A co-lead $9.8M June 2019'),
  ('x_timdraper',         'Tim Draper',                         'Angel',          'Tim Draper Longshot Space investor 2020'),
  ('x_tony_hsieh',        'Tony Hsieh / Downtown Project',      'Angel',          'Tony Hsieh Downtown Project Las Vegas 2012'),
  ('x_tru_skye',          'Tru Skye Ventures',                  'VC Firm',        'Tru Skye Ventures FanUp Series 2025'),
  ('x_tvc_capital',       'TVC Capital',                        'VC Firm',        'TVC Capital Series B lead $11.5M Aug 2020'),
  ('x_twobearcapital',    'Two Bear Capital',                   'VC Firm',        'Two Bear Capital Series A lead $26M 2022'),
  ('x_variant',           'Variant Fund',                       'VC Firm',        'Variant Seed Round 2 lead $10.5M 2024'),
  ('x_vegastechfund',     'VegasTechFund',                      'VC Firm',        'VegasTechFund Fandeavor $525K 2012'),
  ('x_vegastechfund_125', 'VegasTechFund',                      'VC Firm',        'VegasTechFund Tony Hsieh Downtown Project 2014'),
  ('x_vista_equity',      'Vista Equity Partners',              'PE Firm',        'Vista Equity Partners Vena Solutions Series C $300M 2021'),
  ('x_warburgpincus',     'Warburg Pincus',                     'PE Firm',        'Warburg Pincus Series D lead $80M 2018'),
  ('x_wavemaker',         'Wavemaker Partners',                 'VC Firm',        'Wavemaker Partners Series B lead $20M Nov 2021'),
  ('x_wellcome_leap',     'Wellcome Leap',                      'Foundation',     'Wellcome Leap Phase 2 clinical trial funding 2023'),
  ('x_yc_health',         'Y Combinator (Health)',              'Accelerator',    'Y Combinator S20 health 2023'),
  ('x_nasateampleap',     'NASA TechLeap Prize',                'Government',     'NASA TechLeap Prize Ecoatoms 2023'),
  ('x_wavr-technologies', 'WAVR Technologies',                  'Corporation',    'DFV led $4M seed round in WAVR Technologies alongside Battle Born Venture'),
  ('x_vena-vitals',       'Vena Vitals',                        'Corporation',    'DFV portfolio company')
ON CONFLICT (id) DO NOTHING;

-- ─── Startup Spinouts (UNLV Demo Day Mar 2026) ────────────────────────────────

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('x_aquagenica',        'AquaGenica',                          'Startup',        'Water purification biotech; UNLV Demo Day spinout Mar 2026'),
  ('x_clearvault',        'ClearVault',                          'Startup',        'Blockchain credentialing; UNLV Demo Day spinout Mar 2026'),
  ('x_desertdrive',       'DesertDrive',                         'Startup',        'Autonomous last-mile logistics; UNLV Demo Day spinout Mar 2026'),
  ('x_heliopath',         'HelioPath',                           'Startup',        'Solar cell efficiency AI; UNLV Demo Day spinout Mar 2026'),
  ('x_lunarbuild',        'LunarBuild',                          'Startup',        '3D-printed construction materials; UNLV Demo Day spinout Mar 2026'),
  ('x_nanoshield-nv',     'NanoShield NV',                       'Startup',        'MEMS biosensors; UNLV Demo Day spinout Mar 2026'),
  ('x_nevadamed',         'NevadaMed',                           'Startup',        'Telemedicine platform; UNLV Demo Day spinout Mar 2026'),
  ('x_packbot-ai',        'PackBot AI',                          'Startup',        'Warehouse robotics; UNLV Demo Day spinout Mar 2026'),
  ('x_artemis-ag',        'ArtemisAg',                           'Startup',        'Precision irrigation AI; spun out of UNR College of Engineering Feb 2026'),
  ('x_quantumedge-nv',    'QuantumEdge NV',                      'Startup',        'Photonic computing; spun out of UNR College of Engineering Feb 2026'),
  ('x_titanshield',       'TitanShield',                         'Startup',        'Autonomous structural inspection; spun out of UNR College of Engineering Feb 2026'),
  ('x_bionvate',          'BioNVate Therapeutics',               'Startup',        'BioNVate Therapeutics 8,000 sq ft at UNLV Harry Reid Research & Technology Park Feb 2026')
ON CONFLICT (id) DO NOTHING;

-- ─── v_ Grant Program / Company Nodes ────────────────────────────────────────
-- The v_ prefix query returned one unresolved company node (vaultgrid-technologies).
-- Standard v_ grant program IDs (v_sbir, v_sba, v_nih, v_sttr) are not present in
-- graph_edges so they are included here as dormant reference records for future edges.

INSERT INTO externals (id, name, entity_type, note) VALUES
  ('vaultgrid-technologies','VaultGrid Technologies',            'Corporation',    'Company referenced in graph_edges with v_-style ID; Nevada tech ecosystem'),
  ('v_sbir',              'SBIR Grant Program',                  'Federal Program','Small Business Innovation Research federal grant program'),
  ('v_sba',               'SBA Loan Program',                    'Federal Program','Small Business Administration loan program'),
  ('v_nih',               'NIH Grant Program',                   'Federal Program','National Institutes of Health research grant program'),
  ('v_sttr',              'STTR Grant Program',                  'Federal Program','Small Business Technology Transfer federal grant program')
ON CONFLICT (id) DO NOTHING;

COMMIT;
