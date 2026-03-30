-- Migration 133: Seed timeline events and constants from frontend static data
-- Source: frontend/src/data/timeline.js, frontend/src/data/constants.js

BEGIN;

-- ============================================================
-- Timeline Events from frontend TIMELINE_EVENTS array
-- Uses unique constraint (company_name, event_type, event_date) for idempotency
-- ============================================================

INSERT INTO timeline_events (event_date, event_type, company_name, detail, icon)
VALUES
  ('2025-02-20', 'funding',     'TensorWave',           'Deployed AMD MI355X GPUs — first cloud provider to market',                'rocket'),
  ('2025-02-18', 'partnership', 'Hubble Network',       'Muon Space contract for 500kg MuSat XL satellite buses',                   'handshake'),
  ('2025-02-15', 'hiring',      'Abnormal AI',          '+50 engineers hired Q1 — Las Vegas office expansion',                      'users'),
  ('2025-02-14', 'funding',     'MagicDoor',            '$4.5M Seed — Okapi VC + Shadow Ventures co-lead',                         'dollar'),
  ('2025-02-12', 'launch',      'Katalyst',             'New AI-personalized training programs with biometric feedback',            'rocket'),
  ('2025-02-10', 'momentum',    'TensorWave',           'Run-rate revenue exceeds $100M — 20x YoY growth',                         'trending'),
  ('2025-02-08', 'grant',       'Sierra Nevada Energy', 'DOE Geothermal Technologies Office grant — $2.1M',                        'government'),
  ('2025-02-07', 'partnership', 'Springbig',            'New payment integration live at 200+ NV dispensaries',                     'handshake'),
  ('2025-02-05', 'funding',     'Hubble Network',       '$70M Series B — total raised now $100M',                                  'dollar'),
  ('2025-02-04', 'award',       'MNTN',                 'Adweek Readers'' Choice: Best Addressable TV Solution (back-to-back)',     'trophy'),
  ('2025-02-03', 'funding',     'Redwood Materials',    '$425M Series E close — Google + Nvidia NVentures backing',                 'dollar'),
  ('2025-02-01', 'hiring',      'TensorWave',           'Team growing from 40 to 100+ employees by year end',                      'users'),
  ('2025-01-29', 'patent',      'Hubble Network',       'Patent granted: phased-array BLE satellite antenna system',               'patent'),
  ('2025-01-28', 'launch',      'Boxabl',               'New Casita 2.0 model with expanded floor plan announced',                 'rocket'),
  ('2025-01-25', 'grant',       'Nevada Nano',          'SBIR Phase II — $750K for MEMS gas sensing array',                        'government'),
  ('2025-01-23', 'momentum',    'Socure',               'Acquired Qlarifi — expanding into real-time BNPL credit',                 'trending'),
  ('2025-01-22', 'funding',     'Protect AI',           '$18.5M raised for AI/ML security platform expansion',                     'dollar'),
  ('2025-01-20', 'partnership', 'Kaptyn',               'EV fleet expansion — 25 new Tesla vehicles for Strip service',            'handshake'),
  ('2025-01-18', 'launch',      'CIQ',                  'Rocky Linux 9.5 release with enhanced enterprise security',               'rocket'),
  ('2025-01-17', 'funding',     'Amira Learning',       'Series B extension — expanding to 3,000+ schools',                        'dollar'),
  ('2025-01-15', 'award',       'Katalyst',             'CES 2025 Innovation Award — Best Fitness Technology',                     'trophy'),
  ('2025-01-14', 'momentum',    'Abnormal AI',          'Surpassed 2,000 enterprise customers — $5.1B valuation',                  'trending'),
  ('2025-01-12', 'grant',       'Truckee Robotics',     'SBIR Phase I — $275K autonomous mining inspection',                       'government'),
  ('2025-01-11', 'hiring',      'Redwood Materials',    '+85 roles posted for Carson City campus expansion',                        'users'),
  ('2025-01-10', 'partnership', '1047 Games',           'New publishing partnership for next-gen arena shooter',                    'handshake'),
  ('2025-01-08', 'funding',     'Cognizer AI',          '$240K FundNV investment for AI workflow automation',                       'dollar'),
  ('2025-01-07', 'patent',      'Redwood Materials',    '3 patents filed: cathode regeneration process improvements',              'patent'),
  ('2025-01-05', 'momentum',    'MagicDoor',            '500+ landlord accounts — fastest growing NV proptech',                    'trending'),
  ('2025-01-03', 'grant',       'WaterStart',           'SNWA pilot grant — $400K for atmospheric water generation test',          'government'),
  ('2025-01-02', 'hiring',      'Socure',               'Matt Thompson appointed President & Chief Commercial Officer',            'users')
ON CONFLICT (company_name, event_type, event_date) DO NOTHING;

-- ============================================================
-- Constants from frontend constants.js
-- Table: constants (key VARCHAR(40) PK, value JSONB, description TEXT)
-- ============================================================

