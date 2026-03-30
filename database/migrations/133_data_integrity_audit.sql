-- Migration 133: Data integrity audit
-- Verifies complete removal of fabricated data from migrations 041-050,
-- finds orphaned edges, checks entity_registry completeness, deduplicates edges.

BEGIN;

-- ═══ 1. Fabricated entity audit ═════════════════════════════════════════════
-- Known fake slugs from migrations 041 (DFV fabricated companies) and 111 (AI-generated fakes).

DELETE FROM companies WHERE slug IN (
  'ironveil-systems', 'forgeai-defense', 'neonshield-cyber',
  'desertsentinel', 'vaultlink-technologies', 'strikepoint-analytics',
  'neonmind-ai', 'vegaslogic-ai', 'payvault-financial',
  'greatbasin-genomics', 'nevadavolt-energy', 'shieldwall-security',
  'casinoiq-analytics', 'desertwind-autonomous', 'sierra-nevada-energy',
  'truckee-robotics'
);

-- Clean edges referencing fabricated entities
DELETE FROM graph_edges WHERE source_id IN (
  'c_ironveil-systems', 'c_forgeai-defense', 'c_neonshield-cyber',
  'c_desertsentinel', 'c_vaultlink-technologies', 'c_strikepoint-analytics',
  'c_neonmind-ai', 'c_vegaslogic-ai', 'c_payvault-financial',
  'c_greatbasin-genomics', 'c_nevadavolt-energy', 'c_shieldwall-security',
  'c_casinoiq-analytics', 'c_desertwind-autonomous'
) OR target_id IN (
  'c_ironveil-systems', 'c_forgeai-defense', 'c_neonshield-cyber',
  'c_desertsentinel', 'c_vaultlink-technologies', 'c_strikepoint-analytics',
  'c_neonmind-ai', 'c_vegaslogic-ai', 'c_payvault-financial',
  'c_greatbasin-genomics', 'c_nevadavolt-energy', 'c_shieldwall-security',
  'c_casinoiq-analytics', 'c_desertwind-autonomous'
);

-- Clean entity_registry
DELETE FROM entity_registry WHERE canonical_id IN (
  'c_ironveil-systems', 'c_forgeai-defense', 'c_neonshield-cyber',
  'c_desertsentinel', 'c_vaultlink-technologies', 'c_strikepoint-analytics',
  'c_neonmind-ai', 'c_vegaslogic-ai', 'c_payvault-financial',
  'c_greatbasin-genomics', 'c_nevadavolt-energy', 'c_shieldwall-security',
  'c_casinoiq-analytics', 'c_desertwind-autonomous'
);

-- Clean timeline_events
DELETE FROM timeline_events WHERE company_name IN (
  'IronVeil Systems', 'ForgeAI Defense', 'NeonShield Cyber',
  'DesertSentinel', 'VaultLink Technologies', 'StrikePoint Analytics',
  'NeonMind AI', 'VegasLogic AI', 'PayVault Financial',
  'GreatBasin Genomics', 'NevadaVolt Energy', 'ShieldWall Security',
  'CasinoIQ Analytics', 'DesertWind Autonomous'
);

-- Clean events table (consolidated timeline + stakeholder activities)
DELETE FROM events WHERE company_name IN (
  'IronVeil Systems', 'ForgeAI Defense', 'NeonShield Cyber',
  'DesertSentinel', 'VaultLink Technologies', 'StrikePoint Analytics',
  'NeonMind AI', 'VegasLogic AI', 'PayVault Financial',
  'GreatBasin Genomics', 'NevadaVolt Energy', 'ShieldWall Security',
  'CasinoIQ Analytics', 'DesertWind Autonomous'
);

-- Clean stakeholder_activities
DELETE FROM stakeholder_activities WHERE company_id IN (
  'ironveil-systems', 'forgeai-defense', 'neonshield-cyber',
  'desertsentinel', 'vaultlink-technologies', 'strikepoint-analytics',
  'neonmind-ai', 'vegaslogic-ai', 'payvault-financial',
  'greatbasin-genomics', 'nevadavolt-energy', 'shieldwall-security',
  'casinoiq-analytics', 'desertwind-autonomous'
);

-- ═══ 2. Orphaned edge detection ═════════════════════════════════════════════
-- Find and remove edges pointing to nonexistent entities.
-- Only delete edges where BOTH source and target are unresolvable.

DELETE FROM graph_edges ge
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = ge.source_id
)
AND NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = ge.target_id
)
AND ge.source_id NOT LIKE 's_%'
AND ge.source_id NOT LIKE 'r_%'
AND ge.target_id NOT LIKE 's_%'
AND ge.target_id NOT LIKE 'r_%';

-- ═══ 3. Entity registry completeness ════════════════════════════════════════
-- Ensure all source tables have corresponding entity_registry entries.

-- Companies
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT 'c_' || id, 'company', name, 'companies', id::TEXT, 0.9, TRUE, NOW(),
       to_tsvector('english', name)
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = 'c_' || c.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- Graph funds
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT 'f_' || id, 'fund', name, 'graph_funds', id, 0.9, TRUE, NOW(),
       to_tsvector('english', name)
FROM graph_funds gf
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = 'f_' || gf.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- Accelerators
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT id, 'accelerator', name, 'accelerators', id, 0.9, TRUE, NOW(),
       to_tsvector('english', name)
FROM accelerators a
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = a.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- Ecosystem orgs
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT id, 'ecosystem_org', name, 'ecosystem_orgs', id, 0.9, TRUE, NOW(),
       to_tsvector('english', name)
FROM ecosystem_orgs eo
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = eo.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- People
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT id, 'person', name, 'people', id, 0.8, FALSE, NOW(),
       to_tsvector('english', name)
FROM people p
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = p.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- Externals
INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT id, 'external', name, 'externals', id, 0.8, FALSE, NOW(),
       to_tsvector('english', name)
FROM externals e
WHERE NOT EXISTS (
  SELECT 1 FROM entity_registry er WHERE er.canonical_id = e.id
)
ON CONFLICT (canonical_id) DO NOTHING;

-- ═══ 4. Duplicate edge cleanup ═════════════════════════════════════════════
-- Keep the edge with the highest confidence (or most recent) for each (source, target, rel) triple.

DELETE FROM graph_edges
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY source_id, target_id, rel
             ORDER BY COALESCE(confidence, 0) DESC, id DESC
           ) AS rn
    FROM graph_edges
  ) ranked
  WHERE rn > 1
);

-- ═══ Verification ════════════════════════════════════════════════════════════

SELECT 'fabricated_companies_remaining' AS check_name,
       COUNT(*) AS count
FROM companies WHERE slug IN (
  'ironveil-systems', 'forgeai-defense', 'neonshield-cyber',
  'neonmind-ai', 'vegaslogic-ai', 'payvault-financial'
);

SELECT 'orphaned_edges_remaining' AS check_name,
       COUNT(*) AS count
FROM graph_edges ge
WHERE NOT EXISTS (SELECT 1 FROM entity_registry er WHERE er.canonical_id = ge.source_id)
  AND ge.source_id NOT LIKE 's_%' AND ge.source_id NOT LIKE 'r_%';

SELECT 'entity_registry_total' AS check_name, COUNT(*) AS count FROM entity_registry;

COMMIT;
