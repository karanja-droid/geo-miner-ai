# GeoMiner AI - Backend Server

A comprehensive geoscience analysis platform powered by AI, providing advanced geological, geochemical, and geophysical analysis capabilities with multi-agent workflows and real-time processing.

## 🚀 Features

### Core Capabilities
- **Multi-Provider AI Integration**: OpenAI GPT-4, Anthropic Claude, Alibaba Qwen
- **Advanced Geological Analysis**: Formation analysis, structural interpretation, mineral assessment
- **Geochemical Processing**: Anomaly detection, statistical analysis, trend identification
- **Graph Database Integration**: Neo4j for geological relationships and spatial queries
- **Chained Analysis Workflows**: Multi-step AI/ML processing pipelines
- **Real-time Notifications**: Email, Slack, SMS, and webhook notifications
- **Background Processing**: Async task processing with Celery
- **File Storage**: MinIO object storage with versioning
- **Spatial Data Support**: PostGIS integration for geospatial operations

### AI/ML Capabilities
- **Geological Interpretation**: AI-powered formation and structure analysis
- **Anomaly Detection**: Machine learning algorithms for geochemical anomalies
- **Predictive Modeling**: Regression and classification for mineral potential
- **Natural Language Processing**: LLM-based report generation and interpretation
- **Multi-Agent Workflows**: Orchestrated analysis chains combining ML and LLM

### Data Management
- **Dataset Organization**: Hierarchical project and dataset management
- **File Processing**: Support for CSV, Excel, Shapefile, GeoJSON formats
- **Data Validation**: Automated data quality checks and validation
- **Version Control**: Dataset versioning and change tracking
- **Spatial Indexing**: Efficient geospatial querying and indexing

## 🏗️ Architecture

### Technology Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+ with PostGIS
- **Graph Database**: Neo4j 5+
- **Cache**: Redis 7+
- **Storage**: MinIO (S3-compatible)
- **Task Queue**: Celery with Redis
- **Containerization**: Docker & Docker Compose

### Key Components
```
geovision-ai-miner-server/
├── app/
│   ├── core/                 # Core configuration and utilities
│   │   ├── config.py        # Environment configuration
│   │   ├── database.py      # Database connections
│   │   ├── security.py      # Authentication & authorization
│   │   └── neo4j_client.py  # Neo4j graph operations
│   ├── models/              # Database models
│   │   ├── base.py         # Base model functionality
│   │   ├── user.py         # User management
│   │   ├── project.py      # Project organization
│   │   ├── dataset.py      # Data management
│   │   └── ai_analysis.py  # AI analysis tracking
│   ├── services/           # Business logic services
│   │   ├── ai_agents.py    # Multi-provider AI orchestration
│   │   ├── geological_analysis.py  # Geological processing
│   │   ├── geochemical_analysis.py # Geochemical analysis
│   │   ├── geological_graph.py     # Neo4j operations
│   │   ├── notification_service.py # Multi-channel notifications
│   │   └── chained_analysis_service.py # Workflow orchestration
│   ├── api/                # API endpoints
│   │   └── api_v1/
│   │       ├── endpoints/  # Route handlers
│   │       └── api.py      # Router configuration
│   └── schemas/            # Pydantic models
├── scripts/                # Setup and deployment scripts
├── tests/                  # Test suite
└── docker-compose.yml      # Development environment
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+
- Git

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/geominer/geo-miner-backend.git
cd geo-miner-backend
```

2. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Start the development environment**
```bash
# Start all services
make dev

# Or using Docker Compose directly
docker-compose -f docker-compose.dev.yml up -d
```

4. **Initialize the database**
```bash
make init-db
```

5. **Access the application**
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Interface**: http://localhost:8000/admin

### Production Deployment

1. **Build and deploy**
```bash
make build
make deploy
```

2. **Environment configuration**
```bash
# Set production environment variables
export ENVIRONMENT=production
export DATABASE_URL=postgresql://user:pass@host:5432/geominer
export REDIS_URL=redis://host:6379
export NEO4J_URI=bolt://host:7687
```

## 📚 API Usage

### Authentication
```python
import requests

# Login
response = requests.post("https://api.geo-miner.com/api/v1/auth/login", json={
    "email": "user@example.com",
    "password": "password"
})
token = response.json()["access_token"]

# Use token in requests
headers = {"Authorization": f"Bearer {token}"}
```

### Create AI Analysis
```python
# Create geological analysis
analysis = requests.post("https://api.geo-miner.com/api/v1/ai/analysis", 
    headers=headers,
    json={
        "analysis_type": "geological",
        "provider": "openai",
        "dataset_id": "dataset_uuid",
        "prompt": "Analyze the geological formations and identify potential mineral deposits",
        "webhook_url": "https://your-app.com/webhook"
    }
)
```

