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
