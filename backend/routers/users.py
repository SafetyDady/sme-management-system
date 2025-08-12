from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from app.safe_db import (
    safe_get_user_by_username, 
    safe_get_user_by_id,
    safe_check_user_exists,
    safe_update_user
)
from app.schemas import UserCreate, UserUpdate, PasswordChange
from models.user import UserResponse, UserStatusUpdate
from app.auth import get_current_user
from dependencies.auth import require_admin_or_superadmin, require_superadmin
from passlib.context import CryptContext
from datetime import datetime
from sqlalchemy import text

router = APIRouter(tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Get all users (Admin/SuperAdmin only)"""
    try:
        # Use safe raw SQL query with essential columns only
        result = db.execute(text("""
            SELECT id, username, email, role, is_active, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        """)).fetchall()
        
        # Convert to dict format for response
        users = []
        for row in result:
            users.append({
                "id": row.id,
                "username": row.username,
                "email": row.email,
                "role": row.role,
                "is_active": row.is_active,
                "created_at": row.created_at,
                "last_login": row.last_login,
                "employee_code": None,  # Set to None for backward compatibility
                "department": None,
                "position": None,
                "hire_date": None,
                "phone": None,
                "address": None
            })
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Create new user (Admin and SuperAdmin only)"""
    
    # Admin can only create 'user' role, SuperAdmin can create any role
    if current_user.role in ['admin1', 'admin2', 'admin'] and user_data.role not in ['user']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin can only create users with 'user' role"
        )
    # Check if username or email already exists using safe query
    from sqlalchemy import text
    existing_user = db.execute(
        text("SELECT username, email FROM users WHERE username = :username OR email = :email LIMIT 1"),
        {"username": user_data.username, "email": user_data.email}
    ).fetchone()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
    
    # Hash password
    hashed_password = pwd_context.hash(user_data.password)
    
    # Create new user using safe SQL insert
    import uuid
    user_id = str(uuid.uuid4())
    
    try:
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
        
        # Get the created user safely
        created_user = safe_get_user_by_id(db, user_id)
        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created user"
            )
        
        # Convert SafeUser to dict for response
        return {
            "id": created_user.id,
            "username": created_user.username,
            "email": created_user.email,
            "role": created_user.role,
            "is_active": created_user.is_active,
            "created_at": created_user.created_at,
            "last_login": created_user.last_login,
            "employee_code": None,
            "department": None,
            "position": None,
            "hire_date": None,
            "phone": None,
            "address": None
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user profile"""
    # Check if username/email is already taken by another user using safe query
    if user_data.username or user_data.email:
        conditions = []
        params = {"current_user_id": current_user.id}
        
        if user_data.username:
            conditions.append("username = :username")
            params["username"] = user_data.username
        if user_data.email:
            conditions.append("email = :email") 
            params["email"] = user_data.email
            
        if conditions:
            query = f"SELECT id FROM users WHERE id != :current_user_id AND ({' OR '.join(conditions)}) LIMIT 1"
            existing_user = db.execute(text(query), params).fetchone()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username or email already exists"
                )
    
    # Update user data using safe method
    success = safe_update_user(db, current_user.id, user_data.dict(exclude_unset=True))
    if not success:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Update user data
    update_data = user_data.dict(exclude_unset=True)
    
    # Users cannot change their own role
    if 'role' in update_data and current_user.role not in ['admin', 'superadmin']:
        del update_data['role']
    
    # Hash password if provided
    if 'password' in update_data:
        update_data['hashed_password'] = pwd_context.hash(update_data['password'])
        del update_data['password']  # Remove plain password
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user by ID (Admin can see all, User can see own)"""
    # Users can only see their own profile, admins can see all
    if current_user.role not in ['admin', 'superadmin'] and str(current_user.id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    # Use safe query to get user by ID
    user = safe_get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Update user (Admin/SuperAdmin only)"""
    # Use safe query to get user
    user = safe_get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Admin cannot modify superadmin users
    if user.role == 'superadmin' and current_user.role in ['admin1', 'admin2', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot modify superadmin users"
        )
    
    # Only superadmin can change roles to superadmin
    if user_data.role == 'superadmin' and current_user.role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can create superadmin users"
        )
    
    # Admin can only assign 'user' role
    if current_user.role in ['admin1', 'admin2', 'admin'] and user_data.role and user_data.role not in ['user']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin can only assign 'user' role"
        )
    
    # Check for duplicates using safe method
    if user_data.username or user_data.email:
        if safe_check_user_exists(db, user_data.username, user_data.email, exclude_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Prepare update data
    update_data = user_data.dict(exclude_unset=True)
    
    # Hash password if provided
    if 'password' in update_data:
        update_data['hashed_password'] = pwd_context.hash(update_data['password'])
        del update_data['password']  # Remove plain password
    
    # Update user using safe method
    success = safe_update_user(db, user_id, update_data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
    
    # Get updated user data
    updated_user = safe_get_user_by_id(db, user_id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated user"
        )
    
    # Convert to response format
    return {
        "id": updated_user.id,
        "username": updated_user.username,
        "email": updated_user.email,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at,
        "last_login": updated_user.last_login,
        "employee_code": None,
        "department": None,
        "position": None,
        "hire_date": None,
        "phone": None,
        "address": None
    }

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Delete user (Admin/SuperAdmin only)"""
    if str(user_id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = safe_get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Admin cannot delete superadmin users
    if user.role == 'superadmin' and current_user.role in ['admin1', 'admin2', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot delete superadmin users"
        )
    
    try:
        # Use raw SQL to delete user
        result = db.execute(text("DELETE FROM users WHERE id = :user_id"), {"user_id": user_id})
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or already deleted"
            )
            
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )
    
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}/status", response_model=UserResponse)
async def toggle_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Toggle user active status (Admin/SuperAdmin only)"""
    if str(user_id) == str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )
    
    user = safe_get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Admin cannot change superadmin status
    if user.role == 'superadmin' and current_user.role in ['admin1', 'admin2', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot change superadmin status"
        )
    
    # Update status using safe method
    success = safe_update_user(db, user_id, {"is_active": status_data.is_active})
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )
    
    # Get updated user data
    updated_user = safe_get_user_by_id(db, user_id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated user"
        )
    
    # Convert to response format
    return {
        "id": updated_user.id,
        "username": updated_user.username,
        "email": updated_user.email,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at,
        "last_login": updated_user.last_login,
        "employee_code": None,
        "department": None,
        "position": None,
        "hire_date": None,
        "phone": None,
        "address": None
    }

@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Change current user password"""
    # Verify current password
    if not pwd_context.verify(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed_password = pwd_context.hash(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    
    db.commit()
    
    return {"message": "Password changed successfully"}

