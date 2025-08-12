"""
Safe database operations for backward compatibility
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import uuid
from datetime import datetime

class SafeUser:
    """
    Safe User object with only essential fields
    """
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.username = kwargs.get('username')
        self.email = kwargs.get('email')
        self.hashed_password = kwargs.get('hashed_password')
        self.role = kwargs.get('role', 'user')
        self.is_active = kwargs.get('is_active', True)
        self.created_at = kwargs.get('created_at')
        self.last_login = kwargs.get('last_login')

def safe_get_user_by_username(db: Session, username: str) -> Optional[SafeUser]:
    """
    Safely get user by username using raw SQL to avoid model conflicts
    """
    try:
        # Use raw SQL to query only essential columns
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
            return SafeUser(
                id=result.id,
                username=result.username,
                email=result.email,
                hashed_password=result.hashed_password,
                role=result.role,
                is_active=result.is_active,
                created_at=result.created_at,
                last_login=result.last_login
            )
        return None
        
    except Exception as e:
        print(f"Safe user query failed: {e}")
        return None

def check_table_schema(db: Session) -> Dict[str, Any]:
    """
    Check what columns exist in the users table
    """
    try:
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        """)).fetchall()
        
        columns = [row.column_name for row in result]
        return {
            "columns": columns,
            "has_employee_fields": any(
                col in columns for col in ["employee_code", "department", "position"]
            ),
            "essential_columns": [col for col in columns if col in [
                "id", "username", "email", "hashed_password", "role", "is_active", "created_at", "last_login"
            ]]
        }
    except Exception as e:
        return {"error": str(e), "columns": [], "has_employee_fields": False}
