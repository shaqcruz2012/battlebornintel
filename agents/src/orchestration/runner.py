"""Agent execution with retry logic."""

import logging
import traceback

from ..db import close_pool
from ..agents.company_analyst import CompanyAnalyst
from ..agents.weekly_brief import WeeklyBrief
from ..agents.risk_assessor import RiskAssessor
from ..agents.pattern_detector import PatternDetector
from ..agents.panel_forecaster import PanelForecaster
from ..agents.survival_analyzer import SurvivalAnalyzer
from ..ingestion.freshness import FreshnessChecker
from ..ingestion.fred_ingestor import FredIngestor
from ..agents.scenario_simulator import ScenarioSimulator
from ..agents.causal_evaluator import CausalEvaluator
from ..ingestion.bls_ingestor import BLSIngestor

AGENT_REGISTRY = {
    "company_analyst": CompanyAnalyst,
    "weekly_brief": WeeklyBrief,
    "risk_assessor": RiskAssessor,
    "pattern_detector": PatternDetector,
    "panel_forecaster": PanelForecaster,
    "survival_analyzer": SurvivalAnalyzer,
    "scenario_simulator": ScenarioSimulator,
    "causal_evaluator": CausalEvaluator,
    "freshness_checker": FreshnessChecker,
    "fred_ingestor": FredIngestor,
    "bls_ingestor": BLSIngestor,
}

MAX_RETRIES = 2

# Agents that write to metric_snapshots and require a materialized view refresh
_INGESTOR_AGENTS = {"fred_ingestor", "bls_ingestor"}

logger = logging.getLogger(__name__)


async def _refresh_indicator_views():
    """Refresh economic_indicators materialized views after ingestion."""
    from ..db import get_pool

    try:
        pool = await get_pool()
        await pool.execute("SELECT refresh_economic_indicators()")
        logger.info("Refreshed economic_indicators materialized views")
    except Exception as e:
        logger.warning("Failed to refresh indicator views: %s", e)


async def run_agent(agent_name: str, retries: int = MAX_RETRIES, **kwargs):
    """Run an agent with retry logic."""
    if agent_name not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent: {agent_name}")

    agent_cls = AGENT_REGISTRY[agent_name]
    last_error = None

    try:
        for attempt in range(1, retries + 1):
            try:
                agent = agent_cls()
                result = await agent.execute(**kwargs)
                print(f"[{agent_name}] completed: {result}")

                # Auto-refresh materialized views after successful ingestion
                if agent_name in _INGESTOR_AGENTS:
                    await _refresh_indicator_views()

                return result
            except Exception as e:
                last_error = e
                print(f"[{agent_name}] attempt {attempt}/{retries} failed: {e}")
                if attempt < retries:
                    print(f"[{agent_name}] retrying...")
                else:
                    print(f"[{agent_name}] all retries exhausted")
                    traceback.print_exc()

        raise last_error
    finally:
        await close_pool()