-- Graph palette
INSERT INTO constants (key, value, description)
VALUES ('GP', '{
  "bg": "#08080B",
  "surface": "#111117",
  "card": "#18181F",
  "border": "#2A2A35",
  "text": "#D4D0C8",
  "muted": "#6B6A72",
  "dim": "#3D3D48",
  "gold": "#C8A55A",
  "green": "#4ECDC4",
  "blue": "#5B8DEF",
  "purple": "#9B72CF",
  "orange": "#E8945A",
  "red": "#E85D5D",
  "cyan": "#5BC0DE",
  "pink": "#D46B9E",
  "lime": "#8BC34A",
  "teal": "#26A69A"
}'::jsonb, 'Graph palette — base color tokens')
ON CONFLICT (key) DO NOTHING;

-- Node type configuration
INSERT INTO constants (key, value, description)
VALUES ('NODE_CFG', '{
  "company":     {"color": "#C8A55A", "label": "Companies",      "icon": "\u2B21"},
  "fund":        {"color": "#9B72CF", "label": "Funds",           "icon": "\u25C8"},
  "sector":      {"color": "#5B8DEF", "label": "Sectors",         "icon": "\u25C9"},
  "region":      {"color": "#E8945A", "label": "Regions",         "icon": "\u229E"},
  "person":      {"color": "#9B72CF", "label": "People",          "icon": "\u25CF"},
  "external":    {"color": "#5BC0DE", "label": "External",        "icon": "\u25B3"},
  "exchange":    {"color": "#D46B9E", "label": "Exchanges",       "icon": "\u25E7"},
  "accelerator": {"color": "#8BC34A", "label": "Accelerators",    "icon": "\u25B2"},
  "ecosystem":   {"color": "#7986CB", "label": "Ecosystem Orgs",  "icon": "\u2295"},
  "program":     {"color": "#26A69A", "label": "Programs",        "icon": "\u25A1"}
}'::jsonb, 'Node type display configuration — color, label, icon per entity type')
ON CONFLICT (key) DO NOTHING;

-- Relationship type configuration
INSERT INTO constants (key, value, description)
VALUES ('REL_CFG', '{
  "eligible_for":      {"color": "#C8A55A", "label": "Eligible For",      "dash": ""},
  "operates_in":       {"color": "#5B8DEF", "label": "Operates In",       "dash": "3,2"},
  "headquartered_in":  {"color": "#E8945A", "label": "HQ In",             "dash": "6,3"},
  "invested_in":       {"color": "#4ECDC4", "label": "Invested In",       "dash": ""},
  "loaned_to":         {"color": "#4ECDC4", "label": "Loaned To",         "dash": "4,2"},
  "partners_with":     {"color": "#5BC0DE", "label": "Partners With",     "dash": ""},
  "contracts_with":    {"color": "#5BC0DE", "label": "Contracts With",     "dash": "4,4"},
  "acquired":          {"color": "#E85D5D", "label": "Acquired",          "dash": ""},
  "founder_of":        {"color": "#9B72CF", "label": "Founded",           "dash": ""},
  "manages":           {"color": "#9B72CF", "label": "Manages",           "dash": "3,2"},
  "listed_on":         {"color": "#D46B9E", "label": "Listed On",         "dash": "2,2"},
  "accelerated_by":    {"color": "#8BC34A", "label": "Accelerated By",    "dash": ""},
  "won_pitch":         {"color": "#8BC34A", "label": "Won Pitch",         "dash": ""},
  "incubated_by":      {"color": "#8BC34A", "label": "Incubated By",      "dash": "3,2"},
  "program_of":        {"color": "#8BC34A", "label": "Program Of",        "dash": "4,3"},
  "supports":          {"color": "#7986CB", "label": "Supports",          "dash": "3,2"},
  "housed_at":         {"color": "#7986CB", "label": "Housed At",         "dash": "4,3"},
  "collaborated_with": {"color": "#5BC0DE", "label": "Collaborated With", "dash": "3,3"},
  "funds":             {"color": "#C8A55A", "label": "Funds",             "dash": ""},
  "approved_by":       {"color": "#26A69A", "label": "Approved By",       "dash": "5,3"},
  "filed_with":        {"color": "#D46B9E", "label": "Filed With",        "dash": "4,4"},
  "competes_with":     {"color": "#FF7043", "label": "Competes With",     "dash": "2,4"},
  "grants_to":         {"color": "#4ECDC4", "label": "Grants To",         "dash": "4,2"},
  "qualifies_for":     {"color": "#22C55E", "label": "Qualifies For",     "dash": "6,4"},
  "fund_opportunity":  {"color": "#16A34A", "label": "Potential Investor", "dash": "6,4"},
  "potential_lp":      {"color": "#818CF8", "label": "Potential LP",       "dash": "6,4"}
}'::jsonb, 'Edge/relationship type display configuration — color, label, dash pattern')
ON CONFLICT (key) DO NOTHING;

