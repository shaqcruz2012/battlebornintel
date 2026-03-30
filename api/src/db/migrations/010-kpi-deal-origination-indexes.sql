-- Migration 010: Composite indexes for KPI deal origination queries
-- The deal origination KPI self-joins graph_edges on target_id, filtering
-- by source_id prefix (a_*, e_*, f_*) and rel type. These partial indexes
-- cover the two sides of the join efficiently.

-- 1. Accelerator/ecosystem org edges: covers ge1 in the deal origination join
CREATE INDEX IF NOT EXISTS idx_edges_public_inst
  ON graph_edges(target_id, rel)
  WHERE source_id LIKE 'a_%' OR source_id LIKE 'e_%';

-- 2. Fund investment edges: covers ge2 in the deal origination join
CREATE INDEX IF NOT EXISTS idx_edges_fund_invested
  ON graph_edges(target_id, source_id)
  WHERE rel = 'invested_in' AND source_id LIKE 'f_%';

-- 3. General composite for target+source+rel lookups (graph traversals)
CREATE INDEX IF NOT EXISTS idx_edges_target_source_rel
  ON graph_edges(target_id, source_id, rel);

ANALYZE graph_edges;
