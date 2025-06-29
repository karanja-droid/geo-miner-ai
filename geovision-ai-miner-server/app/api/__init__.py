from fastapi import APIRouter
from .endpoints import projects, data, ai, comments, mining_ai, pricing

api_router = APIRouter()
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(data.router, prefix="/data", tags=["data"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(comments.router, prefix="/comments", tags=["comments"])
api_router.include_router(mining_ai.router, prefix="/mining-ai", tags=["mining-ai"])
api_router.include_router(pricing.router, prefix="/pricing", tags=["pricing"]) 