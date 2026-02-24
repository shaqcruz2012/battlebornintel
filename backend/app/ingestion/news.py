"""
News enrichment pipeline for BBI.

For each tracked company, searches NewsAPI for recent articles, then
uses Claude to extract structured business relationships from the content.

Requires:
  - ANTHROPIC_API_KEY for Claude relationship extraction
  - NEWS_API_KEY for NewsAPI access

Rate limited: 5 companies per run, 3 articles per company.
"""
from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

import httpx

from app.config import settings
from app.db import fetch
from app.ingestion.base import BaseIngestion
from app.services.validator import fuzzy_match_company, normalize_entity_id

logger = logging.getLogger("bbi.ingestion.news")

NEWSAPI_BASE = "https://newsapi.org/v2"
MAX_COMPANIES_PER_RUN = 5
MAX_ARTICLES_PER_COMPANY = 3
REQUEST_TIMEOUT = 30.0
# Delay between NewsAPI requests to respect rate limits
NEWS_REQUEST_DELAY = 1.0

# Claude extraction prompt template
EXTRACTION_PROMPT = """Extract business relationships from this article about {company_name}.

Article title: {title}
Article content: {content}

Return a JSON array of relationships found in this article. Each relationship should be:
[
  {{
    "entity": "name of the other entity",
    "entity_type": "company|fund|external",
    "relationship": "invested_in|partners_with|accelerated_by|competes_with|acquired|funds|collaborated_with|supports|contracts_with|won_pitch|grants_to",
    "evidence": "exact quote or close paraphrase from the article supporting this relationship",
    "date": "YYYY or null if unknown",
    "confidence": 0.0-1.0
  }}
]

Rules:
- Only include relationships you are confident about based on the article text.
- Map relationships to these types only: invested_in, partners_with, accelerated_by, competes_with, acquired, funds, collaborated_with, supports, contracts_with, won_pitch, grants_to.
- "invested_in" means entity invested money into {company_name}.
- "partners_with" means a business partnership or collaboration.
- "acquired" means one entity acquired the other.
- "contracts_with" means a customer/vendor relationship.
- Set confidence based on how explicit the relationship is in the article.
- If no relationships are found, return an empty array [].
- Return ONLY valid JSON, no markdown or explanation."""


