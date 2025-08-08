from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User
from models.user import UserCreate, UserUpdate, UserResponse, PasswordChange, UserStatusUpdate
from app.auth import get_current_user
from dependencies.auth import require_admin_or_superadmin, require_superadmin
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Get all users (Admin/SuperAdmin only)"""
    try:
        users = db.query(User).all()
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
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
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
    
    # Create new user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        role=user_data.role,
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

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
    # Check if username/email is already taken by another user
    if user_data.username or user_data.email:
        query = db.query(User).filter(User.id != current_user.id)
        if user_data.username:
            query = query.filter(User.username == user_data.username)
        if user_data.email:
            query = query.filter(User.email == user_data.email)
        
        existing_user = query.first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Update user data
    update_data = user_data.dict(exclude_unset=True)
    
    # Users cannot change their own role
    if 'role' in update_data and current_user.role not in ['admin', 'superadmin']:
        del update_data['role']
    
    for field, value in update_data.items():
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
    
    user = db.query(User).filter(User.id == user_id).first()
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
    user = db.query(User).filter(User.id == user_id).first()
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
    
    # Check for duplicates
    if user_data.username or user_data.email:
        query = db.query(User).filter(User.id != user_id)
        if user_data.username:
            query = query.filter(User.username == user_data.username)
        if user_data.email:
            query = query.filter(User.email == user_data.email)
        
        existing_user = query.first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Update user
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

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
    
    user = db.query(User).filter(User.id == user_id).first()
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
    
    db.delete(user)
    db.commit()
    
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
    
    user = db.query(User).filter(User.id == user_id).first()
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
    
    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)
    
    return user

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

