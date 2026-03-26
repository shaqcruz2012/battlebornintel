-- Migration: Add indexes for risk engine + graph edge lookups
-- Speeds up: getRiskData event_freshness CTE, getCompanyById edge lookup

-- Events: speed up risk engine event freshness aggregation
CREATE INDEX IF NOT EXISTS idx_events_company_date
  ON events(company_id, event_date DESC)
  WHERE company_id IS NOT NULL;

-- Graph edges: speed up single-node edge lookups (company detail page)
CREATE INDEX IF NOT EXISTS idx_graph_edges_source
  ON graph_edges(source_id);

CREATE INDEX IF NOT EXISTS idx_graph_edges_target
  ON graph_edges(target_id);

-- Graph edges: speed up year-filtered queries (graph endpoint)
CREATE INDEX IF NOT EXISTS idx_graph_edges_year
  ON graph_edges(event_year);

ANALYZE events;
ANALYZE graph_edges;
