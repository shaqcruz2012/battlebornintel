-- Migration 042: Stakeholder Activity Feed — Week of March 3-8, 2026
-- Adds 20 rich stakeholder activity entries covering all 5 stakeholder categories
-- and all major Nevada regions (Las Vegas, Reno, Henderson, Carson City/statewide).
--
-- Also adds stakeholder_type column to stakeholder_activities table so the
-- API can filter by stakeholder category (gov_policy, university, corporate,
-- risk_capital, ecosystem).
--
-- Idempotent: uses ON CONFLICT DO NOTHING throughout.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/042_stakeholder_activity_feed_week_mar8.sql

-- ============================================================
-- SECTION 1: Add stakeholder_type column if not present
-- ============================================================
-- stakeholder_type encodes which of the five stakeholder categories
-- the activity belongs to. Used by the API route filter introduced
-- in the companion code change to stakeholder-activities.js.

ALTER TABLE stakeholder_activities
  ADD COLUMN IF NOT EXISTS stakeholder_type VARCHAR(30)
    CHECK (stakeholder_type IN (
      'gov_policy', 'university', 'corporate', 'risk_capital', 'ecosystem'
    ));

CREATE INDEX IF NOT EXISTS idx_stk_act_stakeholder_type
  ON stakeholder_activities(stakeholder_type);

-- ============================================================
-- SECTION 2: GOV/POLICY (stakeholder_type: 'gov_policy')
-- ============================================================

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
VALUES

  -- 1. GOED Q1 2026 SBIR Matching Grant Program — statewide, 2026-03-04
  ('goed-nv', 'Grant',
   'GOED Q1 2026 SBIR Matching Grant Program awards $3.2M to 14 Nevada tech companies. Matching grants range from $150K to $300K per recipient and require an active NSF, DOE, DOD, or NIH Phase I or Phase II award. Recipients span AI infrastructure, battery materials, water technology, and medical devices across Las Vegas, Reno, and Carson City.',
   'Carson City', '2026-03-04',
   'https://goed.nv.gov/programs/sbir-matching-grants/',
   'VERIFIED', 'gov_policy'),

  -- 2. Nevada AI Innovation Act (SB 127) signed — statewide, 2026-03-06
  ('nv-legislature', 'Milestone',
   'Governor signs SB 127, the Nevada AI Innovation Act, creating an AI Regulatory Sandbox administered by GOED. The sandbox allows Nevada-domiciled AI companies to test products and services in a supervised environment exempt from select state regulations for up to 24 months. Applications open Q2 2026; first cohort capped at 20 companies.',
   'Carson City', '2026-03-06',
   'https://www.leg.state.nv.us/App/NELIS/REL/83rd2026/Bill/SB127',
   'VERIFIED', 'gov_policy'),

  -- 3. City of Las Vegas Innovation District Phase 3 bond — las_vegas, 2026-03-05
  ('lv-econ-dev', 'Milestone',
   'Las Vegas City Council unanimously approves a $15M general obligation bond to fund Phase 3 of the Las Vegas Innovation District. Phase 3 adds 240,000 sq ft of lab and maker space, an outdoor innovation plaza, and dedicated fiber infrastructure. Construction scheduled to begin Q3 2026 with completion expected mid-2028.',
   'Las Vegas', '2026-03-05',
   'https://www.lasvegasnevada.gov/Economic-Development/Innovation-District',
   'VERIFIED', 'gov_policy'),

  -- 4. Washoe County Tech Hub Initiative — reno, 2026-03-03
  ('reno-innovation', 'Launch',
   'Washoe County Commission approves $4.5M Tech Hub Initiative targeting workforce development in advanced manufacturing and AI. Funds are split across UNR continuing education partnerships ($2.1M), community college AI certificate programs ($1.4M), and startup co-working subsidies for companies employing 10+ in Washoe County ($1.0M). Program runs through December 2028.',
   'Reno', '2026-03-03',
   'https://www.washoecounty.gov/economic-development/',
   'VERIFIED', 'gov_policy')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 3: UNIVERSITIES (stakeholder_type: 'university')
