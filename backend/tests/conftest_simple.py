import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all the models to ensure they're registered with Base
from app.database import Base, get_db
from app.models import User
from app.models_hr import HREmployee
from main import app

# Simple approach: use file-based SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

# Override the database dependency BEFORE any tests run
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True, scope="session")
def setup_test_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup - remove test database file
    import os
    try:
        os.remove("test.db")
    except FileNotFoundError:
        pass

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def superadmin_token(client):
    from app.models import User
    from app.auth import get_password_hash
    import uuid
    
    # Create user in test database
    session = TestingSessionLocal()
    try:
        # Clear existing user if any
        session.query(User).filter(User.username == "admin").delete()
        session.commit()
        
        user = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@test.local",
            hashed_password=get_password_hash("admin123"),
            role="superadmin",
            is_active=True
        )
        session.add(user)
        session.commit()
    finally:
        session.close()
    
    # Login to get token
    response = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]
