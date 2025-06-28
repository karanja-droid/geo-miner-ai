"""
Geological graph service for Neo4j operations.
"""

from typing import Dict, List, Any, Optional, Tuple
import logging
from contextlib import contextmanager

from app.core.neo4j_client import neo4j_client

logger = logging.getLogger(__name__)


class GeologicalGraphService:
    """Service for geological graph operations."""
    
    @staticmethod
    def create_geological_formation(
        formation_id: str,
        name: str,
        rock_type: str,
        age_ma: float,
        coordinates: List[float],
        properties: Dict[str, Any]
    ) -> bool:
        """Create a geological formation node."""
        query = """
        CREATE (f:GeologicalFormation {
            formation_id: $formation_id,
            name: $name,
            rock_type: $rock_type,
            age_ma: $age_ma,
            coordinates: $coordinates,
            properties: $properties,
            created_at: datetime()
        })
        RETURN f
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "formation_id": formation_id,
                    "name": name,
                    "rock_type": rock_type,
                    "age_ma": age_ma,
                    "coordinates": coordinates,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create geological formation: {e}")
            return False
    
    @staticmethod
    def create_drill_hole(
        hole_id: str,
        x: float,
        y: float,
        z: float,
        depth: float,
        project_id: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Create a drill hole node."""
        query = """
        CREATE (h:DrillHole {
            hole_id: $hole_id,
            x: $x,
            y: $y,
            z: $z,
            depth: $depth,
            project_id: $project_id,
            properties: $properties,
            created_at: datetime()
        })
        RETURN h
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "hole_id": hole_id,
                    "x": x,
                    "y": y,
                    "z": z,
                    "depth": depth,
                    "project_id": project_id,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create drill hole: {e}")
            return False
    
    @staticmethod
    def create_ore_body(
        ore_body_id: str,
        name: str,
        commodity: str,
        grade: float,
        coordinates: List[List[float]],
        properties: Dict[str, Any]
    ) -> bool:
        """Create an ore body node."""
        query = """
        CREATE (o:OreBody {
            ore_body_id: $ore_body_id,
            name: $name,
            commodity: $commodity,
            grade: $grade,
            coordinates: $coordinates,
            properties: $properties,
            created_at: datetime()
        })
        RETURN o
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "ore_body_id": ore_body_id,
                    "name": name,
                    "commodity": commodity,
                    "grade": grade,
                    "coordinates": coordinates,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create ore body: {e}")
            return False
    
    @staticmethod
    def create_fault(
        fault_id: str,
        name: str,
        fault_type: str,
        coordinates: List[List[float]],
        properties: Dict[str, Any]
    ) -> bool:
        """Create a fault node."""
        query = """
        CREATE (f:Fault {
            fault_id: $fault_id,
            name: $name,
            fault_type: $fault_type,
            coordinates: $coordinates,
            properties: $properties,
            created_at: datetime()
        })
        RETURN f
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "fault_id": fault_id,
                    "name": name,
                    "fault_type": fault_type,
                    "coordinates": coordinates,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create fault: {e}")
            return False
    
    @staticmethod
    def create_intersection_relationship(
        drill_hole_id: str,
        formation_id: str,
        depth_from: float,
        depth_to: float,
        properties: Dict[str, Any]
    ) -> bool:
        """Create intersection relationship between drill hole and formation."""
        query = """
        MATCH (h:DrillHole {hole_id: $drill_hole_id})
        MATCH (f:GeologicalFormation {formation_id: $formation_id})
        CREATE (h)-[i:INTERSECTS {
            depth_from: $depth_from,
            depth_to: $depth_to,
            properties: $properties,
            created_at: datetime()
        }]->(f)
        RETURN i
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "drill_hole_id": drill_hole_id,
                    "formation_id": formation_id,
                    "depth_from": depth_from,
                    "depth_to": depth_to,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create intersection: {e}")
            return False
    
    @staticmethod
    def create_adjacent_relationship(
        formation1_id: str,
        formation2_id: str,
        relationship_type: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Create adjacent relationship between formations."""
        query = """
        MATCH (f1:GeologicalFormation {formation_id: $formation1_id})
        MATCH (f2:GeologicalFormation {formation_id: $formation2_id})
        CREATE (f1)-[r:ADJACENT {
            relationship_type: $relationship_type,
            properties: $properties,
            created_at: datetime()
        }]->(f2)
        RETURN r
        """
        
        try:
            with neo4j_client.get_session() as session:
                session.run(query, {
                    "formation1_id": formation1_id,
                    "formation2_id": formation2_id,
                    "relationship_type": relationship_type,
                    "properties": properties
                })
            return True
        except Exception as e:
            logger.error(f"Failed to create adjacent relationship: {e}")
            return False
    
    @staticmethod
    def find_ore_body_paths(
        start_formation_id: str,
        max_depth: int = 5
    ) -> List[Dict[str, Any]]:
        """Find paths to ore bodies from a starting formation."""
        query = """
        MATCH path = (start:GeologicalFormation {formation_id: $start_formation_id})
        -[:ADJACENT*1..$max_depth]-(ore:OreBody)
        RETURN path, 
               length(path) as path_length,
               ore.name as ore_body_name,
               ore.commodity as commodity,
               ore.grade as grade
        ORDER BY path_length, ore.grade DESC
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {
                    "start_formation_id": start_formation_id,
                    "max_depth": max_depth
                })
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to find ore body paths: {e}")
            return []
    
    @staticmethod
    def analyze_drill_hole_intersections(
        project_id: str
    ) -> List[Dict[str, Any]]:
        """Analyze drill hole intersections for a project."""
        query = """
        MATCH (h:DrillHole {project_id: $project_id})
        -[i:INTERSECTS]->(f:GeologicalFormation)
        RETURN h.hole_id as hole_id,
               h.x as x,
               h.y as y,
               h.depth as depth,
               f.name as formation_name,
               f.rock_type as rock_type,
               i.depth_from as depth_from,
               i.depth_to as depth_to,
               (i.depth_to - i.depth_from) as intersection_length
        ORDER BY h.hole_id, i.depth_from
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {"project_id": project_id})
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to analyze drill hole intersections: {e}")
            return []
    
    @staticmethod
    def find_fault_affected_areas(
        fault_id: str,
        buffer_distance: float = 100.0
    ) -> List[Dict[str, Any]]:
        """Find areas affected by a fault."""
        query = """
        MATCH (fault:Fault {fault_id: $fault_id})
        MATCH (formation:GeologicalFormation)
        WHERE distance(
            point({x: formation.coordinates[0], y: formation.coordinates[1]}),
            point({x: fault.coordinates[0], y: fault.coordinates[1]})
        ) <= $buffer_distance
        RETURN formation.formation_id as formation_id,
               formation.name as formation_name,
               formation.rock_type as rock_type,
               distance(
                   point({x: formation.coordinates[0], y: formation.coordinates[1]}),
                   point({x: fault.coordinates[0], y: fault.coordinates[1]})
               ) as distance_to_fault
        ORDER BY distance_to_fault
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {
                    "fault_id": fault_id,
                    "buffer_distance": buffer_distance
                })
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to find fault affected areas: {e}")
            return []
    
    @staticmethod
    def get_geological_network_stats() -> Dict[str, Any]:
        """Get statistics about the geological network."""
        query = """
        MATCH (n)
        RETURN 
            count(n) as total_nodes,
            count(CASE WHEN labels(n)[0] = 'GeologicalFormation' THEN n END) as formations,
            count(CASE WHEN labels(n)[0] = 'DrillHole' THEN n END) as drill_holes,
            count(CASE WHEN labels(n)[0] = 'OreBody' THEN n END) as ore_bodies,
            count(CASE WHEN labels(n)[0] = 'Fault' THEN n END) as faults
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query)
                stats = result.single()
                return stats.data() if stats else {}
        except Exception as e:
            logger.error(f"Failed to get network stats: {e}")
            return {}
    
    @staticmethod
    def find_mineralization_patterns(
        commodity: str,
        min_grade: float = 0.0
    ) -> List[Dict[str, Any]]:
        """Find mineralization patterns for a specific commodity."""
        query = """
        MATCH (ore:OreBody {commodity: $commodity})
        WHERE ore.grade >= $min_grade
        MATCH (ore)-[:ADJACENT*1..3]-(formation:GeologicalFormation)
        RETURN ore.name as ore_body_name,
               ore.grade as grade,
               formation.name as formation_name,
               formation.rock_type as rock_type,
               formation.age_ma as age
        ORDER BY ore.grade DESC
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {
                    "commodity": commodity,
                    "min_grade": min_grade
                })
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to find mineralization patterns: {e}")
            return []
    
    @staticmethod
    def analyze_structural_complexity(
        project_id: str
    ) -> Dict[str, Any]:
        """Analyze structural complexity of a project area."""
        query = """
        MATCH (h:DrillHole {project_id: $project_id})
        -[i:INTERSECTS]->(f:GeologicalFormation)
        WITH f, count(i) as intersection_count
        MATCH (f)-[r:ADJACENT]-(adj:GeologicalFormation)
        RETURN f.name as formation_name,
               intersection_count,
               count(r) as adjacent_count,
               avg(adj.age_ma) as avg_adjacent_age
        ORDER BY intersection_count DESC
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {"project_id": project_id})
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to analyze structural complexity: {e}")
            return []
    
    @staticmethod
    def find_optimal_drilling_targets(
        project_id: str,
        target_depth: float = 500.0
    ) -> List[Dict[str, Any]]:
        """Find optimal drilling targets based on graph analysis."""
        query = """
        MATCH (h:DrillHole {project_id: $project_id})
        -[i:INTERSECTS]->(f:GeologicalFormation)
        WITH f, avg(i.depth_from) as avg_depth, count(i) as hole_count
        WHERE avg_depth <= $target_depth
        MATCH (f)-[:ADJACENT*1..2]-(ore:OreBody)
        RETURN f.name as formation_name,
               f.rock_type as rock_type,
               avg_depth,
               hole_count,
               ore.name as nearby_ore_body,
               ore.grade as ore_grade
        ORDER BY ore_grade DESC, hole_count ASC
        """
        
        try:
            with neo4j_client.get_session() as session:
                result = session.run(query, {
                    "project_id": project_id,
                    "target_depth": target_depth
                })
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Failed to find optimal drilling targets: {e}")
            return [] 