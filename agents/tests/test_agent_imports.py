"""Test that all agent modules import correctly."""

def test_import_base_agent():
    from src.agents.base_agent import BaseAgent
    assert BaseAgent is not None

def test_import_company_analyst():
    from src.agents.company_analyst import CompanyAnalyst
    assert CompanyAnalyst is not None

def test_import_data_scout():
    from src.agents.data_scout import DataScout
    assert DataScout is not None

def test_import_fact_verifier():
    from src.agents.fact_verifier import FactVerifier
    assert FactVerifier is not None

def test_import_risk_assessor():
    from src.agents.risk_assessor import RiskAssessor
    assert RiskAssessor is not None

def test_import_pattern_detector():
    from src.agents.pattern_detector import PatternDetector
    assert PatternDetector is not None

def test_import_relationship_mapper():
    from src.agents.relationship_mapper import RelationshipMapper
    assert RelationshipMapper is not None

def test_import_systematic_enricher():
    from src.agents.systematic_enricher import SystematicEnricher
    assert SystematicEnricher is not None

def test_import_weekly_brief():
    from src.agents.weekly_brief import WeeklyBrief
    assert WeeklyBrief is not None

def test_import_freshness_checker():
    from src.ingestion.freshness import FreshnessChecker
    assert FreshnessChecker is not None

def test_import_runner():
    from src.orchestration.runner import AGENT_REGISTRY, run_agent
    assert len(AGENT_REGISTRY) >= 8
    assert "systematic_enricher" in AGENT_REGISTRY

def test_import_scheduler():
    from src.orchestration.scheduler import SCHEDULES, create_scheduler
    assert len(SCHEDULES) >= 8

def test_import_rotation():
    from src.orchestration.rotation import get_next_batch, get_rotation_stats
    assert callable(get_next_batch)

def test_import_continuous():
    from src.orchestration.continuous import RESEARCH_CYCLE, run_continuous
    assert len(RESEARCH_CYCLE) >= 6

def test_import_director():
    from src.orchestration.director import ResearchDirector, run_campaign
    assert callable(run_campaign)
