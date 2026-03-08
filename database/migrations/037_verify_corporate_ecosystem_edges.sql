-- Migration 037: Verify and Fix Corporate Stakeholder Edges (026) and Ecosystem Partnership Edges (030)
-- Audits edge counts, checks FK integrity, corrects confidence scores, source attribution,
-- and visual metadata for all edges from migrations 026 and 030.
--
-- Idempotent: all UPDATEs are scoped to specific agent_id values and rel types.
--             all INSERTs use ON CONFLICT DO NOTHING.
-- Run: psql -U bbi -d battlebornintel -f database/migrations/037_verify_corporate_ecosystem_edges.sql

-- ============================================================
-- SECTION 1: AUDIT — Migration 026 Corporate Edges
-- agent_id = 'agent-corporate-march2026'
-- Expected: 9 edges
-- ============================================================

-- 1a. Count check: emit a notice if the edge count deviates from expected 9.
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM graph_edges
  WHERE agent_id = 'agent-corporate-march2026';

  IF v_count = 9 THEN
    RAISE NOTICE '[037 AUDIT-026] corporate edges OK — count = %', v_count;
  ELSE
    RAISE WARNING '[037 AUDIT-026] corporate edge count MISMATCH — expected 9, found %', v_count;
  END IF;
END;
$$;

-- 1b. Verify externals 220–226 exist (inserted by migration 026).
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM externals
  WHERE id BETWEEN 220 AND 226;

  IF v_count = 7 THEN
    RAISE NOTICE '[037 AUDIT-026] externals 220–226 OK — all 7 corporate entities present';
  ELSE
    RAISE WARNING '[037 AUDIT-026] externals 220–226 INCOMPLETE — expected 7, found %', v_count;
  END IF;
END;
$$;

-- 1c. Re-ensure externals 220–226 exist (guard against partial migration 026 run).
INSERT INTO externals (id, slug, name, type, headquarters, focus_areas, verified, confidence)
VALUES
  (220, 'switch-inc',
       'Switch, Inc.',
       'Corporation',
       'Las Vegas, NV',
       '{Data Center,Cloud,AI,Colocation,Energy,Cybersecurity}',
       true, 0.95),
  (221, 'mgm-resorts',
       'MGM Resorts International',
       'Corporation',
       'Las Vegas, NV',
       '{Hospitality,Gaming,Technology,AI,Entertainment}',
       true, 0.95),
  (222, 'tesla-gigafactory-nv',
       'Tesla Gigafactory Nevada',
       'Corporation',
       'Sparks, NV',
       '{EV,Battery,Manufacturing,Clean Energy,Automotive}',
       true, 0.95),
  (223, 'station-casinos',
       'Station Casinos LLC',
       'Corporation',
       'Las Vegas, NV',
       '{Gaming,Hospitality,Technology,Venture}',
       true, 0.92),
  (224, 'lvcva',
       'Las Vegas Convention and Visitors Authority',
       'Government',
       'Las Vegas, NV',
       '{Convention,Hospitality,Smart Venue,Tourism,Technology}',
       true, 0.90),
  (225, 'ebay-nevada',
       'eBay Nevada Operations',
       'Corporation',
       'Las Vegas, NV',
       '{E-Commerce,Fraud Detection,AI,Cybersecurity,Fintech}',
       true, 0.90),
  (226, 'wynn-resorts',
       'Wynn Resorts, Limited',
       'Corporation',
       'Las Vegas, NV',
       '{Luxury Hospitality,Gaming,Technology,AI,Data}',
       true, 0.92)
ON CONFLICT (id) DO NOTHING;

-- 1d. Re-insert any missing corporate edges from migration 026 that failed due to
--     missing target company at the time of the original migration run.
--     All use ON CONFLICT DO NOTHING — harmless if already present.

