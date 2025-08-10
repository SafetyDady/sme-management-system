"""
SME Management System - Enhanced FastAPI Application
Production-ready application with all SME modules
"""
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import timedelta, datetime
from typing import List
import os
import uuid
import json
from contextlib import asynccontextmanager

# Import database and models
from app.database import get_db, engine
from app.models import User, PasswordResetToken
from app.models_all import *  # Import all SME models

# Import schemas
from app.schemas import UserLogin, Token, User as UserSchema, ErrorResponse

# Import authentication
from app.auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.users import authenticate_user

# Import security
from app.security import (
    SecurityHeadersMiddleware, 
    limiter, 
    rate_limit_auth, 
    rate_limit_api, 
    rate_limit_public,
    InputValidator,
    validate_request_size,
    log_security_event,
    get_cors_origins
)

# Import logging
from app.logging_config import (
    setup_logging, 
    get_logger, 
    RequestLoggingMiddleware,
    log_auth_event,
    log_error
)

# Import existing routers
from routers import users, auth

# Setup logging
setup_logging()
logger = get_logger("sme_main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("🚀 Starting SME Management System...")
    
    # Create database tables
    try:
        from app.database import Base
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    # Log enabled modules
    enabled_modules = []
    if os.getenv("ENABLE_HR_MODULE", "True").lower() == "true":
        enabled_modules.append("HR")
    if os.getenv("ENABLE_PROJECT_MODULE", "True").lower() == "true":
        enabled_modules.append("Projects")
    if os.getenv("ENABLE_INVENTORY_MODULE", "True").lower() == "true":
        enabled_modules.append("Inventory")
    if os.getenv("ENABLE_FINANCIAL_MODULE", "True").lower() == "true":
        enabled_modules.append("Financial")
    
    logger.info(f"📋 Enabled modules: {', '.join(enabled_modules)}")
    
    yield
    
    logger.info("🛑 Shutting down SME Management System...")

# Create FastAPI application
app = FastAPI(
    title="SME Management System",
    description="Complete SME Management System with HR, Projects, Inventory, and Financial modules",
    version="1.0.0",
    docs_url="/docs" if os.getenv("DEBUG", "False").lower() == "true" else None,
    redoc_url="/redoc" if os.getenv("DEBUG", "False").lower() == "true" else None,
    lifespan=lifespan
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter

# Include existing routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])

# TODO: Include SME module routers when they are created
# app.include_router(hr.router, prefix="/api/hr", tags=["HR Management"])
# app.include_router(projects.router, prefix="/api/projects", tags=["Project Management"])
# app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory Management"])
# app.include_router(financial.router, prefix="/api/financial", tags=["Financial Management"])

# Root endpoint
@app.get("/", response_model=dict)
async def root():
    """Root endpoint with system information"""
    return {
        "message": "SME Management System API",
        "version": "1.0.0",
        "status": "operational",
        "modules": {
            "authentication": "active",
            "hr": os.getenv("ENABLE_HR_MODULE", "True").lower() == "true",
            "projects": os.getenv("ENABLE_PROJECT_MODULE", "True").lower() == "true",
            "inventory": os.getenv("ENABLE_INVENTORY_MODULE", "True").lower() == "true",
            "financial": os.getenv("ENABLE_FINANCIAL_MODULE", "True").lower() == "true"
        },
        "environment": os.getenv("ENVIRONMENT", "development"),
        "docs_url": "/docs" if os.getenv("DEBUG", "False").lower() == "true" else "disabled"
    }

# Health check endpoint - Simple pattern like auth-system
@app.get("/health")
@rate_limit_public
async def health_check(request: Request):
    """Enhanced health check endpoint"""
    
    # Basic health check
    health_status = {
        "status": "healthy",
        "message": "SME Management System is running",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Database connectivity check
    try:
        db = next(get_db())
        # Simple query to test database
        db.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["database"] = "disconnected"
        health_status["error"] = str(e)
    
    return health_status

# Login endpoint
@app.post("/api/login", response_model=Token)
@rate_limit_auth
async def login(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    try:
        print(f"[DEBUG] Login attempt - Username: {user_credentials.username}")
        print(f"[DEBUG] Password length: {len(user_credentials.password)}")
        
        # Validate input
        validator = InputValidator()
        print(f"[DEBUG] Starting username validation...")
        # Accept username (not email) for authentication
        if not validator.validate_username(user_credentials.username):
            print(f"[DEBUG] Username validation failed")
            log_security_event("invalid_username_format", {"username": user_credentials.username}, request)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username format"
            )
        print(f"[DEBUG] Username validation passed")
        
        # Authenticate user
        print(f"[DEBUG] Starting user authentication...")
        user = authenticate_user(db, user_credentials.username, user_credentials.password)
        print(f"[DEBUG] User authentication result: {user is not False}")
        
        if not user:
            print(f"[DEBUG] Authentication failed - user not found or wrong password")
            log_auth_event(
                "login_failed",
                username=user_credentials.username,
                success=False,
                details={"reason": "invalid_credentials"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"[DEBUG] User found: {user.username}, Active: {user.is_active}")
        if not user.is_active:
            print(f"[DEBUG] User is inactive")
            log_auth_event(
                "login_inactive_user",
                username=user_credentials.username,
                success=False,
                details={"reason": "inactive_user"}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        print(f"[DEBUG] Creating access token...")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id, "role": user.role}, 
            expires_delta=access_token_expires
        )
        print(f"[DEBUG] Access token created successfully")
        
        # Update last login
        print(f"[DEBUG] Updating last login...")
        from datetime import datetime
        user.last_login = datetime.utcnow()
        db.commit()
        print(f"[DEBUG] Last login updated")
        
        log_auth_event(
            "login_success",
            username=user.username,
            success=True,
            details={"role": user.role}
        )
        
        print(f"[DEBUG] Preparing response object...")
        response_data = {
            "access_token": access_token, 
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
        print(f"[DEBUG] Response prepared, returning...")
        return response_data
        
    except HTTPException:
        print(f"[DEBUG] HTTPException caught, re-raising")
        raise
    except Exception as e:
        print(f"[DEBUG] Unexpected exception: {type(e).__name__}: {str(e)}")
        log_error(e, {"request_path": str(request.url), "method": request.method, "context": "login_error"})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# Get current user endpoint
@app.get("/api/me", response_model=UserSchema)
@rate_limit_api
async def get_current_user_info(request: Request, current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

# Module status endpoint
@app.get("/api/modules/status")
@rate_limit_api
async def get_module_status(request: Request, current_user: User = Depends(get_current_user)):
    """Get status of all SME modules"""
    return {
        "hr": {
            "enabled": os.getenv("ENABLE_HR_MODULE", "True").lower() == "true",
            "status": "ready",
            "endpoints": ["/api/hr/employees", "/api/hr/leaves", "/api/hr/daily-actual"]
        },
        "projects": {
            "enabled": os.getenv("ENABLE_PROJECT_MODULE", "True").lower() == "true",
            "status": "ready",
            "endpoints": ["/api/projects", "/api/projects/customers", "/api/projects/tasks"]
        },
        "inventory": {
            "enabled": os.getenv("ENABLE_INVENTORY_MODULE", "True").lower() == "true",
            "status": "ready",
            "endpoints": ["/api/inventory/items", "/api/inventory/transactions", "/api/inventory/stock"]
        },
        "financial": {
            "enabled": os.getenv("ENABLE_FINANCIAL_MODULE", "True").lower() == "true",
            "status": "ready",
            "endpoints": ["/api/financial/accounts", "/api/financial/transactions", "/api/financial/budgets"]
        }
    }

# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    # Correct logging: pass Exception and context dict
    try:
        log_error(exc, {
            "request_path": str(request.url),
            "method": request.method,
            "context": "validation_error",
            "errors": [str(e) for e in exc.errors()] if hasattr(exc, "errors") else str(exc)
        })
    except Exception as le:
        print(f"Logging failed in validation_exception_handler: {le}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors() if hasattr(exc, "errors") else []}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    if exc.status_code >= 500:
        # Correct logging: pass Exception and context dict
        try:
            log_error(exc, {
                "request_path": str(request.url),
                "method": request.method,
                "context": "http_error",
                "status_code": exc.status_code,
                "detail": exc.detail
            })
        except Exception as le:
            print(f"Logging failed in http_exception_handler: {le}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    log_error(exc, {"request_path": str(request.url), "method": request.method})
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )

# Startup message
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"🚀 Starting SME Management System on {host}:{port}")
    
    uvicorn.run(
        "main_sme:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "False").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )

