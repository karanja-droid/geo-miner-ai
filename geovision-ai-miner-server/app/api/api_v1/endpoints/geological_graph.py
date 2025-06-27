"""
Geological graph API endpoints.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.geological_graph import GeologicalGraphService
from app.schemas.geological_graph import (
    GeologicalFormationCreate,
    DrillHoleCreate,
    OreBodyCreate,
    FaultCreate,
    IntersectionCreate,
    AdjacentRelationshipCreate,
    GeologicalNetworkStats,
    OreBodyPath,
    DrillHoleIntersection,
    FaultAffectedArea
)

router = APIRouter()


@router.post("/formations", response_model=Dict[str, str])
async def create_geological_formation(
    formation: GeologicalFormationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new geological formation node."""
    success = GeologicalGraphService.create_geological_formation(
        formation_id=formation.formation_id,
        name=formation.name,
        rock_type=formation.rock_type,
        age_ma=formation.age_ma,
        coordinates=formation.coordinates,
        properties=formation.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create geological formation")
    
    return {"message": "Geological formation created successfully", "formation_id": formation.formation_id}


@router.post("/drill-holes", response_model=Dict[str, str])
async def create_drill_hole(
    drill_hole: DrillHoleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new drill hole node."""
    success = GeologicalGraphService.create_drill_hole(
        hole_id=drill_hole.hole_id,
        x=drill_hole.x,
        y=drill_hole.y,
        z=drill_hole.z,
        depth=drill_hole.depth,
        project_id=drill_hole.project_id,
        properties=drill_hole.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create drill hole")
    
    return {"message": "Drill hole created successfully", "hole_id": drill_hole.hole_id}


@router.post("/ore-bodies", response_model=Dict[str, str])
async def create_ore_body(
    ore_body: OreBodyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ore body node."""
    success = GeologicalGraphService.create_ore_body(
        ore_body_id=ore_body.ore_body_id,
        name=ore_body.name,
        commodity=ore_body.commodity,
        grade=ore_body.grade,
        coordinates=ore_body.coordinates,
        properties=ore_body.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create ore body")
    
    return {"message": "Ore body created successfully", "ore_body_id": ore_body.ore_body_id}


@router.post("/faults", response_model=Dict[str, str])
async def create_fault(
    fault: FaultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new fault node."""
    success = GeologicalGraphService.create_fault(
        fault_id=fault.fault_id,
        name=fault.name,
        fault_type=fault.fault_type,
        coordinates=fault.coordinates,
        properties=fault.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create fault")
    
    return {"message": "Fault created successfully", "fault_id": fault.fault_id}


@router.post("/intersections", response_model=Dict[str, str])
async def create_intersection(
    intersection: IntersectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create intersection relationship between drill hole and formation."""
    success = GeologicalGraphService.create_intersection_relationship(
        drill_hole_id=intersection.drill_hole_id,
        formation_id=intersection.formation_id,
        depth_from=intersection.depth_from,
        depth_to=intersection.depth_to,
        properties=intersection.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create intersection")
    
    return {"message": "Intersection created successfully"}


@router.post("/adjacent-relationships", response_model=Dict[str, str])
async def create_adjacent_relationship(
    relationship: AdjacentRelationshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create adjacent relationship between formations."""
    success = GeologicalGraphService.create_adjacent_relationship(
        formation1_id=relationship.formation1_id,
        formation2_id=relationship.formation2_id,
        relationship_type=relationship.relationship_type,
        properties=relationship.properties
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create adjacent relationship")
    
    return {"message": "Adjacent relationship created successfully"}


@router.get("/ore-body-paths/{formation_id}", response_model=List[OreBodyPath])
async def find_ore_body_paths(
    formation_id: str,
    max_depth: int = Query(5, ge=1, le=10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Find paths to ore bodies from a starting formation."""
    paths = GeologicalGraphService.find_ore_body_paths(
        start_formation_id=formation_id,
        max_depth=max_depth
    )
    
    return paths


@router.get("/drill-hole-intersections/{project_id}", response_model=List[DrillHoleIntersection])
async def analyze_drill_hole_intersections(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze drill hole intersections for a project."""
    intersections = GeologicalGraphService.analyze_drill_hole_intersections(
        project_id=project_id
    )
    
    return intersections


@router.get("/fault-affected-areas/{fault_id}", response_model=List[FaultAffectedArea])
async def find_fault_affected_areas(
    fault_id: str,
    buffer_distance: float = Query(100.0, ge=0.0, le=1000.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Find areas affected by a fault."""
    affected_areas = GeologicalGraphService.find_fault_affected_areas(
        fault_id=fault_id,
        buffer_distance=buffer_distance
    )
    
    return affected_areas


@router.get("/network-stats", response_model=GeologicalNetworkStats)
async def get_network_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics about the geological network."""
    stats = GeologicalGraphService.get_geological_network_stats()
    
    if not stats:
        raise HTTPException(status_code=500, detail="Failed to retrieve network statistics")
    
    return stats


@router.get("/health")
async def neo4j_health_check():
    """Check Neo4j health status."""
    from app.core.neo4j_client import neo4j_client
    
    is_healthy = neo4j_client.health_check()
    
    if not is_healthy:
        raise HTTPException(status_code=503, detail="Neo4j is not available")
    
    return {"status": "healthy", "database": "neo4j"} 