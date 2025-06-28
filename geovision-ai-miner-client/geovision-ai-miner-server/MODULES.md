# GeoVision AI Miner - Module Documentation

## Core Modules

### 1. Configuration Management (`app/core/config.py`)

**Purpose**: Centralized configuration management for the entire application.

**Key Features**:
- Environment-based configuration loading
- Database connection settings
- AI provider API keys and endpoints
- Security and authentication settings
- File storage configuration
- Redis and Celery settings

**Configuration Categories**:
- **Database**: PostgreSQL connection strings, pool settings
- **AI Providers**: OpenAI, Anthropic, Alibaba Qwen API keys
- **Security**: JWT secrets, password policies, CORS settings
- **Storage**: MinIO configuration, file upload limits
- **External Services**: Email, SMS, Slack webhook URLs

**Usage Example**:
```python
from app.core.config import settings

# Access configuration
database_url = settings.DATABASE_URL
openai_api_key = settings.OPENAI_API_KEY
```

### 2. Database Management (`app/core/database.py`)

**Purpose**: Database connection and session management.

**Key Features**:
- SQLAlchemy session factory
- Connection pooling configuration
- Database dependency injection
- Migration support
- Transaction management

**Components**:
- **Session Factory**: Creates database sessions with proper configuration
- **Dependency Injection**: Provides database sessions to API endpoints
- **Connection Pooling**: Manages database connections efficiently

**Usage Example**:
```python
from app.core.database import get_db

def some_function(db: Session = Depends(get_db)):
    # Use database session
    users = db.query(User).all()
```

### 3. Security (`app/core/security.py`)

**Purpose**: Authentication, authorization, and security utilities.

**Key Features**:
- JWT token creation and validation
- Password hashing and verification
- Role-based access control
- API key management
- Security middleware

**Security Functions**:
- `create_access_token()`: Generate JWT tokens
- `verify_password()`: Verify user passwords
- `get_current_user()`: Extract user from JWT token
- `get_password_hash()`: Hash passwords securely

**Usage Example**:
```python
from app.core.security import get_current_user, create_access_token

# Create token
token = create_access_token(data={"sub": user.email})

# Verify user
current_user = get_current_user(token)
```

### 4. Neo4j Client (`app/core/neo4j_client.py`)

**Purpose**: Graph database operations for geological relationships.

**Key Features**:
- Neo4j connection management
- Geological node operations
- Relationship management
- Spatial queries
- Graph traversal algorithms

**Operations**:
- **Node Management**: Create, update, delete geological entities
- **Relationship Management**: Establish connections between entities
- **Spatial Queries**: Geographic-based graph queries
- **Pattern Matching**: Complex graph pattern searches

**Usage Example**:
```python
from app.core.neo4j_client import Neo4jClient

client = Neo4jClient()
# Create geological formation
formation = client.create_formation(name="Granite", coordinates=[lat, lon])
# Create relationship
client.create_relationship(formation, fault, "intersects")
```

## Model Modules

### 1. Base Models (`app/models/base.py`)

**Purpose**: Common database model functionality and base classes.

**Key Features**:
- UUID primary key generation
- Timestamp fields (created_at, updated_at)
- Soft delete functionality
- Audit trail support
- Common model methods

**Base Class Features**:
- **UUID Primary Keys**: Secure, globally unique identifiers
- **Timestamps**: Automatic creation and update timestamps
- **Soft Delete**: Mark records as deleted without physical removal
- **Audit Trail**: Track changes and modifications

**Usage Example**:
```python
from app.models.base import Base

class MyModel(Base):
    __tablename__ = "my_table"
    
    # Inherits UUID, timestamps, and audit functionality
    name = Column(String(255), nullable=False)
```

### 2. User Management (`app/models/user.py`)

**Purpose**: User account and profile management.

**Key Features**:
- User authentication data
- Role and permission management
- Profile information
- Notification preferences
- Account settings

**User Properties**:
- **Authentication**: Email, password hash, active status
- **Profile**: Name, organization, contact information
- **Roles**: Admin, geologist, analyst, viewer
- **Preferences**: Notification settings, UI preferences

**Usage Example**:
```python
from app.models.user import User

# Create user
user = User(
    email="geologist@company.com",
    full_name="Dr. Jane Smith",
    role="geologist"
)
```

### 3. Project Management (`app/models/project.py`)

**Purpose**: Project organization and team collaboration.

**Key Features**:
- Project creation and management
- Team member management
- Access control and permissions
- Project metadata and settings
- Version control integration

**Project Features**:
- **Metadata**: Name, description, location, dates
- **Team Management**: Members, roles, permissions
- **Data Organization**: Datasets, analyses, reports
- **Access Control**: Public, private, team-based access

