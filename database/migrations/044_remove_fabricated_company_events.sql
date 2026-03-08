-- Migration 044: Remove fabricated company names from timeline events and external nodes
-- Per audit (migration-043 corrections + agent audit report), the following companies
-- do not exist and were invented by AI agents in migrations 027-029.
--
-- FABRICATED COMPANIES BEING REMOVED:
--   From 029_events_company_milestones_march2026.sql:
--     SentryEdge Systems  — zero web presence, generic "Edge" cybersecurity portmanteau
--     IronShield Defense  — zero web presence, no DOD SBIR award found in federal databases
--     SolarSpan Nevada    — zero web presence, no NV Energy PPA record found
--     ClearDiagnostics AI — zero web presence, no FDA 510(k) clearance found
--
--   From 027_events_risk_capital_march2026.sql:
--     ShieldOps           — zero web presence, no confirmed 1864 Capital investment
--     SentinelEdge        — zero web presence, DCVC portfolio does not include this company
--
--   From 028_events_family_offices_march2026.sql:
--     QuantumEdge AI      — zero web presence matching described profile; no Goldman Sachs
--                           growth equity round at described valuation found in any source
--
-- INCORRECTLY ATTRIBUTED COMPANIES (real companies, wrong location) — flagged, not deleted.
-- These need human review before removing from the companies table:
--   Protect AI (id:13)    — real company, Seattle WA not Las Vegas
--   Nuvve Corp (id:64)    — real company (NVVE), San Diego CA not Las Vegas
--   SiO2 Materials (id:48)— real company, Auburn AL not Las Vegas
--   Sapien (id:43)        — real company, San Francisco CA
--   Cognizer AI (id:25)   — real company, Bay Area CA (has StartUpNV connection)
--   Skydio Gov (id:72)    — not a registered entity; Skydio Inc. is California-based
--   Tilt AI (id:36)       — zero web presence; "$26.3M revenue" claim for 2024 seed implausible
--   fibrX (id:31)         — zero web presence despite "AngelNV 2025 finalist" claim

-- ============================================================
-- SECTION 1: Remove timeline events for fabricated companies
-- ============================================================

DELETE FROM timeline_events
WHERE company_name IN (
  'SentryEdge Systems',
  'IronShield Defense',
  'SolarSpan Nevada',
  'SolarSpan',
  'ClearDiagnostics AI',
  'ShieldOps',
  'SentinelEdge',
  'QuantumEdge AI'
);

-- ============================================================
-- SECTION 2: Remove stakeholder_activities for fabricated companies
-- ============================================================

DELETE FROM stakeholder_activities
WHERE company_id IN (
  'sentryedge-systems',
  'ironshield-defense',
  'solarspan-nevada',
  'cleardiagnostics-ai',
  'shieldops',
  'sentineledge',
  'quantumedge-ai'
);

-- ============================================================
-- SECTION 3: Remove graph_edges involving fabricated external nodes
-- ============================================================

DELETE FROM graph_edges
WHERE source_id IN (
  'x_sentryedge', 'x_ironshield-defense', 'x_solarspan',
  'x_cleardiagnostics', 'x_shieldops', 'x_sentineledge',
  'x_quantumedge-ai'
)
OR target_id IN (
  'x_sentryedge', 'x_ironshield-defense', 'x_solarspan',
  'x_cleardiagnostics', 'x_shieldops', 'x_sentineledge',
  'x_quantumedge-ai'
);

-- ============================================================
-- SECTION 4: Remove fabricated external nodes
-- ============================================================

DELETE FROM externals
WHERE name IN (
  'SentryEdge Systems',
  'IronShield Defense',
  'SolarSpan Nevada',
  'SolarSpan',
  'ClearDiagnostics AI',
  'ShieldOps',
  'SentinelEdge',
  'QuantumEdge AI'
);

-- ============================================================
-- SECTION 5: Flag incorrectly attributed companies for human review
-- ============================================================
-- Rather than deleting, add a note to their description and set verified=FALSE
-- so the team can review and correct or remove each one.

UPDATE companies
SET
  verified = FALSE,
  description = '[NEEDS REVIEW: company location may be incorrect — see migration 044] ' || COALESCE(description, '')
WHERE name IN (
  'Protect AI',
  'Nuvve Corp',
  'SiO2 Materials',
  'Sapien',
  'Cognizer AI',
  'Skydio Gov',
  'Tilt AI',
  'fibrX',
  'Stable'
);

-- ============================================================
-- SECTION 6: Verification queries
-- ============================================================

-- Confirm fabricated timeline events are gone
SELECT COUNT(*) AS remaining_fabricated_events
FROM timeline_events
WHERE company_name IN (
  'SentryEdge Systems', 'IronShield Defense', 'SolarSpan Nevada',
  'ClearDiagnostics AI', 'ShieldOps', 'SentinelEdge', 'QuantumEdge AI'
);

-- Show flagged companies needing review
SELECT id, name, city, region, verified
FROM companies
WHERE description LIKE '%NEEDS REVIEW%'
ORDER BY name;

-- Confirm external nodes removed
SELECT COUNT(*) AS remaining_fabricated_externals
FROM externals
WHERE name IN (
  'SentryEdge Systems', 'IronShield Defense', 'SolarSpan Nevada',
  'ClearDiagnostics AI', 'ShieldOps', 'SentinelEdge', 'QuantumEdge AI'
);
