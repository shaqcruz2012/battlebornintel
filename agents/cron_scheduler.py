"""Lightweight cron scheduler for BBI agents.

Runs as a long-lived process — deploy as a separate Railway service.
Uses APScheduler for cron-based scheduling with Pacific timezone.

Schedule tiers:
  - Every 30 min: freshness_checker, recompute scores + graph metrics
  - Daily 1 AM: risk_assessor
  - Monday 2 AM: fred_ingestor, weekly_brief
  - 1st of month: bls_ingestor, scenario_simulator
"""

import asyncio
import logging
import os
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("cron_scheduler")


async def run_recompute():
    """Hit the admin API to recompute scores + graph metrics."""
    import httpx
    api_url = os.getenv("API_BASE_URL", "http://localhost:3001")
    admin_key = os.getenv("ADMIN_API_KEY", "")
    if not admin_key:
        logger.warning("ADMIN_API_KEY not set — skipping recompute")
        return
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{api_url}/api/admin/recompute-all",
                headers={"X-Admin-Key": admin_key},
            )
            logger.info("Recompute result: %s", resp.json())
    except Exception as e:
        logger.error("Recompute failed: %s", e)


async def run_agent_safe(agent_name, **kwargs):
    """Run an agent with error handling."""
    try:
        from agents.src.orchestration.runner import run_agent
        result = await run_agent(agent_name, **kwargs)
        logger.info("[%s] completed: %s", agent_name, result)
    except Exception as e:
        logger.error("[%s] failed: %s", agent_name, e)


async def main():
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger

    tz = "America/Los_Angeles"
    scheduler = AsyncIOScheduler(timezone=tz)

    # ── Every 30 minutes ──────────────────────────────────────────────────
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("*/30 * * * *", timezone=tz),
        args=["freshness_checker"], id="freshness_30m", name="Freshness check (30m)",
    )
    scheduler.add_job(
        run_recompute, CronTrigger.from_crontab("15,45 * * * *", timezone=tz),
        id="recompute_30m", name="Recompute scores + graph (30m)",
    )

    # ── Daily ─────────────────────────────────────────────────────────────
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 3 * * *", timezone=tz),
        args=["risk_assessor"], id="risk_daily", name="Risk assessment (daily 3 AM)",
    )

    # ── Weekly (Monday) ───────────────────────────────────────────────────
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 2 * * 1", timezone=tz),
        args=["fred_ingestor"], id="fred_weekly", name="FRED ingestion (Mon 2 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 6 * * 1", timezone=tz),
        args=["weekly_brief"], id="brief_weekly", name="Weekly brief (Mon 6 AM)",
    )

    # ── Weekly (Sunday) ───────────────────────────────────────────────────
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 2 * * 0", timezone=tz),
        args=["company_analyst"], id="analyst_weekly", name="Company analysis (Sun 2 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 4 * * 0", timezone=tz),
        args=["pattern_detector"], id="patterns_weekly", name="Pattern detection (Sun 4 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 5 * * 0", timezone=tz),
        args=["panel_forecaster"], id="forecast_weekly", name="Panel forecasts (Sun 5 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 6 * * 0", timezone=tz),
        args=["survival_analyzer"], id="survival_weekly", name="Survival analysis (Sun 6 AM)",
    )

    # ── Monthly (1st) ─────────────────────────────────────────────────────
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 3 1 * *", timezone=tz),
        args=["bls_ingestor"], id="bls_monthly", name="BLS QCEW (1st 3 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 7 1 * *", timezone=tz),
        args=["causal_evaluator"], id="causal_monthly", name="Causal inference (1st 7 AM)",
    )
    scheduler.add_job(
        run_agent_safe, CronTrigger.from_crontab("0 8 1 * *", timezone=tz),
        args=["scenario_simulator"], id="scenarios_monthly", name="Scenario simulation (1st 8 AM)",
    )

    scheduler.start()
    logger.info("BBI Cron Scheduler started — %d jobs", len(scheduler.get_jobs()))
    for job in scheduler.get_jobs():
        logger.info("  %s: %s", job.id, job.name)

    # Keep alive
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Scheduler stopped")


if __name__ == "__main__":
    asyncio.run(main())
