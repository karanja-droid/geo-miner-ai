from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import schemas, database, models
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os
from datetime import datetime
import uuid

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/comments", tags=["comments"])

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

@router.post("/", response_model=schemas.CommentOut)
async def post_comment(comment: schemas.CommentCreate, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    comment_id = str(uuid.uuid4())
    db_comment = models.Comment(
        comment_id=comment_id,
        project_id=comment.project_id,
        user_id=comment.user_id,
        comment_text=comment.comment_text,
        geom=comment.geom,
        timestamp=datetime.utcnow()
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

@router.get("/list/{project_id}", response_model=list[schemas.CommentOut])
async def list_comments(project_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(models.Comment).where(models.Comment.project_id == project_id))
    return result.scalars().all() 