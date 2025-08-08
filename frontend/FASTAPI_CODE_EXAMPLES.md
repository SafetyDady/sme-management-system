# 🛠️ FastAPI Code Examples for User Management

## 📁 Project Structure
```
backend/
├── main.py              # FastAPI app entry point
├── models/
│   ├── __init__.py
│   └── user.py          # User Pydantic models
├── routers/
│   ├── __init__.py
│   ├── auth.py          # Existing auth endpoints
│   └── users.py         # NEW: User management endpoints
├── database/
│   ├── __init__.py
│   └── database.py      # Database connection
├── dependencies/
│   ├── __init__.py
│   └── auth.py          # Auth dependencies
└── requirements.txt
```

## 🔧 Implementation Code

### 1. User Models (`models/user.py`)
```python
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: str = Field(..., regex="^(user|admin|superadmin)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, regex="^(user|admin|superadmin)$")

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

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
```

### 2. Auth Dependencies (`dependencies/auth.py`)
```python
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
import jwt
from database.database import get_db
from sqlalchemy.orm import Session

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def require_roles(allowed_roles: List[str]):
    """Dependency to require specific roles"""
    def role_checker(current_user = Depends(get_current_user)):
        # Normalize role (admin1, admin2 -> admin)
        user_role = current_user.role
        if user_role in ['admin1', 'admin2']:
            user_role = 'admin'
            
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {allowed_roles}"
            )
        return current_user
    return role_checker

# Role shortcuts
require_admin_or_superadmin = require_roles(["admin", "superadmin"])
require_superadmin = require_roles(["superadmin"])
```

### 3. User Management Router (`routers/users.py`)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.user import UserCreate, UserUpdate, UserResponse, PasswordChange, UserStatusUpdate
from dependencies.auth import get_current_user, require_admin_or_superadmin, require_superadmin
from passlib.context import CryptContext
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Get all users (Admin/SuperAdmin only)"""
    users = db.query(User).all()
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)
):
    """Create new user (SuperAdmin only)"""
    # Check if username or email already exists
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
    
    # Hash password
    hashed_password = pwd_context.hash(user_data.password)
    
    # Create new user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        role=user_data.role,
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user profile"""
    # Check if username/email is already taken by another user
    if user_data.username or user_data.email:
        query = db.query(User).filter(User.id != current_user.id)
        if user_data.username:
            query = query.filter(User.username == user_data.username)
        if user_data.email:
            query = query.filter(User.email == user_data.email)
        
        existing_user = query.first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Update user data
    update_data = user_data.dict(exclude_unset=True)
    
    # Users cannot change their own role
    if 'role' in update_data and current_user.role not in ['admin', 'superadmin']:
        del update_data['role']
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user by ID (Admin can see all, User can see own)"""
    # Users can only see their own profile, admins can see all
    if current_user.role not in ['admin', 'superadmin'] and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Update user (Admin/SuperAdmin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Only superadmin can change roles to superadmin
    if user_data.role == 'superadmin' and current_user.role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmin can create superadmin users"
        )
    
    # Check for duplicates
    if user_data.username or user_data.email:
        query = db.query(User).filter(User.id != user_id)
        if user_data.username:
            query = query.filter(User.username == user_data.username)
        if user_data.email:
            query = query.filter(User.email == user_data.email)
        
        existing_user = query.first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email already taken"
            )
    
    # Update user
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_superadmin)
):
    """Delete user (SuperAdmin only)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}/status", response_model=UserResponse)
async def toggle_user_status(
    user_id: str,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_superadmin)
):
    """Toggle user active status (Admin/SuperAdmin only)"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Change current user password"""
    # Verify current password
    if not pwd_context.verify(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed_password = pwd_context.hash(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    
    db.commit()
    
    return {"message": "Password changed successfully"}
```

### 4. Update Main App (`main.py`)
```python
from fastapi import FastAPI
from routers import auth, users  # Import the new users router

app = FastAPI(title="Auth System with Role Dashboard")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)  # Add this line

# ... rest of your existing main.py code
```

### 5. Database Migration (if needed)
```sql
-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update existing users to have email addresses (example)
UPDATE users SET email = username || '@example.com' WHERE email IS NULL;
```

### 6. Requirements Update (`requirements.txt`)
```txt
# Add these if not already present
python-multipart
passlib[bcrypt]
python-jose[cryptography]
```

## 🧪 Testing the Implementation

After implementing the code above, run the test script:

```bash
# Make script executable
chmod +x test-user-management-apis.sh

# Run the tests
./test-user-management-apis.sh
```

Expected results:
- ✅ All API endpoints should return 200/201 for valid requests
- ✅ Proper error handling for unauthorized/invalid requests
- ✅ Role-based permissions working correctly
- ✅ Data validation preventing invalid inputs

## 🚀 Deployment Steps

1. **Add the new code** to your Railway backend project
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Run database migrations** if needed
4. **Deploy to Railway**: `railway up` or git push
5. **Test endpoints** using the provided test script
6. **Verify frontend integration** works correctly

---

**Priority Order:**
1. Implement `UserResponse`, `UserCreate`, `UserUpdate` models
2. Add auth dependencies with role checking
3. Create the `/users` router with basic CRUD operations
4. Test with the provided script
5. Fix any issues found during testing
6. Deploy and verify frontend integration
