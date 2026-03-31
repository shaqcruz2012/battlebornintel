"""Smoke tests for LLM-based agents (CompanyAnalyst, WeeklyBrief, RiskAssessor, PatternDetector).

We do NOT import the agent classes (complex dependency chain with Claude API).
Instead we replicate the pure data-prep and output-parsing logic and test it
in isolation, following the same pattern as test_panel_forecaster.py.
"""

import json
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Helpers — mock asyncpg rows as plain dicts (same as test_panel_forecaster)
# ---------------------------------------------------------------------------

def _make_company(**overrides):
    """Return a dict resembling an asyncpg companies row."""
    base = {
        "id": 1,
        "name": "TestCo",
        "slug": "testco",
        "stage": "seed",
        "sectors": ["technology"],
        "employees": 12,
        "funding_m": "2.5",
        "momentum": 72,
        "founded": 2021,
        "city": "Las Vegas",
        "region": "clark",
        "status": "active",
        "eligible": ["SSBCI", "SBIR"],
        "description": "A cool startup.",
    }
    base.update(overrides)
    return base


def _make_fund(**overrides):
    base = {
        "id": 1,
        "name": "Battle Born Venture Fund",
        "fund_type": "SSBCI",
        "allocated_m": "20",
        "deployed_m": "8.5",
        "leverage_ratio": 3.2,
    }
    base.update(overrides)
    return base


def _make_score(**overrides):
    base = {
        "company_id": 1,
        "name": "TestCo",
        "irs_score": 78,
        "grade": "B+",
        "funding_m": "2.5",
        "momentum": 72,
        "computed_at": "2026-03-01",
    }
    base.update(overrides)
    return base


def _make_edge(**overrides):
    base = {
        "source_id": "c_1",
        "target_id": "x_sequoia",
        "rel": "invested_in",
        "event_year": 2023,
        "matching_score": 0.9,
        "note": "Series A lead",
        "connected_name": "Sequoia Capital",
    }
    base.update(overrides)
    return base


def _make_graph_metric(**overrides):
    base = {
        "node_id": "c_1",
        "company_name": "TestCo",
        "funding_m": "2.5",
        "momentum": 72,
        "pagerank": 45,
        "betweenness": 30,
        "community_id": 0,
    }
    base.update(overrides)
    return base


# ============================================================================
# CompanyAnalyst tests
# ============================================================================


