-- Migration 023: Populate Potential LP (Limited Partner) Edges
-- Creates 'potential_lp' edges connecting institutional investors, family offices,
-- corporate ventures, and HNWIs to funds they could potentially become LPs in.
--
-- LP matching considers:
--   Thesis alignment (30%): Does the LP's investment focus align with the fund's mandate?
--   Capital capacity (25%): Does the LP have sufficient AUM/capital for LP commitments?
--   Stage alignment (20%): Does the LP typically back funds at this fund's stage?
--   Geographic nexus (15%): Does the LP have Nevada ties?
--   Track record (10%): Has the LP backed similar fund types before?
--
-- Edge format:
--   source_id: LP entity node (e.g., 'x_<external.id>' or 'f_<fund.id>')
--   target_id: 'f_<fund.id>' (the fund seeking LP capital)
--   rel: 'potential_lp'

DELETE FROM graph_edges WHERE rel = 'potential_lp';

-- ============================================================
-- SECTION 1: Insert potential LP entities (institutional capital)
-- ============================================================
-- These represent institutional investors, family offices, endowments,
-- and corporate venture arms that could serve as LPs to Nevada funds.

INSERT INTO externals (id, slug, name, type, headquarters, focus_areas, verified, confidence)
VALUES
  -- Family Offices with Nevada nexus
  (200, 'wynn-family-office', 'Wynn Family Office', 'Family Office', 'Las Vegas, NV', '{Gaming,Real Estate,Hospitality,Technology}', true, 0.85),
  (201, 'station-casinos-ventures', 'Station Casinos Ventures', 'Corporate VC', 'Las Vegas, NV', '{Gaming,Technology,AI,Hospitality}', true, 0.90),
  (202, 'switch-ventures', 'Switch Ventures', 'Corporate VC', 'Las Vegas, NV', '{Data Center,Cloud,AI,Cybersecurity,Energy}', true, 0.90),
  (203, 'playa-capital', 'Playa Capital Group', 'Family Office', 'Las Vegas, NV', '{Technology,Real Estate,Consumer}', true, 0.80),
  (204, 'intermountain-ventures', 'Intermountain Ventures Group', 'Investment Group', 'Salt Lake City, UT', '{Technology,Healthcare,SaaS,Cleantech}', true, 0.85),
  -- University Endowments
  (205, 'unlv-foundation', 'UNLV Foundation', 'University Endowment', 'Las Vegas, NV', '{Education,Research,Technology}', true, 0.95),
  (206, 'unr-foundation', 'UNR Foundation', 'University Endowment', 'Reno, NV', '{Education,Research,Technology,Mining}', true, 0.95),
  -- State/Institutional
  (207, 'nv-pers', 'Nevada Public Employees Retirement System', 'Pension Fund', 'Carson City, NV', '{Diversified}', true, 0.95),
  (208, 'nv-state-treasurer', 'Nevada State Treasurer', 'Government Fund', 'Carson City, NV', '{Economic Development}', true, 0.90),
  -- National Institutional with NV interest
  (209, 'goldman-psl', 'Goldman Sachs Private Equity', 'Institutional', 'New York, NY', '{Technology,Healthcare,Finance}', true, 0.80),
  (210, 'jpmorgan-alternatives', 'JPMorgan Alternative Assets', 'Institutional', 'New York, NY', '{Diversified}', true, 0.80),
  (211, 'calpers-innovation', 'CalPERS Innovation Fund', 'Pension Fund', 'Sacramento, CA', '{Technology,Cleantech,Healthcare}', true, 0.80)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SECTION 2: Calculate and insert potential LP edges
-- ============================================================

DO $$
DECLARE
  v_lp       RECORD;
  v_fund     RECORD;
  v_thesis   NUMERIC(4,3);
  v_capital  NUMERIC(4,3);
  v_stage    NUMERIC(4,3);
  v_geo      NUMERIC(4,3);
  v_track    NUMERIC(4,3);
  v_final    NUMERIC(4,3);
  v_color    VARCHAR(9);
  v_opacity  NUMERIC(3,2);
  v_created  INTEGER := 0;
  v_eval     INTEGER := 0;
  v_already  BOOLEAN;
  v_overlap  INTEGER;
