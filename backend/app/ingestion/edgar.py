"""
SEC EDGAR Form D ingestion pipeline for BBI.

Searches the SEC EDGAR full-text search API (efts.sec.gov) for Form D filings
by Nevada-based companies and proposes `invested_in` edges for matched issuers.

Form D filings are required for private placements under Regulation D,
making them an excellent signal for startup fundraising activity.

Rate limited per SEC guidelines: max 10 requests/sec, with User-Agent header.
"""
from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime
from typing import Any

import httpx

from app.ingestion.base import BaseIngestion
from app.services.validator import fuzzy_match_company, normalize_entity_id

logger = logging.getLogger("bbi.ingestion.edgar")

# SEC EDGAR full-text search endpoint
EFTS_BASE = "https://efts.sec.gov/LATEST/search-index"
# Standard EDGAR full-text search
EDGAR_SEARCH_BASE = "https://efts.sec.gov/LATEST/search-index"
# EDGAR company search
EDGAR_COMPANY_SEARCH = "https://www.sec.gov/cgi-bin/browse-edgar"
# EDGAR full-text search (newer API)
EDGAR_FULLTXT_SEARCH = "https://efts.sec.gov/LATEST/search-index"

# Free full-text search API
EDGAR_FTS_URL = "https://efts.sec.gov/LATEST/search-index"

# EDGAR XBRL companion API for structured filing data
EDGAR_SUBMISSIONS_BASE = "https://data.sec.gov/submissions"

# Rate limit: SEC asks for max 10 req/sec with User-Agent
SEC_REQUEST_DELAY = 0.15  # ~6.6 req/sec to stay safe
SEC_USER_AGENT = "BattleBornIntel/1.0 (research@battlebornintel.com)"
REQUEST_TIMEOUT = 30.0
MAX_FILINGS_PER_RUN = 100