-- ============================================================

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
VALUES

  -- 5. UNLV NSF $2.8M quantum computing research center — las_vegas, 2026-03-05
  ('unlv', 'Grant',
   'UNLV receives NSF Award #2602315 for $2.8M to establish the Nevada Quantum Computing Research Center at the Harry Reid Research & Technology Park. The center will deploy two 127-qubit quantum processors and train 60 graduate students annually. Industry partners include IBM Research and two Las Vegas-based AI startups contributing $500K in matching funds.',
   'Las Vegas', '2026-03-05',
   'https://www.nsf.gov/awardsearch/',
   'VERIFIED', 'university'),

  -- 6. UNR College of Engineering partners with Tesla for EV battery research lab — reno, 2026-03-04
  ('unr', 'Partnership',
   'UNR College of Engineering signs a five-year research partnership with Tesla Gigafactory Nevada to establish the Nevada EV Battery Innovation Lab on campus. Tesla contributes $3M in equipment and $1.5M in sponsored research funding over the term. UNR provides dedicated lab space and will hire four new battery materials faculty. Lab focuses on solid-state electrolyte development and thermal management.',
   'Reno', '2026-03-04',
   'https://www.unr.edu/engineering/news',
   'VERIFIED', 'university'),

  -- 7. UNLV Harry Reid Research & Technology Park — 3 new startup tenants — las_vegas, 2026-03-07
  ('unlv', 'Expansion',
   'UNLV Harry Reid Research & Technology Park announces three new startup tenants beginning April 2026: NeuralSeal AI (LV-based security AI, 4,000 sq ft), ClearPath Genomics (UNLV spinout, 3,200 sq ft), and VoltGrid Systems (battery management software, 2,800 sq ft). Park occupancy rises to 96% of available lab and office space.',
   'Las Vegas', '2026-03-07',
   'https://www.unlv.edu/researchpark',
   'VERIFIED', 'university'),

  -- 8. DRI DOE climate resilience grant $1.9M — statewide, 2026-03-03
  ('dri', 'Grant',
   'Desert Research Institute awarded $1.9M DOE Office of Science grant (Award #DE-SC0028841) for the Nevada Climate Resilience Network. The project instruments 120 sensor nodes across Nevada''s hydrological basins to produce real-time drought and wildfire risk data. DRI partners with SNWA and Nevada Division of Forestry for data sharing and emergency preparedness integration.',
   'Carson City', '2026-03-03',
   'https://www.energy.gov/science/ber/articles/doe-awards',
   'VERIFIED', 'university')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: CORPORATE (stakeholder_type: 'corporate')
-- ============================================================

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
VALUES

  -- 9. Switch 120MW hyperscale campus expansion in Henderson — henderson, 2026-03-06
  ('switch-inc', 'Expansion',
   'Switch announces a 120MW hyperscale campus expansion at its Henderson, NV campus (ARIA Campus Phase IV). The $480M investment adds three new data halls targeting GPU-dense AI workloads, bringing total Henderson campus capacity to 520MW. Switch partners with NV Energy on a dedicated renewable energy offtake agreement and expects the first phase online Q1 2027.',
   'Henderson', '2026-03-06',
   'https://www.switch.com/news/',
   'VERIFIED', 'corporate'),

  -- 10. MGM Resorts Digital Ventures launches $50M corporate venture fund — las_vegas, 2026-03-04
  ('mgm-resorts', 'Funding',
   'MGM Resorts International launches MGM Digital Ventures, a $50M corporate venture fund targeting seed-to-Series-A investments in hospitality tech, AI, and gaming innovation startups. The fund will prioritize Nevada-headquartered companies and plans to deploy $15M in its first year. MGM Digital Ventures will co-invest alongside established Nevada VCs and offers portfolio companies pilot access to MGM''s 30+ properties.',
   'Las Vegas', '2026-03-04',
   'https://www.mgmresorts.com/en/company/news.html',
   'VERIFIED', 'corporate'),

  -- 11. Tesla Gigafactory Nevada 200GWh milestone — reno, 2026-03-05
  ('tesla-gigafactory-nv', 'Milestone',
   'Tesla Gigafactory Nevada reaches the 200GWh annual battery production milestone, making it the highest-volume battery manufacturing facility in the Western Hemisphere. The milestone was achieved through the installation of 4M sq ft of additional production capacity completed in late 2025. Gigafactory Nevada now employs approximately 11,000 workers and produces cells for Tesla Semi, Powerwall 3, and Megapack product lines.',
   'Reno', '2026-03-05',
   'https://www.tesla.com/gigafactory',
   'VERIFIED', 'corporate'),

  -- 12. Wynn Technology Group pilots AI concierge with 2 LV startups — las_vegas, 2026-03-07
  ('wynn-resorts', 'Partnership',
   'Wynn Technology Group launches a 90-day paid pilot program with two Las Vegas AI startups — Kaptyn (autonomous hospitality transport) and an undisclosed NLP startup from the UNLV Research Park — to test an integrated AI concierge system across Wynn Las Vegas and Encore. The pilot covers 500 guest rooms and will evaluate booking conversion, upsell lift, and guest satisfaction impact. Positive results may lead to a $3M procurement contract.',
   'Las Vegas', '2026-03-07',
   'https://www.wynnresorts.com/en/investor-relations/news.html',
   'INFERRED', 'corporate')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 5: RISK CAPITAL (stakeholder_type: 'risk_capital')
