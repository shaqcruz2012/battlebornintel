import asyncio

from .base_agent import BaseAgent
from .utils import extract_json, load_prompt, batch_async


_SYSTEM_PROMPT_FALLBACK = """You are an expert startup ecosystem analyst for the Nevada (Battle Born) startup ecosystem.
You produce concise, data-driven company analyses for government economic development stakeholders.

Your analysis should follow the MIT REAP framework dimensions:
- Inputs: capital, talent, infrastructure
- Capacities: innovation, entrepreneurship, risk capital
- Outputs: new firms, jobs, patents, products
- Impact: economic growth, GDP contribution, cluster effects

You have access to enrichment data including:
- IP & patents (patent_count, ip_moat_score)
- Financial metrics (revenue, valuation, federal R&D funding)
- Market positioning (TAM, competitor count)
- Team quality (founder experience years, capital magnet score)
- Network centrality (PageRank, betweenness, community assignment)

Integrate enrichment data into your analysis when available. Reference specific
metrics to support your assessments. Be specific with numbers. Be direct.
No fluff. Output valid JSON."""

_ENRICHMENT_METRICS = [
    "patent_count",
    "ip_moat_score",
    "federal_rd_funding",
    "tam_b",
    "revenue_m",
    "valuation_m",
    "founder_experience_years",
    "capital_magnet_score",
    "competitor_count",
]


