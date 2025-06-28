# GeoVision AI Miner Frontend

## Overview
This is the React/TypeScript frontend for the GeoVision AI Miner platform. It provides mapping, data upload, project management, AI analysis, and collaboration features for mineral exploration teams.

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Setup
1. Copy `.env.example` to `.env` and adjust as needed.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
   The app will run at `http://localhost:3000` by default.

### Environment Variables
- `REACT_APP_API_BASE_URL`: The base URL for the backend API (e.g., `http://localhost:8000`).

### Build for Production
```sh
npm run build
```

### Docker
A sample `Dockerfile` is provided for containerized builds.

## Features
- Secure authentication and role-based access
- Project and dataset management
- Data upload and visualization
- AI job submission and status tracking
- Comments and collaboration

## Deployment
- Use the provided Dockerfile or deploy the static build to your preferred hosting.

## License
MIT
