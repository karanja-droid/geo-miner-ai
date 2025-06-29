from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
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

async def create_photogrammetry(db: AsyncSession, photogrammetry: schemas.PhotogrammetryCreate, file_url: str, uploader_id):
    db_photogrammetry = models.Photogrammetry(
        project_id=photogrammetry.project_id,
        name=photogrammetry.name,
        description=photogrammetry.description,
        file_type=photogrammetry.file_type,
        metadata=photogrammetry.metadata,
        file_url=file_url,
        upload_date=datetime.utcnow(),
        uploader_id=uploader_id
    )
    db.add(db_photogrammetry)
    await db.commit()
    await db.refresh(db_photogrammetry)
    return db_photogrammetry

async def get_photogrammetry(db: AsyncSession, photogrammetry_id):
    result = await db.execute(select(models.Photogrammetry).where(models.Photogrammetry.photogrammetry_id == photogrammetry_id))
    return result.scalar_one_or_none()

async def list_photogrammetry_by_project(db: AsyncSession, project_id):
    result = await db.execute(select(models.Photogrammetry).where(models.Photogrammetry.project_id == project_id))
    return result.scalars().all()

async def create_lidar(db: AsyncSession, lidar: schemas.LiDARCreate, file_url: str, uploader_id):
    db_lidar = models.LiDAR(
        project_id=lidar.project_id,
        name=lidar.name,
        description=lidar.description,
        file_type=lidar.file_type,
        metadata=lidar.metadata,
        file_url=file_url,
        upload_date=datetime.utcnow(),
        uploader_id=uploader_id
    )
    db.add(db_lidar)
    await db.commit()
    await db.refresh(db_lidar)
    return db_lidar

async def get_lidar(db: AsyncSession, lidar_id):
    result = await db.execute(select(models.LiDAR).where(models.LiDAR.lidar_id == lidar_id))
    return result.scalar_one_or_none()

async def list_lidar_by_project(db: AsyncSession, project_id):
    result = await db.execute(select(models.LiDAR).where(models.LiDAR.project_id == project_id))
    return result.scalars().all()

async def create_gis_layer(db: AsyncSession, gis_layer: schemas.GISLayerCreate, uploader_id):
    db_gis_layer = models.GISLayer(
        project_id=gis_layer.project_id,
        name=gis_layer.name,
        description=gis_layer.description,
        layer_type=gis_layer.layer_type,
        data_source=gis_layer.data_source,
        metadata=gis_layer.metadata,
        visible=gis_layer.visible,
        opacity=gis_layer.opacity,
        upload_date=datetime.utcnow(),
        uploader_id=uploader_id
    )
    db.add(db_gis_layer)
    await db.commit()
    await db.refresh(db_gis_layer)
    return db_gis_layer

async def get_gis_layer(db: AsyncSession, layer_id):
    result = await db.execute(select(models.GISLayer).where(models.GISLayer.layer_id == layer_id))
    return result.scalar_one_or_none()

async def list_gis_layers_by_project(db: AsyncSession, project_id):
    result = await db.execute(select(models.GISLayer).where(models.GISLayer.project_id == project_id))
    return result.scalars().all()

async def update_gis_layer_visibility(db: AsyncSession, layer_id, visible: bool, opacity: float = 1.0):
    result = await db.execute(select(models.GISLayer).where(models.GISLayer.layer_id == layer_id))
    gis_layer = result.scalar_one_or_none()
    if gis_layer:
        gis_layer.visible = visible
        gis_layer.opacity = opacity
        await db.commit()
        await db.refresh(gis_layer)
    return gis_layer

async def create_drillhole(db: AsyncSession, drillhole: schemas.DrillholeCreate, owner_id):
    db_drillhole = models.Drillhole(
        project_id=drillhole.project_id,
        collar_geom=drillhole.collar_geom,
        elevation=drillhole.elevation,
        drilling_date=drillhole.drilling_date,
        driller=drillhole.driller,
        status=drillhole.status
    )
    db.add(db_drillhole)
    await db.commit()
    await db.refresh(db_drillhole)
    return db_drillhole

