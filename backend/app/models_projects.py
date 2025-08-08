from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Customer(Base):
    __tablename__ = "customers"
    
    customer_id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False, index=True)
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    tax_id = Column(String(20), nullable=True)
    customer_type = Column(String(20), nullable=True)  # individual, company, government
    credit_limit = Column(Numeric(12, 2), default=0)
    payment_terms = Column(Integer, default=30)  # days
    active_status = Column(Boolean, default=True, index=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    projects = relationship("Project", back_populates="customer")

class Project(Base):
    __tablename__ = "projects"
    
    project_id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String(30), unique=True, index=True, nullable=False)
    project_name = Column(String(200), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=True)
    project_type = Column(String(30), nullable=True)
    project_status = Column(String(20), default="planning", index=True)  # planning, active, on_hold, completed, cancelled
    start_date = Column(Date, nullable=True, index=True)
    end_date = Column(Date, nullable=True, index=True)
    estimated_budget = Column(Numeric(12, 2), nullable=True)
    actual_cost = Column(Numeric(12, 2), default=0)
    project_manager_id = Column(Integer, ForeignKey("hr_employees.employee_id"), nullable=True)
    description = Column(Text, nullable=True)
    location = Column(Text, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="projects")
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])
    tasks = relationship("ProjectTask", back_populates="project")

class ProjectTask(Base):
    __tablename__ = "project_tasks"
    
    task_id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.project_id"), nullable=False)
    task_name = Column(String(200), nullable=False)
    task_description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("hr_employees.employee_id"), nullable=True)
    task_status = Column(String(20), default="pending", index=True)  # pending, in_progress, completed, cancelled
    priority = Column(String(10), default="medium", index=True)  # low, medium, high, urgent
    estimated_hours = Column(Numeric(6, 2), nullable=True)
    actual_hours = Column(Numeric(6, 2), default=0)
    start_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True, index=True)
    completed_date = Column(Date, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_by = Column(String, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("HREmployee", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])
    updater = relationship("User", foreign_keys=[updated_by])

