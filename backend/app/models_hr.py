from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

"""Lean HR models (phase 1)
Scope: Only core employee identity & basic org placement.
Deferred (future phases): compensation fields, notes, leave/daily actual tracking.
"""

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
    employment_type = Column(String(30), nullable=True)  # e.g. fulltime, parttime, contract, daily
    salary_base = Column(Numeric(10, 2), nullable=True)  # Monthly or agreed base depending on employment_type
    active_status = Column(Boolean, default=True, index=True)
    contact_phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    # (leave + daily actual tracking removed in lean phase)


