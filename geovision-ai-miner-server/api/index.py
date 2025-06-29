from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

app = FastAPI(title="GeoVision AI Miner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://geo-miner.com", "https://www.geo-miner.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    status: str = "active"
    created_at: Optional[str] = None

class Analytics(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    total_data_points: int
    ai_models_trained: int
    accuracy_rate: float

# Mock data storage (in production, use a real database)
projects_db = [
    {
        "id": 1,
        "name": "Mining Project Alpha",
        "description": "Advanced geological analysis project",
        "status": "active",
        "created_at": "2024-01-15T10:30:00Z"
    },
    {
        "id": 2,
        "name": "Drill Site Beta",
        "description": "Drill hole analysis and mapping",
        "status": "completed",
        "created_at": "2024-01-10T14:20:00Z"
    }
]

@app.get("/")
async def root():
    return {"message": "GeoVision AI Miner API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "geovision-ai-miner-api"
    }

@app.get("/api/v1/projects", response_model=List[Project])
async def get_projects():
    return projects_db

@app.post("/api/v1/projects", response_model=Project)
async def create_project(project: Project):
    new_project = {
        "id": len(projects_db) + 1,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_at": datetime.utcnow().isoformat()
    }
    projects_db.append(new_project)
    return new_project

@app.get("/api/v1/analytics", response_model=Analytics)
async def get_analytics():
    return {
        "total_projects": len(projects_db),
        "active_projects": len([p for p in projects_db if p["status"] == "active"]),
        "completed_projects": len([p for p in projects_db if p["status"] == "completed"]),
        "total_data_points": 125000,
        "ai_models_trained": 3,
        "accuracy_rate": 94.2
    }

@app.get("/api/v1/pricing")
async def get_pricing():
    pricing_plans = [
        {
            "id": "starter",
            "name": "Starter",
            "price": 29,
            "interval": "month",
            "features": [
                "Up to 5 projects",
                "Basic AI analysis",
                "Email support",
                "1GB storage"
            ]
        },
        {
            "id": "professional",
            "name": "Professional",
            "price": 99,
            "interval": "month",
            "features": [
                "Up to 25 projects",
                "Advanced AI models",
                "Priority support",
                "10GB storage",
                "API access"
            ]
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price": 299,
            "interval": "month",
            "features": [
                "Unlimited projects",
                "Custom AI models",
                "24/7 support",
                "Unlimited storage",
                "API access",
                "Custom integrations"
            ]
        }
    ]
    return {"success": True, "data": pricing_plans}

# Vercel serverless function handler
def handler(request, context):
    """Vercel serverless function handler"""
    import asyncio
    from mangum import Mangum
    
    # Create Mangum handler
    mangum_handler = Mangum(app)
    
    # Handle the request
    return mangum_handler(request, context) 