-- Edge category configuration
INSERT INTO constants (key, value, description)
VALUES ('EDGE_CATEGORY_CFG', '{
  "historical": {"label": "Historical",    "style": "",    "opacity": 0.4},
  "opportunity": {"label": "Opportunities", "style": "6,4", "opacity": 0.6},
  "projected":  {"label": "Projected",     "style": "2,3", "opacity": 0.3}
}'::jsonb, 'Edge category display configuration — historical, opportunity, projected')
ON CONFLICT (key) DO NOTHING;

-- Graph stage colors
INSERT INTO constants (key, value, description)
VALUES ('GSTAGE_C', '{
  "pre_seed":     "#3D3D48",
  "seed":         "#5B8DEF",
  "series_a":     "#4ECDC4",
  "series_b":     "#E8945A",
  "series_c_plus": "#9B72CF",
  "growth":       "#C8A55A"
}'::jsonb, 'Company stage colors for graph visualization')
ON CONFLICT (key) DO NOTHING;

-- Stage colors (alternate palette)
INSERT INTO constants (key, value, description)
VALUES ('STAGE_COLORS', '{
  "pre_seed":     "#5B6170",
  "seed":         "#5B8DEF",
  "series_a":     "#45D7C6",
  "series_b":     "#F5C76C",
  "series_c_plus": "#9B72CF",
  "growth":       "#F5C76C"
}'::jsonb, 'Company stage colors — alternate palette for UI components')
ON CONFLICT (key) DO NOTHING;

-- Sector heat scores
INSERT INTO constants (key, value, description)
VALUES ('SHEAT', '{
  "AI": 95, "Cybersecurity": 88, "Defense": 85, "Cleantech": 82,
  "Mining": 78, "Aerospace": 80, "Cloud": 80, "Data Center": 80,
  "Energy": 78, "Solar": 75, "Robotics": 78, "Biotech": 72,
  "Fintech": 70, "Gaming": 68, "Blockchain": 50, "Drones": 75,
  "Construction": 65, "Logistics": 65, "Materials Science": 70,
  "Real Estate": 50, "Computing": 70, "Water": 72, "Media": 58,
  "Payments": 68, "IoT": 65, "Manufacturing": 60, "Semiconductors": 82,
  "Hospitality": 60, "Cannabis": 45, "Analytics": 75, "Satellite": 82,
  "Identity": 80, "AdTech": 65, "Education": 62, "Healthcare": 70,
  "Consumer": 55, "Fitness": 60, "Mobile": 58, "Banking": 55,
  "Retail": 52, "HR Tech": 60, "Enterprise": 65
}'::jsonb, 'Sector heat scores (0-100) — used for sector ranking and visualization')
ON CONFLICT (key) DO NOTHING;

-- Funding benchmarks by stage
INSERT INTO constants (key, value, description)
VALUES ('STAGE_NORMS', '{
  "pre_seed":     0.5,
  "seed":         3,
  "series_a":     15,
  "series_b":     50,
  "series_c_plus": 200,
  "growth":       500
}'::jsonb, 'Funding benchmarks by stage ($M) — used for IRS scoring normalization')
ON CONFLICT (key) DO NOTHING;

-- Trigger configuration
INSERT INTO constants (key, value, description)
VALUES ('TRIGGER_CFG', '{
  "rapid_funding":   {"icon": "fire",     "label": "Rapid Funding",  "color": "#EF4444"},
  "grant_validated":  {"icon": "building", "label": "Grant Validated", "color": "#3B82F6"},
  "hiring_surge":    {"icon": "trending", "label": "Hiring Surge",    "color": "#F59E0B"},
  "hot_sector":      {"icon": "flame",    "label": "Hot Sector",      "color": "#F97316"},
  "ssbci_eligible":  {"icon": "bank",     "label": "SSBCI Match",     "color": "#8B5CF6"},
  "high_momentum":   {"icon": "zap",      "label": "High Momentum",   "color": "#22C55E"}
}'::jsonb, 'Opportunity trigger display configuration — icon, label, color per trigger type')
ON CONFLICT (key) DO NOTHING;

-- Grade colors
INSERT INTO constants (key, value, description)
VALUES ('GRADE_COLORS', '{
  "A":  "#4ADE80",
  "A-": "#86EFAC",
  "B+": "#FACC15",
  "B":  "#FDE047",
  "B-": "#FEF08A",
  "C+": "#FB923C",
  "C":  "#FDBA74",
  "D":  "#F87171"
}'::jsonb, 'IRS grade color mapping — letter grade to hex color')
ON CONFLICT (key) DO NOTHING;

-- Community detection palette
INSERT INTO constants (key, value, description)
VALUES ('COMM_COLORS', '[
  "#C8A55A", "#4ECDC4", "#5B8DEF", "#9B72CF", "#E8945A", "#E85D5D",
  "#5BC0DE", "#D46B9E", "#8BC34A", "#26A69A",
  "#E57373", "#64B5F6", "#FFD54F", "#AED581", "#BA68C8", "#4DD0E1"
]'::jsonb, 'Community detection color palette — 16 distinct colors for graph communities')
ON CONFLICT (key) DO NOTHING;

COMMIT;
