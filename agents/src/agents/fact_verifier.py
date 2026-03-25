"""FactVerifier agent — verifies entity data against external sources."""

import json

import httpx

from .base_agent import BaseAgent


SYSTEM_PROMPT = """You are a data verification analyst for the Nevada startup ecosystem.
Your job is to verify whether claimed facts about companies are accurate.

Given a company record and web search results, determine:
1. Is the company real and currently operating?
2. Are the claimed details (stage, funding, employees, sectors) accurate?
3. What is your confidence level in the verification?

CRITICAL: Be conservative. Only mark as verified if you find clear corroborating evidence.
If you cannot verify, say so — do not guess.

Output valid JSON."""

VERIFY_TOOL = {
    "name": "verification_result",
    "description": "Report verification findings for an entity",
    "input_schema": {
        "type": "object",
        "properties": {
            "verified": {"type": "boolean", "description": "Whether the entity could be verified"},
            "confidence": {"type": "number", "description": "Confidence 0.0-1.0"},
            "findings": {"type": "string", "description": "Summary of what was found"},
            "corrections": {
                "type": "object",
                "description": "Fields that need correction, e.g. {'stage': 'series_b', 'employees': 200}",
            },
            "sources_checked": {
                "type": "array",
                "items": {"type": "string"},
                "description": "URLs or source names checked",
            },
        },
        "required": ["verified", "confidence", "findings"],
    },
}


class FactVerifier(BaseAgent):
    """Verifies existing entity data and updates confidence/verified status."""

    def __init__(self):
        super().__init__("fact_verifier")

    async def run(self, pool, limit: int | None = None):
        if limit:
            # Manual limit specified — use existing low-confidence query
            rows = await pool.fetch(
                """SELECT er.canonical_id, er.entity_type, er.label, er.confidence,
                          er.source_table, er.source_table_id
                   FROM entity_registry er
                   WHERE (er.verified = FALSE OR er.confidence IS NULL OR er.confidence < 0.6)
                   AND er.entity_type IN ('company', 'external', 'vc_firm', 'corporation')
                   ORDER BY er.confidence ASC NULLS FIRST
                   LIMIT $1""",
                limit,
            )
        else:
            # Use rotation scheduler — get least-recently-queried entities
            from ..orchestration.rotation import get_next_batch, DAILY_BATCH_SIZE
            rows = await get_next_batch(DAILY_BATCH_SIZE)

        results = {"checked": 0, "verified": 0, "flagged": 0, "updated": 0}

        for row in rows:
            result = await self._verify_entity(pool, dict(row))
            results["checked"] += 1
            if result.get("verified"):
                results["verified"] += 1
            if result.get("flagged"):
                results["flagged"] += 1
            if result.get("updated"):
                results["updated"] += 1

        return results

    async def _verify_entity(self, pool, entity: dict) -> dict:
        canonical_id = entity["canonical_id"]
        label = entity["label"]
        entity_type = entity["entity_type"]

        # Get additional detail from source table if it's a company
        detail = ""
        if entity["source_table"] == "companies":
            company = await pool.fetchrow(
                "SELECT name, stage, city, region, funding_m, employees, founded, description FROM companies WHERE id = $1",
                int(entity["source_table_id"]),
            )
            if company:
                detail = (
                    f"Stage: {company['stage']}, City: {company['city']}, "
                    f"Funding: ${company['funding_m']}M, Employees: {company['employees']}, "
                    f"Founded: {company['founded']}, Description: {company['description'] or 'N/A'}"
                )

        # Build verification prompt
        user_prompt = f"""Verify this {entity_type} entity:

Name: {label}
Current Data: {detail or 'Minimal data available'}
Current Confidence: {entity.get('confidence') or 'unset'}

Based on your knowledge, verify whether this entity is real and the data is accurate.
If you know of corrections, include them."""

        result = {"verified": False, "flagged": False, "updated": False}

        try:
            response = self.call_claude_with_tools(
                SYSTEM_PROMPT,
                user_prompt,
                tools=[VERIFY_TOOL],
            )

            for block in response.content:
                if block.type == "tool_use" and block.name == "verification_result":
                    findings = block.input
                    new_confidence = findings.get("confidence", 0.5)
                    is_verified = findings.get("verified", False)

                    # Update entity_registry
                    await pool.execute(
                        """UPDATE entity_registry
                           SET confidence = $2, verified = $3, updated_at = NOW()
                           WHERE canonical_id = $1""",
                        canonical_id, new_confidence, is_verified,
                    )
                    result["updated"] = True
                    result["verified"] = is_verified

                    # Log the verification as a state change
                    await self.log_state_change(
                        pool,
                        canonical_id,
                        "verification",
                        "confidence",
                        old_value=entity.get("confidence"),
                        new_value=new_confidence,
                    )

                    # Log search for rotation tracking
                    await self.log_search(
                        pool,
                        canonical_id,
                        "verification",
                        query_text=f"Verify {label} ({entity_type})",
                        result_summary=findings.get("findings", ""),
                        sources_checked=findings.get("sources_checked", []),
                        findings=findings,
                        confidence_before=entity.get("confidence"),
                        confidence_after=new_confidence,
                    )

                    # Save detailed findings as analysis
                    await self.save_analysis(
                        pool,
                        analysis_type="verification",
                        content={
                            "verified": is_verified,
                            "confidence": new_confidence,
                            "findings": findings.get("findings", ""),
                            "corrections": findings.get("corrections", {}),
                            "sources_checked": findings.get("sources_checked", []),
                        },
                        entity_type=entity_type,
                        entity_id=canonical_id,
                    )

                    # Flag entities with corrections for human review
                    if findings.get("corrections"):
                        result["flagged"] = True
                        await self.save_analysis(
                            pool,
                            analysis_type="correction_needed",
                            content={
                                "entity": canonical_id,
                                "label": label,
                                "corrections": findings["corrections"],
                                "reason": findings.get("findings", ""),
                            },
                            entity_type=entity_type,
                            entity_id=canonical_id,
                        )

        except Exception as e:
            print(f"[fact_verifier] Failed to verify {canonical_id}: {e}")

        return result
