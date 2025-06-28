#!/bin/bash

# Neo4j Setup Script for GeoVision AI Miner
# This script initializes Neo4j with geological graph schema and sample data

set -e

echo "🚀 Setting up Neo4j for GeoVision AI Miner..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NEO4J_URI=${NEO4J_URI:-"bolt://localhost:7687"}
NEO4J_USER=${NEO4J_USER:-"neo4j"}
NEO4J_PASSWORD=${NEO4J_PASSWORD:-"password"}
NEO4J_DATABASE=${NEO4J_DATABASE:-"neo4j"}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for Neo4j to be ready
wait_for_neo4j() {
    print_status "Waiting for Neo4j to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -a "$NEO4J_URI" "RETURN 1" >/dev/null 2>&1; then
            print_success "Neo4j is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: Neo4j not ready yet, waiting 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    print_error "Neo4j failed to start within the expected time"
    return 1
}

# Function to run Cypher query
run_cypher() {
    local query="$1"
    local description="$2"
    
    print_status "Running: $description"
    
    if cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -a "$NEO4J_URI" "$query" >/dev/null 2>&1; then
        print_success "$description completed"
    else
        print_error "$description failed"
        return 1
    fi
}

# Function to create constraints and indexes
create_schema() {
    print_status "Creating Neo4j schema (constraints and indexes)..."
    
    # Create constraints for unique properties
    run_cypher "CREATE CONSTRAINT formation_id IF NOT EXISTS FOR (f:GeologicalFormation) REQUIRE f.formation_id IS UNIQUE" "Formation ID constraint"
    run_cypher "CREATE CONSTRAINT hole_id IF NOT EXISTS FOR (h:DrillHole) REQUIRE h.hole_id IS UNIQUE" "Drill hole ID constraint"
    run_cypher "CREATE CONSTRAINT ore_body_id IF NOT EXISTS FOR (o:OreBody) REQUIRE o.ore_body_id IS UNIQUE" "Ore body ID constraint"
    run_cypher "CREATE CONSTRAINT fault_id IF NOT EXISTS FOR (f:Fault) REQUIRE f.fault_id IS UNIQUE" "Fault ID constraint"
    
    # Create indexes for better query performance
    run_cypher "CREATE INDEX formation_name IF NOT EXISTS FOR (f:GeologicalFormation) ON (f.name)" "Formation name index"
    run_cypher "CREATE INDEX formation_rock_type IF NOT EXISTS FOR (f:GeologicalFormation) ON (f.rock_type)" "Formation rock type index"
    run_cypher "CREATE INDEX drill_hole_project IF NOT EXISTS FOR (h:DrillHole) ON (h.project_id)" "Drill hole project index"
    run_cypher "CREATE INDEX ore_body_commodity IF NOT EXISTS FOR (o:OreBody) ON (o.commodity)" "Ore body commodity index"
    run_cypher "CREATE INDEX fault_type IF NOT EXISTS FOR (f:Fault) ON (f.fault_type)" "Fault type index"
    
    print_success "Schema creation completed"
}

