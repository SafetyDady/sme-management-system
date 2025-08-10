from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

"""Lean HR models (phase 1)
Scope: Only core employee identity & basic org placement.
Deferred (future phases): compensation fields, notes, leave/daily actual tracking.
"""

class HREmployee(Base):
    __tablename__ = "hr_employees"
    
    employee_id = Column(String, primary_key=True, index=True)
    emp_code = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Basic employee info
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    department = Column(String(50), nullable=True, index=True)
    position = Column(String(100), nullable=True)
    
    # Employment and compensation - matching production exactly
    employment_type = Column(String(20), nullable=True)
    salary_monthly = Column(Numeric(10, 2), nullable=True)
    wage_daily = Column(Numeric(8, 2), nullable=True)
    active_status = Column(Boolean, nullable=True, index=True)
    contact_phone = Column(String(20), nullable=True)
    contact_address = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    
    # Audit fields matching production
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    # (leave + daily actual tracking removed in lean phase)


