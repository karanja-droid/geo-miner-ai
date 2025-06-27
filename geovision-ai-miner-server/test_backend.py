#!/usr/bin/env python3
"""
Test script for GeoMiner AI Backend
Tests basic functionality and connectivity
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"
HEALTH_ENDPOINT = f"{BASE_URL}/health"
DOCS_ENDPOINT = f"{BASE_URL}/docs"

# Test data
TEST_USER = {
    "email": "test@geo-miner.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "company": "GeoMiner Test Corp"
}

TEST_PROJECT = {
    "name": "Test Mining Project",
    "description": "A test project for GeoMiner AI",
    "location": "Test Location",
    "coordinates": [40.7128, -74.0060]
}

TEST_DATASET = {
    "name": "Test Geological Data",
    "description": "Sample geological dataset",
    "data_type": "geological",
    "file_format": "csv"
}

TEST_ANALYSIS = {
    "analysis_type": "geological",
    "provider": "openai",
    "prompt": "Analyze this geological data and identify potential mineral deposits",
    "parameters": {
        "temperature": 0.7,
        "max_tokens": 1000
    }
}

def print_status(message: str, status: str = "INFO"):
    """Print formatted status message"""
    colors = {
        "INFO": "\033[94m",    # Blue
        "SUCCESS": "\033[92m", # Green
        "WARNING": "\033[93m", # Yellow
        "ERROR": "\033[91m",   # Red
        "RESET": "\033[0m"     # Reset
    }
    print(f"{colors.get(status, colors['INFO'])}[{status}]{colors['RESET']} {message}")

def test_health_endpoint() -> bool:
    """Test the health endpoint"""
    try:
        print_status("Testing health endpoint...")
        response = requests.get(HEALTH_ENDPOINT, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_status(f"Health check passed: {data.get('status', 'unknown')}", "SUCCESS")
            return True
        else:
            print_status(f"Health check failed: {response.status_code}", "ERROR")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status(f"Health check error: {e}", "ERROR")
        return False

def test_docs_endpoint() -> bool:
    """Test the API documentation endpoint"""
    try:
        print_status("Testing API documentation...")
        response = requests.get(DOCS_ENDPOINT, timeout=10)
        
        if response.status_code == 200:
            print_status("API documentation accessible", "SUCCESS")
            return True
        else:
            print_status(f"API documentation failed: {response.status_code}", "WARNING")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status(f"API documentation error: {e}", "WARNING")
        return False

def test_database_health() -> bool:
    """Test database connectivity"""
    try:
        print_status("Testing database connectivity...")
        response = requests.get(f"{BASE_URL}/health/db", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_status(f"Database health: {data.get('status', 'unknown')}", "SUCCESS")
            return True
        else:
            print_status(f"Database health check failed: {response.status_code}", "ERROR")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status(f"Database health check error: {e}", "ERROR")
        return False

def test_ai_health() -> bool:
    """Test AI services health"""
    try:
        print_status("Testing AI services...")
        response = requests.get(f"{BASE_URL}/health/ai", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_status(f"AI services health: {data.get('status', 'unknown')}", "SUCCESS")
            return True
        else:
            print_status(f"AI services health check failed: {response.status_code}", "WARNING")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status(f"AI services health check error: {e}", "WARNING")
        return False

def test_authentication() -> Dict[str, Any]:
    """Test user registration and authentication"""
    try:
        print_status("Testing user registration...")
        
        # Register user
        register_response = requests.post(
            f"{API_BASE}/auth/register",
            json=TEST_USER,
            timeout=10
        )
        
        if register_response.status_code in [200, 201, 422]:  # 422 means user might already exist
            print_status("User registration endpoint accessible", "SUCCESS")
        else:
            print_status(f"User registration failed: {register_response.status_code}", "ERROR")
            return {}
        
        # Login
        print_status("Testing user login...")
        login_response = requests.post(
            f"{API_BASE}/auth/login",
            data={
                "username": TEST_USER["email"],
                "password": TEST_USER["password"]
            },
            timeout=10
        )
        
        if login_response.status_code == 200:
            data = login_response.json()
            token = data.get("access_token")
            print_status("User authentication successful", "SUCCESS")
            return {"token": token, "user_data": data}
        else:
            print_status(f"User authentication failed: {login_response.status_code}", "ERROR")
            return {}
            
    except requests.exceptions.RequestException as e:
        print_status(f"Authentication test error: {e}", "ERROR")
        return {}

def test_api_endpoints(auth_data: Dict[str, Any]) -> bool:
    """Test various API endpoints"""
    if not auth_data.get("token"):
        print_status("No authentication token, skipping API tests", "WARNING")
        return False
    
    headers = {"Authorization": f"Bearer {auth_data['token']}"}
    
    try:
        # Test projects endpoint
        print_status("Testing projects endpoint...")
        projects_response = requests.get(f"{API_BASE}/projects", headers=headers, timeout=10)
        if projects_response.status_code == 200:
            print_status("Projects endpoint accessible", "SUCCESS")
        else:
            print_status(f"Projects endpoint failed: {projects_response.status_code}", "WARNING")
        
        # Test datasets endpoint
        print_status("Testing datasets endpoint...")
        datasets_response = requests.get(f"{API_BASE}/datasets", headers=headers, timeout=10)
        if datasets_response.status_code == 200:
            print_status("Datasets endpoint accessible", "SUCCESS")
        else:
            print_status(f"Datasets endpoint failed: {datasets_response.status_code}", "WARNING")
        
        # Test AI analysis endpoint
        print_status("Testing AI analysis endpoint...")
        analysis_response = requests.get(f"{API_BASE}/ai/analysis", headers=headers, timeout=10)
        if analysis_response.status_code == 200:
            print_status("AI analysis endpoint accessible", "SUCCESS")
        else:
            print_status(f"AI analysis endpoint failed: {analysis_response.status_code}", "WARNING")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print_status(f"API endpoints test error: {e}", "ERROR")
        return False

def test_neo4j_connectivity() -> bool:
    """Test Neo4j connectivity"""
    try:
        print_status("Testing Neo4j connectivity...")
        response = requests.get(f"{API_BASE}/geological-graph/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_status(f"Neo4j connectivity: {data.get('status', 'unknown')}", "SUCCESS")
            return True
        else:
            print_status(f"Neo4j connectivity failed: {response.status_code}", "WARNING")
            return False
            
    except requests.exceptions.RequestException as e:
        print_status(f"Neo4j connectivity error: {e}", "WARNING")
        return False

def main():
    """Main test function"""
    print_status("Starting GeoMiner AI Backend Tests", "INFO")
    print_status("=" * 50, "INFO")
    
    # Test basic connectivity
    health_ok = test_health_endpoint()
    docs_ok = test_docs_endpoint()
    
    if not health_ok:
        print_status("Backend is not responding. Please check if the service is running.", "ERROR")
        sys.exit(1)
    
    # Test service health
    db_ok = test_database_health()
    ai_ok = test_ai_health()
    neo4j_ok = test_neo4j_connectivity()
    
    # Test authentication
    auth_data = test_authentication()
    
    # Test API endpoints if authenticated
    api_ok = test_api_endpoints(auth_data)
    
    # Summary
    print_status("=" * 50, "INFO")
    print_status("Test Summary:", "INFO")
    print_status(f"Health Endpoint: {'✓' if health_ok else '✗'}", "SUCCESS" if health_ok else "ERROR")
    print_status(f"API Documentation: {'✓' if docs_ok else '✗'}", "SUCCESS" if docs_ok else "WARNING")
    print_status(f"Database: {'✓' if db_ok else '✗'}", "SUCCESS" if db_ok else "ERROR")
    print_status(f"AI Services: {'✓' if ai_ok else '✗'}", "SUCCESS" if ai_ok else "WARNING")
    print_status(f"Neo4j: {'✓' if neo4j_ok else '✗'}", "SUCCESS" if neo4j_ok else "WARNING")
    print_status(f"Authentication: {'✓' if auth_data else '✗'}", "SUCCESS" if auth_data else "ERROR")
    print_status(f"API Endpoints: {'✓' if api_ok else '✗'}", "SUCCESS" if api_ok else "WARNING")
    
    # Overall status
    critical_services = [health_ok, db_ok]
    if all(critical_services):
        print_status("Backend is operational!", "SUCCESS")
        print_status(f"API Documentation: {DOCS_ENDPOINT}", "INFO")
        print_status(f"Health Check: {HEALTH_ENDPOINT}", "INFO")
    else:
        print_status("Backend has issues. Check the logs above.", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main() 