class NewsIngestion(BaseIngestion):
    """
    News enrichment pipeline.

    For each tracked company node:
      1. Search NewsAPI for recent articles mentioning the company
      2. Send article titles + snippets to Claude for relationship extraction
      3. Claude returns structured relationship data
      4. Propose extracted edges through the standard pipeline
    """

    source_name = "news"

    def __init__(self):
        super().__init__()
        self._anthropic_client = None
        self._input_tokens = 0
        self._output_tokens = 0

    async def run(self) -> dict[str, Any]:
        """Execute the news enrichment pipeline."""
        # Check for required API keys
        if not settings.news_api_key:
            logger.warning("[news] NEWS_API_KEY not set, skipping news pipeline")
            return {"companies_searched": 0, "articles_analyzed": 0, "skipped": "no_api_key"}

        if not settings.anthropic_api_key:
            logger.warning("[news] ANTHROPIC_API_KEY not set, skipping Claude extraction")
            return {"companies_searched": 0, "articles_analyzed": 0, "skipped": "no_anthropic_key"}

        # Lazy-load the Anthropic client
        try:
            from anthropic import Anthropic
            self._anthropic_client = Anthropic(api_key=settings.anthropic_api_key)
        except ImportError:
            logger.error("[news] anthropic package not installed")
            return {"companies_searched": 0, "articles_analyzed": 0, "skipped": "no_anthropic_package"}

        # Get tracked company nodes
        companies = await fetch(
            "SELECT id, label, data FROM nodes WHERE type = 'company' ORDER BY random() LIMIT $1",
            MAX_COMPANIES_PER_RUN,
        )

        stats = {
            "companies_searched": 0,
            "articles_analyzed": 0,
            "relationships_extracted": 0,
            "input_tokens": 0,
            "output_tokens": 0,
        }

        for company in companies:
            try:
                result = await self._process_company(company)
                stats["companies_searched"] += 1
                stats["articles_analyzed"] += result.get("articles_analyzed", 0)
                stats["relationships_extracted"] += result.get("relationships_extracted", 0)
            except Exception as e:
                logger.error(
                    f"[news] Error processing company '{company['label']}': {e}",
                    exc_info=True,
                )
                self._stats["errors"] += 1

            # Brief delay between companies
            await asyncio.sleep(NEWS_REQUEST_DELAY)

        stats["input_tokens"] = self._input_tokens
        stats["output_tokens"] = self._output_tokens
        return stats

    async def _process_company(self, company: dict[str, Any]) -> dict[str, int]:
        """
        Process a single company: search news, extract relationships.

        Args:
            company: Node dict with id, label, data.

        Returns:
            Dict with articles_analyzed and relationships_extracted counts.
        """
        company_name = company["label"]
        company_id = company["id"]

        result = {"articles_analyzed": 0, "relationships_extracted": 0}

        # ── 1. Search NewsAPI ──
        articles = await self._search_news(company_name)
        if not articles:
            logger.debug(f"[news] No articles found for '{company_name}'")
            return result

        # Process up to MAX_ARTICLES_PER_COMPANY
        for article in articles[:MAX_ARTICLES_PER_COMPANY]:
            try:
                relationships = await self._extract_relationships(
                    company_name, article
                )
                result["articles_analyzed"] += 1

                for rel_data in relationships:
                    proposed = await self._propose_relationship(
                        company_id, company_name, article, rel_data
                    )
                    if proposed:
                        result["relationships_extracted"] += 1

            except Exception as e:
                logger.error(
                    f"[news] Error extracting from article '{article.get('title', '?')}': {e}",
                    exc_info=True,
                )
                self._stats["errors"] += 1

            await asyncio.sleep(0.5)

        return result

    async def _search_news(self, company_name: str) -> list[dict[str, Any]]:
        """
        Search NewsAPI for recent articles about a company.

        Args:
            company_name: Company name to search for.

        Returns:
            List of article dicts from the NewsAPI response.
        """
        try:
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.get(
                    f"{NEWSAPI_BASE}/everything",
                    params={
                        "q": f'"{company_name}" Nevada',
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": MAX_ARTICLES_PER_COMPANY,
                        "apiKey": settings.news_api_key,
                    },
                )
                response.raise_for_status()
                data = response.json()

                articles = data.get("articles", [])
                logger.debug(
                    f"[news] Found {len(articles)} articles for '{company_name}'"
                )
                return articles

        except httpx.HTTPStatusError as e:
            logger.error(
                f"[news] NewsAPI HTTP error for '{company_name}': "
                f"{e.response.status_code}"
            )
            return []
        except httpx.RequestError as e:
            logger.error(f"[news] NewsAPI request error for '{company_name}': {e}")
            return []

    async def _extract_relationships(
        self, company_name: str, article: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """
        Use Claude to extract structured relationships from an article.

        Args:
            company_name: The company we're researching.
            article: Article dict from NewsAPI (title, description, content, url).

        Returns:
            List of relationship dicts extracted by Claude.
        """
        title = article.get("title", "")
        # NewsAPI free tier truncates content to ~200 chars, so combine sources
        content = article.get("content") or article.get("description") or ""

        if not content and not title:
            return []

        prompt = EXTRACTION_PROMPT.format(
            company_name=company_name,
            title=title,
            content=content,
        )

        try:
            response = self._anthropic_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )

            # Track token usage
            self._input_tokens += response.usage.input_tokens
            self._output_tokens += response.usage.output_tokens

            # Parse the response
            response_text = response.content[0].text.strip()

            # Handle markdown code blocks
            if response_text.startswith("```"):
                # Strip ```json and ``` markers
                lines = response_text.split("\n")
                response_text = "\n".join(
                    line for line in lines
                    if not line.strip().startswith("```")
                )

            relationships = json.loads(response_text)

            if not isinstance(relationships, list):
                logger.warning(
                    f"[news] Claude returned non-list response for '{company_name}'"
                )
                return []

            logger.debug(
                f"[news] Claude extracted {len(relationships)} relationships "
                f"for '{company_name}' from '{title}'"
            )
            return relationships

        except json.JSONDecodeError as e:
            logger.warning(
                f"[news] Failed to parse Claude response as JSON: {e}"
            )
            return []
        except Exception as e:
            logger.error(f"[news] Claude extraction error: {e}", exc_info=True)
            return []

    async def _propose_relationship(
        self,
        company_id: str,
        company_name: str,
        article: dict[str, Any],
        rel_data: dict[str, Any],
    ) -> bool:
        """
        Propose a single relationship extracted from a news article.

        Determines edge direction based on relationship type:
          - invested_in, grants_to, funds: entity -> company
          - partners_with, collaborated_with, competes_with: company -> entity
          - acquired: depends on context (default company -> entity)

        Args:
            company_id: ID of the company node.
            company_name: Label of the company node.
            article: Original article dict (for evidence).
            rel_data: Relationship dict from Claude extraction.

        Returns:
            True if an edge was successfully proposed.
        """
        entity_name = rel_data.get("entity", "").strip()
        entity_type = rel_data.get("entity_type", "external").strip()
        rel_type = rel_data.get("relationship", "").strip()
        evidence_text = rel_data.get("evidence", "").strip()
        date_str = rel_data.get("date")
        confidence = rel_data.get("confidence", 0.5)

        if not entity_name or not rel_type:
            return False

        # Normalize entity type
        if entity_type not in ("company", "fund", "external"):
            entity_type = "external"

        # Find or create the other entity
        other_id = await self.find_or_create_external(
            name=entity_name,
            entity_type=entity_type,
            data={"source": "news_extraction"},
            confidence=confidence * 0.9,  # Slightly lower confidence for auto-created nodes
        )
        if not other_id:
            return False

        # Determine edge direction
        # For "invested_in", "grants_to", "funds" — the other entity acts on the company
        inbound_rels = {"invested_in", "grants_to", "funds", "accelerated_by", "supports"}
        if rel_type in inbound_rels:
            source_id = other_id
            target_id = company_id
        else:
            source_id = company_id
            target_id = other_id

        # Extract year
        year = 2023
        if date_str:
            try:
                year = int(str(date_str)[:4])
                if not (2000 <= year <= 2027):
                    year = 2023
            except (ValueError, TypeError):
                year = 2023

        # Build evidence
        evidence = [{
            "url": article.get("url", ""),
            "title": article.get("title", "News article"),
            "snippet": evidence_text or article.get("description", ""),
            "source": article.get("source", {}).get("name", "news"),
            "published_at": article.get("publishedAt", ""),
        }]

        note = f"From news: {entity_name} {rel_type.replace('_', ' ')} {company_name}"

        result = await self.propose_edge(
            source_id=source_id,
            target_id=target_id,
            rel=rel_type,
            note=note,
            year=year,
            confidence=confidence,
            evidence=evidence,
        )

        return result["status"] != "invalid"
