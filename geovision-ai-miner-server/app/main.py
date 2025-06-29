from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import time
import os
from contextlib import asynccontextmanager
from .auth import router as auth_router
from .api.endpoints.projects import router as projects_router
from .api.endpoints.data import router as data_router
from .api.endpoints.ai import router as ai_router
from .api.endpoints.comments import router as comments_router
from .api.endpoints.mining_ai import router as mining_ai_router
from .api.endpoints.pricing import router as pricing_router
from .api.endpoints.analytics import router as analytics_router
from .api.endpoints.collaboration import router as collaboration_router
from .websockets import start_background_tasks
from .performance import performance_monitor, real_time_analytics
from .database import engine
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting GeoVision AI Miner Server...")
    
    # Start background tasks
    await start_background_tasks()
    
    # Initialize database
    try:
        # Test database connection
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down GeoVision AI Miner Server...")

# Create FastAPI app
app = FastAPI(
    title="GeoVision AI Miner API",
    description="Advanced geological data analysis and AI-powered mining insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure with your domain in production
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Performance monitoring middleware
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    """Middleware to monitor request performance"""
    start_time = time.time()
    
    # Record request start
    await real_time_analytics.record_metric(
        "http_requests_total",
        1,
        {"method": request.method, "path": request.url.path}
    )
    
    try:
        response = await call_next(request)
        
        # Record successful request
        await real_time_analytics.record_metric(
            "http_requests_success",
            1,
            {"method": request.method, "path": request.url.path, "status_code": response.status_code}
        )
        
        return response
    
    except Exception as e:
        # Record failed request
        await real_time_analytics.record_metric(
            "http_requests_error",
            1,
            {"method": request.method, "path": request.url.path, "error": str(e)}
        )
        raise
    
    finally:
        # Record request duration
        duration = time.time() - start_time
        await real_time_analytics.record_metric(
            "http_request_duration",
            duration,
            {"method": request.method, "path": request.url.path}
        )

# Security headers middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Middleware to add security headers"""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Add HSTS header if HTTPS
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Record error metric
    await real_time_analytics.record_metric(
        "application_errors",
        1,
        {"error_type": type(exc).__name__, "path": request.url.path}
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": time.time()
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        
        # Check Redis connection
        import redis.asyncio as redis
        redis_client = redis.from_url("redis://localhost:6379/0", decode_responses=True)
        await redis_client.ping()
        
        # Get system metrics
        system_metrics = await performance_monitor.get_system_metrics()
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "system_metrics": {
                "cpu_usage": system_metrics["cpu"]["usage_percent"],
                "memory_usage": system_metrics["memory"]["percent"],
                "disk_usage": system_metrics["disk"]["percent"]
            }
        }
    
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": time.time()
            }
        )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GeoVision AI Miner API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/health"
    }

# Include all routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(data_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(comments_router, prefix="/api/v1")
app.include_router(mining_ai_router, prefix="/api/v1")
app.include_router(pricing_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(collaboration_router, prefix="/api/v1")

# WebSocket endpoint for real-time collaboration
from .websockets import websocket_endpoint
@app.websocket("/ws/{room_id}")
async def websocket_endpoint_wrapper(websocket, room_id: str, token: str):
    """WebSocket endpoint wrapper"""
    await websocket_endpoint(websocket, room_id, token)

# API documentation customization
app.title = "GeoVision AI Miner API"
app.description = """
## Advanced Geological Data Analysis Platform

This API provides comprehensive tools for geological data analysis, AI-powered insights, and real-time collaboration.

### Key Features:
- **Data Management**: Upload and manage LiDAR, photogrammetry, and GIS data
- **AI Analysis**: Advanced machine learning for geological insights
- **Real-time Collaboration**: Live collaboration tools with WebSocket support
- **Analytics & Reporting**: Comprehensive analytics and report generation
- **User Management**: Role-based access control and authentication
- **Performance Monitoring**: Real-time system monitoring and optimization

### Authentication:
All endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Rate Limiting:
API requests are rate-limited to ensure fair usage. Limits are applied per user and endpoint.

### WebSocket Support:
Real-time collaboration features are available via WebSocket connections at `/ws/{room_id}`.
"""

# Add custom tags for better API documentation
app.openapi_tags = [
    {
        "name": "authentication",
        "description": "User authentication and authorization endpoints"
    },
    {
        "name": "projects",
        "description": "Project management and organization"
    },
    {
        "name": "data",
        "description": "Data upload, management, and processing"
    },
    {
        "name": "ai",
        "description": "AI-powered analysis and machine learning features"
    },
    {
        "name": "mining_ai",
        "description": "Specialized mining AI analysis tools"
    },
    {
        "name": "analytics",
        "description": "Analytics, reporting, and data insights"
    },
    {
        "name": "collaboration",
        "description": "Real-time collaboration and communication"
    },
    {
        "name": "pricing",
        "description": "Subscription and billing management"
    },
    {
        "name": "comments",
        "description": "User comments and annotations"
    }
] 