**Usage Example**:
```python
from app.models.project import Project

# Create project
project = Project(
    name="Copper Mountain Exploration",
    description="Geological survey of copper deposits",
    location="Colorado, USA"
)
```

### 4. Data Management (`app/models/dataset.py`, `file.py`)

**Purpose**: Dataset and file storage management.

**Key Features**:
- Dataset organization and metadata
- File upload and storage
- Data validation and processing
- Version control
- Access permissions

**Dataset Features**:
- **Metadata**: Name, type, description, tags
- **Files**: Associated data files and documents
- **Validation**: Data quality checks and validation
- **Versioning**: Track changes and updates

**Usage Example**:
```python
from app.models.dataset import Dataset

# Create dataset
dataset = Dataset(
    name="Geochemical Survey 2024",
    type="geochemical",
    description="Soil and rock samples analysis"
)
```

### 5. AI Analysis (`app/models/ai_analysis.py`)

**Purpose**: AI analysis job tracking and result management.

**Key Features**:
- Analysis job lifecycle management
- Webhook delivery tracking
- User feedback collection
- Chained analysis workflows
- Performance metrics

**Analysis Tracking**:
- **Job Management**: Status, progress, results
- **Webhook Delivery**: Success/failure tracking, retries
- **User Feedback**: Ratings, comments, helpfulness
- **Chained Workflows**: Multi-step analysis tracking

**Usage Example**:
```python
from app.models.ai_analysis import AIAnalysisJob

# Track analysis job
job = AIAnalysisJob(
    user_id=user.id,
    analysis_type="geological",
    provider="openai",
    status="processing"
)
```

## Service Modules

### 1. AI Agents (`app/services/ai_agents.py`)

**Purpose**: Multi-provider AI agent orchestration and management.

**Key Features**:
- OpenAI GPT-4 integration
- Anthropic Claude integration
- Alibaba Qwen integration
- Async processing with webhooks
- Error handling and retries
- Rate limiting and cost management

**AI Provider Support**:
- **OpenAI**: GPT-4, GPT-3.5-turbo models
- **Anthropic**: Claude-3, Claude-2 models
- **Alibaba**: Qwen models for Chinese language support

**Processing Features**:
- **Async Processing**: Non-blocking AI requests
- **Webhook Delivery**: Real-time result notifications
- **Error Handling**: Retry logic and fallback strategies
- **Rate Limiting**: API quota management

**Usage Example**:
```python
from app.services.ai_agents import AIAgentService

agent_service = AIAgentService()

# Analyze with OpenAI
result = await agent_service.analyze_with_llm(
    provider="openai",
    prompt="Analyze this geological formation",
    context={"data": geological_data}
)
```

### 2. Geological Analysis (`app/services/geological_analysis.py`)

**Purpose**: Geological data processing and analysis.

**Key Features**:
- Formation analysis and classification
- Structural analysis
- Mineral potential assessment
- Clustering algorithms
- Spatial analysis and mapping

**Analysis Types**:
- **Formation Analysis**: Rock type classification, age determination
- **Structural Analysis**: Fault analysis, fold patterns
- **Mineral Assessment**: Ore potential evaluation
- **Spatial Analysis**: Geographic distribution patterns

**ML Algorithms**:
- **Clustering**: K-means, DBSCAN for formation grouping
- **Classification**: Random Forest, SVM for rock classification
- **Regression**: Linear models for property prediction

**Usage Example**:
```python
from app.services.geological_analysis import GeologicalAnalysisService

geo_service = GeologicalAnalysisService()

# Analyze formations
results = await geo_service.analyze_formations(formation_data)
# Assess mineral potential
potential = await geo_service.assess_mineral_potential(geological_data)
```

### 3. Geochemical Analysis (`app/services/geochemical_analysis.py`)

**Purpose**: Geochemical data processing and analysis.

**Key Features**:
- Element concentration analysis
- Anomaly detection
- Ratio analysis
- Trend analysis
- Statistical modeling and prediction

**Analysis Capabilities**:
- **Element Analysis**: Concentration mapping, correlation analysis
- **Anomaly Detection**: Statistical outlier identification
- **Ratio Analysis**: Element ratio calculations and interpretation
- **Trend Analysis**: Spatial and temporal trend identification

**Statistical Methods**:
- **Descriptive Statistics**: Mean, median, standard deviation
- **Inferential Statistics**: Hypothesis testing, confidence intervals
- **Multivariate Analysis**: PCA, factor analysis
- **Spatial Statistics**: Kriging, variogram analysis

**Usage Example**:
```python
from app.services.geochemical_analysis import GeochemicalAnalysisService

chem_service = GeochemicalAnalysisService()

# Detect anomalies
anomalies = await chem_service.detect_anomalies(sample_data)
# Analyze elements
element_analysis = await chem_service.analyze_elements(geochemical_data)
```

### 4. Geological Graph (`app/services/geological_graph.py`)

