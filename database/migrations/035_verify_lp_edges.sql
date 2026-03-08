-- Migration 035: Verify and Fix LP (Limited Partner) Edges
-- Audits potential_lp edges created in migration 023 and committed_to edges
-- created in migration 028, then applies corrected visual metadata, confidence
-- scores, source attribution, and relationship metadata to both edge types.
--
-- LP entity map (externals.id → node_id → name):
--   200  x_200  Wynn Family Office            (Family Office)
--   201  x_201  Station Casinos Ventures      (Corporate VC)
--   202  x_202  Switch Ventures               (Corporate VC)
--   203  x_203  Playa Capital Group           (Family Office)
--   204  x_204  Intermountain Ventures Group  (Investment Group)
--   205  x_205  UNLV Foundation               (University Endowment)
--   206  x_206  UNR Foundation                (University Endowment)
--   207  x_207  NV PERS                       (Pension Fund)
--   208  x_208  Nevada State Treasurer        (Government Fund)
--   209  x_209  Goldman Sachs Private Equity  (Institutional)
--   210  x_210  JPMorgan Alternative Assets   (Institutional)
--   211  x_211  CalPERS Innovation Fund       (Pension Fund)
--
-- Run: psql -U bbi -d battlebornintel -f database/migrations/035_verify_lp_edges.sql

-- ============================================================
-- SECTION 1: AUDIT — potential_lp edge coverage and categories
-- ============================================================

DO $$
DECLARE
  v_total_potential_lp  INTEGER;
  v_total_committed_to  INTEGER;
  v_lp_id               INTEGER;
  v_edge_count          INTEGER;
  v_missing             INTEGER := 0;
  v_wrong_category      INTEGER;
  v_committed_wrong_cat INTEGER;
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE '== Migration 035: LP Edge Verification & Fix Report  ==';
  RAISE NOTICE '=======================================================';

  -- 1a. Total potential_lp edge count
  SELECT COUNT(*) INTO v_total_potential_lp
  FROM graph_edges WHERE rel = 'potential_lp';
  RAISE NOTICE '';
  RAISE NOTICE '-- potential_lp edges --';
  RAISE NOTICE '  Total potential_lp edges: %', v_total_potential_lp;

  -- 1b. Per-LP coverage: all 12 LP externals (IDs 200-211) must have edges
  RAISE NOTICE '';
  RAISE NOTICE '  Per-LP edge counts (IDs 200-211):';
  FOR v_lp_id IN 200..211 LOOP
    SELECT COUNT(*) INTO v_edge_count
    FROM graph_edges
    WHERE source_id = 'x_' || v_lp_id
      AND rel = 'potential_lp';
    IF v_edge_count = 0 THEN
      v_missing := v_missing + 1;
      RAISE WARNING '  [MISSING] x_% has 0 potential_lp edges', v_lp_id;
    ELSE
      RAISE NOTICE '  [OK] x_%: % potential_lp edges', v_lp_id, v_edge_count;
    END IF;
  END LOOP;

  IF v_missing > 0 THEN
    RAISE WARNING '  % LP entities have no potential_lp edges — investigate migration 023', v_missing;
  ELSE
    RAISE NOTICE '  All 12 LP externals (x_200..x_211) have >= 1 potential_lp edge. [OK]';
  END IF;

  -- 1c. Check edge_category = 'opportunity' for all potential_lp edges
  SELECT COUNT(*) INTO v_wrong_category
  FROM graph_edges
  WHERE rel = 'potential_lp'
    AND edge_category IS DISTINCT FROM 'opportunity';
  IF v_wrong_category > 0 THEN
    RAISE WARNING '  [MISMATCH] % potential_lp edges have edge_category != opportunity', v_wrong_category;
  ELSE
    RAISE NOTICE '  All potential_lp edges have edge_category = opportunity. [OK]';
  END IF;

  -- 1d. Total committed_to edges from migration 028 LP entities
  SELECT COUNT(*) INTO v_total_committed_to
  FROM graph_edges
  WHERE rel = 'committed_to'
    AND source_id IN (
      'x_200','x_201','x_202','x_203','x_204',
      'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
    );
  RAISE NOTICE '';
  RAISE NOTICE '-- committed_to edges (from LP entities in migrations 023/028) --';
  RAISE NOTICE '  Total committed_to edges from LP entities: %', v_total_committed_to;

  -- 1e. Verify edge_category = 'historical' for committed_to LP edges
  SELECT COUNT(*) INTO v_committed_wrong_cat
  FROM graph_edges
  WHERE rel = 'committed_to'
    AND source_id IN (
      'x_200','x_201','x_202','x_203','x_204',
      'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
    )
    AND edge_category IS DISTINCT FROM 'historical';
  IF v_committed_wrong_cat > 0 THEN
    RAISE WARNING '  [MISMATCH] % committed_to edges have edge_category != historical', v_committed_wrong_cat;
  ELSE
    RAISE NOTICE '  All LP committed_to edges have edge_category = historical. [OK]';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '=======================================================';
