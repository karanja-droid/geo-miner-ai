"""
API endpoints for chained analysis workflows.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.chained_analysis_service import chained_analysis_service
from app.schemas.chained_analysis import (
    ChainedAnalysisCreate,
    ChainedAnalysisResponse,
    ChainedAnalysisStatus,
    ChainedAnalysisStep
)

router = APIRouter()


@router.post("/chained-analysis", response_model=ChainedAnalysisResponse)
async def create_chained_analysis(
    analysis_request: ChainedAnalysisCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create and execute a chained analysis workflow."""
    
    try:
        # Start chained analysis in background
        chained_analysis_id = await chained_analysis_service.execute_chained_analysis(
            user_id=current_user.id,
            workflow_name=analysis_request.workflow_name,
            steps=analysis_request.steps,
            webhook_url=analysis_request.webhook_url
        )
        
        return ChainedAnalysisResponse(
            id=chained_analysis_id,
            workflow_name=analysis_request.workflow_name,
            status="processing",
            message="Chained analysis started successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start chained analysis: {str(e)}")


@router.get("/chained-analysis/{analysis_id}", response_model=ChainedAnalysisStatus)
async def get_chained_analysis_status(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the status of a chained analysis."""
    
    try:
        status = await chained_analysis_service.get_chained_analysis_status(analysis_id)
        
        if "error" in status:
            raise HTTPException(status_code=404, detail=status["error"])
        
        return ChainedAnalysisStatus(**status)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analysis status: {str(e)}")


@router.get("/chained-analysis", response_model=List[ChainedAnalysisStatus])
async def list_chained_analyses(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all chained analyses for the current user."""
    
    try:
        from app.models.ai_analysis import ChainedAnalysis, ChainedAnalysisStep
        
        # Get chained analyses for user
        chained_analyses = db.query(ChainedAnalysis).filter(
            ChainedAnalysis.user_id == current_user.id
        ).offset(skip).limit(limit).all()
        
        results = []
        for analysis in chained_analyses:
            # Get step details
            steps = db.query(ChainedAnalysisStep).filter(
                ChainedAnalysisStep.chained_analysis_id == analysis.id
            ).order_by(ChainedAnalysisStep.step_number).all()
            
            step_details = [
                {
                    "step_number": step.step_number,
                    "step_type": step.step_type,
                    "provider": step.provider,
                    "status": step.status,
                    "processing_time": step.processing_time,
                    "error_message": step.error_message
                }
                for step in steps
            ]
            
            results.append(ChainedAnalysisStatus(
                id=analysis.id,
                workflow_name=analysis.workflow_name,
                status=analysis.status,
                created_at=analysis.created_at,
                completed_at=analysis.completed_at,
                steps=step_details,
                results=analysis.results
            ))
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list analyses: {str(e)}")


@router.delete("/chained-analysis/{analysis_id}")
async def cancel_chained_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a running chained analysis."""
    
    try:
        from app.models.ai_analysis import ChainedAnalysis
        
        # Check if analysis exists and belongs to user
        analysis = db.query(ChainedAnalysis).filter(
            ChainedAnalysis.id == analysis_id,
            ChainedAnalysis.user_id == current_user.id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status not in ["processing", "pending"]:
            raise HTTPException(status_code=400, detail="Cannot cancel completed or failed analysis")
        
        # Update status to cancelled
        analysis.status = "cancelled"
        db.commit()
        
        return {"message": "Analysis cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel analysis: {str(e)}")


@router.post("/chained-analysis/templates")
async def get_analysis_templates() -> Dict[str, List[Dict[str, Any]]]:
    """Get predefined chained analysis templates."""
    
    templates = {
        "geochemical_exploration": [
            {
                "type": "data_processing",
                "operation": "normalize",
                "description": "Normalize geochemical data"
            },
            {
                "type": "ml_analysis",
                "analysis_type": "anomaly_detection",
                "description": "Detect geochemical anomalies"
            },
            {
                "type": "llm_analysis",
                "provider": "openai",
                "description": "Generate exploration recommendations"
            }
        ],
        "geological_mapping": [
            {
                "type": "geological_analysis",
                "analysis_type": "formation_analysis",
                "description": "Analyze geological formations"
            },
            {
                "type": "ml_analysis",
                "analysis_type": "clustering",
                "description": "Cluster similar formations"
            },
            {
                "type": "llm_analysis",
                "provider": "anthropic",
                "description": "Generate geological interpretation"
            }
        ],
        "mineral_assessment": [
            {
                "type": "geochemical_analysis",
                "analysis_type": "element_analysis",
                "description": "Analyze element concentrations"
            },
            {
                "type": "geological_analysis",
                "analysis_type": "mineral_assessment",
                "description": "Assess mineral potential"
            },
            {
                "type": "ml_analysis",
                "analysis_type": "regression",
                "description": "Predict ore grades"
            },
            {
                "type": "llm_analysis",
                "provider": "qwen",
                "description": "Generate mining recommendations"
            }
        ]
    }
    
    return {"templates": templates} 