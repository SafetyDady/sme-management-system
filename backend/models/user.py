from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str  # Changed from EmailStr to str for backward compatibility
    role: str = Field(..., pattern="^(user|admin|admin1|admin2|superadmin|hr|manager)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    email: EmailStr  # Keep EmailStr for input validation

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None  # Keep EmailStr for input validation
    role: Optional[str] = Field(None, pattern="^(user|admin|admin1|admin2|superadmin|hr|manager)$")

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    # Add employee fields for compatibility
    employee_code: Optional[str] = None
    department: Optional[str] = None  
    position: Optional[str] = None
    hire_date: Optional[datetime] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UserStatusUpdate(BaseModel):
    is_active: bool

