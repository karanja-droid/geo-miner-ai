# GeoVision AI Miner Backend

## Overview
This is the FastAPI backend for the GeoVision AI Miner platform. It provides authentication, project/data management, AI job orchestration, and API endpoints for the frontend.

## Getting Started

### Prerequisites
- Python 3.9+
- PostgreSQL (with PostGIS)

### Setup
1. Copy `.env.example` to `.env` and adjust as needed.
2. Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run Alembic migrations:
   ```sh
   alembic upgrade head
   ```
5. Start the server:
   ```sh
   uvicorn app.main:app --reload
   ```
   The API will run at `http://localhost:8000` by default.

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret
- `UPLOAD_DIR`: Directory for uploaded files

### Docker
A sample `Dockerfile` is provided for containerized builds.

## Features
- JWT authentication and role-based access
- Project, dataset, and AI job management
- Data upload and storage
- Comments and collaboration

## Deployment
- Use the provided Dockerfile or deploy with your preferred WSGI/ASGI server.

## License
MIT 