# Function to create sample geological data
create_sample_data() {
    print_status "Creating sample geological data..."
    
    # Create sample geological formations
    run_cypher "
    CREATE (f1:GeologicalFormation {
        formation_id: 'F001',
        name: 'Granite Formation',
        rock_type: 'Igneous',
        age_ma: 2500.0,
        coordinates: [123.45, -67.89, 100.0],
        properties: {description: 'Coarse-grained granite', mineralogy: 'Quartz, Feldspar, Mica'}
    })
    " "Sample formation 1"
    
    run_cypher "
    CREATE (f2:GeologicalFormation {
        formation_id: 'F002',
        name: 'Limestone Formation',
        rock_type: 'Sedimentary',
        age_ma: 500.0,
        coordinates: [123.50, -67.85, 95.0],
        properties: {description: 'Carbonate limestone', fossil_content: 'High'}
    })
    " "Sample formation 2"
    
    run_cypher "
    CREATE (f3:GeologicalFormation {
        formation_id: 'F003',
        name: 'Schist Formation',
        rock_type: 'Metamorphic',
        age_ma: 1800.0,
        coordinates: [123.40, -67.92, 105.0],
        properties: {description: 'Foliated metamorphic rock', grade: 'Medium'}
    })
    " "Sample formation 3"
    
    # Create sample drill holes
    run_cypher "
    CREATE (h1:DrillHole {
        hole_id: 'DH001',
        x: 123.45,
        y: -67.89,
        z: 100.0,
        depth: 500.0,
        project_id: 'PROJ001',
        properties: {diameter: 'HQ', azimuth: 90.0, dip: -90.0}
    })
    " "Sample drill hole 1"
    
    run_cypher "
    CREATE (h2:DrillHole {
        hole_id: 'DH002',
        x: 123.50,
        y: -67.85,
        z: 95.0,
        depth: 450.0,
        project_id: 'PROJ001',
        properties: {diameter: 'NQ', azimuth: 45.0, dip: -85.0}
    })
    " "Sample drill hole 2"
    
    # Create sample ore body
    run_cypher "
    CREATE (o1:OreBody {
        ore_body_id: 'OB001',
        name: 'Main Gold Zone',
        commodity: 'Gold',
        grade: 5.2,
        coordinates: [[123.40, -67.90], [123.50, -67.90], [123.50, -67.80], [123.40, -67.80]],
        properties: {tonnage: 1000000, cutoff_grade: 1.0, mining_method: 'Open Pit'}
    })
    " "Sample ore body"
    
    # Create sample fault
    run_cypher "
    CREATE (fault1:Fault {
        fault_id: 'FAULT001',
        name: 'Main Fault Zone',
        fault_type: 'Normal',
        coordinates: [[123.30, -67.95], [123.60, -67.75]],
        properties: {dip: 60.0, throw: 50.0, movement: 'Normal'}
    })
    " "Sample fault"
    
    # Create relationships
    run_cypher "
    MATCH (h1:DrillHole {hole_id: 'DH001'})
    MATCH (f1:GeologicalFormation {formation_id: 'F001'})
    CREATE (h1)-[i1:INTERSECTS {depth_from: 0.0, depth_to: 150.0, properties: {}}]->(f1)
    " "Drill hole 1 intersects formation 1"
    
    run_cypher "
    MATCH (h1:DrillHole {hole_id: 'DH001'})
    MATCH (f2:GeologicalFormation {formation_id: 'F002'})
    CREATE (h1)-[i2:INTERSECTS {depth_from: 150.0, depth_to: 300.0, properties: {}}]->(f2)
    " "Drill hole 1 intersects formation 2"
    
    run_cypher "
    MATCH (h2:DrillHole {hole_id: 'DH002'})
    MATCH (f2:GeologicalFormation {formation_id: 'F002'})
    CREATE (h2)-[i3:INTERSECTS {depth_from: 0.0, depth_to: 200.0, properties: {}}]->(f2)
    " "Drill hole 2 intersects formation 2"
    
    run_cypher "
    MATCH (h2:DrillHole {hole_id: 'DH002'})
    MATCH (f3:GeologicalFormation {formation_id: 'F003'})
    CREATE (h2)-[i4:INTERSECTS {depth_from: 200.0, depth_to: 450.0, properties: {}}]->(f3)
    " "Drill hole 2 intersects formation 3"
    
    # Create adjacent relationships between formations
    run_cypher "
    MATCH (f1:GeologicalFormation {formation_id: 'F001'})
    MATCH (f2:GeologicalFormation {formation_id: 'F002'})
    CREATE (f1)-[r1:ADJACENT {relationship_type: 'Contact', properties: {contact_type: 'Unconformity'}}]->(f2)
    " "Formation 1 adjacent to formation 2"
    
    run_cypher "
    MATCH (f2:GeologicalFormation {formation_id: 'F002'})
    MATCH (f3:GeologicalFormation {formation_id: 'F003'})
    CREATE (f2)-[r2:ADJACENT {relationship_type: 'Contact', properties: {contact_type: 'Fault'}}]->(f3)
    " "Formation 2 adjacent to formation 3"
    
    # Create ore body relationships
    run_cypher "
    MATCH (f1:GeologicalFormation {formation_id: 'F001'})
    MATCH (o1:OreBody {ore_body_id: 'OB001'})
    CREATE (f1)-[r3:CONTAINS {properties: {mineralization_type: 'Vein'}}]->(o1)
    " "Formation 1 contains ore body"
    
    print_success "Sample data creation completed"
}

