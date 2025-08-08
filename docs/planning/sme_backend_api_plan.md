# SME Management System - Backend API Development Plan

## 🎯 หลักการออกแบบ API

### 1. รักษา Authentication APIs เดิม
- **ไม่แก้ไข** APIs ที่มีอยู่
- **ใช้ประโยชน์** จาก JWT middleware
- **เพิ่ม role-based permissions** สำหรับ SME modules

### 2. RESTful API Design
- ใช้ HTTP methods อย่างถูกต้อง (GET, POST, PUT, DELETE)
- ใช้ status codes ที่เหมาะสม
- ใช้ consistent URL patterns

### 3. Modular Structure
- แยก routers ตาม business modules
- ใช้ dependency injection สำหรับ authentication
- ใช้ Pydantic schemas สำหรับ validation

## 📁 Project Structure

```
backend/app/
├── routers/
│   ├── __init__.py
│   ├── auth.py (existing - ไม่แก้ไข)
│   ├── users.py (existing - ไม่แก้ไข)
│   ├── hr.py (new)
│   ├── projects.py (new)
│   ├── inventory.py (new)
│   └── financial.py (new)
├── models/
│   ├── __init__.py
│   ├── auth.py (existing - ไม่แก้ไข)
│   ├── hr.py (new)
│   ├── projects.py (new)
│   ├── inventory.py (new)
│   └── financial.py (new)
├── schemas/
│   ├── __init__.py
│   ├── auth.py (existing - ไม่แก้ไข)
│   ├── hr.py (new)
│   ├── projects.py (new)
│   ├── inventory.py (new)
│   └── financial.py (new)
└── dependencies/
    ├── __init__.py
    ├── auth.py (existing - ไม่แก้ไข)
    └── permissions.py (new)
```

## 🔐 Authentication & Permissions

### Role-Based Access Control
```python
# dependencies/permissions.py
from enum import Enum
from fastapi import Depends, HTTPException, status
from .auth import get_current_user

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    OWNER = "owner"
    MANAGER = "manager"
    HR = "hr"
    ACCOUNTANT = "accountant"
    EMPLOYEE = "employee"

class Permission:
    HR_READ = "hr:read"
    HR_WRITE = "hr:write"
    HR_APPROVE = "hr:approve"
    PROJECT_READ = "project:read"
    PROJECT_WRITE = "project:write"
    PROJECT_MANAGE = "project:manage"
    INVENTORY_READ = "inventory:read"
    INVENTORY_WRITE = "inventory:write"
    FINANCIAL_READ = "financial:read"
    FINANCIAL_WRITE = "financial:write"
    FINANCIAL_APPROVE = "financial:approve"

# Role-Permission Matrix
ROLE_PERMISSIONS = {
    UserRole.SUPERADMIN: ["*"],  # All permissions
    UserRole.OWNER: [
        Permission.HR_READ, Permission.HR_WRITE, Permission.HR_APPROVE,
        Permission.PROJECT_READ, Permission.PROJECT_WRITE, Permission.PROJECT_MANAGE,
        Permission.INVENTORY_READ, Permission.INVENTORY_WRITE,
        Permission.FINANCIAL_READ, Permission.FINANCIAL_WRITE, Permission.FINANCIAL_APPROVE
    ],
    UserRole.MANAGER: [
        Permission.HR_READ, Permission.HR_APPROVE,
        Permission.PROJECT_READ, Permission.PROJECT_WRITE, Permission.PROJECT_MANAGE,
        Permission.INVENTORY_READ, Permission.INVENTORY_WRITE,
        Permission.FINANCIAL_READ
    ],
    UserRole.HR: [
        Permission.HR_READ, Permission.HR_WRITE,
        Permission.PROJECT_READ,
        Permission.INVENTORY_READ
    ],
    UserRole.ACCOUNTANT: [
        Permission.HR_READ,
        Permission.PROJECT_READ,
        Permission.INVENTORY_READ,
        Permission.FINANCIAL_READ, Permission.FINANCIAL_WRITE
    ],
    UserRole.EMPLOYEE: [
        Permission.HR_READ,  # Own data only
        Permission.PROJECT_READ  # Assigned projects only
    ]
}

def require_permission(permission: str):
    def permission_checker(current_user = Depends(get_current_user)):
        user_permissions = ROLE_PERMISSIONS.get(current_user.role, [])
        if "*" not in user_permissions and permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return permission_checker
```