BEGIN
  -- Loop through potential LP entities
  FOR v_lp IN
    SELECT id, slug, name, type, headquarters, focus_areas
    FROM externals
    WHERE type IN ('Family Office', 'Corporate VC', 'Investment Group',
                   'University Endowment', 'Pension Fund', 'Government Fund', 'Institutional')
      AND id >= 200
    ORDER BY id
  LOOP
    -- Loop through each fund
    FOR v_fund IN
      SELECT id, name, fund_type, allocated_m, deployed_m,
             COALESCE(stage_focus, '{}') AS stage_focus,
             COALESCE(target_sectors, '{}') AS target_sectors
      FROM funds
      ORDER BY id
    LOOP
      v_eval := v_eval + 1;

      -- Skip if LP already has relationship with this fund
      SELECT EXISTS (
        SELECT 1 FROM graph_edges
        WHERE (source_id = 'x_' || v_lp.id AND target_id = 'f_' || v_fund.id)
           OR (source_id = 'f_' || v_fund.id AND target_id = 'x_' || v_lp.id)
      ) INTO v_already;
      IF v_already THEN CONTINUE; END IF;

      -- Thesis alignment (30%): overlap between LP focus areas and fund sectors
      IF v_lp.focus_areas IS NULL OR array_length(v_lp.focus_areas, 1) IS NULL THEN
        v_thesis := 0.5;
      ELSIF array_length(v_fund.target_sectors, 1) IS NULL THEN
        v_thesis := 0.5;
      ELSE
        SELECT COUNT(*) INTO v_overlap FROM (
          SELECT UNNEST(v_lp.focus_areas) INTERSECT SELECT UNNEST(v_fund.target_sectors)
        ) x;
        IF v_overlap >= 3 THEN v_thesis := 1.0;
        ELSIF v_overlap >= 2 THEN v_thesis := 0.8;
        ELSIF v_overlap >= 1 THEN v_thesis := 0.6;
        ELSE v_thesis := 0.2; END IF;
      END IF;

      -- Capital capacity (25%): based on LP type
      v_capital := CASE v_lp.type
        WHEN 'Pension Fund' THEN 1.0      -- Large institutional capital
        WHEN 'Institutional' THEN 0.95
        WHEN 'Government Fund' THEN 0.85
        WHEN 'Corporate VC' THEN 0.80
        WHEN 'Family Office' THEN 0.70
        WHEN 'Investment Group' THEN 0.75
        WHEN 'University Endowment' THEN 0.60
        ELSE 0.50
      END;

      -- Stage alignment (20%): does the LP typically back this type of fund?
      v_stage := CASE
        -- Pension funds and institutions back all stages
        WHEN v_lp.type IN ('Pension Fund', 'Institutional') THEN 0.85
        -- Government funds focus on early-stage economic dev
        WHEN v_lp.type = 'Government Fund' AND v_fund.fund_type IN ('SSBCI', 'Accelerator') THEN 1.0
        WHEN v_lp.type = 'Government Fund' THEN 0.5
        -- Corporate VCs prefer strategic alignment
        WHEN v_lp.type = 'Corporate VC' THEN 0.75
        -- Family offices are flexible
        WHEN v_lp.type = 'Family Office' THEN 0.70
        -- University endowments prefer local ecosystem
        WHEN v_lp.type = 'University Endowment' AND v_fund.fund_type IN ('SSBCI', 'Accelerator') THEN 0.90
        WHEN v_lp.type = 'University Endowment' THEN 0.55
        ELSE 0.50
      END;

      -- Geographic nexus (15%): Nevada connection
      v_geo := CASE
        WHEN v_lp.headquarters ILIKE '%Nevada%' OR v_lp.headquarters ILIKE '%NV%'
          OR v_lp.headquarters ILIKE '%Las Vegas%' OR v_lp.headquarters ILIKE '%Reno%' THEN 1.0
        WHEN v_lp.headquarters ILIKE '%Salt Lake%' OR v_lp.headquarters ILIKE '%UT%' THEN 0.7
        WHEN v_lp.headquarters ILIKE '%CA%' OR v_lp.headquarters ILIKE '%California%' THEN 0.6
        ELSE 0.4
      END;

      -- Track record (10%): has the LP backed similar fund types?
      v_track := CASE
        WHEN v_lp.type IN ('Pension Fund', 'Institutional') THEN 0.85
        WHEN v_lp.type = 'Corporate VC' AND v_fund.fund_type IN ('SSBCI', 'Angel') THEN 0.70
        WHEN v_lp.type = 'Family Office' THEN 0.60
        WHEN v_lp.type = 'University Endowment' THEN 0.50
        ELSE 0.40
      END;

      -- Composite score
      v_final := ROUND(
        (v_thesis * 0.30) + (v_capital * 0.25) + (v_stage * 0.20)
        + (v_geo * 0.15) + (v_track * 0.10), 3
      );

      IF v_final >= 0.45 THEN
        v_color := CASE
          WHEN v_final >= 0.80 THEN '#818CF8'  -- indigo (excellent LP match)
          WHEN v_final >= 0.65 THEN '#A78BFA'  -- purple (good)
          WHEN v_final >= 0.50 THEN '#C4B5FD'  -- light purple (fair)
          ELSE '#9CA3AF' END;
        v_opacity := CASE
          WHEN v_final >= 0.80 THEN 0.85
          WHEN v_final >= 0.65 THEN 0.70
          WHEN v_final >= 0.50 THEN 0.55
          ELSE 0.40 END;

        INSERT INTO graph_edges (
          source_id, target_id, rel, source_type, target_type,
          edge_category, edge_style, edge_color, edge_opacity,
          matching_score, matching_criteria, eligible_since,
          confidence, verified, agent_id, note
        ) VALUES (
          'x_' || v_lp.id, 'f_' || v_fund.id, 'potential_lp',
          'external', 'fund',
          'opportunity', '6,4', v_color, v_opacity,
          ROUND(v_final, 2),
          jsonb_build_object(
            'thesis_alignment', ROUND(v_thesis, 3),
            'capital_capacity', ROUND(v_capital, 3),
            'stage_alignment', ROUND(v_stage, 3),
            'geographic_nexus', ROUND(v_geo, 3),
            'track_record', ROUND(v_track, 3),
            'lp_type', v_lp.type,
            'lp_name', v_lp.name,
            'fund_name', v_fund.name,
            'fund_type', v_fund.fund_type
          ),
          CURRENT_DATE,
          ROUND(v_final, 2), true, 'migration-023',
          v_lp.name || ' potential LP → ' || v_fund.name
        );
        v_created := v_created + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '== Migration 023: Potential LP Edges ==';
  RAISE NOTICE '  Pairs evaluated: %', v_eval;
  RAISE NOTICE '  LP edges created (>= 0.45): %', v_created;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edges_potential_lp
  ON graph_edges(source_id, target_id) WHERE rel = 'potential_lp';
CREATE INDEX IF NOT EXISTS idx_edges_potential_lp_score
  ON graph_edges(matching_score DESC) WHERE rel = 'potential_lp';

-- Verification
SELECT rel, COUNT(*), ROUND(AVG(matching_score), 3) AS avg_score
FROM graph_edges WHERE rel = 'potential_lp' GROUP BY rel;

SELECT ge.source_id, e.name AS lp_name, e.type AS lp_type,
  ge.target_id, f.name AS fund_name, ge.matching_score,
  ge.matching_criteria->>'thesis_alignment' AS thesis,
  ge.matching_criteria->>'capital_capacity' AS capital,
  ge.matching_criteria->>'geographic_nexus' AS geo
FROM graph_edges ge
JOIN externals e ON e.id = CAST(REPLACE(ge.source_id, 'x_', '') AS INTEGER)
JOIN funds f ON f.id = REPLACE(ge.target_id, 'f_', '')
WHERE ge.rel = 'potential_lp'
ORDER BY ge.matching_score DESC LIMIT 20;
