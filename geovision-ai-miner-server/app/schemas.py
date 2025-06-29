from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, UUID4, Field
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

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

class PhotogrammetryBase(BaseModel):
    project_id: UUID4
    name: str
    description: Optional[str]
    file_type: str
    metadata: Optional[dict]

class PhotogrammetryCreate(PhotogrammetryBase):
    pass

class PhotogrammetryOut(PhotogrammetryBase):
    photogrammetry_id: UUID4
    file_url: str
    upload_date: Optional[datetime]
    uploader_id: UUID4

class LiDARBase(BaseModel):
    project_id: UUID4
    name: str
    description: Optional[str]
    file_type: str
    metadata: Optional[dict]

class LiDARCreate(LiDARBase):
    pass

class LiDAROut(LiDARBase):
    lidar_id: UUID4
    file_url: str
    upload_date: Optional[datetime]
    uploader_id: UUID4

class GISLayerBase(BaseModel):
    project_id: UUID4
    name: str
    description: Optional[str]
    layer_type: str
    data_source: str
    metadata: Optional[dict]
    visible: Optional[bool] = True
    opacity: Optional[float] = 1.0

class GISLayerCreate(GISLayerBase):
    pass

class GISLayerOut(GISLayerBase):
    layer_id: UUID4
    upload_date: Optional[datetime]
    uploader_id: UUID4

class OfflineSyncBase(BaseModel):
    user_id: UUID4
    project_id: UUID4
    data_type: str
    data_id: str
    operation: str
    data_snapshot: Optional[dict]
    status: Optional[str] = 'pending'
    conflict_resolution: Optional[dict]

class OfflineSyncCreate(OfflineSyncBase):
    pass

class OfflineSyncOut(OfflineSyncBase):
    sync_id: UUID4
    created_at: Optional[datetime]
    synced_at: Optional[datetime]

class SyncStatus(BaseModel):
    is_online: bool
    last_sync: Optional[datetime]
    pending_items: int
    total_size: int
    sync_progress: int

@app.get("/health", tags=["health"])
async def health_check(db: AsyncSession = Depends(database.SessionLocal)):
    try:
        await db.execute("SELECT 1")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

# SaaS Pricing Schemas
class PricingPlanBase(BaseModel):
    name: str = Field(..., description="Plan name (e.g., Starter, Professional, Enterprise)")
    description: Optional[str] = Field(None, description="Plan description")
    price_monthly: Decimal = Field(..., description="Monthly price in USD")
    price_yearly: Decimal = Field(..., description="Yearly price in USD")
    features: List[str] = Field(default_factory=list, description="List of features included")
    limits: Dict[str, Any] = Field(default_factory=dict, description="Usage limits")

class PricingPlanCreate(PricingPlanBase):
    pass

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_monthly: Optional[Decimal] = None
    price_yearly: Optional[Decimal] = None
    features: Optional[List[str]] = None
    limits: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class PricingPlan(PricingPlanBase):
    plan_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionBase(BaseModel):
    plan_id: UUID
    billing_cycle: str = Field(default="monthly", description="monthly or yearly")
    auto_renew: bool = Field(default=True, description="Auto-renew subscription")

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    billing_cycle: Optional[str] = None
    auto_renew: Optional[bool] = None
    status: Optional[str] = None

class Subscription(SubscriptionBase):
    subscription_id: UUID
    user_id: UUID
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UsageBase(BaseModel):
    usage_type: str = Field(..., description="Type of usage (storage, api_calls, users, etc.)")
    amount: Decimal = Field(..., description="Current usage amount")
    limit: Decimal = Field(..., description="Usage limit for this type")
    period_start: datetime
    period_end: datetime

class UsageCreate(UsageBase):
    subscription_id: Optional[UUID] = None

class Usage(UsageBase):
    usage_id: UUID
    user_id: UUID
    subscription_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BillingBase(BaseModel):
    amount: Decimal = Field(..., description="Billing amount")
    currency: str = Field(default="USD", description="Currency code")
    billing_date: datetime
    due_date: datetime
    description: Optional[str] = None

class BillingCreate(BillingBase):
    pass

class BillingUpdate(BaseModel):
    status: Optional[str] = None
    paid_date: Optional[datetime] = None
    stripe_invoice_id: Optional[str] = None

class Billing(BillingBase):
    billing_id: UUID
    subscription_id: UUID
    status: str
    paid_date: Optional[datetime] = None
    stripe_invoice_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    amount: Decimal = Field(..., description="Payment amount")
    currency: str = Field(default="USD", description="Currency code")
    payment_method: str = Field(..., description="Payment method used")
    transaction_date: datetime

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    stripe_payment_id: Optional[str] = None

class Payment(PaymentBase):
    payment_id: UUID
    billing_id: UUID
    status: str
    stripe_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class UsageSummary(BaseModel):
    usage_type: str
    current_usage: Decimal
    limit: Decimal
    percentage_used: float
    period_start: datetime
    period_end: datetime

class BillingSummary(BaseModel):
    current_plan: PricingPlan
    subscription: Subscription
    next_billing_date: datetime
    total_usage: List[UsageSummary]
    recent_bills: List[Billing]

class SubscriptionStatus(BaseModel):
    is_active: bool
    plan_name: str
    billing_cycle: str
    next_billing_date: Optional[datetime] = None
    usage_warnings: List[str] = Field(default_factory=list)