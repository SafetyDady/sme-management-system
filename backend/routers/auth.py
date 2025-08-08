"""
Authentication router for forgot password functionality
"""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import uuid
import secrets
import hashlib

from app.database import get_db
from app.models import User, PasswordResetToken
from app.schemas import (
    ForgotPasswordRequest, 
    ForgotPasswordResponse,
    VerifyResetTokenResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.auth import get_password_hash
from app.security import rate_limit_auth, log_security_event
from app.logging_config import get_logger
from app.email_service import send_password_reset_email

logger = get_logger("auth_router")

router = APIRouter(prefix="/auth", tags=["authentication"])

# Configuration
RESET_TOKEN_EXPIRY_MINUTES = 30
MAX_RESET_REQUESTS_PER_IP = 3
RESET_REQUEST_WINDOW_MINUTES = 15

def generate_reset_token() -> str:
    """Generate a secure reset token"""
    return str(uuid.uuid4())

def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host

def cleanup_expired_tokens(db: Session):
    """Clean up expired reset tokens"""
    try:
        expired_tokens = db.query(PasswordResetToken).filter(
            PasswordResetToken.expires_at < datetime.utcnow()
        ).all()
        
        for token in expired_tokens:
            db.delete(token)
        
        db.commit()
        logger.info(f"Cleaned up {len(expired_tokens)} expired reset tokens")
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens: {e}")
        db.rollback()

def check_rate_limit(db: Session, ip_address: str) -> bool:
    """Check if IP has exceeded rate limit for reset requests"""
    window_start = datetime.utcnow() - timedelta(minutes=RESET_REQUEST_WINDOW_MINUTES)
    
    recent_requests = db.query(PasswordResetToken).filter(
        PasswordResetToken.ip_address == ip_address,
        PasswordResetToken.created_at >= window_start
    ).count()
    
    return recent_requests < MAX_RESET_REQUESTS_PER_IP

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Request password reset - sends email with reset link
    """
    try:
        # Clean up expired tokens first
        cleanup_expired_tokens(db)
        
        # Get client IP
        client_ip = get_client_ip(request)
        
        # Check rate limiting
        if not check_rate_limit(db, client_ip):
            log_security_event(
                "password_reset_rate_limit_exceeded",
                {"ip": client_ip, "email": request_data.email},
                request
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many password reset requests. Please try again later."
            )
        
        # Find user by email
        user = db.query(User).filter(User.email == request_data.email.lower()).first()
        
        if not user:
            # For security, always return success even if email doesn't exist
            # This prevents email enumeration attacks
            logger.warning(f"Password reset requested for non-existent email: {request_data.email}")
            return ForgotPasswordResponse(
                message="Password reset link sent to your email",
                email=request_data.email
            )
        
        if not user.is_active:
            logger.warning(f"Password reset requested for inactive user: {request_data.email}")
            return ForgotPasswordResponse(
                message="Password reset link sent to your email",
                email=request_data.email
            )
        
        # Generate reset token
        reset_token = generate_reset_token()
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)
        
        # Create reset token record
        token_record = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            expires_at=expires_at,
            ip_address=client_ip
        )
        
        db.add(token_record)
        db.commit()
        
        # Log security event
        log_security_event(
            "password_reset_requested",
            {
                "user_id": user.id,
                "email": user.email,
                "ip": client_ip,
                "token_id": token_record.id
            },
            request
        )
        
        logger.info(f"Password reset token generated for user {user.email}")
        
        # Send email with reset link
        email_sent = await send_password_reset_email(user.email, user.username, reset_token)
        
        if not email_sent:
            logger.warning(f"Failed to send reset email to {user.email}, but token was created")
        
        return ForgotPasswordResponse(
            message="Password reset link sent to your email",
            email=request_data.email
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in forgot_password: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/verify-reset-token", response_model=VerifyResetTokenResponse)
async def verify_reset_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify if reset token is valid and not expired
    """
    try:
        # Clean up expired tokens first
        cleanup_expired_tokens(db)
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is required"
            )
        
        # Find token record
        token_record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token
        ).first()
        
        if not token_record:
            return VerifyResetTokenResponse(
                valid=False,
                message="Token not found or expired"
            )
        
        # Check if token is expired
        if token_record.expires_at < datetime.utcnow():
            return VerifyResetTokenResponse(
                valid=False,
                message="Token not found or expired"
            )
        
        # Check if token is already used
        if token_record.used_at:
            return VerifyResetTokenResponse(
                valid=False,
                message="Token already used"
            )
        
        # Check if user still exists and is active
        user = db.query(User).filter(User.id == token_record.user_id).first()
        if not user or not user.is_active:
            return VerifyResetTokenResponse(
                valid=False,
                message="Token not found or expired"
            )
        
        logger.info(f"Reset token verified successfully for user {user.email}")
        
        return VerifyResetTokenResponse(
            valid=True,
            message="Token is valid"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in verify_reset_token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request_data: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Reset password using valid token
    """
    try:
        # Clean up expired tokens first
        cleanup_expired_tokens(db)
        
        # Find token record
        token_record = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == request_data.token
        ).first()
        
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
        
        # Check if token is expired
        if token_record.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
        
        # Check if token is already used
        if token_record.used_at:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Token already used"
            )
        
        # Find user
        user = db.query(User).filter(User.id == token_record.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User account is disabled"
            )
        
        # Hash new password
        hashed_password = get_password_hash(request_data.new_password)
        
        # Update user password
        user.hashed_password = hashed_password
        
        # Mark token as used
        token_record.used_at = datetime.utcnow()
        
        db.commit()
        
        # Get client IP
        client_ip = get_client_ip(request)
        
        # Log security event
        log_security_event(
            "password_reset_completed",
            {
                "user_id": user.id,
                "email": user.email,
                "ip": client_ip,
                "token_id": token_record.id
            },
            request
        )
        
        logger.info(f"Password reset completed for user {user.email}")
        
        return ResetPasswordResponse(
            message="Password reset successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in reset_password: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