**Purpose**: Neo4j graph database operations for geological relationships.

**Key Features**:
- Geological node creation and management
- Relationship establishment and querying
- Spatial graph queries
- Graph traversal algorithms
- Pattern matching and analysis

**Graph Operations**:
- **Node Management**: Create, update, delete geological entities
- **Relationship Management**: Establish connections between entities
- **Spatial Queries**: Geographic-based graph searches
- **Pattern Matching**: Complex geological pattern identification

**Node Types**:
- **Formations**: Geological rock units
- **Faults**: Structural discontinuities
- **Drill Holes**: Borehole data points
- **Ore Bodies**: Mineralized zones

**Relationship Types**:
- **Intersects**: Spatial intersection relationships
- **Adjacent**: Neighboring geological units
- **Contains**: Hierarchical containment relationships
- **Similar**: Similarity relationships

**Usage Example**:
```python
from app.services.geological_graph import GeologicalGraphService

graph_service = GeologicalGraphService()

# Create formation node
formation = await graph_service.create_formation(
    name="Granite Formation",
    coordinates=[latitude, longitude],
    properties={"age": "Precambrian", "type": "igneous"}
)

# Create relationship
await graph_service.create_relationship(
    source_node=formation,
    target_node=fault,
    relationship_type="intersects"
)
```

### 5. Notification Service (`app/services/notification_service.py`)

**Purpose**: Multi-channel notification delivery and management.

**Key Features**:
- Email notification delivery
- Slack integration
- SMS delivery
- Webhook notifications
- Batch processing
- Delivery tracking and retries

**Notification Channels**:
- **Email**: SMTP-based email delivery
- **Slack**: Team collaboration notifications
- **SMS**: Mobile text message delivery
- **Webhook**: Custom endpoint notifications

**Features**:
- **Template Support**: Predefined notification templates
- **Batch Processing**: Efficient bulk notification delivery
- **Delivery Tracking**: Success/failure monitoring
- **Retry Logic**: Automatic retry for failed deliveries

**Usage Example**:
```python
from app.services.notification_service import notification_service

# Send email notification
await notification_service.send_notification(
    user_id=user.id,
    notification_type="email",
    recipient=user.email,
    subject="Analysis Complete",
    message="Your geological analysis is ready"
)
```

### 6. Chained Analysis (`app/services/chained_analysis_service.py`)

**Purpose**: Multi-agent workflow orchestration and management.

**Key Features**:
- Sequential step execution
- Parallel processing capabilities
- Error handling and recovery
- Progress tracking
- Result aggregation
- Template workflow management

**Workflow Types**:
- **Geochemical Exploration**: Data processing → Anomaly detection → LLM interpretation
- **Geological Mapping**: Formation analysis → Clustering → Structural interpretation
- **Mineral Assessment**: Element analysis → Potential assessment → Grade prediction

**Step Types**:
- **ML Analysis**: Machine learning model execution
- **LLM Analysis**: Language model interpretation
- **Data Processing**: Data preparation and transformation
- **Geological Analysis**: Geological-specific analysis
- **Geochemical Analysis**: Geochemical-specific analysis

**Features**:
- **Sequential Execution**: Ordered step processing
- **Error Handling**: Graceful failure management
- **Progress Tracking**: Real-time status updates
- **Result Aggregation**: Combined output generation

**Usage Example**:
```python
from app.services.chained_analysis_service import chained_analysis_service

# Execute chained analysis
analysis_id = await chained_analysis_service.execute_chained_analysis(
    user_id=user.id,
    workflow_name="Geochemical Exploration",
    steps=[
        {"type": "data_processing", "operation": "normalize"},
        {"type": "ml_analysis", "analysis_type": "anomaly_detection"},
        {"type": "llm_analysis", "provider": "openai"}
    ]
)
```

## API Modules

### 1. Authentication (`app/api/api_v1/endpoints/auth.py`)

**Purpose**: User authentication and session management endpoints.

**Endpoints**:
- `POST /auth/login`: User login
- `POST /auth/logout`: User logout
- `POST /auth/refresh`: Token refresh
- `POST /auth/register`: User registration
- `POST /auth/forgot-password`: Password reset request

**Features**:
- JWT token-based authentication
- Password reset functionality
- Account registration
- Session management

### 2. Projects (`app/api/api_v1/endpoints/projects.py`)

**Purpose**: Project management and collaboration endpoints.

**Endpoints**:
- `GET /projects`: List user projects
- `POST /projects`: Create new project
- `GET /projects/{id}`: Get project details
- `PUT /projects/{id}`: Update project
- `DELETE /projects/{id}`: Delete project
- `POST /projects/{id}/members`: Add team member

**Features**:
- CRUD operations for projects
- Team member management
- Access control
- Project statistics

### 3. Data Management (`app/api/api_v1/endpoints/data.py`)

