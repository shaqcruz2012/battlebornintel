-- Migration 046: Ingest BBV Portfolio Edges — Companies 76–81, 94–99, 100–105
-- Source files: edge-research-c76-c81.json, bbv-94-99-edges.json,
--               bbv_portfolio_edges_100_105.json
--
-- Covers:
--   1. Insert new external nodes that appear in the edge data but do not yet
--      exist in the externals table (investors, corporations, universities,
--      government agencies, special programs).
--   2. INSERT … ON CONFLICT DO NOTHING edges into graph_edges for all three
--      batches (c_76–c_81, c_94–c_99, c_100–c_105).
--   3. Verification count at the end.
--
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/046_ingest_bbv_portfolio_edges.sql

BEGIN;

-- ============================================================
-- SECTION 1: New external nodes required by edge data
-- ============================================================
-- Externals that already exist in the graph (confirmed from graph-entities.js):
--   x_caesars, x_mgm, x_unr, x_usaf, x_doe, x_nasa, e_goed, e_innevation,
--   f_bbv, f_fundnv, a_gener8tor_lv, a_techstars, a_gener8tor (see below)
--
-- Note on externals.id: the table uses VARCHAR(40) primary key (the slug-style id).
-- New nodes inserted here use the same x_/i_/u_/v_ naming scheme as the graph.
-- We insert into the externals table using the slug as PK so they are
-- queryable from the graph layer; entity_type follows the existing taxonomy.

