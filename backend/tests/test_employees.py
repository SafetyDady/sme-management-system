import pytest
from fastapi.testclient import TestClient

def test_create_employee_success(client: TestClient, superadmin_token: str):
    response = client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={
            "emp_code": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "department": "Engineering",
            "position": "Developer",
            "employment_type": "fulltime",
            "salary_base": 50000.0
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["emp_code"] == "EMP001"
    assert data["first_name"] == "John"
    assert data["department"] == "Engineering"

def test_create_employee_duplicate_code(client: TestClient, superadmin_token: str):
    # First create
    client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP002", "first_name": "Jane", "last_name": "Smith"}
    )
    # Duplicate
    response = client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP002", "first_name": "Bob", "last_name": "Wilson"}
    )
    assert response.status_code == 409
    assert "emp_code already exists" in response.json()["detail"]

def test_list_employees(client: TestClient, superadmin_token: str):
    # Create sample data
    client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP003", "first_name": "Alice", "last_name": "Brown", "department": "HR"}
    )
    client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP004", "first_name": "Charlie", "last_name": "Green", "department": "IT"}
    )
    
    response = client.get(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    codes = [emp["emp_code"] for emp in data]
    assert "EMP003" in codes
    assert "EMP004" in codes

def test_get_employee_by_id(client: TestClient, superadmin_token: str):
    # Create employee first
    create_response = client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP005", "first_name": "David", "last_name": "Wilson"}
    )
    employee_id = create_response.json()["employee_id"]
    
    response = client.get(
        f"/api/employees/{employee_id}",
        headers={"Authorization": f"Bearer {superadmin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emp_code"] == "EMP005"
    assert data["first_name"] == "David"

def test_update_employee(client: TestClient, superadmin_token: str):
    # Create employee
    create_response = client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP006", "first_name": "Eva", "last_name": "Martinez"}
    )
    employee_id = create_response.json()["employee_id"]
    
    # Update
    response = client.patch(
        f"/api/employees/{employee_id}",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"department": "Finance", "position": "Analyst"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["department"] == "Finance"
    assert data["position"] == "Analyst"
    assert data["emp_code"] == "EMP006"  # Unchanged

def test_delete_employee(client: TestClient, superadmin_token: str):
    # Create employee
    create_response = client.post(
        "/api/employees/",
        headers={"Authorization": f"Bearer {superadmin_token}"},
        json={"emp_code": "EMP007", "first_name": "Frank", "last_name": "Taylor"}
    )
    employee_id = create_response.json()["employee_id"]
    
    # Delete
    response = client.delete(
        f"/api/employees/{employee_id}",
        headers={"Authorization": f"Bearer {superadmin_token}"}
    )
    assert response.status_code == 200
    assert "deleted" in response.json()["message"]
    
    # Verify deleted
    get_response = client.get(
        f"/api/employees/{employee_id}",
        headers={"Authorization": f"Bearer {superadmin_token}"}
    )
    assert get_response.status_code == 404

def test_unauthorized_access(client: TestClient):
    response = client.get("/api/employees/")
    assert response.status_code == 401
