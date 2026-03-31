-- ═══════════════════════════════════════════════════════════════════════════
-- Nevada Energy & Defense Industrial Base — HIGH CONFIDENCE ONLY
-- Only includes relationships that are widely reported public facts
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO graph_edges (source_id, target_id, rel, note, event_year, weight) VALUES

-- ── Tesla Gigafactory + Panasonic — well-documented JV ───────────────────
('x_222', 'x_panasonic_nv', 'partners_with', 'Panasonic Energy produces battery cells at Tesla Gigafactory Nevada since 2017', 2017, 0.95),

-- ── Redwood Materials — JB Straubel (Tesla co-founder) founded in Carson City
-- DOE conditional loan widely reported by Reuters, WSJ, DOE press release
('x_doe', 'c_1', 'invested_in', 'DOE Loan Programs Office conditional commitment for Redwood Materials battery campus in northern Nevada', 2024, 0.90),
('x_222', 'c_1', 'partners_with', 'Redwood Materials recycles battery scrap from Tesla Gigafactory Nevada — closed-loop supply chain', 2022, 0.90),
('x_panasonic_nv', 'c_1', 'partners_with', 'Panasonic Energy sends manufacturing scrap to Redwood Materials for recycling at nearby facility', 2022, 0.85),

-- ── Ioneer — DOE conditional loan widely covered by Bloomberg, Reuters
('x_doe', 'c_49', 'invested_in', 'DOE conditional loan commitment for Ioneer Rhyolite Ridge lithium-boron project in Nevada', 2024, 0.85),

-- ── Sierra Nevada Corp — Dream Chaser is public NASA program, SNC HQ in Sparks NV
('gov_DOD', 'c_51', 'contracts_with', 'Sierra Nevada Corp Dream Chaser spacecraft — NASA CRS-2 cargo resupply missions', 2024, 0.90),

-- ── Ormat Technologies — NYSE-listed, HQ Reno, operates NV geothermal plants
('x_nvenergy', 'c_74', 'partners_with', 'NV Energy purchases geothermal baseload power from Ormat Technologies Nevada plants', 2020, 0.80),

-- ── Switch — publicly known renewable energy commitment, Tahoe Reno campus
('x_nvenergy', 'c_58', 'partners_with', 'Switch operates data centers in Nevada with 100% renewable energy sourcing', 2020, 0.80),

-- ── GOED economic development incentives — public record
('x_goed-nv', 'c_1', 'supports', 'GOED approved tax abatements for Redwood Materials Nevada battery campus expansion', 2022, 0.80),
('x_goed-nv', 'c_51', 'supports', 'GOED economic development partnership — Sierra Nevada Corp aerospace manufacturing in Sparks', 2020, 0.75),
('x_goed-nv', 'c_58', 'supports', 'GOED tax incentive package for Switch data center operations in Nevada', 2020, 0.75)

ON CONFLICT DO NOTHING;
