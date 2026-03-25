"""ResearchDirector — orchestrates multi-agent research campaigns."""

import json
from datetime import datetime, timezone

from .runner import run_agent
from ..db import get_pool


class ResearchDirector:
    """Coordinates a full research pipeline across multiple agents."""

    def __init__(self):
        self.campaign_id = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

    async def run_campaign(self, mode: str = "full"):
        """Run a coordinated research campaign.

        Modes:
            full    — all stages (freshness → scout → verify → analyze → risk)
            refresh — freshness + verify only
            scout   — data_scout only
        """
        pool = await get_pool()
        campaign_log = {
            "campaign_id": self.campaign_id,
            "mode": mode,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "stages": [],
        }

        stages = self._get_stages(mode)

        for stage_name, agent_name, kwargs in stages:
            print(f"[director] Stage: {stage_name} ({agent_name})")
            stage_result = {"stage": stage_name, "agent": agent_name, "status": "running"}

            try:
                result = await run_agent(agent_name, **kwargs)
                stage_result["status"] = "completed"
                stage_result["result"] = str(result)[:300]
                print(f"[director] {stage_name} completed: {result}")
            except Exception as e:
                stage_result["status"] = "failed"
                stage_result["error"] = str(e)[:300]
                print(f"[director] {stage_name} failed: {e}")
                # Continue with remaining stages even if one fails

            campaign_log["stages"].append(stage_result)

        campaign_log["completed_at"] = datetime.now(timezone.utc).isoformat()

        # Save campaign summary to analysis_results
        await pool.execute(
            """INSERT INTO analysis_results
               (analysis_type, content, agent_run_id)
               VALUES ('research_campaign', $1, NULL)""",
            json.dumps(campaign_log),
        )

        completed = sum(1 for s in campaign_log["stages"] if s["status"] == "completed")
        failed = sum(1 for s in campaign_log["stages"] if s["status"] == "failed")
        print(f"[director] Campaign {self.campaign_id} done: {completed} completed, {failed} failed")

        return campaign_log

    def _get_stages(self, mode: str):
        """Return ordered list of (stage_name, agent_name, kwargs)."""
        stages = {
            "full": [
                ("1-freshness", "freshness_checker", {}),
                ("2-scout", "data_scout", {}),
                ("3-verify", "fact_verifier", {"limit": 30}),
                ("4-map-relationships", "relationship_mapper", {"limit": 10}),
                ("5-analyze", "company_analyst", {}),
                ("6-risk", "risk_assessor", {}),
                ("7-patterns", "pattern_detector", {}),
            ],
            "refresh": [
                ("1-freshness", "freshness_checker", {}),
                ("2-verify", "fact_verifier", {"limit": 50}),
            ],
            "scout": [
                ("1-scout", "data_scout", {}),
            ],
        }
        return stages.get(mode, stages["full"])


async def run_campaign(mode: str = "full"):
    """Entry point for CLI and scheduler."""
    director = ResearchDirector()
    return await director.run_campaign(mode)
