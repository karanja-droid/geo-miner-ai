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