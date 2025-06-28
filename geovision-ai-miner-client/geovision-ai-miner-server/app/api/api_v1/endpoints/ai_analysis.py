"""
AI Analysis API Endpoints (webhook-enabled)
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, status, Depends, Request
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from uuid import uuid4
import logging

from app.services.ai_agents import ai_agent_service, AIProvider, AnalysisType
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

class AIAnalysisRequest(BaseModel):
    analysis_type: AnalysisType = Field(..., description="Type of analysis: geological, geochemical, geophysical, integrated")
    data: Dict[str, Any] = Field(..., description="Input data for analysis")
    provider: AIProvider = Field(AIProvider.OPENAI, description="AI agent provider")
    context: Optional[str] = Field(None, description="Additional context for the analysis")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for async result delivery")
    max_tokens: Optional[int] = Field(None, description="Max tokens for LLM response")
    temperature: Optional[float] = Field(None, description="LLM temperature")

class AIAnalysisResponse(BaseModel):
    request_id: str
    status: str
    message: str
    webhook_url: Optional[str] = None

@router.post("/analysis", response_model=AIAnalysisResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_ai_analysis(
    request: AIAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Submit an AI-powered analysis job (webhook-enabled)."""
    request_id = str(uuid4())
    logger.info(f"Received AI analysis request {request_id} from user {current_user.email}")

    # Launch background task
    background_tasks.add_task(
        run_ai_analysis_task,
        request_id,
        request.analysis_type,
        request.data,
        request.provider,
        request.context,
        request.webhook_url,
        request.max_tokens,
        request.temperature
    )

    return AIAnalysisResponse(
        request_id=request_id,
        status="processing",
        message="AI analysis job accepted and processing in background.",
        webhook_url=request.webhook_url
    )

async def run_ai_analysis_task(
    request_id: str,
    analysis_type: AnalysisType,
    data: Dict[str, Any],
    provider: AIProvider,
    context: Optional[str],
    webhook_url: Optional[str],
    max_tokens: Optional[int],
    temperature: Optional[float]
):
    """Background task to run AI analysis and deliver result via webhook."""
    try:
        # Call the AI agent service
        result = await ai_agent_service._process_analysis(
            ai_agent_service.AIAgentRequest(
                analysis_type=analysis_type,
                data=data,
                context=context,
                provider=provider,
                max_tokens=max_tokens,
                temperature=temperature,
                webhook_url=webhook_url
            )
        )
        logger.info(f"AI analysis {request_id} completed, result delivered via webhook.")
    except Exception as e:
        logger.error(f"AI analysis {request_id} failed: {e}")
        # Optionally, send failure webhook here
        if webhook_url:
            from app.services.ai_agents import WebhookPayload
            import httpx
            payload = WebhookPayload(
                request_id=request_id,
                status="failed",
                error=str(e),
                timestamp=None
            )
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(webhook_url, json=payload.dict())
            except Exception as ex:
                logger.error(f"Failed to deliver failure webhook for {request_id}: {ex}") 