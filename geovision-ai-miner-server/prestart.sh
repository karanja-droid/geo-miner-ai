#!/bin/bash

# Exit on any error
set -e

echo "Running pre-start script..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
python -c "
import time
import sys
from sqlalchemy import create_engine
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL))

for i in range(60):
    try:
        connection = engine.connect()
        connection.close()
        print('Database is ready!')
        break
    except Exception as e:
        print(f'Database not ready yet... ({i+1}/60)')
        time.sleep(1)
else:
    print('Could not connect to database after 60 seconds')
    sys.exit(1)
"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Initialize database with initial data
echo "Initializing database..."
python -c "
from app.core.init_db import init_db
init_db()
print('Database initialization completed!')
"

# Create MinIO bucket if it doesn't exist
echo "Setting up MinIO bucket..."
python -c "
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

try:
    client = Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE
    )
    
    if not client.bucket_exists(settings.MINIO_BUCKET_NAME):
        client.make_bucket(settings.MINIO_BUCKET_NAME)
        print(f'Created bucket: {settings.MINIO_BUCKET_NAME}')
    else:
        print(f'Bucket already exists: {settings.MINIO_BUCKET_NAME}')
        
except S3Error as e:
    print(f'MinIO setup error: {e}')
except Exception as e:
    print(f'MinIO setup warning: {e}')
"

echo "Pre-start script completed successfully!" 