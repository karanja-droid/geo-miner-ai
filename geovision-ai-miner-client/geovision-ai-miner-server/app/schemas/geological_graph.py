"""
Pydantic schemas for geological graph operations.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime


class GeologicalFormationCreate(BaseModel):
    """Schema for creating a geological formation."""
    formation_id: str = Field(..., description="Unique formation identifier")
    name: str = Field(..., description="Formation name")
    rock_type: str = Field(..., description="Type of rock")
    age_ma: float = Field(..., description="Age in millions of years")
    coordinates: List[float] = Field(..., min_items=2, max_items=3, description="X, Y, Z coordinates")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")


class DrillHoleCreate(BaseModel):
    """Schema for creating a drill hole."""
    hole_id: str = Field(..., description="Unique drill hole identifier")
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")
    z: float = Field(..., description="Z coordinate (elevation)")
    depth: float = Field(..., gt=0, description="Drill hole depth")
    project_id: str = Field(..., description="Associated project ID")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")


class OreBodyCreate(BaseModel):
    """Schema for creating an ore body."""
    ore_body_id: str = Field(..., description="Unique ore body identifier")
    name: str = Field(..., description="Ore body name")
    commodity: str = Field(..., description="Primary commodity")
    grade: float = Field(..., ge=0, description="Average grade")
    coordinates: List[List[float]] = Field(..., description="Polygon coordinates")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")


class FaultCreate(BaseModel):
    """Schema for creating a fault."""
    fault_id: str = Field(..., description="Unique fault identifier")
    name: str = Field(..., description="Fault name")
    fault_type: str = Field(..., description="Type of fault")
    coordinates: List[List[float]] = Field(..., description="Fault line coordinates")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")


class IntersectionCreate(BaseModel):
    """Schema for creating an intersection relationship."""
    drill_hole_id: str = Field(..., description="Drill hole identifier")
    formation_id: str = Field(..., description="Formation identifier")
    depth_from: float = Field(..., ge=0, description="Intersection start depth")
    depth_to: float = Field(..., gt=0, description="Intersection end depth")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")

    @validator('depth_to')
    def depth_to_must_be_greater_than_depth_from(cls, v, values):
        if 'depth_from' in values and v <= values['depth_from']:
            raise ValueError('depth_to must be greater than depth_from')
        return v


class AdjacentRelationshipCreate(BaseModel):
    """Schema for creating an adjacent relationship."""
    formation1_id: str = Field(..., description="First formation identifier")
    formation2_id: str = Field(..., description="Second formation identifier")
    relationship_type: str = Field(..., description="Type of relationship")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Additional properties")

    @validator('formation2_id')
    def formations_must_be_different(cls, v, values):
        if 'formation1_id' in values and v == values['formation1_id']:
            raise ValueError('formations must be different')
        return v


class GeologicalNetworkStats(BaseModel):
    """Schema for geological network statistics."""
    total_nodes: int = Field(..., description="Total number of nodes")
    formations: int = Field(..., description="Number of geological formations")
    drill_holes: int = Field(..., description="Number of drill holes")
    ore_bodies: int = Field(..., description="Number of ore bodies")
    faults: int = Field(..., description="Number of faults")


class OreBodyPath(BaseModel):
    """Schema for ore body path analysis."""
    path_length: int = Field(..., description="Length of the path")
    ore_body_name: str = Field(..., description="Name of the ore body")
    commodity: str = Field(..., description="Commodity type")
    grade: float = Field(..., description="Ore grade")
    path: List[Dict[str, Any]] = Field(..., description="Path details")


class DrillHoleIntersection(BaseModel):
    """Schema for drill hole intersection analysis."""
    hole_id: str = Field(..., description="Drill hole identifier")
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")
    depth: float = Field(..., description="Total depth")
    formation_name: str = Field(..., description="Formation name")
    rock_type: str = Field(..., description="Rock type")
    depth_from: float = Field(..., description="Intersection start depth")
    depth_to: float = Field(..., description="Intersection end depth")
    intersection_length: float = Field(..., description="Length of intersection")


class FaultAffectedArea(BaseModel):
    """Schema for fault affected area analysis."""
    formation_id: str = Field(..., description="Formation identifier")
    formation_name: str = Field(..., description="Formation name")
    rock_type: str = Field(..., description="Rock type")
    distance_to_fault: float = Field(..., description="Distance to fault")


class GeologicalFormationResponse(BaseModel):
    """Schema for geological formation response."""
    formation_id: str
    name: str
    rock_type: str
    age_ma: float
    coordinates: List[float]
    properties: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class DrillHoleResponse(BaseModel):
    """Schema for drill hole response."""
    hole_id: str
    x: float
    y: float
    z: float
    depth: float
    project_id: str
    properties: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class OreBodyResponse(BaseModel):
    """Schema for ore body response."""
    ore_body_id: str
    name: str
    commodity: str
    grade: float
    coordinates: List[List[float]]
    properties: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class FaultResponse(BaseModel):
    """Schema for fault response."""
    fault_id: str
    name: str
    fault_type: str
    coordinates: List[List[float]]
    properties: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class GraphQuery(BaseModel):
    """Schema for graph query parameters."""
    query_type: str = Field(..., description="Type of graph query")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Query parameters")
    max_results: Optional[int] = Field(100, ge=1, le=1000, description="Maximum number of results")


class GraphAnalysisResult(BaseModel):
    """Schema for graph analysis results."""
    analysis_type: str = Field(..., description="Type of analysis performed")
    results: List[Dict[str, Any]] = Field(..., description="Analysis results")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    execution_time: float = Field(..., description="Query execution time in seconds") 