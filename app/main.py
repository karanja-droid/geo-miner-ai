from fastapi import FastAPI
from .auth import router as auth_router
from .api.endpoints.projects import router as projects_router
from .api.endpoints.data import router as data_router
from .api.endpoints.ai import router as ai_router
from .api.endpoints.comments import router as comments_router
from .api.endpoints.mining_ai import router as mining_ai_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(data_router)
app.include_router(ai_router)
app.include_router(comments_router)
app.include_router(mining_ai_router)

# Routers will be included here 