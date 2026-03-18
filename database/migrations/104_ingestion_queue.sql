-- Ingestion queue for pending data items awaiting human review
CREATE TABLE IF NOT EXISTS ingestion_queue (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,  -- 'crunchbase', 'news', 'sec', 'sbir', 'manual'
  source_url TEXT,
  entity_type VARCHAR(30) NOT NULL,  -- 'funding_round', 'partnership', 'hiring', 'edge', 'company'
  entity_data JSONB NOT NULL,  -- raw scraped/extracted data
  confidence FLOAT DEFAULT 0.5,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingestion_status ON ingestion_queue(status);
CREATE INDEX idx_ingestion_created ON ingestion_queue(created_at DESC);
CREATE INDEX idx_ingestion_source ON ingestion_queue(source);

-- Seed sample queue items for review UI
INSERT INTO ingestion_queue (source, source_url, entity_type, entity_data, confidence) VALUES
  ('news', 'https://techcrunch.com/2025/09/15/tensorwave-series-a', 'funding_round',
   '{"company": "TensorWave", "amount": 43000000, "round": "Series A", "date": "2025-09-15", "lead_investor": "Nexus Venture Partners"}', 0.85),
  ('crunchbase', 'https://crunchbase.com/funding_round/nanotech-seed-2025', 'funding_round',
   '{"company": "NanoTech Solutions", "amount": 2500000, "round": "Seed", "date": "2025-11-01", "lead_investor": "Battle Born Ventures"}', 0.92),
  ('news', 'https://reuters.com/technology/dronelink-shield-ai-partnership', 'partnership',
   '{"company_a": "DroneLink Systems", "company_b": "Shield AI", "type": "strategic_partnership", "date": "2025-10-20", "details": "Joint development of autonomous drone navigation systems for defense applications"}', 0.78),
  ('sec', 'https://sec.gov/cgi-bin/browse-edgar?action=getcompany&company=switchbit', 'funding_round',
   '{"company": "SwitchBit", "amount": 15000000, "round": "Series B", "date": "2025-12-05", "lead_investor": "Andreessen Horowitz", "valuation": 75000000}', 0.95),
  ('sbir', 'https://sbir.gov/node/2456789', 'funding_round',
   '{"company": "DesertComms", "amount": 1100000, "round": "SBIR Phase II", "date": "2025-08-22", "agency": "Department of Defense", "topic": "Resilient tactical communications"}', 0.99),
  ('news', 'https://vegasinc.lasvegassun.com/solar-manufacturing-expansion', 'hiring',
   '{"company": "Helios Solar Tech", "positions": 45, "department": "Manufacturing", "date": "2025-10-10", "details": "New manufacturing facility in North Las Vegas creating 45 jobs"}', 0.72),
  ('manual', NULL, 'edge',
   '{"source_id": "bbv1", "target_id": "tensorwave", "rel": "invested_in", "note": "Seed round participation Q3 2025", "event_year": 2025}', 0.60),
  ('news', 'https://reviewjournal.com/business/new-ai-startup-reno', 'company',
   '{"name": "Sierra Neural Labs", "slug": "sierra-neural-labs", "stage": "seed", "sectors": ["AI/ML", "Defense Tech"], "city": "Reno", "region": "northern", "founded": 2025, "description": "AI-powered sensor fusion for autonomous vehicles and defense platforms"}', 0.80),
  ('crunchbase', 'https://crunchbase.com/organization/quantumleap-nv', 'company',
   '{"name": "QuantumLeap NV", "slug": "quantumleap-nv", "stage": "pre-seed", "sectors": ["Quantum Computing"], "city": "Las Vegas", "region": "southern", "founded": 2025, "description": "Quantum computing applications for logistics optimization in gaming and hospitality"}', 0.88),
  ('news', 'https://techcrunch.com/2025/11/reno-accelerator-partnership', 'partnership',
   '{"company_a": "StartUpNV", "company_b": "Y Combinator", "type": "referral_partnership", "date": "2025-11-15", "details": "StartUpNV becomes official Y Combinator referral partner for Nevada startups"}', 0.70);