-- 1a. Investors (i_ prefix) ─ new nodes from all three batches
INSERT INTO externals (id, name, entity_type, note)
VALUES
  -- c_76 / c_81 batch
  ('i_apg_partners',       'APG Partners',                'VC Firm',      'Healthcare DSO investor. Led by Andy Graham, 30+ yrs PE experience.'),
  ('i_grey_collar_ventures','Grey Collar Ventures',       'VC Firm',      'Led $800K seed round for Beloit Kombucha Aug 2023.'),

  -- c_77 batch
  ('i_angelnv',            'AngelNV',                     'Angel Program', 'Nevada statewide angel investor program; $400K award to Adaract 2023.'),
  ('i_h7_biocapital',      'H7 BioCapital',               'VC Firm',      'Healthcare / biotech early-stage investor. Adaract seed.'),

  -- c_78 batch
  ('i_founders_fund',      'Founders Fund',               'VC Firm',      'Peter Thiel flagship fund. Co-led AI Foundation Series B $17M 2020.'),
  ('i_brandtech_group',    'Brandtech Group',              'Corporation',  'Led AI Foundation Series B $17M. Global digital marketing group.'),
  ('i_alpha_edison',       'Alpha Edison',                 'VC Firm',      'Series B co-lead AI Foundation. Consumer tech focus.'),
  ('i_you_and_mr_jones',   'You & Mr Jones',               'VC Firm',      'Founder-backed martech investor. AI Foundation 2019.'),
  ('i_endeavor',           'Endeavor',                     'Corporation',  'Talent / entertainment company. AI Foundation investor 2019.'),
  ('i_biz_stone',          'Biz Stone',                    'Angel',        'Twitter co-founder angel investor. AI Foundation 2019.'),

  -- c_79 batch
  ('i_sosv',               'SOSV',                         'VC Firm',      'Deep tech multi-stage VC. Strategic investor AIR Corp Jan 2026.'),

  -- c_81 batch
  ('a_gener8tor',          'gener8tor',                    'VC Firm',      'Milwaukee-based accelerator / VC. Investor in Beloit Kombucha seed 2023.'),

  -- c_94 batch
  ('i_pharmstars',         'PharmStars',                   'VC Firm',      'Healthcare-focused investor. Elly Health Seed Round IV 2023.'),
  ('i_plug_play',          'Plug and Play Alberta',        'VC Firm',      'Corporate innovation platform. Elly Health investor 2023.'),
  ('i_yellow',             'Yellow',                       'VC Firm',      'Venture investor. Elly Health Seed Round IV 2023.'),
  ('i_launch_fund',        'LAUNCH Fund',                  'VC Firm',      'Jason Calacanis LAUNCH Fund. Healthcare investor. Elly Health 2023.'),
  ('i_ms_ventures',        'Morgan Stanley Inclusive Ventures Lab', 'Corporation', 'MS inclusive ventures program. Elly Health investor 2023.'),

  -- c_95 batch
  ('i_base_ventures',      'Base Ventures',                'VC Firm',      'Early investor in Fandeavor seed 2013.'),
  ('i_vtf_capital',        'VTF Capital (Vegas Tech Fund)', 'VC Firm',     'Tony Hsieh Downtown Project venture arm. Fandeavor seed 2014.'),
  ('i_capital_factory',    'Capital Factory',              'VC Firm',      'Austin-based accelerator/fund. Fandeavor co-investor 2015.'),

  -- c_96 batch
  ('i_alumni_ventures',    'Alumni Ventures Group',        'VC Firm',      'Nassau Street Ventures fund. Led FanUp seed $1.5M Oct 2020.'),
  ('i_ozone_ventures',     'Ozone Ventures',               'VC Firm',      'O3 World VC arm. FanUp seed co-investor 2020.'),
  ('i_value_asset_mgmt',   'Value Asset Management',       'VC Firm',      'FanUp seed co-investor 2020.'),
  ('i_reno_seed_fund',     'Reno Seed Fund',               'VC Firm',      'Nevada-based early stage fund. FanUp seed 2020.'),
  ('i_accomplice_vc',      'Accomplice VC',                'VC Firm',      'Backed by DraftKings and Skillz founders. Led FanUp Seed II $4M 2021.'),
  ('i_john_albright',      'John Albright',                'Angel',        'Co-founder Relay Ventures, lead investor in The Score. FanUp Seed II 2021.'),
  ('i_ruttenberg_gordon',  'Ruttenberg Gordon Investments','VC Firm',      'FanUp Seed II co-investor 2021.'),
  ('i_carpenter_family',   'The Carpenter Family',         'Family Office', 'Former Philadelphia Phillies owners. FanUp Seed II 2021.'),

  -- c_97 batch
  ('i_elevate_ventures',   'Elevate Ventures',             'VC Firm',      'Indiana early-stage investor. $20K Community Ideation Fund to Grantcycle 2020.'),

  -- c_98 batch
  ('i_republic',           'Republic',                     'Crowdfunding', 'Online investment platform. GRRRL crowdfunding campaign closed Sept 2022.'),

  -- c_99 batch
  ('i_city_of_las_vegas',  'City of Las Vegas',            'Government',   'Invested in Heligenics 2016.'),
  ('i_unlv_foundation',    'UNLV Foundation',              'University',   'Invested in Heligenics 2016.'),

  -- c_100 batch
  ('i_sequoia',            'Sequoia Capital',              'VC Firm',      'Led AttributeFlow Series A $8.5M 2024.'),
  ('i_greylock',           'Greylock Partners',            'VC Firm',      'AttributeFlow Series A co-lead; AutomateLedger seed.'),
  ('i_boldstart',          'Boldstart Ventures',           'VC Firm',      'Seed investor AttributeFlow $1.2M 2023; AuraData seed $900K 2023.'),
  ('i_techcrunch',         'TechCrunch Disrupt Syndicate', 'Angel',        'TechCrunch Disrupt winner 2023. AttributeFlow pre-seed.'),
  ('i_menlo',              'Menlo Ventures',               'VC Firm',      'AttributeFlow Series A participant $2M 2024.'),

  -- c_101 batch
  ('i_bvp',                'Bessemer Venture Partners',    'VC Firm',      'Led AuditSpace Pro Series A $6.2M 2024; AuraData Series A $7.8M 2024.'),
  ('i_sigma',              'Sigma Partners',               'VC Firm',      'AuditSpace Pro Series A co-lead 2024.'),
  ('i_emergence',          'Emergence Capital',            'VC Firm',      'AuditSpace Pro seed $800K 2023.'),
  ('i_insight',            'Insight Partners',             'VC Firm',      'AuditSpace Pro Series A co-investor 2024.'),

  -- c_102 batch
  ('i_bessemer',           'Bessemer Venture Partners',    'VC Firm',      'Alias for i_bvp — led AuraData Systems Series A $7.8M 2024.'),
  ('i_redpoint',           'Redpoint Ventures',            'VC Firm',      'AuraData Systems Series A co-lead 2024.'),
  ('i_craft',              'Craft Ventures',               'VC Firm',      'AuraData Systems Series A participant $1.8M 2024.'),

  -- c_103 batch
  ('i_flagship',           'Flagship Pioneering',          'VC Firm',      'Led AuroraAI Series A $9.5M 2024. Healthcare AI specialist.'),
  ('i_khosla',             'Khosla Ventures',              'VC Firm',      'AuroraAI Series A co-lead $3M 2024.'),
  ('i_canaan',             'Canaan Partners',              'VC Firm',      'AuroraAI seed $1.5M 2023.'),
  ('i_founders',           'Founders Fund',                'VC Firm',      'AuroraAI Series A co-investor $2.5M 2024. Alias of i_founders_fund.'),

  -- c_104 batch
  ('i_lerer',              'Lerer Hippeau',                'VC Firm',      'Led AuthentiPay Seed $2.5M 2023. Fintech security focus.'),
  ('i_fx_capital',         'FX Capital',                   'VC Firm',      'Co-led AuthentiPay Seed $1.5M 2023.'),
  ('i_angel_fintech',      'Angel Fintech Syndicate',      'Angel',        'AuthentiPay pre-seed $800K 2022.'),
  ('i_commerce_v',         'Commerce Ventures',            'VC Firm',      'AuthentiPay seed participant $1M 2023.'),

  -- c_105 batch
  ('i_lsvp',               'Lightspeed Venture Partners',  'VC Firm',      'Led AutomateLedger Series A $5.8M 2024.'),
  ('i_accel',              'Accel',                        'VC Firm',      'AutomateLedger Series A co-lead 2024.'),
  ('i_openview',           'OpenView Venture Partners',    'VC Firm',      'AutomateLedger Series A co-investor $2M 2024.')
ON CONFLICT (id) DO NOTHING;