## 👥 HR Module APIs

### HR Models (models/hr.py)
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class HREmployee(Base):
    __tablename__ = "hr_employees"
    
    employee_id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(20), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    position = Column(String(100))
    department = Column(String(100))
    employment_type = Column(String(20))
    salary_monthly = Column(Numeric(10, 2))
    wage_daily = Column(Numeric(8, 2))
    active_status = Column(Boolean, default=True)
    # ... other fields
    
    # Relationships
    user = relationship("User", back_populates="employee")
    leave_requests = relationship("HRLeaveRequest", back_populates="employee")

class HRLeaveRequest(Base):
    __tablename__ = "hr_leave_requests"
    
    leave_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("hr_employees.employee_id"))
    leave_type = Column(String(20))
    leave_date_start = Column(Date, nullable=False)
    leave_date_end = Column(Date, nullable=False)
    leave_days = Column(Numeric(3, 1), nullable=False)
    approval_status = Column(String(10), default="pending")
    # ... other fields
    
    # Relationships
    employee = relationship("HREmployee", back_populates="leave_requests")
```

### HR Schemas (schemas/hr.py)
```python
from pydantic import BaseModel, validator
from datetime import date
from typing import Optional
from enum import Enum

class EmploymentType(str, Enum):
    MONTHLY = "monthly"
    DAILY = "daily"
    SUBCONTRACT = "subcontract"
    FREELANCE = "freelance"

class LeaveType(str, Enum):
    SICK = "sick"
    PERSONAL = "personal"
    VACATION = "vacation"
    MATERNITY = "maternity"
    EMERGENCY = "emergency"

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Employee Schemas
class EmployeeBase(BaseModel):
    emp_code: str
    first_name: str
    last_name: str
    position: Optional[str] = None
    department: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary_monthly: Optional[float] = None
    wage_daily: Optional[float] = None

class EmployeeCreate(EmployeeBase):
    user_id: Optional[int] = None

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary_monthly: Optional[float] = None
    wage_daily: Optional[float] = None
    active_status: Optional[bool] = None

class Employee(EmployeeBase):
    employee_id: int
    active_status: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Leave Request Schemas
class LeaveRequestBase(BaseModel):
    leave_type: LeaveType
    leave_date_start: date
    leave_date_end: date
    reason: Optional[str] = None
    
    @validator('leave_date_end')
    def end_date_after_start_date(cls, v, values):
        if 'leave_date_start' in values and v < values['leave_date_start']:
            raise ValueError('End date must be after start date')
        return v

class LeaveRequestCreate(LeaveRequestBase):
    employee_id: int

class LeaveRequestUpdate(BaseModel):
    approval_status: ApprovalStatus
    rejection_reason: Optional[str] = None

class LeaveRequest(LeaveRequestBase):
    leave_id: int
    employee_id: int
    leave_days: float
    approval_status: ApprovalStatus
    submitted_at: datetime
    
    class Config:
        from_attributes = True
```

### HR Router (routers/hr.py)
```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.hr import HREmployee, HRLeaveRequest
from ..schemas.hr import Employee, EmployeeCreate, EmployeeUpdate, LeaveRequest, LeaveRequestCreate, LeaveRequestUpdate
from ..dependencies.permissions import require_permission, Permission

router = APIRouter(prefix="/api/hr", tags=["HR Management"])

# Employee Management APIs
@router.get("/employees", response_model=List[Employee])
async def get_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_READ))
):
    """Get list of employees with filtering options"""
    query = db.query(HREmployee)
    
    if department:
        query = query.filter(HREmployee.department == department)
    if active_only:
        query = query.filter(HREmployee.active_status == True)
    
    employees = query.offset(skip).limit(limit).all()
    return employees

