"""
Enhanced FastAPI application with production-grade security and features
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

# Import our modules
from app.database import get_db
from app.models import User
from app.schemas import UserLogin, Token, User as UserSchema, HealthCheck, ErrorResponse
from app.auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.users import authenticate_user
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

# Import new routers
from routers import users, auth, employees
from app.logging_config import (
    setup_logging, 
    get_logger, 
    RequestLoggingMiddleware,
    log_auth_event,
    log_error
)

# Setup logging first
setup_logging()
logger = get_logger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Application starting up")
    
    # Initialize admin user if not exists
    try:
        from app.database import SessionLocal
        from app.auth import get_password_hash
        from datetime import datetime
        from sqlalchemy import text
        import uuid
        
        db = SessionLocal()
        try:
            # Check if admin user exists using safe query
            result = db.execute(
                text("SELECT username FROM users WHERE username = :username"),
                {"username": "admin"}
            ).fetchone()
            
            if not result:
                # Create default admin user with raw SQL
                user_id = str(uuid.uuid4())
                hashed_password = get_password_hash("admin123")
                
                db.execute(
                    text("""
                    INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
                    VALUES (:id, :username, :email, :hashed_password, :role, :is_active, :created_at)
                    """),
                    {
                        "id": user_id,
                        "username": "admin",
                        "email": "admin@sme.local", 
                        "hashed_password": hashed_password,
                        "role": "superadmin",
                        "is_active": True,
                        "created_at": datetime.utcnow()
                    }
                )
                db.commit()
                logger.info("✅ Created default admin user: admin / admin123")
            else:
                logger.info("✅ Admin user already exists")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"❌ Error initializing admin user: {e}")
    
    yield
    # Shutdown
    logger.info("Application shutting down")

# Create FastAPI app with enhanced configuration
app = FastAPI(
    title="Auth System with Role Dashboard",
    version="1.0.0",
    description="Production-ready authentication system with JWT and role-based access control",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Enhanced CORS middleware with localhost support for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Production Frontend URL
        "https://sme-management-frontend-production.up.railway.app",
        
        # Development origins  
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://localhost:3000",
        "https://localhost:3001",
        "https://localhost:5173", 
        "https://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:3001",
        "https://127.0.0.1:5173",
        "https://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

# Add rate limiting
app.state.limiter = limiter

# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    request_id = str(uuid.uuid4())
    
    # Convert errors to JSON-serializable format
    try:
        error_details = exc.errors()
        # Ensure all error details are JSON serializable
        serializable_errors = []
        for error in error_details:
            serializable_error = {}
            for key, value in error.items():
                try:
                    # Test if value is JSON serializable
                    json.dumps(value)
                    serializable_error[key] = value
                except (TypeError, ValueError):
                    # Convert non-serializable values to string
                    serializable_error[key] = str(value)
            serializable_errors.append(serializable_error)
    except Exception as e:
        serializable_errors = [{"error": "Failed to parse validation errors", "details": str(e)}]
    
    log_security_event(
        "validation_error",
        {"errors": serializable_errors, "request_id": request_id},
        request
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Invalid input data",
            "details": serializable_errors,
            "request_id": request_id
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    request_id = str(uuid.uuid4())
    
    # Log security events for certain status codes
    if exc.status_code in [401, 403, 429]:
        log_security_event(
            "http_exception",
            {"status_code": exc.status_code, "detail": exc.detail, "request_id": request_id},
            request
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "status_code": exc.status_code,
            "request_id": request_id
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    request_id = str(uuid.uuid4())
    # Safely log error without causing JSON serialization issues
    try:
        log_error(exc, {
            "request_id": request_id,
            "path": str(request.url.path),
            "method": str(request.method)
        })
    except Exception as log_exc:
        # If logging fails, at least log the basic info
        print(f"Logging failed: {str(log_exc)}, Original error: {str(exc)}")
    
    # Don't expose internal error details in production
    environment = os.getenv('ENVIRONMENT', 'development')
    if environment == 'production':
        detail = "Internal server error"
    else:
        # Ensure the error message is JSON serializable
        try:
            detail = str(exc)
            # Test if it's JSON serializable
            json.dumps(detail)
        except (TypeError, ValueError):
            detail = f"Error of type {type(exc).__name__}"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": detail,
            "request_id": request_id
        }
    )

# Middleware to add request ID to all responses
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Routes
@app.get("/", response_model=dict)
@limiter.limit("200/minute")
async def root(request: Request):
    """Root endpoint with API information"""
    return {
        "message": "Auth System API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "environment": os.getenv('ENVIRONMENT', 'development')
    }

@app.post("/auth/login", response_model=Token)
@limiter.limit("5/minute")  # Strict rate limiting for auth
async def login(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Enhanced login endpoint with security features"""
    
    try:
        # Validate request size
        validate_request_size(request)
        
        # Additional input validation
        if not InputValidator.validate_username(user_credentials.username):
            log_security_event(
                "invalid_username_format",
                {"username": user_credentials.username},
                request
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username format"
            )
        
        if not InputValidator.validate_password(user_credentials.password):
            log_security_event(
                "weak_password_attempt",
                {"username": user_credentials.username},
                request
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet security requirements"
            )
        
        # Authenticate user
        user = authenticate_user(db, user_credentials.username, user_credentials.password)
        if not user:
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
        
        # Check if user is active
        if not user.is_active:
            log_auth_event(
                "login_failed",
                username=user_credentials.username,
                success=False,
                details={"reason": "account_disabled"}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is disabled"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        # Log successful login
        log_auth_event(
            "login_success",
            username=user.username,
            success=True,
            details={"role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Handle any unexpected exceptions
        log_security_event(
            "login_exception",
            {"username": user_credentials.username, "error": str(e)},
            request
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@app.get("/auth/me", response_model=UserSchema)
@limiter.limit("100/minute")
async def read_users_me(request: Request, current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/dashboard")
@limiter.limit("100/minute")
async def dashboard(request: Request, current_user: User = Depends(get_current_user)):
    """Enhanced dashboard endpoint with role-based access"""
    
    # Log dashboard access
    logger.info(
        "Dashboard accessed",
        username=current_user.username,
        role=current_user.role
    )
    
    # Role-based response
    if current_user.role == "superadmin":
        access_level = "superadmin"
        permissions = ["read", "write", "delete", "admin"]
    elif current_user.role in ["admin1", "admin2"]:
        access_level = "admin"
        permissions = ["read", "write"]
    else:
        access_level = "user"
        permissions = ["read"]
    
    return {
        "message": f"Welcome {current_user.username}",
        "role": current_user.role,
        "access_level": access_level,
        "permissions": permissions,
        "user_id": current_user.id,
        "last_login": current_user.created_at.isoformat()
    }

@app.get("/health", response_model=HealthCheck)
@limiter.limit("1000/minute")  # High limit for health checks
async def health_check(request: Request):
    """Enhanced health check endpoint"""
    
    # Basic health check
    health_status = {
        "status": "healthy",
        "message": "Auth system is running",
        "version": "1.0.0",
        "environment": os.getenv('ENVIRONMENT', 'development')
    }
    
    # Add database health check
    try:
        from app.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["database"] = "connected"
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        health_status["database"] = "disconnected"
        health_status["status"] = "degraded"
    
    return health_status

# Additional security endpoints
@app.get("/auth/validate-token")
@limiter.limit("100/minute")
async def validate_token(request: Request, current_user: User = Depends(get_current_user)):
    """Validate JWT token"""
    return {
        "valid": True,
        "username": current_user.username,
        "role": current_user.role,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.post("/auth/logout")
@limiter.limit("100/minute")
async def logout(request: Request, current_user: User = Depends(get_current_user)):
    """Logout endpoint (for logging purposes)"""
    
    # Log logout event
    log_security_event(
        "logout",
        request, 
        {"username": current_user.username},
        "User logged out"
    )
    
    return {"message": "Logged out successfully"}

@app.post("/admin/init-admin")
async def init_admin_user(db: Session = Depends(get_db)):
    """Initialize admin user if not exists - for production setup"""
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            return {
                "message": "Admin user already exists",
                "username": admin_user.username,
                "role": admin_user.role,
                "is_active": admin_user.is_active,
                "created_at": admin_user.created_at.isoformat()
            }
        
        # Create admin user
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            username="admin",
            email="admin@company.com",
            hashed_password=hashed_password,
            role="SuperAdmin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        logger.info(f"Admin user created: {admin_user.username}")
        
        return {
            "message": "Admin user created successfully",
            "username": admin_user.username,
            "role": admin_user.role,
            "is_active": admin_user.is_active,
            "created_at": admin_user.created_at.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating admin user: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create admin user: {str(e)}"
        )

@app.get("/admin/check-users")
async def check_users(db: Session = Depends(get_db)):
    """Check existing users in database - for debugging"""
    try:
        users = db.query(User).all()
        users_info = []
        
        for user in users:
            users_info.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None
            })
        
        return {
            "total_users": len(users),
            "users": users_info
        }
        
    except Exception as e:
        logger.error(f"Error checking users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check users: {str(e)}"
        )
    
    log_auth_event(
        "logout",
        username=current_user.username,
        success=True
    )
    
    return {
        "message": "Successfully logged out",
        "username": current_user.username
    }

# Additional admin check endpoint
@app.get("/admin/check-users")
async def check_admin_users():
    """Check if admin users exist (for debugging)"""
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            admin_count = db.query(User).filter(User.role.in_(["admin", "superadmin"])).count()
            total_users = db.query(User).count()
            admin_user = db.query(User).filter(User.username == "admin").first()
            return {
                "admin_users_count": admin_count,
                "total_users": total_users,
                "admin_user_exists": admin_user is not None,
                "admin_user_active": admin_user.is_active if admin_user else None,
                "timestamp": datetime.utcnow().isoformat()
            }
        finally:
            db.close()
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}

@app.post("/admin/init-admin")
async def init_admin_user():
    """Manually initialize admin user (for production fix)"""
    try:
        from app.database import SessionLocal
        from app.auth import get_password_hash
        
        db = SessionLocal()
        try:
            # Check if admin user exists
            admin_user = db.query(User).filter(User.username == "admin").first()
            if admin_user:
                return {"message": "Admin user already exists", "username": "admin"}
            
            # Create default admin user
            hashed_password = get_password_hash("admin123")
            admin_user = User(
                username="admin",
                email="admin@sme.local",
                hashed_password=hashed_password,
                role="superadmin",
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            return {"message": "✅ Admin user created successfully", "username": "admin", "password": "admin123"}
        finally:
            db.close()
    except Exception as e:
        return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}

# Development/debugging endpoints (only in development)
if os.getenv('ENVIRONMENT', 'development') == 'development':
    @app.get("/debug/info")
    async def debug_info(request: Request):
        """Debug information (development only)"""
        return {
            "environment": os.getenv('ENVIRONMENT'),
            "cors_origins": get_cors_origins(),
            "rate_limits": {
                "auth": "5/minute",
                "api": "100/minute",
                "public": "200/minute"
            }
        }

# Debug endpoint for database schema
@app.get("/debug/schema", include_in_schema=False)
async def debug_schema(db: Session = Depends(get_db)):
    """Debug endpoint to check database schema"""
    try:
        from app.safe_db import check_table_schema
        schema_info = check_table_schema(db)
        
        return {
            "status": "success",
            "schema": schema_info,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Schema debug failed: {e}")
        return {
            "status": "error", 
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Emergency admin creation endpoint
@app.post("/debug/create-admin", include_in_schema=False)
async def create_admin_emergency(db: Session = Depends(get_db)):
    """Emergency endpoint to create admin user"""
    try:
        from app.auth import get_password_hash
        from sqlalchemy import text
        import uuid
        
        # Check if admin exists
        result = db.execute(
            text("SELECT username FROM users WHERE username = :username"),
            {"username": "admin"}
        ).fetchone()
        
        if result:
            return {"status": "exists", "message": "Admin user already exists"}
        
        # Create admin user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash("admin123")
        
        db.execute(
            text("""
            INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
            VALUES (:id, :username, :email, :hashed_password, :role, :is_active, :created_at)
            """),
            {
                "id": user_id,
                "username": "admin",
                "email": "admin@sme.local", 
                "hashed_password": hashed_password,
                "role": "superadmin",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        )
        db.commit()
        
        return {
            "status": "created",
            "message": "Admin user created successfully",
            "username": "admin",
            "password": "admin123"
        }
        
    except Exception as e:
        logger.error(f"Admin creation failed: {e}")
        return {"status": "error", "error": str(e)}

# Include routers
app.include_router(users.router, prefix="/api/users")
app.include_router(auth.router)
app.include_router(employees.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    
    # Production-grade server configuration
    config = {
        "host": "0.0.0.0",
        "port": int(os.getenv("PORT", 8000)),
        "log_level": "info",
        "access_log": True,
        "use_colors": False,
        "server_header": False,
        "date_header": False
    }
    
    # Add SSL in production
    if os.getenv('ENVIRONMENT') == 'production':
        ssl_keyfile = os.getenv('SSL_KEYFILE')
        ssl_certfile = os.getenv('SSL_CERTFILE')
        if ssl_keyfile and ssl_certfile:
            config.update({
                "ssl_keyfile": ssl_keyfile,
                "ssl_certfile": ssl_certfile
            })
    
    uvicorn.run(app, **config)

