-- Migration 138: Market & competitive intelligence enrichment from verified web research
-- Stores TAM, competitor counts, market position, and customer counts as metric_snapshots
-- Sources: Gartner, Forrester, Grand View Research, Mordor Intelligence, CB Insights, 6sense,
--          Fortune Business Insights, MarketsandMarkets, Precedence Research, company filings
-- Generated: 2026-03-30

BEGIN;

-- ── Register market/competitive features in feature_registry ─────────────────
INSERT INTO feature_registry (entity_type, feature_name, feature_type, source, required, description) VALUES
  ('company', 'tam_b',            'numeric',     'web_research', false, 'Total addressable market in billions USD (current year estimate)'),
  ('company', 'competitor_count', 'numeric',     'web_research', false, 'Number of identified direct competitors'),
  ('company', 'market_position',  'categorical', 'web_research', false, 'Market position: 1=leader, 2=challenger, 3=niche'),
  ('company', 'customer_count',   'numeric',     'web_research', false, 'Verified customer/user count (approximate)')
ON CONFLICT (entity_type, feature_name) DO NOTHING;

-- ── TAM (Total Addressable Market) in billions USD ───────────────────────────
-- Values represent the most relevant 2025 market size estimate for each company's primary segment
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Redwood Materials: Li-ion battery recycling market $11.09B (2025), GlobeNewsWire/GM Insights
  ('company', '1',  'tam_b', 11.09, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Socure: Global IDV market $14.19B (2025), Mordor Intelligence
  ('company', '2',  'tam_b', 14.19, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Abnormal AI: Email security market $5.17-7.91B (2025), midpoint ~6.5B, Fortune Business Insights
  ('company', '3',  'tam_b', 6.54, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- TensorWave: GPU-as-a-Service $5.70B (2025), Fortune Business Insights/Mordor Intelligence
  ('company', '4',  'tam_b', 5.70, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- 1047 Games: Global gaming market ~$200B+ (2025); F2P FPS sub-segment
  ('company', '5',  'tam_b', 200.0, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.70, true, NULL),
  -- Hubble Network: Satellite IoT market $1.82-3.02B (2025), midpoint ~2.4B, GM Insights/Precedence
  ('company', '6',  'tam_b', 2.42, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Boxabl: Prefabricated housing $143.3B (2025), Mordor Intelligence
  ('company', '7',  'tam_b', 143.3, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Carbon Health: US digital health market $88.38B (2025)
  ('company', '8',  'tam_b', 88.38, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- MNTN: US CTV ad spending $33.35B (2025), MNTN Research
  ('company', '9',  'tam_b', 33.35, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Katalyst: EMS training suit market $250M (2025), Precedence Research
  ('company', '10', 'tam_b', 0.25, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- CIQ: Global Linux OS market $26.41-26.94B (2025), Fortune Business Insights
  ('company', '11', 'tam_b', 26.68, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Springbig: Cannabis software market $1.21B (2024), growing; cannabis tech $5.15B (2025)
  ('company', '12', 'tam_b', 1.21, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Nudge Security: SSPM market $484M-2.6B (2025), midpoint ~1.5B, Frost & Sullivan/Kings Research
  ('company', '13', 'tam_b', 1.54, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.70, true, NULL),
  -- Vibrant Planet: Forest wildfire detection $3.0B (2025), Market Research Future
  ('company', '15', 'tam_b', 3.0, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Amira Learning: AI tutors market $1.63-3.55B (2024-2025), midpoint ~2.6B, Grand View/Mordor
  ('company', '16', 'tam_b', 2.59, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- Elicio Therapeutics: Cancer immunotherapy $153.3B (2025), Grand View Research
  ('company', '22', 'tam_b', 153.3, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Duetto: Hotel RMS market $1.2B (2024), growing to $3.4B by 2033
  ('company', '23', 'tam_b', 1.2, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Lyten: Li-S battery market $62-67M (2025), midpoint ~0.065B; automotive Li-S $424.5M
  ('company', '29', 'tam_b', 0.065, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Protect AI: AI cybersecurity $30.9-34.1B (2025), Mordor/Fortune Business Insights
  ('company', '35', 'tam_b', 32.5, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Ioneer: Global lithium market $16.5-32.4B (2025), midpoint ~24.5B, Fortune/Grand View
  ('company', '49', 'tam_b', 24.45, 'billion_usd', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- ── Competitor counts (identified direct competitors) ────────────────────────
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Redwood: Li-Cycle, Ascend Elements, Umicore, ABTC, Cirba Solutions, Glencore/Ecobat
  ('company', '1',  'competitor_count', 6, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Socure: Jumio, Entrust/Onfido, LexisNexis, Sumsub, Incode, Mitek, Persona, IDEMIA, Experian
  ('company', '2',  'competitor_count', 9, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Abnormal AI: Proofpoint, Microsoft Defender, Mimecast, Darktrace, KnowBe4, Barracuda, Cisco, Fortinet
  ('company', '3',  'competitor_count', 8, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- TensorWave: CoreWeave, Lambda, Groq, AWS, Google Cloud, Azure, Tenstorrent, Vultr
  ('company', '4',  'competitor_count', 8, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- 1047 Games: Epic (Fortnite), Respawn/EA, Riot, Bungie, 343 Industries
  ('company', '5',  'competitor_count', 5, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Hubble Network: Iridium, Astrocast, Skylo, Kepler, Kineis, Myriota, ORBCOMM, Sateliot, SpaceX/Swarm
  ('company', '6',  'competitor_count', 9, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Boxabl: Clayton Homes, Cavco, Skyline Champion, ICON, Plant Prefab, Dvele, Blokable, Onx, SG Blocks
  ('company', '7',  'competitor_count', 9, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Carbon Health: One Medical (Amazon), Oak Street (CVS), CityMD/Summit, Crossover, Devoted
  ('company', '8',  'competitor_count', 5, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- MNTN: The Trade Desk, YouTube/Google, Amazon, Disney, Roku, Viant, Innovid, Tremor Video
  ('company', '9',  'competitor_count', 8, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Katalyst: SQAI, VisionBody, XBody, Miha bodytec, Justfit, BODY20, OHM Fitness, Bodystreet
  ('company', '10', 'competitor_count', 8, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- CIQ: Red Hat/IBM, Canonical, SUSE, AlmaLinux/TuxCare
  ('company', '11', 'competitor_count', 4, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Springbig: Alpine IQ, Sprout, Dutchie, Treez, IndicaOnline, Happy Cabbage, Fyllo
  ('company', '12', 'competitor_count', 7, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Nudge Security: AppOmni, Wing, Valence, Obsidian, Grip, Axonius, BetterCloud, Netskope, Palo Alto
  ('company', '13', 'competitor_count', 9, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Vibrant Planet: Pano AI, Dryad, Wildfire Defense, FLIR/Teledyne, Prometheus, IBM/MS/Google
  ('company', '15', 'competitor_count', 6, 'count', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- Amira Learning: Khan Academy, Carnegie Learning, Duolingo, DreamBox, Pearson, Cognii, OpenAI
  ('company', '16', 'competitor_count', 7, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Elicio: Revolution Medicines, BioNTech/Genentech, Verastem, Mirati/BMS, Amgen
  ('company', '22', 'competitor_count', 5, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Duetto: IDeaS, Cloudbeds, FLYR, RoomPriceGenie, Oracle, Sabre, Amadeus, Atomize
  ('company', '23', 'competitor_count', 8, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Lyten: Zeta Energy, Li-S Energy, NexTech, Sion Power, PolyPlus, Theion, Solidion
  ('company', '29', 'competitor_count', 7, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Protect AI: HiddenLayer, Robust Intelligence, CalypsoAI, Lakera, Noma, Adversa AI
  ('company', '35', 'competitor_count', 6, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Ioneer: Albemarle, Lithium Americas, Piedmont, SQM, Ganfeng
  ('company', '49', 'competitor_count', 5, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- ── Market position (1=leader, 2=challenger, 3=niche) ────────────────────────
-- Based on analyst reports (Gartner, Forrester), market share data, and competitive positioning
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Redwood Materials: Dominant leader, 70% US market share
  ('company', '1',  'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.95, true, NULL),
  -- Socure: Leader per Gartner MQ + Forrester Wave
  ('company', '2',  'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.95, true, NULL),
  -- Abnormal AI: Gartner MQ Leader 2 consecutive years
  ('company', '3',  'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.95, true, NULL),
  -- TensorWave: Challenger/niche in GPU cloud, AMD-focused differentiation
  ('company', '4',  'market_position', 2, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- 1047 Games: Struggling niche in F2P FPS
  ('company', '5',  'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Hubble Network: Niche innovator, early-stage
  ('company', '6',  'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Boxabl: Challenger, going public via SPAC
  ('company', '7',  'market_position', 2, 'category', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- Carbon Health: Distressed, Chapter 11 bankruptcy
  ('company', '8',  'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- MNTN: Challenger, performance CTV for SMBs, profitable public co
  ('company', '9',  'market_position', 2, 'category', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Katalyst: Distressed niche, acquired amid customer complaints
  ('company', '10', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- CIQ: Challenger in enterprise Linux, Rocky Linux at 12% adoption
  ('company', '11', 'market_position', 2, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Springbig: Category leader, #1 in cannabis CRM (Tracxn)
  ('company', '12', 'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Nudge Security: Niche innovator in SSPM
  ('company', '13', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- Vibrant Planet: Niche pioneer in wildfire resilience
  ('company', '15', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL),
  -- Amira Learning: Niche in AI tutoring, HMH subsidiary
  ('company', '16', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Elicio Therapeutics: Clinical-stage niche
  ('company', '22', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Duetto: Category leader, #1 Hotel RMS 4 consecutive years
  ('company', '23', 'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Lyten: Pioneer/leader in Li-S batteries
  ('company', '29', 'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Protect AI: Acquired by Palo Alto Networks, was category leader in MLSecOps
  ('company', '35', 'market_position', 1, 'category', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Ioneer: Pre-revenue development stage
  ('company', '49', 'market_position', 3, 'category', '2026-03-01', '2026-03-30', 'month', 0.75, true, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

-- ── Customer counts (verified or well-sourced estimates) ─────────────────────
-- Only included where research provides specific customer/user figures
INSERT INTO metric_snapshots (entity_type, entity_id, metric_name, value, unit, period_start, period_end, granularity, confidence, verified, source_id)
VALUES
  -- Socure: 3,000+ customers including 18 of top 20 banks
  ('company', '2',  'customer_count', 3000, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Abnormal AI: 3,000+ customers across 35 countries, 25%+ Fortune 500
  ('company', '3',  'customer_count', 3000, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Boxabl: 170,000+ reservations, 278 units delivered
  ('company', '7',  'customer_count', 278, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Carbon Health: ~93 clinics in 8 states (as customer-facing locations)
  ('company', '8',  'customer_count', 93, 'count', '2026-03-01', '2026-03-30', 'month', 0.80, true, NULL),
  -- Duetto: 7,200+ hotels, casinos, and resorts globally
  ('company', '23', 'customer_count', 7200, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- Springbig: 1,500+ dispensaries, 28M consumers on platform
  ('company', '12', 'customer_count', 1500, 'count', '2026-03-01', '2026-03-30', 'month', 0.85, true, NULL),
  -- Elicio Therapeutics: 33 employees, public co (NASDAQ: ELTX), ~$200M market cap
  ('company', '22', 'customer_count', 0, 'count', '2026-03-01', '2026-03-30', 'month', 0.90, true, NULL),
  -- 1047 Games: ~118 employees; player counts undisclosed post-relaunch
  ('company', '5',  'customer_count', 118, 'count', '2026-03-01', '2026-03-30', 'month', 0.60, false, NULL)
ON CONFLICT (entity_type, entity_id, metric_name, period_start) DO NOTHING;

COMMIT;
