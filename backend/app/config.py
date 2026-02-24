"""
BBI Backend Configuration — loads from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://bbi:bbi_dev_2024@localhost:5432/bbi"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:4173"

    # API keys
    anthropic_api_key: Optional[str] = None
    news_api_key: Optional[str] = None
    serp_api_key: Optional[str] = None

    # Agent limits
    agent_max_searches_per_run: int = 20
    agent_max_cost_per_run: float = 2.0  # USD
    agent_verify_batch_size: int = 10
    agent_enrich_batch_size: int = 5

    # Confidence thresholds
    confidence_auto_approve: float = 0.85
    confidence_review_threshold: float = 0.60

    # Seed data path (mounted from frontend)
    seed_data_path: str = "/app/seed_data"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
