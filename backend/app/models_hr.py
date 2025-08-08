from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class HREmployee(Base):
    __tablename__ = "hr_employees"
    
    employee_id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Optional link to user account
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    position = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True, index=True)
    start_date = Column(Date, nullable=True)
    employment_type = Column(String(20), nullable=True)  # monthly, daily, subcontract, freelance
    salary_monthly = Column(Numeric(10, 2), nullable=True)
    wage_daily = Column(Numeric(8, 2), nullable=True)
    active_status = Column(Boolean, default=True, index=True)
    contact_phone = Column(String(20), nullable=True)
    contact_address = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    leave_requests = relationship("HRLeaveRequest", back_populates="employee")
    daily_actuals = relationship("HRDailyActual", back_populates="worker")

class HRLeaveRequest(Base):
    __tablename__ = "hr_leave_requests"
    
    leave_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("hr_employees.employee_id"), nullable=False)
    leave_type = Column(String(20), nullable=False)  # sick, personal, vacation, maternity, emergency
    leave_date_start = Column(Date, nullable=False, index=True)
    leave_date_end = Column(Date, nullable=False, index=True)
    leave_days = Column(Numeric(3, 1), nullable=False)
    reason = Column(Text, nullable=True)
    submitted_by = Column(String, ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approval_status = Column(String(10), default="pending", index=True)  # pending, approved, rejected
    rejection_reason = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    
    # Relationships
    employee = relationship("HREmployee", back_populates="leave_requests")
    submitter = relationship("User", foreign_keys=[submitted_by])
    approver = relationship("User", foreign_keys=[approved_by])

class HRDailyActual(Base):
    __tablename__ = "hr_daily_actual"
    
    actual_id = Column(Integer, primary_key=True, index=True)
    work_date = Column(Date, nullable=False, index=True)
    project_id = Column(Integer, nullable=True, index=True)  # Will link to projects table later
    task_id = Column(Integer, nullable=True)
    worker_id = Column(Integer, ForeignKey("hr_employees.employee_id"), nullable=False)
    normal_hour = Column(Numeric(4, 2), default=0)
    ot_hour_1 = Column(Numeric(4, 2), default=0)  # OT 1.5x
    ot_hour_2 = Column(Numeric(4, 2), default=0)  # OT 2x
    ot_hour_3 = Column(Numeric(4, 2), default=0)  # OT 3x
    ci_factor = Column(Numeric(3, 2), default=1.0)  # Cost Index factor
    work_type = Column(String(50), nullable=True)
    submitted_by = Column(String, ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approval_status = Column(String(10), default="pending", index=True)  # pending, approved, rejected
    note = Column(Text, nullable=True)
    
    # Relationships
    worker = relationship("HREmployee", back_populates="daily_actuals")
    submitter = relationship("User", foreign_keys=[submitted_by])
    approver = relationship("User", foreign_keys=[approved_by])