class EDGARIngestion(BaseIngestion):
    """
    Ingest SEC EDGAR Form D filings for Nevada-based companies.

    For each filing:
      1. Extract issuer name, amount raised, date filed
      2. Fuzzy-match issuer against existing company nodes
      3. If matched: propose `invested_in` edges
      4. Attach evidence with SEC filing URL, title, and extracted summary
    """

    source_name = "edgar"

    async def run(self) -> dict[str, Any]:
        """Execute the EDGAR ingestion pipeline."""
        filings = await self._search_form_d_filings()

        stats = {
            "filings_found": len(filings),
            "filings_matched": 0,
            "filings_unmatched": 0,
        }

        for filing in filings[:MAX_FILINGS_PER_RUN]:
            try:
                matched = await self._process_filing(filing)
                if matched:
                    stats["filings_matched"] += 1
                else:
                    stats["filings_unmatched"] += 1
            except Exception as e:
                logger.error(
                    f"[edgar] Error processing filing: {e}", exc_info=True
                )
                self._stats["errors"] += 1

            # Respect SEC rate limits
            await asyncio.sleep(SEC_REQUEST_DELAY)

        return stats

    async def _search_form_d_filings(self) -> list[dict[str, Any]]:
        """
        Search EDGAR full-text search for Nevada Form D filings.

        Uses the efts.sec.gov endpoint which provides free full-text
        search across all SEC filings.

        Returns a list of filing metadata dicts.
        """
        try:
            headers = {
                "User-Agent": SEC_USER_AGENT,
                "Accept": "application/json",
            }

            async with httpx.AsyncClient(
                timeout=REQUEST_TIMEOUT, headers=headers
            ) as client:
                # Use the EDGAR full-text search API
                # Search for Form D filings mentioning Nevada
                response = await client.get(
                    "https://efts.sec.gov/LATEST/search-index",
                    params={
                        "q": '"Form D" "Nevada"',
                        "dateRange": "custom",
                        "startdt": "2020-01-01",
                        "enddt": datetime.now().strftime("%Y-%m-%d"),
                        "forms": "D",
                        "from": 0,
                        "size": MAX_FILINGS_PER_RUN,
                    },
                )
                response.raise_for_status()
                data = response.json()

                # Extract hits from response
                hits = data.get("hits", {}).get("hits", [])
                if not hits:
                    # Try alternative response shapes
                    hits = data.get("results", data.get("filings", []))

                filings = []
                for hit in hits:
                    source = hit.get("_source", hit)
                    filings.append(self._normalize_filing(source))

                logger.info(f"[edgar] Found {len(filings)} Form D filings")
                return filings

        except httpx.HTTPStatusError as e:
            logger.error(
                f"[edgar] EDGAR API HTTP error: {e.response.status_code}"
            )
            # Fall back to the simpler company search
            return await self._fallback_company_search()
        except httpx.RequestError as e:
            logger.error(f"[edgar] EDGAR API request error: {e}")
            return await self._fallback_company_search()
        except Exception as e:
            logger.error(
                f"[edgar] Unexpected error searching EDGAR: {e}", exc_info=True
            )
            return []

    async def _fallback_company_search(self) -> list[dict[str, Any]]:
        """
        Fallback: search EDGAR company filings via the submissions API.

        Uses data.sec.gov which provides structured filing data.
        """
        logger.info("[edgar] Falling back to company submissions search")
        # This is a simpler approach - we can search by company CIK
        # For now, return empty and log the fallback
        return []

    def _normalize_filing(self, source: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize a filing record from various EDGAR API response formats
        into a consistent dict.
        """
        return {
            "issuer_name": (
                source.get("entity_name")
                or source.get("display_names", [None])[0]
                or source.get("company_name")
                or source.get("issuer", {}).get("name", "")
                or ""
            ).strip(),
            "cik": source.get("entity_id") or source.get("cik") or "",
            "filing_date": (
                source.get("file_date")
                or source.get("filing_date")
                or source.get("date_filed")
                or ""
            ),
            "form_type": source.get("file_type") or source.get("form_type") or "D",
            "accession_number": (
                source.get("accession_no")
                or source.get("accession_number")
                or ""
            ),
            "amount_raised": self._extract_amount(source),
            "state": source.get("state_of_inc") or source.get("state") or "",
            "raw": source,
        }

    def _extract_amount(self, source: dict[str, Any]) -> float | None:
        """Extract the total amount raised from a Form D filing."""
        # Try direct field
        for field in (
            "total_amount_sold",
            "amount_sold",
            "offering_amount",
            "total_offering_amount",
        ):
            val = source.get(field)
            if val:
                try:
                    return float(str(val).replace(",", "").replace("$", ""))
                except (ValueError, TypeError):
                    continue

        # Try nested offering data
        offering = source.get("offering_data", {})
        if offering:
            for field in ("totalAmountSold", "totalOfferingAmount"):
                val = offering.get(field)
                if val:
                    try:
                        return float(str(val).replace(",", "").replace("$", ""))
                    except (ValueError, TypeError):
                        continue

        return None

    async def _process_filing(self, filing: dict[str, Any]) -> bool:
        """
        Process a single EDGAR Form D filing.

        Args:
            filing: Normalized filing dict.

        Returns:
            True if the filing was matched and an edge was proposed.
        """
        issuer_name = filing["issuer_name"]
        if not issuer_name:
            logger.debug("[edgar] Filing missing issuer name, skipping")
            return False

        # ── 1. Fuzzy match issuer against company nodes ──
        matches = await fuzzy_match_company(issuer_name)
        if not matches or matches[0][1] < 75:
            logger.debug(
                f"[edgar] No match for issuer '{issuer_name}' "
                f"(best: {matches[0] if matches else 'none'})"
            )
            return False

        company_node_id, match_score = matches[0]

        # ── 2. Extract filing details ──
        filing_year = self._extract_year(filing["filing_date"])
        amount = filing["amount_raised"]
        accession = filing["accession_number"]

        # Build evidence
        filing_url = self._build_filing_url(filing["cik"], accession)
        amount_str = f"${amount:,.0f}" if amount else "undisclosed amount"
        evidence = [{
            "url": filing_url,
            "title": "Form D Filing",
            "snippet": (
                f"SEC Form D filed by {issuer_name} "
                f"for {amount_str} "
                f"(filed {filing['filing_date']})"
            ),
            "source": "sec.gov",
            "cik": filing["cik"],
            "accession_number": accession,
            "amount_raised": amount,
        }]

        # Confidence based on match quality and data completeness
        confidence = self._compute_confidence(match_score, filing)

        # ── 3. Propose invested_in edge ──
        # For Form D, the company is raising capital. We create a generic
        # "invested_in" edge. If we can identify the specific investor from
        # the filing, we'd create a more specific edge.
        note = (
            f"Form D: {issuer_name} raised {amount_str}"
            + (f" ({filing['filing_date']})" if filing["filing_date"] else "")
        )

        # We need an investor node. For Form D we know capital was raised
        # but the specific investor isn't always clear from the search index.
        # Create a generic "private_placement" external or skip.
        investor_id = await self._find_investor_from_filing(filing)
        if not investor_id:
            # Log the filing for manual review but don't create a bogus edge
            logger.info(
                f"[edgar] Matched {issuer_name} -> {company_node_id} but no "
                f"investor identified; filing noted for manual review"
            )
            return False

        result = await self.propose_edge(
            source_id=investor_id,
            target_id=company_node_id,
            rel="invested_in",
            note=note,
            year=filing_year,
            confidence=confidence,
            evidence=evidence,
        )

        return result["status"] != "invalid"

    async def _find_investor_from_filing(
        self, filing: dict[str, Any]
    ) -> str | None:
        """
        Attempt to identify the investor(s) from a Form D filing.

        Form D filings list "related persons" which often include
        the investors/fund managers. If we can extract and match them,
        we return the investor node ID.

        Args:
            filing: Normalized filing dict.

        Returns:
            Investor node ID or None.
        """
        raw = filing.get("raw", {})

        # Try to get related persons from the filing data
        related_persons = raw.get("related_persons", raw.get("relatedPersons", []))
        if not related_persons:
            return None

        for person in related_persons:
            name = ""
            if isinstance(person, dict):
                name = (
                    person.get("name")
                    or f"{person.get('firstName', '')} {person.get('lastName', '')}".strip()
                )
            elif isinstance(person, str):
                name = person

            if not name:
                continue

            # Try to match against existing fund/external nodes
            matches = await fuzzy_match_company(name)
            if matches and matches[0][1] >= 80:
                return matches[0][0]

        return None

    def _extract_year(self, date_str: str) -> int:
        """Extract year from a date string."""
        if not date_str:
            return 2023

        # Try common date formats
        for pattern in (
            r"(\d{4})-\d{2}-\d{2}",      # YYYY-MM-DD
            r"\d{2}/\d{2}/(\d{4})",        # MM/DD/YYYY
            r"\d{2}-\d{2}-(\d{4})",        # MM-DD-YYYY
            r"(\d{4})\d{4}",              # YYYYMMDD
        ):
            match = re.search(pattern, date_str)
            if match:
                year = int(match.group(1))
                if 2000 <= year <= 2027:
                    return year

        return 2023

    def _build_filing_url(self, cik: str, accession: str) -> str:
        """Build a direct link to the SEC filing."""
        if cik and accession:
            # Clean accession number (remove dashes for URL)
            acc_clean = accession.replace("-", "")
            return (
                f"https://www.sec.gov/Archives/edgar/data/{cik}/{acc_clean}/"
                f"{accession}-index.htm"
            )
        return "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=D&dateb=&owner=include&count=40&search_text=&action=getcompany"

    @staticmethod
    def _compute_confidence(match_score: int, filing: dict[str, Any]) -> float:
        """
        Compute confidence for the edge proposal.

        Factors:
          - Fuzzy match score (primary)
          - Filing has amount data
          - Filing has a clear date
          - State matches Nevada
        """
        base = match_score / 100.0

        has_amount = filing["amount_raised"] is not None
        has_date = bool(filing["filing_date"])
        is_nevada = filing.get("state", "").upper() in ("NV", "NEVADA")

        boost = sum([has_amount, has_date, is_nevada]) * 0.02
        return min(base + boost, 1.0)
