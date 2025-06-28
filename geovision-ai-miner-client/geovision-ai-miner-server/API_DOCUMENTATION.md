# GeoVision AI Miner - API Documentation

## Overview

The GeoVision AI Miner API provides comprehensive endpoints for geological analysis, AI-powered interpretation, data management, and multi-agent workflows. This documentation covers all available endpoints with examples and usage patterns.

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.geovision-ai.com/api/v1
```

## Authentication

All API endpoints require authentication using JWT tokens.

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "Dr. Jane Smith",
    "role": "geologist"
  }
}
```

### Using Authentication
Include the token in the Authorization header:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Projects API

### List Projects
```http
GET /api/v1/projects?skip=0&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Copper Mountain Exploration",
      "description": "Geological survey of copper deposits",
      "location": "Colorado, USA",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 10
}
```

### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Exploration Project",
  "description": "Geological survey project",
  "location": "Nevada, USA",
  "start_date": "2024-02-01",
  "end_date": "2024-12-31"
}
```

### Get Project Details
```http
GET /api/v1/projects/{project_id}
Authorization: Bearer <token>
```

## Data Management API

### Upload Dataset
```http
POST /api/v1/data
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Geochemical Survey 2024",
  "description": "Soil and rock samples analysis",
  "type": "geochemical",
  "project_id": "uuid",
  "file": <file_upload>
}
```

### List Datasets
```http
GET /api/v1/data?project_id={project_id}&type=geochemical
Authorization: Bearer <token>
```

### Download Dataset
```http
GET /api/v1/data/{dataset_id}/download
Authorization: Bearer <token>
```

## AI Analysis API

### Create Analysis Job
```http
POST /api/v1/ai/analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "analysis_type": "geological",
  "provider": "openai",
  "dataset_id": "uuid",
  "parameters": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "webhook_url": "https://your-app.com/webhook",
  "prompt": "Analyze the geological formations in this dataset and identify potential mineral deposits."
}
```

**Response:**
```json
{
  "id": "analysis_uuid",
  "status": "processing",
  "message": "Analysis job created successfully",
  "estimated_completion": "2024-01-15T11:30:00Z"
}
```

### Get Analysis Status
```http
GET /api/v1/ai/analysis/{analysis_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "analysis_uuid",
  "analysis_type": "geological",
  "provider": "openai",
  "status": "completed",
  "progress": 100,
  "result": {
    "summary": "Analysis of geological formations reveals...",
    "recommendations": [
      "High potential for copper deposits in the eastern region",
      "Further drilling recommended in areas A, B, and C"
    ],
    "confidence_score": 0.85,
    "processing_time": 45
  },
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T11:15:00Z"
}
```

### List Analysis Jobs
```http
GET /api/v1/ai/analysis?status=completed&limit=10
Authorization: Bearer <token>
```

### Submit Feedback
```http
POST /api/v1/ai/analysis/{analysis_id}/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "helpful": true,
  "feedback_text": "Excellent analysis with detailed recommendations"
}
```

## Geological Graph API

### Create Formation Node
```http
POST /api/v1/geological-graph/nodes
Authorization: Bearer <token>
Content-Type: application/json

{
  "node_type": "formation",
  "properties": {
    "name": "Granite Formation",
    "age": "Precambrian",
    "rock_type": "igneous",
    "coordinates": [40.7128, -74.0060]
  }
}
```

### Create Relationship
```http
POST /api/v1/geological-graph/relationships
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_node_id": "formation_uuid",
  "target_node_id": "fault_uuid",
  "relationship_type": "intersects",
  "properties": {
    "intersection_type": "normal",
    "confidence": 0.9
  }
}
```

### Query Nodes
```http
GET /api/v1/geological-graph/nodes?node_type=formation&properties.age=Precambrian
Authorization: Bearer <token>
```

### Spatial Query
```http
POST /api/v1/geological-graph/spatial
Authorization: Bearer <token>
Content-Type: application/json

{
  "query_type": "within_radius",
  "center": [40.7128, -74.0060],
  "radius_km": 10,
  "node_types": ["formation", "fault"]
}
```

### Find Paths
```http
POST /api/v1/geological-graph/paths
Authorization: Bearer <token>
Content-Type: application/json

