from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.schemas import UserCreate, UserUpdate, PasswordChange
from app.auth import get_current_user
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

@router.get("/")
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
        
        # Convert to response format
        users = [user_response(row) for row in result]
        # Return array directly (not wrapped in object) for frontend compatibility
        return users
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.post("/", status_code=status.HTTP_201_CREATED)
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

# ===== OTHER ENDPOINTS ===== 