END;
$$;

-- ============================================================
-- SECTION 2: FIX potential_lp VISUAL METADATA
-- Standardise all potential_lp edges to:
--   color   = '#818CF8'  (indigo — opportunity / not-yet-committed LP)
--   opacity = 0.7
--   dash    = '8,5'      (replaces the '6,4' set by migration 023)
--   edge_category = 'opportunity'  (enforce in case any slipped through)
-- ============================================================

UPDATE graph_edges
SET
  edge_color    = '#818CF8',
  edge_opacity  = 0.7,
  edge_style    = '8,5',
  edge_category = 'opportunity'
WHERE rel = 'potential_lp'
  AND (
       edge_color    IS DISTINCT FROM '#818CF8'
    OR edge_opacity  IS DISTINCT FROM 0.7
    OR edge_style    IS DISTINCT FROM '8,5'
    OR edge_category IS DISTINCT FROM 'opportunity'
  );

-- ============================================================
-- SECTION 3: FIX committed_to VISUAL METADATA (LP → fund edges)
-- Standardise committed_to edges from LP entities to:
--   color   = '#A78BFA'  (lighter purple — confirmed/committed)
--   opacity = 0.9
--   dash    = NULL       (solid line)
--   edge_category = 'historical'
-- ============================================================

UPDATE graph_edges
SET
  edge_color    = '#A78BFA',
  edge_opacity  = 0.9,
  edge_style    = NULL,
  edge_category = 'historical'
WHERE rel = 'committed_to'
  AND source_id IN (
    'x_200','x_201','x_202','x_203','x_204',
    'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
  )
  AND (
       edge_color    IS DISTINCT FROM '#A78BFA'
    OR edge_opacity  IS DISTINCT FROM 0.9
    OR COALESCE(edge_style, '__NULL__') IS DISTINCT FROM '__NULL__'
    OR edge_category IS DISTINCT FROM 'historical'
  );

-- ============================================================
-- SECTION 4: LP CONFIDENCE SCORING
-- Updates the confidence column on potential_lp edges per LP entity.
-- Scores reflect institutional mandate strength, geographic proximity,
-- and known Nevada investment activity.
--
--   x_207 NV PERS              0.88  institutional, SSBCI mandate
--   x_208 NV State Treasurer   0.85  government mandate
--   x_205 UNLV Foundation      0.80  educational mandate
--   x_206 UNR Foundation       0.80  educational mandate
--   x_209 Goldman Sachs PE     0.72  commercial interest in NV AI
--   x_210 JPMorgan Alternatives 0.70  commercial interest, roundtable lead
--   x_200 Wynn Family Office   0.75  known NV investments
--   x_201 Station Casinos Vent 0.73  strong NV strategic alignment
--   x_202 Switch Ventures      0.72  NV data-center thesis
--   x_203 Playa Capital Group  0.68  co-invest track record with 1864
--   x_204 Intermountain Vent   0.65  growing NV portfolio
--   x_211 CalPERS Innovation   0.60  out-of-state, lower probability
-- ============================================================