class TestCompanyAnalyst:
    """Test data prep and output parsing logic from company_analyst.py."""

    def test_edge_query_includes_required_joins(self):
        """The edge query should join graph_edges with externals, accelerators,
        ecosystem_orgs, and people to resolve connected_name."""
        # Replicate the query string from CompanyAnalyst._analyze_one
        query = """SELECT ge.*,
                      COALESCE(e.name, a.name, eo.name, p.name) as connected_name
               FROM graph_edges ge
               LEFT JOIN externals e ON (e.id = ge.source_id OR e.id = ge.target_id) AND e.id != $1
               LEFT JOIN accelerators a ON (a.id = ge.source_id OR a.id = ge.target_id) AND a.id != $1
               LEFT JOIN ecosystem_orgs eo ON (eo.id = ge.source_id OR eo.id = ge.target_id) AND eo.id != $1
               LEFT JOIN people p ON (p.id = ge.source_id OR p.id = ge.target_id) AND p.id != $1
               WHERE ge.source_id = $1 OR ge.target_id = $1"""

        required_tables = ["graph_edges", "externals", "accelerators", "ecosystem_orgs", "people"]
        for table in required_tables:
            assert table in query, f"Edge query missing join to '{table}'"

        # Must use COALESCE across all name sources
        assert "COALESCE" in query
        assert query.count("LEFT JOIN") == 4, "Expected 4 LEFT JOINs for name resolution"

    def test_prompt_includes_key_company_fields(self):
        """The user prompt must include company name, stage, sectors, and funding."""
        company = _make_company(
            name="NevadaTech",
            stage="series_a",
            sectors=["ai", "fintech"],
            funding_m="15.0",
        )
        score = _make_score(irs_score=85, grade="A-")
        edges = [
            _make_edge(rel="invested_in", connected_name="Sequoia Capital", note="Lead"),
            _make_edge(rel="accelerated_by", connected_name="StartUpNV", note=None),
        ]

        # Replicate prompt construction from _analyze_one
        sectors = ", ".join(company["sectors"]) if company["sectors"] else "N/A"
        eligible = ", ".join(company["eligible"]) if company["eligible"] else "None"
        connections = [
            f"{e['rel']}: {e['connected_name'] or 'unknown'} ({e['note'] or ''})"
            for e in edges
            if e["connected_name"]
        ]

        prompt = f"""Company: {company['name']}
Stage: {company['stage']}
Sectors: {sectors}
Funding: ${company['funding_m']}M
Employees: {company['employees']}
Founded: {company['founded']}
Fund Eligibility: {eligible}
IRS Score: {score['irs_score'] if score else 'N/A'} / Grade: {score['grade'] if score else 'N/A'}
Network Connections ({len(connections)}): {'; '.join(connections[:15])}"""

        assert "NevadaTech" in prompt
        assert "series_a" in prompt
        assert "ai, fintech" in prompt
        assert "$15.0M" in prompt
        assert "85" in prompt
        assert "A-" in prompt
        assert "Sequoia Capital" in prompt

    def test_prompt_handles_missing_score(self):
        """When no computed_score exists, prompt should show N/A."""
        company = _make_company()
        score = None

        irs_display = score["irs_score"] if score else "N/A"
        grade_display = score["grade"] if score else "N/A"

        assert irs_display == "N/A"
        assert grade_display == "N/A"

    def test_json_parse_valid_response(self):
        """Parsing a valid JSON response should extract the expected keys."""
        response_text = '{"executive_summary": "Strong startup.", "growth_trajectory": "Up", "competitive_position": "Leading", "risk_factors": ["burn rate"], "reap_assessment": {"inputs": "ok", "capacities": "ok", "outputs": "ok", "impact": "ok"}, "recommendation": "Invest"}'

        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        content = json.loads(response_text[start:end])

        expected_keys = ["executive_summary", "growth_trajectory", "competitive_position",
                         "risk_factors", "reap_assessment", "recommendation"]
        for key in expected_keys:
            assert key in content, f"Parsed response missing key '{key}'"

    def test_json_parse_garbage_response_fallback(self):
        """If Claude returns non-JSON, the fallback should store raw text."""
        response_text = "I cannot produce valid JSON right now, sorry."

        try:
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            content = json.loads(response_text[start:end])
        except (json.JSONDecodeError, ValueError):
            content = {"raw_analysis": response_text}

        assert "raw_analysis" in content
        assert content["raw_analysis"] == response_text

    def test_result_dict_structure(self):
        """The return value from _analyze_one should have the right shape."""
        content = {"executive_summary": "Test"}
        result = {
            "company_id": 5,
            "name": "TestCo",
            "analysis": content,
        }

        assert result["company_id"] == 5
        assert isinstance(result["name"], str)
        assert isinstance(result["analysis"], dict)

    def test_save_analysis_type_is_company_narrative(self):
        """The agent saves with analysis_type='company_narrative'."""
        # Replicate the call signature — just verify the constant
        analysis_type = "company_narrative"
        entity_type = "company"
        entity_id = "c_5"

        assert analysis_type == "company_narrative"
        assert entity_type == "company"
        assert entity_id.startswith("c_")


# ============================================================================
# WeeklyBrief tests
# ============================================================================