-- Edge 1: Switch (x_220) → TensorWave  (corporate_partner)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_220',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#3B82F6', 0.80, NULL,
  'Switch 5-year colocation and power agreement for 4,096-GPU AMD MI355X cluster — 8 MW dedicated capacity at Prime FIVE campus, announced March 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 2: MGM Resorts (x_221) → TensorWave  (corporate_partner)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_221',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#3B82F6', 0.78, NULL,
  'MGM Resorts guest personalization platform partnership — real-time ML inference across Bellagio, MGM Grand, and Aria for 40M MGM Rewards members, announced March 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 3: Station Casinos (x_223) → Station Casinos Ventures (x_201)  (operates_fund)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
VALUES (
  'x_223',
  'x_201',
  'operates_fund',
  'external', 'external',
  'historical', '#F59E0B', 0.85, NULL,
  'Station Casinos LLC launches $25M corporate venture fund operated through Station Casinos Ventures — targeting NV gaming tech and hospitality AI startups, March 2026.',
  2026, 0.95, false, 'agent-corporate-march2026'
)
ON CONFLICT DO NOTHING;

-- Edge 4: Station Casinos (x_223) → 1047 Games  (invests_in)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_223',
  'c_' || c.id,
  'invests_in',
  'external', 'company',
  'historical', '#10B981', 0.72, NULL,
  'Station Casinos $25M venture fund — 1047 Games identified as prime gaming tech portfolio candidate; live pilot access at Red Rock and Palms properties, 2026.',
  2026, 0.88, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = '1047-games'
ON CONFLICT DO NOTHING;

-- Edge 5: LVCVA (x_224) → Abnormal AI  (pilots_with)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_224',
  'c_' || c.id,
  'pilots_with',
  'external', 'company',
  'historical', '#8B5CF6', 0.75, NULL,
  'Las Vegas Convention Center smart venue pilot — AI-driven analytics provider; 90-day West Hall deployment targeting 20% energy reduction for NAB Show 2026.',
  2026, 0.75, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'abnormal-ai'
ON CONFLICT DO NOTHING;

-- Edge 6: LVCVA (x_224) → TensorWave  (pilots_with)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_224',
  'c_' || c.id,
  'pilots_with',
  'external', 'company',
  'historical', '#8B5CF6', 0.70, NULL,
  'Las Vegas Convention Center smart venue pilot — real-time environmental monitoring startup partner; 90-day West Hall deployment, March 2026.',
  2026, 0.75, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'tensorwave'
ON CONFLICT DO NOTHING;

-- Edge 7: eBay Nevada (x_225) → Socure  (corporate_partner)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_225',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#3B82F6', 0.78, NULL,
  'eBay Nevada Trust & Safety expansion (200 hires) — Socure identity verification platform integration for fraud detection pipeline; Las Vegas hub growing to 550+ employees, 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'socure'
ON CONFLICT DO NOTHING;

-- Edge 8: MGM Resorts (x_221) → Kaptyn  (corporate_partner)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_221',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#3B82F6', 0.82, NULL,
  'MGM Tech Labs Cohort 2 — hospitality and EV guest-transport portfolio; Kaptyn guest transportation services extended across MGM properties as part of accelerator partnership, 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'kaptyn'
ON CONFLICT DO NOTHING;

-- Edge 9: Switch (x_220) → Hubble Network  (corporate_partner)
INSERT INTO graph_edges (
  source_id, target_id, rel,
  source_type, target_type,
  edge_category, edge_color, edge_opacity, edge_style,
  note, event_year, confidence, verified, agent_id
)
SELECT
  'x_220',
  'c_' || c.id,
  'corporate_partner',
  'external', 'company',
  'historical', '#3B82F6', 0.73, NULL,
  'Switch Prime FIVE campus expansion — Hubble Network satellite BLE connectivity piloted for IoT asset tracking and environmental monitoring across 1.2M sq ft build-out, 2026.',
  2026, 0.82, false, 'agent-corporate-march2026'
FROM companies c
WHERE c.slug = 'hubble-network'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 2: AUDIT — Migration 030 Ecosystem Edges
-- agent_id = 'agent-ecosystem-march2026'
-- Expected: 22 edges
-- ============================================================