class CompanyAnalyst(BaseAgent):
    """Generates AI-powered company narratives and analysis."""

    def __init__(self):
        super().__init__("company_analyst")

    async def run(self, pool, company_id: int | None = None):
        if company_id is not None:
            return await self._analyze_one(pool, company_id)
        else:
            # Analyze all companies
            rows = await pool.fetch("SELECT id FROM companies ORDER BY id")
            results = await batch_async(
                lambda row: self._analyze_one(pool, row["id"]),
                rows,
                max_concurrency=3,
            )
            return {"analyzed": len(results)}

    async def _fetch_enrichment_metrics(self, pool, node_id: str) -> dict:
        """Fetch latest T-GNN enrichment metrics from metric_snapshots."""
        rows = await pool.fetch(
            """SELECT DISTINCT ON (metric_name) metric_name, value
               FROM metric_snapshots
               WHERE entity_type = 'company' AND entity_id = $1
                 AND metric_name = ANY($2)
               ORDER BY metric_name, period_end DESC""",
            node_id,
            _ENRICHMENT_METRICS,
        )
        return {r["metric_name"]: r["value"] for r in rows}

    async def _fetch_graph_centrality(self, pool, node_id: str) -> dict | None:
        """Fetch latest graph centrality metrics from graph_metrics_cache."""
        row = await pool.fetchrow(
            """SELECT pagerank, betweenness, community_id
               FROM graph_metrics_cache WHERE node_id = $1
               ORDER BY computed_at DESC LIMIT 1""",
            node_id,
        )
        return dict(row) if row else None

    @staticmethod
    def _format_enrichment_block(metrics: dict, centrality: dict | None) -> str:
        """Format enrichment data into a prompt section."""
        lines = []

        # Enrichment data section
        enrichment_parts = []
        patents = metrics.get("patent_count")
        ip_moat = metrics.get("ip_moat_score")
        if patents is not None or ip_moat is not None:
            p_str = f"{int(patents)}" if patents is not None else "N/A"
            ip_str = f"{ip_moat:.0f}/100" if ip_moat is not None else "N/A"
            enrichment_parts.append(f"- Patents: {p_str} (IP moat: {ip_str})")

        fed_rd = metrics.get("federal_rd_funding")
        if fed_rd is not None:
            enrichment_parts.append(f"- Federal R&D: ${fed_rd:.0f}k")

        tam = metrics.get("tam_b")
        competitors = metrics.get("competitor_count")
        if tam is not None or competitors is not None:
            tam_str = f"TAM ${tam:.1f}B" if tam is not None else "TAM N/A"
            comp_str = f"{int(competitors)} competitors" if competitors is not None else ""
            market_parts = [tam_str]
            if comp_str:
                market_parts.append(comp_str)
            enrichment_parts.append(f"- Market: {', '.join(market_parts)}")

        rev = metrics.get("revenue_m")
        val = metrics.get("valuation_m")
        if rev is not None or val is not None:
            rev_str = f"${rev:.1f}M" if rev is not None else "N/A"
            val_str = f"${val:.1f}M" if val is not None else "N/A"
            enrichment_parts.append(f"- Revenue: {rev_str}, Valuation: {val_str}")

        founder_exp = metrics.get("founder_experience_years")
        cap_magnet = metrics.get("capital_magnet_score")
        if founder_exp is not None or cap_magnet is not None:
            parts = []
            if founder_exp is not None:
                parts.append(f"{founder_exp:.0f} years founder experience")
            if cap_magnet is not None:
                parts.append(f"capital magnet {cap_magnet:.0f}/100")
            enrichment_parts.append(f"- Team: {', '.join(parts)}")

        if enrichment_parts:
            lines.append("\nENRICHMENT DATA:")
            lines.extend(enrichment_parts)

        # Network position section
        if centrality:
            lines.append("\nNETWORK POSITION:")
            pr = centrality.get("pagerank")
            if pr is not None:
                lines.append(f"- PageRank: {pr:.6f}")
            bt = centrality.get("betweenness")
            if bt is not None:
                lines.append(f"- Betweenness: {bt:.6f} (bridge role)")
            comm = centrality.get("community_id")
            if comm is not None:
                lines.append(f"- Community: #{comm}")

        return "\n".join(lines) if lines else ""

    async def _analyze_one(self, pool, company_id: int):
        company = await pool.fetchrow(
            "SELECT id, name, stage, sectors, city, region, funding_m, employees, founded, description, eligible FROM companies WHERE id = $1", company_id
        )
        if not company:
            raise ValueError(f"Company {company_id} not found")

        node_id = f"c_{company_id}"
        edges, score, enrichment, centrality = await asyncio.gather(
            pool.fetch(
                """SELECT ge.rel, ge.note,
                          COALESCE(e.name, a.name, eo.name, p.name) as connected_name
                   FROM graph_edges ge
                   LEFT JOIN externals e ON (e.id = ge.source_id OR e.id = ge.target_id) AND e.id != $1
                   LEFT JOIN accelerators a ON (a.id = ge.source_id OR a.id = ge.target_id) AND a.id != $1
                   LEFT JOIN ecosystem_orgs eo ON (eo.id = ge.source_id OR eo.id = ge.target_id) AND eo.id != $1
                   LEFT JOIN people p ON (p.id = ge.source_id OR p.id = ge.target_id) AND p.id != $1
                   WHERE ge.source_id = $1 OR ge.target_id = $1""",
                node_id,
            ),
            pool.fetchrow(
                """SELECT irs_score, grade FROM computed_scores
                   WHERE company_id = $1 ORDER BY computed_at DESC LIMIT 1""",
                company_id,
            ),
            self._fetch_enrichment_metrics(pool, node_id),
            self._fetch_graph_centrality(pool, node_id),
        )
        enrichment_block = self._format_enrichment_block(enrichment, centrality)

        sectors = ", ".join(company["sectors"]) if company["sectors"] else "N/A"
        eligible = ", ".join(company["eligible"]) if company["eligible"] else "None"
        connections = [
            f"{e['rel']}: {e['connected_name'] or 'unknown'} ({e['note'] or ''})"
            for e in edges
            if e["connected_name"]
        ]

        user_prompt = f"""Analyze this Nevada startup company:

Company: {company['name']}
Stage: {company['stage']}
Sectors: {sectors}
City: {company['city']}, Region: {company['region']}
Funding: ${company['funding_m']}M
Employees: {company['employees']}
Founded: {company['founded']}
Description: {company['description'] or 'N/A'}
Fund Eligibility: {eligible}
IRS Score: {score['irs_score'] if score else 'N/A'} / Grade: {score['grade'] if score else 'N/A'}
Network Connections ({len(connections)}): {'; '.join(connections[:15])}
{enrichment_block}

Return JSON with these keys:
- "executive_summary": 2-3 sentence overview
- "growth_trajectory": assessment of growth path and stage progression
- "competitive_position": how they sit in the NV and national landscape
- "risk_factors": top 2-3 risks
- "reap_assessment": object with keys "inputs", "capacities", "outputs", "impact" (1 sentence each)
- "recommendation": one-line investment/support recommendation"""

        system_prompt = load_prompt("company_analyst") or _SYSTEM_PROMPT_FALLBACK
        response_text = await self.call_claude(system_prompt, user_prompt)

        content = extract_json(response_text)
        if content is None:
            content = {"raw_analysis": response_text}

        await self.save_analysis(
            pool,
            analysis_type="company_narrative",
            content=content,
            entity_type="company",
            entity_id=node_id,
        )

        return {"company_id": company_id, "name": company["name"], "analysis": content}