async def get_drillhole(db: AsyncSession, drillhole_id):
    result = await db.execute(select(models.Drillhole).where(models.Drillhole.drillhole_id == drillhole_id))
    return result.scalar_one_or_none()

async def list_drillholes_by_project(db: AsyncSession, project_id):
    result = await db.execute(select(models.Drillhole).where(models.Drillhole.project_id == project_id))
    return result.scalars().all()

async def create_drill_interval(db: AsyncSession, interval: schemas.DrillIntervalCreate):
    db_interval = models.DrillInterval(
        drillhole_id=interval.drillhole_id,
        from_depth=interval.from_depth,
        to_depth=interval.to_depth,
        lithology=interval.lithology,
        azm=interval.azm,
        dip=interval.dip
    )
    db.add(db_interval)
    await db.commit()
    await db.refresh(db_interval)
    return db_interval

async def get_drill_intervals(db: AsyncSession, drillhole_id):
    result = await db.execute(select(models.DrillInterval).where(models.DrillInterval.drillhole_id == drillhole_id))
    return result.scalars().all()

async def create_assay(db: AsyncSession, assay: schemas.AssayCreate):
    db_assay = models.Assay(
        interval_id=assay.interval_id,
        element=assay.element,
        value=assay.value,
        unit=assay.unit,
        qc_flag=assay.qc_flag
    )
    db.add(db_assay)
    await db.commit()
    await db.refresh(db_assay)
    return db_assay

async def get_assays_by_interval(db: AsyncSession, interval_id):
    result = await db.execute(select(models.Assay).where(models.Assay.interval_id == interval_id))
    return result.scalars().all()

async def create_offline_sync(db: AsyncSession, sync_data: schemas.OfflineSyncCreate):
    db_sync = models.OfflineSync(
        user_id=sync_data.user_id,
        project_id=sync_data.project_id,
        data_type=sync_data.data_type,
        data_id=sync_data.data_id,
        operation=sync_data.operation,
        data_snapshot=sync_data.data_snapshot,
        status=sync_data.status,
        conflict_resolution=sync_data.conflict_resolution,
        created_at=datetime.utcnow()
    )
    db.add(db_sync)
    await db.commit()
    await db.refresh(db_sync)
    return db_sync

async def get_pending_syncs(db: AsyncSession, user_id: str, project_id: str = None):
    query = select(models.OfflineSync).where(
        models.OfflineSync.user_id == user_id,
        models.OfflineSync.status == 'pending'
    )
    if project_id:
        query = query.where(models.OfflineSync.project_id == project_id)
    result = await db.execute(query)
    return result.scalars().all()

async def update_sync_status(db: AsyncSession, sync_id: str, status: str, synced_at: datetime = None):
    result = await db.execute(select(models.OfflineSync).where(models.OfflineSync.sync_id == sync_id))
    sync_record = result.scalar_one_or_none()
    if sync_record:
        sync_record.status = status
        if synced_at:
            sync_record.synced_at = synced_at
        await db.commit()
        await db.refresh(sync_record)
    return sync_record

async def resolve_conflicts(db: AsyncSession, sync_id: str, resolution: dict):
    result = await db.execute(select(models.OfflineSync).where(models.OfflineSync.sync_id == sync_id))
    sync_record = result.scalar_one_or_none()
    if sync_record:
        sync_record.conflict_resolution = resolution
        sync_record.status = 'resolved'
        await db.commit()
        await db.refresh(sync_record)
    return sync_record

async def get_sync_status(db: AsyncSession, user_id: str, project_id: str = None):
    # Get pending syncs count
    pending_query = select(models.OfflineSync).where(
        models.OfflineSync.user_id == user_id,
        models.OfflineSync.status == 'pending'
    )
    if project_id:
        pending_query = pending_query.where(models.OfflineSync.project_id == project_id)
    
    pending_result = await db.execute(pending_query)
    pending_count = len(pending_result.scalars().all())
    
    # Get last sync time
    last_sync_query = select(models.OfflineSync).where(
        models.OfflineSync.user_id == user_id,
        models.OfflineSync.status == 'synced'
    ).order_by(models.OfflineSync.synced_at.desc())
    
    last_sync_result = await db.execute(last_sync_query)
    last_sync_record = last_sync_result.scalar_one_or_none()
    last_sync = last_sync_record.synced_at if last_sync_record else None
    
    return {
        "pending_items": pending_count,
        "last_sync": last_sync,
        "total_size": pending_count * 1024,  # Rough estimate
        "sync_progress": 0
    }

