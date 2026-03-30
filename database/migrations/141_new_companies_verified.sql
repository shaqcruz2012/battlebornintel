-- Migration 141: Seed 16 new verified Nevada companies from web research
-- Sources: EDAWN, GeekWire, BusinessWire, LVGEA, EnergyTech, gener8tor, UNR, RVBusiness
-- IDs start at 128 (existing companies go up to 127)
-- Uses ON CONFLICT DO NOTHING
-- Generated: 2026-03-30

BEGIN;

-- ── High-impact companies ──────────────────────────────────────────────────

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (128, 'Positron AI', 'positron-ai', 'series_a', ARRAY['AI','Semiconductors','Hardware'],
   'Reno', 'reno', 75.1, 90, 50, 2023,
   'Designs energy-efficient FPGA-based AI inference hardware rivaling Nvidia. Chips fabricated at Intel Arizona foundry, servers assembled in Northern Nevada. 3.5x performance-per-dollar vs Nvidia H100. Backed by Valor Equity, DFJ Growth, Flume Ventures.',
   ARRAY['bbv'], 39.53, -119.81)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (129, 'BRINC Drones', 'brinc-drones', 'series_b', ARRAY['Drones','Public Safety','Hardware'],
   'Las Vegas', 'las_vegas', 157.2, 88, 116, 2019,
   'Indoor emergency-response drones for police, fire, first responders. Lemur 2 features glass-breaking, onboard comms, low-light navigation. Founded by LV native Blake Resnick at age 17 after 2017 LV shooting. Backed by Sam Altman, Index Ventures, Motorola Solutions alliance.',
   ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (130, 'P-1 AI', 'p-1-ai', 'seed', ARRAY['AI','Engineering','DeepTech'],
   'Henderson', 'las_vegas', 23, 85, 20, 2024,
   'Building Engineering AGI for physical systems. Archie product automates design trades and requirements analysis. Founded by ex-Airbus/DARPA CTO Paul Eremenko and ex-DeepMind researcher. Backed by Radical Ventures, Jeff Dean, Peter Welinder (OpenAI).',
   ARRAY['bbv'], 36.04, -115.04)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (131, 'NeuroGum', 'neurogum', 'growth', ARRAY['Health & Wellness','Consumer Products'],
   'Las Vegas', 'las_vegas', 10, 72, 50, 2015,
   'All-natural nootropic gums and mints for energy and focus. Available in 7,500+ retail locations (Whole Foods, Walmart, JetBlue). Relocated HQ to LV in 2023. GOED tax abatements. Backed by Steve Aoki, Gold House Ventures.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (132, 'Flawless AI', 'flawless-ai', 'series_a', ARRAY['AI','Entertainment','Film Tech'],
   'Las Vegas', 'las_vegas', 39.9, 78, 50, 2018,
   'AI-powered film dubbing and dialogue editing. TrueSync adjusts actors'' mouth movements for foreign language dubbing. Used on Venom: The Last Dance. HPA Innovation Award. StartUpNV portfolio. Backed by AWS.',
   ARRAY['bbv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

-- ── Mid-stage / accelerator graduates ──────────────────────────────────────

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (133, 'Edison XFC', 'edison-xfc', 'pre_seed', ARRAY['Clean Energy','EV Charging','Hardware'],
   'Las Vegas', 'las_vegas', 0.1, 68, 10, 2023,
   'Extreme fast-charge EV stations combining solar, battery storage, DC coupling. Charges EVs to 80% in 10 min. Clark County pilot near Las Vegas Strip. Plans 250 stations across NV/CA/AZ by 2030. Electrify Nevada cohort.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (134, 'Decentral AI', 'decentral-ai', 'pre_seed', ARRAY['AI','Enterprise Software','Cloud'],
   'Las Vegas', 'las_vegas', 0.1, 62, 10, 2025,
   'Enterprise AI orchestration platform for deploying any AI model across any infrastructure with data sovereignty. $372K ARR. Strategic partnership with VIP Play. Electrify Nevada cohort.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (135, 'Noovo', 'noovo', 'seed', ARRAY['Manufacturing','Housing','Automotive'],
   'North Las Vegas', 'las_vegas', 2, 60, 32, 2020,
   'French-founded manufacturer of tiny houses on wheels and luxury camper vans. Expanding to 20K sq ft LV facility. Starlink integration, RVIA certification. Plans to hire 100 in two years.',
   ARRAY['bbv','fundnv'], 36.24, -115.12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (136, 'Blolabel.ai', 'blolabel-ai', 'pre_seed', ARRAY['AI','Data','MLOps'],
   'Las Vegas', 'las_vegas', 1, 58, 10, 2024,
   'Unified AI DataOps platform — data annotation, QA, fine-tuning, deployment, evaluation. NLP, computer vision, multimodal. Named Top 10 AI Startups in Las Vegas 2026.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

-- ── Electrify Nevada cohort (clean energy cluster) ─────────────────────────

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (137, 'SorbiForce', 'sorbiforce', 'pre_seed', ARRAY['Clean Energy','Battery Storage'],
   'Las Vegas', 'las_vegas', 0.1, 55, 5, 2024,
   'Non-metal battery architecture combining real-time power quality control with energy storage. S&P Global Platts "Rising Star" finalist 2025. Google for Startups funded. Electrify Nevada cohort.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (138, 'X-Regen', 'x-regen', 'pre_seed', ARRAY['Clean Energy','EV','Battery Tech'],
   'Las Vegas', 'las_vegas', 0.1, 52, 5, 2024,
   'Extends EV battery life with patented X-ray regeneration technology. Licenses to auto dealerships. Reduces demand for scarce metals. Electrify Nevada Fall 2025 cohort.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (139, 'Carbo Energy', 'carbo-energy', 'pre_seed', ARRAY['Clean Energy','Battery Storage'],
   'Las Vegas', 'las_vegas', 0.1, 50, 5, 2024,
   'Scalable long-duration flow batteries using recycled industrial waste and repurposed oil infrastructure. Non-flammable, 20+ year lifespan. Electrify Nevada Fall 2025 cohort.',
   ARRAY['bbv','fundnv'], 36.17, -115.14)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (140, 'Metal Light', 'metal-light', 'pre_seed', ARRAY['Clean Energy','Battery Storage'],
   'Reno', 'reno', 0.1, 48, 5, 2024,
   'Zinc Energy Storage System using "metal as a fuel" for cleaner, safer energy storage. Electrify Nevada Fall 2025 Reno cohort.',
   ARRAY['bbv','fundnv'], 39.53, -119.81)
ON CONFLICT (id) DO NOTHING;

-- ── gBETA Reno cohort ──────────────────────────────────────────────────────

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (141, 'Yerka Seed Company', 'yerka-seed-company', 'pre_seed', ARRAY['AgTech','Biotech'],
   'Reno', 'reno', 0.5, 55, 5, 2023,
   'UNR spinout developing drought-tolerant, high-protein sorghum. Patented CrossLock anti-cross-pollination technology. Top-10 Nevada startup at Reno Startup Week 2024. gBETA Reno 2024.',
   ARRAY['bbv','fundnv'], 39.53, -119.81)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (142, 'SLEKE', 'sleke', 'pre_seed', ARRAY['Mobile','Consumer Tech','Software'],
   'Reno', 'reno', 0.1, 50, 5, 2023,
   'Distraction-free smartphone OS (OdysseyOS) targeting Gen Z "dumbphone" movement. Modified CalyxOS/Android 15. Won Tech Start Up of the Year Reno. Founded by UNR graduates. gBETA Reno 2024.',
   ARRAY['bbv','fundnv'], 39.53, -119.81)
ON CONFLICT (id) DO NOTHING;

INSERT INTO companies (id, name, slug, stage, sectors, city, region, funding_m, momentum, employees, founded, description, eligible, lat, lng)
VALUES
  (143, 'Ghostwryte.ai', 'ghostwryte-ai', 'pre_seed', ARRAY['AI','Content','SaaS'],
   'Reno', 'reno', 0.1, 45, 3, 2024,
   'AI copilot for high-volume, personalized text-based content creation. Part of inaugural gBETA Reno cohort (June 2024).',
   ARRAY['bbv','fundnv'], 39.53, -119.81)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to cover new IDs
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

COMMIT;
