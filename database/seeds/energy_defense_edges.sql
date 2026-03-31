-- ═══════════════════════════════════════════════════════════════════════════
-- Nevada Energy & Defense Industrial Base — Graph Enrichment
-- Verified institutional relationships and funding flows
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, weight) VALUES
-- DOE → Nevada Energy Companies
('x_doe', 'c_1', 'invested_in', 'DOE Loan Programs Office $2B conditional loan — Redwood Materials battery recycling campus', 2024, 0.95),
('x_doe', 'c_49', 'invested_in', 'DOE LPO $700M conditional loan — Ioneer Rhyolite Ridge lithium-boron project', 2024, 0.90),
('x_doe', 'c_156', 'contracts_with', 'DOE ARPA-E grant for ABTC lithium-ion recycling process development', 2023, 0.80),
('x_doe', 'c_159', 'contracts_with', 'DOE Geothermal Technologies Office — Cyrq Energy Nevada operations', 2023, 0.75),
('x_doe', 'c_74', 'contracts_with', 'DOE geothermal energy research partnership — Ormat Technologies Nevada facilities', 2022, 0.80),
('x_doe', 'c_56', 'contracts_with', 'DOE water-energy nexus research grant — WaterStart pilot programs', 2024, 0.70),

-- DOD / Defense → Nevada Defense Companies
('x_diu', 'c_167', 'contracts_with', 'DIU SBIR contract — BRINC first responder drone platform', 2024, 0.85),
('gov_DOD', 'c_51', 'contracts_with', 'NASA/DOD Dream Chaser cargo resupply program — SNC Sparks campus', 2024, 0.95),
('gov_DOD', 'c_72', 'contracts_with', 'Army SRR drone program — Skydio autonomous ISR systems', 2025, 0.90),
('gov_DOD', 'c_158', 'contracts_with', 'USAF ATARS augmented reality combat training — Red 6 at Nellis AFB', 2024, 0.85),
('gov_DOD', 'c_164', 'contracts_with', 'NNSA $500M mission support contract — Arcfield at Nevada National Security Site', 2024, 0.90),
('gov_DOD', 'c_162', 'contracts_with', 'DOD solar-powered HALE UAV program — Skydweller Aero persistent ISR', 2023, 0.80),
('gov_DOD', 'c_102', 'contracts_with', 'DARPA launch services agreement — Longshot Space kinetic energy launch', 2023, 0.75),
('x_nttr', 'c_158', 'partners_with', 'NTTR hosts Red 6 ATARS flight training demonstrations for USAF squadrons', 2024, 0.80),
('x_nttr', 'c_72', 'partners_with', 'NTTR UAS test corridor — Skydio autonomous flight operations testing', 2024, 0.75),
('x_nnss', 'c_164', 'partners_with', 'NNSS primary mission support contractor — Arcfield technical operations', 2024, 0.90),

-- NSF → Nevada Universities & Companies
('x_nsf', 'u_unr', 'invested_in', 'NSF EPSCoR Track-1 $20M — Autonomous Systems for Water Management at UNR', 2024, 0.90),
('x_nsf', 'u_unlv', 'invested_in', 'NSF I-Corps Hub $15M — UNLV joins Southwest regional hub', 2024, 0.85),
('x_nsf', 'u_dri', 'invested_in', 'NSF $3.2M — DRI climate-resilient water systems research', 2024, 0.80),
('x_nsf', 'c_52', 'contracts_with', 'NSF SBIR Phase II — Nevada Nano MEMS gas sensing technology', 2023, 0.75),
('x_nsf_swsie', 'u_unr', 'partners_with', 'NSF SWSIE Innovation Engine — UNR autonomous water systems R&D', 2025, 0.85),
('x_nsf_swsie', 'u_unlv', 'partners_with', 'NSF SWSIE Innovation Engine — UNLV smart water infrastructure', 2025, 0.85),

