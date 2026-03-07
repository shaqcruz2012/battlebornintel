"""CLI for running BBI agents manually.

Usage:
  python -m src.cli run company_analyst --id 4
  python -m src.cli run weekly_brief
  python -m src.cli run risk_assessor
  python -m src.cli run pattern_detector
  python -m src.cli run freshness_checker
  python -m src.cli schedule          # Start the scheduler
  python -m src.cli audit             # Show recent agent runs
"""

import asyncio
import sys

from .db import close_pool
from .orchestration.runner import AGENT_REGISTRY, run_agent


async def cmd_run():
    agent_name = sys.argv[2]
    if agent_name not in AGENT_REGISTRY:
        print(f"Unknown agent: {agent_name}")
        print(f"Available: {', '.join(AGENT_REGISTRY.keys())}")
        sys.exit(1)

    kwargs = {}
    if "--id" in sys.argv:
        id_idx = sys.argv.index("--id") + 1
        if id_idx < len(sys.argv):
            kwargs["company_id"] = int(sys.argv[id_idx])

    print(f"Running {agent_name}...")
    try:
        result = await run_agent(agent_name, **kwargs)
        print(f"Result: {result}")
    finally:
        await close_pool()


async def cmd_schedule():
    from .orchestration.scheduler import start_scheduler
    try:
        await start_scheduler()
    finally:
        await close_pool()


async def cmd_audit():
    from .orchestration.audit import get_recent_runs, get_run_stats

    stats = await get_run_stats()
    if stats:
        print("\nAgent Stats:")
        print(f"{'Agent':<25} {'Total':>6} {'OK':>4} {'Fail':>5} {'Last Run'}")
        print("-" * 75)
        for s in stats:
            print(
                f"{s['agent_name']:<25} {s['total_runs']:>6} "
                f"{s['completed']:>4} {s['failed']:>5} {s['last_run']}"
            )

    runs = await get_recent_runs(10)
    if runs:
        print("\nRecent Runs:")
        for r in runs:
            status = "OK" if r["status"] == "completed" else r["status"].upper()
            msg = r["output_summary"] or r["error_message"] or ""
            print(f"  [{status:>7}] {r['agent_name']:<25} {r['started_at']} {msg[:60]}")
    else:
        print("\nNo agent runs found.")

    await close_pool()


async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "run" and len(sys.argv) >= 3:
        await cmd_run()
    elif cmd == "schedule":
        await cmd_schedule()
    elif cmd == "audit":
        await cmd_audit()
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
