# 🚀 Backend API Requirements for User Management

## 📋 Overview
Currently the Railway backend at `https://web-production-5b6ab.up.railway.app` only has basic authentication endpoints. We need to add complete User Management APIs to enable:

1. **Profile Management** - Users can edit their own profiles
2. **User Administration** - Superadmin can manage all users
3. **Role-based Access Control** - Different permissions per role

## 🔍 Current API Endpoints (Working)
```
POST /auth/login          - User login
GET  /auth/me            - Get current user info
GET  /auth/validate-token - Validate JWT token
POST /auth/logout        - User logout
GET  /dashboard          - Dashboard data
GET  /health            - Health check
GET  /debug/info        - Debug information
```

## ❌ Missing API Endpoints (Required)

### 1. User Management APIs
```python
# Get all users (Admin/SuperAdmin only)
GET /users
Response: [
  {
    "id": "string",
    "username": "string", 
    "email": "string",
    "role": "string",
    "is_active": boolean,
    "created_at": "datetime",
    "last_login": "datetime"
  }
]

# Create new user (SuperAdmin only)
POST /users
Request Body: {
  "username": "string",
  "email": "string", 
  "password": "string",
  "role": "string"  # "user" | "admin" | "superadmin"
}
Response: User object

# Get specific user (Admin can see all, User can see own)
GET /users/{user_id}
Response: User object

# Update user (Admin can update all, User can update own)
PUT /users/{user_id}
Request Body: {
  "username": "string",
  "email": "string",
  "role": "string"  # Only admin/superadmin can change roles
}
Response: Updated user object

# Delete user (SuperAdmin only)
DELETE /users/{user_id}
Response: {"message": "User deleted successfully"}

# Toggle user active status (Admin/SuperAdmin only)  
PATCH /users/{user_id}/status
Request Body: {
  "is_active": boolean
}
Response: Updated user object
```

### 2. Profile Management APIs
```python
# Get current user profile
GET /users/me
Response: Current user object with full details

# Update current user profile
PUT /users/me
Request Body: {
  "username": "string",
  "email": "string",
  "current_password": "string",  # Required for verification
  "new_password": "string"       # Optional
}
Response: Updated user object

# Change password
POST /users/me/change-password
Request Body: {
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}
Response: {"message": "Password changed successfully"}
```

## 🔐 Permission Matrix

| Action | SuperAdmin | Admin | User |
|--------|------------|-------|------|
| View all users | ✅ | ✅ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Update any user | ✅ | ✅ | ❌ |
| Update own profile | ✅ | ✅ | ✅ |
| Delete user | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| Toggle user status | ✅ | ✅ | ❌ |

## 🛡️ Security Requirements

### Authentication
- All user management endpoints require JWT token
- Token should be validated on each request
- Include user role and permissions in token payload

### Authorization
```python
# Example FastAPI dependency for role checking
def require_role(required_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Usage examples:
@app.get("/users", dependencies=[Depends(require_role(["admin", "superadmin"]))])
@app.post("/users", dependencies=[Depends(require_role(["superadmin"]))])
@app.delete("/users/{user_id}", dependencies=[Depends(require_role(["superadmin"]))])
```

### Input Validation
```python
# Pydantic models for validation
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., regex="^(user|admin|superadmin)$")

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, regex="^(user|admin|superadmin)$")

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v
```

## 🗄️ Database Schema Requirements

### Users Table Updates
```sql
-- Ensure users table has all required fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
```

## 🧪 Testing Requirements

### Test Data Setup
Current working credentials:
```
superadmin:superadmin123 (role: superadmin)
admin1:admin1123 (role: admin1 -> should normalize to admin)
admin2:admin2123 (role: admin2 -> should normalize to admin)
```

### API Testing Examples
```bash
# Get JWT token first
TOKEN=$(curl -s -X POST "https://web-production-5b6ab.up.railway.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"superadmin123"}' | \
  jq -r '.access_token')

# Test get all users
curl -H "Authorization: Bearer $TOKEN" \
  "https://web-production-5b6ab.up.railway.app/users"

# Test create user
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"new@example.com","password":"password123","role":"user"}' \
  "https://web-production-5b6ab.up.railway.app/users"

# Test update profile
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"updated_name","email":"updated@example.com"}' \
  "https://web-production-5b6ab.up.railway.app/users/me"
```

## 🚦 Error Handling

### Standard HTTP Status Codes
```python
200 - Success
201 - Created (for POST /users)
400 - Bad Request (validation errors)
401 - Unauthorized (no/invalid token)
403 - Forbidden (insufficient permissions)
404 - Not Found (user not found)
409 - Conflict (username/email already exists)
422 - Unprocessable Entity (validation errors)
500 - Internal Server Error
```

### Error Response Format
```json
{
  "detail": "Error message",
  "error_code": "SPECIFIC_ERROR_CODE",
  "field_errors": {
    "username": ["Username already exists"],
    "email": ["Invalid email format"]
  }
}
```

## 📦 Frontend Integration

### Expected API Responses
The frontend is already configured to handle these response formats:

```javascript
// GET /users response
[
  {
    "id": "1",
    "username": "superadmin",
    "email": "super@example.com", 
    "role": "superadmin",
    "is_active": true,
    "created_at": "2025-08-04T10:18:59.665819",
    "last_login": "2025-08-06T08:30:00.000000"
  }
]

// POST /users response
{
  "id": "4",
  "username": "newuser",
  "email": "new@example.com",
  "role": "user", 
  "is_active": true,
  "created_at": "2025-08-06T12:00:00.000000"
}
```

## 🎯 Priority Implementation Order

1. **High Priority (Critical)**
   - `GET /users` - View users list
   - `POST /users` - Create new user
   - `PUT /users/me` - Update own profile

2. **Medium Priority**
   - `PUT /users/{id}` - Update user
   - `PATCH /users/{id}/status` - Toggle status
   - `POST /users/me/change-password` - Change password

3. **Low Priority**
   - `DELETE /users/{id}` - Delete user
   - Enhanced error handling
   - Advanced filtering/pagination

## 🚀 Deployment Notes

- Current Railway URL: `https://web-production-5b6ab.up.railway.app`
- Database: PostgreSQL (already connected)
- Authentication: JWT tokens (already working)
- Frontend Port: `localhost:5174` (CORS already configured)

## ✅ Acceptance Criteria

- [ ] All endpoints return correct HTTP status codes
- [ ] JWT authentication works on all protected endpoints  
- [ ] Role-based permissions enforced correctly
- [ ] Input validation prevents invalid data
- [ ] Error responses follow consistent format
- [ ] Frontend can successfully call all APIs
- [ ] Database constraints prevent data corruption
- [ ] Password hashing implemented securely

---

**Contact:** Frontend team ready for testing once APIs are implemented
**Timeline:** High priority endpoints needed for MVP functionality
