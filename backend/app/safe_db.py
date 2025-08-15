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
        self.employee_id = kwargs.get('employee_id')

def safe_get_user_by_username(db: Session, username: str) -> Optional[SafeUser]:
    """
    Safely get user by username using raw SQL to avoid model conflicts
    """
    try:
        # Use raw SQL to query only essential columns
        result = db.execute(
            text("""
            SELECT id, username, email, hashed_password, role, is_active, 
                   created_at, last_login, employee_id
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
                last_login=result.last_login,
                employee_id=result.employee_id
            )
        return None
        
    except Exception as e:
        print(f"Safe user query failed: {e}")
        return None

def safe_get_user_by_id(db: Session, user_id: str) -> Optional[SafeUser]:
    """
    Safely get user by ID with minimal data exposure
    """
    try:
        result = db.execute(
            text("SELECT id, username, email, role, is_active, created_at, last_login, employee_id FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        row = result.fetchone()
        
        if row:
            return SafeUser(
                id=row.id,
                username=row.username,
                email=row.email,
                role=row.role,
                is_active=row.is_active,
                created_at=row.created_at,
                last_login=row.last_login,
                employee_id=row.employee_id
            )
        return None
    except Exception as e:
        print(f"Safe user fetch by ID failed: {e}")
        return None

def safe_check_user_exists(db: Session, username: str = None, email: str = None) -> bool:
    """
    Check if user exists by username or email
    """
    try:
        if username and email:
            result = db.execute(
                text("SELECT id FROM users WHERE username = :username OR email = :email"),
                {"username": username, "email": email}
            ).fetchone()
        elif username:
            result = db.execute(
                text("SELECT id FROM users WHERE username = :username"),
                {"username": username}
            ).fetchone()
        elif email:
            result = db.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email}
            ).fetchone()
        else:
            return False
            
        return result is not None
        
    except Exception as e:
        print(f"Safe user exists check failed: {e}")
        return True  # Assume exists to prevent duplicates on error

def safe_update_user(db: Session, user_id: str, updates: Dict[str, Any]) -> bool:
    """
    Safely update user with only essential fields
    """
    try:
        # Build dynamic update query
        set_clauses = []
        params = {"user_id": user_id}
        
        for key, value in updates.items():
            if key in ['username', 'email', 'role', 'is_active', 'hashed_password', 'last_login', 'employee_id']:
                set_clauses.append(f"{key} = :{key}")
                params[key] = value
        
        if not set_clauses:
            return False
            
        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = :user_id"
        result = db.execute(text(query), params)
        db.commit()
        
        return result.rowcount > 0
        
    except Exception as e:
        db.rollback()
        print(f"Safe user update failed: {e}")
        return False

def safe_delete_user(db: Session, user_id: str) -> bool:
    """
    Safely delete user by ID
    """
    try:
        result = db.execute(
            text("DELETE FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        db.commit()
        return result.rowcount > 0
        
    except Exception as e:
        db.rollback()
        print(f"Safe user delete failed: {e}")
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
