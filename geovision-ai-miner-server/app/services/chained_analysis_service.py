"""
Chained analysis service for orchestrating multi-agent workflows.
"""

import asyncio
import logging
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.services.ai_agents import AIAgentService
from app.services.geological_analysis import GeologicalAnalysisService
from app.services.geochemical_analysis import GeochemicalAnalysisService
from app.models.ai_analysis import ChainedAnalysis, ChainedAnalysisStep
from app.core.database import get_db

logger = logging.getLogger(__name__)


class ChainedAnalysisService:
    """Service for orchestrating chained/multi-agent analysis workflows."""
    
    def __init__(self):
        self.ai_agent_service = AIAgentService()
        self.geological_service = GeologicalAnalysisService()
        self.geochemical_service = GeochemicalAnalysisService()
    
    async def execute_chained_analysis(
        self,
        user_id: str,
        workflow_name: str,
        steps: List[Dict[str, Any]],
        webhook_url: Optional[str] = None
    ) -> str:
        """Execute a chained analysis workflow."""
        
        # Create chained analysis record
        chained_analysis_id = str(uuid.uuid4())
        chained_analysis = ChainedAnalysis(
            id=chained_analysis_id,
            user_id=user_id,
            workflow_name=workflow_name,
            status="processing",
            steps=steps
        )
        
        db = next(get_db())
        db.add(chained_analysis)
        db.commit()
        
        try:
            # Execute steps sequentially
            results = []
            for i, step in enumerate(steps):
                step_result = await self._execute_step(
                    chained_analysis_id=chained_analysis_id,
                    step_number=i + 1,
                    step=step
                )
                results.append(step_result)
                
                # Check if step failed
                if step_result.get("status") == "failed":
                    await self._update_chained_analysis_status(
                        chained_analysis_id, "failed", results
                    )
                    return chained_analysis_id
            
            # All steps completed successfully
            await self._update_chained_analysis_status(
                chained_analysis_id, "completed", results
            )
            
            # Send webhook notification if provided
            if webhook_url:
                await self._send_completion_webhook(webhook_url, {
                    "chained_analysis_id": chained_analysis_id,
                    "status": "completed",
                    "results": results
                })
            
            return chained_analysis_id
            
        except Exception as e:
            logger.error(f"Chained analysis failed: {e}")
            await self._update_chained_analysis_status(
                chained_analysis_id, "failed", []
            )
            return chained_analysis_id
    
    async def _execute_step(
        self,
        chained_analysis_id: str,
        step_number: int,
        step: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single step in the chained analysis."""
        
        step_type = step.get("type")
        provider = step.get("provider")
        input_data = step.get("input_data", {})
        
        # Create step record
        step_id = str(uuid.uuid4())
        step_record = ChainedAnalysisStep(
            id=step_id,
            chained_analysis_id=chained_analysis_id,
            step_number=step_number,
            step_type=step_type,
            provider=provider,
            status="processing",
            input_data=input_data
        )
        
        db = next(get_db())
        db.add(step_record)
        db.commit()
        
        start_time = datetime.utcnow()
        
        try:
            # Execute step based on type
            if step_type == "ml_analysis":
                result = await self._execute_ml_step(step)
            elif step_type == "llm_analysis":
                result = await self._execute_llm_step(step)
            elif step_type == "data_processing":
                result = await self._execute_data_processing_step(step)
            elif step_type == "geological_analysis":
                result = await self._execute_geological_step(step)
            elif step_type == "geochemical_analysis":
                result = await self._execute_geochemical_step(step)
            else:
                raise ValueError(f"Unknown step type: {step_type}")
            
            # Update step record
            processing_time = int((datetime.utcnow() - start_time).total_seconds())
            step_record.status = "completed"
            step_record.output_data = result
            step_record.processing_time = processing_time
            step_record.completed_at = datetime.utcnow()
            
            db.commit()
            
            return {
                "step_id": step_id,
                "status": "completed",
                "result": result,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Step {step_number} failed: {e}")
            
            # Update step record
            processing_time = int((datetime.utcnow() - start_time).total_seconds())
            step_record.status = "failed"
            step_record.error_message = str(e)
            step_record.processing_time = processing_time
            
            db.commit()
            
            return {
                "step_id": step_id,
                "status": "failed",
                "error": str(e),
                "processing_time": processing_time
            }
    
    async def _execute_ml_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute ML analysis step."""
        analysis_type = step.get("analysis_type")
        data = step.get("input_data", {})
        
        if analysis_type == "anomaly_detection":
            return await self.geochemical_service.detect_anomalies(data)
        elif analysis_type == "clustering":
            return await self.geological_service.cluster_formations(data)
        elif analysis_type == "regression":
            return await self.geochemical_service.predict_concentrations(data)
        else:
            raise ValueError(f"Unknown ML analysis type: {analysis_type}")
    
    async def _execute_llm_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute LLM analysis step."""
        provider = step.get("provider", "openai")
        prompt = step.get("prompt")
        context = step.get("context", {})
        
        return await self.ai_agent_service.analyze_with_llm(
            provider=provider,
            prompt=prompt,
            context=context
        )
    
    async def _execute_data_processing_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data processing step."""
        operation = step.get("operation")
        data = step.get("input_data", {})
        
        if operation == "normalize":
            return await self.geochemical_service.normalize_data(data)
        elif operation == "filter":
            return await self.geological_service.filter_data(data)
        elif operation == "aggregate":
            return await self.geological_service.aggregate_data(data)
        else:
            raise ValueError(f"Unknown data processing operation: {operation}")
    
    async def _execute_geological_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute geological analysis step."""
        analysis_type = step.get("analysis_type")
        data = step.get("input_data", {})
        
        if analysis_type == "formation_analysis":
            return await self.geological_service.analyze_formations(data)
        elif analysis_type == "structural_analysis":
            return await self.geological_service.analyze_structures(data)
        elif analysis_type == "mineral_assessment":
            return await self.geological_service.assess_mineral_potential(data)
        else:
            raise ValueError(f"Unknown geological analysis type: {analysis_type}")
    
    async def _execute_geochemical_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute geochemical analysis step."""
        analysis_type = step.get("analysis_type")
        data = step.get("input_data", {})
        
        if analysis_type == "element_analysis":
            return await self.geochemical_service.analyze_elements(data)
        elif analysis_type == "ratio_analysis":
            return await self.geochemical_service.analyze_ratios(data)
        elif analysis_type == "trend_analysis":
            return await self.geochemical_service.analyze_trends(data)
        else:
            raise ValueError(f"Unknown geochemical analysis type: {analysis_type}")
    
    async def _update_chained_analysis_status(
        self,
        chained_analysis_id: str,
        status: str,
        results: List[Dict[str, Any]]
    ):
        """Update chained analysis status and results."""
        db = next(get_db())
        chained_analysis = db.query(ChainedAnalysis).filter(
            ChainedAnalysis.id == chained_analysis_id
        ).first()
        
        if chained_analysis:
            chained_analysis.status = status
            chained_analysis.results = results
            chained_analysis.completed_at = datetime.utcnow() if status == "completed" else None
            db.commit()
    
    async def _send_completion_webhook(self, webhook_url: str, payload: Dict[str, Any]):
        """Send completion webhook."""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    if response.status not in [200, 201, 202]:
                        logger.error(f"Webhook delivery failed: {response.status}")
        except Exception as e:
            logger.error(f"Failed to send completion webhook: {e}")
    
    async def get_chained_analysis_status(self, chained_analysis_id: str) -> Dict[str, Any]:
        """Get the status of a chained analysis."""
        db = next(get_db())
        chained_analysis = db.query(ChainedAnalysis).filter(
            ChainedAnalysis.id == chained_analysis_id
        ).first()
        
        if not chained_analysis:
            return {"error": "Chained analysis not found"}
        
        # Get step details
        steps = db.query(ChainedAnalysisStep).filter(
            ChainedAnalysisStep.chained_analysis_id == chained_analysis_id
        ).order_by(ChainedAnalysisStep.step_number).all()
        
        return {
            "id": chained_analysis.id,
            "workflow_name": chained_analysis.workflow_name,
            "status": chained_analysis.status,
            "created_at": chained_analysis.created_at,
            "completed_at": chained_analysis.completed_at,
            "steps": [
                {
                    "step_number": step.step_number,
                    "step_type": step.step_type,
                    "provider": step.provider,
                    "status": step.status,
                    "processing_time": step.processing_time,
                    "error_message": step.error_message
                }
                for step in steps
            ],
            "results": chained_analysis.results
        }


# Global chained analysis service instance
chained_analysis_service = ChainedAnalysisService() 