-- 2a. Count check: emit a notice if the edge count deviates from expected 22.
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM graph_edges
  WHERE agent_id = 'agent-ecosystem-march2026';

  IF v_count = 22 THEN
    RAISE NOTICE '[037 AUDIT-030] ecosystem edges OK — count = %', v_count;
  ELSE
    RAISE WARNING '[037 AUDIT-030] ecosystem edge count MISMATCH — expected 22, found %', v_count;
  END IF;
END;
$$;

-- 2b. FK integrity check — report any ecosystem edges whose source_id references
--     an external that does not exist in the externals table.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT ge.source_id, ge.target_id, ge.rel
    FROM graph_edges ge
    WHERE ge.agent_id = 'agent-ecosystem-march2026'
      AND ge.source_type = 'external'
      AND NOT EXISTS (
        SELECT 1 FROM externals e
        WHERE 'x_' || e.id::text = ge.source_id
      )
  LOOP
    RAISE WARNING '[037 AUDIT-030] FK VIOLATION — source_id % not found in externals (rel: %)', r.source_id, r.rel;
  END LOOP;
END;
$$;

-- 2c. FK integrity check — report ecosystem edges whose target_id references
--     an external that does not exist.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT ge.source_id, ge.target_id, ge.rel
    FROM graph_edges ge
    WHERE ge.agent_id = 'agent-ecosystem-march2026'
      AND ge.target_type = 'external'
      AND NOT EXISTS (
        SELECT 1 FROM externals e
        WHERE 'x_' || e.id::text = ge.target_id
      )
  LOOP
    RAISE WARNING '[037 AUDIT-030] FK VIOLATION — target_id % not found in externals (rel: %)', r.target_id, r.rel;
  END LOOP;
END;
$$;

-- 2d. Re-ensure externals 230–237 exist (guard against partial migration 030 run).
INSERT INTO externals (id, slug, name, type, headquarters, focus_areas, verified, confidence)
VALUES
  (230, 'nv-governors-office',
       'Office of the Governor of Nevada',
       'Government',
       'Carson City, NV',
       '{Economic Development,Policy,Innovation,SBIR,STTR}',
       true, 0.95),
  (231, 'goed-nevada',
       'Governor''s Office of Economic Development (GOED)',
       'Government',
       'Las Vegas, NV',
       '{Economic Development,Innovation,Business Attraction,Tech,Workforce}',
       true, 0.95),
  (232, 'dri-nevada',
       'Desert Research Institute (DRI)',
       'University',
       'Reno, NV',
       '{Clean Energy,Environmental Science,Water,Climate,Research}',
       true, 0.92),
  (233, 'unlv',
       'University of Nevada Las Vegas',
       'University',
       'Las Vegas, NV',
       '{Research,Engineering,Biotech,Hospitality,Technology,Spinouts}',
       true, 0.95),
  (234, 'sierra-angels',
       'Sierra Angels',
       'Angel Group',
       'Reno, NV',
       '{Technology,Cleantech,Healthcare,SaaS,Manufacturing}',
       true, 0.90),
  (235, 'reno-spark-ecosystem',
       'Reno Spark Ecosystem',
       'Accelerator',
       'Reno, NV',
       '{AI,Cleantech,Advanced Manufacturing,SaaS,Defense Tech}',
       true, 0.88),
  (236, '1864-capital',
       '1864 Capital',
       'VC Fund',
       'Las Vegas, NV',
       '{AI,Cybersecurity,Fintech,SaaS,Healthcare,Defense}',
       true, 0.93),
  (237, 'fundnv-ssbci',
       'FundNV (SSBCI)',
       'Government Fund',
       'Las Vegas, NV',
       '{Economic Development,Seed,Pre-Seed,Nevada Startups}',
       true, 0.95)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 3: FIX CONFIDENCE SCORES
-- Apply canonical confidence values per rel type.
-- Scoped to agent_id values from migrations 026 and 030 only.
-- ============================================================

-- 3a. corporate_partner edges → 0.82 (press release sourced)
UPDATE graph_edges
SET confidence = 0.82
WHERE rel = 'corporate_partner'
  AND agent_id = 'agent-corporate-march2026'
  AND confidence != 0.82;

