"""
Main API router for v1 endpoints.
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    auth,
    users,
    projects,
    datasets,
    ai_runs,
    comments,
    geological_domains,
    mining_ai,
    model3d,
    maps,
    admin,
    geological_graph,
    ai_analysis,
    chained_analysis,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(datasets.router, prefix="/data", tags=["datasets"])
api_router.include_router(ai_runs.router, prefix="/ai", tags=["ai-analysis"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(geological_domains.router, prefix="/model3d", tags=["3d-modeling"])
api_router.include_router(mining_ai.router, prefix="/ai/mining", tags=["mining-ai"])
api_router.include_router(model3d.router, prefix="/model3d", tags=["3d-modeling"])
api_router.include_router(maps.router, prefix="/api/maps", tags=["maps"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(geological_graph.router, prefix="/geological-graph", tags=["geological-graph"])
api_router.include_router(ai_analysis.router, prefix="/ai/analysis", tags=["ai-analysis"])
api_router.include_router(chained_analysis.router, prefix="/chained-analysis", tags=["chained-analysis"]) 