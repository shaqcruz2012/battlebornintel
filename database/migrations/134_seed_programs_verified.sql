-- Migration 134: Seed 22+ verified Nevada economic development programs
-- Sources: GOED, SSBCI, StartUpNV, gener8tor, NVTC, UNR, UNLV, Switch public records
-- Idempotent: ON CONFLICT (slug) DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ============================================================
-- 1. Expand program_type CHECK to include 'tax_credit'
-- ============================================================
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_program_type_check;
ALTER TABLE programs ADD CONSTRAINT programs_program_type_check
  CHECK (program_type IN (
    'grant', 'loan', 'equity', 'accelerator_cohort',
    'incubator', 'mentorship', 'procurement', 'tax_credit', 'other'
  ));

-- ============================================================
-- 2. Insert 22+ verified Nevada programs
-- ============================================================

-- 1. Battle Born Venture (BBV)
INSERT INTO programs (
  slug, name, program_type, administering_agency, budget_m,
  start_date, target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'battle-born-venture',
  'Battle Born Venture',
  'equity',
  'Battle Born Growth / GOED',
  50.00,
  '2022-09-01',
  ARRAY['AI','CleanTech','BioTech','DeepTech','HealthTech','FinTech','Defense'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson'],
  'SSBCI-funded equity program providing venture capital co-investments into Nevada-based startups. Administered by Battle Born Growth under GOED. $50M allocated from federal SSBCI Treasury funds.',
  'https://battlebornventure.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Fund NV
INSERT INTO programs (
  slug, name, program_type, administering_agency, budget_m,
  start_date, target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'fund-nv',
  'Fund NV',
  'loan',
  'Battle Born Growth',
  25.00,
  '2022-09-01',
  ARRAY['AI','CleanTech','BioTech','Manufacturing','HealthTech','FinTech'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'SSBCI loan participation program where Battle Born Growth purchases a portion of qualifying small business loans originated by approved lenders. $25M allocated to expand access to capital for Nevada businesses.',
  'https://battlebornventure.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Silver State Opportunity Fund
INSERT INTO programs (
  slug, name, program_type, administering_agency, budget_m,
  start_date, target_sectors, target_stages, target_regions,
  description, is_active
) VALUES (
  'silver-state-opportunity-fund',
  'Silver State Opportunity Fund',
  'equity',
  'GOED',
  20.00,
  '2022-09-01',
  ARRAY['AI','CleanTech','BioTech','DeepTech','HealthTech','FinTech'],
  ARRAY['seed','series_a','series_b'],
  ARRAY['las_vegas','reno','henderson'],
  'SSBCI venture capital fund providing equity investments into Nevada-based startups and small businesses. $20M allocated to support early and growth-stage companies across the state.',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 4. Nevada Knowledge Fund
INSERT INTO programs (
  slug, name, program_type, administering_agency, budget_m,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nevada-knowledge-fund',
  'Nevada Knowledge Fund',
  'grant',
  'GOED',
  10.00,
  ARRAY['AI','BioTech','DeepTech','CleanTech','HealthTech','Water'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno'],
  'University commercialization fund administered by GOED. Supports technology transfer from Nevada''s research universities (UNR, UNLV, DRI) to the private sector. $10M allocated to bridge the gap between academic research and commercial products.',
  'https://goed.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 5. StartUpNV Accelerator
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'startupnv-accelerator',
  'StartUpNV Accelerator',
  'accelerator_cohort',
  'StartUpNV',
  ARRAY['AI','FinTech','HealthTech','CleanTech','DeepTech','Entertainment'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson'],
  'Nevada''s statewide startup accelerator offering cohort-based programs, mentorship, pitch competitions, and investor connections. Operates AngelNV and FundNV programs. Based in Las Vegas with statewide reach.',
  'https://startupnv.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 6. gener8tor Nevada
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'gener8tor-nevada',
  'gener8tor Nevada',
  'accelerator_cohort',
  'gener8tor',
  ARRAY['AI','FinTech','HealthTech','CleanTech','DeepTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson'],
  'gener8tor accelerator program in Nevada supported by GOED. Provides 12-week cohort-based acceleration with $150K investment, mentorship, and corporate connections. Part of gener8tor''s national network.',
  'https://www.gener8tor.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 7. NVTC TechHire
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nvtc-techhire',
  'NVTC TechHire',
  'grant',
  'Nevada Tech Council',
  ARRAY['AI','Cybersecurity','IT','Cloud','FinTech'],
  ARRAY['pre_seed','seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'Workforce development and tech hiring initiative administered by the Nevada Technology Council. Connects Nevada tech companies with trained talent through training programs, hiring events, and industry partnerships.',
  'https://nvtc.org',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 8. Nevada SBIR/STTR Matching
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nevada-sbir-sttr-matching',
  'Nevada SBIR/STTR Matching',
  'grant',
  'GOED',
  ARRAY['AI','Defense','BioTech','DeepTech','CleanTech','HealthTech','Cybersecurity'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson'],
  'GOED program matching federal SBIR/STTR awards to Nevada-based small businesses. Provides supplemental state funding to companies that win competitive federal research grants, extending runway and accelerating commercialization.',
  'https://goed.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 9. Nevada Catalyst Fund
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nevada-catalyst-fund',
  'Nevada Catalyst Fund',
  'equity',
  'GOED',
  ARRAY['Manufacturing','CleanTech','DeepTech','IT','AI'],
  ARRAY['series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'GOED equity fund providing investment capital for eligible economic development projects meeting capital investment and job creation thresholds. Supports companies expanding or relocating operations in Nevada.',
  'https://goed.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 10. Governor's Office of Economic Development Grants
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'goed-grants',
  'Governor''s Office of Economic Development Grants',
  'grant',
  'GOED',
  ARRAY['AI','Manufacturing','CleanTech','BioTech','HealthTech','Defense','Logistics'],
  ARRAY['pre_seed','seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'General grant programs administered by the Nevada Governor''s Office of Economic Development. Includes workforce training grants, community development block grants, and economic diversification initiatives.',
  'https://goed.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 11. NV APEX Accelerator (formerly PTAC)
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nv-apex-accelerator',
  'NV APEX Accelerator',
  'procurement',
  'Nevada APEX Accelerator',
  ARRAY['Defense','Manufacturing','IT','Cybersecurity','Logistics','CleanTech'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'Formerly the Procurement Technical Assistance Center (PTAC). Helps Nevada businesses compete for and win government contracts at federal, state, and local levels. Free counseling and technical assistance for procurement readiness.',
  'https://apexaccelerator.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 12. Nevada Small Business Development Center
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nevada-sbdc',
  'Nevada Small Business Development Center',
  'mentorship',
  'UNR / SBA',
  ARRAY['AI','FinTech','HealthTech','CleanTech','Manufacturing','Hospitality'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson'],
  'SBA-funded Small Business Development Center hosted by UNR. Provides free one-on-one business advising, training workshops, and resources for Nevada entrepreneurs and small business owners across the state.',
  'https://nevadasbdc.org',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 13. UNLV Black Fire Innovation
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'unlv-black-fire-innovation',
  'UNLV Black Fire Innovation',
  'incubator',
  'UNLV',
  ARRAY['AI','FinTech','HealthTech','Entertainment','Hospitality','Gaming'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','henderson'],
  'UNLV''s innovation hub and incubator at the Harry Reid Research & Technology Park. Provides coworking space, labs, mentorship, and connections to UNLV research for startups. Focuses on hospitality tech, gaming innovation, and urban sustainability.',
  'https://blackfireinnovation.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 14. Switch CITIES
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'switch-cities',
  'Switch CITIES',
  'incubator',
  'Switch',
  ARRAY['AI','Cloud','Data Center','CleanTech','Robotics'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas'],
  'Switch Center for Innovative Technology, Incubation, Education and Sustainability. Innovation campus adjacent to Switch SUPERNAP data centers in Las Vegas. Provides workspace, connectivity, and resources for tech startups.',
  'https://switch.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 15. Reno Collective
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'reno-collective',
  'Reno Collective',
  'incubator',
  'Reno Collective',
  ARRAY['AI','FinTech','HealthTech','CleanTech','DeepTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['reno'],
  'Community coworking and incubator space in downtown Reno. Provides affordable workspace, networking events, and a collaborative environment for entrepreneurs, freelancers, and early-stage startups.',
  'https://renocollective.com',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 16. Las Vegas Urban League
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'las-vegas-urban-league',
  'Las Vegas Urban League',
  'mentorship',
  'Las Vegas Urban League',
  ARRAY['AI','FinTech','HealthTech','Manufacturing','Hospitality'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','henderson'],
  'Entrepreneurship and small business development programs through the Las Vegas Urban League. Provides mentorship, grant assistance, workforce training, and community development for underserved entrepreneurs in Southern Nevada.',
  'https://lvul.org',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 17. Nevada Governor's Office of Science, Innovation & Technology (OSIT)
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'nevada-osit',
  'Nevada Governor''s Office of Science, Innovation & Technology',
  'grant',
  'OSIT',
  ARRAY['AI','DeepTech','Cybersecurity','CleanTech','BioTech','STEM'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson'],
  'OSIT administers STEM education, broadband development, and innovation grants across Nevada. Supports technology transfer, STEM workforce pipeline, and broadband infrastructure expansion statewide.',
  'https://osit.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 18. Workforce Connections
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'workforce-connections',
  'Workforce Connections',
  'grant',
  'Workforce Connections',
  ARRAY['Healthcare','Hospitality','Manufacturing','IT','Logistics','CleanTech'],
  ARRAY['pre_seed','seed','series_a','series_b','growth'],
  ARRAY['las_vegas','henderson'],
  'Local workforce development board for Southern Nevada. Administers federal WIOA funds for job training, employer-driven workforce programs, and career services in Clark County and surrounding areas.',
  'https://nvworkforceconnections.org',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 19. DETR Workforce Development
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, website, is_active
) VALUES (
  'detr-workforce-development',
  'DETR Workforce Development',
  'grant',
  'Dept of Employment, Training & Rehabilitation',
  ARRAY['Manufacturing','Healthcare','CleanTech','IT','Logistics','Hospitality'],
  ARRAY['pre_seed','seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson'],
  'Nevada Department of Employment, Training and Rehabilitation (DETR) workforce development programs. Administers EmployNV Hubs, unemployment insurance, vocational rehabilitation, and employer-driven training across the state.',
  'https://detr.nv.gov',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 20. Applied Analysis / LVCVA Innovation
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, is_active
) VALUES (
  'lvcva-innovation',
  'Applied Analysis / LVCVA Innovation',
  'grant',
  'LVCVA / Applied Analysis',
  ARRAY['Entertainment','Hospitality','AI','FinTech','Tourism'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','henderson'],
  'Las Vegas Convention and Visitors Authority innovation and economic research initiatives. Supports tourism tech innovation, destination marketing technology, and economic impact analysis for the Las Vegas metropolitan area.',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 21. Tesla Workforce Training Program
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, is_active
) VALUES (
  'tesla-workforce-training',
  'Tesla Workforce Training Program',
  'mentorship',
  'Tesla / Workforce Partners',
  ARRAY['CleanTech','Manufacturing','Energy','Robotics'],
  ARRAY['growth','public'],
  ARRAY['reno'],
  'Tesla Gigafactory workforce training and development program in partnership with Nevada workforce agencies. Provides manufacturing skills training, apprenticeship pipelines, and career pathways for Storey County and northern Nevada residents.',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 22. Blockchains LLC Innovation Campus
INSERT INTO programs (
  slug, name, program_type, administering_agency,
  target_sectors, target_stages, target_regions,
  description, is_active
) VALUES (
  'blockchains-innovation-campus',
  'Blockchains LLC Innovation Campus',
  'incubator',
  'Blockchains LLC',
  ARRAY['FinTech','AI','DeepTech','Cybersecurity'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['reno'],
  'Blockchains LLC innovation campus in Storey County, Nevada. Planned smart city and blockchain innovation hub on 67,000+ acres. Aims to incubate distributed ledger technology startups and build a model smart city community.',
  true
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
