"""Agent execution with retry logic."""

import traceback

from ..agents.company_analyst import CompanyAnalyst
from ..agents.weekly_brief import WeeklyBrief
from ..agents.risk_assessor import RiskAssessor
from ..agents.pattern_detector import PatternDetector
from ..ingestion.freshness import FreshnessChecker

AGENT_REGISTRY = {
    "company_analyst": CompanyAnalyst,
    "weekly_brief": WeeklyBrief,
    "risk_assessor": RiskAssessor,
    "pattern_detector": PatternDetector,
    "freshness_checker": FreshnessChecker,
}

MAX_RETRIES = 2


async def run_agent(agent_name: str, retries: int = MAX_RETRIES, **kwargs):
    """Run an agent with retry logic."""
    if agent_name not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent: {agent_name}")

    agent_cls = AGENT_REGISTRY[agent_name]
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            agent = agent_cls()
            result = await agent.execute(**kwargs)
            print(f"[{agent_name}] completed: {result}")
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