-- 1b. University nodes (u_ prefix) ─ new nodes
INSERT INTO externals (id, name, entity_type, note)
VALUES
  ('u_indiana_univ',       'Indiana University',           'University',   'Bloomington, Indiana. Grantcycle/Atlas Solutions regional ecosystem.'),
  ('u_unlv',               'UNLV',                         'University',   'University of Nevada Las Vegas. Heligenics spinoff parent institution.'),
  ('u_nipm',               'Nevada Institute of Personalized Medicine', 'University', 'NIPM at UNLV. Commercializing GigaAssay gene screening tech. Dir: Dr. Martin Schiller.'),
  ('u_roseman_univ',       'Roseman University',           'University',   'Summerlin campus 70K sq ft lab space. Heligenics wet lab operations.'),
  ('u_cedars_sinai',       'Cedars-Sinai Health System',   'University',   'Clinical partnership with Elly Health. Cancer patient mental health research 2023.'),
  ('u_stanford_cs',        'Stanford CS Department',       'University',   'Identity resolution algorithm licensing. AttributeFlow R&D collaboration 2023.'),
  ('u_berkeley_eecs',      'UC Berkeley EECS',             'University',   'Talent pipeline. 3 AttributeFlow founding team from EECS 2022.'),
  ('u_wharton',            'Wharton School',               'University',   'AuditSpace Pro accounting research collaboration 2023.'),
  ('u_emory_goizueta',     'Emory Goizueta Business School','University',  'AuditSpace Pro internship partnership 2024.'),
  ('u_mit_csail',          'MIT CSAIL',                    'University',   'AuraData AI data quality research. CSAIL algorithm licensing 2023.'),
  ('u_cmu_db',             'CMU Database Group',           'University',   'AuraData database systems research partnership 2023.'),
  ('u_stanford_med',       'Stanford School of Medicine',  'University',   'AuroraAI clinical validation. 2 founding doctors from Stanford Radiology 2023.'),
  ('u_ucsf_radiology',     'UCSF Radiology',               'University',   'AuroraAI diagnostic AI research collaboration 2023.'),
  ('u_johns_hopkins_med',  'Johns Hopkins Medicine',       'University',   'AuroraAI clinical validation partner. Radiology dept testing 2024.'),
  ('u_carnegie_cs',        'Carnegie Mellon CS',           'University',   'AuthentiPay cryptography research partnership 2023.'),
  ('u_columbia_finance',   'Columbia Business School',     'University',   'AuthentiPay payment security research 2023.'),
  ('u_wharton_accounting', 'Wharton Accounting',           'University',   'AutomateLedger MBA accounting course case studies 2023.'),
  ('u_michigan_ross',      'Michigan Ross School of Business','University', 'AutomateLedger finance automation research + internships 2023.'),
  ('u_nyu_stern',          'NYU Stern School of Business', 'University',   'AutomateLedger fintech/accounting curriculum integration 2024.')
ON CONFLICT (id) DO NOTHING;

-- 1c. Corporate / strategic external nodes (x_ prefix) ─ new nodes
INSERT INTO externals (id, name, entity_type, note)
VALUES
  ('x_parlay6',            'Parlay 6 Brewing',             'Corporation',  'Reno craft brewery. Strategic partnership with Battle Born Beer 2025. Permanent home at The Par.'),
  ('x_kerry',              'Kerry Ingredients',            'Corporation',  'Exclusive BC30 probiotic supplier for Beloit Kombucha powdered formula.'),
  ('x_ticketcity',         'TicketCity',                   'Corporation',  'Acquired Fandeavor May 2019.'),
  ('x_draftkings',         'DraftKings',                   'Corporation',  'DFS/sports betting. FanUp backed by DraftKings founding investors via Accomplice VC.'),
  ('x_skillz',             'Skillz',                       'Corporation',  'Mobile esports platform. FanUp backed by Skillz founding investors via Accomplice VC.'),
  ('x_the_score',          'The Score',                    'Corporation',  'Sports media. John Albright was lead investor. FanUp backed by Score founders.'),
  ('x_fanatics',           'Fanatics',                     'Corporation',  'Sports merchandise/gaming. Brand partnership with FanUp 2021.'),
  ('x_peloton',            'Peloton',                      'Corporation',  'Connected fitness. Brand partnership with FanUp 2021.'),
  ('x_nike',               'Nike',                         'Corporation',  'Athletic brand. Partnership with FanUp 2021.'),
  ('x_salesforce_v',       'Salesforce Ventures',          'Corporation',  'Strategic investor AttributeFlow Series A $1.5M 2024. CRM integration.'),
  ('x_segment',            'Segment (Twilio)',              'Corporation',  'CDP platform. AttributeFlow identity resolution integration 2024.'),
  ('x_okta',               'Okta',                         'Corporation',  'Identity platform. Joint go-to-market with AttributeFlow 2024.'),
  ('x_databricks',         'Databricks',                   'Corporation',  'Data lakehouse. AttributeFlow + AuraData integration partner 2024.'),
  ('x_deloitte_v',         'Deloitte Ventures',            'Corporation',  'Strategic corporate investor AuditSpace Pro Series A $1.5M 2024.'),
  ('x_pwc',                'PricewaterhouseCoopers',       'Corporation',  'AuditSpace Pro pilot partner 2024. Audit workflow automation evaluation.'),
  ('x_ey',                 'Ernst & Young',                'Corporation',  'AuditSpace Pro technology evaluation partner 2024.'),
  ('x_kpmg',               'KPMG',                         'Corporation',  'AuditSpace Pro early adopter beta program 2023.'),
  ('x_workiva',            'Workiva',                      'Corporation',  'ESG/Audit platform. AuditSpace Pro integration 2024.'),
  ('x_snowflake_v',        'Snowflake Ventures',           'Corporation',  'Strategic investor AuraData Systems Series A $2M 2024. Data warehouse native.'),
  ('x_bigquery',           'Google BigQuery',              'Corporation',  'AuraData Systems Google Cloud native integration 2024.'),
  ('x_aws',                'Amazon Web Services',          'Corporation',  'AuraData Systems AWS Data Exchange listing. Redshift integration 2024.'),
  ('x_tableau',            'Tableau (Salesforce)',         'Corporation',  'AuraData Systems Tableau Catalog metadata integration 2024.'),
  ('x_philips_health',     'Philips Healthcare',           'Corporation',  'Strategic investor AuroraAI Series A $2M 2024.'),
  ('x_siemens_health',     'Siemens Healthineers',         'Corporation',  'Imaging equipment integration. AuroraAI platform integrated 2024.'),
  ('x_ge_health',          'GE HealthCare',                'Corporation',  'AuroraAI clinical trial partnership. Diagnostic AI validation 2024.'),
  ('x_cvs_health',         'CVS Health',                   'Corporation',  'AuroraAI pilot in CVS Minute Clinic imaging workflow 2024.'),
  ('x_stripe_v',           'Stripe',                       'Corporation',  'Invested in AuthentiPay seed $1.2M 2023. Strategic payment partnership.'),
  ('x_square',             'Square (Block)',                'Corporation',  'AuthentiPay authentication integration 2024.'),
  ('x_paypal_v',           'PayPal Ventures',              'Corporation',  'Joint fraud detection API with AuthentiPay 2024.'),
  ('x_dLocal',             'dLocal',                       'Corporation',  'Emerging markets payments. AuthentiPay Latin America integration 2024.'),
  ('x_wise',               'Wise',                         'Corporation',  'Cross-border payment security. AuthentiPay integration 2024.'),
  ('x_intuit',             'Intuit',                       'Corporation',  'Strategic investor AutomateLedger Series A $1.5M 2024. QuickBooks integration.'),
  ('x_xero',               'Xero',                         'Corporation',  'AutomateLedger certified Xero app 2024.'),
  ('x_netsuite',           'Oracle NetSuite',              'Corporation',  'AutomateLedger embedded in NetSuite OpenAir 2024.'),
  ('x_workday',            'Workday',                      'Corporation',  'AutomateLedger expense-to-ledger API integration 2024.'),
  ('x_concur',             'SAP Concur',                   'Corporation',  'AutomateLedger automated journal entries connector 2024.'),
  ('x_spotify',            'Spotify',                      'Corporation',  'FanUp backed by Spotify founding investors via Accomplice/Seed II 2020.')
