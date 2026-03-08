export const fmt = (m) =>
  m >= 1000
    ? `$${(m / 1000).toFixed(1)}B`
    : m >= 1
      ? `$${m.toFixed(1)}M`
      : m > 0
        ? `$${(m * 1000).toFixed(0)}K`
        : "\u2014";

export const stageLabel = (s) =>
  ({
    pre_seed: "Pre-Seed",
    seed: "Seed",
    series_a: "Series A",
    series_b: "Series B",
    series_c_plus: "Series C+",
    growth: "Growth",
  })[s] || s;

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatNumber = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

export const formatPercent = (n, decimals = 1) =>
  `${n.toFixed(decimals)}%`;
