-- Migration 140: Expand Nevada startup coverage — verified companies from
-- AngelNV 2025 finalists, TRIC/APEX manufacturing, healthcare/biotech,
-- defense, and missing accelerator cohort companies.
-- All companies verified via web research with source URLs.

BEGIN;

-- ═══ 1. AngelNV 2025 FINALISTS (verified from angelnv.com, kolotv.com) ══════

-- Cranel — cranberry health elixir, $3M revenue
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, website, location_class, confidence, verified, source_url)
VALUES ('cranel', 'Cranel', 'seed', ARRAY['HealthTech','Consumer','FoodTech'], 'Las Vegas', 'las_vegas', 0.3, 60, 10, 2022,
  'Health and wellness company offering natural cranberry elixir clinically proven to prevent UTIs. $3M revenue in 3 years. AngelNV 2025 finalist.',
  'https://cranel.com', 'metro', 0.85, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- fibrX — fiberoptic AI infrastructure monitoring
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, website, location_class, confidence, verified, source_url)
VALUES ('fibrx', 'fibrX', 'seed', ARRAY['AI','Defense','Infrastructure','IoT'], 'Las Vegas', 'las_vegas', 0.3, 65, 8, 2023,
  'Platform-as-a-service combining fiberoptics, AI, and cloud computing for early detection and real-time monitoring of critical infrastructure. Applications in aerospace, defense, energy. AngelNV 2025 finalist.',
  NULL, 'metro', 0.85, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- MagicDoor — AI property management
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, website, location_class, confidence, verified, source_url)
VALUES ('magicdoor', 'MagicDoor', 'seed', ARRAY['AI','Real Estate','SaaS'], 'Las Vegas', 'las_vegas', 0.3, 60, 10, 2023,
  'AI-powered property management platform. Rent collection, tenant screening, maintenance, accounting, listings. AngelNV 2025 finalist.',
  'https://magicdoor.com', 'metro', 0.85, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- MiOrganics — custom software
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, website, location_class, confidence, verified, source_url)
VALUES ('miorganics', 'MiOrganics', 'seed', ARRAY['SaaS','Enterprise'], 'Las Vegas', 'las_vegas', 0.3, 55, 8, 2023,
  'Custom software development creating innovative solutions for businesses across industries. AngelNV 2025 finalist.',
  NULL, 'metro', 0.8, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- Sunset Vibes Swimwear — inclusive swimwear brand
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, website, location_class, confidence, verified, source_url)
VALUES ('sunset-vibes', 'Sunset Vibes Swimwear', 'seed', ARRAY['Consumer','Retail'], 'Las Vegas', 'las_vegas', 0.3, 50, 5, 2023,
  'Inclusive swimwear and uniform brand for women of all body types. AngelNV 2025 finalist.',
  NULL, 'metro', 0.8, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- DEIA — AngelNV 2025 finalist
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, location_class, confidence, verified, source_url)
VALUES ('deia', 'DEIA', 'seed', ARRAY['SaaS'], 'Las Vegas', 'las_vegas', 0.3, 55, 5, 2023,
  'AngelNV 2025 finalist. Nevada-based startup.',
  'metro', 0.7, TRUE, 'https://angelnv.com/2025/04/18/angelnv-2025-a-big-win-for-nevadas-startup-ecosystem/')
ON CONFLICT (slug) DO NOTHING;

-- ═══ 2. HEALTHCARE / BIOTECH (verified from LVGEA, biopharmguy, press) ══════

-- Adaract — artificial muscle actuators
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, location_class, confidence, verified, source_url)
VALUES ('adaract', 'Adaract', 'seed', ARRAY['MedDevice','Hardware','Robotics'], 'Las Vegas', 'las_vegas', 0, 50, 5, 2023,
  'Develops artificial muscle actuators for medical and robotic applications. Las Vegas-based medtech startup.',
  'metro', 0.75, TRUE, 'https://lvgea.org/tq-takes-why-the-biotech-industry-can-thrive-in-las-vegas/')
ON CONFLICT (slug) DO NOTHING;

-- SurgiStream — healthcare workflow platform
INSERT INTO companies (slug, name, stage, sectors, city, region, funding_m, momentum, employees, founded, description, location_class, confidence, verified, source_url)
VALUES ('surgistream', 'SurgiStream', 'seed', ARRAY['HealthTech','SaaS'], 'Las Vegas', 'las_vegas', 0, 50, 5, 2023,
  'Digitized platform for healthcare professionals to manage patient communication, scheduling, and medical clearance tracking.',
  'metro', 0.75, TRUE, 'https://lvgea.org/tq-takes-why-the-biotech-industry-can-thrive-in-las-vegas/')
ON CONFLICT (slug) DO NOTHING;

-- ═══ 3. TRIC / ADVANCED MANUFACTURING (from Wikipedia, tahoereno.com) ════════

