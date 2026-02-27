// Default stage system (GOED startup stages — backward compat)
const DEFAULT_STAGE_COLORS = { pre_seed: "#706C64", seed: "#5088A8", series_a: "#4E9B60", series_b: "#D4864A", series_c_plus: "#8868A8", growth: "#C49A38" };
const DEFAULT_STAGE_LABELS = { pre_seed:"Pre-Seed", seed:"Seed", series_a:"Series A", series_b:"Series B", series_c_plus:"Series C+", growth:"Growth" };

export const STAGE_COLORS = DEFAULT_STAGE_COLORS;
export const fmt = m => m >= 1000 ? `$${(m/1000).toFixed(1)}B` : m >= 1 ? `$${m.toFixed(1)}M` : m > 0 ? `$${(m*1000).toFixed(0)}K` : "\u2014";
export const stageLabel = s => (DEFAULT_STAGE_LABELS[s] || s);

// Config-aware versions — views call these when they have access to config
export const getStageColors = (config) => config?.stages?.colors || DEFAULT_STAGE_COLORS;
export const getStageLabel = (config) => (s) => (config?.stages?.labels || DEFAULT_STAGE_LABELS)[s] || s;
export const getStageList = (config) => config?.stages?.list || Object.keys(DEFAULT_STAGE_COLORS);
