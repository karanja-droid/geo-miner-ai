"""
Neo4j Integration Examples for GeoVision AI Miner

This file demonstrates how to use the Neo4j graph database integration
for geological data analysis and relationship modeling.
"""

import asyncio
import json
from typing import List, Dict, Any
import httpx
from datetime import datetime

# API base URL
API_BASE_URL = "http://localhost:8000/api/v1"
AUTH_TOKEN = None

async def authenticate():
    """Authenticate and get access token."""
    global AUTH_TOKEN
    
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{API_BASE_URL}/auth/login", json={
            "email": "admin@geo-miner.com",
            "password": "changeme"
        })
        
        if response.status_code == 200:
            data = response.json()
            AUTH_TOKEN = data["access_token"]
            print("✅ Authentication successful")
        else:
            print(f"❌ Authentication failed: {response.text}")
            raise Exception("Authentication failed")

async def create_geological_formation():
    """Create a geological formation node."""
    formation_data = {
        "formation_id": "F004",
        "name": "Basalt Formation",
        "rock_type": "Igneous",
        "age_ma": 200.0,
        "coordinates": [123.55, -67.82, 90.0],
        "properties": {
            "description": "Fine-grained volcanic rock",
            "mineralogy": "Plagioclase, Pyroxene",
            "texture": "Aphanitic"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/formations",
            json=formation_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Geological formation created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create formation: {response.text}")
            return None

async def create_drill_hole():
    """Create a drill hole node."""
    drill_hole_data = {
        "hole_id": "DH003",
        "x": 123.55,
        "y": -67.82,
        "z": 90.0,
        "depth": 600.0,
        "project_id": "PROJ001",
        "properties": {
            "diameter": "PQ",
            "azimuth": 135.0,
            "dip": -88.0,
            "drilling_method": "Diamond Core"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/drill-holes",
            json=drill_hole_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Drill hole created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create drill hole: {response.text}")
            return None

async def create_ore_body():
    """Create an ore body node."""
    ore_body_data = {
        "ore_body_id": "OB002",
        "name": "Copper Porphyry Zone",
        "commodity": "Copper",
        "grade": 0.8,
        "coordinates": [
            [123.35, -67.95],
            [123.65, -67.95],
            [123.65, -67.75],
            [123.35, -67.75]
        ],
        "properties": {
            "tonnage": 50000000,
            "cutoff_grade": 0.3,
            "mining_method": "Open Pit",
            "mineralization_type": "Porphyry"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/ore-bodies",
            json=ore_body_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Ore body created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create ore body: {response.text}")
            return None

async def create_fault():
    """Create a fault node."""
    fault_data = {
        "fault_id": "FAULT002",
        "name": "Secondary Fault System",
        "fault_type": "Strike-Slip",
        "coordinates": [
            [123.25, -67.98],
            [123.70, -67.72]
        ],
        "properties": {
            "dip": 85.0,
            "throw": 25.0,
            "movement": "Strike-Slip",
            "sense": "Right-Lateral"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/faults",
            json=fault_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Fault created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create fault: {response.text}")
            return None

async def create_intersection():
    """Create intersection relationship between drill hole and formation."""
    intersection_data = {
        "drill_hole_id": "DH003",
        "formation_id": "F004",
        "depth_from": 0.0,
        "depth_to": 200.0,
        "properties": {
            "core_recovery": 95.0,
            "rqd": 85.0,
            "weathering": "Fresh"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/intersections",
            json=intersection_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Intersection created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create intersection: {response.text}")
            return None

async def create_adjacent_relationship():
    """Create adjacent relationship between formations."""
    adjacent_data = {
        "formation1_id": "F003",
        "formation2_id": "F004",
        "relationship_type": "Contact",
        "properties": {
            "contact_type": "Intrusive",
            "contact_attitude": "Vertical",
            "alteration": "Propylitic"
        }
    }
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.post(
            f"{API_BASE_URL}/geological-graph/adjacent-relationships",
            json=adjacent_data,
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Adjacent relationship created successfully")
            return response.json()
        else:
            print(f"❌ Failed to create adjacent relationship: {response.text}")
            return None

async def find_ore_body_paths():
    """Find paths to ore bodies from a starting formation."""
    formation_id = "F001"
    max_depth = 3
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{API_BASE_URL}/geological-graph/ore-body-paths/{formation_id}",
            params={"max_depth": max_depth},
            headers=headers
        )
        
        if response.status_code == 200:
            paths = response.json()
            print(f"✅ Found {len(paths)} paths to ore bodies")
            for path in paths:
                print(f"  - Path length: {path['path_length']}")
                print(f"    Ore body: {path['ore_body_name']}")
                print(f"    Commodity: {path['commodity']}")
                print(f"    Grade: {path['grade']}%")
            return paths
        else:
            print(f"❌ Failed to find ore body paths: {response.text}")
            return []

async def analyze_drill_hole_intersections():
    """Analyze drill hole intersections for a project."""
    project_id = "PROJ001"
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{API_BASE_URL}/geological-graph/drill-hole-intersections/{project_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            intersections = response.json()
            print(f"✅ Found {len(intersections)} drill hole intersections")
            
            # Group by drill hole
            drill_holes = {}
            for intersection in intersections:
                hole_id = intersection['hole_id']
                if hole_id not in drill_holes:
                    drill_holes[hole_id] = []
                drill_holes[hole_id].append(intersection)
            
            for hole_id, hole_intersections in drill_holes.items():
                print(f"\nDrill Hole {hole_id}:")
                for intersection in hole_intersections:
                    print(f"  - {intersection['formation_name']} ({intersection['rock_type']})")
                    print(f"    Depth: {intersection['depth_from']:.1f}m - {intersection['depth_to']:.1f}m")
                    print(f"    Length: {intersection['intersection_length']:.1f}m")
            
            return intersections
        else:
            print(f"❌ Failed to analyze intersections: {response.text}")
            return []

async def find_fault_affected_areas():
    """Find areas affected by a fault."""
    fault_id = "FAULT001"
    buffer_distance = 150.0
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{API_BASE_URL}/geological-graph/fault-affected-areas/{fault_id}",
            params={"buffer_distance": buffer_distance},
            headers=headers
        )
        
        if response.status_code == 200:
            affected_areas = response.json()
            print(f"✅ Found {len(affected_areas)} affected areas")
            
            for area in affected_areas:
                print(f"  - {area['formation_name']} ({area['rock_type']})")
                print(f"    Distance to fault: {area['distance_to_fault']:.1f}m")
            
            return affected_areas
        else:
            print(f"❌ Failed to find affected areas: {response.text}")
            return []

async def get_network_stats():
    """Get statistics about the geological network."""
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        response = await client.get(
            f"{API_BASE_URL}/geological-graph/network-stats",
            headers=headers
        )
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Geological network statistics:")
            print(f"  - Total nodes: {stats['total_nodes']}")
            print(f"  - Geological formations: {stats['formations']}")
            print(f"  - Drill holes: {stats['drill_holes']}")
            print(f"  - Ore bodies: {stats['ore_bodies']}")
            print(f"  - Faults: {stats['faults']}")
            return stats
        else:
            print(f"❌ Failed to get network stats: {response.text}")
            return {}

async def check_neo4j_health():
    """Check Neo4j health status."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/geological-graph/health")
        
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Neo4j health: {health['status']}")
            return health
        else:
            print(f"❌ Neo4j health check failed: {response.text}")
            return None

async def run_comprehensive_example():
    """Run a comprehensive example of Neo4j operations."""
    print("🚀 Starting Neo4j Integration Example")
    print("=" * 50)
    
    try:
        # Step 1: Authenticate
        await authenticate()
        
        # Step 2: Check Neo4j health
        await check_neo4j_health()
        
        # Step 3: Create geological entities
        print("\n📊 Creating Geological Entities")
        print("-" * 30)
        
        await create_geological_formation()
        await create_drill_hole()
        await create_ore_body()
        await create_fault()
        
        # Step 4: Create relationships
        print("\n🔗 Creating Relationships")
        print("-" * 30)
        
        await create_intersection()
        await create_adjacent_relationship()
        
        # Step 5: Perform analysis
        print("\n🔍 Performing Graph Analysis")
        print("-" * 30)
        
        await get_network_stats()
        await find_ore_body_paths()
        await analyze_drill_hole_intersections()
        await find_fault_affected_areas()
        
        print("\n✅ Neo4j integration example completed successfully!")
        
    except Exception as e:
        print(f"❌ Example failed: {e}")

def print_cypher_examples():
    """Print useful Cypher query examples."""
    print("\n🔍 Useful Cypher Query Examples")
    print("=" * 50)
    
    examples = [
        {
            "name": "Find all formations with high-grade ore bodies",
            "query": """
            MATCH (f:GeologicalFormation)-[:CONTAINS]->(o:OreBody)
            WHERE o.grade > 3.0
            RETURN f.name, f.rock_type, o.name, o.grade, o.commodity
            ORDER BY o.grade DESC
            """
        },
        {
            "name": "Analyze drill hole density by formation",
            "query": """
            MATCH (h:DrillHole)-[:INTERSECTS]->(f:GeologicalFormation)
            WITH f, count(h) as hole_count
            RETURN f.name, f.rock_type, hole_count
            ORDER BY hole_count DESC
            """
        },
        {
            "name": "Find fault-controlled mineralization",
            "query": """
            MATCH (fault:Fault)
            MATCH (ore:OreBody)
            WHERE distance(
                point({x: fault.coordinates[0], y: fault.coordinates[1]}),
                point({x: ore.coordinates[0], y: ore.coordinates[1]})
            ) <= 200.0
            RETURN fault.name, ore.name, ore.commodity, ore.grade
            """
        },
        {
            "name": "Calculate average intersection length by rock type",
            "query": """
            MATCH (h:DrillHole)-[i:INTERSECTS]->(f:GeologicalFormation)
            WITH f.rock_type as rock_type, 
                 avg(i.depth_to - i.depth_from) as avg_length,
                 count(i) as intersection_count
            RETURN rock_type, avg_length, intersection_count
            ORDER BY avg_length DESC
            """
        },
        {
            "name": "Find formations with multiple commodities",
            "query": """
            MATCH (f:GeologicalFormation)-[:CONTAINS]->(o:OreBody)
            WITH f, collect(DISTINCT o.commodity) as commodities
            WHERE size(commodities) > 1
            RETURN f.name, f.rock_type, commodities
            """
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['name']}")
        print("   Query:")
        print(example['query'].strip())

if __name__ == "__main__":
    # Run the comprehensive example
    asyncio.run(run_comprehensive_example())
    
    # Print Cypher examples
    print_cypher_examples()
    
    print("\n🎯 Next Steps:")
    print("1. Access Neo4j Browser at: http://localhost:7474")
    print("2. Use the Cypher examples above for custom analysis")
    print("3. Explore the API documentation at: http://localhost:8000/docs")
    print("4. Check out the geological graph endpoints in the API") 