"""APScheduler-based scheduling for BBI agents."""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .runner import run_agent
from .director import run_campaign


# Default schedules
SCHEDULES = [
    # ── Analysis agents (existing) ──
    {"agent": "company_analyst", "cron": "0 2 * * 0", "desc": "Sunday 2 AM - full company analysis"},
    {"agent": "weekly_brief", "cron": "0 6 * * 1", "desc": "Monday 6 AM - weekly brief"},
    {"agent": "risk_assessor", "cron": "0 3 * * *", "desc": "Daily 3 AM - risk assessment"},
    {"agent": "pattern_detector", "cron": "0 4 * * 0", "desc": "Sunday 4 AM - pattern detection"},
    {"agent": "freshness_checker", "cron": "0 1 * * *", "desc": "Daily 1 AM - freshness check"},
    # ── Research agents (new) ──
    {"agent": "data_scout", "cron": "0 1 * * 3,6", "desc": "Wed+Sat 1 AM - external data collection"},
    {"agent": "fact_verifier", "cron": "0 5 * * *", "desc": "Daily 5 AM - entity verification"},
    {"agent": "relationship_mapper", "cron": "0 5 * * 0", "desc": "Sunday 5 AM - graph enrichment"},
    {"agent": "systematic_enricher", "cron": "30 3 * * *", "desc": "Daily 3:30 AM - systematic data enrichment"},
]


def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the agent scheduler."""
    scheduler = AsyncIOScheduler()

    for sched in SCHEDULES:
        scheduler.add_job(
            run_agent,
            CronTrigger.from_crontab(sched["cron"]),
            args=[sched["agent"]],
            id=f"bbi_{sched['agent']}",
            name=sched["desc"],
            replace_existing=True,
        )

    # Weekly research campaign (Monday 1 AM — runs before weekly_brief at 6 AM)
    scheduler.add_job(
        run_campaign,
        CronTrigger.from_crontab("0 1 * * 1"),
        args=["full"],
        id="bbi_research_campaign",
        name="Monday 1 AM - full research campaign",
        replace_existing=True,
    )

    return scheduler


async def start_scheduler():
    """Start the scheduler (blocking)."""
    scheduler = create_scheduler()
    scheduler.start()
    print("BBI Agent Scheduler started")
    for sched in SCHEDULES:
        print(f"  {sched['agent']}: {sched['desc']}")

    try:
        # Keep running
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        print("Scheduler stopped")
