"""Agent execution with retry logic and per-agent timeouts."""

import asyncio
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
from ..agents.graph_feature_agent import GraphFeatureAgent

AGENT_REGISTRY = {
    "company_analyst": CompanyAnalyst,
    "weekly_brief": WeeklyBrief,
    "risk_assessor": RiskAssessor,
    "pattern_detector": PatternDetector,
    "panel_forecaster": PanelForecaster,
    "survival_analyzer": SurvivalAnalyzer,
    "graph_feature_engineer": GraphFeatureAgent,
    "scenario_simulator": ScenarioSimulator,
    "causal_evaluator": CausalEvaluator,
    "freshness_checker": FreshnessChecker,
    "fred_ingestor": FredIngestor,
    "bls_ingestor": BLSIngestor,
}

MAX_RETRIES = 2

# Per-agent execution timeouts in seconds
AGENT_TIMEOUTS = {
    # LLM agents — may take longer due to API calls
    "company_analyst": 600,      # 10 min (batch of companies)
    "weekly_brief": 120,         # 2 min
    "risk_assessor": 120,        # 2 min
    "pattern_detector": 120,     # 2 min
    # Statistical agents
    "panel_forecaster": 300,     # 5 min
    "survival_analyzer": 300,    # 5 min
    "causal_evaluator": 300,     # 5 min
    "scenario_simulator": 300,   # 5 min
    "graph_feature_engineer": 300,  # 5 min
    # Ingestion agents
    "freshness_checker": 60,     # 1 min
    "fred_ingestor": 180,        # 3 min
    "bls_ingestor": 180,         # 3 min
}
DEFAULT_TIMEOUT = 300  # 5 min fallback

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
    timeout = AGENT_TIMEOUTS.get(agent_name, DEFAULT_TIMEOUT)
    last_error = None

    try:
        for attempt in range(1, retries + 1):
            try:
                agent = agent_cls()
                result = await asyncio.wait_for(
                    agent.execute(**kwargs), timeout=timeout
                )
                print(f"[{agent_name}] completed: {result}")

                # Auto-refresh materialized views after successful ingestion
                if agent_name in _INGESTOR_AGENTS:
                    await _refresh_indicator_views()

                return result
            except asyncio.TimeoutError:
                last_error = asyncio.TimeoutError(
                    f"Agent '{agent_name}' timed out after {timeout}s"
                )
                logger.error(
                    "Agent '%s' timed out after %ds (attempt %d/%d)",
                    agent_name, timeout, attempt, retries,
                )
                print(
                    f"[{agent_name}] attempt {attempt}/{retries} "
                    f"timed out after {timeout}s"
                )
                if attempt < retries:
                    backoff = 2 ** attempt
                    print(
                        f"[{agent_name}] retrying in {backoff}s..."
                    )
                    await asyncio.sleep(backoff)
                else:
                    print(f"[{agent_name}] all retries exhausted")
            except Exception as e:
                last_error = e
                print(f"[{agent_name}] attempt {attempt}/{retries} failed: {e}")
                if attempt < retries:
                    backoff = 2 ** attempt
                    print(f"[{agent_name}] retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
                else:
                    print(f"[{agent_name}] all retries exhausted")
                    traceback.print_exc()

        raise last_error
    finally:
        await close_pool()
