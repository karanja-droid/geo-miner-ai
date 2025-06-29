from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, database, models
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
import shutil
from datetime import datetime
import uuid
from typing import List

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/data", tags=["data"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_datasets")
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

@router.post("/upload", response_model=schemas.DatasetOut)
async def upload_data(
    file: UploadFile = File(...),
    datasetName: str = Form(...),
    dataType: str = Form(...),
    description: str = Form(None),
    projectId: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    # Save file to local directory
    dataset_id = str(uuid.uuid4())
    filename = f"{dataset_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Store metadata in DB
    db_dataset = models.Dataset(
        dataset_id=dataset_id,
        project_id=projectId,
        name=datasetName,
        data_type=dataType,
        file_url=file_path,
        schema=None,
        visible_to="project_members",
        upload_date=datetime.utcnow()
    )
    db.add(db_dataset)
    await db.commit()
    await db.refresh(db_dataset)
    return db_dataset

@router.get("/list", response_model=list[schemas.DatasetOut])
async def list_datasets(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(models.Dataset))
    return result.scalars().all()

@router.post("/photogrammetry/upload", response_model=schemas.PhotogrammetryOut)
async def upload_photogrammetry(
    file: UploadFile = File(...),
    name: str = Form(...),
    fileType: str = Form(...),
    description: str = Form(None),
    projectId: str = Form(...),
    metadata: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    photogrammetry_id = str(uuid.uuid4())
    filename = f"{photogrammetry_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Parse metadata if provided
    meta = None
    if metadata:
        import json
        meta = json.loads(metadata)
    photogrammetry_in = schemas.PhotogrammetryCreate(
        project_id=projectId,
        name=name,
        description=description,
        file_type=fileType,
        metadata=meta
    )
    db_photogrammetry = await crud.create_photogrammetry(db, photogrammetry_in, file_url=file_path, uploader_id=user["user_id"])
    return db_photogrammetry

@router.get("/photogrammetry/{photogrammetry_id}", response_model=schemas.PhotogrammetryOut)
async def get_photogrammetry(photogrammetry_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    photogrammetry = await crud.get_photogrammetry(db, photogrammetry_id)
    if not photogrammetry:
        raise HTTPException(status_code=404, detail="Photogrammetry dataset not found")
    return photogrammetry

@router.get("/photogrammetry/project/{project_id}", response_model=List[schemas.PhotogrammetryOut])
async def list_photogrammetry_by_project(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.list_photogrammetry_by_project(db, project_id)

@router.post("/lidar/upload", response_model=schemas.LiDAROut)
async def upload_lidar(
    file: UploadFile = File(...),
    name: str = Form(...),
    fileType: str = Form(...),
    description: str = Form(None),
    projectId: str = Form(...),
    metadata: str = Form(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    lidar_id = str(uuid.uuid4())
    filename = f"{lidar_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Parse metadata if provided
    meta = None
    if metadata:
        import json
        meta = json.loads(metadata)
    lidar_in = schemas.LiDARCreate(
        project_id=projectId,
        name=name,
        description=description,
        file_type=fileType,
        metadata=meta
    )
    db_lidar = await crud.create_lidar(db, lidar_in, file_url=file_path, uploader_id=user["user_id"])
    return db_lidar

@router.get("/lidar/{lidar_id}", response_model=schemas.LiDAROut)
async def get_lidar(lidar_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    lidar = await crud.get_lidar(db, lidar_id)
    if not lidar:
        raise HTTPException(status_code=404, detail="LiDAR dataset not found")
    return lidar

@router.get("/lidar/project/{project_id}", response_model=List[schemas.LiDAROut])
async def list_lidar_by_project(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.list_lidar_by_project(db, project_id)

@router.post("/gis/layers", response_model=schemas.GISLayerOut)
async def create_gis_layer(
    gis_layer: schemas.GISLayerCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    db_gis_layer = await crud.create_gis_layer(db, gis_layer, uploader_id=user["user_id"])
    return db_gis_layer

@router.get("/gis/layers/{layer_id}", response_model=schemas.GISLayerOut)
async def get_gis_layer(layer_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    gis_layer = await crud.get_gis_layer(db, layer_id)
    if not gis_layer:
        raise HTTPException(status_code=404, detail="GIS layer not found")
    return gis_layer

@router.get("/gis/layers/project/{project_id}", response_model=List[schemas.GISLayerOut])
async def list_gis_layers_by_project(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.list_gis_layers_by_project(db, project_id)

@router.patch("/gis/layers/{layer_id}/visibility")
async def update_gis_layer_visibility(
    layer_id: str,
    visible: bool = Form(...),
    opacity: float = Form(1.0),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    gis_layer = await crud.update_gis_layer_visibility(db, layer_id, visible, opacity)
    if not gis_layer:
        raise HTTPException(status_code=404, detail="GIS layer not found")
    return {"message": "Layer visibility updated", "layer_id": layer_id, "visible": visible, "opacity": opacity}

@router.post("/drillholes", response_model=schemas.DrillholeOut)
async def create_drillhole(
    drillhole: schemas.DrillholeCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    db_drillhole = await crud.create_drillhole(db, drillhole, owner_id=user["user_id"])
    return db_drillhole

@router.get("/drillholes/project/{project_id}", response_model=List[schemas.DrillholeOut])
async def list_drillholes_by_project(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.list_drillholes_by_project(db, project_id)

@router.get("/drillholes/{drillhole_id}", response_model=schemas.DrillholeOut)
async def get_drillhole(drillhole_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    drillhole = await crud.get_drillhole(db, drillhole_id)
    if not drillhole:
        raise HTTPException(status_code=404, detail="Drillhole not found")
    return drillhole

@router.post("/drill-intervals", response_model=schemas.DrillIntervalOut)
async def create_drill_interval(
    interval: schemas.DrillIntervalCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    db_interval = await crud.create_drill_interval(db, interval)
    return db_interval

@router.get("/drill-intervals/{drillhole_id}", response_model=List[schemas.DrillIntervalOut])
async def get_drill_intervals(drillhole_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.get_drill_intervals(db, drillhole_id)

@router.post("/assays", response_model=schemas.AssayOut)
async def create_assay(
    assay: schemas.AssayCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    db_assay = await crud.create_assay(db, assay)
    return db_assay

@router.get("/assays/interval/{interval_id}", response_model=List[schemas.AssayOut])
async def get_assays_by_interval(interval_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    return await crud.get_assays_by_interval(db, interval_id)

@router.post("/offline/sync", response_model=schemas.OfflineSyncOut)
async def create_offline_sync(
    sync_data: schemas.OfflineSyncCreate,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    db_sync = await crud.create_offline_sync(db, sync_data)
    return db_sync

@router.get("/offline/sync/pending", response_model=List[schemas.OfflineSyncOut])
async def get_pending_syncs(
    project_id: str = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    return await crud.get_pending_syncs(db, user["user_id"], project_id)

@router.patch("/offline/sync/{sync_id}/status")
async def update_sync_status(
    sync_id: str,
    status: str = Form(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    synced_at = datetime.utcnow() if status == 'synced' else None
    sync_record = await crud.update_sync_status(db, sync_id, status, synced_at)
    if not sync_record:
        raise HTTPException(status_code=404, detail="Sync record not found")
    return {"message": "Sync status updated", "sync_id": sync_id, "status": status}

@router.post("/offline/sync/{sync_id}/resolve")
async def resolve_conflicts(
    sync_id: str,
    resolution: dict,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    sync_record = await crud.resolve_conflicts(db, sync_id, resolution)
    if not sync_record:
        raise HTTPException(status_code=404, detail="Sync record not found")
    return {"message": "Conflict resolved", "sync_id": sync_id}

@router.get("/offline/sync/status", response_model=schemas.SyncStatus)
async def get_sync_status(
    project_id: str = None,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    status_data = await crud.get_sync_status(db, user["user_id"], project_id)
    return {
        "is_online": True,  # This would be determined by the client
        "last_sync": status_data["last_sync"],
        "pending_items": status_data["pending_items"],
        "total_size": status_data["total_size"],
        "sync_progress": status_data["sync_progress"]
    } 