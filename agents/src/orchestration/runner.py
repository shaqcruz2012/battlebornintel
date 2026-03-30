"""Agent execution with retry logic and per-agent timeouts."""

import asyncio
import json
import logging
import time
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
from ..ingestion.census_ingestor import CensusIngestor
from ..ingestion.sec_ingestor import SecIngestor
from ..ingestion.uspto_ingestor import UsptoIngestor
from ..ingestion.nsf_ingestor import NsfIngestor
from ..ingestion.nvsos_ingestor import NvsosIngestor
from ..agents.graph_feature_agent import GraphFeatureAgent
from ..agents.feature_discovery_agent import FeatureDiscoveryAgent
from ..agents.node_discovery_agent import NodeDiscoveryAgent

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
    "census_ingestor": CensusIngestor,
    "sec_ingestor": SecIngestor,
    "uspto_ingestor": UsptoIngestor,
    "nsf_ingestor": NsfIngestor,
    "nvsos_ingestor": NvsosIngestor,
    "feature_discovery": FeatureDiscoveryAgent,
    "node_discovery": NodeDiscoveryAgent,
}

MAX_RETRIES = 2

# Per-agent execution timeouts in seconds
AGENT_TIMEOUTS = {
    # LLM agents — may take longer due to API calls
    "company_analyst": 600,      # 10 min (batch of companies)
    "weekly_brief": 120,         # 2 min
    "risk_assessor": 120,        # 2 min
    "pattern_detector": 120,     # 2 min
    "node_discovery": 300,       # 5 min (LLM + graph queries)
    # Statistical agents
    "panel_forecaster": 300,     # 5 min
    "survival_analyzer": 300,    # 5 min
    "causal_evaluator": 300,     # 5 min
    "scenario_simulator": 300,   # 5 min
    "graph_feature_engineer": 300,  # 5 min
    "feature_discovery": 300,        # 5 min
    # Ingestion agents
    "freshness_checker": 60,     # 1 min
    "fred_ingestor": 180,        # 3 min
    "bls_ingestor": 180,         # 3 min
    "census_ingestor": 300,      # 5 min
    "sec_ingestor": 300,         # 5 min
    "uspto_ingestor": 300,       # 5 min
    "nsf_ingestor": 300,         # 5 min
    "nvsos_ingestor": 300,       # 5 min
}
DEFAULT_TIMEOUT = 300  # 5 min fallback

# Agents that write to metric_snapshots and require a materialized view refresh
_INGESTOR_AGENTS = {"fred_ingestor", "bls_ingestor", "census_ingestor", "sec_ingestor", "uspto_ingestor", "nsf_ingestor", "nvsos_ingestor"}

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


async def _store_duration(run_id, duration_ms):
    """Store execution duration on the agent_runs record."""
    from ..db import get_pool

    try:
        pool = await get_pool()
        await pool.execute(
            "UPDATE agent_runs SET duration_ms = $2 WHERE id = $1",
            run_id,
            duration_ms,
        )
    except Exception as e:
        logger.warning("Failed to store duration_ms for run %s: %s", run_id, e)


async def _record_dead_letter(pool, agent_name, run_id, error, kwargs, attempts):
    """Record permanently failed agent run in dead letter queue."""
    try:
        await pool.execute(
            """INSERT INTO agent_dead_letters
               (agent_type, agent_run_id, error_message, error_class,
                input_params, attempts, first_failed_at, last_failed_at)
               VALUES ($1, $2, $3, $4, $5::jsonb, $6, NOW(), NOW())""",
            agent_name, run_id, str(error), type(error).__name__,
            json.dumps(kwargs) if kwargs else None, attempts
        )
    except Exception as e:
        logger.warning("Failed to record dead letter: %s", e)


async def run_agent(agent_name: str, retries: int = MAX_RETRIES, **kwargs):
    """Run an agent with retry logic."""
    if agent_name not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent: {agent_name}")

    agent_cls = AGENT_REGISTRY[agent_name]
    timeout = AGENT_TIMEOUTS.get(agent_name, DEFAULT_TIMEOUT)
    last_error = None

    try:
        for attempt in range(1, retries + 1):
            start_time = time.perf_counter()
            try:
                agent = agent_cls()
                result = await asyncio.wait_for(
                    agent.execute(**kwargs), timeout=timeout
                )
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                await _store_duration(agent.run_id, duration_ms)
                print(f"[{agent_name}] completed in {duration_ms}ms: {result}")

                # Auto-refresh materialized views after successful ingestion
                if agent_name in _INGESTOR_AGENTS:
                    await _refresh_indicator_views()

                return result
            except asyncio.TimeoutError:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                if hasattr(agent, 'run_id') and agent.run_id:
                    await _store_duration(agent.run_id, duration_ms)
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
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                if hasattr(agent, 'run_id') and agent.run_id:
                    await _store_duration(agent.run_id, duration_ms)
                last_error = e
                print(f"[{agent_name}] attempt {attempt}/{retries} failed: {e}")
                if attempt < retries:
                    backoff = 2 ** attempt
                    print(f"[{agent_name}] retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
                else:
                    print(f"[{agent_name}] all retries exhausted")
                    traceback.print_exc()

        # Record permanently failed run in dead letter queue
        from ..db import get_pool
        try:
            pool = await get_pool()
            run_id = kwargs.get("run_id")
            await _record_dead_letter(
                pool, agent_name, run_id, last_error, kwargs, retries
            )
        except Exception as dl_err:
            logger.warning("Dead letter recording failed: %s", dl_err)

        raise last_error
    finally:
        await close_pool()
