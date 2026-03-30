"""
ResearchDirector — Meta-agent that coordinates research teams and self-improves.

Responsibilities:
  1. Orchestrates data collection agents in priority order
  2. Evaluates data quality after each agent run
  3. Identifies coverage gaps and prioritizes next actions
  4. Uses Claude to research better data collection methods
  5. Generates improvement recommendations for future runs
  6. Produces a structured research brief after each campaign

Self-improvement loop:
  Run agents → Audit results → Ask Claude "how can we improve?" →
  Store recommendations → Apply to next run's strategy
"""

import json
from datetime import date, timedelta
from decimal import Decimal

from .base_agent import BaseAgent


def _safe_dict(row):
    """Convert asyncpg Record to dict with JSON-safe types."""
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, Decimal):
            d[k] = float(v)
        elif isinstance(v, (date, timedelta)):
            d[k] = str(v)
    return d

STRATEGY_TOOL = {
    "name": "research_strategy",
    "description": "Produce a research strategy with priorities and improvement recommendations",
    "input_schema": {
        "type": "object",
        "properties": {
            "coverage_assessment": {
                "type": "object",
                "properties": {
                    "companies_pct": {"type": "number"},
                    "funding_rounds_pct": {"type": "number"},
                    "regional_indicators_pct": {"type": "number"},
                    "outcomes_pct": {"type": "number"},
                    "treatments_pct": {"type": "number"},
                },
            },
            "priority_actions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "action": {"type": "string"},
                        "target_table": {"type": "string"},
                        "agent": {"type": "string"},
                        "priority": {"type": "string", "enum": ["critical", "high", "medium", "low"]},
                        "expected_rows": {"type": "integer"},
                        "data_source": {"type": "string"},
                        "tos_compliant": {"type": "boolean"},
                    },
                    "required": ["action", "priority", "tos_compliant"],
                },
            },
            "improvement_recommendations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "area": {"type": "string"},
                        "current_approach": {"type": "string"},
                        "suggested_improvement": {"type": "string"},
                        "rationale": {"type": "string"},
                        "effort": {"type": "string", "enum": ["low", "medium", "high"]},
                    },
                    "required": ["area", "suggested_improvement", "rationale"],
                },
            },
            "new_sources_to_explore": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "source_name": {"type": "string"},
                        "url": {"type": "string"},
                        "data_type": {"type": "string"},
                        "tos_status": {"type": "string", "enum": ["free_public", "free_api_key", "paid", "unknown"]},
                        "relevance": {"type": "string"},
                    },
                },
            },
        },
        "required": ["coverage_assessment", "priority_actions", "improvement_recommendations"],
    },
}

SYSTEM_PROMPT = """You are a research director for a Nevada innovation ecosystem intelligence platform.
Your job is to assess data coverage, prioritize collection efforts, and recommend improvements.

The platform tracks: companies, funding rounds, investors, accelerators, graph relationships,
regional economic indicators, program treatment effects, and firm outcomes.

Data quality principles:
- All data must be verifiable — no fabrication
- Sources must be TOS-compliant (prefer free government APIs)
- Confidence scores must reflect actual verification level
- Every record needs provenance (source_url, agent_id)

Free public data sources available:
- FRED (Federal Reserve): macro indicators, GDP, unemployment, housing
- BLS (Bureau of Labor Statistics): wages, labor force, industry employment
- SBIR API: federal grant awards to small businesses
- SEC EDGAR: public company filings, IPO data
- USPTO: patent grants and applications
- Census Business Builder: business formations, demographics
- NSF HERD: university R&D expenditures
- USASPENDING.gov: federal contract awards

When recommending improvements, consider:
- What data gaps most limit the analytical models?
- Which free sources are underutilized?
- How can existing agents be more efficient?
- What new data pipelines would have the highest ROI?"""


