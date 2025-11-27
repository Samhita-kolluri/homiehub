from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
import sys

from app.config import settings
from app.agent.LLM.gemini import LLMClientManager
from app.services.tool_regsitry import get_tool_registry

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Application starting...")
    logger.info("Initializing LLM client...")
    LLMClientManager.initialize()
    logger.info("Initializing tool registry...")
    tool_registry = get_tool_registry()
    yield
    tool_registry.shutdown()
    logger.info("Application shutting down...")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="LLM-Agent service",
    lifespan=lifespan
)

@app.get("/")
def root():
    return {"service": "LLM-Agent Service", "version": "1.0.0"}

from app.api import agent_api
app.include_router(agent_api.router)

if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 8080))  # Cloud Run injects this
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