@router.get("/employees/{employee_id}", response_model=Employee)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_READ))
):
    """Get employee by ID"""
    employee = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/employees", response_model=Employee, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_WRITE))
):
    """Create new employee"""
    # Check if emp_code already exists
    existing = db.query(HREmployee).filter(HREmployee.emp_code == employee.emp_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee code already exists")
    
    db_employee = HREmployee(**employee.dict(), created_by=current_user.id)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_WRITE))
):
    """Update employee information"""
    db_employee = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = employee_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    db_employee.updated_by = current_user.id
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/employees/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_WRITE))
):
    """Soft delete employee (set active_status to False)"""
    db_employee = db.query(HREmployee).filter(HREmployee.employee_id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_employee.active_status = False
    db_employee.updated_by = current_user.id
    db.commit()
    return {"message": "Employee deactivated successfully"}

# Leave Management APIs
@router.get("/leaves", response_model=List[LeaveRequest])
async def get_leave_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    employee_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_READ))
):
    """Get leave requests with filtering"""
    query = db.query(HRLeaveRequest)
    
    if employee_id:
        query = query.filter(HRLeaveRequest.employee_id == employee_id)
    if status:
        query = query.filter(HRLeaveRequest.approval_status == status)
    
    leaves = query.offset(skip).limit(limit).all()
    return leaves

@router.post("/leaves", response_model=LeaveRequest, status_code=status.HTTP_201_CREATED)
async def create_leave_request(
    leave_request: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_WRITE))
):
    """Create new leave request"""
    # Calculate leave days
    leave_days = (leave_request.leave_date_end - leave_request.leave_date_start).days + 1
    
    db_leave = HRLeaveRequest(
        **leave_request.dict(),
        leave_days=leave_days,
        submitted_by=current_user.id
    )
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.put("/leaves/{leave_id}/approve", response_model=LeaveRequest)
async def approve_leave_request(
    leave_id: int,
    approval: LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_APPROVE))
):
    """Approve or reject leave request"""
    db_leave = db.query(HRLeaveRequest).filter(HRLeaveRequest.leave_id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    db_leave.approval_status = approval.approval_status
    if approval.rejection_reason:
        db_leave.rejection_reason = approval.rejection_reason
    db_leave.approved_by = current_user.id
    db_leave.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_leave)
    return db_leave

# Department Statistics
@router.get("/departments/stats")
async def get_department_stats(
    db: Session = Depends(get_db),
    current_user = Depends(require_permission(Permission.HR_READ))
):
    """Get employee statistics by department"""
    stats = db.query(
        HREmployee.department,
        func.count(HREmployee.employee_id).label('total_employees'),
        func.count(case([(HREmployee.active_status == True, 1)])).label('active_employees')
    ).group_by(HREmployee.department).all()
    
    return [
        {
            "department": stat.department,
            "total_employees": stat.total_employees,
            "active_employees": stat.active_employees
        }
        for stat in stats
    ]
```

## 🏢 Project Module APIs

### Project Router Structure
```python
# routers/projects.py
router = APIRouter(prefix="/api/projects", tags=["Project Management"])

# Customer Management
@router.get("/customers", response_model=List[Customer])
@router.post("/customers", response_model=Customer)
@router.get("/customers/{customer_id}", response_model=Customer)
@router.put("/customers/{customer_id}", response_model=Customer)
@router.delete("/customers/{customer_id}")

# Project Management
@router.get("/", response_model=List[Project])
@router.post("/", response_model=Project)
@router.get("/{project_id}", response_model=Project)
@router.put("/{project_id}", response_model=Project)
@router.delete("/{project_id}")

# Project Tasks
@router.get("/{project_id}/tasks", response_model=List[ProjectTask])
@router.post("/{project_id}/tasks", response_model=ProjectTask)
@router.put("/tasks/{task_id}", response_model=ProjectTask)
@router.delete("/tasks/{task_id}")

# Project Resources
@router.get("/{project_id}/resources")
@router.post("/{project_id}/resources")
@router.put("/{project_id}/resources/{resource_id}")

# Project Reports
@router.get("/{project_id}/reports/progress")
@router.get("/{project_id}/reports/costs")
@router.get("/{project_id}/reports/timeline")
```

## 📦 Inventory Module APIs

### Inventory Router Structure
```python
# routers/inventory.py
router = APIRouter(prefix="/api/inventory", tags=["Inventory Management"])

