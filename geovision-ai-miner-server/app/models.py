from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Boolean, JSON, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, declarative_base
from geoalchemy2 import Geometry
import enum
import uuid
from datetime import datetime

Base = declarative_base()

class CommodityEnum(enum.Enum):
    copper = "copper"
    gold = "gold"
    lithium = "lithium"
    # Add more as needed

class Project(Base):
    __tablename__ = "projects"
    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    commodity = Column(Enum(CommodityEnum), nullable=False)
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    geom_extent = Column(Geometry("POLYGON", srid=4326))
    # relationships

class Dataset(Base):
    __tablename__ = "datasets"
    dataset_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    name = Column(String, nullable=False)
    data_type = Column(String, nullable=False)
    file_url = Column(String)
    schema = Column(JSON)
    visible_to = Column(String)
    upload_date = Column(DateTime)

class Drillhole(Base):
    __tablename__ = "drillholes"
    drillhole_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    collar_geom = Column(Geometry("POINT", srid=4326))
    elevation = Column(Numeric)
    drilling_date = Column(DateTime)
    driller = Column(String)
    status = Column(String)

class DrillInterval(Base):
    __tablename__ = "drill_intervals"
    interval_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    drillhole_id = Column(UUID(as_uuid=True), ForeignKey("drillholes.drillhole_id"))
    from_depth = Column(Numeric)
    to_depth = Column(Numeric)
    lithology = Column(String)
    azm = Column(Numeric)
    dip = Column(Numeric)

class Assay(Base):
    __tablename__ = "assays"
    assay_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interval_id = Column(UUID(as_uuid=True), ForeignKey("drill_intervals.interval_id"))
    element = Column(String)
    value = Column(Numeric)
    unit = Column(String)
    qc_flag = Column(String)

class AIModel(Base):
    __tablename__ = "ai_models"
    model_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    commodity = Column(String)
    version = Column(String)
    training_date = Column(DateTime)
    performance_metrics = Column(JSON)
    artifact_url = Column(String)

class AIRun(Base):
    __tablename__ = "ai_runs"
    run_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.model_id"))
    area_geom = Column(Geometry("POLYGON", srid=4326))
    submission_time = Column(DateTime)
    completion_time = Column(DateTime)
    status = Column(String)
    result_url = Column(String)

class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    roles = Column(ARRAY(String))
    mfa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Comment(Base):
    __tablename__ = "comments"
    comment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    comment_text = Column(Text)
    geom = Column(Geometry(geometry_type="GEOMETRY", srid=4326))
    timestamp = Column(DateTime)

class Photogrammetry(Base):
    __tablename__ = "photogrammetry"
    photogrammetry_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # e.g., 'pointcloud', 'mesh', 'orthophoto'
    metadata = Column(JSON)
    upload_date = Column(DateTime)
    uploader_id = Column(UUID(as_uuid=True), nullable=False)
    # relationships can be added as needed 

class LiDAR(Base):
    __tablename__ = "lidar"
    lidar_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # e.g., 'las', 'laz', 'dem', 'dsm'
    metadata = Column(JSON)
    upload_date = Column(DateTime)
    uploader_id = Column(UUID(as_uuid=True), nullable=False)
    # relationships can be added as needed 

class GISLayer(Base):
    __tablename__ = "gis_layers"
    layer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    layer_type = Column(String, nullable=False)  # e.g., 'vector', 'raster', 'geojson'
    data_source = Column(String, nullable=False)  # URL or file path
    metadata = Column(JSON)
    visible = Column(Boolean, default=True)
    opacity = Column(Numeric, default=1.0)
    upload_date = Column(DateTime)
    uploader_id = Column(UUID(as_uuid=True), nullable=False)
    # relationships can be added as needed

class OfflineSync(Base):
    __tablename__ = "offline_sync"
    sync_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.project_id"))
    data_type = Column(String, nullable=False)  # e.g., 'drillhole', 'assay', 'photogrammetry'
    data_id = Column(String, nullable=False)  # ID of the data being synced
    operation = Column(String, nullable=False)  # 'create', 'update', 'delete'
    data_snapshot = Column(JSON)  # Snapshot of the data at time of offline change
    created_at = Column(DateTime)
    synced_at = Column(DateTime)
    status = Column(String, default='pending')  # 'pending', 'synced', 'conflict'
    conflict_resolution = Column(JSON)  # Resolution strategy if conflicts occur
    # relationships can be added as needed

class PricingPlan(Base):
    __tablename__ = "pricing_plans"
    plan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  # e.g., 'Starter', 'Professional', 'Enterprise'
    description = Column(Text)
    price_monthly = Column(Numeric, nullable=False)
    price_yearly = Column(Numeric, nullable=False)
    features = Column(JSON)  # List of features included
    limits = Column(JSON)  # Usage limits (storage, users, etc.)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"
    subscription_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("pricing_plans.plan_id"), nullable=False)
    status = Column(String, default='active')  # active, cancelled, past_due, etc.
    billing_cycle = Column(String, default='monthly')  # monthly, yearly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    auto_renew = Column(Boolean, default=True)
    stripe_subscription_id = Column(String)  # External billing system ID
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Usage(Base):
    __tablename__ = "usage"
    usage_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.subscription_id"))
    usage_type = Column(String, nullable=False)  # storage, api_calls, users, etc.
    amount = Column(Numeric, nullable=False)  # Current usage amount
    limit = Column(Numeric, nullable=False)  # Usage limit for this type
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Billing(Base):
    __tablename__ = "billing"
    billing_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.subscription_id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    currency = Column(String, default='USD')
    status = Column(String, default='pending')  # pending, paid, failed, refunded
    billing_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime)
    stripe_invoice_id = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    billing_id = Column(UUID(as_uuid=True), ForeignKey("billing.billing_id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    currency = Column(String, default='USD')
    payment_method = Column(String)  # credit_card, bank_transfer, etc.
    status = Column(String, default='pending')  # pending, completed, failed
    stripe_payment_id = Column(String)
    transaction_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)