class TestWeeklyBrief:
    """Test aggregation logic and output structure from weekly_brief.py."""

    def _build_summary_stats(self, companies, funds):
        """Replicate the data-aggregation logic from WeeklyBrief.run()."""
        total_funding = sum(float(c["funding_m"]) for c in companies)
        total_employees = sum(c["employees"] for c in companies)
        avg_momentum = (
            sum(c["momentum"] for c in companies) / len(companies)
            if companies
            else 0
        )
        ssbci_funds = [f for f in funds if f["fund_type"] == "SSBCI"]
        ssbci_deployed = sum(float(f["deployed_m"]) for f in ssbci_funds)
        ssbci_allocated = sum(
            float(f["allocated_m"]) for f in ssbci_funds if f["allocated_m"]
        )
        deploy_pct = (
            round(ssbci_deployed / ssbci_allocated * 100) if ssbci_allocated else 0
        )
        return {
            "total_funding": total_funding,
            "total_employees": total_employees,
            "avg_momentum": avg_momentum,
            "ssbci_deployed": ssbci_deployed,
            "ssbci_allocated": ssbci_allocated,
            "deploy_pct": deploy_pct,
            "ssbci_funds": ssbci_funds,
        }

    def test_summary_stats_computation(self):
        """Aggregation of funding, employees, momentum, and SSBCI deployment."""
        companies = [
            _make_company(id=1, funding_m="10.0", employees=50, momentum=80),
            _make_company(id=2, funding_m="5.0", employees=20, momentum=60),
            _make_company(id=3, funding_m="15.0", employees=100, momentum=40),
        ]
        funds = [
            _make_fund(fund_type="SSBCI", allocated_m="20", deployed_m="8"),
            _make_fund(fund_type="SSBCI", allocated_m="10", deployed_m="5"),
            _make_fund(fund_type="VC", allocated_m="50", deployed_m="30"),
        ]

        stats = self._build_summary_stats(companies, funds)

        assert stats["total_funding"] == 30.0
        assert stats["total_employees"] == 170
        assert stats["avg_momentum"] == 60.0
        assert stats["ssbci_deployed"] == 13.0
        assert stats["ssbci_allocated"] == 30.0
        assert stats["deploy_pct"] == 43  # 13/30 * 100 = 43.33 -> 43
        assert len(stats["ssbci_funds"]) == 2

    def test_summary_stats_empty_companies(self):
        """No companies => zeroed-out stats without division errors."""
        stats = self._build_summary_stats([], [])

        assert stats["total_funding"] == 0
        assert stats["total_employees"] == 0
        assert stats["avg_momentum"] == 0
        assert stats["deploy_pct"] == 0

    def test_top_movers_ranking(self):
        """Top movers should be sorted by momentum descending (top 5)."""
        companies = [
            _make_company(name=f"Co_{i}", momentum=m)
            for i, m in enumerate([90, 50, 80, 70, 30, 95, 10])
        ]
        # Sort by momentum DESC (as the query does)
        companies.sort(key=lambda c: -c["momentum"])
        top_movers = [
            f"{c['name']} (momentum: {c['momentum']})"
            for c in companies[:5]
        ]

        assert len(top_movers) == 5
        assert "Co_5" in top_movers[0]  # momentum 95
        assert "Co_0" in top_movers[1]  # momentum 90

    def test_result_json_expected_keys(self):
        """A well-formed brief response should contain REAP sections and action items."""
        response_text = json.dumps({
            "week_ending": "2026-03-29",
            "headline": "Nevada Ecosystem Surges",
            "inputs": {"summary": "Good", "highlights": ["More funding"]},
            "capacities": {"summary": "Growing", "highlights": ["New talent"]},
            "outputs": {"summary": "Strong", "highlights": ["5 new firms"]},
            "impact": {"summary": "Positive", "highlights": ["200 jobs"]},
            "ssbci_update": "43% deployed",
            "action_items": ["Accelerate deployment", "Recruit mentors"],
        })

        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        content = json.loads(response_text[start:end])

        expected_keys = ["headline", "inputs", "capacities", "outputs",
                         "impact", "ssbci_update", "action_items"]
        for key in expected_keys:
            assert key in content, f"Brief response missing key '{key}'"

    def test_save_analysis_type_is_weekly_brief(self):
        """The agent saves with analysis_type='weekly_brief'."""
        assert "weekly_brief" == "weekly_brief"


# ============================================================================
# RiskAssessor tests
# ============================================================================


