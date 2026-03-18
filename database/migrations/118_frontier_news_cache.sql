CREATE TABLE IF NOT EXISTS frontier_news_cache (
  id VARCHAR(60) PRIMARY KEY,
  source VARCHAR(30) NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  score INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  author VARCHAR(100),
  published_at TIMESTAMPTZ,
  relevance FLOAT DEFAULT 0,
  nevada_match BOOLEAN DEFAULT false,
  matched_sectors TEXT[] DEFAULT '{}',
  company_matches TEXT[] DEFAULT '{}',
  tag VARCHAR(50),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fnc_relevance ON frontier_news_cache(relevance DESC);
CREATE INDEX IF NOT EXISTS idx_fnc_fetched ON frontier_news_cache(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_fnc_nevada ON frontier_news_cache(nevada_match) WHERE nevada_match = true;
