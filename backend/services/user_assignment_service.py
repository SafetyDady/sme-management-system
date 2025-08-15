"""
User-Employee Assignment Service
Handles the core logic for assigning users to employees in a one-to-one relationship
"""
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
import secrets
import string
import structlog

from app.models import User, HREmployee, Notification
from app.schemas import UserAssignmentRequest, UserAssignmentResponse, UnassignedEmployee, AssignmentSummary

logger = structlog.get_logger()

class UserAssignmentService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_service = NotificationService(db)

    async def get_unassigned_employees(self) -> List[UnassignedEmployee]:
        """Get list of employees without user accounts"""
        try:
            employees = self.db.query(HREmployee).filter(
                HREmployee.user_id.is_(None),
                HREmployee.active_status == True
            ).order_by(HREmployee.created_at.desc()).all()
            
            unassigned_list = []
            for emp in employees:
                days_since_creation = (datetime.utcnow() - emp.created_at).days
                unassigned_employee = UnassignedEmployee(
                    employee_id=emp.employee_id,
                    emp_code=emp.emp_code,
                    first_name=emp.first_name,
                    last_name=emp.last_name,
                    position=emp.position,
                    department=emp.department,
                    created_at=emp.created_at,
                    days_since_creation=days_since_creation
                )
                unassigned_list.append(unassigned_employee)
            
            return unassigned_list
            
        except Exception as e:
            logger.error(f"Failed to get unassigned employees: {str(e)}")
            return []

    async def get_available_users(self) -> List[User]:
        """Get list of users not assigned to any employee"""
        try:
            # Get user IDs that are already assigned to employees
            assigned_user_ids = self.db.query(HREmployee.user_id).filter(
                HREmployee.user_id.isnot(None)
            ).subquery()
            
            # Get users not in the assigned list
            available_users = self.db.query(User).filter(
                ~User.id.in_(assigned_user_ids),
                User.is_active == True
            ).order_by(User.username).all()
            
            return available_users
            
        except Exception as e:
            logger.error(f"Failed to get available users: {str(e)}")
            return []

    async def assign_user_to_employee(self, assignment_request: UserAssignmentRequest, 
                                    admin_user_id: str) -> UserAssignmentResponse:
        """
        Assign user to employee with comprehensive validation and notifications
        """
        try:
            # Validate employee exists and is not assigned
            employee = self.db.query(HREmployee).filter(
                HREmployee.employee_id == assignment_request.employee_id,
                HREmployee.active_status == True
            ).first()
            
            if not employee:
                return UserAssignmentResponse(
                    success=False,
                    message="Employee not found or inactive",
                    employee_id=assignment_request.employee_id,
                    user_id="",
                    username="",
                    role=""
                )
            
            if employee.user_id:
                return UserAssignmentResponse(
                    success=False,
                    message="Employee already has a user account assigned",
                    employee_id=assignment_request.employee_id,
                    user_id=employee.user_id,
                    username="",
                    role=""
                )
            
            user = None
            temporary_password = None
            
            # Create new user or use existing
            if assignment_request.create_new_user:
                # Validate username and email are not taken
                existing_user = self.db.query(User).filter(
                    (User.username == assignment_request.username) |
                    (User.email == assignment_request.email)
                ).first()
                
                if existing_user:
                    return UserAssignmentResponse(
                        success=False,
                        message="Username or email already exists",
                        employee_id=assignment_request.employee_id,
                        user_id="",
                        username=assignment_request.username or "",
                        role=assignment_request.role
                    )
                
                # Generate temporary password
                temporary_password = self._generate_temporary_password()
                
                # Create new user
                user = User(
                    username=assignment_request.username,
                    email=assignment_request.email,
                    hashed_password=get_password_hash(temporary_password),
                    role=assignment_request.role,
                    is_active=True,
                    created_at=datetime.utcnow()
                )
                
                self.db.add(user)
                self.db.flush()  # Get the ID without committing
                
                logger.info(f"New user created for employee assignment", 
                           username=assignment_request.username, 
                           employee_id=assignment_request.employee_id)
                
            else:
                # Use existing user
                if not assignment_request.existing_user_id:
                    return UserAssignmentResponse(
                        success=False,
                        message="existing_user_id is required when create_new_user is False",
                        employee_id=assignment_request.employee_id,
                        user_id="",
                        username="",
                        role=""
                    )
                
                user = self.db.query(User).filter(
                    User.id == assignment_request.existing_user_id,
                    User.is_active == True
                ).first()
                
                if not user:
                    return UserAssignmentResponse(
                        success=False,
                        message="Existing user not found or inactive",
                        employee_id=assignment_request.employee_id,
                        user_id=assignment_request.existing_user_id,
                        username="",
                        role=""
                    )
                
                # Check if user is already assigned to another employee
                existing_assignment = self.db.query(HREmployee).filter(
                    HREmployee.user_id == user.id,
                    HREmployee.active_status == True
                ).first()
                
                if existing_assignment:
                    return UserAssignmentResponse(
                        success=False,
                        message=f"User is already assigned to employee {existing_assignment.first_name} {existing_assignment.last_name}",
                        employee_id=assignment_request.employee_id,
                        user_id=user.id,
                        username=user.username,
                        role=user.role
                    )
                
                # Update user role if specified
                user.role = assignment_request.role
                
                logger.info(f"Existing user assigned to employee", 
                           username=user.username, 
                           employee_id=assignment_request.employee_id)
            
            # Assign user to employee
            employee.user_id = user.id
            employee.updated_at = datetime.utcnow()
            employee.updated_by = admin_user_id
            
            # Commit the assignment
            self.db.commit()
            
            # Send notifications if requested
            notifications_sent = {}
            if assignment_request.send_welcome_email:
                notifications_sent = await self.notification_service.notify_user_assigned(
                    employee_id=employee.employee_id,
                    user_id=user.id,
                    admin_user_id=admin_user_id,
                    temporary_password=temporary_password
                )
            
            logger.info(f"User-employee assignment completed successfully", 
                       employee_id=employee.employee_id, 
                       user_id=user.id,
                       username=user.username,
                       role=user.role)
            
            return UserAssignmentResponse(
                success=True,
                message=f"User '{user.username}' successfully assigned to employee {employee.first_name} {employee.last_name}",
                employee_id=employee.employee_id,
                user_id=user.id,
                username=user.username,
                role=user.role,
                notifications_sent=notifications_sent
            )
            
        except Exception as e:
            logger.error(f"Failed to assign user to employee: {str(e)}")
            self.db.rollback()
            return UserAssignmentResponse(
                success=False,
                message=f"Assignment failed: {str(e)}",
                employee_id=assignment_request.employee_id,
                user_id="",
                username="",
                role=""
            )

    async def unassign_user_from_employee(self, employee_id: int, admin_user_id: str) -> Dict[str, any]:
        """
        Remove user assignment from employee
        """
        try:
            employee = self.db.query(HREmployee).filter(
                HREmployee.employee_id == employee_id,
                HREmployee.active_status == True
            ).first()
            
            if not employee:
                return {"success": False, "message": "Employee not found or inactive"}
            
            if not employee.user_id:
                return {"success": False, "message": "Employee does not have a user account assigned"}
            
            user_id = employee.user_id
            user = self.db.query(User).filter(User.id == user_id).first()
            username = user.username if user else "Unknown"
            
            # Remove assignment
            employee.user_id = None
            employee.updated_at = datetime.utcnow()
            employee.updated_by = admin_user_id
            
            self.db.commit()
            
            logger.info(f"User unassigned from employee", 
                       employee_id=employee_id, 
                       user_id=user_id,
                       username=username)
            
            return {
                "success": True, 
                "message": f"User '{username}' unassigned from employee {employee.first_name} {employee.last_name}",
                "employee_id": employee_id,
                "user_id": user_id,
                "username": username
            }
            
        except Exception as e:
            logger.error(f"Failed to unassign user from employee: {str(e)}")
            self.db.rollback()
            return {"success": False, "message": f"Unassignment failed: {str(e)}"}

    async def get_assignment_summary(self) -> AssignmentSummary:
        """
        Get summary statistics for user-employee assignments
        """
        try:
            total_employees = self.db.query(HREmployee).filter(
                HREmployee.active_status == True
            ).count()
            
            assigned_employees = self.db.query(HREmployee).filter(
                HREmployee.user_id.isnot(None),
                HREmployee.active_status == True
            ).count()
            
            unassigned_employees = total_employees - assigned_employees
            
            # Get pending notifications count
            one_day_ago = datetime.utcnow() - timedelta(days=1)
            pending_notifications = self.db.query(Notification).filter(
                Notification.type == "employee_added",
                Notification.read == False,
                Notification.created_at >= one_day_ago
            ).count()
            
            # Get recent assignments count (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_assignments = self.db.query(HREmployee).filter(
                HREmployee.user_id.isnot(None),
                HREmployee.updated_at >= seven_days_ago
            ).count()
            
            return AssignmentSummary(
                total_employees=total_employees,
                assigned_employees=assigned_employees,
                unassigned_employees=unassigned_employees,
                pending_notifications=pending_notifications,
                recent_assignments=recent_assignments
            )
            
        except Exception as e:
            logger.error(f"Failed to get assignment summary: {str(e)}")
            return AssignmentSummary(
                total_employees=0,
                assigned_employees=0,
                unassigned_employees=0,
                pending_notifications=0,
                recent_assignments=0
            )

    async def validate_assignment_permissions(self, current_user_role: str, target_role: str) -> bool:
        """
        Validate if current user can assign target role
        """
        role_hierarchy = {
            'superadmin': 4,
            'system_admin': 3,
            'hr': 2,
            'employee': 1
        }
        
        current_level = role_hierarchy.get(current_user_role, 0)
        target_level = role_hierarchy.get(target_role, 0)
        
        # SuperAdmin can assign any role
        if current_user_role == 'superadmin':
            return True
            
        # System Admin can assign hr and employee roles
        if current_user_role == 'system_admin' and target_role in ['hr', 'employee']:
            return True
            
        # HR can only assign employee role
        if current_user_role == 'hr' and target_role == 'employee':
            return True
            
        return False

    def _generate_temporary_password(self, length: int = 12) -> str:
        """Generate a secure temporary password"""
        # Ensure password has mix of characters
        chars = string.ascii_lowercase
        chars += string.ascii_uppercase
        chars += string.digits
        chars += "!@#$%^&*"
        
        password = ''.join(secrets.choice(chars) for _ in range(length))
        
        # Ensure at least one of each type
        if not any(c.islower() for c in password):
            password = password[:-1] + secrets.choice(string.ascii_lowercase)
        if not any(c.isupper() for c in password):
            password = password[:-1] + secrets.choice(string.ascii_uppercase)
        if not any(c.isdigit() for c in password):
            password = password[:-1] + secrets.choice(string.digits)
        if not any(c in "!@#$%^&*" for c in password):
            password = password[:-1] + secrets.choice("!@#$%^&*")
            
        return password

    async def get_employee_by_user(self, user_id: str) -> Optional[HREmployee]:
        """Get employee record by user ID"""
        return self.db.query(HREmployee).filter(
            HREmployee.user_id == user_id,
            HREmployee.active_status == True
        ).first()

    async def get_user_by_employee(self, employee_id: int) -> Optional[User]:
        """Get user record by employee ID"""
        employee = self.db.query(HREmployee).filter(
            HREmployee.employee_id == employee_id
        ).first()
        
        if employee and employee.user_id:
            return self.db.query(User).filter(User.id == employee.user_id).first()
        
        return None
