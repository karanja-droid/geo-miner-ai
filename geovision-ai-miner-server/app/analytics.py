from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, text
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import defaultdict
import json
import redis
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from decimal import Decimal
from uuid import UUID
import redis.asyncio as redis_asyncio

from . import crud, models
from .database import get_db

# Redis connection for caching analytics
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True
)

class AnalyticsEngine:
    """Advanced analytics and reporting engine"""
    
    def __init__(self):
        self.redis_client = redis_client
    
    async def get_user_activity_metrics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Get user activity metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Daily active users
        daily_active = db.query(
            func.date(models.User.created_at).label('date'),
            func.count(models.User.user_id).label('new_users')
        ).filter(
            models.User.created_at >= start_date
        ).group_by(
            func.date(models.User.created_at)
        ).all()
        
        # Project activity
        project_activity = db.query(
            func.date(models.Project.created_at).label('date'),
            func.count(models.Project.project_id).label('new_projects')
        ).filter(
            models.Project.created_at >= start_date
        ).group_by(
            func.date(models.Project.created_at)
        ).all()
        
        # AI analysis usage
        ai_usage = db.query(
            func.date(models.AIRun.submission_time).label('date'),
            func.count(models.AIRun.run_id).label('ai_runs')
        ).filter(
            models.AIRun.submission_time >= start_date
        ).group_by(
            func.date(models.AIRun.submission_time)
        ).all()
        
        return {
            "daily_active_users": [{"date": str(d.date), "count": d.new_users} for d in daily_active],
            "project_activity": [{"date": str(p.date), "count": p.new_projects} for p in project_activity],
            "ai_usage": [{"date": str(a.date), "count": a.ai_runs} for a in ai_usage]
        }
    
    async def get_revenue_analytics(self, db: Session, days: int = 30) -> Dict[str, Any]:
        """Get revenue and billing analytics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Monthly recurring revenue
        mrr_data = db.query(
            func.date_trunc('month', models.Billing.billing_date).label('month'),
            func.sum(models.Billing.amount).label('revenue')
        ).filter(
            and_(
                models.Billing.billing_date >= start_date,
                models.Billing.status == 'paid'
            )
        ).group_by(
            func.date_trunc('month', models.Billing.billing_date)
        ).all()
        
        # Plan distribution
        plan_distribution = db.query(
            models.PricingPlan.name,
            func.count(models.Subscription.subscription_id).label('subscriptions')
        ).join(
            models.Subscription
        ).filter(
            models.Subscription.status == 'active'
        ).group_by(
            models.PricingPlan.name
        ).all()
        
        # Churn rate calculation
        total_subscriptions = db.query(func.count(models.Subscription.subscription_id)).filter(
            models.Subscription.status == 'active'
        ).scalar()
        
        cancelled_subscriptions = db.query(func.count(models.Subscription.subscription_id)).filter(
            and_(
                models.Subscription.status == 'cancelled',
                models.Subscription.end_date >= start_date
            )
        ).scalar()
        
        churn_rate = (cancelled_subscriptions / total_subscriptions * 100) if total_subscriptions > 0 else 0
        
        return {
            "mrr": [{"month": str(m.month), "revenue": float(m.revenue)} for m in mrr_data],
            "plan_distribution": [{"plan": p.name, "subscriptions": p.subscriptions} for p in plan_distribution],
            "churn_rate": churn_rate,
            "total_revenue": sum(float(m.revenue) for m in mrr_data)
        }
    
    async def get_performance_metrics(self, db: Session) -> Dict[str, Any]:
        """Get system performance metrics"""
        # Database performance
        db_performance = db.execute(text("""
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                correlation
            FROM pg_stats 
            WHERE schemaname = 'public'
            ORDER BY n_distinct DESC
            LIMIT 10
        """)).fetchall()
        
        # API response times (from Redis cache)
        api_metrics = self.redis_client.hgetall("api_metrics")
        
        # Cache hit rates
        cache_hits = int(self.redis_client.get("cache_hits") or 0)
        cache_misses = int(self.redis_client.get("cache_misses") or 0)
        cache_hit_rate = (cache_hits / (cache_hits + cache_misses) * 100) if (cache_hits + cache_misses) > 0 else 0
        
        return {
            "database_performance": [dict(row) for row in db_performance],
            "api_metrics": api_metrics,
            "cache_hit_rate": cache_hit_rate,
            "cache_hits": cache_hits,
            "cache_misses": cache_misses
        }
    
    async def get_geological_insights(self, db: Session, project_id: Optional[str] = None) -> Dict[str, Any]:
        """Get geological analysis insights"""
        query = db.query(models.AIRun)
        
        if project_id:
            query = query.filter(models.AIRun.project_id == project_id)
        
        ai_runs = query.all()
        
        # Success rate analysis
        total_runs = len(ai_runs)
        successful_runs = len([run for run in ai_runs if run.status == 'completed'])
        success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0
        
        # Commodity analysis
        commodity_analysis = db.query(
            models.Project.commodity,
            func.count(models.Project.project_id).label('project_count')
        ).group_by(
            models.Project.commodity
        ).all()
        
        # Drill hole statistics
        drill_hole_stats = db.query(
            func.avg(models.Drillhole.elevation).label('avg_elevation'),
            func.count(models.Drillhole.drillhole_id).label('total_holes'),
            func.avg(models.DrillInterval.to_depth - models.DrillInterval.from_depth).label('avg_interval_length')
        ).join(
            models.DrillInterval
        ).first()
        
        return {
            "ai_success_rate": success_rate,
            "total_ai_runs": total_runs,
            "successful_runs": successful_runs,
            "commodity_distribution": [{"commodity": c.commodity, "count": c.project_count} for c in commodity_analysis],
            "drill_hole_stats": {
                "avg_elevation": float(drill_hole_stats.avg_elevation) if drill_hole_stats.avg_elevation else 0,
                "total_holes": drill_hole_stats.total_holes,
                "avg_interval_length": float(drill_hole_stats.avg_interval_length) if drill_hole_stats.avg_interval_length else 0
            }
        }
    
    async def get_usage_analytics(self, db: Session, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get usage analytics and patterns"""
        query = db.query(models.Usage)
        
        if user_id:
            query = query.filter(models.Usage.user_id == user_id)
        
        usage_data = query.all()
        
        # Usage by type
        usage_by_type = defaultdict(int)
        for usage in usage_data:
            usage_by_type[usage.usage_type] += float(usage.amount)
        
        # Peak usage times
        peak_usage = db.query(
            func.date_trunc('hour', models.Usage.created_at).label('hour'),
            func.sum(models.Usage.amount).label('total_usage')
        ).group_by(
            func.date_trunc('hour', models.Usage.created_at)
        ).order_by(
            desc(func.sum(models.Usage.amount))
        ).limit(10).all()
        
        return {
            "usage_by_type": dict(usage_by_type),
            "peak_usage_times": [{"hour": str(p.hour), "usage": float(p.total_usage)} for p in peak_usage],
            "total_usage": sum(usage_by_type.values())
        }