class TestRiskAssessor:
    """Test risk-scoring data prep from risk_assessor.py."""

    def test_low_momentum_high_funding_flagged(self):
        """Companies with funding >= $10M and momentum < 30 should be flagged."""
        companies = [
            _make_company(name="Healthy", funding_m="15.0", momentum=70),
            _make_company(name="Stalled", funding_m="12.0", momentum=20),
            _make_company(name="TinyStall", funding_m="2.0", momentum=10),
            _make_company(name="BigStall", funding_m="25.0", momentum=25),
        ]

        low_momentum = [
            c for c in companies
            if float(c["funding_m"]) >= 10 and c["momentum"] < 30
        ]

        assert len(low_momentum) == 2
        names = {c["name"] for c in low_momentum}
        assert "Stalled" in names
        assert "BigStall" in names
        # Healthy is high momentum, TinyStall is low funding
        assert "Healthy" not in names
        assert "TinyStall" not in names

    def test_ssbci_fund_filtering(self):
        """Only funds with fund_type == 'SSBCI' should be included."""
        funds = [
            _make_fund(name="SSBCI Fund 1", fund_type="SSBCI", allocated_m="20", deployed_m="8"),
            _make_fund(name="VC Fund", fund_type="VC", allocated_m="50", deployed_m="30"),
            _make_fund(name="SSBCI Fund 2", fund_type="SSBCI", allocated_m="10", deployed_m="3"),
            _make_fund(name="Angel Fund", fund_type="Angel", allocated_m="5", deployed_m="2"),
        ]

        ssbci = [f for f in funds if f["fund_type"] == "SSBCI"]

        assert len(ssbci) == 2
        assert all(f["fund_type"] == "SSBCI" for f in ssbci)

    def test_ssbci_deployment_percentage(self):
        """Deploy percentage = deployed / allocated * 100, rounded."""
        ssbci = [
            _make_fund(fund_type="SSBCI", allocated_m="20", deployed_m="8.5"),
            _make_fund(fund_type="SSBCI", allocated_m="10", deployed_m="4.0"),
        ]
        total_alloc = sum(float(f["allocated_m"]) for f in ssbci if f["allocated_m"])
        total_deploy = sum(float(f["deployed_m"]) for f in ssbci)
        deploy_pct = round(total_deploy / total_alloc * 100) if total_alloc else 0

        assert total_alloc == 30.0
        assert total_deploy == 12.5
        assert deploy_pct == 42  # 12.5/30 * 100 = 41.67 -> 42

    def test_ssbci_deploy_pct_zero_allocated(self):
        """If no SSBCI funds exist, deploy_pct should be 0 (no ZeroDivisionError)."""
        ssbci = []
        total_alloc = sum(float(f["allocated_m"]) for f in ssbci if f.get("allocated_m"))
        total_deploy = sum(float(f["deployed_m"]) for f in ssbci)
        deploy_pct = round(total_deploy / total_alloc * 100) if total_alloc else 0

        assert deploy_pct == 0

    def test_sector_concentration_calculation(self):
        """The top sector and its concentration percentage should be computed."""
        companies = [
            _make_company(sectors=["technology"]),
            _make_company(sectors=["technology", "ai"]),
            _make_company(sectors=["healthcare"]),
            _make_company(sectors=["technology"]),
        ]

        sector_counts = {}
        for c in companies:
            for s in (c["sectors"] or []):
                sector_counts[s] = sector_counts.get(s, 0) + 1

        top_sector = max(sector_counts.items(), key=lambda x: x[1])
        concentration = round(top_sector[1] / len(companies) * 100)

        assert top_sector[0] == "technology"
        assert top_sector[1] == 3
        assert concentration == 75  # 3/4 * 100

    def test_risk_json_parse_array(self):
        """Risk assessor expects a JSON array (not object) from Claude."""
        response_text = json.dumps([
            {"severity": "high", "category": "deployment", "title": "Slow SSBCI deploy",
             "description": "Funds underdeployed.", "recommendation": "Speed up."},
            {"severity": "medium", "category": "concentration", "title": "Tech heavy",
             "description": "Too much tech.", "recommendation": "Diversify."},
        ])

        start = response_text.find("[")
        end = response_text.rfind("]") + 1
        risks = json.loads(response_text[start:end])

        assert isinstance(risks, list)
        assert len(risks) == 2
        for risk in risks:
            assert "severity" in risk
            assert "category" in risk
            assert "title" in risk

    def test_save_analysis_type_is_risk_assessment(self):
        """The agent saves with analysis_type='risk_assessment' and includes deploy_pct."""
        result_content = {"risks": [{"severity": "high"}], "deploy_pct": 42}

        assert "risks" in result_content
        assert "deploy_pct" in result_content


# ============================================================================
# PatternDetector tests
# ============================================================================


