"""Pydantic models for agent input/output validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AgentRunRecord(BaseModel):
    id: int
    agent_name: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    input_params: Optional[dict] = None
    output_summary: Optional[str] = None
    error_message: Optional[str] = None
    records_affected: int = 0


class AnalysisResult(BaseModel):
    id: int
    analysis_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    content: dict
    model_used: Optional[str] = None
    agent_run_id: Optional[int] = None
    created_at: datetime
    expires_at: Optional[datetime] = None


class CompanyAnalysis(BaseModel):
    executive_summary: str
    growth_trajectory: str
    competitive_position: str
    risk_factors: list[str]
    reap_assessment: dict
    recommendation: str


class WeeklyBriefContent(BaseModel):
    week_ending: str
    headline: str
    inputs: dict
    capacities: dict
    outputs: dict
    impact: dict
    ssbci_update: str
    action_items: list[str]


class RiskItem(BaseModel):
    severity: str = Field(pattern=r"^(critical|high|medium|low)$")
    category: str
    title: str
    description: str
    recommendation: str


class ScheduleConfig(BaseModel):
    agent_name: str
    cron: str
    enabled: bool = True
    kwargs: dict = Field(default_factory=dict)