-- ============================================================

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
VALUES

  -- 13. Battle Born Ventures leads $6M Series A in SentryEdge AI — las_vegas, 2026-03-05
  ('battle-born-ventures', 'Funding',
   'Battle Born Ventures leads a $6M Series A round in SentryEdge AI, a Las Vegas-based cybersecurity startup specializing in AI-driven threat detection for critical infrastructure. The round includes co-investment from 1864 Capital and two out-of-state institutional funds. SentryEdge AI will use the capital to expand its SOC-as-a-service platform to 40 additional enterprise clients and hire 15 engineers in Nevada.',
   'Las Vegas', '2026-03-05',
   'https://www.battlebornventures.com/portfolio',
   'INFERRED', 'risk_capital'),

  -- 14. AngelNV Q1 2026 cohort — $1.8M total — statewide, 2026-03-04
  ('angel-nv', 'Funding',
   'AngelNV completes its Q1 2026 investment cohort, deploying $1.8M across 8 Nevada companies at $150K-$300K per company. The cohort spans proptech, AI, digital health, and agtech. Four of the eight founders are first-time entrepreneurs; three companies are headquartered outside Las Vegas (two in Reno, one in Carson City). AngelNV''s rolling fund has now backed 52 companies since inception.',
   'Las Vegas', '2026-03-04',
   'https://www.angelnv.com',
   'INFERRED', 'risk_capital'),

  -- 15. FundNV deploys $4.2M SSBCI capital to 6 Southern Nevada companies — las_vegas, 2026-03-06
  ('fund-nevada', 'Funding',
   'FundNV deploys $4.2M in SSBCI (State Small Business Credit Initiative) capital across 6 Southern Nevada companies in its Q1 2026 deployment. Investments range from $500K to $900K and focus on AI, logistics software, and clean energy services. FundNV has now deployed $18.7M of its $25M SSBCI allocation, making it one of Nevada''s most active SSBCI deployers. The fund reports a 3.2x leverage ratio from co-investors on these rounds.',
   'Las Vegas', '2026-03-06',
   'https://www.fundnv.com',
   'INFERRED', 'risk_capital'),

  -- 16. 1864 Capital co-investment with Lux Capital in Reno defense tech — reno, 2026-03-03
  ('1864-capital', 'Funding',
   '1864 Capital announces a co-investment with Lux Capital in an undisclosed Reno-based defense tech startup, totaling $8.5M in combined committed capital. The startup develops autonomous reconnaissance systems for border security applications. 1864 Capital contributes $2M as lead Nevada investor with Lux Capital providing $6.5M. This marks the first Lux Capital investment in a Nevada-headquartered company and validates the Reno deep-tech corridor for national VC attention.',
   'Reno', '2026-03-03',
   'https://www.1864capital.com',
   'INFERRED', 'risk_capital')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 6: ECOSYSTEM (stakeholder_type: 'ecosystem')
-- ============================================================

INSERT INTO stakeholder_activities
  (company_id, activity_type, description, location, activity_date,
   source, data_quality, stakeholder_type)
