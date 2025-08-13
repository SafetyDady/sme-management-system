from fastapi.testclient import TestClient


def test_roles_config_requires_auth(client: TestClient):
    res = client.get("/api/roles/config")
    assert res.status_code in (401, 403)


def test_roles_config_success(client: TestClient, superadmin_token: str):
    res = client.get("/api/roles/config", headers={"Authorization": f"Bearer {superadmin_token}"})
    assert res.status_code == 200, res.text
    data = res.json()
    # Accept either a dict with 'roles' list or a direct structure depending on implementation
    roles_obj = data.get("roles") if isinstance(data, dict) else None
    if isinstance(roles_obj, dict):
        # Could be mapping role_name -> permissions
        assert "superadmin" in roles_obj.keys() or "superadmin" in data
    elif isinstance(roles_obj, list):
        # List of role descriptors
        assert any((isinstance(r, dict) and (r.get("name") == "superadmin" or r.get("role") == "superadmin")) for r in roles_obj)
    else:
        # Fallback: just look for string
        assert "superadmin" in str(data).lower()


def test_my_profile_success_relaxed(client: TestClient, superadmin_token: str):
    res = client.get("/api/users/me/profile", headers={"Authorization": f"Bearer {superadmin_token}"})
    assert res.status_code == 200, res.text
    body = res.json()
    assert body.get("user") and body["user"]["username"] == "superadmin"  # Fixed: use superadmin
    assert "profile" in body


def test_my_profile_requires_auth(client: TestClient):
    res = client.get("/api/users/me/profile")
    assert res.status_code in (401, 403)

def test_my_profile_strict_success(client: TestClient, superadmin_token: str):
    res = client.get("/api/users/me/profile", headers={"Authorization": f"Bearer {superadmin_token}"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["user"]["username"] == "superadmin"  # Fixed: use superadmin