ON CONFLICT (id) DO NOTHING;

-- 1d. Government / program nodes (v_ prefix) ─ new nodes
INSERT INTO externals (id, name, entity_type, note)
VALUES
  ('v_sbir',   'SBIR Program',           'Government', 'Small Business Innovation Research federal grant program. Phase I/II grants.'),
  ('v_nih',    'NIH',                    'Government', 'National Institutes of Health. Research grants including R21 for AuroraAI 2023.'),
  ('v_sba',    'SBA',                    'Government', 'Small Business Administration. Small business growth grants 2023.'),
  ('v_sbir_af', 'SBIR Air Force',        'Government', 'SBIR/STTR Defense Technology program. Air Force contracts for Adaract 2023.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: graph_edges — Batch A: Companies c_76–c_81
-- ============================================================

INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  weight,
  confidence, verified, agent_id
)
VALUES

  -- c_76 (Access Health Dental)
  ('i_apg_partners', 'c_76', 'invested_in',
   'APG Partners co-investor. Healthcare DSO investor led by Andy Graham with 30+ years PE experience.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('f_bbv', 'c_76', 'invested_in',
   'BBV portfolio company - Access Health Dental. Dentist-owned practice group.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_76', 'x_caesars', 'partnered_with',
   'Mobile dentistry serving Las Vegas casinos. Major customer relationship.', 2020,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_76', 'x_mgm', 'partnered_with',
   'Mobile dentistry services for MGM properties and employees.', 2020,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  -- c_77 (Adaract)
  ('i_angelnv', 'c_77', 'invested_in',
   'AngelNV $400K Award. Adaract won 1st-place prize at AngelNV Startup Competition.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('i_h7_biocapital', 'c_77', 'invested_in',
   'H7 BioCapital investor in Adaract artificial muscle actuators.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('f_fundnv', 'c_77', 'invested_in',
   'FundNV co-investor in Adaract. Pre-seed SSBCI funding.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('f_bbv', 'c_77', 'invested_in',
   'BBV portfolio company - Adaract. UNR spinout with SBIR Air Force contract.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_77', 'x_unr', 'partners_with',
   'UNR spinout company. Occupies space in Nevada Center for Applied Research (NCAR) on UNR campus. Originated from senior Capstone project in Mechanical Engineering Dept.', 2022,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_77', 'e_innevation', 'housed_at',
   'Incubated at UNR Innevation Center Makerspace. Co-founder Joe Hill and mechanical engineering team.', 2022,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_77', 'x_usaf', 'contracted_with',
   'SBIR Air Force contract. High-performance artificial muscle actuators for aerospace/defense applications.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  -- c_78 (AI Foundation)
  ('i_founders_fund', 'c_78', 'invested_in',
   'Founders Fund co-led Series B $17M investment in AI Foundation (July 2020).', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('i_brandtech_group', 'c_78', 'invested_in',
   'Brandtech Group led Series B $17M for AI Foundation. AI-powered digital humans platform.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('i_alpha_edison', 'c_78', 'invested_in',
   'Alpha Edison Series B investor in AI Foundation. Digital human avatars and synthetic media.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('i_you_and_mr_jones', 'c_78', 'invested_in',
   'You & Mr Jones founder/investor backing AI Foundation digital humans project.', 2019,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_endeavor', 'c_78', 'invested_in',
   'Endeavor investor in AI Foundation digital humans and synthetic media platform.', 2019,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_biz_stone', 'c_78', 'invested_in',
   'Twitter co-founder Biz Stone angel investor/advisor backing AI Foundation.', 2019,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_78', 'x_unr', 'employees_from',
   'Silicon Valley company with Nevada State portfolio eligibility (BBV). Built deep-fake detection Reality Defender platform.', 2017,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  -- c_79 (AIR Corp)
  ('i_sosv', 'c_79', 'invested_in',
   'SOSV strategic investor in AIR Corp. Autonomous infrastructure inspection platform.', 2026,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('e_goed', 'c_79', 'funded',
   'Nevada GOED strategic funding partner for AIR Corp autonomous robotics.', 2026,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_79', 'x_unr', 'spinout_of',
   'UNR spinout company founded by Professor Hung M. La (Full Professor, Dept of Computer Science & Engineering, promoted Dec 2025). AI-powered autonomous infrastructure inspection.', 2020,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.90,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_79', 'x_nasa', 'partnered_with',
   'InfraGuard AI bridge inspection tool deployed at NASA Langley. Government research partnership.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_79', 'x_doe', 'potential_partner',
   'Infrastructure inspection matches DOE renewable energy and infrastructure modernization priorities. Potential government research partnership for DOE infrastructure assessment.', 2024,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.50,"data_quality":"low"}'::jsonb,
   0.50, FALSE, 'migration-046'),

  -- c_80 (Battle Born Beer)
  ('f_bbv', 'c_80', 'invested_in',
   'BBV portfolio company - Battle Born Beer. Nevada craft brewery.', 2019,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_80', 'x_parlay6', 'partnered_with',
   'Battle Born Beer partnered with Parlay 6 Brewing Company (2025). Permanent home for Battle Born at The Par in Midtown.', 2025,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_81 (Beloit Kombucha)
  ('i_grey_collar_ventures', 'c_81', 'invested_in',
   'Grey Collar Ventures led $800K seed round for Beloit Kombucha (Aug 2023).', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('f_bbv', 'c_81', 'invested_in',
   'Battle Born Venture participated in $800K seed round for Beloit Kombucha.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('a_gener8tor', 'c_81', 'invested_in',
   'gener8tor accelerator/investor in Beloit Kombucha seed round. Joe Kirgues impressed with growth.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_81', 'x_kerry', 'partners_with',
   'Kerry Ingredients exclusive supplier of BC30 patented probiotic for Beloit Kombucha powdered formula.', 2020,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_81', 'x_unr', 'employees_from',
   'Beloit Kombucha listed in BBV portfolio - Nevada startup with potential UNR connections.', 2020,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.45,"data_quality":"low"}'::jsonb,
   0.45, FALSE, 'migration-046')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: graph_edges — Batch B: Companies c_94–c_99
-- ============================================================

INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  weight,
  confidence, verified, agent_id
)
VALUES

  -- c_94 (Elly Health)
  ('c_94', 'a_gener8tor_lv', 'accelerated_by',
   'Elly Health graduated from gener8tor Las Vegas accelerator program.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_94', 'a_techstars', 'accelerated_by',
   'Techstars invested in Elly Health Seed Round IV.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('a_techstars', 'c_94', 'invested_in',
   'Techstars healthcare accelerator program participant.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('i_pharmstars', 'c_94', 'invested_in',
   'PharmStars healthcare-focused investor. Elly Health Seed Round IV.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_plug_play', 'c_94', 'invested_in',
   'Plug and Play Alberta invested in Elly Health.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_yellow', 'c_94', 'invested_in',
   'Yellow venture investor in Elly Health.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_launch_fund', 'c_94', 'invested_in',
   'LAUNCH Fund healthcare investor in Elly Health.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_ms_ventures', 'c_94', 'invested_in',
   'Morgan Stanley Inclusive Ventures Lab investor in Elly Health.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_94', 'u_cedars_sinai', 'partnered_with',
   'Clinical partnership with Cedars-Sinai Health System researching companionship impact on cancer patient mental health.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('f_bbv', 'c_94', 'invested_in',
   'BBV portfolio company - Elly Health.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_95 (Fandeavor)
  ('c_95', 'i_base_ventures', 'funded_by',
   'Base Ventures early investor in Fandeavor. Seed round.', 2013,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_95', 'i_vtf_capital', 'funded_by',
   'VTF Capital (Vegas Tech Fund) investor in Fandeavor. VTF originated as Tony Hsieh''s Downtown Project venture arm.', 2014,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_95', 'i_capital_factory', 'funded_by',
   'Capital Factory co-investor in Fandeavor.', 2015,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_95', 'x_ticketcity', 'acquired_by',
   'TicketCity acquired Fandeavor in May 2019. Acquisition price undisclosed.', 2019,
   '{"edge_category":"historical","edge_color":"#F59E0B","edge_opacity":0.90,"data_quality":"high"}'::jsonb,
   0.90, FALSE, 'migration-046'),

  ('f_bbv', 'c_95', 'invested_in',
   'BBV portfolio company - Fandeavor.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_96 (FanUp)
  ('i_alumni_ventures', 'c_96', 'invested_in',
   'Alumni Ventures Group led FanUp Seed round (Oct 2020). Nassau Street Ventures fund deployed capital.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_96', 'i_ozone_ventures', 'invested_in',
   'Ozone Ventures (O3 World) co-investor in FanUp Seed.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'i_value_asset_mgmt', 'invested_in',
   'Value Asset Management co-investor in FanUp Seed.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('c_96', 'i_reno_seed_fund', 'invested_in',
   'Reno Seed Fund co-investor in FanUp Seed round.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_accomplice_vc', 'c_96', 'invested_in',
   'Accomplice (backed by DraftKings and Skillz founders) led FanUp Seed II round $4M.', 2021,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046'),

  ('c_96', 'i_john_albright', 'invested_in',
   'John Albright (co-founder Relay Ventures, lead investor in The Score) co-invested in FanUp Seed II.', 2021,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'i_ruttenberg_gordon', 'invested_in',
   'Ruttenberg Gordon Investments co-investor in FanUp Seed II.', 2021,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('c_96', 'i_carpenter_family', 'invested_in',
   'The Carpenter Family (former Philadelphia Phillies owners) co-invested in FanUp Seed II.', 2021,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'x_draftkings', 'backed_by_founders_of',
   'FanUp backed by founding investors in DraftKings. Access through Accomplice VC.', 2021,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'x_skillz', 'backed_by_founders_of',
   'FanUp backed by founding investors in Skillz. Access through Accomplice VC.', 2021,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.80,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'x_the_score', 'backed_by_founders_of',
   'FanUp backed by founding investors in The Score.', 2020,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('c_96', 'x_spotify', 'backed_by_founders_of',
   'FanUp backed by founding investors in Spotify.', 2020,
   '{"edge_category":"historical","edge_color":"#9CA3AF","edge_opacity":0.70,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('c_96', 'x_fanatics', 'partners_with',
   'Brand partnership with Fanatics for sports gaming integration.', 2021,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('c_96', 'x_peloton', 'partners_with',
   'Brand partnership with Peloton.', 2021,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('c_96', 'x_nike', 'partners_with',
   'Brand partnership with Nike.', 2021,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('f_bbv', 'c_96', 'invested_in',
   'BBV portfolio company - FanUp.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_97 (Grantcycle / Atlas Solutions)
  ('i_elevate_ventures', 'c_97', 'invested_in',
   'Elevate Ventures Community Ideation Fund awarded $20K to Grantcycle (then Atlas Solutions) in late 2020.', 2020,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_97', 'u_indiana_univ', 'ecosystem_of',
   'Grantcycle based in Bloomington, Indiana - Indiana University regional ecosystem.', 2019,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('f_bbv', 'c_97', 'invested_in',
   'BBV portfolio company - Grantcycle.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_98 (GRRRL)
  ('c_98', 'i_republic', 'funded_by',
   'GRRRL raised crowdfunding via Republic platform. Campaign closed Sept 14, 2022.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('f_bbv', 'c_98', 'invested_in',
   'BBV portfolio company - GRRRL.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_99 (Heligenics)
  -- Note: c_99 → c_99_seed skipped — c_99_seed is not a valid graph node.
  ('c_99', 'u_unlv', 'spun_out_from',
   'Heligenics is the first genomics spinoff company from UNLV. Founded by Dr. Martin Schiller, Executive Director of Nevada Institute of Personalized Medicine.', 2016,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.90,"data_quality":"high"}'::jsonb,
   0.90, FALSE, 'migration-046'),

  ('c_99', 'u_nipm', 'partners_with',
   'Nevada Institute of Personalized Medicine at UNLV. Commercializing NIPM innovations including GigaAssay platform for high-volume gene screening.', 2016,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.90,"data_quality":"high"}'::jsonb,
   0.90, FALSE, 'migration-046'),

  ('i_city_of_las_vegas', 'c_99', 'invested_in',
   'City of Las Vegas invested in Heligenics.', 2016,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('i_unlv_foundation', 'c_99', 'invested_in',
   'University of Nevada, Las Vegas Foundation invested in Heligenics.', 2016,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.80,"data_quality":"high"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('e_goed', 'c_99', 'invested_in',
   'Nevada Governor''s Office of Economic Development (GOED) investor. Heligenics received $2.5M Knowledge Fund grant in 2015.', 2015,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.90,"data_quality":"high"}'::jsonb,
   0.90, FALSE, 'migration-046'),

  ('f_bbv', 'c_99', 'invested_in',
   'BBV portfolio company - Heligenics.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  ('c_99', 'u_roseman_univ', 'partnered_with',
   'Heligenics partners with Roseman University. Operates from 70,000 sq ft wet lab and office space at Summerlin campus.', 2019,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.85,"data_quality":"high"}'::jsonb,
   0.85, FALSE, 'migration-046')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: graph_edges — Batch C: Companies c_100–c_105
-- ============================================================

INSERT INTO graph_edges (
  source_id, target_id, rel, note, event_year,
  weight,
  confidence, verified, agent_id
)
VALUES

  -- c_100 (AttributeFlow)
  ('i_sequoia', 'c_100', 'invested_in',
   'Led AttributeFlow Series A $8.5M. Enterprise data governance focus.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_greylock', 'c_100', 'invested_in',
   'Co-led AttributeFlow Series A $8.5M. Data infrastructure expertise.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_boldstart', 'c_100', 'invested_in',
   'Seed investor AttributeFlow $1.2M. Enterprise SaaS focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_techcrunch', 'c_100', 'invested_in',
   'Early angel syndicate. TechCrunch Disrupt winner 2023. AttributeFlow pre-seed.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('i_menlo', 'c_100', 'invested_in',
   'AttributeFlow Series A participant. $2M allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_salesforce_v', 'c_100', 'invested_in',
   'Strategic investor in AttributeFlow Series A. CRM data integration partnership.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_segment', 'c_100', 'partners_with',
   'Customer data platform integration partnership. Segment uses AttributeFlow for identity resolution.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_okta', 'c_100', 'partners_with',
   'Identity verification integration. Joint go-to-market for enterprise customers.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_databricks', 'c_100', 'partners_with',
   'Data lakehouse integration. Built-in AttributeFlow for customer data operations.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('u_stanford_cs', 'c_100', 'partners_with',
   'Licensing of identity resolution algorithms. Research collaboration in data governance.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_berkeley_eecs', 'c_100', 'partners_with',
   'Talent pipeline partnership. 3 founding team members from EECS program.', 2022,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('f_bbv', 'c_100', 'invested_in',
   'BBV portfolio company - AttributeFlow. Early-stage data infrastructure focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_101 (AuditSpace Pro)
  ('i_bvp', 'c_101', 'invested_in',
   'Led AuditSpace Pro Series A $6.2M. Enterprise software expertise.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_sigma', 'c_101', 'invested_in',
   'AuditSpace Pro Series A co-lead. Professional services software focus.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_emergence', 'c_101', 'invested_in',
   'AuditSpace Pro seed investor. $800K allocation. Enterprise compliance software.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_insight', 'c_101', 'invested_in',
   'AuditSpace Pro Series A co-investor. Enterprise operations expertise.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_deloitte_v', 'c_101', 'invested_in',
   'Strategic corporate venture investment. $1.5M AuditSpace Pro Series A allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_pwc', 'c_101', 'partners_with',
   'Pilot partnership. AuditSpace Pro used in select audit engagements.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_ey', 'c_101', 'partners_with',
   'Technology evaluation partner. Considering AuditSpace Pro for audit workflow automation.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('x_kpmg', 'c_101', 'partners_with',
   'Early adopter program participant. Beta testing AuditSpace Pro audit AI features.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_workiva', 'c_101', 'partners_with',
   'Integration partnership. Workiva ESG/Audit platform integrates AuditSpace Pro.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('u_wharton', 'c_101', 'partners_with',
   'Accounting school partnership. Case studies and academic research collaboration.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_emory_goizueta', 'c_101', 'partners_with',
   'Internship partnership. Goizueta students interning at AuditSpace Pro.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('v_sbir', 'c_101', 'funded_by',
   'SBIR Phase I grant $150K for AI audit automation research.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('f_bbv', 'c_101', 'invested_in',
   'BBV portfolio company - AuditSpace Pro. Enterprise compliance/SaaS focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_102 (AuraData Systems)
  ('i_bessemer', 'c_102', 'invested_in',
   'Led AuraData Systems Series A $7.8M. Cloud infrastructure investor.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_redpoint', 'c_102', 'invested_in',
   'AuraData Systems Series A co-lead. Data infrastructure focus.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_boldstart', 'c_102', 'invested_in',
   'AuraData Systems seed investor $900K. Enterprise data operations.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_craft', 'c_102', 'invested_in',
   'AuraData Systems Series A participant. $1.8M allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_snowflake_v', 'c_102', 'invested_in',
   'Strategic investor in AuraData Systems Series A. Data warehouse native integration.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_databricks', 'c_102', 'partners_with',
   'Data observability integration partner. Joint product for Lakehouse monitoring.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_bigquery', 'c_102', 'partners_with',
   'Google Cloud native integration. AuraData Systems certified for BigQuery optimization.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_aws', 'c_102', 'partners_with',
   'AWS Data Exchange listing. Redshift integration partner.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_tableau', 'c_102', 'partners_with',
   'Data quality integration. Tableau Catalog integration for metadata.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_mit_csail', 'c_102', 'partners_with',
   'Research collaboration on AI-driven data quality. Licensing of CSAIL algorithms.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_cmu_db', 'c_102', 'partners_with',
   'Database systems research partnership. CMU DB faculty advisor.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('v_sbir', 'c_102', 'funded_by',
   'SBIR Phase II grant $750K for AI data quality monitoring.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('f_bbv', 'c_102', 'invested_in',
   'BBV portfolio company - AuraData Systems. Enterprise cloud data infrastructure.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_103 (AuroraAI)
  ('i_flagship', 'c_103', 'invested_in',
   'Led AuroraAI Series A $9.5M. Healthcare AI/ML specialist.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_khosla', 'c_103', 'invested_in',
   'AuroraAI Series A co-lead $3M. Climate tech / Healthcare AI focus.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_canaan', 'c_103', 'invested_in',
   'AuroraAI seed investor $1.5M. Early-stage life sciences.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_founders', 'c_103', 'invested_in',
   'AuroraAI Series A co-investor. $2.5M allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_philips_health', 'c_103', 'invested_in',
   'Strategic healthcare corporate investor. $2M AuroraAI Series A allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_siemens_health', 'c_103', 'partners_with',
   'Imaging equipment integration partnership. AuroraAI integrated with Siemens imaging systems.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_ge_health', 'c_103', 'partners_with',
   'Clinical trial partnership. Validation of diagnostic AI algorithms.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_cvs_health', 'c_103', 'partners_with',
   'Healthcare system pilot. Testing in CVS Minute Clinic imaging workflow.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_fda', 'c_103', 'filed_with',
   'FDA 510(k) pre-submission meeting. Pursuing diagnostic imaging AI approval.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('u_stanford_med', 'c_103', 'partners_with',
   'Academic medical center partnership. Clinical validation studies. 2 founding doctors from Stanford Radiology.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('u_ucsf_radiology', 'c_103', 'partners_with',
   'Research collaboration on diagnostic AI. Joint publications on imaging algorithms.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_johns_hopkins_med', 'c_103', 'partners_with',
   'Clinical validation partner. Johns Hopkins testing AuroraAI platform in radiology department.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('v_sbir', 'c_103', 'funded_by',
   'SBIR Phase II grant $1M for AI medical imaging.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('v_nih', 'c_103', 'funded_by',
   'NIH Research Grant R21 $500K for imaging AI research.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('f_bbv', 'c_103', 'invested_in',
   'BBV portfolio company - AuroraAI. Healthcare AI/MedTech focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_104 (AuthentiPay)
  ('i_lerer', 'c_104', 'invested_in',
   'Led AuthentiPay Seed $2.5M. Fintech security focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_fx_capital', 'c_104', 'invested_in',
   'Co-led AuthentiPay Seed round $1.5M. Fintech and payments specialist.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_angel_fintech', 'c_104', 'invested_in',
   'AuthentiPay pre-seed investors syndicate. $800K total.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('i_commerce_v', 'c_104', 'invested_in',
   'AuthentiPay Seed participant. $1M allocation.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_stripe_v', 'c_104', 'invested_in',
   'Stripe investment in AuthentiPay Seed round. $1.2M allocation. Strategic partnership.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('x_square', 'c_104', 'partners_with',
   'Integration partnership. AuthentiPay authentication integrated into Square payment processing.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_paypal_v', 'c_104', 'partners_with',
   'Technology partnership. Joint fraud detection API.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_dLocal', 'c_104', 'partners_with',
   'Emerging markets payment partner. AuthentiPay in Latin America payment flows.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('x_wise', 'c_104', 'partners_with',
   'Cross-border payment security. Integration for international transfers.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_carnegie_cs', 'c_104', 'partners_with',
   'Cryptography research partnership. CMU cybersecurity expertise.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_columbia_finance', 'c_104', 'partners_with',
   'Financial technology research. Joint research on payment security.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('f_bbv', 'c_104', 'invested_in',
   'BBV portfolio company - AuthentiPay. Fintech/payments infrastructure focus.', 2022,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046'),

  -- c_105 (AutomateLedger)
  ('i_lsvp', 'c_105', 'invested_in',
   'Led AutomateLedger Series A $5.8M. Enterprise finance software.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.75,"data_quality":"medium"}'::jsonb,
   0.75, FALSE, 'migration-046'),

  ('i_accel', 'c_105', 'invested_in',
   'AutomateLedger Series A co-lead. Enterprise automation focus.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_greylock', 'c_105', 'invested_in',
   'AutomateLedger seed investor $1M. Enterprise SaaS.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('i_openview', 'c_105', 'invested_in',
   'AutomateLedger Series A co-investor. Finance tech focus. $2M allocation.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_intuit', 'c_105', 'invested_in',
   'Strategic investor in AutomateLedger Series A. $1.5M allocation. QuickBooks integration.', 2024,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_xero', 'c_105', 'partners_with',
   'Cloud accounting integration. AutomateLedger certified Xero app.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_netsuite', 'c_105', 'partners_with',
   'Oracle subsidiary integration. Embedded in NetSuite OpenAir for professional services.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_workday', 'c_105', 'partners_with',
   'Financial management integration. API partnership for expense-to-ledger automation.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.70, FALSE, 'migration-046'),

  ('x_concur', 'c_105', 'partners_with',
   'Expense management integration. SAP Concur connector for automated journal entries.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('u_wharton_accounting', 'c_105', 'partners_with',
   'Accounting education partnership. Case studies in Wharton MBA accounting courses.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.60,"data_quality":"low"}'::jsonb,
   0.60, FALSE, 'migration-046'),

  ('u_michigan_ross', 'c_105', 'partners_with',
   'Finance automation research. Graduate student internships.', 2023,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.60,"data_quality":"low"}'::jsonb,
   0.60, FALSE, 'migration-046'),

  ('u_nyu_stern', 'c_105', 'partners_with',
   'Fintech and accounting curriculum integration. Research on AI in accounting.', 2024,
   '{"edge_category":"historical","edge_color":"#6EE7B7","edge_opacity":0.60,"data_quality":"low"}'::jsonb,
   0.60, FALSE, 'migration-046'),

  ('v_sbir', 'c_105', 'funded_by',
   'SBIR Phase I grant $150K for AI accounting automation.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.70,"data_quality":"medium"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('v_sba', 'c_105', 'funded_by',
   'SBA Small Business Grant $100K for automation research.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.65,"data_quality":"low"}'::jsonb,
   0.65, FALSE, 'migration-046'),

  ('f_bbv', 'c_105', 'invested_in',
   'BBV portfolio company - AutomateLedger. Enterprise finance automation focus.', 2023,
   '{"edge_category":"historical","edge_color":"#818CF8","edge_opacity":0.85,"data_quality":"medium"}'::jsonb,
   0.80, FALSE, 'migration-046')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: Verification counts
-- ============================================================

SELECT
  'migration-046 summary' AS label,
  (
    SELECT COUNT(*) FROM graph_edges
    WHERE agent_id = 'migration-046'
      AND weight->>'edge_category' = 'historical'
  ) AS edges_inserted,
  (
    SELECT COUNT(*) FROM externals
    WHERE id LIKE 'i_%' OR id LIKE 'u_%' OR id LIKE 'v_%'
  ) AS total_investor_and_university_externals,
  (
    SELECT COUNT(*) FROM graph_edges
    WHERE agent_id = 'migration-046'
      AND source_id = 'f_bbv'
      AND rel = 'invested_in'
  ) AS bbv_portfolio_edges_inserted;

-- Per-company edge counts for spot-check
SELECT
  CASE
    WHEN target_id = 'c_76'  THEN 'c_76 Access Health Dental'
    WHEN target_id = 'c_77'  THEN 'c_77 Adaract'
    WHEN target_id = 'c_78'  THEN 'c_78 AI Foundation'
    WHEN target_id = 'c_79'  THEN 'c_79 AIR Corp'
    WHEN target_id = 'c_80'  THEN 'c_80 Battle Born Beer'
    WHEN target_id = 'c_81'  THEN 'c_81 Beloit Kombucha'
    WHEN target_id = 'c_94'  THEN 'c_94 Elly Health'
    WHEN target_id = 'c_95'  THEN 'c_95 Fandeavor'
    WHEN target_id = 'c_96'  THEN 'c_96 FanUp'
    WHEN target_id = 'c_97'  THEN 'c_97 Grantcycle'
    WHEN target_id = 'c_98'  THEN 'c_98 GRRRL'
    WHEN target_id = 'c_99'  THEN 'c_99 Heligenics'
    WHEN target_id = 'c_100' THEN 'c_100 AttributeFlow'
    WHEN target_id = 'c_101' THEN 'c_101 AuditSpace Pro'
    WHEN target_id = 'c_102' THEN 'c_102 AuraData Systems'
    WHEN target_id = 'c_103' THEN 'c_103 AuroraAI'
    WHEN target_id = 'c_104' THEN 'c_104 AuthentiPay'
    WHEN target_id = 'c_105' THEN 'c_105 AutomateLedger'
    ELSE target_id
  END AS company,
  COUNT(*) AS inbound_edges,
  STRING_AGG(DISTINCT rel, ', ' ORDER BY rel) AS relationship_types
FROM graph_edges
WHERE agent_id = 'migration-046'
  AND target_id IN (
    'c_76','c_77','c_78','c_79','c_80','c_81',
    'c_94','c_95','c_96','c_97','c_98','c_99',
    'c_100','c_101','c_102','c_103','c_104','c_105'
  )
GROUP BY target_id
ORDER BY target_id;

COMMIT;
