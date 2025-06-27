"""
Pydantic schemas for chained analysis workflows.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ChainedAnalysisStep(BaseModel):
    """Schema for a single step in chained analysis."""
    
    type: str = Field(..., description="Type of analysis step")
    provider: Optional[str] = Field(None, description="AI provider for LLM steps")
    analysis_type: Optional[str] = Field(None, description="Type of analysis for ML/geological steps")
    operation: Optional[str] = Field(None, description="Operation for data processing steps")
    input_data: Optional[Dict[str, Any]] = Field({}, description="Input data for the step")
    prompt: Optional[str] = Field(None, description="Prompt for LLM steps")
    context: Optional[Dict[str, Any]] = Field({}, description="Context for LLM steps")
    description: Optional[str] = Field(None, description="Human-readable description")


class ChainedAnalysisCreate(BaseModel):
    """Schema for creating a chained analysis."""
    
    workflow_name: str = Field(..., description="Name of the workflow")
    steps: List[ChainedAnalysisStep] = Field(..., description="List of analysis steps")
    webhook_url: Optional[str] = Field(None, description="Webhook URL for completion notification")


class ChainedAnalysisResponse(BaseModel):
    """Schema for chained analysis response."""
    
    id: str = Field(..., description="Analysis ID")
    workflow_name: str = Field(..., description="Name of the workflow")
    status: str = Field(..., description="Current status")
    message: str = Field(..., description="Response message")


class ChainedAnalysisStepStatus(BaseModel):
    """Schema for step status in chained analysis."""
    
    step_number: int = Field(..., description="Step number")
    step_type: str = Field(..., description="Type of step")
    provider: Optional[str] = Field(None, description="AI provider")
    status: str = Field(..., description="Step status")
    processing_time: Optional[int] = Field(None, description="Processing time in seconds")
    error_message: Optional[str] = Field(None, description="Error message if failed")


class ChainedAnalysisStatus(BaseModel):
    """Schema for chained analysis status."""
    
    id: str = Field(..., description="Analysis ID")
    workflow_name: str = Field(..., description="Name of the workflow")
    status: str = Field(..., description="Current status")
    created_at: datetime = Field(..., description="Creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    steps: List[ChainedAnalysisStepStatus] = Field(..., description="Step statuses")
    results: Optional[List[Dict[str, Any]]] = Field(None, description="Analysis results")


class AnalysisTemplate(BaseModel):
    """Schema for analysis template."""
    
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    steps: List[ChainedAnalysisStep] = Field(..., description="Template steps")


class AnalysisTemplatesResponse(BaseModel):
    """Schema for analysis templates response."""
    
    templates: Dict[str, List[Dict[str, Any]]] = Field(..., description="Available templates") 