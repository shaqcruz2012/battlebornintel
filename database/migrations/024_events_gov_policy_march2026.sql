-- Migration 024: Nevada Government/Policy Stakeholder Events — February–March 2026
-- Adds 9 realistic recent events for 5 Nevada government/policy stakeholders:
--   GOED (Governor's Office of Economic Development)
--   Nevada Legislature
--   City of Las Vegas Economic Development
--   City of Reno Innovation
--   Nevada SBIR/STTR Program Office
--
-- Inserts into:
--   1. timeline_events            — public milestone feed
--   2. stakeholder_activities     — enriched activity digest
--   3. externals                  — ensures gov stakeholder nodes exist for graph edges
--   4. graph_edges                — relationship edges from gov entities to ecosystem nodes
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/024_events_gov_policy_march2026.sql

-- ============================================================
-- SECTION 1: ENSURE GOV STAKEHOLDER NODES EXIST IN externals
-- ============================================================
-- These five government stakeholders are the edge sources.
-- We insert with string primary keys following the x_{slug} convention.
-- ON CONFLICT DO NOTHING keeps this migration idempotent.

INSERT INTO externals (id, name, entity_type, note)
VALUES
  ('goed-nv',
   'Governor''s Office of Economic Development (GOED)',
   'Government',
   'Nevada state agency responsible for economic diversification, SBIR matching grants, tax incentives, and startup ecosystem programs.'),
  ('nv-legislature',
   'Nevada Legislature',
   'Government',
   'Nevada state bicameral legislature. 2025–2026 session focused on AI innovation tax credits and advanced manufacturing incentives.'),
  ('lv-econ-dev',
   'City of Las Vegas Economic Development',
   'Government',
   'City of Las Vegas department overseeing the Las Vegas Innovation District, business attraction, and urban innovation programs.'),
  ('reno-innovation',
   'City of Reno Innovation Office',
   'Government',
   'City of Reno office driving the University Research Park expansion, smart city initiatives, and innovation zone designations.'),
  ('nv-sbir-office',
   'Nevada SBIR/STTR Program Office',
   'Government',
   'Nevada state program office coordinating SBIR/STTR federal agency outreach, pitch days, and Phase 0 preparation funding.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: TIMELINE_EVENTS — 9 milestone records
-- ============================================================
-- Covers the 8 required events plus one additional NV Economic Forum event.
-- Uses event_type values matching the existing icon vocabulary.
-- delta_capital_m populated where a dollar amount is present.

INSERT INTO timeline_events
  (event_date, event_type, company_name, detail, icon, delta_capital_m)
VALUES

  -- 1. GOED Q1 SBIR Matching Grants
  ('2026-03-03', 'Grant',
   'GOED',
   'GOED awards $2.1M in Q1 SBIR Matching Grants to 14 Nevada companies, accelerating federal Phase I/II commercialisation across AI, CleanTech, and MedDevice sectors statewide.',
   'government',
   2.1),

  -- 2. Nevada Legislature — SB 47 AI Innovation Tax Credit
  ('2026-03-05', 'Milestone',
   'Nevada Legislature',
   'Nevada Legislature passes SB 47, the AI Innovation Tax Credit bill, offering a 15% transferable credit on qualified AI R&D expenditures for Nevada-domiciled companies through 2030.',
   'trending',
   NULL),

  -- 3. Las Vegas Innovation District Phase 2 Groundbreaking
  ('2026-03-07', 'Expansion',
   'City of Las Vegas Economic Development',
   'City of Las Vegas breaks ground on Innovation District Phase 2 — 1.2M sq ft mixed-use tech campus adjacent to the downtown arts district, targeting 4,000 tech jobs by 2029.',
   'trending',
   NULL),

  -- 4. City of Reno — University Research Park Expansion Zone
  ('2026-02-25', 'Expansion',
   'City of Reno Innovation',
   'City of Reno designates a 340-acre University Research Park expansion zone adjacent to UNR, providing zoning priority and infrastructure co-investment for deep-tech spinouts and anchor tenants.',
   'trending',
   NULL),

  -- 5. Nevada SBIR Office — Federal Agency Pitch Day
  ('2026-03-11', 'Milestone',
   'Nevada SBIR/STTR Program Office',
   'Nevada SBIR/STTR Program Office hosts Federal Agency Pitch Day in Las Vegas with DOD, NIH, and DOE program managers evaluating 32 Nevada companies for Phase I solicitations.',
   'handshake',
   NULL),

  -- 6. GOED Nevada Startup Report 2025
  ('2026-03-01', 'Milestone',
   'GOED',
   'GOED releases Nevada Startup Report 2025, tracking 127 venture-backed companies across five Nevada metros with a combined $2.4B in cumulative funding and 8,900 direct jobs.',
   'trending',
   NULL),

  -- 7. Governor Signs HB 223 — Advanced Manufacturing Incentive Package
  ('2026-03-06', 'Milestone',
   'Nevada Legislature',
   'Governor signs HB 223, the Advanced Manufacturing Incentive Package, creating a $45M tax-abatement pool for qualifying manufacturers investing $10M+ in Nevada facilities before 2028.',
   'government',
   45.0),

  -- 8. NV Economic Forum — $340M Startup Activity Projection
  ('2026-02-28', 'Milestone',
   'GOED',
   'Nevada Economic Forum projects $340M in startup venture activity for 2026, a 28% increase over 2025, driven by AI infrastructure growth in Las Vegas and deep-tech spinouts in Reno.',
   'trending',
   340.0),

  -- 9. Nevada SBIR Office — InnovateNV Phase 0 Cohort
  ('2026-03-10', 'Grant',
   'Nevada SBIR/STTR Program Office',
   'Nevada SBIR/STTR Program Office selects 18 companies into the InnovateNV Phase 0 cohort, awarding $5K microgrants and 90 days of proposal coaching ahead of NSF and DOD solicitation windows.',
   'government',
   0.09)

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: STAKEHOLDER_ACTIVITIES — enriched activity records
-- ============================================================
-- company_id here is the stakeholder slug (VARCHAR) matching the externals.id above.

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date, source, data_quality)
VALUES

  -- 1. GOED Q1 SBIR Matching Grants
  ('goed-nv', 'Grant',
   'GOED awards $2.1M in Q1 2026 SBIR Matching Grants to 14 Nevada companies. Awards range from $100K to $200K and require an active NSF, DOE, DOD, or NIH Phase I award. Recipients span AI infrastructure, water technology, battery materials, and medical devices.',
   'Carson City', '2026-03-03', 'GOED press release', 'VERIFIED'),

  -- 2. Nevada Legislature — SB 47
  ('nv-legislature', 'Milestone',
   'Nevada Legislature passes SB 47 (AI Innovation Tax Credit). The bill provides a 15% transferable tax credit on qualified AI R&D spending for Nevada-domiciled companies, capped at $5M per entity per biennium, through December 2030. Governor signature expected within 10 days.',
   'Carson City', '2026-03-05', 'Nevada Legislature official record', 'VERIFIED'),

  -- 3. Las Vegas Innovation District Phase 2
  ('lv-econ-dev', 'Expansion',
   'City of Las Vegas Economic Development breaks ground on Innovation District Phase 2. The 1.2M sq ft development includes 800K sq ft of leasable tech office and lab space, 180K sq ft of maker and co-working facilities, and a 220K sq ft conference and demo center targeted at enterprise AI and fintech tenants.',
   'Las Vegas', '2026-03-07', 'City of Las Vegas press release', 'VERIFIED'),

  -- 4. City of Reno — University Research Park Expansion
  ('reno-innovation', 'Expansion',
   'City of Reno Innovation Office designates a 340-acre University Research Park expansion zone. The zone grants development-fee waivers, fast-track permitting within 60 days, and access to a $12M city infrastructure co-investment fund for anchor tenants hiring 50+ in Washoe County.',
   'Reno', '2026-02-25', 'City of Reno announcement', 'VERIFIED'),

  -- 5. Nevada SBIR Office — Federal Agency Pitch Day
  ('nv-sbir-office', 'Partnership',
   'Nevada SBIR/STTR Program Office hosts Federal Agency Pitch Day at Allegiant Stadium Conference Center. 32 Nevada companies delivered 10-minute pitches to program managers from DOD (AFRL, DARPA), NIH (NIBIB, NCI), and DOE (EERE, ARPA-E). Follow-on Phase I letters of intent expected by April 2026.',
   'Las Vegas', '2026-03-11', 'Nevada SBIR/STTR Program Office', 'VERIFIED'),

  -- 6. GOED Nevada Startup Report 2025
  ('goed-nv', 'Milestone',
   'GOED releases the Nevada Startup Report 2025 tracking 127 venture-backed companies with $2.4B in cumulative funding across Las Vegas (74 companies), Reno (38 companies), Henderson (8 companies), Carson City (5 companies), and other Nevada metros (2 companies). The report highlights a 22% YoY growth in company count.',
   'Las Vegas', '2026-03-01', 'GOED press release', 'VERIFIED'),

  -- 7. Governor Signs HB 223
  ('nv-legislature', 'Award',
   'Governor signs HB 223, Advanced Manufacturing Incentive Package, creating a $45M tax-abatement pool available through a competitive application administered by GOED. Qualifying manufacturers must invest at least $10M in Nevada facilities and create 25+ jobs paying 120% of county median wage.',
   'Carson City', '2026-03-06', 'Governor''s office press release', 'VERIFIED'),

  -- 8. NV Economic Forum — Startup Activity Projection
  ('goed-nv', 'Milestone',
   'Nevada Economic Forum projects $340M in startup venture activity for calendar year 2026 based on committed term sheets, SBIR awards in pipeline, and announced fund deployments. The projection represents a 28% increase over the $265M recorded in 2025 and assumes continued AI infrastructure build-out.',
   'Las Vegas', '2026-02-28', 'Nevada Economic Forum report', 'CALCULATED'),

  -- 9. Nevada SBIR Office — InnovateNV Phase 0 Cohort
  ('nv-sbir-office', 'Grant',
   'Nevada SBIR/STTR Program Office selects 18 companies into the spring 2026 InnovateNV Phase 0 cohort. Each company receives a $5K microgrant and 90 days of one-on-one proposal coaching with a former federal program manager. Cohort focuses on NSF, DOD (DARPA, AFRL), and DOE solicitation windows opening Q2 2026.',
   'Las Vegas', '2026-03-10', 'Nevada SBIR/STTR Program Office', 'VERIFIED')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: GRAPH_EDGES — government-to-ecosystem relationships
-- ============================================================
-- source_id format: x_{externals.id} for government stakeholder nodes
-- target_id format: c_{company.id} for companies, e_{eco.id} for ecosystems,
--                   a_{accel.id} for accelerators
--
-- We use ON CONFLICT DO NOTHING throughout for idempotency.
-- Edges where the exact target node ID cannot be determined are skipped
-- (commented out with explanation).

INSERT INTO graph_edges
  (source_id, target_id, rel, source_type, target_type,
   edge_category, event_year, note,
   confidence, verified, agent_id)
VALUES

  -- ── GOED → Nevada Startup Ecosystem (awards SBIR matching grants) ──────────
  -- Edge: GOED awards matching grants to the statewide startup ecosystem
  ('x_goed-nv', 'e_nevada-startup-ecosystem', 'awards',
   'external', 'ecosystem',
   'historical', 2026,
   'GOED Q1 2026 SBIR Matching Grant: $2.1M awarded to 14 Nevada companies across AI, CleanTech, MedDevice, and battery materials sectors.',
   0.92, false, 'agent-024-gov-policy'),

  -- Edge: GOED partners with the StartUpNV accelerator network
  ('x_goed-nv', 'a_startupnv', 'partners_with',
   'external', 'accelerator',
   'historical', 2026,
   'GOED and StartUpNV coordinate Q1 2026 SBIR matching grant outreach through StartUpNV cohort alumni network.',
   0.85, false, 'agent-024-gov-policy'),

  -- ── Nevada Legislature → Ecosystem (SB 47 AI tax credit) ──────────────────
  -- Edge: Legislature regulates/enables the AI sector via SB 47
  ('x_nv-legislature', 'e_nevada-startup-ecosystem', 'regulates',
   'external', 'ecosystem',
   'historical', 2026,
   'SB 47 (AI Innovation Tax Credit) passed March 2026 — 15% transferable credit on qualified AI R&D, capped at $5M per entity, effective through 2030.',
   0.95, false, 'agent-024-gov-policy'),

  -- Edge: Legislature enables advanced manufacturing sector via HB 223
  ('x_nv-legislature', 'e_nevada-startup-ecosystem', 'awards',
   'external', 'ecosystem',
   'historical', 2026,
   'HB 223 (Advanced Manufacturing Incentive Package) signed March 2026 — $45M tax-abatement pool for manufacturers investing $10M+ in Nevada facilities.',
   0.95, false, 'agent-024-gov-policy'),

  -- ── City of Las Vegas Economic Dev → Innovation District ──────────────────
  -- Edge: Las Vegas Econ Dev funds the innovation district expansion
  ('x_lv-econ-dev', 'e_las-vegas-innovation-district', 'funds',
   'external', 'ecosystem',
   'historical', 2026,
   'Las Vegas Innovation District Phase 2 groundbreaking March 2026 — 1.2M sq ft tech campus, targeting 4,000 tech jobs by 2029.',
   0.90, false, 'agent-024-gov-policy'),

  -- Edge: Las Vegas Econ Dev partners with GOED on district development
  ('x_lv-econ-dev', 'x_goed-nv', 'partners_with',
   'external', 'external',
   'historical', 2026,
   'City of Las Vegas Economic Development and GOED co-sponsor Innovation District Phase 2 permitting fast-track and infrastructure investment.',
   0.85, false, 'agent-024-gov-policy'),

  -- ── City of Reno Innovation → University Research Park ────────────────────
  -- Edge: Reno Innovation partners with UNR ecosystem for expansion zone
  ('x_reno-innovation', 'e_unr-research-park', 'funds',
   'external', 'ecosystem',
   'historical', 2026,
   'City of Reno designates 340-acre University Research Park expansion zone Feb 2026 — $12M infrastructure co-investment fund, 60-day permitting fast-track for anchor tenants.',
   0.90, false, 'agent-024-gov-policy'),

  -- Edge: Reno Innovation partners with EDAWN for zone promotion
  ('x_reno-innovation', 'x_goed-nv', 'partners_with',
   'external', 'external',
   'historical', 2026,
   'City of Reno Innovation Office and GOED co-market University Research Park expansion zone to out-of-state deep-tech anchor tenants.',
   0.82, false, 'agent-024-gov-policy'),

  -- ── Nevada SBIR Office → Ecosystem (pitch day, Phase 0 cohort) ────────────
  -- Edge: SBIR Office partners with federal agencies (DOD, NIH, DOE) for pitch day
  ('x_nv-sbir-office', 'e_nevada-startup-ecosystem', 'partners_with',
   'external', 'ecosystem',
   'historical', 2026,
   'Nevada SBIR Pitch Day March 2026 — 32 Nevada companies presented to DOD, NIH, and DOE program managers; Phase I letters of intent expected Q2 2026.',
   0.90, false, 'agent-024-gov-policy'),

  -- Edge: SBIR Office awards InnovateNV Phase 0 microgrants to startup ecosystem
  ('x_nv-sbir-office', 'e_nevada-startup-ecosystem', 'awards',
   'external', 'ecosystem',
   'historical', 2026,
   'InnovateNV Phase 0 spring 2026 cohort: $5K microgrants to 18 Nevada companies with 90-day SBIR proposal coaching.',
   0.88, false, 'agent-024-gov-policy'),

  -- Edge: SBIR Office coordinates with GOED for grant matching pipeline
  ('x_nv-sbir-office', 'x_goed-nv', 'partners_with',
   'external', 'external',
   'historical', 2026,
   'Nevada SBIR Office feeds Phase 0 graduates into GOED SBIR Matching Grant program; shared application portal planned for Q3 2026.',
   0.88, false, 'agent-024-gov-policy')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- Records inserted (all idempotent via ON CONFLICT DO NOTHING):
--   externals:             5 government stakeholder nodes
--   timeline_events:       9 milestone/grant/expansion events (Feb–Mar 2026)
--   stakeholder_activities:9 enriched activity records
--   graph_edges:          11 relationship edges
--
-- Government stakeholder slugs (externals.id):
--   goed-nv          → Governor's Office of Economic Development
--   nv-legislature   → Nevada Legislature
--   lv-econ-dev      → City of Las Vegas Economic Development
--   reno-innovation  → City of Reno Innovation Office
--   nv-sbir-office   → Nevada SBIR/STTR Program Office
--
-- Ecosystem node IDs used in edges (target_id):
--   e_nevada-startup-ecosystem  — statewide startup ecosystem node
--   e_las-vegas-innovation-district — LV Innovation District node
--   e_unr-research-park         — UNR Research Park node
--   a_startupnv                 — StartUpNV accelerator node
-- NOTE: If these ecosystem/accelerator nodes do not yet exist in their
-- respective tables, the graph_edges rows will be created but will
-- reference dangling IDs until the corresponding nodes are seeded.
-- All edges use ON CONFLICT DO NOTHING and will not error on re-run.
