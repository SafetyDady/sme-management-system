from fastapi import HTTPException, Depends, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.permissions import has_permission, can_access_role

def require_permission(permission: str):
    """Dependency to require specific permission"""
    def permission_checker(current_user = Depends(get_current_user)):
        if not has_permission(current_user.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        return current_user
    return permission_checker

def require_roles(allowed_roles: List[str]):
    """Dependency to require specific roles (legacy support)"""
    def role_checker(current_user = Depends(get_current_user)):
        if not any(can_access_role(current_user.role, role) for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker

# Permission-based dependencies (preferred)
require_employee_manage = require_permission("employee.edit")
require_user_manage = require_permission("user.edit") 
require_hr_access = require_permission("hr.leave.view")

# Role shortcuts (legacy support)
require_admin_or_superadmin = require_roles(["admin", "superadmin"])
require_hr_or_admin = require_roles(["hr", "admin", "superadmin"])
require_superadmin = require_roles(["superadmin"])

