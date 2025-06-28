from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, database, models
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/ai", tags=["ai"])

async def get_db():
    async with database.SessionLocal() as session:
        yield session

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        roles: list = payload.get("roles", [])
        if user_id is None:
            raise credentials_exception
        return {"user_id": user_id, "roles": roles}
    except JWTError:
        raise credentials_exception

@router.post("/run")
async def run_ai_job(project_id: str, model_id: str, area_geojson: dict, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # TODO: Submit AI job to queue
    return {"message": "AI job submitted (stub)", "project_id": project_id, "model_id": model_id}

@router.get("/status/{run_id}")
async def ai_job_status(run_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # TODO: Return AI job status
    return {"run_id": run_id, "status": "pending"}

@router.get("/models", response_model=list[schemas.AIModelOut])
async def list_ai_models(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(models.AIModel))
    return result.scalars().all()

@router.get("/status", response_model=list[schemas.AIRunOut])
async def list_ai_runs(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(models.AIRun))
    return result.scalars().all() 