{
  "start_node_id": "formation_uuid",
  "end_node_id": "ore_body_uuid",
  "max_depth": 3,
  "relationship_types": ["intersects", "adjacent"]
}
```

## Chained Analysis API

### Create Chained Analysis
```http
POST /api/v1/chained-analysis
Authorization: Bearer <token>
Content-Type: application/json

{
  "workflow_name": "Geochemical Exploration",
  "steps": [
    {
      "type": "data_processing",
      "operation": "normalize",
      "description": "Normalize geochemical data",
      "input_data": {
        "dataset_id": "uuid",
        "normalization_method": "z_score"
      }
    },
    {
      "type": "ml_analysis",
      "analysis_type": "anomaly_detection",
      "description": "Detect geochemical anomalies",
      "input_data": {
        "algorithm": "isolation_forest",
        "contamination": 0.1
      }
    },
    {
      "type": "llm_analysis",
      "provider": "openai",
      "description": "Generate exploration recommendations",
      "prompt": "Based on the geochemical anomalies detected, provide exploration recommendations for potential mineral deposits.",
      "context": {
        "anomaly_results": "{{step_2_results}}"
      }
    }
  ],
  "webhook_url": "https://your-app.com/webhook"
}
```

**Response:**
```json
{
  "id": "chained_analysis_uuid",
  "workflow_name": "Geochemical Exploration",
  "status": "processing",
  "message": "Chained analysis started successfully"
}
```

### Get Chained Analysis Status
```http
GET /api/v1/chained-analysis/{analysis_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "chained_analysis_uuid",
  "workflow_name": "Geochemical Exploration",
  "status": "completed",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T11:45:00Z",
  "steps": [
    {
      "step_number": 1,
      "step_type": "data_processing",
      "status": "completed",
      "processing_time": 15,
      "description": "Normalize geochemical data"
    },
    {
      "step_number": 2,
      "step_type": "ml_analysis",
      "status": "completed",
      "processing_time": 30,
      "description": "Detect geochemical anomalies"
    },
    {
      "step_number": 3,
      "step_type": "llm_analysis",
      "provider": "openai",
      "status": "completed",
      "processing_time": 45,
      "description": "Generate exploration recommendations"
    }
  ],
  "results": [
    {
      "step_id": "step_1_uuid",
      "status": "completed",
      "result": {
        "normalized_data": "...",
        "statistics": {...}
      }
    },
    {
      "step_id": "step_2_uuid",
      "status": "completed",
      "result": {
        "anomalies": [...],
        "confidence_scores": [...]
      }
    },
    {
      "step_id": "step_3_uuid",
      "status": "completed",
      "result": {
        "recommendations": [
          "High priority target in the northeastern quadrant",
          "Medium priority targets in the western region"
        ],
        "confidence": 0.88
      }
    }
  ]
}
```

### List Chained Analyses
```http
GET /api/v1/chained-analysis?status=completed&limit=10
Authorization: Bearer <token>
```

### Get Analysis Templates
```http
GET /api/v1/chained-analysis/templates
Authorization: Bearer <token>
```

**Response:**
```json
{
  "templates": {
    "geochemical_exploration": [
      {
        "type": "data_processing",
        "operation": "normalize",
        "description": "Normalize geochemical data"
      },
      {
        "type": "ml_analysis",
        "analysis_type": "anomaly_detection",
        "description": "Detect geochemical anomalies"
      },
      {
        "type": "llm_analysis",
        "provider": "openai",
        "description": "Generate exploration recommendations"
      }
    ],
    "geological_mapping": [
      {
        "type": "geological_analysis",
        "analysis_type": "formation_analysis",
        "description": "Analyze geological formations"
      },
      {
        "type": "ml_analysis",
        "analysis_type": "clustering",
        "description": "Cluster similar formations"
      },
      {
        "type": "llm_analysis",
        "provider": "anthropic",
        "description": "Generate geological interpretation"
      }
    ]
  }
}
```

## Webhook Integration

### Webhook Payload Format
When analysis completes, webhooks are sent to the specified URL:

```json
{
  "event_type": "analysis_completed",
  "analysis_id": "uuid",
  "user_id": "uuid",
  "analysis_type": "geological",
  "provider": "openai",
  "status": "completed",
  "result": {
    "summary": "Analysis results...",
    "recommendations": [...],
    "confidence_score": 0.85
  },
  "processing_time": 45,
  "timestamp": "2024-01-15T11:15:00Z",
  "signature": "sha256=..."
}
```

### Webhook Security
Webhooks include a signature for verification:
```python
import hmac
import hashlib

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or expired token
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate-limited to ensure fair usage:
- **Authentication**: 5 requests per minute
- **Analysis Jobs**: 10 requests per hour
- **Data Upload**: 20 requests per hour
- **General API**: 1000 requests per hour

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## Pagination

