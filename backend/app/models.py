from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)  # superadmin, admin1, admin2, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    # Employee profile extension (nullable, additive / safe for existing rows)
    employee_code = Column(String(30), unique=True, index=True, nullable=True)
    department = Column(String(100), index=True, nullable=True)
    position = Column(String(100), nullable=True)
    hire_date = Column(Date, nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(Text, nullable=True)
    
    # Relationship to password reset tokens
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True)
    ip_address = Column(String(45), nullable=True)  # Support both IPv4 and IPv6
    
    # Relationship to user
    user = relationship("User", back_populates="password_reset_tokens")

