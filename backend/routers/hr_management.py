"""
HR Management Router - HR role specific endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User
from app.models_hr import HREmployee  
from app.schemas import User as UserSchema, EmployeeRecord as HREmployeeSchema, EmployeeUpdate as HREmployeeUpdate
from dependencies.auth import require_hr_admin_or_superadmin, require_hr_only
from app.auth import get_current_user
import logging

router = APIRouter(prefix="/hr", tags=["HR Management"])
logger = logging.getLogger(__name__)

# HR Dashboard Summary
@router.get("/dashboard/summary")
async def get_hr_dashboard_summary(
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Get HR dashboard summary statistics"""
    try:
        # Employee statistics
        total_employees = db.query(HREmployee).filter(HREmployee.active_status == True).count()
        inactive_employees = db.query(HREmployee).filter(HREmployee.active_status == False).count()
        
        # Department breakdown
        dept_stats = db.query(
            HREmployee.department, 
            func.count(HREmployee.employee_id).label('count')
        ).filter(
            HREmployee.active_status == True
        ).group_by(HREmployee.department).all()
        
        # Employment type breakdown
        emp_type_stats = db.query(
            HREmployee.employment_type,
            func.count(HREmployee.employee_id).label('count')
        ).filter(
            HREmployee.active_status == True
        ).group_by(HREmployee.employment_type).all()
        
        # Recent hires (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_hires = db.query(HREmployee).filter(
            HREmployee.hire_date >= thirty_days_ago,
            HREmployee.active_status == True
        ).count()
        
        return {
            "summary": {
                "total_active_employees": total_employees,
                "total_inactive_employees": inactive_employees,
                "recent_hires_30_days": recent_hires,
                "total_employees": total_employees + inactive_employees
            },
            "department_breakdown": [
                {"department": dept, "count": count} for dept, count in dept_stats
            ],
            "employment_type_breakdown": [
                {"employment_type": emp_type, "count": count} for emp_type, count in emp_type_stats
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting HR dashboard summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get HR dashboard summary"
        )

# Employee Quick Actions
@router.get("/employees/quick-stats")
async def get_employee_quick_stats(
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Get quick employee statistics for HR dashboard"""
    try:
        # Count by department
        departments = db.query(
            HREmployee.department,
            func.count(HREmployee.employee_id).label('total'),
            func.sum(case((HREmployee.active_status == True, 1), else_=0)).label('active')
        ).group_by(HREmployee.department).all()
        
        # Latest employees
        latest_employees = db.query(HREmployee).order_by(
            HREmployee.created_at.desc()
        ).limit(5).all()
        
        return {
            "departments": [
                {
                    "department": dept.department or "Unassigned",
                    "total": dept.total,
                    "active": dept.active
                }
                for dept in departments
            ],
            "latest_employees": [
                {
                    "employee_id": emp.employee_id,
                    "emp_code": emp.emp_code,
                    "full_name": f"{emp.first_name} {emp.last_name}",
                    "department": emp.department,
                    "position": emp.position,
                    "hire_date": emp.hire_date.isoformat() if emp.hire_date else None,
                    "active_status": emp.active_status
                }
                for emp in latest_employees
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting employee quick stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get employee quick stats"
        )

# HR-specific employee management (with additional HR features)
@router.get("/employees/by-department/{department}")
async def get_employees_by_department(
    department: str,
    active_only: bool = Query(True, description="Filter active employees only"),
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Get employees filtered by department"""
    try:
        query = db.query(HREmployee).filter(HREmployee.department == department)
        
        if active_only:
            query = query.filter(HREmployee.active_status == True)
            
        employees = query.order_by(HREmployee.last_name, HREmployee.first_name).all()
        
        return {
            "department": department,
            "active_only": active_only,
            "count": len(employees),
            "employees": employees
        }
        
    except Exception as e:
        logger.error(f"Error getting employees by department: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get employees by department"
        )

# Bulk employee operations (HR-specific)
@router.post("/employees/bulk-update-status")
async def bulk_update_employee_status(
    employee_ids: List[int],
    active_status: bool,
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Bulk update employee active status"""
    try:
        # Verify all employees exist
        employees = db.query(HREmployee).filter(
            HREmployee.employee_id.in_(employee_ids)
        ).all()
        
        if len(employees) != len(employee_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more employee IDs not found"
            )
        
        # Update status
        updated_count = db.query(HREmployee).filter(
            HREmployee.employee_id.in_(employee_ids)
        ).update(
            {HREmployee.active_status: active_status},
            synchronize_session=False
        )
        
        db.commit()
        
        logger.info(f"HR user {current_user.username} bulk updated {updated_count} employees status to {active_status}")
        
        return {
            "message": f"Successfully updated {updated_count} employees",
            "updated_count": updated_count,
            "new_status": active_status,
            "employee_ids": employee_ids
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk status update: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update employee status"
        )

# HR Reports
@router.get("/reports/employee-summary")
async def get_employee_summary_report(
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Generate comprehensive employee summary report"""
    try:
        # Overall statistics
        total_employees = db.query(HREmployee).count()
        active_employees = db.query(HREmployee).filter(HREmployee.active_status == True).count()
        
        # Department statistics
        dept_stats = db.query(
            HREmployee.department,
            func.count(HREmployee.employee_id).label('total'),
            func.sum(case((HREmployee.active_status == True, 1), else_=0)).label('active'),
            func.avg(HREmployee.salary_base).label('avg_salary')
        ).group_by(HREmployee.department).all()
        
        # Employment type statistics
        emp_type_stats = db.query(
            HREmployee.employment_type,
            func.count(HREmployee.employee_id).label('count')
        ).filter(HREmployee.active_status == True).group_by(HREmployee.employment_type).all()
        
        return {
            "report_generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.username,
            "summary": {
                "total_employees": total_employees,
                "active_employees": active_employees,
                "inactive_employees": total_employees - active_employees
            },
            "department_analysis": [
                {
                    "department": stat.department or "Unassigned",
                    "total_employees": stat.total,
                    "active_employees": stat.active,
                    "average_salary": float(stat.avg_salary) if stat.avg_salary else 0
                }
                for stat in dept_stats
            ],
            "employment_type_distribution": [
                {
                    "employment_type": stat.employment_type,
                    "count": stat.count
                }
                for stat in emp_type_stats
            ]
        }
        
    except Exception as e:
        logger.error(f"Error generating employee summary report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate employee summary report"
        )

# Employee Profile Management (HR enhanced view)
@router.get("/employees/{employee_id}/profile")
async def get_employee_profile(
    employee_id: int,
    current_user: User = Depends(require_hr_admin_or_superadmin),
    db: Session = Depends(get_db)
):
    """Get comprehensive employee profile for HR"""
    try:
        employee = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
        
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        # Calculate employment duration
        from datetime import datetime
        employment_duration = None
        if employee.hire_date:
            duration = datetime.utcnow().date() - employee.hire_date
            employment_duration = duration.days
        
        return {
            "employee": employee,
            "employment_duration_days": employment_duration,
            "profile_accessed_by": current_user.username,
            "access_time": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting employee profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get employee profile"
        )