List endpoints support pagination:
```http
GET /api/v1/projects?skip=0&limit=10
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "total": 100,
    "has_more": true
  }
}
```

## File Upload

### Supported Formats
- **Geochemical Data**: CSV, Excel (.xlsx, .xls)
- **Geological Data**: CSV, Shapefile (.shp), GeoJSON
- **Images**: PNG, JPG, TIFF
- **Documents**: PDF, DOC, DOCX

### Upload Limits
- **File Size**: 100MB per file
- **Batch Upload**: 10 files per request
- **Total Storage**: 10GB per user

### Upload Example
```http
POST /api/v1/data/{dataset_id}/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "files": [file1, file2, file3],
  "metadata": {
    "description": "Geochemical survey data",
    "tags": ["soil", "copper", "2024"]
  }
}
```

## SDK Examples

### Python SDK
```python
from geovision_ai import GeoVisionClient

client = GeoVisionClient(api_key="your_api_key")

# Create analysis
analysis = client.create_analysis(
    analysis_type="geological",
    dataset_id="dataset_uuid",
    prompt="Analyze geological formations"
)

# Get results
result = client.get_analysis_result(analysis.id)
print(result.summary)
```

### JavaScript SDK
```javascript
import { GeoVisionClient } from '@geovision-ai/sdk';

const client = new GeoVisionClient({ apiKey: 'your_api_key' });

// Create analysis
const analysis = await client.createAnalysis({
  analysisType: 'geological',
  datasetId: 'dataset_uuid',
  prompt: 'Analyze geological formations'
});

// Get results
const result = await client.getAnalysisResult(analysis.id);
console.log(result.summary);
```

## Best Practices

### 1. Error Handling
```python
try:
    response = client.create_analysis(data)
except GeoVisionError as e:
    if e.code == 'RATE_LIMIT_EXCEEDED':
        time.sleep(60)  # Wait and retry
    elif e.code == 'VALIDATION_ERROR':
        print(f"Invalid data: {e.details}")
```

### 2. Webhook Handling
```python
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    # Verify signature
    if not verify_signature(request.data, request.headers['X-Signature']):
        return 'Unauthorized', 401
    
    data = request.json
    if data['event_type'] == 'analysis_completed':
        # Process completed analysis
        process_analysis_result(data)
    
    return 'OK', 200
```

### 3. Efficient Data Upload
```python
# Upload large datasets in chunks
for chunk in data_chunks:
    client.upload_data_chunk(dataset_id, chunk)
    time.sleep(1)  # Rate limiting
```

### 4. Monitoring Analysis Jobs
```python
# Poll for completion
while True:
    status = client.get_analysis_status(analysis_id)
    if status.status == 'completed':
        result = client.get_analysis_result(analysis_id)
        break
    elif status.status == 'failed':
        raise Exception(f"Analysis failed: {status.error}")
    
    time.sleep(30)  # Poll every 30 seconds
```

## Support and Resources

### Documentation
- **API Reference**: https://docs.geovision-ai.com/api
- **SDK Documentation**: https://docs.geovision-ai.com/sdk
- **Examples**: https://github.com/geovision-ai/examples

### Support
- **Email**: support@geovision-ai.com
- **Discord**: https://discord.gg/geovision-ai
- **GitHub Issues**: https://github.com/geovision-ai/issues

### Status Page
- **API Status**: https://status.geovision-ai.com
- **Uptime**: 99.9%
- **Response Time**: < 200ms average 