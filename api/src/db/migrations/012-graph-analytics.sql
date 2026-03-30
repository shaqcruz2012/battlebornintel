-- Graph analytics persistence layer
-- Pre-computed per-node metrics (PageRank, betweenness, communities, K-means)

CREATE TABLE IF NOT EXISTS graph_analytics (
  node_id         TEXT PRIMARY KEY,
  node_type       TEXT,
  pagerank        REAL DEFAULT 0,
  betweenness     REAL DEFAULT 0,
  degree          INTEGER DEFAULT 0,
  community_id    INTEGER,
  community_name  TEXT,
  kmeans_cluster  INTEGER,
  kmeans_label    TEXT,
  computed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS graph_clusters (
  id              SERIAL PRIMARY KEY,
  cluster_type    TEXT NOT NULL,
  cluster_id      INTEGER NOT NULL,
  name            TEXT,
  member_count    INTEGER DEFAULT 0,
  avg_pagerank    REAL DEFAULT 0,
  avg_betweenness REAL DEFAULT 0,
  avg_funding     REAL DEFAULT 0,
  top_sectors     TEXT[],
  top_members     TEXT[],
  computed_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cluster_type, cluster_id)
);

CREATE INDEX IF NOT EXISTS idx_graph_analytics_type ON graph_analytics(node_type);
CREATE INDEX IF NOT EXISTS idx_graph_analytics_community ON graph_analytics(community_id);
CREATE INDEX IF NOT EXISTS idx_graph_analytics_kmeans ON graph_analytics(kmeans_cluster);
CREATE INDEX IF NOT EXISTS idx_graph_clusters_type ON graph_clusters(cluster_type);
