"""CLI for running BBI agents manually.

Usage:
  python -m src.cli run company_analyst --id 4
  python -m src.cli run weekly_brief
  python -m src.cli run risk_assessor
  python -m src.cli run freshness_checker
"""

import asyncio
import sys

from .db import close_pool
from .agents.company_analyst import CompanyAnalyst
from .agents.weekly_brief import WeeklyBrief
from .agents.risk_assessor import RiskAssessor
from .ingestion.freshness import FreshnessChecker

AGENTS = {
    "company_analyst": CompanyAnalyst,
    "weekly_brief": WeeklyBrief,
    "risk_assessor": RiskAssessor,
    "freshness_checker": FreshnessChecker,
}


async def main():
    if len(sys.argv) < 3 or sys.argv[1] != "run":
        print("Usage: python -m src.cli run <agent_name> [--id <company_id>]")
        print(f"Available agents: {', '.join(AGENTS.keys())}")
        sys.exit(1)

    agent_name = sys.argv[2]
    if agent_name not in AGENTS:
        print(f"Unknown agent: {agent_name}")
        print(f"Available: {', '.join(AGENTS.keys())}")
        sys.exit(1)

    kwargs = {}
    if "--id" in sys.argv:
        id_idx = sys.argv.index("--id") + 1
        if id_idx < len(sys.argv):
            kwargs["company_id"] = int(sys.argv[id_idx])

    agent = AGENTS[agent_name]()
    print(f"Running {agent_name}...")

    try:
        result = await agent.execute(**kwargs)
        print(f"Result: {result}")
    finally:
        await close_pool()


if __name__ == "__main__":
    asyncio.run(main())
