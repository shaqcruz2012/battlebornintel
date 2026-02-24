export const fmt = m => m >= 1000 ? `$${(m/1000).toFixed(1)}B` : m >= 1 ? `$${m.toFixed(1)}M` : m > 0 ? `$${(m*1000).toFixed(0)}K` : "—";
export const stageLabel = s => ({ pre_seed:"Pre-Seed", seed:"Seed", series_a:"Series A", series_b:"Series B", series_c_plus:"Series C+", growth:"Growth" }[s] || s);
