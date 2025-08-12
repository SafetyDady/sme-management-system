"""
Safe database operations for backward compatibility
"""
from sqlalchemy import text, Column, String, Boolean, DateTime
from sqlalchemy.orm import Session
from typing import Optional
from .database import Base
import uuid
from datetime import datetime

class SafeUser(Base):
    """
    Safe User model with only essential columns that exist in all environments
    """
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

def safe_get_user_by_username(db: Session, username: str) -> Optional[SafeUser]:
    """
    Safely get user by username, querying only essential columns
    """
    try:
        return db.query(SafeUser).filter(SafeUser.username == username).first()
    except Exception as e:
        # If SafeUser fails, try raw SQL with essential columns only
        try:
            result = db.execute(
                text("""
                SELECT id, username, email, hashed_password, role, is_active, 
                       created_at, last_login 
                FROM users 
                WHERE username = :username 
                LIMIT 1
                """),
                {"username": username}
            ).fetchone()
            
            if result:
                user = SafeUser()
                user.id = result.id
                user.username = result.username
                user.email = result.email
                user.hashed_password = result.hashed_password
                user.role = result.role
                user.is_active = result.is_active
                user.created_at = result.created_at
                user.last_login = result.last_login
                return user
        except Exception as inner_e:
            print(f"Safe query failed: {inner_e}")
            return None
    
    return None

def check_table_schema(db: Session) -> dict:
    """
    Check what columns exist in the users table
    """
    try:
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        """)).fetchall()
        
        return {
            "columns": [row.column_name for row in result],
            "has_employee_fields": any(
                col in [row.column_name for row in result] 
                for col in ["employee_code", "department", "position"]
            )
        }
    except Exception as e:
        return {"error": str(e), "columns": [], "has_employee_fields": False}
