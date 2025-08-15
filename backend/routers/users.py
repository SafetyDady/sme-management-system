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
        "last_login": row.last_login.isoformat() if row.last_login else None,
        "employee_id": getattr(row, 'employee_id', None)
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
            text("SELECT id, username, email, role, is_active, created_at, last_login, employee_id FROM users ORDER BY created_at DESC")
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
                text("SELECT id, username, email, role, is_active, created_at, last_login, employee_id FROM users WHERE id = :id"),
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
        
        # Handle employee_id assignment
        if hasattr(user_data, 'employee_id'):
            if user_data.employee_id is not None:
                # Check if employee exists and is not already assigned
                check_employee_query = text("""
                    SELECT employee_id, user_id FROM hr_employees 
                    WHERE employee_id = :employee_id
                """)
                employee_result = db.execute(check_employee_query, {"employee_id": user_data.employee_id})
                employee = employee_result.fetchone()
                
                if not employee:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Employee with ID {user_data.employee_id} not found"
                    )
                
                if employee.user_id and employee.user_id != user_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Employee is already assigned to another user"
                    )
                
                # Unassign previous employee if user had one
                if existing_user.employee_id and existing_user.employee_id != user_data.employee_id:
                    unassign_prev_query = text("UPDATE hr_employees SET user_id = NULL WHERE employee_id = :employee_id")
                    db.execute(unassign_prev_query, {"employee_id": existing_user.employee_id})
                
                # Update employee assignment (only if not already assigned to this user)
                if employee.user_id != user_id:
                    update_employee_query = text("UPDATE hr_employees SET user_id = :user_id WHERE employee_id = :employee_id")
                    db.execute(update_employee_query, {"user_id": user_id, "employee_id": user_data.employee_id})
                
                updates["employee_id"] = user_data.employee_id
            else:
                # Unassign employee if employee_id is None
                if existing_user.employee_id:
                    unassign_employee_query = text("UPDATE hr_employees SET user_id = NULL WHERE employee_id = :employee_id")
                    db.execute(unassign_employee_query, {"employee_id": existing_user.employee_id})
                
                updates["employee_id"] = None
        
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

@router.post("/{user_id}/password")
async def change_user_password(
    user_id: str,
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Change user password (Admin/SuperAdmin only)"""
    try:
        # Check if user exists
        existing_user = safe_get_user_by_id(db, user_id)
        
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = pwd_context.hash(password_data.new_password)
        
        # Update password using safe function
        success = safe_update_user(db, user_id, {"hashed_password": hashed_password})
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        return {
            "message": "Password changed successfully",
            "user_id": user_id,
            "username": existing_user.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to change password: {str(e)}"
        )

# ===== Employee Assignment Endpoints (SystemAdmin only) =====

@router.post("/assign-employee")
async def assign_employee(
    assignment: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)
):
    """Assign user to employee (SystemAdmin only)"""
    try:
        user_id = assignment.get("user_id")
        employee_id = assignment.get("employee_id")
        
        if not user_id or not employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both user_id and employee_id are required"
            )

        # Check if user exists
        user_query = text("SELECT id, username, employee_id FROM users WHERE id = :user_id")
        user_result = db.execute(user_query, {"user_id": user_id}).fetchone()
        
        if not user_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        if user_result.employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User is already assigned to employee {user_result.employee_id}"
            )

        # Check if employee exists and is not already assigned
        employee_query = text("""
            SELECT employee_id, emp_code, first_name, last_name, user_id 
            FROM hr_employees 
            WHERE employee_id = :employee_id
        """)
        employee_result = db.execute(employee_query, {"employee_id": employee_id}).fetchone()
        
        if not employee_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
            
        if employee_result.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee is already assigned to user {employee_result.user_id}"
            )

        # Create bidirectional assignment
        update_user_query = text("UPDATE users SET employee_id = :employee_id WHERE id = :user_id")
        update_employee_query = text("UPDATE hr_employees SET user_id = :user_id WHERE employee_id = :employee_id")
        
        db.execute(update_user_query, {"employee_id": employee_id, "user_id": user_id})
        db.execute(update_employee_query, {"user_id": user_id, "employee_id": employee_id})
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully assigned user {user_result.username} to employee {employee_result.emp_code}",
            "assignment": {
                "user_id": user_id,
                "employee_id": employee_id,
                "username": user_result.username,
                "employee_code": employee_result.emp_code
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign employee: {str(e)}"
        )

@router.post("/unassign-employee")
async def unassign_employee(
    request: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)
):
    """Unassign user from employee (SystemAdmin only)"""
    try:
        user_id = request.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="user_id is required"
            )

        # Get current assignment
        user_query = text("SELECT id, username, employee_id FROM users WHERE id = :user_id")
        user_result = db.execute(user_query, {"user_id": user_id}).fetchone()
        
        if not user_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        if not user_result.employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not assigned to any employee"
            )

        # Remove bidirectional assignment
        update_user_query = text("UPDATE users SET employee_id = NULL WHERE id = :user_id")
        update_employee_query = text("UPDATE hr_employees SET user_id = NULL WHERE employee_id = :employee_id")
        
        db.execute(update_user_query, {"user_id": user_id})
        db.execute(update_employee_query, {"employee_id": user_result.employee_id})
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully unassigned user {user_result.username} from employee {user_result.employee_id}",
            "user_id": user_id,
            "username": user_result.username
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unassign employee: {str(e)}"
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

@router.get("/employees/unassigned")
async def get_unassigned_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_admin_or_superadmin)
):
    """Get all employees that are not assigned to any user"""
    try:
        # Query for employees without user assignment using correct column names
        query = text("""
            SELECT employee_id, emp_code, first_name, last_name, department, position
            FROM hr_employees 
            WHERE user_id IS NULL AND active_status = true
            ORDER BY emp_code
        """)
        
        result = db.execute(query)
        employees = result.fetchall()
        
        return [
            {
                "id": emp.employee_id,
                "employee_code": emp.emp_code,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "department": emp.department,
                "position": emp.position
            }
            for emp in employees
        ]
        
    except Exception as e:
        print(f"Error fetching unassigned employees: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch unassigned employees: {str(e)}"
        )
