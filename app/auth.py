from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from . import schemas, crud, database
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_db():
    async with database.SessionLocal() as session:
        yield session

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=schemas.UserOut)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = await crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = await crud.create_user(db, user, hashed_password)
    return schemas.UserOut(
        user_id=new_user.user_id,
        email=new_user.email,
        roles=new_user.roles,
        mfa_enabled=new_user.mfa_enabled,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at
    )

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": str(user.user_id), "roles": user.roles})
    return {"access_token": access_token, "token_type": "bearer", "user": {
        "userId": str(user.user_id),
        "email": user.email,
        "roles": user.roles
    }} 