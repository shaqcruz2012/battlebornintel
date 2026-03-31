"""CLI entry point: run a single agent by name.

Usage:
  python -m agents.run_agent fred_ingestor
  python -m agents.run_agent freshness_checker
  python -m agents.run_agent recompute_scores
"""

import asyncio
import logging
import sys
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

async def main():
    if len(sys.argv) < 2:
        print("Usage: python -m agents.run_agent <agent_name>")
        print("Available: fred_ingestor, bls_ingestor, freshness_checker, recompute_scores, recompute_graph, recompute_all")
        sys.exit(1)

    agent_name = sys.argv[1]

    # Special case: recompute via admin API
    if agent_name in ("recompute_scores", "recompute_graph", "recompute_all"):
        import httpx
        api_url = os.getenv("API_BASE_URL", "http://localhost:3001")
        admin_key = os.getenv("ADMIN_API_KEY", "")
        endpoint = f"{api_url}/api/admin/{agent_name.replace('_', '-')}"
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(endpoint, headers={"X-Admin-Key": admin_key})
            print(resp.json())
        return

    from agents.src.orchestration.runner import run_agent
    result = await run_agent(agent_name)
    print(f"Agent '{agent_name}' completed: {result}")

if __name__ == "__main__":
    asyncio.run(main())