class ResearchDirector(BaseAgent):
    def __init__(self):
        super().__init__("research_director")

    async def run(self, pool, *, run_agents=False, **kwargs):
        # Phase 1: Assess current data coverage
        coverage = await self._assess_coverage(pool)

        # Phase 2: Review recent agent performance
        agent_perf = await self._review_agent_runs(pool)

        # Phase 3: Get prior improvement recommendations
        prior_recs = await self._get_prior_recommendations(pool)

        # Phase 4: Ask Claude to produce strategy
        strategy = await self._generate_strategy(coverage, agent_perf, prior_recs)

        # Phase 5: Optionally run priority agents
        execution_results = {}
        if run_agents:
            execution_results = await self._execute_priority_agents(
                pool, strategy.get("priority_actions", [])
            )

        # Phase 6: Save strategy and recommendations
        result = {
            "coverage": coverage,
            "agent_performance": agent_perf,
            "strategy": strategy,
            "execution_results": execution_results,
        }

        await self.save_analysis(
            pool,
            analysis_type="research_strategy",
            content=result,
        )

        return result

    async def _assess_coverage(self, pool):
        """Compute data coverage percentages across all tables."""
        metrics = {}

        # Companies with verified data
        row = await pool.fetchrow("""
            SELECT COUNT(*) as total,
                   COUNT(*) FILTER (WHERE verified = TRUE) as verified,
                   COUNT(*) FILTER (WHERE confidence >= 0.7) as high_conf,
                   COUNT(*) FILTER (WHERE description IS NOT NULL) as has_desc,
                   COUNT(*) FILTER (WHERE website IS NOT NULL) as has_web
            FROM companies
        """)
        metrics["companies"] = _safe_dict(row)

        # Funding rounds coverage
        row = await pool.fetchrow("""
            SELECT
              (SELECT COUNT(*) FROM companies WHERE funding_m > 0) as funded_companies,
              (SELECT COUNT(DISTINCT company_id) FROM funding_rounds) as with_rounds,
              (SELECT COUNT(*) FROM funding_rounds) as total_rounds
        """)
        metrics["funding_rounds"] = _safe_dict(row)

        # Regional indicators
        row = await pool.fetchrow("""
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT indicator_name) as distinct_indicators,
                   COUNT(DISTINCT state_code) as distinct_states,
                   MIN(period_date) as earliest,
                   MAX(period_date) as latest
            FROM regional_indicators
        """)
        metrics["regional_indicators"] = {
            **dict(row),
            "earliest": str(row["earliest"]) if row["earliest"] else None,
            "latest": str(row["latest"]) if row["latest"] else None,
        }

        # Outcome events
        row = await pool.fetchrow("""
            SELECT COUNT(*) as total,
                   COUNT(*) FILTER (WHERE outcome_type != 'still_operating') as non_trivial,
                   COUNT(*) FILTER (WHERE verified = TRUE) as verified
            FROM outcome_events
        """)
        metrics["outcome_events"] = _safe_dict(row)

        # Treatment assignments
        row = await pool.fetchrow("""
            SELECT COUNT(*) as total,
                   COUNT(DISTINCT treatment_type) as distinct_types,
                   COUNT(*) FILTER (WHERE verified = TRUE) as verified
            FROM treatment_assignments
        """)
        metrics["treatment_assignments"] = _safe_dict(row)

        # Graph health
        row = await pool.fetchrow("""
            SELECT COUNT(*) as edges,
                   COUNT(DISTINCT source_id) as sources,
                   COUNT(DISTINCT target_id) as targets,
                   COUNT(*) FILTER (WHERE confidence >= 0.7) as high_conf
            FROM graph_edges
        """)
        metrics["graph"] = _safe_dict(row)

        # Entity registry
        row = await pool.fetchrow("""
            SELECT COUNT(*) as total,
                   COUNT(*) FILTER (WHERE verified = TRUE) as verified,
                   COUNT(DISTINCT entity_type) as entity_types
            FROM entity_registry WHERE merged_into IS NULL
        """)
        metrics["entity_registry"] = _safe_dict(row)

        # Model outputs
        row = await pool.fetchrow(
            "SELECT COUNT(*) as total FROM model_outputs"
        )
        metrics["model_outputs"] = _safe_dict(row)

        return metrics

    async def _review_agent_runs(self, pool):
        """Review last 7 days of agent runs."""
        rows = await pool.fetch("""
            SELECT agent_name, status, COUNT(*) as runs,
                   AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_seconds
            FROM agent_runs
            WHERE started_at > NOW() - INTERVAL '7 days'
            GROUP BY agent_name, status
            ORDER BY agent_name, status
        """)
        return [_safe_dict(r) for r in rows]

    async def _get_prior_recommendations(self, pool):
        """Fetch most recent research strategy recommendations."""
        row = await pool.fetchrow("""
            SELECT content FROM analysis_results
            WHERE analysis_type = 'research_strategy'
            ORDER BY created_at DESC LIMIT 1
        """)
        if not row:
            return []
        content = row["content"] if isinstance(row["content"], dict) else json.loads(row["content"])
        strategy = content.get("strategy", {})
        return strategy.get("improvement_recommendations", [])

    async def _generate_strategy(self, coverage, agent_perf, prior_recs):
        """Use Claude to analyze coverage and produce research strategy."""
        user_prompt = f"""Assess the current data coverage and produce a research strategy.

## Current Coverage
{json.dumps(coverage, indent=2, default=str)}

## Recent Agent Performance (last 7 days)
{json.dumps(agent_perf, indent=2, default=str)}

## Prior Improvement Recommendations
{json.dumps(prior_recs[:5], indent=2, default=str) if prior_recs else "None — this is the first run."}

Based on this data:
1. Calculate coverage percentages for each data category
2. Identify the 5 highest-priority actions to improve coverage
3. Suggest 3 improvements to data collection methodology
4. Recommend any new free public data sources we should explore
5. For each recommendation, verify it's TOS-compliant"""

        response = self.call_claude_with_tools(
            SYSTEM_PROMPT,
            user_prompt,
            tools=[STRATEGY_TOOL],
            max_tokens=4096,
        )

        for block in response.content:
            if block.type == "tool_use" and block.name == "research_strategy":
                return block.input

        return {"error": "Claude did not produce structured strategy"}

    async def _execute_priority_agents(self, pool, actions):
        """Run the highest-priority agents identified by the strategy."""
        from ..orchestration.runner import run_agent, AGENT_REGISTRY

        results = {}
        agent_map = {
            "regional_indicators": "regional_data_ingestor",
            "funding_rounds": "funding_round_ingestor",
            "companies": "systematic_enricher",
            "graph_edges": "relationship_mapper",
            "entity_registry": "fact_verifier",
        }

        for action in actions[:3]:  # Run top 3 priorities only
            target = action.get("target_table", "")
            agent_name = action.get("agent") or agent_map.get(target)

            if not agent_name or agent_name not in AGENT_REGISTRY:
                continue

            try:
                result = await run_agent(agent_name, limit=25)
                results[agent_name] = str(result)[:500]
            except Exception as e:
                results[agent_name] = f"error: {str(e)[:200]}"

        return results