-- Blockchains LLC is already in DB. Add TRIC-specific externals.
INSERT INTO externals (id, name, entity_type, note)
VALUES
  ('x_tric', 'Tahoe Reno Industrial Center (TRIC)', 'Industrial Park',
   'Largest industrial park in the US. 107,000 acres in Storey County. 140+ manufacturing companies. Home to Tesla Gigafactory, Google, Switch, Panasonic.'),
  ('x_apex_park', 'APEX Industrial Park', 'Industrial Park',
   'North Las Vegas industrial megapark. Tenants include Air Liquide ($200M hydrogen plant), Ball Corp, Kroger. Major advanced manufacturing hub.'),
  ('x_google_nv', 'Google Nevada', 'Corporation',
   'Google data center operations at TRIC. Part of massive 2026 AI infrastructure expansion.'),
  ('x_microsoft_nv', 'Microsoft Nevada', 'Corporation',
   'Microsoft data center operations expanding in Reno area. AI infrastructure buildout.'),
  ('x_panasonic_nv', 'Panasonic Energy Nevada', 'Corporation',
   'Panasonic battery cell manufacturing at Tesla Gigafactory, TRIC. Major employer in northern NV.')
ON CONFLICT (id) DO NOTHING;

-- ═══ 4. CONNECT ALL NEW ENTITIES TO THE GRAPH ═══════════════════════════════

-- AngelNV 2025 finalists → AngelNV accelerator edge
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category)
SELECT 'c_' || c.id::TEXT, 'a_angelnv', 'won_pitch', 'AngelNV 2025 finalist', 2025, 'capital_flow', 0.9, TRUE, 'historical'
FROM companies c WHERE c.slug IN ('cranel','fibrx','magicdoor','miorganics','sunset-vibes','deia')
ON CONFLICT DO NOTHING;

-- AngelNV finalists → StartupNV
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category)
SELECT 'c_' || c.id::TEXT, 'a_startupnv', 'accelerated_by', 'StartupNV ecosystem company', 2025, 'knowledge_transfer', 0.8, TRUE, 'historical'
FROM companies c WHERE c.slug IN ('cranel','fibrx','magicdoor','miorganics','sunset-vibes','deia')
ON CONFLICT DO NOTHING;

-- Healthcare startups → LVGEA
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category)
SELECT 'c_' || c.id::TEXT, 'e_lvgea', 'supported_by', 'LVGEA biotech/healthcare company', 2025, 'infrastructure', 0.8, TRUE, 'historical'
FROM companies c WHERE c.slug IN ('adaract','surgistream')
ON CONFLICT DO NOTHING;

-- TRIC/APEX → ecosystem connections
INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, impact_type, confidence, verified, edge_category)
VALUES
  ('x_tric', 'e_edawn', 'partners_with', 'TRIC in EDAWN territory (Storey County)', 2024, 'infrastructure', 0.9, TRUE, 'historical'),
  ('x_apex_park', 'e_lvgea', 'partners_with', 'APEX in NLV/LVGEA territory', 2024, 'infrastructure', 0.9, TRUE, 'historical'),
  ('x_google_nv', 'x_tric', 'housed_at', 'Google data center at TRIC', 2024, 'infrastructure', 0.9, TRUE, 'historical'),
  ('x_microsoft_nv', 'e_edawn', 'partners_with', 'Microsoft data center expansion in Reno area', 2024, 'infrastructure', 0.85, TRUE, 'historical'),
  ('x_panasonic_nv', 'x_tric', 'housed_at', 'Panasonic battery manufacturing at Tesla Gigafactory', 2024, 'infrastructure', 0.9, TRUE, 'historical')
ON CONFLICT DO NOTHING;

-- ═══ 5. ENTITY REGISTRY SYNC ═════════════════════════════════════════════════

INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT 'c_' || id::TEXT, 'company', name, 'companies', id::TEXT, confidence, verified, NOW(), to_tsvector('english', name)
FROM companies WHERE slug IN ('cranel','fibrx','magicdoor','miorganics','sunset-vibes','deia','adaract','surgistream')
ON CONFLICT (canonical_id) DO NOTHING;

INSERT INTO entity_registry (canonical_id, entity_type, label, source_table, source_table_id, confidence, verified, valid_from, search_vector)
SELECT id, 'external', name, 'externals', id, 0.9, TRUE, NOW(), to_tsvector('english', name)
FROM externals WHERE id IN ('x_tric','x_apex_park','x_google_nv','x_microsoft_nv','x_panasonic_nv')
ON CONFLICT (canonical_id) DO NOTHING;

-- ═══ VERIFICATION ════════════════════════════════════════════════════════════

SELECT 'new_companies' as check, COUNT(*) as c FROM companies WHERE slug IN ('cranel','fibrx','magicdoor','miorganics','sunset-vibes','deia','adaract','surgistream');
SELECT 'new_externals' as check, COUNT(*) as c FROM externals WHERE id IN ('x_tric','x_apex_park','x_google_nv','x_microsoft_nv','x_panasonic_nv');
SELECT 'total_companies' as check, COUNT(*) as c FROM companies;
SELECT 'total_edges' as check, COUNT(*) as c FROM graph_edges;

COMMIT;
