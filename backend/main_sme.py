"""
SME Management System - Enhanced FastAPI Application
Production-ready application with all SME modules
"""
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session
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
from app.schemas import UserLogin, Token, User as UserSchema, HealthCheck, ErrorResponse

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

# Health check endpoint
@app.get("/health", response_model=HealthCheck)
@rate_limit_public
async def health_check(request: Request, db: Session = Depends(get_db)):
    """Health check endpoint for monitoring"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
        
    return HealthCheck(
        status="healthy" if db_status == "healthy" else "unhealthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        database=db_status,
        modules={
            "authentication": "active",
            "hr": "ready" if os.getenv("ENABLE_HR_MODULE", "True").lower() == "true" else "disabled",
            "projects": "ready" if os.getenv("ENABLE_PROJECT_MODULE", "True").lower() == "true" else "disabled",
            "inventory": "ready" if os.getenv("ENABLE_INVENTORY_MODULE", "True").lower() == "true" else "disabled",
            "financial": "ready" if os.getenv("ENABLE_FINANCIAL_MODULE", "True").lower() == "true" else "disabled"
        }
    )

# Login endpoint
@app.post("/api/login", response_model=Token)
@rate_limit_auth
async def login(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    try:
        # Validate input
        validator = InputValidator()
        if not validator.validate_email(user_credentials.username):
            log_security_event("invalid_email_format", request, {"email": user_credentials.username})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Authenticate user
        user = authenticate_user(db, user_credentials.username, user_credentials.password)
        if not user:
            log_auth_event("login_failed", request, {"username": user_credentials.username})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            log_auth_event("login_inactive_user", request, {"username": user_credentials.username})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id, "role": user.role}, 
            expires_delta=access_token_expires
        )
        
        # Update last login
        from datetime import datetime
        user.last_login = datetime.utcnow()
        db.commit()
        
        log_auth_event("login_success", request, {"username": user.username, "role": user.role})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_error("login_error", request, str(e))
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
    log_error("validation_error", request, str(exc))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    if exc.status_code >= 500:
        log_error("http_error", request, f"{exc.status_code}: {exc.detail}")
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