**Purpose**: Dataset and file management endpoints.

**Endpoints**:
- `GET /data`: List datasets
- `POST /data`: Create dataset
- `GET /data/{id}`: Get dataset details
- `PUT /data/{id}`: Update dataset
- `DELETE /data/{id}`: Delete dataset
- `POST /data/{id}/files`: Upload files
- `GET /data/{id}/files/{file_id}`: Download file

**Features**:
- Dataset CRUD operations
- File upload and download
- Data validation
- Version control

### 4. AI Analysis (`app/api/api_v1/endpoints/ai_analysis.py`)

**Purpose**: AI analysis job management endpoints.

**Endpoints**:
- `POST /ai/analysis`: Create analysis job
- `GET /ai/analysis/{id}`: Get job status
- `GET /ai/analysis`: List user jobs
- `DELETE /ai/analysis/{id}`: Cancel job
- `POST /ai/analysis/{id}/feedback`: Submit feedback

**Features**:
- Analysis job creation and management
- Status tracking
- Result retrieval
- Webhook management
- User feedback collection

### 5. Geological Graph (`app/api/api_v1/endpoints/geological_graph.py`)

**Purpose**: Graph database operations endpoints.

**Endpoints**:
- `POST /geological-graph/nodes`: Create node
- `GET /geological-graph/nodes`: Query nodes
- `POST /geological-graph/relationships`: Create relationship
- `GET /geological-graph/relationships`: Query relationships
- `GET /geological-graph/paths`: Find paths
- `GET /geological-graph/spatial`: Spatial queries

**Features**:
- Node and relationship management
- Graph queries and traversal
- Spatial analysis
- Pattern matching

### 6. Chained Analysis (`app/api/api_v1/endpoints/chained_analysis.py`)

**Purpose**: Multi-agent workflow management endpoints.

**Endpoints**:
- `POST /chained-analysis`: Create workflow
- `GET /chained-analysis/{id}`: Get workflow status
- `GET /chained-analysis`: List workflows
- `DELETE /chained-analysis/{id}`: Cancel workflow
- `GET /chained-analysis/templates`: Get templates

**Features**:
- Workflow creation and management
- Status monitoring
- Template management
- Result aggregation

## Schema Modules

### 1. Request/Response Models (`app/schemas/`)

**Purpose**: API data validation and serialization.

**Schema Types**:
- **Request Models**: Input validation for API endpoints
- **Response Models**: Output serialization and documentation
- **Update Models**: Partial update validation
- **List Models**: Pagination and filtering

**Features**:
- Pydantic-based validation
- Automatic API documentation
- Type safety and IDE support
- Custom validators and constraints

**Usage Example**:
```python
from app.schemas.project import ProjectCreate, ProjectResponse

# Request validation
project_data = ProjectCreate(
    name="Exploration Project",
    description="Geological survey project"
)

# Response serialization
response = ProjectResponse(
    id="uuid",
    name="Exploration Project",
    created_at=datetime.now()
)
```

## Integration and Workflow

### Data Flow Examples

#### 1. Complete Analysis Workflow
```
1. User uploads geochemical data
2. System validates and stores data
3. User requests AI analysis
4. Background task processes data
5. AI agent generates interpretation
6. Results stored in database
7. Webhook notification sent
8. User receives email notification
```

#### 2. Chained Analysis Workflow
```
1. User creates chained analysis
2. Step 1: Data normalization
3. Step 2: Anomaly detection (ML)
4. Step 3: Geological interpretation (LLM)
5. Results aggregated
6. Webhook notification sent
7. User accesses combined results
```

#### 3. Geological Graph Workflow
```
1. User uploads geological data
2. System creates formation nodes
3. Spatial relationships established
4. Graph queries executed
5. Visualization data generated
6. Results returned to frontend
```

### Error Handling and Recovery

#### Service-Level Error Handling
- **Retry Logic**: Automatic retry for transient failures
- **Circuit Breaker**: Prevent cascade failures
- **Fallback Strategies**: Alternative processing paths
- **Error Logging**: Comprehensive error tracking

#### API-Level Error Handling
- **Input Validation**: Request data validation
- **Authentication Errors**: Proper error responses
- **Rate Limiting**: API quota management
- **Graceful Degradation**: Partial functionality during failures

### Performance Optimization

#### Database Optimization
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed queries and caching
- **Batch Operations**: Bulk data processing
- **Read Replicas**: Load distribution

#### Caching Strategy
- **Redis Caching**: Session and data caching
- **Query Caching**: Database query results
- **Graph Caching**: Neo4j query results
- **Static Asset Caching**: File and image caching

#### Async Processing
- **Background Tasks**: Non-blocking operations
- **Queue Management**: Celery task queues
- **Parallel Processing**: Concurrent operations
- **Resource Management**: Efficient resource utilization 