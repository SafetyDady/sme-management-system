"""
Role and Permission Management Utilities
"""
import json
import os
from typing import Dict, List, Optional
from pathlib import Path

# Load roles configuration
ROLES_CONFIG_PATH = Path(__file__).parent.parent / "shared_config" / "roles.json"

def load_roles_config() -> Dict:
    """Load roles configuration from JSON file"""
    try:
        with open(ROLES_CONFIG_PATH, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Fallback configuration
        return {
            "roles": {
                "superadmin": {"name": "Super Admin", "level": 4, "permissions": ["*"]},
                "admin": {"name": "Admin", "level": 3, "permissions": ["user.*", "employee.*"]},
                "hr": {"name": "HR Manager", "level": 2, "permissions": ["employee.*", "hr.*"]},
                "user": {"name": "Employee", "level": 1, "permissions": ["profile.*"]}
            },
            "role_mapping": {
                "superadmin": "superadmin", "admin1": "admin", "admin2": "admin",
                "hr": "hr", "user": "user", "employee": "user"
            }
        }

ROLES_CONFIG = load_roles_config()

def normalize_role(raw_role: str) -> str:
    """Normalize role from backend to canonical role"""
    return ROLES_CONFIG["role_mapping"].get(raw_role, "user")

def get_role_permissions(role: str) -> List[str]:
    """Get permissions for a role"""
    normalized_role = normalize_role(role)
    return ROLES_CONFIG["roles"].get(normalized_role, {}).get("permissions", [])

def has_permission(user_role: str, required_permission: str) -> bool:
    """Check if user role has specific permission"""
    permissions = get_role_permissions(user_role)
    
    # Superadmin has all permissions
    if "*" in permissions:
        return True
    
    # Check exact match
    if required_permission in permissions:
        return True
    
    # Check wildcard match (e.g., "hr.*" matches "hr.leave.view")
    for permission in permissions:
        if permission.endswith(".*"):
            prefix = permission[:-2]
            if required_permission.startswith(prefix + "."):
                return True
    
    return False

def get_role_level(role: str) -> int:
    """Get role hierarchy level"""
    normalized_role = normalize_role(role)
    return ROLES_CONFIG["roles"].get(normalized_role, {}).get("level", 0)

def can_access_role(user_role: str, required_role: str) -> bool:
    """Check if user role can access resources requiring another role"""
    user_level = get_role_level(user_role)
    required_level = get_role_level(required_role)
    return user_level >= required_level
