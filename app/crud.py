from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.UserCreate, password_hash: str):
    db_user = models.User(
        email=user.email,
        password_hash=password_hash,
        roles=user.roles,
        mfa_enabled=user.mfa_enabled
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_project(db: AsyncSession, project_id):
    result = await db.execute(select(models.Project).where(models.Project.project_id == project_id))
    return result.scalars().first()

async def create_project(db: AsyncSession, project: schemas.ProjectCreate, owner_id):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        commodity=project.commodity,
        owner_id=owner_id,
        geom_extent=project.geom_extent
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project 