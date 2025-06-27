#!/bin/bash

# Exit on any error
set -e

echo "Starting GeoVision AI Miner Backend..."

# Run pre-start script
echo "Running pre-start script..."
bash ./prestart.sh

echo "Starting FastAPI application..."

# Production: Use Gunicorn with Uvicorn workers
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Starting in production mode with Gunicorn..."
    exec gunicorn app.main:app \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind 0.0.0.0:8000 \
        --timeout 120 \
        --keep-alive 2 \
        --max-requests 1000 \
        --max-requests-jitter 100 \
        --access-logfile - \
        --error-logfile - \
        --log-level info
else
    echo "Starting in development mode with Uvicorn..."
    exec uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload \
        --log-level debug
fi 