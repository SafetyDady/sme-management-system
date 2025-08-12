from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.schemas import UserCreate, UserUpdate, PasswordChange
from app.auth import get_current_user
from app.safe_db import (
    safe_get_user_by_id, 
    safe_get_user_by_username,
    safe_check_user_exists,
    safe_update_user,
    safe_delete_user,
    check_table_schema
)
from dependencies.auth import require_admin_or_superadmin, require_superadmin
from passlib.context import CryptContext
from datetime import datetime
from sqlalchemy import text
import uuid

router = APIRouter(tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simple response model
def user_response(row) -> Dict[str, Any]:
    """Convert database row to response dict"""
    return {
        "id": row.id,
        "username": row.username,
        "email": row.email,
        "role": row.role,
        "is_active": row.is_active,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "last_login": row.last_login.isoformat() if row.last_login else None
    }

@router.get("")
async def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """List all users (Admin/SuperAdmin only)"""
    try:
        # Use raw SQL to avoid model conflicts
        result = db.execute(
            text("SELECT id, username, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC")
        ).fetchall()
        
        users = [user_response(row) for row in result]
        return {"users": users, "total": len(users)}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.post("")
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Create new user (Admin/SuperAdmin only)"""
    try:
        # Check if user already exists using safe function
        if safe_check_user_exists(db, username=user_data.username, email=user_data.email):
            # More specific check to determine which field conflicts
            if safe_check_user_exists(db, username=user_data.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already registered"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )

        # Hash password and create user
        hashed_password = pwd_context.hash(user_data.password)
        user_id = str(uuid.uuid4())
        
        try:
            # Insert new user with essential fields only
            db.execute(
                text("""
                INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
                VALUES (:id, :username, :email, :hashed_password, :role, :is_active, :created_at)
                """),
                {
                    "id": user_id,
                    "username": user_data.username,
                    "email": user_data.email,
                    "hashed_password": hashed_password,
                    "role": user_data.role,
                    "is_active": True,
                    "created_at": datetime.utcnow()
                }
            )
            db.commit()
            
            # Return created user data directly for frontend compatibility
            new_user = db.execute(
                text("SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = :id"),
                {"id": user_id}
            ).fetchone()
            
            return user_response(new_user)
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user: {str(e)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Get specific user by ID"""
    try:
        user = safe_get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "last_login": user.last_login
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}"
        )

@router.put("/{user_id}")
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Update user (Admin/SuperAdmin only)"""
    try:
        # Check if user exists using safe function
        existing_user = safe_get_user_by_id(db, user_id)
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build updates dictionary
        updates = {}
        
        if hasattr(user_data, 'username') and user_data.username:
            updates["username"] = user_data.username
        
        if hasattr(user_data, 'email') and user_data.email:
            updates["email"] = user_data.email
        
        if hasattr(user_data, 'role') and user_data.role:
            updates["role"] = user_data.role
        
        if hasattr(user_data, 'is_active') and user_data.is_active is not None:
            updates["is_active"] = user_data.is_active
        
        if hasattr(user_data, 'password') and user_data.password:
            updates["hashed_password"] = pwd_context.hash(user_data.password)
        
        # Use safe update function
        if updates:
            success = safe_update_user(db, user_id, updates)
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update user"
                )
        
        # Return updated user using safe function
        updated_user = safe_get_user_by_id(db, user_id)
        
        return {
            "id": updated_user.id,
            "username": updated_user.username,
            "email": updated_user.email,
            "role": updated_user.role,
            "is_active": updated_user.is_active,
            "created_at": updated_user.created_at,
            "last_login": updated_user.last_login
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)  # Only SuperAdmin can delete
):
    """Delete user (SuperAdmin only)"""
    try:
        # Check if user exists using safe function
        existing_user = safe_get_user_by_id(db, user_id)
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Don't allow deleting self
        if existing_user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Delete user using safe SQL
        result = db.execute(
            text("DELETE FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or already deleted"
            )
        
        db.commit()
        
        return {
            "message": "User deleted successfully", 
            "deleted_user_id": user_id,
            "deleted_username": existing_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.get("/debug/schema")
async def debug_schema(
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)
):
    """Debug endpoint to check database schema (SuperAdmin only)"""
    try:
        schema_info = check_table_schema(db)
        return {
            "message": "Database schema information",
            "schema": schema_info,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check schema: {str(e)}"
        )
