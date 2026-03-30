"""CLI for running BBI agents manually.

Usage:
  python -m src.cli run company_analyst --id 4
  python -m src.cli run weekly_brief
  python -m src.cli run risk_assessor
  python -m src.cli run pattern_detector
  python -m src.cli run freshness_checker
  python -m src.cli run data_scout
  python -m src.cli run fact_verifier --limit 20
  python -m src.cli run relationship_mapper --id 4
  python -m src.cli run systematic_enricher --limit 25
  python -m src.cli campaign full     # Run full research campaign
  python -m src.cli campaign refresh  # Freshness + verify only
  python -m src.cli continuous 24     # Run 24/7 research cycle for 24 hours
  python -m src.cli continuous 4      # Run for 4 hours
  python -m src.cli schedule          # Start the scheduler
  python -m src.cli audit             # Show recent agent runs
  python -m src.cli rotation          # Show entity rotation stats
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
    if "--limit" in sys.argv:
        lim_idx = sys.argv.index("--limit") + 1
        if lim_idx < len(sys.argv):
            kwargs["limit"] = int(sys.argv[lim_idx])

    print(f"Running {agent_name}...")
    try:
        result = await run_agent(agent_name, **kwargs)
        print(f"Result: {str(result)[:1000].encode('ascii', 'replace').decode()}")
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


async def cmd_rotation():
    from .orchestration.rotation import get_rotation_stats, get_next_batch

    stats = await get_rotation_stats()
    print("\nRotation Stats:")
    print(f"  Total entities:     {stats['total']}")
    print(f"  Ever queried:       {stats['ever_queried']}")
    print(f"  Queried this week:  {stats['queried_this_week']}")
    print(f"  Queried today:      {stats['queried_today']}")
    if stats["oldest_query"]:
        print(f"  Oldest query:       {stats['oldest_query']}")
    if stats["newest_query"]:
        print(f"  Newest query:       {stats['newest_query']}")

    next_batch = await get_next_batch(5)
    if next_batch:
        print(f"\nNext 5 to query:")
        for e in next_batch:
            last = e["last_queried_at"] or "never"
            conf = e["confidence"] if e["confidence"] is not None else "unset"
            print(f"  {e['canonical_id']} ({e['entity_type']}) conf={conf} last={last}")
    else:
        print("\nNo entities found in entity_registry.")

    await close_pool()


async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "run" and len(sys.argv) >= 3:
        await cmd_run()
    elif cmd == "campaign":
        mode = sys.argv[2] if len(sys.argv) >= 3 else "full"
        from .orchestration.director import run_campaign as _run_campaign
        try:
            result = await _run_campaign(mode)
            print(f"Campaign result: {result}")
        finally:
            await close_pool()
    elif cmd == "continuous":
        hours = int(sys.argv[2]) if len(sys.argv) >= 3 else 24
        from .orchestration.continuous import run_continuous
        try:
            await run_continuous(max_hours=hours)
        finally:
            await close_pool()
    elif cmd == "schedule":
        await cmd_schedule()
    elif cmd == "rotation":
        await cmd_rotation()
    elif cmd == "audit":
        await cmd_audit()
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
