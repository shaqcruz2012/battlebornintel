"""Continuous 24/7 agent runner for research and enrichment."""

import asyncio
import json
from datetime import datetime, timezone

from .runner import run_agent
from .rotation import get_next_batch, get_rotation_stats
from ..db import get_pool


# Cycle through these tasks in order, then repeat
RESEARCH_CYCLE = [
    {"agent": "freshness_checker", "kwargs": {}, "desc": "Check data freshness", "cooldown_min": 15},
    {"agent": "systematic_enricher", "kwargs": {"mode": "nodes", "limit": 20}, "desc": "Enrich 20 node gaps", "cooldown_min": 15},
    {"agent": "systematic_enricher", "kwargs": {"mode": "edges", "limit": 20}, "desc": "Enrich 20 edge gaps", "cooldown_min": 15},
    {"agent": "fact_verifier", "kwargs": {"limit": 25}, "desc": "Verify 25 entities", "cooldown_min": 15},
    {"agent": "data_scout", "kwargs": {}, "desc": "Scout external sources", "cooldown_min": 30},
    {"agent": "relationship_mapper", "kwargs": {"limit": 10}, "desc": "Map 10 company relationships", "cooldown_min": 15},
    {"agent": "risk_assessor", "kwargs": {}, "desc": "Assess portfolio risks", "cooldown_min": 60},
    {"agent": "pattern_detector", "kwargs": {}, "desc": "Detect graph patterns", "cooldown_min": 60},
]


async def run_continuous(max_hours=24):
    """Run research agents continuously in a cycle."""
    start = datetime.now(timezone.utc)
    max_seconds = max_hours * 3600
    cycle_count = 0
    task_count = 0
    errors = 0

    print(f"[continuous] Starting 24/7 research runner at {start.isoformat()}")
    print(f"[continuous] Max runtime: {max_hours} hours")
    print(f"[continuous] Cycle: {len(RESEARCH_CYCLE)} tasks per cycle")

    pool = await get_pool()

    while (datetime.now(timezone.utc) - start).total_seconds() < max_seconds:
        cycle_count += 1
        print(f"\n[continuous] === Cycle {cycle_count} ===")

        # Print rotation stats at start of each cycle
        try:
            stats = await get_rotation_stats()
            print(f"[continuous] Rotation: {stats.get('queried_today', 0)} queried today, "
                  f"{stats.get('queried_this_week', 0)}/703 this week")
        except Exception as e:
            print(f"[continuous] Stats error: {e}")

        for task in RESEARCH_CYCLE:
            # Check if we've exceeded max runtime
            elapsed = (datetime.now(timezone.utc) - start).total_seconds()
            if elapsed >= max_seconds:
                break

            task_count += 1
            agent_name = task["agent"]
            desc = task["desc"]
            cooldown = task["cooldown_min"]

            print(f"\n[continuous] Task {task_count}: {desc} ({agent_name})")

            try:
                result = await run_agent(agent_name, **task["kwargs"])
                print(f"[continuous] Completed: {str(result)[:200]}")
            except Exception as e:
                errors += 1
                print(f"[continuous] Error: {e}")

            # Cooldown between tasks
            print(f"[continuous] Cooling down {cooldown}min...")
            await asyncio.sleep(cooldown * 60)

    # Final summary
    elapsed_hours = (datetime.now(timezone.utc) - start).total_seconds() / 3600
    print(f"\n[continuous] === Session Complete ===")
    print(f"[continuous] Runtime: {elapsed_hours:.1f} hours")
    print(f"[continuous] Cycles: {cycle_count}")
    print(f"[continuous] Tasks run: {task_count}")
    print(f"[continuous] Errors: {errors}")

    # Save session summary
    try:
        await pool.execute(
            """INSERT INTO analysis_results (analysis_type, content)
               VALUES ('continuous_session', $1)""",
            json.dumps({
                "started_at": start.isoformat(),
                "runtime_hours": round(elapsed_hours, 1),
                "cycles": cycle_count,
                "tasks_run": task_count,
                "errors": errors,
            })
        )
    except Exception:
        pass