### Chained Analysis Workflow
```python
# Create multi-step analysis
chained_analysis = requests.post("https://api.geo-miner.com/api/v1/chained-analysis",
    headers=headers,
    json={
        "workflow_name": "Geochemical Exploration",
        "steps": [
            {
                "type": "data_processing",
                "operation": "normalize",
                "description": "Normalize geochemical data"
            },
            {
                "type": "ml_analysis",
                "analysis_type": "anomaly_detection",
                "description": "Detect anomalies"
            },
            {
                "type": "llm_analysis",
                "provider": "openai",
                "description": "Generate recommendations"
            }
        ]
    }
)
```

### Geological Graph Operations
```python
# Create formation node
formation = requests.post("https://api.geo-miner.com/api/v1/geological-graph/nodes",
    headers=headers,
    json={
        "node_type": "formation",
        "properties": {
            "name": "Granite Formation",
            "age": "Precambrian",
            "coordinates": [40.7128, -74.0060]
        }
    }
)

# Create relationship
relationship = requests.post("https://api.geo-miner.com/api/v1/geological-graph/relationships",
    headers=headers,
    json={
        "source_node_id": "formation_uuid",
        "target_node_id": "fault_uuid",
        "relationship_type": "intersects"
    }
)
```

## 🔧 Configuration

### Environment Variables

#### Database Configuration
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/geominer
POSTGRES_DB=geominer
POSTGRES_USER=geominer
POSTGRES_PASSWORD=secure_password
```

#### Neo4j Configuration
```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

#### AI Provider Configuration
```bash
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
QWEN_API_KEY=your_qwen_key
```

#### Storage Configuration
```bash
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=geominer-data
```

#### Security Configuration
```bash
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Domain Configuration
```bash
DOMAIN=geo-miner.com
API_DOMAIN=api.geo-miner.com
FRONTEND_URL=https://geo-miner.com
API_URL=https://api.geo-miner.com
```

### Service Configuration

#### Redis Configuration
```bash
REDIS_URL=redis://localhost:6379
REDIS_DB=0
```

#### Celery Configuration
```bash
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
make test

# Run specific test categories
make test-unit
make test-integration
make test-api

# Run with coverage
make test-coverage
```

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── api/              # API endpoint tests
└── fixtures/         # Test data and fixtures
```

## 📊 Monitoring

### Health Checks
```bash
# Check service health
curl https://api.geo-miner.com/health

# Check database connectivity
curl https://api.geo-miner.com/health/db

# Check AI provider status
curl https://api.geo-miner.com/health/ai
```

### Logging
```bash
# View application logs
docker-compose logs -f app

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f neo4j
docker-compose logs -f redis
```

### Metrics
- **API Response Times**: Prometheus metrics available at `/metrics`
- **Database Performance**: Query execution times and connection stats
- **AI Processing Metrics**: Analysis completion rates and error rates
- **System Resources**: CPU, memory, and disk usage

## 🔒 Security

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Role-based access control
- API key support for external integrations

### Data Protection
- Encrypted data transmission (HTTPS)
- Secure file storage with access controls
- Database encryption at rest
- Regular security audits

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Webhook signature verification

## 🚀 Deployment

### Docker Deployment
```bash
# Build production image
docker build -t geominer-backend:latest .

# Run with production configuration
docker run -d \
  --name geominer-backend \
  -p 8000:8000 \
  --env-file .env.prod \
  geominer-backend:latest
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n geominer
kubectl get services -n geominer
```

### CI/CD Pipeline
```bash
# Automated testing and deployment
make ci-test
make ci-build
make ci-deploy
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `make test`
5. Submit a pull request

### Code Standards
- Follow PEP 8 style guidelines
- Add type hints to all functions
- Write comprehensive docstrings
- Include unit tests for new features

### Documentation
- Update API documentation for new endpoints
- Add examples for new features
- Update architecture documentation
- Include migration guides for breaking changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Reference**: [docs.geo-miner.com/api](https://docs.geo-miner.com/api)
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Community
- **Discord**: [discord.gg/geominer](https://discord.gg/geominer)
- **GitHub Issues**: [github.com/geominer/geo-miner-backend/issues](https://github.com/geominer/geo-miner-backend/issues)
- **Email Support**: support@geo-miner.com

### Status
- **Service Status**: [status.geo-miner.com](https://status.geo-miner.com)
- **Uptime**: 99.9%
- **Response Time**: < 200ms average

## 🎯 Roadmap

### Upcoming Features
- **Real-time Collaboration**: Multi-user editing and commenting
- **Advanced Visualization**: 3D geological models and interactive maps
- **Machine Learning Pipelines**: Automated model training and deployment
- **Mobile API**: Optimized endpoints for mobile applications
- **Multi-tenant Architecture**: Support for multiple organizations
- **Advanced Analytics Dashboard**: Real-time insights and reporting

### Technology Upgrades
- **GraphQL API**: More flexible querying capabilities
- **WebSocket Support**: Real-time updates and notifications
- **Advanced ML Models**: Custom geological models
- **Blockchain Integration**: Data provenance and verification
- **Edge Computing**: Distributed processing capabilities 