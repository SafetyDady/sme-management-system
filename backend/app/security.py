"""
Security enhancements for production environment
"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
import logging
from typing import Optional

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)

# Security headers middleware
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = dict(message.get("headers", []))
                    
                    # Add security headers
                    security_headers = {
                        b"x-content-type-options": b"nosniff",
                        b"x-frame-options": b"DENY",
                        b"x-xss-protection": b"1; mode=block",
                        b"strict-transport-security": b"max-age=31536000; includeSubDomains",
                        b"content-security-policy": b"default-src 'self'",
                        b"referrer-policy": b"strict-origin-when-cross-origin",
                        b"permissions-policy": b"geolocation=(), microphone=(), camera=()"
                    }
                    
                    # Update headers
                    for key, value in security_headers.items():
                        headers[key] = value
                    
                    message["headers"] = list(headers.items())
                
                await send(message)
            
            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)

# Input validation utilities
class InputValidator:
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format"""
        if not username or len(username) < 3 or len(username) > 50:
            return False
        # Allow alphanumeric, underscore, hyphen
        pattern = r'^[a-zA-Z0-9_-]+$'
        return bool(re.match(pattern, username))
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """Validate password strength"""
        if not password or len(password) < 8:
            return False
        # At least one letter and one number
        has_letter = bool(re.search(r'[a-zA-Z]', password))
        has_number = bool(re.search(r'\d', password))
        return has_letter and has_number
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """Sanitize string input"""
        if not value:
            return ""
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', value.strip())
        return sanitized[:max_length]

# Enhanced error handling
class SecurityError(Exception):
    """Custom security-related exception"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

def validate_request_size(request: Request, max_size: int = 1024 * 1024):  # 1MB default
    """Validate request content length"""
    content_length = request.headers.get('content-length')
    if content_length and int(content_length) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Request too large"
        )

# Rate limiting decorators
def rate_limit_auth(request: Request):
    """Rate limit for authentication endpoints"""
    return limiter.limit("5/minute")(request)

def rate_limit_api(request: Request):
    """Rate limit for general API endpoints"""
    return limiter.limit("100/minute")(request)

def rate_limit_public(request: Request):
    """Rate limit for public endpoints"""
    return limiter.limit("200/minute")(request)

# Security logging
def log_security_event(event_type: str, details: dict, request: Request):
    """Log security-related events"""
    client_ip = get_remote_address(request)
    user_agent = request.headers.get('user-agent', 'Unknown')
    
    log_data = {
        'event_type': event_type,
        'client_ip': client_ip,
        'user_agent': user_agent,
        'timestamp': None,  # Will be added by logger
        **details
    }
    
    logging.warning(f"Security Event: {event_type}", extra=log_data)

# CORS origins configuration
def get_cors_origins() -> list:
    """Get allowed CORS origins based on environment"""
    import os
    
    # Production origins with wildcard support
    production_origins = [
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://app.yourdomain.com",
        # Vercel deployment domains - use wildcard pattern
        "https://auth-system-frontend-*.vercel.app"
    ]
    
    # Development origins
    development_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ]
    
    # Check if in production
    environment = os.getenv('ENVIRONMENT', 'development')
    
    if environment == 'production':
        return production_origins
    else:
        # Allow both for development
        return production_origins + development_origins