# Categories
@router.get("/categories", response_model=List[InventoryCategory])
@router.post("/categories", response_model=InventoryCategory)
@router.put("/categories/{category_id}", response_model=InventoryCategory)

# Items
@router.get("/items", response_model=List[InventoryItem])
@router.post("/items", response_model=InventoryItem)
@router.get("/items/{item_id}", response_model=InventoryItem)
@router.put("/items/{item_id}", response_model=InventoryItem)

# Transactions
@router.get("/transactions", response_model=List[InventoryTransaction])
@router.post("/transactions", response_model=InventoryTransaction)
@router.get("/items/{item_id}/transactions", response_model=List[InventoryTransaction])

# Stock Management
@router.get("/stock/low-stock")
@router.post("/stock/adjustment")
@router.get("/stock/reports")
```

## 💰 Financial Module APIs

### Financial Router Structure
```python
# routers/financial.py
router = APIRouter(prefix="/api/financial", tags=["Financial Management"])

# Accounts
@router.get("/accounts", response_model=List[FinancialAccount])
@router.post("/accounts", response_model=FinancialAccount)
@router.put("/accounts/{account_id}", response_model=FinancialAccount)

# Transactions
@router.get("/transactions", response_model=List[FinancialTransaction])
@router.post("/transactions", response_model=FinancialTransaction)
@router.put("/transactions/{transaction_id}/approve")

# Budgets
@router.get("/budgets", response_model=List[FinancialBudget])
@router.post("/budgets", response_model=FinancialBudget)
@router.put("/budgets/{budget_id}", response_model=FinancialBudget)

# Reports
@router.get("/reports/balance-sheet")
@router.get("/reports/income-statement")
@router.get("/reports/cash-flow")
@router.get("/reports/budget-variance")
```

## 🔧 Main Application Update

### main.py Enhancement
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, hr, projects, inventory, financial

app = FastAPI(title="SME Management System", version="1.0.0")

# CORS middleware (existing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)  # existing
app.include_router(users.router)  # existing
app.include_router(hr.router)  # new
app.include_router(projects.router)  # new
app.include_router(inventory.router)  # new
app.include_router(financial.router)  # new

@app.get("/")
async def root():
    return {"message": "SME Management System API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## 📋 API Development Phases

### Phase 1: HR Module (Week 3-4)
1. สร้าง models/hr.py
2. สร้าง schemas/hr.py
3. สร้าง routers/hr.py
4. ทดสอบ APIs ด้วย Postman/FastAPI docs
5. เขียน unit tests

### Phase 2: Project Module (Week 5-6)
1. สร้าง models/projects.py
2. สร้าง schemas/projects.py
3. สร้าง routers/projects.py
4. ทดสอบ APIs
5. เขียน unit tests

### Phase 3: Financial Module (Week 7-8)
1. สร้าง models/financial.py
2. สร้าง schemas/financial.py
3. สร้าง routers/financial.py
4. ทดสอบ APIs
5. เขียน unit tests

### Phase 4: Inventory Module (Week 9-10)
1. สร้าง models/inventory.py
2. สร้าง schemas/inventory.py
3. สร้าง routers/inventory.py
4. ทดสอบ APIs
5. เขียน unit tests

## 🧪 Testing Strategy

### API Testing Checklist:
- [ ] Authentication ยังทำงานปกติ
- [ ] Role-based permissions ทำงานถูกต้อง
- [ ] CRUD operations ทำงานครบถ้วน
- [ ] Data validation ทำงานถูกต้อง
- [ ] Error handling เหมาะสม
- [ ] Performance ยอมรับได้

### Testing Tools:
- **FastAPI Docs** - `/docs` endpoint สำหรับ interactive testing
- **Postman** - สำหรับ comprehensive API testing
- **pytest** - สำหรับ automated testing
- **SQLAlchemy Test DB** - สำหรับ database testing

## ⚠️ ข้อควรระวัง

1. **ไม่แก้ไข** authentication APIs ที่มีอยู่
2. **ทดสอบ permissions** อย่างละเอียด
3. **ใช้ transactions** สำหรับ complex operations
4. **Validate input data** อย่างเข้มงวด
5. **Handle errors** อย่างเหมาะสม
6. **Log important operations** สำหรับ audit trail

