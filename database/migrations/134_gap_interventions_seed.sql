-- Migration 134: Gap interventions seed from T-GNN research report
-- These are real analytical findings from the March 2026 temporal-GNN analysis,
-- NOT fabricated data. Each gap was identified through structural hole analysis
-- of the Nevada innovation ecosystem graph.

BEGIN;

INSERT INTO gap_interventions (gap_type, gap_name, severity, sector_pair, status, proposed_by, notes)
VALUES
  ('structural',
   'CleanTech-Reno to AI-LV disconnect',
   'critical',
   'CleanTech-Reno ↔ AI-LV',
   'proposed',
   'tgnn_report_2026',
   'Companies including Redwood Materials ($4.17B), Ioneer ($700M), Lyten ($425M), Dragonfly Energy ($120M) form a dense cluster with $5B+ combined funding but zero accelerator edges to the broader ecosystem. Cross-sector "AI for Mining" program would bridge cleantech cluster to AI talent pool.'),

  ('structural',
   'HealthTech to Enterprise SaaS disconnect',
   'high',
   'HealthTech ↔ Enterprise SaaS',
   'proposed',
   'tgnn_report_2026',
   'HealthTech companies (CareWear, ClickBio) and Enterprise SaaS companies (CIQ, Duetto) operate in isolated clusters despite overlapping B2B go-to-market needs. A health-enterprise bridge accelerator would enable cross-pollination.'),

  ('structural',
   'Defense-Nellis to Civilian AI disconnect',
   'medium',
   'Defense-Nellis ↔ Civilian AI',
   'proposed',
   'tgnn_report_2026',
   'AFWERX and defense companies near Nellis/Creech operate separately from civilian AI companies (TensorWave, Cognizer). A dual-use commercialization pathway would leverage proximity to military installations for tech transfer.'),

  ('structural',
   'University Research to Growth-Stage gap',
   'high',
   'University Research ↔ Growth-Stage ($50M+)',
   'proposed',
   'tgnn_report_2026',
   'UNR and UNLV research outputs have minimal connections to growth-stage companies ($50M+ funding). This is the core Knowledge Fund mandate gap. Tech licensing and spinout programs would convert research to commercial enterprises.'),

  ('framework',
   'Rural Nevada accelerator isolation',
   'critical',
   'Rural NV ↔ Accelerators',
   'proposed',
   'tgnn_report_2026',
   '40+ companies operate outside Reno/LV metros with zero accelerator coverage. Elko, Pahrump, Mesquite, Winnemucca have no accelerator connections. Only Adams Hub in Carson City serves outside the twin metros with just 3 portfolio companies. Rural innovation hubs would create first-ever rural entrepreneur connections.'),

  ('framework',
   'Underrepresented founder hollow nodes',
   'high',
   'Inclusive Programs ↔ Deal Flow',
   'proposed',
   'tgnn_report_2026',
   'Audacity Fund Reno exists as an accelerator node but has zero documented portfolio company edges — a "hollow node" present in the graph but contributing no connections. Directing Knowledge Fund capacity to inclusive programs with active deal flow would activate dormant structural positions.')

ON CONFLICT DO NOTHING;

-- ═══ Verification ════════════════════════════════════════════════════════════

SELECT gap_name, severity, sector_pair, status
FROM gap_interventions
WHERE proposed_by = 'tgnn_report_2026'
ORDER BY severity;
