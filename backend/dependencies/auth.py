from fastapi import HTTPException, Depends, status
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import get_current_user

def require_roles(allowed_roles: List[str]):
    """Dependency to require specific roles"""
    def role_checker(current_user = Depends(get_current_user)):
        # Normalize role (admin1, admin2 -> admin)
        user_role = current_user.role
        if user_role in ['admin1', 'admin2']:
            user_role = 'admin'
            
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {allowed_roles}"
            )
        return current_user
    return role_checker

# Role shortcuts
require_admin_or_superadmin = require_roles(["admin", "superadmin"])
require_superadmin = require_roles(["superadmin"])

