"""APScheduler-based scheduling for BBI agents."""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .runner import run_agent


# Default schedules
SCHEDULES = [
    {"agent": "company_analyst", "cron": "0 2 * * 0", "desc": "Sunday 2 AM - full company analysis"},
    {"agent": "weekly_brief", "cron": "0 6 * * 1", "desc": "Monday 6 AM - weekly brief"},
    {"agent": "risk_assessor", "cron": "0 3 * * *", "desc": "Daily 3 AM - risk assessment"},
    {"agent": "pattern_detector", "cron": "0 4 * * 0", "desc": "Sunday 4 AM - pattern detection"},
    {"agent": "panel_forecaster", "cron": "0 5 * * 0", "desc": "Sunday 5 AM - panel metric forecasts"},
    {"agent": "survival_analyzer", "cron": "0 6 * * 0", "desc": "Sunday 6 AM - survival analysis"},
    {"agent": "graph_feature_engineer", "cron": "0 7 * * 0", "desc": "Sunday 7 AM - graph feature engineering"},
    {"agent": "freshness_checker", "cron": "0 1 * * *", "desc": "Daily 1 AM - freshness check"},
    {"agent": "fred_ingestor", "cron": "0 2 * * 1", "desc": "Monday 2 AM - FRED macro data ingestion"},
    {"agent": "bls_ingestor", "cron": "0 3 1 * *", "desc": "1st of month 3 AM - BLS QCEW employment/wages ingestion"},
    {"agent": "scenario_simulator", "cron": "0 8 1 * *", "desc": "1st of month 8 AM - Monte Carlo scenario simulations"},
    {"agent": "causal_evaluator", "cron": "0 7 1 * *", "desc": "1st of month 7 AM - causal inference (DiD, PSM, spillover)"},
    {"agent": "census_ingestor", "cron": "0 3 1 */3 *", "desc": "Quarterly 1st 3 AM - Census ACS population/income data"},
    {"agent": "sec_ingestor", "cron": "0 4 * * 1", "desc": "Monday 4 AM - SEC EDGAR company filings"},
    {"agent": "uspto_ingestor", "cron": "0 5 1 * *", "desc": "1st of month 5 AM - USPTO patent data ingestion"},
    {"agent": "nsf_ingestor", "cron": "0 3 1 */3 *", "desc": "Quarterly 1st 3 AM - NSF research funding data"},
    {"agent": "nvsos_ingestor", "cron": "0 4 15 * *", "desc": "15th of month 4 AM - NV SOS business entity filings"},
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
