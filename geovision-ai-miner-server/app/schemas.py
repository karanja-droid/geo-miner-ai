from pydantic import BaseModel, EmailStr, UUID4
from typing import List, Optional
from datetime import datetime
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .api import database  # adjust import if needed

class UserBase(BaseModel):
    email: EmailStr
    roles: List[str]
    mfa_enabled: bool = False

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    user_id: UUID4
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class ProjectBase(BaseModel):
    name: str
    description: Optional[str]
    commodity: str

class ProjectCreate(ProjectBase):
    geom_extent: dict

class ProjectOut(ProjectBase):
    project_id: UUID4
    owner_id: UUID4
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    geom_extent: dict

class DatasetBase(BaseModel):
    name: str
    data_type: str
    description: Optional[str]

class DatasetCreate(DatasetBase):
    project_id: UUID4

class DatasetOut(DatasetBase):
    dataset_id: UUID4
    file_url: str
    upload_date: Optional[datetime]

class DrillholeBase(BaseModel):
    project_id: UUID4
    elevation: Optional[float]
    drilling_date: Optional[datetime]
    driller: Optional[str]
    status: Optional[str]

class DrillholeCreate(DrillholeBase):
    collar_geom: dict

class DrillholeOut(DrillholeBase):
    drillhole_id: UUID4
    collar_geom: dict

class DrillIntervalBase(BaseModel):
    drillhole_id: UUID4
    from_depth: float
    to_depth: float
    lithology: Optional[str]
    azm: Optional[float]
    dip: Optional[float]

class DrillIntervalCreate(DrillIntervalBase):
    pass

class DrillIntervalOut(DrillIntervalBase):
    interval_id: UUID4

class AssayBase(BaseModel):
    interval_id: UUID4
    element: str
    value: float
    unit: str
    qc_flag: Optional[str]

class AssayCreate(AssayBase):
    pass

class AssayOut(AssayBase):
    assay_id: UUID4

class AIModelBase(BaseModel):
    name: str
    commodity: str
    version: str

class AIModelCreate(AIModelBase):
    pass

class AIModelOut(AIModelBase):
    model_id: UUID4
    training_date: Optional[datetime]
    performance_metrics: Optional[dict]
    artifact_url: Optional[str]

class AIRunBase(BaseModel):
    project_id: UUID4
    model_id: UUID4
    area_geom: dict

class AIRunCreate(AIRunBase):
    pass

class AIRunOut(AIRunBase):
    run_id: UUID4
    submission_time: Optional[datetime]
    completion_time: Optional[datetime]
    status: Optional[str]
    result_url: Optional[str]

class CommentBase(BaseModel):
    project_id: UUID4
    user_id: UUID4
    comment_text: str
    geom: Optional[dict]

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    comment_id: UUID4
    timestamp: Optional[datetime]

@app.get("/health", tags=["health"])
async def health_check(db: AsyncSession = Depends(database.SessionLocal)):
    try:
        await db.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "details": str(e)}