-- Knowledge Fund → University Research Commercialization
('e_knowledge_fund', 'c_52', 'invested_in', 'Knowledge Fund commercialization grant — Nevada Nano MEMS sensor technology via UNR', 2022, 0.75),
('e_knowledge_fund', 'c_56', 'invested_in', 'Knowledge Fund water technology grant — WaterStart via DRI partnership', 2023, 0.75),
('e_knowledge_fund', 'c_31', 'invested_in', 'Knowledge Fund materials science grant — fibrX advanced fibers via UNR research', 2021, 0.70),

-- GOED → Energy & Defense Ecosystem
('x_goed-nv', 'c_1', 'supports', 'GOED tax abatement — Redwood Materials $3.5B Carson City battery campus', 2022, 0.85),
('x_goed-nv', 'c_49', 'supports', 'GOED workforce training partnership — Ioneer Rhyolite Ridge mine workforce', 2024, 0.75),
('x_goed-nv', 'c_58', 'supports', 'GOED tax incentive package — Switch data center expansion Tahoe Reno', 2024, 0.80),
('x_goed-nv', 'c_156', 'supports', 'GOED clean energy initiative support — ABTC recycling operations McCarran', 2023, 0.75),
('x_goed-nv', 'c_51', 'supports', 'GOED aerospace partnership — Sierra Nevada Corp Sparks manufacturing campus', 2023, 0.80),

-- NV Energy / Utility Partnerships
('x_nvenergy', 'c_58', 'partners_with', 'NV Energy renewable PPA — Switch data centers 100% green energy commitment', 2023, 0.80),
('x_nvenergy', 'c_74', 'partners_with', 'NV Energy geothermal PPA — Ormat Technologies baseload power Nevada grid', 2022, 0.80),
('x_nvenergy', 'c_50', 'partners_with', 'NV Energy battery storage partnership — Dragonfly Energy LFP grid solutions', 2024, 0.70),

-- Cross-sector: Energy ↔ Defense supply chain
('c_1', 'c_156', 'partners_with', 'Critical minerals supply chain — Redwood cathode materials to ABTC recycled feed', 2024, 0.70),
('c_58', 'c_51', 'partners_with', 'Switch data center infrastructure supports SNC satellite C2 operations', 2023, 0.65),
('c_167', 'c_72', 'partners_with', 'Shared DOD first responder drone technology platform — BRINC and Skydio joint ops', 2024, 0.65),

-- Tesla Gigafactory → Nevada energy ecosystem
('x_222', 'c_1', 'partners_with', 'Tesla Gigafactory closed-loop battery recycling partnership with Redwood Materials', 2022, 0.90),
('x_222', 'c_50', 'partners_with', 'Tesla Gigafactory sourcing — Dragonfly Energy LFP cells for energy storage', 2023, 0.70),
('x_222', 'c_156', 'partners_with', 'Tesla Gigafactory recycled materials supply — ABTC cathode precursor materials', 2024, 0.75),

-- Panasonic Energy → Nevada battery cluster
('x_panasonic_nv', 'c_1', 'partners_with', 'Panasonic battery scrap recycling partnership with Redwood Materials Sparks', 2023, 0.85),
('x_panasonic_nv', 'x_222', 'partners_with', 'Panasonic Energy JV with Tesla at Gigafactory Nevada — 4680 cell production', 2023, 0.95),

-- Black Fire Innovation / UNLV defense accelerator
('a_blackfire', 'c_167', 'accelerated', 'Black Fire Innovation defense tech program — BRINC Drones first responder tech', 2023, 0.70),
('a_blackfire', 'c_158', 'accelerated', 'Black Fire Innovation AR/VR cohort — Red 6 augmented reality training', 2024, 0.70),
('a_blackfire', 'gov_DOD', 'partners_with', 'Black Fire Innovation DOD partnership — UNLV defense technology accelerator', 2024, 0.80)

ON CONFLICT DO NOTHING;
