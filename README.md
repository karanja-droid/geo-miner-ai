# GeoVision AI Miner - Monorepo

A comprehensive geological analysis and mining AI platform with both frontend and backend components.

## 🏗️ Project Structure

This is a monorepo containing both the frontend and backend applications:

```
├── geovision-ai-miner-client/     # React TypeScript Frontend
├── geovision-ai-miner-server/     # FastAPI Python Backend
├── docker-compose.yml             # Docker Compose for local development
├── .github/workflows/             # CI/CD workflows
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Docker & Docker Compose** (for containerized development)
- **PostgreSQL with PostGIS** (for backend database)

### Local Development Setup

#### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karanja-droid/geo-miner-ai.git
   cd geo-miner-ai
   git checkout monorepo-main
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Frontend (React) on http://localhost:3000
   - Backend (FastAPI) on http://localhost:8000
   - PostgreSQL database on localhost:5432

#### Option 2: Manual Setup

1. **Backend Setup:**
   ```bash
   cd geovision-ai-miner-server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Run database migrations
   alembic upgrade head
   
   # Start the backend server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup:**
   ```bash
   cd geovision-ai-miner-client
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your backend API URL
   
   # Start the frontend development server
   npm start
   ```

## 🧪 Testing

### Backend Tests
```bash
cd geovision-ai-miner-server
source venv/bin/activate
pytest tests/
```

### Frontend Tests
```bash
cd geovision-ai-miner-client
npm test
```

## 🏭 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Workflow Triggers
- **Push to `main` or `monorepo-main` branches**
- **Pull requests to `main` or `monorepo-main` branches**

### Pipeline Steps
1. **Backend:**
   - Install Python dependencies
   - Run tests with pytest
   - Lint code with pylint
   - Build Docker image

2. **Frontend:**
   - Install Node.js dependencies
   - Run tests with npm test
   - Lint code with npm run lint
   - Build production bundle
   - Build Docker image

## 📁 Detailed Project Structure

### Backend (`geovision-ai-miner-server/`)
```
├── app/
│   ├── api/endpoints/     # API route handlers
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── auth.py           # Authentication logic
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── requirements.txt      # Python dependencies
└── Dockerfile           # Backend container
```

### Frontend (`geovision-ai-miner-client/`)
```
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── App.tsx          # Main app component
│   └── index.tsx        # App entry point
├── public/              # Static assets
├── package.json         # Node.js dependencies
└── Dockerfile           # Frontend container
```

## 🔧 Environment Variables

### Backend Environment Variables
Create a `.env` file in `geovision-ai-miner-server/`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/geovision_ai_miner
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Environment Variables
Create a `.env` file in `geovision-ai-miner-client/`:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

## 🐳 Docker Deployment

### Production Build
```bash
# Build backend
docker build -t geovision-ai-miner-backend ./geovision-ai-miner-server

# Build frontend
docker build -t geovision-ai-miner-frontend ./geovision-ai-miner-client

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

Once the backend is running, you can access:
- **Interactive API docs:** http://localhost:8000/docs
- **ReDoc documentation:** http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team

## 🔄 Branch Strategy

- `main`: Production-ready code
- `monorepo-main`: Monorepo structure with both frontend and backend
- `develop`: Development branch for new features
- Feature branches: `feature/feature-name`
- Hotfix branches: `hotfix/issue-description`