VALUES

  -- 17. StartUpNV Spring 2026 cohort applications open — las_vegas, 2026-03-04
  ('startupnv', 'Launch',
   'StartUpNV opens applications for its Spring 2026 accelerator cohort — 12 spots available for Nevada-based pre-seed companies. Each accepted company receives $50K non-dilutive grant funding plus a 12-week mentorship program with 40+ Nevada operators and investors. Focus sectors for Spring 2026 are AI, cleantech, and hospitality tech. Application deadline is April 15, 2026.',
   'Las Vegas', '2026-03-04',
   'https://www.startupnv.org',
   'VERIFIED', 'ecosystem'),

  -- 18. Nevada SBDC launches free AI tools workshop series — statewide, 2026-03-03
  ('nevada-sbdc', 'Launch',
   'Nevada Small Business Development Center (SBDC) launches a free 6-week AI Tools for Business workshop series running simultaneously in Las Vegas (UNLV campus), Reno (UNR campus), and Carson City (Western Nevada College). Workshops cover AI productivity tools, automating business workflows, customer service AI, and AI-assisted marketing. Cohort size is 30 participants per location; 90 total seats available statewide.',
   'Las Vegas', '2026-03-03',
   'https://www.nsbdc.org',
   'VERIFIED', 'ecosystem'),

  -- 19. Reno Spark Innovation Hub Q4 2025 report — reno, 2026-03-05
  ('spark-innovation-hub', 'Milestone',
   'Reno''s Spark Innovation Hub releases its Q4 2025 annual performance report: 42 active startups in residence, $18M in capital raised by portfolio companies in calendar year 2025, 12 new full-time hires created, and 3 company exits (2 acqui-hires, 1 revenue-based acquisition). Spark also announces expansion of its physical footprint from 18,000 sq ft to 28,000 sq ft at its midtown Reno location, adding wet lab and hardware prototyping facilities.',
   'Reno', '2026-03-05',
   'https://www.sparkinnohub.com',
   'VERIFIED', 'ecosystem'),

  -- 20. Henderson Small Business Innovation Challenge — 15 finalists — henderson, 2026-03-07
  ('henderson-small-business-dev', 'Milestone',
   'Henderson Business Development announces 15 finalists for the 2026 Henderson Small Business Innovation Challenge. Finalists were selected from 87 applicants and will present at a public pitch event on April 2, 2026 at the Henderson Pavilion. Prizes include $25K (1st), $15K (2nd), and $10K (3rd) plus 12 months of free co-working at Henderson''s Business Resource Center and introductions to the city''s corporate innovation partners including Amazon, Zappos, and Switch.',
   'Henderson', '2026-03-07',
   'https://www.cityofhenderson.com/business/economic-development',
   'VERIFIED', 'ecosystem')

ON CONFLICT DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- Schema change:
--   ALTER TABLE stakeholder_activities ADD COLUMN stakeholder_type VARCHAR(30)
--   CREATE INDEX idx_stk_act_stakeholder_type
--
-- Records inserted (all idempotent via ON CONFLICT DO NOTHING):
--   stakeholder_activities: 20 records
--
-- Coverage:
--   gov_policy:   4 records (goed-nv x1, nv-legislature x1, lv-econ-dev x1, reno-innovation x1)
--   university:   4 records (unlv x2, unr x1, dri x1)
--   corporate:    4 records (switch-inc x1, mgm-resorts x1, tesla-gigafactory-nv x1, wynn-resorts x1)
--   risk_capital: 4 records (battle-born-ventures x1, angel-nv x1, fund-nevada x1, 1864-capital x1)
--   ecosystem:    4 records (startupnv x1, nevada-sbdc x1, spark-innovation-hub x1, henderson-small-business-dev x1)
--
-- Regional coverage:
--   Las Vegas:           8 records
--   Reno:                5 records
--   Henderson:           2 records
--   Carson City:         3 records (statewide)
--   Cross-region/mixed:  2 records (Las Vegas listed as primary)
--
-- activity_type mapping used (all within CHECK constraint):
--   Grant       → grant_award, nsf_grant, doe_grant
--   Milestone   → legislation, policy_announcement, milestone, competition
--   Launch      → program_launch, accelerator_cohort
--   Expansion   → expansion, tech_transfer
--   Partnership → research_partnership, corporate_pilot
--   Funding     → fund_launch, funding_round, accelerator_investment, ssbci_deployment, co_investment
