import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://bbi:bbi_dev_password@localhost:5433/battlebornintel",
)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3001")
FRED_API_KEY = os.getenv("FRED_API_KEY", "")
CENSUS_API_KEY = os.getenv("CENSUS_API_KEY", "")
# SEC EDGAR requires no API key (just User-Agent header)
# USPTO PatentsView requires no API key
# NSF NCSES requires no API key
# NV SOS requires no API key

# Validate critical configuration
import logging
_cfg_logger = logging.getLogger(__name__)

if not ANTHROPIC_API_KEY:
    _cfg_logger.warning("ANTHROPIC_API_KEY is not set — LLM agents will fail")
if not DATABASE_URL:
    _cfg_logger.error("DATABASE_URL is not set — all agents will fail")