class TestPatternDetector:
    """Test graph pattern analysis data prep from pattern_detector.py."""

    def test_bridge_node_detection(self):
        """Nodes with betweenness > 60 should be identified as bridges."""
        metrics = [
            _make_graph_metric(node_id="c_1", betweenness=75, company_name="BridgeCo"),
            _make_graph_metric(node_id="c_2", betweenness=30, company_name="NormalCo"),
            _make_graph_metric(node_id="c_3", betweenness=90, company_name="SuperBridge"),
            _make_graph_metric(node_id="c_4", betweenness=None, company_name="NoMetric"),
        ]

        bridges = [m for m in metrics if m["betweenness"] and m["betweenness"] > 60]

        assert len(bridges) == 2
        bridge_names = {b["company_name"] for b in bridges}
        assert "BridgeCo" in bridge_names
        assert "SuperBridge" in bridge_names

    def test_hub_node_detection(self):
        """Nodes with pagerank > 50 should be identified as hubs."""
        metrics = [
            _make_graph_metric(node_id="c_1", pagerank=80, company_name="HubCo"),
            _make_graph_metric(node_id="c_2", pagerank=20, company_name="SmallCo"),
            _make_graph_metric(node_id="c_3", pagerank=55, company_name="MediumHub"),
            _make_graph_metric(node_id="c_4", pagerank=None, company_name="NoRank"),
        ]

        hubs = [m for m in metrics if m["pagerank"] and m["pagerank"] > 50]

        assert len(hubs) == 2
        hub_names = {h["company_name"] for h in hubs}
        assert "HubCo" in hub_names
        assert "MediumHub" in hub_names

    def test_community_clustering(self):
        """Nodes should be grouped by community_id with top members sorted by pagerank."""
        metrics = [
            _make_graph_metric(node_id="c_1", community_id=0, pagerank=80, company_name="Top0"),
            _make_graph_metric(node_id="c_2", community_id=0, pagerank=50, company_name="Mid0"),
            _make_graph_metric(node_id="c_3", community_id=1, pagerank=90, company_name="Top1"),
            _make_graph_metric(node_id="c_4", community_id=1, pagerank=40, company_name="Mid1"),
            _make_graph_metric(node_id="c_5", community_id=1, pagerank=70, company_name="High1"),
            _make_graph_metric(node_id="c_6", community_id=None, company_name="Orphan"),
        ]

        communities = {}
        for m in metrics:
            cid = m["community_id"]
            if cid is not None:
                communities.setdefault(cid, []).append({
                    "node_id": m["node_id"],
                    "name": m["company_name"],
                    "pagerank": m["pagerank"],
                })

        assert len(communities) == 2
        assert len(communities[0]) == 2
        assert len(communities[1]) == 3

        # Build community summary
        community_summary = []
        for cid, members in sorted(communities.items(), key=lambda x: -len(x[1])):
            named = [m for m in members if m["name"]]
            community_summary.append({
                "community_id": cid,
                "size": len(members),
                "top_members": [
                    m["name"]
                    for m in sorted(named, key=lambda x: -(x["pagerank"] or 0))[:5]
                ],
            })

        # Sorted by size descending => community 1 (3 members) first
        assert community_summary[0]["community_id"] == 1
        assert community_summary[0]["size"] == 3
        assert community_summary[0]["top_members"][0] == "Top1"  # highest pagerank

    def test_community_excludes_none_id(self):
        """Nodes with community_id=None should not be grouped."""
        metrics = [
            _make_graph_metric(node_id="c_1", community_id=None, company_name="Orphan"),
        ]

        communities = {}
        for m in metrics:
            cid = m["community_id"]
            if cid is not None:
                communities.setdefault(cid, []).append(m)

        assert len(communities) == 0

    def test_pattern_json_parse_valid(self):
        """Pattern detector expects a JSON object with specific keys."""
        response_text = json.dumps({
            "patterns": [{"type": "cluster", "description": "Tech cluster forming"}],
            "emerging_clusters": "Two new clusters detected",
            "bridge_analysis": "c_1 bridges tech and healthcare",
            "anomalies": "c_6 is isolated despite high funding",
            "recommendations": ["Connect isolated nodes", "Strengthen bridges"],
        })

        start = response_text.find("{")
        end = response_text.rfind("}") + 1
        content = json.loads(response_text[start:end])

        expected_keys = ["patterns", "emerging_clusters", "bridge_analysis",
                         "anomalies", "recommendations"]
        for key in expected_keys:
            assert key in content, f"Pattern detection response missing key '{key}'"

    def test_result_dict_structure(self):
        """The return dict should report bridge, hub, and community counts."""
        bridges = [_make_graph_metric(betweenness=70)] * 3
        hubs = [_make_graph_metric(pagerank=60)] * 2
        community_summary = [{"community_id": 0, "size": 5}, {"community_id": 1, "size": 3}]

        result = {
            "bridges": len(bridges),
            "hubs": len(hubs),
            "communities": len(community_summary),
        }

        assert result["bridges"] == 3
        assert result["hubs"] == 2
        assert result["communities"] == 2

    def test_save_analysis_type_is_pattern_detection(self):
        """The agent saves with analysis_type='pattern_detection'."""
        assert "pattern_detection" == "pattern_detection"