UPDATE graph_edges SET confidence = 0.88
WHERE rel = 'potential_lp' AND source_id = 'x_207';

UPDATE graph_edges SET confidence = 0.85
WHERE rel = 'potential_lp' AND source_id = 'x_208';

UPDATE graph_edges SET confidence = 0.80
WHERE rel = 'potential_lp' AND source_id = 'x_205';

UPDATE graph_edges SET confidence = 0.80
WHERE rel = 'potential_lp' AND source_id = 'x_206';

UPDATE graph_edges SET confidence = 0.72
WHERE rel = 'potential_lp' AND source_id = 'x_209';

UPDATE graph_edges SET confidence = 0.70
WHERE rel = 'potential_lp' AND source_id = 'x_210';

UPDATE graph_edges SET confidence = 0.75
WHERE rel = 'potential_lp' AND source_id = 'x_200';

UPDATE graph_edges SET confidence = 0.73
WHERE rel = 'potential_lp' AND source_id = 'x_201';

UPDATE graph_edges SET confidence = 0.72
WHERE rel = 'potential_lp' AND source_id = 'x_202';

UPDATE graph_edges SET confidence = 0.68
WHERE rel = 'potential_lp' AND source_id = 'x_203';

UPDATE graph_edges SET confidence = 0.65
WHERE rel = 'potential_lp' AND source_id = 'x_204';

UPDATE graph_edges SET confidence = 0.60
WHERE rel = 'potential_lp' AND source_id = 'x_211';

-- ============================================================
-- SECTION 5: SOURCE ATTRIBUTION
-- Sets source_name and source on potential_lp edges by LP category.
--
-- Government / institutional LPs (x_207, x_208):
--   source_name = 'Nevada Innovation Fund Mandate'
--   source      = 'SSBCI Program Documentation'
--
-- University endowments (x_205, x_206):
--   source_name = 'Nevada Innovation Fund Mandate'
--   source      = 'SSBCI Program Documentation'
--
-- Family offices (x_200, x_201, x_202, x_203, x_204):
--   source_name = 'BBI LP Research'
--   source      = 'Primary Research'
--
-- Out-of-state institutional (x_209, x_210, x_211):
--   source_name = 'BBI LP Outreach Pipeline'
--   source      = (left as-is / NULL — not authoritative yet)
-- ============================================================

-- Government and university LPs — SSBCI mandate basis
UPDATE graph_edges
SET
  source_name = 'Nevada Innovation Fund Mandate',
  source      = 'SSBCI Program Documentation'
WHERE rel = 'potential_lp'
  AND source_id IN ('x_207', 'x_208', 'x_205', 'x_206');

-- Nevada family offices — primary research basis
UPDATE graph_edges
SET
  source_name = 'BBI LP Research',
  source      = 'Primary Research'
WHERE rel = 'potential_lp'
  AND source_id IN ('x_200', 'x_201', 'x_202', 'x_203', 'x_204');

-- Out-of-state institutional — outreach pipeline
UPDATE graph_edges
SET
  source_name = 'BBI LP Outreach Pipeline'
WHERE rel = 'potential_lp'
  AND source_id IN ('x_209', 'x_210', 'x_211');

-- ============================================================
-- SECTION 6: RELATIONSHIP METADATA — merge into weight JSONB
-- Adds lp_type, relationship_stage, and estimated_commitment_m
-- to the weight JSONB on each potential_lp edge.  Uses jsonb
-- concatenation (||) to preserve any existing keys from migration 023.
--
-- estimated_commitment_m values reflect typical LP check sizes:
--   Pension funds:      $10–15M (institutional allocation)
--   Government funds:    $5M (co-invest ceiling per program)
--   University endowments: $2M (endowment LP norm)
--   National institutionals: $8–10M (fund-of-funds sizing)
--   NV family offices:   $2–5M (NV market norms)
--   Out-of-state pension: $3M (conservative / exploration)
-- ============================================================