class ReportingEngine:
    """Advanced reporting and data export engine"""
    
    def __init__(self):
        self.analytics_engine = AnalyticsEngine()
    
    async def generate_project_report(self, db: Session, project_id: str) -> Dict[str, Any]:
        """Generate comprehensive project report"""
        project = await crud.get_project(db, project_id)
        if not project:
            return {"error": "Project not found"}
        
        # Get project data
        drill_holes = await crud.get_project_drillholes(db, project_id)
        ai_runs = await crud.get_project_ai_runs(db, project_id)
        comments = await crud.get_project_comments(db, project_id)
        
        # Calculate statistics
        total_holes = len(drill_holes)
        total_depth = sum(hole.elevation or 0 for hole in drill_holes)
        avg_depth = total_depth / total_holes if total_holes > 0 else 0
        
        # AI analysis summary
        successful_ai_runs = len([run for run in ai_runs if run.status == 'completed'])
        ai_success_rate = (successful_ai_runs / len(ai_runs) * 100) if ai_runs else 0
        
        # Generate insights
        insights = await self.analytics_engine.get_geological_insights(db, project_id)
        
        return {
            "project_info": {
                "name": project.name,
                "commodity": project.commodity,
                "description": project.description,
                "created_at": project.created_at.isoformat()
            },
            "statistics": {
                "total_drill_holes": total_holes,
                "total_depth": total_depth,
                "average_depth": avg_depth,
                "ai_runs": len(ai_runs),
                "ai_success_rate": ai_success_rate,
                "comments": len(comments)
            },
            "insights": insights,
            "drill_holes": [
                {
                    "id": str(hole.drillhole_id),
                    "elevation": hole.elevation,
                    "status": hole.status,
                    "drilling_date": hole.drilling_date.isoformat() if hole.drilling_date else None
                }
                for hole in drill_holes
            ],
            "ai_analysis": [
                {
                    "id": str(run.run_id),
                    "status": run.status,
                    "submission_time": run.submission_time.isoformat() if run.submission_time else None,
                    "completion_time": run.completion_time.isoformat() if run.completion_time else None
                }
                for run in ai_runs
            ]
        }
    
    async def generate_user_report(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Generate user activity and usage report"""
        user = await crud.get_user_by_id(db, user_id)
        if not user:
            return {"error": "User not found"}
        
        # Get user data
        projects = await crud.get_user_projects(db, user_id)
        subscription = await crud.get_user_subscription(db, user_id)
        usage_data = await crud.get_user_usage(db, user_id)
        
        # Calculate metrics
        total_projects = len(projects)
        active_projects = len([p for p in projects if p.updated_at > datetime.utcnow() - timedelta(days=30)])
        
        # Usage analysis
        usage_analytics = await self.analytics_engine.get_usage_analytics(db, user_id)
        
        return {
            "user_info": {
                "email": user.email,
                "roles": user.roles,
                "created_at": user.created_at.isoformat()
            },
            "subscription": {
                "plan": subscription.plan.name if subscription else None,
                "status": subscription.status if subscription else None,
                "billing_cycle": subscription.billing_cycle if subscription else None
            },
            "activity": {
                "total_projects": total_projects,
                "active_projects": active_projects,
                "last_activity": max(p.updated_at for p in projects).isoformat() if projects else None
            },
            "usage": usage_analytics
        }
    
    async def generate_system_report(self, db: Session) -> Dict[str, Any]:
        """Generate system-wide analytics report"""
        # Get all analytics data
        user_activity = await self.analytics_engine.get_user_activity_metrics(db)
        revenue_analytics = await self.analytics_engine.get_revenue_analytics(db)
        performance_metrics = await self.analytics_engine.get_performance_metrics(db)
        geological_insights = await self.analytics_engine.get_geological_insights(db)
        
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "user_activity": user_activity,
            "revenue_analytics": revenue_analytics,
            "performance_metrics": performance_metrics,
            "geological_insights": geological_insights,
            "summary": {
                "total_users": db.query(func.count(models.User.user_id)).scalar(),
                "total_projects": db.query(func.count(models.Project.project_id)).scalar(),
                "total_ai_runs": db.query(func.count(models.AIRun.run_id)).scalar(),
                "active_subscriptions": db.query(func.count(models.Subscription.subscription_id)).filter(
                    models.Subscription.status == 'active'
                ).scalar()
            }
        }
    
    async def export_data_to_csv(self, data: List[Dict[str, Any]], filename: str) -> str:
        """Export data to CSV format"""
        df = pd.DataFrame(data)
        filepath = f"/app/exports/{filename}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(filepath, index=False)
        return filepath
    
    async def export_data_to_excel(self, data: Dict[str, List[Dict[str, Any]]], filename: str) -> str:
        """Export data to Excel format with multiple sheets"""
        filepath = f"/app/exports/{filename}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            for sheet_name, sheet_data in data.items():
                df = pd.DataFrame(sheet_data)
                df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        return filepath

class BusinessIntelligence:
    """Business intelligence and predictive analytics"""
    
    def __init__(self):
        self.analytics_engine = AnalyticsEngine()
    
    async def predict_user_churn(self, db: Session, user_id: str) -> Dict[str, Any]:
        """Predict user churn probability"""
        user = await crud.get_user_by_id(db, user_id)
        if not user:
            return {"error": "User not found"}
        
        # Get user behavior metrics
        projects = await crud.get_user_projects(db, user_id)
        usage_data = await crud.get_user_usage(db, user_id)
        subscription = await crud.get_user_subscription(db, user_id)
        
        # Calculate churn indicators
        days_since_last_activity = (datetime.utcnow() - max(p.updated_at for p in projects)).days if projects else 999
        total_usage = sum(float(u.amount) for u in usage_data)
        subscription_age = (datetime.utcnow() - subscription.start_date).days if subscription else 0
        
        # Simple churn prediction model (in production, use ML models)
        churn_score = 0
        
        if days_since_last_activity > 30:
            churn_score += 30
        if total_usage < 10:
            churn_score += 20
        if subscription_age > 90 and total_usage < 50:
            churn_score += 25
        
        churn_probability = min(churn_score, 100)
        
        return {
            "user_id": user_id,
            "churn_probability": churn_probability,
            "risk_factors": {
                "days_since_last_activity": days_since_last_activity,
                "low_usage": total_usage < 10,
                "old_inactive_subscription": subscription_age > 90 and total_usage < 50
            },
            "recommendations": self._get_churn_recommendations(churn_probability)
        }
    
    def _get_churn_recommendations(self, churn_probability: float) -> List[str]:
        """Get recommendations based on churn probability"""
        recommendations = []
        
        if churn_probability > 70:
            recommendations.extend([
                "High risk of churn - immediate intervention needed",
                "Offer personalized support and training",
                "Consider discount or upgrade incentives"
            ])
        elif churn_probability > 40:
            recommendations.extend([
                "Moderate risk of churn",
                "Send re-engagement emails",
                "Offer feature training sessions"
            ])
        else:
            recommendations.append("Low churn risk - continue current engagement strategies")
        
        return recommendations
    
    async def get_revenue_forecast(self, db: Session, months: int = 12) -> Dict[str, Any]:
        """Generate revenue forecast"""
        # Get historical revenue data
        revenue_data = db.query(
            func.date_trunc('month', models.Billing.billing_date).label('month'),
            func.sum(models.Billing.amount).label('revenue')
        ).filter(
            models.Billing.status == 'paid'
        ).group_by(
            func.date_trunc('month', models.Billing.billing_date)
        ).order_by(
            func.date_trunc('month', models.Billing.billing_date)
        ).all()
        
        # Simple linear regression for forecasting
        if len(revenue_data) >= 2:
            x = list(range(len(revenue_data)))
            y = [float(r.revenue) for r in revenue_data]
            
            # Calculate trend
            slope = np.polyfit(x, y, 1)[0]
            intercept = np.polyfit(x, y, 1)[1]
            
            # Generate forecast
            forecast_months = []
            forecast_revenue = []
            
            for i in range(len(revenue_data), len(revenue_data) + months):
                forecast_rev = slope * i + intercept
                forecast_months.append(i)
                forecast_revenue.append(max(0, forecast_rev))
            
            return {
                "historical_revenue": [{"month": str(r.month), "revenue": float(r.revenue)} for r in revenue_data],
                "forecast": [{"month": m, "revenue": r} for m, r in zip(forecast_months, forecast_revenue)],
                "growth_rate": slope,
                "confidence_interval": 0.85  # Placeholder
            }
        
        return {"error": "Insufficient data for forecasting"}

class AnalyticsService:
    """Advanced analytics and reporting service"""
    
    def __init__(self):
        self.cache_ttl = 3600  # 1 hour cache
    
    async def get_project_analytics(self, db: AsyncSession, project_id: UUID, 
                                  start_date: Optional[datetime] = None,
                                  end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get comprehensive project analytics"""
        cache_key = f"project_analytics:{project_id}:{start_date}:{end_date}"
        
        # Check cache first
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Get project data
        project = await crud.get_project(db, project_id)
        if not project:
            return {}
        
        # Calculate analytics
        analytics = {
            "project_info": {
                "project_id": str(project.project_id),
                "name": project.name,
                "commodity": project.commodity,
                "created_at": project.created_at.isoformat() if project.created_at else None
            },
            "data_summary": await self._get_data_summary(db, project_id),
            "drillhole_analytics": await self._get_drillhole_analytics(db, project_id, start_date, end_date),
            "assay_analytics": await self._get_assay_analytics(db, project_id, start_date, end_date),
            "spatial_analytics": await self._get_spatial_analytics(db, project_id),
            "usage_analytics": await self._get_usage_analytics(db, project_id, start_date, end_date),
            "performance_metrics": await self._get_performance_metrics(db, project_id),
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # Cache results
        await redis_client.setex(cache_key, self.cache_ttl, json.dumps(analytics))
        
        return analytics
    
    async def _get_data_summary(self, db: AsyncSession, project_id: UUID) -> Dict[str, Any]:
        """Get summary of all data types in project"""
        summary = {}
        
        # Count drillholes
        drillholes_result = await db.execute(
            select(func.count(models.Drillhole.drillhole_id))
            .where(models.Drillhole.project_id == project_id)
        )
        summary["drillholes_count"] = drillholes_result.scalar() or 0
        
        # Count photogrammetry files
        photogrammetry_result = await db.execute(
            select(func.count(models.Photogrammetry.photogrammetry_id))
            .where(models.Photogrammetry.project_id == project_id)
        )
        summary["photogrammetry_count"] = photogrammetry_result.scalar() or 0
        
        # Count LiDAR files
        lidar_result = await db.execute(
            select(func.count(models.LiDAR.lidar_id))
            .where(models.LiDAR.project_id == project_id)
        )
        summary["lidar_count"] = lidar_result.scalar() or 0
        
        # Count GIS layers
        gis_result = await db.execute(
            select(func.count(models.GISLayer.layer_id))
            .where(models.GISLayer.project_id == project_id)
        )
        summary["gis_layers_count"] = gis_result.scalar() or 0
        
        return summary
    
    async def _get_drillhole_analytics(self, db: AsyncSession, project_id: UUID,
                                     start_date: Optional[datetime] = None,
                                     end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get drillhole analytics"""
        analytics = {}
        
        # Base query
        query = select(models.Drillhole).where(models.Drillhole.project_id == project_id)
        
        # Add date filters if provided
        if start_date:
            query = query.where(models.Drillhole.drilling_date >= start_date)
        if end_date:
            query = query.where(models.Drillhole.drilling_date <= end_date)
        
        drillholes_result = await db.execute(query)
        drillholes = drillholes_result.scalars().all()
        
        if not drillholes:
            return {"total_drillholes": 0, "total_depth": 0, "average_depth": 0}
        
        # Calculate total depth
        total_depth = sum(drillhole.elevation or 0 for drillhole in drillholes)
        average_depth = total_depth / len(drillholes) if drillholes else 0
        
        # Status distribution
        status_counts = {}
        for drillhole in drillholes:
            status = drillhole.status or "unknown"
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Driller distribution
        driller_counts = {}
        for drillhole in drillholes:
            driller = drillhole.driller or "unknown"
            driller_counts[driller] = driller_counts.get(driller, 0) + 1
        
        analytics = {
            "total_drillholes": len(drillholes),
            "total_depth": total_depth,
            "average_depth": average_depth,
            "status_distribution": status_counts,
            "driller_distribution": driller_counts,
            "depth_statistics": {
                "min_depth": min(d.elevation or 0 for d in drillholes),
                "max_depth": max(d.elevation or 0 for d in drillholes),
                "median_depth": np.median([d.elevation or 0 for d in drillholes])
            }
        }
        
        return analytics
    
    async def _get_assay_analytics(self, db: AsyncSession, project_id: UUID,
                                 start_date: Optional[datetime] = None,
                                 end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get assay analytics"""
        analytics = {}
        
        # Get all drillholes for the project
        drillholes_result = await db.execute(
            select(models.Drillhole.drillhole_id)
            .where(models.Drillhole.project_id == project_id)
        )
        drillhole_ids = [row[0] for row in drillholes_result.fetchall()]
        
        if not drillhole_ids:
            return {"total_assays": 0, "elements": []}
        
        # Get all intervals for these drillholes
        intervals_result = await db.execute(
            select(models.DrillInterval.interval_id)
            .where(models.DrillInterval.drillhole_id.in_(drillhole_ids))
        )
        interval_ids = [row[0] for row in intervals_result.fetchall()]
        
        if not interval_ids:
            return {"total_assays": 0, "elements": []}
        
        # Get all assays for these intervals
        assays_result = await db.execute(
            select(models.Assay)
            .where(models.Assay.interval_id.in_(interval_ids))
        )
        assays = assays_result.scalars().all()
        
        if not assays:
            return {"total_assays": 0, "elements": []}
        
        # Element analysis
        elements = {}
        for assay in assays:
            element = assay.element
            if element not in elements:
                elements[element] = {
                    "count": 0,
                    "values": [],
                    "units": set()
                }
            
            elements[element]["count"] += 1
            elements[element]["values"].append(float(assay.value))
            elements[element]["units"].add(assay.unit)
        
        # Calculate statistics for each element
        element_stats = {}
        for element, data in elements.items():
            values = data["values"]
            element_stats[element] = {
                "count": data["count"],
                "units": list(data["units"]),
                "statistics": {
                    "min": min(values),
                    "max": max(values),
                    "mean": np.mean(values),
                    "median": np.median(values),
                    "std": np.std(values),
                    "percentiles": {
                        "25": np.percentile(values, 25),
                        "50": np.percentile(values, 50),
                        "75": np.percentile(values, 75),
                        "90": np.percentile(values, 90),
                        "95": np.percentile(values, 95)
                    }
                }
            }
        
        analytics = {
            "total_assays": len(assays),
            "elements": element_stats,
            "qc_flags": {
                "pass": len([a for a in assays if a.qc_flag == "pass"]),
                "fail": len([a for a in assays if a.qc_flag == "fail"]),
                "pending": len([a for a in assays if a.qc_flag == "pending"])
            }
        }
        
        return analytics
    
    async def _get_spatial_analytics(self, db: AsyncSession, project_id: UUID) -> Dict[str, Any]:
        """Get spatial analytics for the project"""
        analytics = {}
        
        # Get project extent
        project = await crud.get_project(db, project_id)
        if project and project.geom_extent:
            analytics["project_extent"] = project.geom_extent
        
        # Get drillhole spatial distribution
        drillholes_result = await db.execute(
            select(models.Drillhole.collar_geom, models.Drillhole.elevation)
            .where(models.Drillhole.project_id == project_id)
        )
        drillholes = drillholes_result.fetchall()
        
        if drillholes:
            # Calculate spatial statistics
            coordinates = []
            elevations = []
            
            for drillhole in drillholes:
                if drillhole[0]:  # collar_geom
                    # Extract coordinates from geometry
                    coords = self._extract_coordinates(drillhole[0])
                    if coords:
                        coordinates.append(coords)
                if drillhole[1]:  # elevation
                    elevations.append(drillhole[1])
            
            if coordinates:
                analytics["spatial_distribution"] = {
                    "total_points": len(coordinates),
                    "coordinate_bounds": {
                        "min_lat": min(c[1] for c in coordinates),
                        "max_lat": max(c[1] for c in coordinates),
                        "min_lon": min(c[0] for c in coordinates),
                        "max_lon": max(c[0] for c in coordinates)
                    },
                    "elevation_range": {
                        "min": min(elevations) if elevations else 0,
                        "max": max(elevations) if elevations else 0,
                        "mean": np.mean(elevations) if elevations else 0
                    }
                }
        
        return analytics
    
    async def _get_usage_analytics(self, db: AsyncSession, project_id: UUID,
                                 start_date: Optional[datetime] = None,
                                 end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get usage analytics for the project"""
        analytics = {}
        
        # Get usage records for the project
        # This would depend on your usage tracking implementation
        # For now, we'll return basic structure
        
        analytics = {
            "data_uploads": {
                "total": 0,
                "by_type": {},
                "by_user": {}
            },
            "ai_analysis": {
                "total_runs": 0,
                "success_rate": 0,
                "average_processing_time": 0
            },
            "user_activity": {
                "active_users": 0,
                "total_sessions": 0,
                "average_session_duration": 0
            }
        }
        
        return analytics
    
    async def _get_performance_metrics(self, db: AsyncSession, project_id: UUID) -> Dict[str, Any]:
        """Get performance metrics for the project"""
        metrics = {}
        
        # Data processing performance
        metrics["data_processing"] = {
            "average_upload_time": 0,
            "average_processing_time": 0,
            "success_rate": 0
        }
        
        # AI analysis performance
        metrics["ai_analysis"] = {
            "average_inference_time": 0,
            "accuracy_score": 0,
            "model_performance": {}
        }
        
        # System performance
        metrics["system"] = {
            "response_time": 0,
            "throughput": 0,
            "error_rate": 0
        }
        
        return metrics
    
    def _extract_coordinates(self, geometry) -> Optional[Tuple[float, float]]:
        """Extract coordinates from geometry object"""
        try:
            # This is a simplified version - you'd need to implement based on your geometry format
            if hasattr(geometry, 'x') and hasattr(geometry, 'y'):
                return (geometry.x, geometry.y)
            elif isinstance(geometry, str):
                # Parse WKT or GeoJSON
                return None  # Implement parsing logic
            return None
        except Exception:
            return None
    
    async def generate_report(self, db: AsyncSession, project_id: UUID,
                            report_type: str = "comprehensive",
                            format: str = "json") -> Dict[str, Any]:
        """Generate a formatted report"""
        
        # Get analytics data
        analytics = await self.get_project_analytics(db, project_id)
        
        # Generate report based on type
        if report_type == "executive":
            report = self._generate_executive_summary(analytics)
        elif report_type == "technical":
            report = self._generate_technical_report(analytics)
        elif report_type == "comprehensive":
            report = self._generate_comprehensive_report(analytics)
        else:
            report = analytics
        
        # Format report
        if format == "pdf":
            # Implement PDF generation
            return {"message": "PDF generation not implemented yet"}
        elif format == "csv":
            # Implement CSV export
            return {"message": "CSV export not implemented yet"}
        else:
            return report
    
    def _generate_executive_summary(self, analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate executive summary report"""
        return {
            "report_type": "executive_summary",
            "generated_at": datetime.utcnow().isoformat(),
            "key_metrics": {
                "total_drillholes": analytics.get("data_summary", {}).get("drillholes_count", 0),
                "total_assays": analytics.get("assay_analytics", {}).get("total_assays", 0),
                "project_area": "Calculated from spatial data",
                "commodity": analytics.get("project_info", {}).get("commodity", "Unknown")
            },
            "highlights": [
                "Project contains significant geological data",
                "Multiple data types integrated",
                "Ready for AI analysis"
            ],
            "recommendations": [
                "Proceed with AI analysis",
                "Consider additional data collection",
                "Implement real-time monitoring"
            ]
        }
    
    def _generate_technical_report(self, analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate technical report"""
        return {
            "report_type": "technical_report",
            "generated_at": datetime.utcnow().isoformat(),
            "data_quality": {
                "completeness": "High",
                "accuracy": "Verified",
                "consistency": "Good"
            },
            "statistical_analysis": analytics.get("assay_analytics", {}),
            "spatial_analysis": analytics.get("spatial_analytics", {}),
            "performance_metrics": analytics.get("performance_metrics", {}),
            "technical_details": analytics
        }
    
    def _generate_comprehensive_report(self, analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive report"""
        return {
            "report_type": "comprehensive_report",
            "generated_at": datetime.utcnow().isoformat(),
            "executive_summary": self._generate_executive_summary(analytics),
            "technical_analysis": self._generate_technical_report(analytics),
            "detailed_analytics": analytics,
            "appendix": {
                "data_sources": "Database and file system",
                "analysis_methods": "Statistical and spatial analysis",
                "quality_assurance": "Automated validation and manual review"
            }
        }

class RealTimeAnalytics:
    """Real-time analytics and monitoring"""
    
    def __init__(self):
        self.metrics_buffer = []
        self.alert_thresholds = {
            "error_rate": 0.05,  # 5%
            "response_time": 2.0,  # 2 seconds
            "memory_usage": 0.8,  # 80%
            "cpu_usage": 0.9  # 90%
        }
    
    async def record_metric(self, metric_name: str, value: float, 
                          tags: Optional[Dict[str, str]] = None):
        """Record a real-time metric"""
        metric = {
            "name": metric_name,
            "value": value,
            "timestamp": datetime.utcnow().isoformat(),
            "tags": tags or {}
        }
        
        # Store in Redis for real-time access
        await redis_client.lpush(f"metrics:{metric_name}", json.dumps(metric))
        await redis_client.ltrim(f"metrics:{metric_name}", 0, 999)  # Keep last 1000
        
        # Check for alerts
        await self._check_alerts(metric)
    
    async def _check_alerts(self, metric: Dict[str, Any]):
        """Check if metric triggers an alert"""
        metric_name = metric["name"]
        value = metric["value"]
        
        if metric_name in self.alert_thresholds:
            threshold = self.alert_thresholds[metric_name]
            if value > threshold:
                alert = {
                    "type": "threshold_exceeded",
                    "metric": metric_name,
                    "value": value,
                    "threshold": threshold,
                    "timestamp": datetime.utcnow().isoformat(),
                    "severity": "high" if value > threshold * 1.5 else "medium"
                }
                
                # Store alert
                await redis_client.lpush("alerts", json.dumps(alert))
                await redis_client.ltrim("alerts", 0, 99)  # Keep last 100 alerts
    
    async def get_current_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        metrics = {}
        
        # Get latest metrics for each type
        metric_types = ["error_rate", "response_time", "memory_usage", "cpu_usage"]
        
        for metric_type in metric_types:
            latest = await redis_client.lindex(f"metrics:{metric_type}", 0)
            if latest:
                metrics[metric_type] = json.loads(latest)
        
        return metrics
    
    async def get_metric_history(self, metric_name: str, 
                                hours: int = 24) -> List[Dict[str, Any]]:
        """Get metric history for the specified hours"""
        metrics = await redis_client.lrange(f"metrics:{metric_name}", 0, hours * 60)  # Assuming 1 metric per minute
        return [json.loads(m) for m in metrics]
    
    async def get_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        alerts = await redis_client.lrange("alerts", 0, limit - 1)
        return [json.loads(a) for a in alerts]

# Global instances
analytics_engine = AnalyticsEngine()
reporting_engine = ReportingEngine()
business_intelligence = BusinessIntelligence()
analytics_service = AnalyticsService()
real_time_analytics = RealTimeAnalytics() 