# Function to create useful procedures and functions
create_procedures() {
    print_status "Creating useful procedures and functions..."
    
    # Procedure to get geological network statistics
    run_cypher "
    CALL apoc.custom.asProcedure(
        'geological.networkStats',
        'MATCH (n) RETURN count(n) as total_nodes, count(CASE WHEN labels(n)[0] = \"GeologicalFormation\" THEN n END) as formations, count(CASE WHEN labels(n)[0] = \"DrillHole\" THEN n END) as drill_holes, count(CASE WHEN labels(n)[0] = \"OreBody\" THEN n END) as ore_bodies, count(CASE WHEN labels(n)[0] = \"Fault\" THEN n END) as faults',
        'read',
        [['total_nodes', 'INT'], ['formations', 'INT'], ['drill_holes', 'INT'], ['ore_bodies', 'INT'], ['faults', 'INT']]
    )
    " "Network statistics procedure"
    
    # Procedure to find mineralization patterns
    run_cypher "
    CALL apoc.custom.asProcedure(
        'geological.findMineralizationPatterns',
        'MATCH (ore:OreBody {commodity: \$commodity}) WHERE ore.grade >= \$min_grade MATCH (ore)-[:CONTAINS*1..3]-(formation:GeologicalFormation) RETURN ore.name as ore_body_name, ore.grade as grade, formation.name as formation_name, formation.rock_type as rock_type ORDER BY ore.grade DESC',
        'read',
        [['ore_body_name', 'STRING'], ['grade', 'FLOAT'], ['formation_name', 'STRING'], ['rock_type', 'STRING']],
        [['commodity', 'STRING'], ['min_grade', 'FLOAT']]
    )
    " "Mineralization patterns procedure"
    
    print_success "Procedures creation completed"
}

# Function to verify setup
verify_setup() {
    print_status "Verifying Neo4j setup..."
    
    # Check if we can connect and run basic queries
    if cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -a "$NEO4J_URI" "MATCH (n) RETURN count(n) as node_count" | grep -q "node_count"; then
        print_success "Neo4j connection verified"
    else
        print_error "Failed to verify Neo4j connection"
        return 1
    fi
    
    # Check if sample data exists
    local formation_count=$(cypher-shell -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" -a "$NEO4J_URI" "MATCH (f:GeologicalFormation) RETURN count(f)" | tail -n 1 | tr -d ' ')
    if [ "$formation_count" -gt 0 ]; then
        print_success "Sample data verified ($formation_count formations found)"
    else
        print_warning "No sample formations found"
    fi
    
    print_success "Neo4j setup verification completed"
}

# Main execution
main() {
    print_status "Starting Neo4j setup for GeoVision AI Miner..."
    
    # Check if cypher-shell is available
    if ! command -v cypher-shell &> /dev/null; then
        print_error "cypher-shell is not installed or not in PATH"
        print_status "Please install Neo4j client tools or use Docker container"
        exit 1
    fi
    
    # Wait for Neo4j to be ready
    if ! wait_for_neo4j; then
        print_error "Neo4j is not available"
        exit 1
    fi
    
    # Create schema
    create_schema
    
    # Create sample data
    create_sample_data
    
    # Create procedures
    create_procedures
    
    # Verify setup
    verify_setup
    
    print_success "🎉 Neo4j setup completed successfully!"
    print_status "You can now access:"
    print_status "  - Neo4j Browser: http://localhost:7474"
    print_status "  - Bolt endpoint: bolt://localhost:7687"
    print_status "  - API endpoints: http://localhost:8000/api/v1/geological-graph/"
}

# Run main function
main "$@" 