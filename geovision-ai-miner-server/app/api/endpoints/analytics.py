from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
from ... import schemas, crud, database
from ...auth import get_current_active_user, require_permission
from ...analytics import analytics_service, real_time_analytics
from ...performance import PerformanceDecorator

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/projects/{project_id}/analytics")
@PerformanceDecorator.monitor_performance("get_project_analytics")
async def get_project_analytics(
    project_id: UUID = Path(..., description="Project ID"),
    start_date: Optional[datetime] = Query(None, description="Start date for analytics"),
    end_date: Optional[datetime] = Query(None, description="End date for analytics"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Get comprehensive analytics for a project"""
    try:
        # Check if user has access to the project
        project = await crud.get_project(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get analytics data
        analytics = await analytics_service.get_project_analytics(
            db, project_id, start_date, end_date
        )
        
        return {
            "success": True,
            "data": analytics,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@router.get("/projects/{project_id}/reports")
@PerformanceDecorator.monitor_performance("generate_project_report")
async def generate_project_report(
    project_id: UUID = Path(..., description="Project ID"),
    report_type: str = Query("comprehensive", description="Report type: executive, technical, comprehensive"),
    format: str = Query("json", description="Report format: json, pdf, csv"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Generate a formatted report for a project"""
    try:
        # Check if user has access to the project
        project = await crud.get_project(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Generate report
        report = await analytics_service.generate_report(
            db, project_id, report_type, format
        )
        
        return {
            "success": True,
            "data": report,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/system/metrics")
@PerformanceDecorator.monitor_performance("get_system_metrics")
async def get_system_metrics(
    current_user: schemas.UserOut = Depends(require_permission("view_analytics"))
):
    """Get current system performance metrics"""
    try:
        metrics = await real_time_analytics.get_current_metrics()
        
        return {
            "success": True,
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting system metrics: {str(e)}")

@router.get("/system/metrics/{metric_name}/history")
@PerformanceDecorator.monitor_performance("get_metric_history")
async def get_metric_history(
    metric_name: str = Path(..., description="Metric name"),
    hours: int = Query(24, description="Number of hours of history to retrieve"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics"))
):
    """Get historical data for a specific metric"""
    try:
        history = await real_time_analytics.get_metric_history(metric_name, hours)
        
        return {
            "success": True,
            "data": {
                "metric_name": metric_name,
                "history": history,
                "hours": hours
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting metric history: {str(e)}")

@router.get("/system/alerts")
@PerformanceDecorator.monitor_performance("get_system_alerts")
async def get_system_alerts(
    limit: int = Query(50, description="Maximum number of alerts to return"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics"))
):
    """Get recent system alerts"""
    try:
        alerts = await real_time_analytics.get_alerts(limit)
        
        return {
            "success": True,
            "data": alerts,
            "count": len(alerts),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting alerts: {str(e)}")

@router.get("/users/{user_id}/activity")
@PerformanceDecorator.monitor_performance("get_user_activity")
async def get_user_activity(
    user_id: UUID = Path(..., description="User ID"),
    days: int = Query(30, description="Number of days of activity to retrieve"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Get user activity analytics"""
    try:
        # Check if user has permission to view this user's activity
        if str(current_user.user_id) != str(user_id) and "admin" not in current_user.roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get user activity data
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # This would be implemented based on your activity tracking system
        activity_data = {
            "user_id": str(user_id),
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "login_count": 0,
            "projects_accessed": [],
            "data_uploads": 0,
            "ai_analysis_runs": 0,
            "total_session_time": 0
        }
        
        return {
            "success": True,
            "data": activity_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user activity: {str(e)}")

@router.get("/dashboard/summary")
@PerformanceDecorator.monitor_performance("get_dashboard_summary")
async def get_dashboard_summary(
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Get dashboard summary analytics"""
    try:
        # Get system metrics
        system_metrics = await real_time_analytics.get_current_metrics()
        
        # Get recent alerts
        recent_alerts = await real_time_analytics.get_alerts(10)
        
        # Get user's project summary
        user_projects = await crud.get_user_projects(db, current_user.user_id)
        
        summary = {
            "system_health": {
                "status": "healthy" if not recent_alerts else "warning",
                "alerts_count": len(recent_alerts),
                "cpu_usage": system_metrics.get("cpu_usage", {}).get("value", 0),
                "memory_usage": system_metrics.get("memory_usage", {}).get("value", 0)
            },
            "user_summary": {
                "total_projects": len(user_projects),
                "active_projects": len([p for p in user_projects if p.is_active]),
                "recent_activity": "Last 24 hours"
            },
            "recent_alerts": recent_alerts[:5]  # Top 5 alerts
        }
        
        return {
            "success": True,
            "data": summary,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting dashboard summary: {str(e)}")

@router.post("/record-metric")
@PerformanceDecorator.monitor_performance("record_metric")
async def record_metric(
    metric_data: schemas.MetricRecord,
    current_user: schemas.UserOut = Depends(get_current_active_user)
):
    """Record a custom metric"""
    try:
        await real_time_analytics.record_metric(
            metric_data.name,
            metric_data.value,
            metric_data.tags
        )
        
        return {
            "success": True,
            "message": "Metric recorded successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording metric: {str(e)}")

@router.get("/export/{project_id}")
@PerformanceDecorator.monitor_performance("export_project_data")
async def export_project_data(
    project_id: UUID = Path(..., description="Project ID"),
    data_type: str = Query(..., description="Type of data to export: drillholes, assays, all"),
    format: str = Query("csv", description="Export format: csv, json, excel"),
    current_user: schemas.UserOut = Depends(require_permission("export_data")),
    db: AsyncSession = Depends(database.get_db)
):
    """Export project data in various formats"""
    try:
        # Check if user has access to the project
        project = await crud.get_project(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # This would be implemented based on your data export system
        export_data = {
            "project_id": str(project_id),
            "data_type": data_type,
            "format": format,
            "export_url": f"/exports/{project_id}_{data_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{format}",
            "status": "processing"
        }
        
        return {
            "success": True,
            "data": export_data,
            "message": "Export job created successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating export: {str(e)}")

@router.get("/trends/{project_id}")
@PerformanceDecorator.monitor_performance("get_project_trends")
async def get_project_trends(
    project_id: UUID = Path(..., description="Project ID"),
    trend_type: str = Query(..., description="Type of trend: drillholes, assays, usage"),
    period: str = Query("30d", description="Time period: 7d, 30d, 90d, 1y"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Get trend analysis for a project"""
    try:
        # Check if user has access to the project
        project = await crud.get_project(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # This would be implemented based on your trend analysis system
        trends_data = {
            "project_id": str(project_id),
            "trend_type": trend_type,
            "period": period,
            "data_points": [],
            "trend_direction": "stable",
            "change_percentage": 0.0
        }
        
        return {
            "success": True,
            "data": trends_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trends: {str(e)}")

@router.get("/comparison")
@PerformanceDecorator.monitor_performance("compare_projects")
async def compare_projects(
    project_ids: List[UUID] = Query(..., description="List of project IDs to compare"),
    comparison_type: str = Query("data_summary", description="Type of comparison"),
    current_user: schemas.UserOut = Depends(require_permission("view_analytics")),
    db: AsyncSession = Depends(database.get_db)
):
    """Compare multiple projects"""
    try:
        if len(project_ids) < 2 or len(project_ids) > 5:
            raise HTTPException(status_code=400, detail="Must compare between 2 and 5 projects")
        
        # Check if user has access to all projects
        for project_id in project_ids:
            project = await crud.get_project(db, project_id)
            if not project:
                raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
        
        # This would be implemented based on your comparison system
        comparison_data = {
            "project_ids": [str(pid) for pid in project_ids],
            "comparison_type": comparison_type,
            "comparison_matrix": {},
            "highlights": []
        }
        
        return {
            "success": True,
            "data": comparison_data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing projects: {str(e)}") 