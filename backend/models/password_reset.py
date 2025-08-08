from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    message: str
    email: str

class VerifyResetTokenResponse(BaseModel):
    valid: bool
    message: str

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

class ResetPasswordResponse(BaseModel):
    message: str

class PasswordResetTokenCreate(BaseModel):
    user_id: str
    token: str
    expires_at: datetime
    ip_address: Optional[str] = None

class PasswordResetTokenResponse(BaseModel):
    id: int
    user_id: str
    token: str
    created_at: datetime
    expires_at: datetime
    used_at: Optional[datetime] = None
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True

