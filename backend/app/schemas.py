"""
Enhanced Pydantic schemas with comprehensive validation
"""
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
import re

class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username for authentication")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    
    @validator('username')
    def validate_username(cls, v):
        if not v:
            raise ValueError('Username is required')
        
        # Remove leading/trailing whitespace
        v = v.strip()
        
        # Check length
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        
        # Check format - alphanumeric, underscore, hyphen only
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        
        return v.lower()  # Convert to lowercase for consistency
    
    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password is required')
        
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        
        # Check for at least one letter and one number
        has_letter = bool(re.search(r'[a-zA-Z]', v))
        has_number = bool(re.search(r'\d', v))
        
        if not has_letter:
            raise ValueError('Password must contain at least one letter')
        
        if not has_number:
            raise ValueError('Password must contain at least one number')
        
        return v

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, max_length=128)
    role: str = Field(default="user", pattern="^(user|admin1|admin2|superadmin)$")
    
    @validator('username')
    def validate_username(cls, v):
        if not v:
            raise ValueError('Username is required')
        
        v = v.strip()
        
        if len(v) < 3 or len(v) > 50:
            raise ValueError('Username must be between 3 and 50 characters')
        
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        if not v:
            raise ValueError('Password is required')
        
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        
        # Enhanced password requirements
        has_letter = bool(re.search(r'[a-zA-Z]', v))
        has_number = bool(re.search(r'\d', v))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', v))
        
        if not has_letter:
            raise ValueError('Password must contain at least one letter')
        
        if not has_number:
            raise ValueError('Password must contain at least one number')
        
        # Optional: require special character for stronger passwords
        # if not has_special:
        #     raise ValueError('Password must contain at least one special character')
        
        return v
    
    @validator('email')
    def validate_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        
        # Additional email validation
        if len(v) > 254:  # RFC 5321 limit
            raise ValueError('Email address is too long')
        
        return v.lower()

class User(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User
    expires_in: Optional[int] = Field(default=3600, description="Token expiration time in seconds")

class TokenData(BaseModel):
    username: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(user|admin1|admin2|superadmin)$")
    is_active: Optional[bool] = None
    
    @validator('email')
    def validate_email(cls, v):
        if v and len(v) > 254:
            raise ValueError('Email address is too long')
        return v.lower() if v else v

class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        
        has_letter = bool(re.search(r'[a-zA-Z]', v))
        has_number = bool(re.search(r'\d', v))
        
        if not has_letter:
            raise ValueError('New password must contain at least one letter')
        
        if not has_number:
            raise ValueError('New password must contain at least one number')
        
        return v

class HealthCheck(BaseModel):
    status: str = "healthy"
    message: str = "Auth system is running"
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str = "1.0.0"

class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
    timestamp: datetime = Field(default_factory=datetime.now)
    request_id: Optional[str] = None

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.now)


# Forgot Password Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address to send reset link")
    
    @validator('email')
    def validate_email(cls, v):
        if not v:
            raise ValueError('Email is required')
        
        if len(v) > 254:
            raise ValueError('Email address is too long')
        
        return v.lower()

class ForgotPasswordResponse(BaseModel):
    message: str
    email: str

class VerifyResetTokenResponse(BaseModel):
    valid: bool
    message: str

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1, description="Password reset token")
    new_password: str = Field(..., min_length=6, max_length=128, description="New password")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('New password must be at least 6 characters long')
        
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        
        # Basic password requirements
        has_letter = bool(re.search(r'[a-zA-Z]', v))
        has_number = bool(re.search(r'\d', v))
        
        if not has_letter:
            raise ValueError('New password must contain at least one letter')
        
        if not has_number:
            raise ValueError('New password must contain at least one number')
        
        return v

class ResetPasswordResponse(BaseModel):
    message: str