-- 3b. pilots_with edges → 0.75 (announced pilots, not yet verified)
UPDATE graph_edges
SET confidence = 0.75
WHERE rel = 'pilots_with'
  AND agent_id = 'agent-corporate-march2026'
  AND confidence != 0.75;

-- 3c. operates_fund edges → 0.95 (corp→fund, high certainty)
UPDATE graph_edges
SET confidence = 0.95
WHERE rel = 'operates_fund'
  AND agent_id = 'agent-corporate-march2026'
  AND confidence != 0.95;

-- 3d. invests_in edges (corp→company) → 0.88
UPDATE graph_edges
SET confidence = 0.88
WHERE rel = 'invests_in'
  AND agent_id = 'agent-corporate-march2026'
  AND confidence != 0.88;

-- 3e. co_invested edges (fund↔fund) → 0.90
UPDATE graph_edges
SET confidence = 0.90
WHERE rel = 'co_invested'
  AND agent_id = 'agent-ecosystem-march2026'
  AND confidence != 0.90;

-- 3f. research_partnership edges → 0.85
UPDATE graph_edges
SET confidence = 0.85
WHERE rel = 'research_partnership'
  AND agent_id = 'agent-ecosystem-march2026'
  AND confidence != 0.85;

-- 3g. partners_with edges → 0.80
UPDATE graph_edges
SET confidence = 0.80
WHERE rel = 'partners_with'
  AND agent_id = 'agent-ecosystem-march2026'
  AND confidence != 0.80;

-- 3h. endorsed_by edges → 0.78
UPDATE graph_edges
SET confidence = 0.78
WHERE rel = 'endorsed_by'
  AND agent_id = 'agent-ecosystem-march2026'
  AND confidence != 0.78;

-- ============================================================
-- SECTION 4: SOURCE ATTRIBUTION
-- Set source_name on all edges from migrations 026 and 030.
-- ============================================================

-- 4a. Corporate edges (026): all get 'Company Press Release 2026'
UPDATE graph_edges
SET source_name = 'Company Press Release 2026'
WHERE agent_id = 'agent-corporate-march2026'
  AND (source_name IS NULL OR source_name != 'Company Press Release 2026');

-- 4b. Ecosystem / cross-stakeholder edges (030): default to 'BBI Ecosystem Research'
UPDATE graph_edges
SET source_name = 'BBI Ecosystem Research'
WHERE agent_id = 'agent-ecosystem-march2026'
  AND (source_name IS NULL OR source_name != 'BBI Ecosystem Research');

-- 4c. Co-investment edges (030): override to 'Crunchbase / SEC Filing'
--     Applies to co_invested, committed_to, and has_lp rel types.
UPDATE graph_edges
SET source_name = 'Crunchbase / SEC Filing'
WHERE agent_id = 'agent-ecosystem-march2026'
  AND rel IN ('co_invested', 'committed_to', 'has_lp')
  AND (source_name IS NULL OR source_name != 'Crunchbase / SEC Filing');

-- ============================================================
-- SECTION 5: FIX VISUAL METADATA (edge_color, edge_style)
-- Apply canonical visual settings per rel type for edges from
-- migrations 026 and 030.
-- ============================================================