-- x_207 NV PERS — institutional, pension fund
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'institutional',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 15
)
WHERE rel = 'potential_lp' AND source_id = 'x_207';

-- x_208 NV State Treasurer — government fund
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'government',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 5
)
WHERE rel = 'potential_lp' AND source_id = 'x_208';

-- x_205 UNLV Foundation — university endowment
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'university',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 2
)
WHERE rel = 'potential_lp' AND source_id = 'x_205';

-- x_206 UNR Foundation — university endowment
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'university',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 2
)
WHERE rel = 'potential_lp' AND source_id = 'x_206';

-- x_209 Goldman Sachs PE — out-of-state institutional
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'institutional',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 10
)
WHERE rel = 'potential_lp' AND source_id = 'x_209';

-- x_210 JPMorgan Alternative Assets — out-of-state institutional
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'institutional',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 8
)
WHERE rel = 'potential_lp' AND source_id = 'x_210';

-- x_211 CalPERS Innovation Fund — out-of-state pension
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'institutional',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 3
)
WHERE rel = 'potential_lp' AND source_id = 'x_211';

-- x_200 Wynn Family Office — NV family office
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'family_office',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 5
)
WHERE rel = 'potential_lp' AND source_id = 'x_200';

-- x_201 Station Casinos Ventures — NV corporate VC / family office
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'family_office',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 4
)
WHERE rel = 'potential_lp' AND source_id = 'x_201';

-- x_202 Switch Ventures — NV corporate VC / family office
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'family_office',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 4
)
WHERE rel = 'potential_lp' AND source_id = 'x_202';

-- x_203 Playa Capital Group — NV family office (in_discussions; has co-invest track record)
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'family_office',
  'relationship_stage',    'in_discussions',
  'estimated_commitment_m', 3
)
WHERE rel = 'potential_lp' AND source_id = 'x_203';

-- x_204 Intermountain Ventures Group — regional investment group
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',               'family_office',
  'relationship_stage',    'potential',
  'estimated_commitment_m', 2
)
WHERE rel = 'potential_lp' AND source_id = 'x_204';

-- ============================================================
-- SECTION 7: UPGRADE committed_to EDGES — relationship_stage = committed
-- Promotes committed_to LP edges (from migration 028) to
-- relationship_stage = 'committed' inside their weight JSONB.
-- Also stamps lp_type where not yet present.
-- ============================================================

-- x_200 Wynn Family Office → f_bbv
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'family_office',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_200' AND target_id = 'f_bbv';

-- x_203 Playa Capital Group → f_1864
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'family_office',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_203' AND target_id = 'f_1864';

-- x_205 UNLV Foundation → f_bbv
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'university',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_205' AND target_id = 'f_bbv';

-- x_207 NV PERS → f_bbv
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'institutional',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_207' AND target_id = 'f_bbv';

-- x_208 NV State Treasurer → f_bbv
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'government',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_208' AND target_id = 'f_bbv';

-- x_210 JPMorgan Alternative Assets → f_bbv
UPDATE graph_edges
SET weight = COALESCE(weight, '{}'::jsonb) || jsonb_build_object(
  'lp_type',            'institutional',
  'relationship_stage', 'committed'
)
WHERE rel = 'committed_to' AND source_id = 'x_210' AND target_id = 'f_bbv';

-- ============================================================
-- SECTION 8: INDEXES
-- Ensure efficient querying by LP entity, confidence tier, and
-- relationship stage within the weight JSONB.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_edges_lp_source_confidence
  ON graph_edges(source_id, confidence DESC)
  WHERE rel = 'potential_lp';

CREATE INDEX IF NOT EXISTS idx_edges_lp_relationship_stage
  ON graph_edges((weight->>'relationship_stage'))
  WHERE rel IN ('potential_lp', 'committed_to')
    AND source_id LIKE 'x_%';

