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

def safe_get_user_by_id(db: Session, user_id: str) -> Optional[SafeUser]:
    """
    Safely get user by ID using raw SQL
    """
    try:
        result = db.execute(
            text("""
            SELECT id, username, email, hashed_password, role, is_active, 
                   created_at, last_login 
            FROM users 
            WHERE id = :user_id 
            LIMIT 1
            """),
            {"user_id": user_id}
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
        print(f"Safe user by ID query failed: {e}")
        return None

def safe_check_user_exists(db: Session, username: str = None, email: str = None, exclude_id: str = None) -> bool:
    """
    Safely check if user exists with given username/email
    """
    try:
        conditions = []
        params = {}
        
        if username:
            conditions.append("username = :username")
            params["username"] = username
            
        if email:
            conditions.append("email = :email")
            params["email"] = email
            
        if exclude_id:
            conditions.append("id != :exclude_id")
            params["exclude_id"] = exclude_id
            
        if not conditions:
            return False
            
        query = f"SELECT 1 FROM users WHERE {' OR '.join(conditions)} LIMIT 1"
        result = db.execute(text(query), params).fetchone()
        
        return result is not None
        
    except Exception as e:
        print(f"Safe user exists check failed: {e}")
        return False

def safe_update_user(db: Session, user_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Safely update user using raw SQL
    """
    try:
        if not update_data:
            return True
            
        # Build SET clause
        set_clauses = []
        params = {"user_id": user_id}
        
        for field, value in update_data.items():
            if field in ["username", "email", "role", "is_active", "hashed_password"]:
                set_clauses.append(f"{field} = :{field}")
                params[field] = value
                
        if not set_clauses:
            return True
            
        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :user_id"
        result = db.execute(text(query), params)
        db.commit()
        
        return result.rowcount > 0
        
    except Exception as e:
        print(f"Safe user update failed: {e}")
        db.rollback()
        return False

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
