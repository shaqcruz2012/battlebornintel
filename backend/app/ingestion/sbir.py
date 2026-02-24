"""
SBIR/STTR ingestion pipeline for BBI.

Queries the free public SBIR.gov API for Nevada-based awards and proposes
`grants_to` edges from federal agencies to matched company nodes.

API docs: https://www.sbir.gov/api
Rate limited to 100 awards per run to stay well within free-tier limits.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.db import fetch
from app.ingestion.base import BaseIngestion
from app.services.validator import fuzzy_match_company, normalize_entity_id

logger = logging.getLogger("bbi.ingestion.sbir")

SBIR_API_BASE = "https://api.www.sbir.gov/public/api"
MAX_AWARDS_PER_RUN = 100
REQUEST_TIMEOUT = 30.0
# Delay between requests to be a polite API consumer
REQUEST_DELAY_SECONDS = 0.5

# Federal agency name -> canonical short name for ID generation
AGENCY_ALIASES: dict[str, str] = {
    "Department of Defense": "DOD",
    "Department of Energy": "DOE",
    "National Science Foundation": "NSF",
    "National Aeronautics and Space Administration": "NASA",
    "Department of Health and Human Services": "HHS",
    "National Institutes of Health": "NIH",
    "Department of Homeland Security": "DHS",
    "Department of Commerce": "DOC",
    "Department of Agriculture": "USDA",
    "Department of Transportation": "DOT",
    "Department of Education": "ED",
    "Environmental Protection Agency": "EPA",
    "Small Business Administration": "SBA",
}


class SBIRIngestion(BaseIngestion):
    """
    Ingest SBIR/STTR awards for Nevada-based companies.

    For each award:
      1. Fuzzy-match the company name against existing nodes
      2. If matched: propose a `grants_to` edge from the agency to the company
      3. If agency not in nodes: propose a new external node for the agency
      4. Attach evidence with SBIR.gov link, award title, and abstract
    """

    source_name = "sbir"

    async def run(self) -> dict[str, Any]:
        """Execute the SBIR ingestion pipeline."""
        awards = await self._fetch_awards()

        stats = {
            "awards_found": len(awards),
            "awards_matched": 0,
            "awards_unmatched": 0,
        }

        for award in awards[:MAX_AWARDS_PER_RUN]:
            try:
                matched = await self._process_award(award)
                if matched:
                    stats["awards_matched"] += 1
                else:
                    stats["awards_unmatched"] += 1
            except Exception as e:
                logger.error(
                    f"[sbir] Error processing award '{award.get('awardTitle', '?')}': {e}",
                    exc_info=True,
                )
                self._stats["errors"] += 1

            # Be polite to the API
            await asyncio.sleep(REQUEST_DELAY_SECONDS)

        return stats

    async def _fetch_awards(self) -> list[dict[str, Any]]:
        """
        Fetch Nevada SBIR/STTR awards from the public API.

        Returns a list of award dicts from the API response.
        """
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.get(
                    f"{SBIR_API_BASE}/awards",
                    params={
                        "state": "NV",
                        "rows": MAX_AWARDS_PER_RUN,
                    },
                )
                response.raise_for_status()

                data = response.json()

                # API returns results in different shapes depending on version
                if isinstance(data, list):
                    awards = data
                elif isinstance(data, dict):
                    # Try common response wrapper keys
                    awards = data.get("results", data.get("data", data.get("awards", [])))
                    if not isinstance(awards, list):
                        awards = [data]
                else:
                    logger.warning(f"[sbir] Unexpected API response type: {type(data)}")
                    awards = []

                logger.info(f"[sbir] Fetched {len(awards)} awards from SBIR API")
                return awards

        except httpx.HTTPStatusError as e:
            logger.error(f"[sbir] API HTTP error: {e.response.status_code} {e.response.text}")
            return []
        except httpx.RequestError as e:
            logger.error(f"[sbir] API request error: {e}")
            return []
        except Exception as e:
            logger.error(f"[sbir] Unexpected error fetching awards: {e}", exc_info=True)
            return []

    async def _process_award(self, award: dict[str, Any]) -> bool:
        """
        Process a single SBIR award and propose edges if matched.

        Args:
            award: Award dict from the SBIR API.

        Returns:
            True if the award was matched to a company node, False otherwise.
        """
        # Extract company name from various possible field names
        company_name = (
            award.get("company")
            or award.get("firm")
            or award.get("companyName")
            or award.get("firmName")
            or ""
        ).strip()

        if not company_name:
            logger.debug("[sbir] Award missing company name, skipping")
            return False

        # Extract award metadata
        award_title = award.get("awardTitle") or award.get("title") or "SBIR/STTR Award"
        abstract = award.get("abstract") or award.get("description") or ""
        agency_name = award.get("agency") or award.get("agencyName") or "Unknown Agency"
        award_year = self._extract_year(award)
        award_amount = award.get("awardAmount") or award.get("amount") or 0
        award_id = award.get("awardId") or award.get("id") or ""
        program = award.get("program") or "SBIR"  # SBIR or STTR

        # Build evidence
        evidence_url = f"https://www.sbir.gov/node/{award_id}" if award_id else "https://www.sbir.gov"
        evidence = [{
            "url": evidence_url,
            "title": award_title,
            "snippet": abstract[:500] if abstract else f"{program} award to {company_name}",
            "source": "sbir.gov",
            "amount": award_amount,
            "program": program,
        }]

        # ── 1. Fuzzy match company ──
        matches = await fuzzy_match_company(company_name)
        if not matches or matches[0][1] < 75:
            logger.debug(
                f"[sbir] No match for company '{company_name}' "
                f"(best: {matches[0] if matches else 'none'})"
            )
            return False

        company_node_id, match_score = matches[0]
        confidence = self._score_to_confidence(match_score, award)

        # ── 2. Ensure agency node exists ──
        agency_node_id = await self._ensure_agency_node(agency_name)
        if not agency_node_id:
            logger.warning(f"[sbir] Could not create agency node for '{agency_name}'")
            return False

        # ── 3. Propose grants_to edge ──
        note = (
            f"{program} award: {award_title}"
            + (f" (${award_amount:,.0f})" if award_amount else "")
        )

        result = await self.propose_edge(
            source_id=agency_node_id,
            target_id=company_node_id,
            rel="grants_to",
            note=note,
            year=award_year,
            confidence=confidence,
            evidence=evidence,
        )

        if result["status"] == "invalid":
            # Likely a duplicate edge
            logger.debug(
                f"[sbir] Edge proposal invalid for {agency_node_id} -> {company_node_id}: "
                f"{result['validation']['errors']}"
            )
            return False

        return True

    async def _ensure_agency_node(self, agency_name: str) -> str | None:
        """
        Find or create an external node for a federal agency.

        Args:
            agency_name: Full agency name from the SBIR API.

        Returns:
            Node ID of the agency, or None on failure.
        """
        # Use canonical short name if available
        short_name = AGENCY_ALIASES.get(agency_name, agency_name)

        return await self.find_or_create_external(
            name=agency_name,
            entity_type="external",
            data={
                "etype": "government",
                "short_name": short_name,
                "source": "sbir.gov",
            },
            confidence=0.95,
        )

    def _extract_year(self, award: dict[str, Any]) -> int:
        """Extract the award year from various possible fields."""
        # Try dedicated year field
        year = award.get("awardYear") or award.get("year")
        if year:
            try:
                return int(year)
            except (ValueError, TypeError):
                pass

        # Try date fields
        for date_field in ("awardDate", "date", "startDate", "awardStartDate"):
            date_str = award.get(date_field, "")
            if date_str:
                try:
                    # Handle formats like "2024-01-15" or "01/15/2024"
                    for fmt_slice in [
                        (0, 4),   # YYYY-MM-DD
                        (-4, None),  # MM/DD/YYYY
                    ]:
                        year_str = date_str[fmt_slice[0]:fmt_slice[1]]
                        year_int = int(year_str)
                        if 2000 <= year_int <= 2027:
                            return year_int
                except (ValueError, IndexError):
                    continue

        # Default
        return 2023

    @staticmethod
    def _score_to_confidence(match_score: int, award: dict[str, Any]) -> float:
        """
        Convert a fuzzy match score (0-100) to a confidence value (0.0-1.0).

        Higher match score and more complete award data increase confidence.
        """
        # Base confidence from match score
        base = match_score / 100.0

        # Slight boost if award has good metadata
        has_abstract = bool(award.get("abstract"))
        has_amount = bool(award.get("awardAmount") or award.get("amount"))
        has_date = bool(
            award.get("awardDate") or award.get("date") or award.get("awardYear")
        )

        metadata_boost = sum([has_abstract, has_amount, has_date]) * 0.02

        return min(base + metadata_boost, 1.0)
