-- Migration 022: Populate Fund-to-Company Opportunity Edges
-- Creates 'fund_opportunity' edges connecting funds to potential portfolio companies.
-- EXCLUDES companies where the fund has ALREADY invested (invested_in edges).
-- Scoring: Stage 30%, Sector 25%, Capital 20%, Check Size 15%, Geo 10%

DELETE FROM graph_edges WHERE rel = 'fund_opportunity';

DO $$
DECLARE
  v_fund    RECORD;
  v_company RECORD;
  v_result  JSONB;
  v_score   NUMERIC(4,3);
  v_already BOOLEAN;
  v_created INTEGER := 0;
  v_eval    INTEGER := 0;
  v_skip    INTEGER := 0;
  v_color   VARCHAR(9);
  v_opacity NUMERIC(3,2);
BEGIN
  FOR v_fund IN SELECT id, name, fund_type FROM funds ORDER BY id LOOP
    FOR v_company IN SELECT id, name, stage FROM companies ORDER BY id LOOP
      v_eval := v_eval + 1;

      -- Skip existing investments
      SELECT EXISTS (
        SELECT 1 FROM graph_edges
        WHERE source_id = 'f_' || v_fund.id AND target_id = 'c_' || v_company.id
          AND rel IN ('invested_in', 'acquired')
      ) INTO v_already;

      IF v_already THEN v_skip := v_skip + 1; CONTINUE; END IF;

      v_result := calculate_fund_opportunity_match(v_fund.id, v_company.id);
      IF v_result ? 'error' THEN CONTINUE; END IF;

      v_score := (v_result->>'overall_score')::NUMERIC;

      IF v_score >= 0.40 THEN
        v_color := CASE
          WHEN v_score >= 0.80 THEN '#22C55E'
          WHEN v_score >= 0.65 THEN '#16A34A'
          WHEN v_score >= 0.50 THEN '#F59E0B'
          ELSE '#9CA3AF' END;
        v_opacity := CASE
          WHEN v_score >= 0.80 THEN 0.85
          WHEN v_score >= 0.65 THEN 0.70
          WHEN v_score >= 0.50 THEN 0.55
          ELSE 0.40 END;

        INSERT INTO graph_edges (
          source_id, target_id, rel, source_type, target_type,
          edge_category, edge_style, edge_color, edge_opacity,
          matching_score, matching_criteria, eligible_since,
          confidence, verified, agent_id, note
        ) VALUES (
          'f_' || v_fund.id, 'c_' || v_company.id, 'fund_opportunity',
          'fund', 'company',
          'opportunity', '6,4', v_color, v_opacity,
          ROUND(v_score, 2), v_result, CURRENT_DATE,
          ROUND(v_score, 2), true, 'migration-022',
          v_fund.name || ' → ' || v_company.name || ' (' || v_company.stage || ')'
        );
        v_created := v_created + 1;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '== Migration 022 Complete ==';
  RAISE NOTICE '  Pairs evaluated: %', v_eval;
  RAISE NOTICE '  Skipped (invested): %', v_skip;
  RAISE NOTICE '  Edges created (>= 0.40): %', v_created;
END;
$$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edges_fund_opportunity
  ON graph_edges(source_id, target_id) WHERE rel = 'fund_opportunity';
CREATE INDEX IF NOT EXISTS idx_edges_fund_opp_score
  ON graph_edges(matching_score DESC) WHERE rel = 'fund_opportunity';

-- Verification
SELECT rel, edge_category, COUNT(*), ROUND(AVG(matching_score), 3) AS avg_score
FROM graph_edges WHERE edge_category = 'opportunity'
GROUP BY rel, edge_category ORDER BY rel;

SELECT ge.source_id, f.name, f.fund_type, COUNT(*) AS opp_count,
  ROUND(AVG(ge.matching_score), 3) AS avg_score
FROM graph_edges ge JOIN funds f ON f.id = REPLACE(ge.source_id, 'f_', '')
WHERE ge.rel = 'fund_opportunity'
GROUP BY ge.source_id, f.name, f.fund_type ORDER BY opp_count DESC;

SELECT CASE
  WHEN matching_score >= 0.80 THEN 'Excellent'
  WHEN matching_score >= 0.65 THEN 'Good'
  WHEN matching_score >= 0.50 THEN 'Fair'
  ELSE 'Marginal' END AS quality,
  COUNT(*), ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS pct
FROM graph_edges WHERE rel = 'fund_opportunity'
GROUP BY 1 ORDER BY MIN(matching_score) DESC;
