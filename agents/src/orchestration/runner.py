"""Agent execution with retry logic."""

import traceback

from ..agents.company_analyst import CompanyAnalyst
from ..agents.weekly_brief import WeeklyBrief
from ..agents.risk_assessor import RiskAssessor
from ..agents.pattern_detector import PatternDetector
from ..agents.data_scout import DataScout
from ..agents.fact_verifier import FactVerifier
from ..agents.relationship_mapper import RelationshipMapper
from ..agents.systematic_enricher import SystematicEnricher
from ..agents.schema_auditor import SchemaAuditor
from ..agents.data_quality_analyst import DataQualityAnalyst
from ..agents.graph_integrity_checker import GraphIntegrityChecker
from ..agents.regional_data_ingestor import RegionalDataIngestor
from ..agents.funding_round_ingestor import FundingRoundIngestor
from ..agents.research_director import ResearchDirector
from ..ingestion.freshness import FreshnessChecker

AGENT_REGISTRY = {
    "company_analyst": CompanyAnalyst,
    "weekly_brief": WeeklyBrief,
    "risk_assessor": RiskAssessor,
    "pattern_detector": PatternDetector,
    "freshness_checker": FreshnessChecker,
    "data_scout": DataScout,
    "fact_verifier": FactVerifier,
    "relationship_mapper": RelationshipMapper,
    "systematic_enricher": SystematicEnricher,
    "schema_auditor": SchemaAuditor,
    "data_quality_analyst": DataQualityAnalyst,
    "graph_integrity_checker": GraphIntegrityChecker,
    "regional_data_ingestor": RegionalDataIngestor,
    "funding_round_ingestor": FundingRoundIngestor,
    "research_director": ResearchDirector,
}

MAX_RETRIES = 2


async def run_agent(agent_name: str, retries: int = MAX_RETRIES, **kwargs):
    """Run an agent with retry logic."""
    if agent_name not in AGENT_REGISTRY:
        raise ValueError(f"Unknown agent: {agent_name}")

    agent_cls = AGENT_REGISTRY[agent_name]
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            agent = agent_cls()
            result = await agent.execute(**kwargs)
            print(f"[{agent_name}] completed: {str(result)[:500].encode('ascii', 'replace').decode()}")
            return result
        except Exception as e:
            last_error = e
            print(f"[{agent_name}] attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                print(f"[{agent_name}] retrying...")
            else:
                print(f"[{agent_name}] all retries exhausted")
                traceback.print_exc()

    raise last_error
