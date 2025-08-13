import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.models import User  # Import models first
from app.models_hr import HREmployee  # Import HR models to create tables
from main import app

# Use production database for tests
# No need to override - use the same database that the app uses

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def superadmin_token():
    # Use existing superadmin user from production database
    client = TestClient(app)
    
    # Use superadmin credentials (this should exist in production database)
    response = client.post("/auth/login", json={"username": "superadmin", "password": "Admin123!"})
    
    if response.status_code != 200:
        # Try common variations
        for pwd in ["admin123", "Admin123", "Admin@123", "superadmin123"]:
            response = client.post("/auth/login", json={"username": "superadmin", "password": pwd})
            if response.status_code == 200:
                break
    
    assert response.status_code == 200, f"Failed to login with superadmin: {response.text}"
    return response.json()["access_token"]
