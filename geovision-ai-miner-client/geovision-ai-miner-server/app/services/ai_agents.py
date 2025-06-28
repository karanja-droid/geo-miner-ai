"""
AI Agents Service for Geological Analysis

This module provides AI agent services using OpenAI GPT-4, Anthropic Claude,
and Alibaba Qwen for advanced geological, geochemical, and geophysical analysis.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from enum import Enum
import aiohttp
import httpx
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIProvider(str, Enum):
    """AI provider enumeration."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    QWEN = "qwen"


class AnalysisType(str, Enum):
    """Analysis type enumeration."""
    GEOLOGICAL = "geological"
    GEOCHEMICAL = "geochemical"
    GEOPHYSICAL = "geophysical"
    INTEGRATED = "integrated"


class AIAgentRequest(BaseModel):
    """AI agent request model."""
    analysis_type: AnalysisType
    data: Dict[str, Any]
    context: Optional[str] = None
    provider: AIProvider = AIProvider.OPENAI
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    webhook_url: Optional[str] = None


class AIAgentResponse(BaseModel):
    """AI agent response model."""
    request_id: str
    analysis_type: AnalysisType
    provider: AIProvider
    result: Dict[str, Any]
    metadata: Dict[str, Any]
    timestamp: datetime
    processing_time: float


class WebhookPayload(BaseModel):
    """Webhook payload model."""
    request_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime


