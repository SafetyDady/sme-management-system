from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models_hr import HREmployee
from app.models import User
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeRecord
from dependencies.auth import require_admin_or_superadmin
from app.auth import get_current_user

router = APIRouter(prefix="/employees", tags=["employees"])

@router.post("/", response_model=EmployeeRecord, status_code=status.HTTP_201_CREATED)
async def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db), current_user=Depends(require_admin_or_superadmin)):
    # Check duplicate emp_code
    exists = db.query(HREmployee).filter(HREmployee.emp_code == payload.emp_code.upper()).first()
    if exists:
        raise HTTPException(status_code=409, detail="emp_code already exists")

    # Optional user linkage validation
    if payload.user_id:
        user = db.query(User).filter(User.id == payload.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="Linked user not found")

    employee = HREmployee(
        emp_code=payload.emp_code.upper(),
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        position=payload.position,
        department=payload.department,
        start_date=payload.start_date.date() if payload.start_date else None,
        employment_type=payload.employment_type,
        salary_base=payload.salary_base,
        contact_phone=payload.contact_phone,
        user_id=payload.user_id,
        created_by=current_user.id,
        updated_by=current_user.id,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

@router.get("/", response_model=List[EmployeeRecord])
async def list_employees(
    department: Optional[str] = Query(None),
    active: Optional[bool] = Query(None),
    q: Optional[str] = Query(None, description="Search first/last name or emp_code"),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin_or_superadmin)
):
    query = db.query(HREmployee)
    if department:
        query = query.filter(HREmployee.department == department)
    if active is not None:
        query = query.filter(HREmployee.active_status == active)
    if q:
        like_term = f"%{q}%"
        query = query.filter(
            (HREmployee.first_name.ilike(like_term)) |
            (HREmployee.last_name.ilike(like_term)) |
            (HREmployee.emp_code.ilike(like_term))
        )
    return query.order_by(HREmployee.emp_code.asc()).all()

@router.get("/{employee_id}", response_model=EmployeeRecord)
async def get_employee(employee_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin_or_superadmin)):
    emp = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.patch("/{employee_id}", response_model=EmployeeRecord)
async def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db), current_user=Depends(require_admin_or_superadmin)):
    emp = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    data = payload.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(emp, field, value)
    emp.updated_by = current_user.id
    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{employee_id}")
async def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user=Depends(require_admin_or_superadmin)):
    emp = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"message": "Employee deleted"}