CREATE INDEX IF NOT EXISTS idx_edges_lp_type
  ON graph_edges((weight->>'lp_type'))
  WHERE rel IN ('potential_lp', 'committed_to')
    AND source_id LIKE 'x_%';

-- ============================================================
-- SECTION 9: VERIFICATION QUERIES
-- ============================================================

-- 9a. Edge counts and average confidence by LP entity
SELECT
  ge.source_id,
  e.name                                     AS lp_name,
  e.type                                     AS lp_type,
  COUNT(*)                                   AS potential_lp_edges,
  ROUND(AVG(ge.confidence), 3)               AS avg_confidence,
  MAX(ge.confidence)                         AS set_confidence,
  ge.edge_color                              AS color,
  ge.edge_style                              AS dash,
  ge.edge_opacity                            AS opacity,
  ge.source_name,
  ge.weight->>'lp_type'                      AS weight_lp_type,
  ge.weight->>'relationship_stage'           AS weight_rel_stage,
  ge.weight->>'estimated_commitment_m'       AS est_commitment_m
FROM graph_edges ge
JOIN externals e ON e.id = CAST(REPLACE(ge.source_id, 'x_', '') AS INTEGER)
WHERE ge.rel = 'potential_lp'
  AND ge.source_id IN (
    'x_200','x_201','x_202','x_203','x_204',
    'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
  )
GROUP BY
  ge.source_id, e.name, e.type,
  ge.edge_color, ge.edge_style, ge.edge_opacity,
  ge.source_name,
  ge.weight->>'lp_type',
  ge.weight->>'relationship_stage',
  ge.weight->>'estimated_commitment_m'
ORDER BY ge.source_id;

-- 9b. Committed-to LP edges — visual metadata and relationship stage
SELECT
  ge.source_id,
  e.name                                     AS lp_name,
  ge.target_id                               AS fund_id,
  ge.rel,
  ge.edge_category,
  ge.edge_color                              AS color,
  ge.edge_style                              AS dash,
  ge.edge_opacity                            AS opacity,
  ge.weight->>'lp_type'                      AS weight_lp_type,
  ge.weight->>'relationship_stage'           AS weight_rel_stage,
  ge.weight->>'amount_m'                     AS committed_amount_m
FROM graph_edges ge
JOIN externals e ON e.id = CAST(REPLACE(ge.source_id, 'x_', '') AS INTEGER)
WHERE ge.rel = 'committed_to'
  AND ge.source_id IN (
    'x_200','x_201','x_202','x_203','x_204',
    'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
  )
ORDER BY ge.source_id;

-- 9c. Coverage check: confirm all 12 LP externals have >= 1 potential_lp edge
SELECT
  lp.id,
  'x_' || lp.id                             AS node_id,
  lp.name,
  COUNT(ge.source_id)                        AS potential_lp_edge_count,
  CASE WHEN COUNT(ge.source_id) = 0 THEN 'MISSING' ELSE 'OK' END AS coverage_status
FROM externals lp
LEFT JOIN graph_edges ge
  ON ge.source_id = 'x_' || lp.id
  AND ge.rel = 'potential_lp'
WHERE lp.id BETWEEN 200 AND 211
GROUP BY lp.id, lp.name
ORDER BY lp.id;

-- 9d. Summary: edge counts and visual consistency by rel type
SELECT
  ge.rel,
  ge.edge_category,
  ge.edge_color,
  ge.edge_style                              AS dash,
  ge.edge_opacity,
  COUNT(*)                                   AS edge_count,
  ROUND(AVG(ge.confidence), 3)              AS avg_confidence
FROM graph_edges ge
WHERE ge.rel IN ('potential_lp', 'committed_to')
  AND ge.source_id IN (
    'x_200','x_201','x_202','x_203','x_204',
    'x_205','x_206','x_207','x_208','x_209','x_210','x_211'
  )
GROUP BY ge.rel, ge.edge_category, ge.edge_color, ge.edge_style, ge.edge_opacity
ORDER BY ge.rel, ge.edge_category;
