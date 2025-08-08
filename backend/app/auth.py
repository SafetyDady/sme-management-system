from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from .models import User
from dotenv import load_dotenv
import os

# Added structured logger
from .logging_config import get_logger

load_dotenv()

logger = get_logger("auth")

# Try multiple environment variable names for SECRET_KEY
SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or os.getenv("SECRET")
if not SECRET_KEY:
    # Generate a default key for development
    SECRET_KEY = "your-super-secret-key-change-in-production-very-long-and-secure-key-12345"

# Enhanced SECRET_KEY formatting for JWT compatibility
if isinstance(SECRET_KEY, bytes):
    SECRET_KEY = SECRET_KEY.decode('utf-8')

# Ensure it's a clean string without extra quotes or whitespace
SECRET_KEY = str(SECRET_KEY).strip().strip('"').strip("'")

# Environment flags
APP_ENV = (os.getenv("ENV") or os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or "development").lower()
DEBUG_MODE = (os.getenv("DEBUG") or "false").lower() in ("1", "true", "yes", "on")
IS_PRODUCTION = APP_ENV in ("prod", "production")

# Fail fast if running in production without a proper secret
if IS_PRODUCTION and (not SECRET_KEY or SECRET_KEY == "your-super-secret-key-change-in-production-very-long-and-secure-key-12345"):
    # Log and raise to prevent insecure startup in production
    logger.error("SECRET_KEY is missing or using insecure default in production", env=APP_ENV)
    raise RuntimeError("SECRET_KEY must be set via environment in production")

# Minimal, non-sensitive logging
if DEBUG_MODE:
    try:
        logger.info("JWT secret key loaded", env=APP_ENV, length=len(SECRET_KEY))
    except Exception:
        # In case SECRET_KEY is not a normal string
        logger.info("JWT secret key loaded", env=APP_ENV)

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error("Password verification error", error=str(e))
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Enhanced SECRET_KEY preparation with multiple fallbacks
    key_to_use = SECRET_KEY
    
    # Ensure key is string and clean
    if not key_to_use:
        key_to_use = "fallback-development-key-very-long-and-secure-12345"
    
    key_to_use = str(key_to_use).strip()
    
    try:
        # Try encoding with string key first
        encoded_jwt = jwt.encode(to_encode, key_to_use, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.warning("JWT encoding error with string key; retrying with bytes", error=str(e), key_type=type(key_to_use).__name__)
        
        # Try with bytes conversion as fallback
        try:
            key_bytes = key_to_use.encode('utf-8')
            encoded_jwt = jwt.encode(to_encode, key_bytes, algorithm=ALGORITHM)
            if DEBUG_MODE:
                logger.debug("JWT encoding succeeded with bytes key")
            return encoded_jwt
        except Exception as e2:
            logger.error("JWT encoding failed with bytes key", error=str(e2))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Token creation failed: {str(e)}"
            )

def verify_token(token: str):
    try:
        # Enhanced SECRET_KEY preparation matching create_access_token
        key_to_use = SECRET_KEY
        
        if not key_to_use:
            key_to_use = "fallback-development-key-very-long-and-secure-12345"
        
        key_to_use = str(key_to_use).strip()
        
        # Try decoding with string key first
        try:
            payload = jwt.decode(token, key_to_use, algorithms=[ALGORITHM])
        except Exception as e1:
            if DEBUG_MODE:
                logger.debug("JWT decode error with string key; retrying with bytes", error=str(e1))
            # Try with bytes key as fallback
            try:
                key_bytes = key_to_use.encode('utf-8')
                payload = jwt.decode(token, key_bytes, algorithms=[ALGORITHM])
                if DEBUG_MODE:
                    logger.debug("JWT decode succeeded with bytes key")
            except Exception as e2:
                logger.error("JWT decode failed with bytes key", error=str(e2))
                raise e1  # Raise original error
        
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return username
    except JWTError as e:
        logger.warning("JWT decode error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    from .models import User
    
    token = credentials.credentials
    username = verify_token(token)
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

