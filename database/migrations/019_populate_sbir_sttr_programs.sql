-- Migration 019: Populate SBIR/STTR government funding programs
-- Adds agencies, universities, and programs for opportunity matching
-- Run: psql -U bbi -d battlebornintel -f database/migrations/019_populate_sbir_sttr_programs.sql

-- ============================================================
-- STEP 1: GOVERNMENT AGENCIES
-- ============================================================
-- Fix NASA jurisdiction_level (previously set to 'state' by mistake)
UPDATE gov_agencies
SET jurisdiction_level = 'federal', verified = true, confidence = 1.0
WHERE slug = 'nasa';

-- Fix nv-goed jurisdiction_level (it is a state agency)
UPDATE gov_agencies
SET jurisdiction_level = 'state', verified = true, confidence = 1.0
WHERE slug = 'nv-goed';

-- Insert remaining federal agencies (not yet present)
INSERT INTO gov_agencies (slug, name, jurisdiction_level, programs_count, verified, confidence)
VALUES
  ('sba',   'U.S. Small Business Administration',          'federal', 3,  true, 1.0),
  ('nasa',  'National Aeronautics and Space Administration','federal', 1,  true, 1.0),
  ('usda',  'U.S. Department of Agriculture',              'federal', 1,  true, 1.0),
  ('epa',   'U.S. Environmental Protection Agency',        'federal', 1,  true, 1.0),
  ('dod',   'U.S. Department of Defense',                  'federal', 2,  true, 1.0)
ON CONFLICT (slug) DO UPDATE
  SET name               = EXCLUDED.name,
      jurisdiction_level = EXCLUDED.jurisdiction_level,
      programs_count     = EXCLUDED.programs_count,
      verified           = EXCLUDED.verified,
      confidence         = EXCLUDED.confidence;

-- Insert state agencies
INSERT INTO gov_agencies (slug, name, jurisdiction_level, jurisdiction_region_id, programs_count, verified, confidence)
VALUES
  ('nevada-sbdc', 'Nevada Small Business Development Center', 'state',  1, 2, true, 1.0),
  ('goed',        'Governor''s Office of Economic Development','state',  1, 5, true, 1.0)
ON CONFLICT (slug) DO NOTHING;