class AIAgentService:
    """AI Agent Service for geological analysis."""
    
    def __init__(self):
        """Initialize AI agent service."""
        self.session = None
        self._active_requests: Dict[str, asyncio.Task] = {}
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def analyze_geological_data(
        self,
        data: Dict[str, Any],
        provider: AIProvider = AIProvider.OPENAI,
        context: Optional[str] = None,
        webhook_url: Optional[str] = None
    ) -> AIAgentResponse:
        """Analyze geological data using AI agents."""
        request = AIAgentRequest(
            analysis_type=AnalysisType.GEOLOGICAL,
            data=data,
            context=context,
            provider=provider,
            webhook_url=webhook_url
        )
        return await self._process_analysis(request)
    
    async def analyze_geochemical_data(
        self,
        data: Dict[str, Any],
        provider: AIProvider = AIProvider.OPENAI,
        context: Optional[str] = None,
        webhook_url: Optional[str] = None
    ) -> AIAgentResponse:
        """Analyze geochemical data using AI agents."""
        request = AIAgentRequest(
            analysis_type=AnalysisType.GEOCHEMICAL,
            data=data,
            context=context,
            provider=provider,
            webhook_url=webhook_url
        )
        return await self._process_analysis(request)
    
    async def analyze_geophysical_data(
        self,
        data: Dict[str, Any],
        provider: AIProvider = AIProvider.OPENAI,
        context: Optional[str] = None,
        webhook_url: Optional[str] = None
    ) -> AIAgentResponse:
        """Analyze geophysical data using AI agents."""
        request = AIAgentRequest(
            analysis_type=AnalysisType.GEOPHYSICAL,
            data=data,
            context=context,
            provider=provider,
            webhook_url=webhook_url
        )
        return await self._process_analysis(request)
    
    async def analyze_integrated_data(
        self,
        data: Dict[str, Any],
        provider: AIProvider = AIProvider.OPENAI,
        context: Optional[str] = None,
        webhook_url: Optional[str] = None
    ) -> AIAgentResponse:
        """Perform integrated analysis using multiple data types."""
        request = AIAgentRequest(
            analysis_type=AnalysisType.INTEGRATED,
            data=data,
            context=context,
            provider=provider,
            webhook_url=webhook_url
        )
        return await self._process_analysis(request)
    
    async def _process_analysis(self, request: AIAgentRequest) -> AIAgentResponse:
        """Process analysis request."""
        import uuid
        request_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        try:
            # Create async task for processing
            task = asyncio.create_task(
                self._execute_analysis(request_id, request)
            )
            self._active_requests[request_id] = task
            
            # If webhook is provided, process asynchronously
            if request.webhook_url:
                asyncio.create_task(
                    self._process_with_webhook(request_id, request, task)
                )
                return AIAgentResponse(
                    request_id=request_id,
                    analysis_type=request.analysis_type,
                    provider=request.provider,
                    result={"status": "processing", "webhook_url": request.webhook_url},
                    metadata={"async": True},
                    timestamp=start_time,
                    processing_time=0.0
                )
            else:
                # Process synchronously
                result = await task
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return AIAgentResponse(
                    request_id=request_id,
                    analysis_type=request.analysis_type,
                    provider=request.provider,
                    result=result,
                    metadata={"async": False},
                    timestamp=start_time,
                    processing_time=processing_time
                )
        
        except Exception as e:
            logger.error(f"Error processing analysis request {request_id}: {e}")
            raise
    
    async def _execute_analysis(
        self,
        request_id: str,
        request: AIAgentRequest
    ) -> Dict[str, Any]:
        """Execute analysis with specified AI provider."""
        try:
            if request.provider == AIProvider.OPENAI:
                return await self._analyze_with_openai(request)
            elif request.provider == AIProvider.ANTHROPIC:
                return await self._analyze_with_claude(request)
            elif request.provider == AIProvider.QWEN:
                return await self._analyze_with_qwen(request)
            else:
                raise ValueError(f"Unsupported AI provider: {request.provider}")
        
        except Exception as e:
            logger.error(f"Error in analysis execution: {e}")
            return {
                "error": str(e),
                "status": "failed",
                "provider": request.provider.value
            }
    
    async def _analyze_with_openai(self, request: AIAgentRequest) -> Dict[str, Any]:
        """Analyze data using OpenAI GPT-4."""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        
        prompt = self._build_analysis_prompt(request)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": self._get_system_prompt(request.analysis_type)
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": request.max_tokens or settings.OPENAI_MAX_TOKENS,
                    "temperature": request.temperature or settings.OPENAI_TEMPERATURE
                },
                timeout=settings.AI_AGENT_TIMEOUT
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Try to parse JSON response
                try:
                    parsed_content = json.loads(content)
                except json.JSONDecodeError:
                    parsed_content = {"analysis": content}
                
                return {
                    "provider": "openai",
                    "model": settings.OPENAI_MODEL,
                    "analysis": parsed_content,
                    "usage": result.get("usage", {}),
                    "status": "completed"
                }
            else:
                raise Exception(f"OpenAI API error: {response.text}")
    
    async def _analyze_with_claude(self, request: AIAgentRequest) -> Dict[str, Any]:
        """Analyze data using Anthropic Claude."""
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("Anthropic API key not configured")
        
        prompt = self._build_analysis_prompt(request)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.ANTHROPIC_MODEL,
                    "max_tokens": request.max_tokens or settings.ANTHROPIC_MAX_TOKENS,
                    "messages": [
                        {
                            "role": "user",
                            "content": f"{self._get_system_prompt(request.analysis_type)}\n\n{prompt}"
                        }
                    ]
                },
                timeout=settings.AI_AGENT_TIMEOUT
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["content"][0]["text"]
                
                # Try to parse JSON response
                try:
                    parsed_content = json.loads(content)
                except json.JSONDecodeError:
                    parsed_content = {"analysis": content}
                
                return {
                    "provider": "anthropic",
                    "model": settings.ANTHROPIC_MODEL,
                    "analysis": parsed_content,
                    "usage": result.get("usage", {}),
                    "status": "completed"
                }
            else:
                raise Exception(f"Anthropic API error: {response.text}")
    
    async def _analyze_with_qwen(self, request: AIAgentRequest) -> Dict[str, Any]:
        """Analyze data using Alibaba Qwen."""
        if not settings.DASHSCOPE_API_KEY:
            raise ValueError("DashScope API key not configured")
        
        prompt = self._build_analysis_prompt(request)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
                headers={
                    "Authorization": f"Bearer {settings.DASHSCOPE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": settings.QWEN_MODEL,
                    "input": {
                        "messages": [
                            {
                                "role": "system",
                                "content": self._get_system_prompt(request.analysis_type)
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ]
                    },
                    "parameters": {
                        "max_tokens": request.max_tokens or settings.QWEN_MAX_TOKENS,
                        "temperature": request.temperature or settings.QWEN_TEMPERATURE
                    }
                },
                timeout=settings.AI_AGENT_TIMEOUT
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["output"]["text"]
                
                # Try to parse JSON response
                try:
                    parsed_content = json.loads(content)
                except json.JSONDecodeError:
                    parsed_content = {"analysis": content}
                
                return {
                    "provider": "qwen",
                    "model": settings.QWEN_MODEL,
                    "analysis": parsed_content,
                    "usage": result.get("usage", {}),
                    "status": "completed"
                }
            else:
                raise Exception(f"Qwen API error: {response.text}")
    
    def _build_analysis_prompt(self, request: AIAgentRequest) -> str:
        """Build analysis prompt based on request type."""
        base_prompt = f"""
        Please analyze the following {request.analysis_type.value} data and provide a comprehensive analysis.
        
        Data: {json.dumps(request.data, indent=2)}
        
        Context: {request.context or "No additional context provided"}
        
        Please provide your analysis in JSON format with the following structure:
        {{
            "summary": "Brief summary of findings",
            "key_insights": ["List of key insights"],
            "recommendations": ["List of recommendations"],
            "risk_assessment": "Risk assessment",
            "confidence_level": "High/Medium/Low",
            "technical_details": {{"Detailed technical analysis"}},
            "next_steps": ["Recommended next steps"]
        }}
        """
        
        return base_prompt
    
    def _get_system_prompt(self, analysis_type: AnalysisType) -> str:
        """Get system prompt for specific analysis type."""
        prompts = {
            AnalysisType.GEOLOGICAL: """
            You are an expert geologist with 20+ years of experience in mining exploration.
            Analyze geological data including rock types, structures, stratigraphy, and mineralization.
            Focus on identifying geological controls, structural features, and exploration potential.
            """,
            
            AnalysisType.GEOCHEMICAL: """
            You are an expert geochemist specializing in ore deposit geochemistry.
            Analyze geochemical data including element concentrations, isotopic ratios, and mineral assemblages.
            Focus on identifying geochemical signatures, alteration patterns, and mineralization indicators.
            """,
            
            AnalysisType.GEOPHYSICAL: """
            You are an expert geophysicist with expertise in exploration geophysics.
            Analyze geophysical data including seismic, gravity, magnetic, and electrical surveys.
            Focus on identifying geophysical anomalies, structural features, and exploration targets.
            """,
            
            AnalysisType.INTEGRATED: """
            You are a senior exploration geologist with expertise in integrated data analysis.
            Combine geological, geochemical, and geophysical data to provide comprehensive analysis.
            Focus on identifying exploration targets, understanding ore-forming processes, and risk assessment.
            """
        }
        
        return prompts.get(analysis_type, "You are an expert geological analyst.")
    
    async def _process_with_webhook(
        self,
        request_id: str,
        request: AIAgentRequest,
        task: asyncio.Task
    ):
        """Process analysis with webhook notification."""
        try:
            result = await task
            
            payload = WebhookPayload(
                request_id=request_id,
                status="completed",
                result=result,
                timestamp=datetime.now()
            )
            
            await self._send_webhook(request.webhook_url, payload)
            
        except Exception as e:
            logger.error(f"Error in webhook processing: {e}")
            
            payload = WebhookPayload(
                request_id=request_id,
                status="failed",
                error=str(e),
                timestamp=datetime.now()
            )
            
            await self._send_webhook(request.webhook_url, payload)
    
    async def _send_webhook(self, webhook_url: str, payload: WebhookPayload):
        """Send webhook notification."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook_url,
                    json=payload.dict(),
                    headers={"Content-Type": "application/json"},
                    timeout=settings.WEBHOOK_TIMEOUT
                )
                
                if response.status_code not in [200, 201, 202]:
                    logger.warning(f"Webhook delivery failed: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error sending webhook: {e}")
    
    async def get_request_status(self, request_id: str) -> Optional[Dict[str, Any]]:
        """Get status of an async request."""
        if request_id in self._active_requests:
            task = self._active_requests[request_id]
            if task.done():
                try:
                    result = task.result()
                    return {"status": "completed", "result": result}
                except Exception as e:
                    return {"status": "failed", "error": str(e)}
            else:
                return {"status": "processing"}
        else:
            return None


# Global AI agent service instance
ai_agent_service = AIAgentService() 