# SaaS Pricing CRUD Operations
def create_pricing_plan(db: Session, plan: schemas.PricingPlanCreate) -> models.PricingPlan:
    db_plan = models.PricingPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_pricing_plans(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[models.PricingPlan]:
    query = db.query(models.PricingPlan)
    if active_only:
        query = query.filter(models.PricingPlan.is_active == True)
    return query.offset(skip).limit(limit).all()

def get_pricing_plan(db: Session, plan_id: UUID) -> Optional[models.PricingPlan]:
    return db.query(models.PricingPlan).filter(models.PricingPlan.plan_id == plan_id).first()

def update_pricing_plan(db: Session, plan_id: UUID, plan: schemas.PricingPlanUpdate) -> Optional[models.PricingPlan]:
    db_plan = get_pricing_plan(db, plan_id)
    if db_plan:
        update_data = plan.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_plan, field, value)
        db.commit()
        db.refresh(db_plan)
    return db_plan

def delete_pricing_plan(db: Session, plan_id: UUID) -> bool:
    db_plan = get_pricing_plan(db, plan_id)
    if db_plan:
        db.delete(db_plan)
        db.commit()
        return True
    return False

def create_subscription(db: Session, subscription: schemas.SubscriptionCreate, user_id: UUID) -> models.Subscription:
    db_subscription = models.Subscription(
        **subscription.dict(),
        user_id=user_id,
        start_date=datetime.utcnow(),
        status='active'
    )
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    return db_subscription

def get_user_subscription(db: Session, user_id: UUID) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(
        and_(
            models.Subscription.user_id == user_id,
            models.Subscription.status.in_(['active', 'past_due'])
        )
    ).first()

def get_subscription(db: Session, subscription_id: UUID) -> Optional[models.Subscription]:
    return db.query(models.Subscription).filter(models.Subscription.subscription_id == subscription_id).first()

def update_subscription(db: Session, subscription_id: UUID, subscription: schemas.SubscriptionUpdate) -> Optional[models.Subscription]:
    db_subscription = get_subscription(db, subscription_id)
    if db_subscription:
        update_data = subscription.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_subscription, field, value)
        db_subscription.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_subscription)
    return db_subscription

def cancel_subscription(db: Session, subscription_id: UUID) -> Optional[models.Subscription]:
    db_subscription = get_subscription(db, subscription_id)
    if db_subscription:
        db_subscription.status = 'cancelled'
        db_subscription.end_date = datetime.utcnow()
        db_subscription.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_subscription)
    return db_subscription

def create_usage_record(db: Session, usage: schemas.UsageCreate, user_id: UUID) -> models.Usage:
    db_usage = models.Usage(**usage.dict(), user_id=user_id)
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

def get_user_usage(db: Session, user_id: UUID, usage_type: Optional[str] = None, period_start: Optional[datetime] = None, period_end: Optional[datetime] = None) -> List[models.Usage]:
    query = db.query(models.Usage).filter(models.Usage.user_id == user_id)
    
    if usage_type:
        query = query.filter(models.Usage.usage_type == usage_type)
    if period_start:
        query = query.filter(models.Usage.period_start >= period_start)
    if period_end:
        query = query.filter(models.Usage.period_end <= period_end)
    
    return query.order_by(models.Usage.created_at.desc()).all()