-- Insert county-level agencies (Washoe = Reno-Sparks metro id 3; Clark = Las Vegas metro id 2)
INSERT INTO gov_agencies (slug, name, jurisdiction_level, jurisdiction_region_id, programs_count, verified, confidence)
VALUES
  ('edawn', 'Economic Development Authority of Western Nevada', 'county', 3, 1, true, 1.0),
  ('lvgea', 'Las Vegas Global Economic Alliance',               'county', 2, 1, true, 1.0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 2: UNIVERSITIES
-- ============================================================
-- Add UNLV (University of Nevada, Las Vegas) if not present
INSERT INTO universities (slug, name, tech_transfer_office, spinout_count, region_id, verified, confidence)
VALUES
  ('unlv', 'University of Nevada, Las Vegas', true, 5, 2, true, 1.0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 3: PROGRAMS — SBIR/STTR (NSF)
-- ============================================================
-- Programs already in DB with correct data: nsf-sbir-phase-i, nsf-sbir-phase-ii, sba-7a-loan
-- We upsert all 25 requested programs using ON CONFLICT so existing data is preserved
-- and new records are created.

-- NSF SBIR Phase I  (already exists — upsert to ensure correct fields)
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nsf-sbir-phase-i',
  'NSF SBIR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nsf'),
  200.00,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','MedDevice','Robotics',
        'Semiconductors','SpaceTech','Defense','EdTech','AgTech','IoT',
        'Materials Science','Water','Energy','Cybersecurity'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NSF SBIR Phase I awards up to $275K over 6 months for early-stage technology companies to prove scientific and technical feasibility. Open to all technology sectors.',
  1.0,
  true
ON CONFLICT (slug) DO UPDATE
  SET budget_m       = EXCLUDED.budget_m,
      target_stages  = EXCLUDED.target_stages,
      description    = EXCLUDED.description,
      verified       = EXCLUDED.verified;

-- NSF SBIR Phase II  (already exists — upsert)
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nsf-sbir-phase-ii',
  'NSF SBIR Phase II',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nsf'),
  500.00,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','MedDevice','Robotics',
        'Semiconductors','SpaceTech','Defense','EdTech','AgTech','IoT',
        'Materials Science','Water','Energy','Cybersecurity'],
  ARRAY['seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NSF SBIR Phase II awards up to $1M over 24 months for companies that completed Phase I, to continue R&D and pursue commercialization.',
  1.0,
  true
ON CONFLICT (slug) DO UPDATE
  SET budget_m       = EXCLUDED.budget_m,
      target_stages  = EXCLUDED.target_stages,
      description    = EXCLUDED.description,
      verified       = EXCLUDED.verified;

-- NSF STTR Phase I
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nsf-sttr-phase-i',
  'NSF STTR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nsf'),
  100.00,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','MedDevice','Robotics',
        'Semiconductors','SpaceTech','EdTech','AgTech','Materials Science','Energy'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NSF STTR Phase I awards up to $275K over 12 months. Requires a formal collaboration between a small business and a U.S. research institution such as a university.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- NSF STTR Phase II
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nsf-sttr-phase-ii',
  'NSF STTR Phase II',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nsf'),
  300.00,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','MedDevice','Robotics',
        'Semiconductors','SpaceTech','EdTech','AgTech','Materials Science','Energy'],
  ARRAY['seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NSF STTR Phase II awards up to $1M over 24 months. Continues research collaboration between small business and university partner begun in Phase I.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 4: PROGRAMS — SBIR (DOE)
-- ============================================================
-- DOE SBIR Phase I
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'doe-sbir-phase-i',
  'DOE SBIR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'doe'),
  150.00,
  ARRAY['CleanTech','Energy','AI','DeepTech','Materials Science','Water','Semiconductors'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'DOE SBIR Phase I awards up to $250K for small businesses developing innovative technologies in energy, AI, and climate solutions.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- DOE SBIR Phase II
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'doe-sbir-phase-ii',
  'DOE SBIR Phase II',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'doe'),
  400.00,
  ARRAY['CleanTech','Energy','AI','DeepTech','Materials Science','Water','Semiconductors'],
  ARRAY['seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'DOE SBIR Phase II awards up to $1.6M for continued energy technology R&D and commercialization following a successful Phase I.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- DOE ARPA-E
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'doe-arpa-e',
  'DOE ARPA-E Program',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'doe'),
  300.00,
  ARRAY['CleanTech','Energy','DeepTech','Materials Science','Semiconductors'],
  ARRAY['seed','series_a','series_b'],
  ARRAY['las_vegas','reno','henderson','other'],
  'ARPA-E funds transformational energy technology projects with $500K–$10M awards. Targets breakthrough innovations with potential to fundamentally advance U.S. energy security.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 5: PROGRAMS — SBIR (NIH)
-- ============================================================
-- NIH SBIR Phase I  (already exists — upsert)
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nih-sbir-phase-i',
  'NIH SBIR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nih'),
  400.00,
  ARRAY['BioTech','HealthTech','MedDevice','AI','DeepTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NIH SBIR Phase I awards up to $275K for biotech and health technology companies to establish feasibility of a research concept.',
  1.0,
  true
ON CONFLICT (slug) DO UPDATE
  SET budget_m       = EXCLUDED.budget_m,
      target_stages  = EXCLUDED.target_stages,
      description    = EXCLUDED.description,
      verified       = EXCLUDED.verified;

-- NIH SBIR Phase II  (already exists — upsert)
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nih-sbir-phase-ii',
  'NIH SBIR Phase II',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nih'),
  800.00,
  ARRAY['BioTech','HealthTech','MedDevice','AI'],
  ARRAY['seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NIH SBIR Phase II awards up to $1.75M to further develop and commercialize promising health technology innovations.',
  1.0,
  true
ON CONFLICT (slug) DO UPDATE
  SET budget_m       = EXCLUDED.budget_m,
      target_stages  = EXCLUDED.target_stages,
      description    = EXCLUDED.description,
      verified       = EXCLUDED.verified;

-- ============================================================
-- STEP 6: PROGRAMS — SBIR (DARPA)
-- ============================================================
-- DARPA SBIR Phase I
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'darpa-sbir-phase-i',
  'DARPA SBIR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'darpa'),
  100.00,
  ARRAY['Defense','AI','Cybersecurity','DeepTech','Robotics','Semiconductors','SpaceTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'DARPA SBIR Phase I awards up to $250K for small businesses developing innovative defense, AI, and cybersecurity technologies.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- DARPA SBIR Phase II
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'darpa-sbir-phase-ii',
  'DARPA SBIR Phase II',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'darpa'),
  300.00,
  ARRAY['Defense','AI','Cybersecurity','DeepTech','Robotics','Semiconductors','SpaceTech'],
  ARRAY['seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'DARPA SBIR Phase II awards up to $1.5M for continued development of Phase I defense and AI technology innovations.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 7: PROGRAMS — SBIR (NASA)
-- ============================================================
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'nasa-sbir-phase-i',
  'NASA SBIR Phase I',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nasa'),
  80.00,
  ARRAY['SpaceTech','Defense','AI','DeepTech','Robotics','CleanTech','Materials Science'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'NASA SBIR Phase I awards up to $150K for small businesses developing innovative aerospace and space technologies that align with NASA mission needs.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 8: PROGRAMS — SBA LOANS
-- ============================================================
-- SBA 7(a) Loan  (already exists — upsert)
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'sba-7a-loan',
  'SBA 7(a) Loan Program',
  'loan',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'sba-nv'),
  2000.00,
  ARRAY['SaaS','AI','Consumer','FinTech','HealthTech','Retail','Logistics',
        'Manufacturing','Construction','Hospitality','Real Estate'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson','other'],
  'SBA 7(a) loan guarantees up to $5M for Nevada small businesses to fund operations, equipment, and growth.',
  1.0,
  true
ON CONFLICT (slug) DO UPDATE
  SET description = EXCLUDED.description,
      verified    = EXCLUDED.verified;

-- SBA 504 Loan
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'sba-504-loan',
  'SBA 504 Loan Program',
  'loan',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'sba-nv'),
  1000.00,
  ARRAY['Manufacturing','Construction','Hospitality','Real Estate','Logistics','Retail'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson','other'],
  'SBA 504 loans provide up to $5M in long-term, fixed-rate financing for Nevada small businesses to acquire major fixed assets such as real estate and equipment.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- SBA Microloan
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'sba-microloan',
  'SBA Microloan Program',
  'loan',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'sba-nv'),
  50.00,
  ARRAY['SaaS','Consumer','Retail','Hospitality','Manufacturing','AgTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'SBA Microloan program provides up to $50K to help early-stage small businesses and nonprofit childcare centers start up and expand.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 9: PROGRAMS — GOED (State of Nevada)
-- ============================================================
-- GOED SSBCI Program
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'goed-ssbci',
  'Nevada SSBCI Capital Program',
  'equity',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  112.90,
  ARRAY['AI','DeepTech','CleanTech','HealthTech','BioTech','FinTech','SaaS',
        'Manufacturing','Logistics','Semiconductors'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'Nevada SSBCI provides $112.9M in federal capital to support Nevada startups through venture capital, loan participation, and collateral support programs.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- GOED WINN Grant
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'goed-winn',
  'WINN (Workforce Innovations for a New Nevada) Grant',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  17.00,
  ARRAY['Manufacturing','Logistics','CleanTech','Semiconductors','HealthTech',
        'Hospitality','Construction','AI'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson','other'],
  'WINN Grant provides $17M+ in workforce training funding to help Nevada companies upskill employees in high-demand industries.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- GOED Knowledge Fund
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'goed-knowledge-fund',
  'Nevada Knowledge Fund',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  10.00,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','MedDevice',
        'Semiconductors','Materials Science','AgTech'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'Nevada Knowledge Fund supports university-to-industry research commercialization partnerships, bridging university research and private-sector innovation.',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- GOED Nevada Tech Hub
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, start_date, confidence, verified
)
SELECT
  'goed-nevada-tech-hub',
  'Nevada Tech Hub (Lithium/EV/Battery)',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  21.00,
  ARRAY['CleanTech','Energy','Materials Science','Manufacturing','Semiconductors','DeepTech'],
  ARRAY['seed','series_a','series_b','growth'],
  ARRAY['las_vegas','reno','henderson','other'],
  'Nevada Tech Hub provides $21M from the CHIPS and Science Act to accelerate Nevada''s lithium, EV, and battery technology ecosystem and supply chain.',
  '2023-10-01',
  1.0,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 10: PROGRAMS — NEVADA-SPECIFIC (Battle Born, FundNV, StartUpNV, etc.)
-- ============================================================
-- Battle Born Growth Microloan
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'battle-born-growth-microloan',
  'Battle Born Growth Microloan',
  'loan',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  5.00,
  ARRAY['SaaS','AI','Consumer','FinTech','HealthTech','Retail','Manufacturing',
        'Hospitality','CleanTech','AgTech'],
  ARRAY['pre_seed','seed','series_a'],
  ARRAY['las_vegas','reno','henderson','other'],
  'Battle Born Growth Microloan offers up to $250K to Nevada small businesses looking to grow, hire, and expand operations across the state.',
  0.90,
  true
ON CONFLICT (slug) DO NOTHING;

-- FundNV Pre-Seed
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'fundnv-pre-seed',
  'FundNV Pre-Seed Program',
  'equity',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  2.00,
  ARRAY['SaaS','AI','DeepTech','FinTech','HealthTech','CleanTech','Consumer','EdTech'],
  ARRAY['pre_seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'FundNV Pre-Seed provides up to $50K in non-dilutive funding to pre-seed Nevada startups validating their product and market.',
  0.90,
  true
ON CONFLICT (slug) DO NOTHING;

-- StartUpNV Accelerator
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'startupnv-accelerator',
  'StartUpNV Accelerator',
  'accelerator_cohort',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nv-goed'),
  1.00,
  ARRAY['SaaS','AI','FinTech','HealthTech','Consumer','CleanTech','EdTech','IoT'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'StartUpNV Accelerator provides $100K+ in funding, mentorship, and resources to early-stage Nevada startups through cohort-based programming.',
  0.90,
  true
ON CONFLICT (slug) DO NOTHING;

-- InnovateNV Phase 0 Microgrant
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'innovatenv-phase-0',
  'InnovateNV Phase 0 Microgrant',
  'grant',
  'gov_agency',
  (SELECT id FROM gov_agencies WHERE slug = 'nevada-sbdc'),
  0.50,
  ARRAY['AI','DeepTech','BioTech','CleanTech','HealthTech','SaaS','Manufacturing',
        'Defense','Cybersecurity','Materials Science'],
  ARRAY['pre_seed'],
  ARRAY['las_vegas','reno','henderson','other'],
  'InnovateNV Phase 0 provides up to $5K in microgrant funding to help Nevada entrepreneurs prepare for NSF SBIR Phase I applications.',
  0.85,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 11: PROGRAMS — UNIVERSITY-AFFILIATED
-- ============================================================
-- UNLV Catalyst Grant
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'unlv-catalyst-grant',
  'UNLV Catalyst Innovation Grant',
  'grant',
  'university',
  (SELECT id FROM universities WHERE slug = 'unlv'),
  0.75,
  ARRAY['Hospitality','Consumer','AI','SaaS','FinTech','EdTech','HealthTech'],
  ARRAY['pre_seed','seed'],
  ARRAY['las_vegas','henderson'],
  'UNLV Catalyst Grant provides up to $75K to support hospitality, gaming, and technology innovation projects commercializing UNLV research.',
  0.90,
  true
ON CONFLICT (slug) DO NOTHING;

-- UNR Sontag Entrepreneurship Competition
INSERT INTO programs (
  slug, name, program_type, owner_entity_type, owner_entity_id,
  budget_m, target_sectors, target_stages, target_regions,
  description, confidence, verified
)
SELECT
  'unr-sontag-competition',
  'UNR Sontag Entrepreneurship Competition',
  'grant',
  'university',
  (SELECT id FROM universities WHERE slug = 'unr'),
  0.50,
  ARRAY['AI','DeepTech','CleanTech','HealthTech','BioTech','SaaS','Manufacturing',
        'AgTech','Materials Science'],
  ARRAY['pre_seed'],
  ARRAY['reno'],
  'UNR Sontag Entrepreneurship Competition awards up to $50K to UNR student and faculty startups with high-growth potential.',
  0.90,
  true
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 12: UPDATE programs_count for gov_agencies
-- ============================================================
UPDATE gov_agencies ga
SET programs_count = (
  SELECT COUNT(*) FROM programs p
  WHERE p.owner_entity_type = 'gov_agency'
    AND p.owner_entity_id = ga.id
)
WHERE EXISTS (
  SELECT 1 FROM programs p
  WHERE p.owner_entity_type = 'gov_agency'
    AND p.owner_entity_id = ga.id
);
