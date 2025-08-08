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

load_dotenv()

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

# Debug logging for production
print(f"SECRET_KEY loaded: {type(SECRET_KEY)}, length: {len(SECRET_KEY)}")
print(f"SECRET_KEY preview: {SECRET_KEY[:10]}...{SECRET_KEY[-10:]}")  # Safe preview

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f"Password verification error: {str(e)}")
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
        print(f"JWT encoding error with string key: {str(e)}")
        print(f"SECRET_KEY type: {type(SECRET_KEY)}")
        print(f"SECRET_KEY value: {SECRET_KEY}")
        print(f"key_to_use type: {type(key_to_use)}")
        print(f"key_to_use length: {len(key_to_use)}")
        
        # Try with bytes conversion as fallback
        try:
            key_bytes = key_to_use.encode('utf-8')
            encoded_jwt = jwt.encode(to_encode, key_bytes, algorithm=ALGORITHM)
            print("SUCCESS: JWT encoding worked with bytes key")
            return encoded_jwt
        except Exception as e2:
            print(f"JWT encoding error with bytes key: {str(e2)}")
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
            print(f"JWT decode error with string key: {str(e1)}")
            # Try with bytes key as fallback
            try:
                key_bytes = key_to_use.encode('utf-8')
                payload = jwt.decode(token, key_bytes, algorithms=[ALGORITHM])
                print("SUCCESS: JWT decode worked with bytes key")
            except Exception as e2:
                print(f"JWT decode error with bytes key: {str(e2)}")
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
        print(f"JWT decode error: {str(e)}")
        print(f"SECRET_KEY type: {type(SECRET_KEY)}")
        print(f"Token preview: {token[:20]}...")
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