def get_current_usage_summary(db: Session, user_id: UUID) -> List[Dict[str, Any]]:
    """Get current usage summary for all usage types"""
    current_period_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_period_end = (current_period_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
    
    # Get user's subscription and plan
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return []
    
    plan = get_pricing_plan(db, subscription.plan_id)
    if not plan or not plan.limits:
        return []
    
    usage_summary = []
    for usage_type, limit in plan.limits.items():
        # Get current usage for this type
        current_usage = db.query(func.sum(models.Usage.amount)).filter(
            and_(
                models.Usage.user_id == user_id,
                models.Usage.usage_type == usage_type,
                models.Usage.period_start >= current_period_start,
                models.Usage.period_end <= current_period_end
            )
        ).scalar() or Decimal('0')
        
        usage_summary.append({
            'usage_type': usage_type,
            'current_usage': current_usage,
            'limit': Decimal(str(limit)),
            'percentage_used': float(current_usage / Decimal(str(limit)) * 100) if limit > 0 else 0,
            'period_start': current_period_start,
            'period_end': current_period_end
        })
    
    return usage_summary

def create_billing_record(db: Session, billing: schemas.BillingCreate, subscription_id: UUID) -> models.Billing:
    db_billing = models.Billing(**billing.dict(), subscription_id=subscription_id)
    db.add(db_billing)
    db.commit()
    db.refresh(db_billing)
    return db_billing

def get_user_billing_history(db: Session, user_id: UUID, skip: int = 0, limit: int = 50) -> List[models.Billing]:
    return db.query(models.Billing).join(models.Subscription).filter(
        models.Subscription.user_id == user_id
    ).order_by(models.Billing.billing_date.desc()).offset(skip).limit(limit).all()

def get_billing(db: Session, billing_id: UUID) -> Optional[models.Billing]:
    return db.query(models.Billing).filter(models.Billing.billing_id == billing_id).first()

def update_billing_status(db: Session, billing_id: UUID, status: str, stripe_invoice_id: Optional[str] = None) -> Optional[models.Billing]:
    db_billing = get_billing(db, billing_id)
    if db_billing:
        db_billing.status = status
        if status == 'paid':
            db_billing.paid_date = datetime.utcnow()
        if stripe_invoice_id:
            db_billing.stripe_invoice_id = stripe_invoice_id
        db.commit()
        db.refresh(db_billing)
    return db_billing

def create_payment(db: Session, payment: schemas.PaymentCreate, billing_id: UUID) -> models.Payment:
    db_payment = models.Payment(**payment.dict(), billing_id=billing_id)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment(db: Session, payment_id: UUID) -> Optional[models.Payment]:
    return db.query(models.Payment).filter(models.Payment.payment_id == payment_id).first()

def update_payment_status(db: Session, payment_id: UUID, status: str, stripe_payment_id: Optional[str] = None) -> Optional[models.Payment]:
    db_payment = get_payment(db, payment_id)
    if db_payment:
        db_payment.status = status
        if stripe_payment_id:
            db_payment.stripe_payment_id = stripe_payment_id
        db.commit()
        db.refresh(db_payment)
    return db_payment

def get_billing_summary(db: Session, user_id: UUID) -> Optional[Dict[str, Any]]:
    """Get comprehensive billing summary for user dashboard"""
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return None
    
    plan = get_pricing_plan(db, subscription.plan_id)
    if not plan:
        return None
    
    # Calculate next billing date
    if subscription.billing_cycle == 'monthly':
        next_billing = subscription.start_date + timedelta(days=30)
    else:  # yearly
        next_billing = subscription.start_date + timedelta(days=365)
    
    # Get usage summary
    usage_summary = get_current_usage_summary(db, user_id)
    
    # Get recent bills
    recent_bills = get_user_billing_history(db, user_id, limit=5)
    
    return {
        'current_plan': plan,
        'subscription': subscription,
        'next_billing_date': next_billing,
        'total_usage': usage_summary,
        'recent_bills': recent_bills
    }

def check_usage_limits(db: Session, user_id: UUID, usage_type: str, amount: Decimal) -> Dict[str, Any]:
    """Check if user can use the specified amount of a resource"""
    usage_summary = get_current_usage_summary(db, user_id)
    
    for usage in usage_summary:
        if usage['usage_type'] == usage_type:
            new_total = usage['current_usage'] + amount
            return {
                'allowed': new_total <= usage['limit'],
                'current_usage': usage['current_usage'],
                'limit': usage['limit'],
                'new_total': new_total,
                'percentage_used': float(new_total / usage['limit'] * 100) if usage['limit'] > 0 else 0
            }
    
    return {'allowed': True, 'current_usage': Decimal('0'), 'limit': Decimal('0'), 'new_total': amount, 'percentage_used': 0} 