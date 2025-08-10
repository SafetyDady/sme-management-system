import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from main import app

# Use in-memory SQLite for unit tests (isolated)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

# Override dependency
@app.dependency_overrides.get(get_db)
def override_get_db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture()
def client(db_session):
    return TestClient(app)

@pytest.fixture()
def superadmin_token(client):
    # Create superadmin user directly
    from app.models import User
    from app.auth import get_password_hash
    import uuid
    session = TestingSessionLocal()
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
    # Login to get token
    response = client.post("/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]
