from sqlalchemy import Column, String, Integer, DateTime, Enum, ForeignKey, Boolean, JSON, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship, declarative_base
from geoalchemy2 import Geometry
import enum
import uuid

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