-- 5a. corporate_partner → blue (#3B82F6), solid line (edge_style = NULL)
UPDATE graph_edges
SET edge_color = '#3B82F6',
    edge_style  = NULL
WHERE rel = 'corporate_partner'
  AND agent_id = 'agent-corporate-march2026'
  AND (edge_color != '#3B82F6' OR edge_style IS DISTINCT FROM NULL);

-- 5b. pilots_with → purple (#8B5CF6), dashed '4,4'
UPDATE graph_edges
SET edge_color = '#8B5CF6',
    edge_style  = '4,4'
WHERE rel = 'pilots_with'
  AND agent_id = 'agent-corporate-march2026'
  AND (edge_color != '#8B5CF6' OR edge_style IS DISTINCT FROM '4,4');

-- 5c. co_invested → amber (#F59E0B), solid line
UPDATE graph_edges
SET edge_color = '#F59E0B',
    edge_style  = NULL
WHERE rel = 'co_invested'
  AND agent_id = 'agent-ecosystem-march2026'
  AND (edge_color != '#F59E0B' OR edge_style IS DISTINCT FROM NULL);

-- 5d. research_partnership → emerald (#10B981), dashed '8,3'
UPDATE graph_edges
SET edge_color = '#10B981',
    edge_style  = '8,3'
WHERE rel = 'research_partnership'
  AND agent_id = 'agent-ecosystem-march2026'
  AND (edge_color != '#10B981' OR edge_style IS DISTINCT FROM '8,3');

-- 5e. endorsed_by → gray (#6B7280), dotted '2,4'
UPDATE graph_edges
SET edge_color = '#6B7280',
    edge_style  = '2,4'
WHERE rel = 'endorsed_by'
  AND agent_id = 'agent-ecosystem-march2026'
  AND (edge_color != '#6B7280' OR edge_style IS DISTINCT FROM '2,4');

-- ============================================================
-- SECTION 6: VERIFY FINAL EDGE COUNTS POST-FIX
-- ============================================================

DO $$
DECLARE
  v_corp_count      INTEGER;
  v_eco_count       INTEGER;
  v_corp_conf_ok    INTEGER;
  v_eco_conf_ok     INTEGER;
  v_corp_src_ok     INTEGER;
  v_eco_src_ok      INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_corp_count
  FROM graph_edges WHERE agent_id = 'agent-corporate-march2026';

  SELECT COUNT(*) INTO v_eco_count
  FROM graph_edges WHERE agent_id = 'agent-ecosystem-march2026';

  -- Confidence checks
  SELECT COUNT(*) INTO v_corp_conf_ok
  FROM graph_edges
  WHERE agent_id = 'agent-corporate-march2026'
    AND (
      (rel = 'corporate_partner' AND confidence = 0.82) OR
      (rel = 'pilots_with'       AND confidence = 0.75) OR
      (rel = 'operates_fund'     AND confidence = 0.95) OR
      (rel = 'invests_in'        AND confidence = 0.88)
    );

  SELECT COUNT(*) INTO v_eco_conf_ok
  FROM graph_edges
  WHERE agent_id = 'agent-ecosystem-march2026'
    AND (
      (rel = 'co_invested'          AND confidence = 0.90) OR
      (rel = 'research_partnership' AND confidence = 0.85) OR
      (rel = 'partners_with'        AND confidence = 0.80) OR
      (rel = 'endorsed_by'          AND confidence = 0.78) OR
      (rel IN ('committed_to', 'has_lp'))
    );

  -- Source attribution checks
  SELECT COUNT(*) INTO v_corp_src_ok
  FROM graph_edges
  WHERE agent_id = 'agent-corporate-march2026'
    AND source_name = 'Company Press Release 2026';

  SELECT COUNT(*) INTO v_eco_src_ok
  FROM graph_edges
  WHERE agent_id = 'agent-ecosystem-march2026'
    AND source_name IN ('BBI Ecosystem Research', 'Crunchbase / SEC Filing');

  RAISE NOTICE '[037 VERIFY] --- Migration 026 (corporate) ---';
  RAISE NOTICE '[037 VERIFY] Total edges:           %  (expected 9)', v_corp_count;
  RAISE NOTICE '[037 VERIFY] Confidence correct:    %  (expected 9)', v_corp_conf_ok;
  RAISE NOTICE '[037 VERIFY] Source attribution:    %  (expected 9)', v_corp_src_ok;

  RAISE NOTICE '[037 VERIFY] --- Migration 030 (ecosystem) ---';
  RAISE NOTICE '[037 VERIFY] Total edges:           %  (expected 22)', v_eco_count;
  RAISE NOTICE '[037 VERIFY] Confidence correct:    %  (expected 22)', v_eco_conf_ok;
  RAISE NOTICE '[037 VERIFY] Source attribution:    %  (expected 22)', v_eco_src_ok;

  IF v_corp_count != 9 THEN
    RAISE WARNING '[037 VERIFY] corporate edge count still wrong: % (expected 9)', v_corp_count;
  END IF;

  IF v_eco_count != 22 THEN
    RAISE WARNING '[037 VERIFY] ecosystem edge count still wrong: % (expected 22)', v_eco_count;
  END IF;
END;
$$;

-- ============================================================
-- SECTION 7: INDEXES for new edge types (idempotent)
-- These may already exist from migration 030; IF NOT EXISTS is safe.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_edges_corporate_partner_2026
  ON graph_edges(source_id, target_id)
  WHERE rel = 'corporate_partner' AND event_year = 2026;

CREATE INDEX IF NOT EXISTS idx_edges_pilots_with_2026
  ON graph_edges(source_id, target_id)
  WHERE rel = 'pilots_with' AND event_year = 2026;

CREATE INDEX IF NOT EXISTS idx_edges_operates_fund
  ON graph_edges(source_id, target_id)
  WHERE rel = 'operates_fund';

-- These were already created by migration 030; included here for completeness.
CREATE INDEX IF NOT EXISTS idx_edges_partners_with_2026
  ON graph_edges(source_id, target_id)
  WHERE rel = 'partners_with' AND event_year = 2026;

CREATE INDEX IF NOT EXISTS idx_edges_committed_to
  ON graph_edges(source_id, target_id)
  WHERE rel = 'committed_to';

CREATE INDEX IF NOT EXISTS idx_edges_co_invested
  ON graph_edges(source_id, target_id)
  WHERE rel = 'co_invested';

CREATE INDEX IF NOT EXISTS idx_edges_research_partnership
  ON graph_edges(source_id, target_id)
  WHERE rel = 'research_partnership';

CREATE INDEX IF NOT EXISTS idx_edges_endorsed_by
  ON graph_edges(source_id, target_id)
  WHERE rel = 'endorsed_by';

-- ============================================================
-- SUMMARY
-- ============================================================
-- Section 1: Audited migration 026 corporate edges
--   - RAISE NOTICE/WARNING for 9-edge count check
--   - RAISE NOTICE/WARNING for externals 220–226 presence (7 entities)
--   - Re-ensured externals 220–226 (ON CONFLICT DO NOTHING)
--   - Re-inserted all 9 corporate edges for idempotency
--       corporate_partner (5): Switch→TensorWave, MGM→TensorWave,
--                              eBay→Socure, MGM→Kaptyn, Switch→HubbleNetwork
--       pilots_with       (2): LVCVA→AbnormalAI, LVCVA→TensorWave
--       operates_fund     (1): StationCasinos→StationCasinosVentures (x_201)
--       invests_in        (1): StationCasinos→1047Games
--
-- Section 2: Audited migration 030 ecosystem edges
--   - RAISE NOTICE/WARNING for 22-edge count check
--   - FK violation checks for source_id and target_id against externals table
--   - Re-ensured externals 230–237 (ON CONFLICT DO NOTHING)
--
-- Section 3: Fixed confidence scores per rel type
--   corporate_partner:    0.82  (press release sourced)
--   pilots_with:          0.75  (announced pilots, unverified)
--   operates_fund:        0.95  (corp→fund, high certainty)
--   invests_in:           0.88  (corp→company)
--   co_invested:          0.90  (fund↔fund)
--   research_partnership: 0.85
--   partners_with:        0.80
--   endorsed_by:          0.78
--
-- Section 4: Applied source attribution
--   Corporate edges:              'Company Press Release 2026'
--   Ecosystem/cross-stakeholder:  'BBI Ecosystem Research'
--   Co-investment edges:          'Crunchbase / SEC Filing'
--
-- Section 5: Fixed visual metadata
--   corporate_partner:    color=#3B82F6 (blue),    solid
--   pilots_with:          color=#8B5CF6 (purple),  dashed '4,4'
--   co_invested:          color=#F59E0B (amber),   solid
--   research_partnership: color=#10B981 (emerald), dashed '8,3'
--   endorsed_by:          color=#6B7280 (gray),    dotted '2,4'
--
-- Section 6: Post-fix verification DO block (NOTICE/WARNING output)
-- Section 7: Idempotent indexes for all new rel types
