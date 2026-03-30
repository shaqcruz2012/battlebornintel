"""Shared constants for BBI agent codebase.

Centralises values that were previously duplicated across multiple agents
(survival_analyzer, causal_evaluator, panel_forecaster, scenario_simulator,
pattern_detector, runner) so there is a single source of truth.
"""

# ---------------------------------------------------------------------------
# Company stage ordering (survival_analyzer, causal_evaluator)
# ---------------------------------------------------------------------------

STAGE_ORDER = {
    "pre-seed": 1,
    "pre_seed": 1,
    "seed": 2,
    "series_a": 3,
    "series_b": 4,
    "series_c_plus": 5,
    "growth": 6,
    "public": 7,
}

# ---------------------------------------------------------------------------
# Metric unit lookup (panel_forecaster, scenario_simulator)
# ---------------------------------------------------------------------------

_UNITS = {
    "funding_m": "usd_millions",
    "employees": "count",
    "momentum": "score_0_100",
    "revenue_m": "usd_millions",
    "valuation_m": "usd_millions",
    "burn_rate_m": "usd_millions",
    "growth_rate_pct": "percent",
    "patent_count": "count",
    "irs_score": "score_0_100",
}


def unit_for_metric(metric_name: str) -> str:
    """Return the standard unit string for a known metric name."""
    return _UNITS.get(metric_name, "unknown")


# ---------------------------------------------------------------------------
# Analysis thresholds (pattern_detector, causal_evaluator)
# ---------------------------------------------------------------------------

# Minimum sample sizes for statistical agents
MIN_TREATMENT_SAMPLES = 5
MIN_CONTROL_SAMPLES = 5
BOOTSTRAP_ITERATIONS = 1000
CALIPER_MULTIPLIER = 0.25

# Default model
DEFAULT_LLM_MODEL = "claude-sonnet-4-20250514"
DEFAULT_MAX_TOKENS = 4096

# ---------------------------------------------------------------------------
# T-GNN enrichment metric names
# ---------------------------------------------------------------------------

# Available enrichment metrics in metric_snapshots
TECH_IP_METRICS = [
    "patent_count",
    "patent_granted",
    "patent_pending",
    "ip_moat_score",
    "federal_rd_funding",
    "tech_domain_code",
]
FINANCIAL_METRICS = [
    "revenue_m",
    "valuation_m",
    "burn_rate_m",
    "growth_rate_pct",
]
MARKET_METRICS = [
    "tam_b",
    "competitor_count",
    "market_position",
    "customer_count",
]
TEAM_METRICS = [
    "founder_experience_years",
    "prior_exit_count",
]
STRUCTURAL_METRICS = [
    "accelerator_connectivity_gap",
    "rural_isolation_flag",
    "structural_hole_severity",
]
CAPITAL_FLOW_METRICS = [
    "ssbci_leverage_ratio",
    "capital_magnet_score",
    "co_investment_attracted",
]
POLICY_METRICS = [
    "policy_opportunity_score",
    "priority_rank",
    "impact_score",
    "feasibility_score",
]
INTERSTATE_METRICS = [
    "vc_deployed_annual_m",
    "accelerator_program_count",
    "university_spinout_rate",
    "tech_workforce_pct",
]
