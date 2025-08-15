# 🏗️ SME Management System - Architecture & Flow Documentation

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Authentication Flow](#authentication-flow)
- [Role & Permission System](#role--permission-system)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [User Management Flow](#user-management-flow)
- [Database Compatibility Layer](#database-compatibility-layer)
- [API Endpoints](#api-endpoints)
- [Permission Matrix](#permission-matrix)
- [Data Flow Examples](#data-flow-examples)
- [Key Architecture Decisions](#key-architecture-decisions)

---

## 🎯 System Overview

```
┌─────────────────┐    HTTP/JWT    ┌─────────────────┐    SQL     ┌─────────────────┐
│                 │  ──────────→   │                 │  ────────→ │                 │
│   FRONTEND      │                │    BACKEND      │            │   DATABASE      │
│   (React/Vite)  │  ←──────────   │   (FastAPI)     │  ←──────── │  (PostgreSQL)   │
│                 │    JSON API    │                 │   Results  │                 │
└─────────────────┘                └─────────────────┘            └─────────────────┘
     Railway                              Railway                        Railway
```

**Tech Stack:**
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL
- **Authentication:** JWT tokens with role-based authorization
- **Deployment:** Railway (both frontend and backend)

---

## 🔄 Authentication Flow

```mermaid
graph TD
    A[User Login] --> B[Frontend sends credentials]
    B --> C[Backend /api/auth/login]
    C --> D[Check user in database via safe_db]
    D --> E[Generate JWT token]
    E --> F[Return token to frontend]
    F --> G[Frontend stores token in localStorage]
    G --> H[Include token in all API calls]
    H --> I[Backend verifies token]
    I --> J[Extract user from token]
    J --> K[Normalize role admin1→admin]
    K --> L[Check permissions]
    L --> M[Allow/Deny API access]
```

**Key Components:**
1. **JWT Token Generation** - `auth.py:create_access_token()`
2. **Token Verification** - `auth.py:get_current_user()`
3. **Role Normalization** - `permissions.py:normalize_role()`
4. **Permission Checks** - `dependencies/auth.py` decorators

---

## 🛡️ Role & Permission System

### Role Hierarchy

```
📊 Permission Levels:
┌─────────────────┐  Level 4
│   SUPERADMIN    │  • Full system control
│                 │  • User management + deletion
└─────────────────┘  • Debug tools access

┌─────────────────┐  Level 3  
│     ADMIN       │  • User management (no delete)
│   (admin1/2)    │  • Employee management
└─────────────────┘  • System configuration

┌─────────────────┐  Level 2
│       HR        │  • Employee data access
│                 │  • Leave management
└─────────────────┘  • Basic reports

┌─────────────────┐  Level 1
│      USER       │  • Personal profile only
│   (employee)    │  • Basic access
└─────────────────┘  • View own data
```

### Role Normalization Flow

```python
# Backend receives role from database
raw_role = "admin1"  # From legacy database

# permissions.py normalize_role()
normalized_role = normalize_role(raw_role)  # Returns "admin"

# Frontend receives canonical role
frontend_receives = "admin"  # Clean, standardized role

# Both systems use same canonical roles
CANONICAL_ROLES = ["user", "admin", "superadmin", "hr"]
```

**Role Mapping Configuration:**
```json
{
  "role_mapping": {
    "superadmin": "superadmin",
    "admin": "admin",
    "admin1": "admin",     // Legacy support
    "admin2": "admin",     // Legacy support
    "hr": "hr",
    "user": "user",
    "employee": "user"
  }
}
```

---

## 📁 Backend Structure

```
backend/
├── main.py                 # 🚀 FastAPI app entry point & CORS setup
├── app/
│   ├── auth.py            # 🔐 JWT authentication & token verification
│   ├── safe_db.py         # 🛡️ Database compatibility layer (CRITICAL!)
│   ├── schemas.py         # 📋 Pydantic models with Literal types
│   ├── permissions.py     # 🛂 Role normalization & permission checks
│   ├── models.py          # 🗄️ SQLAlchemy database models
│   ├── database.py        # 🔌 Database connection & session management
│   ├── logging_config.py  # 📊 Structured logging configuration
│   └── email_service.py   # 📧 Email utilities (password reset)
├── routers/
│   ├── users.py          # 👥 User management CRUD API
│   ├── auth.py           # 🔑 Login/register/password reset endpoints
│   └── employees.py      # 👤 Employee data management
├── dependencies/
│   └── auth.py           # 🔒 Permission decorators & role requirements
├── alembic/              # 📦 Database migrations & version control
│   ├── versions/         # 🔄 Migration files
│   └── env.py           # ⚙️ Alembic configuration
└── shared_config/
    └── roles.json        # 🎭 Role definitions & permissions
```

### Key Backend Files

#### `safe_db.py` - Database Compatibility Layer
```python
class SafeUser:
    """Safe user object avoiding SQLAlchemy model conflicts"""
    
def safe_get_user_by_username(db, username) -> Optional[SafeUser]:
    """Raw SQL query avoiding column conflicts"""
    
def safe_check_user_exists(db, username, email) -> bool:
    """Check user existence without model dependencies"""
```

#### `dependencies/auth.py` - Permission System
```python
require_admin_or_superadmin = require_roles(["admin", "superadmin"])
require_superadmin = require_roles(["superadmin"])  
require_hr_or_above = require_roles(["hr", "admin", "superadmin"])
```

---

## 🎨 Frontend Structure

```
frontend/src/
├── main.jsx              # ⚡ React app entry point & providers
├── App.jsx               # 🛣️ Main routing & authentication wrapper
├── pages/
│   ├── Login.jsx         # 🔐 Authentication interface
│   ├── Dashboard.jsx     # 🏠 Role-based dashboard with widgets
│   ├── UserManagement.jsx # 👥 User CRUD interface
│   ├── ForgotPassword.jsx # 🔑 Password reset flow
│   └── ResetPassword.jsx  # 🔄 Password confirmation
├── lib/
│   ├── api.js           # 📡 Axios-based API client with JWT
│   ├── auth.js          # 🎫 Authentication utilities & storage
│   └── permissions.js   # 🛂 Role normalization & UI permissions
├── hooks/
│   └── useAuth.jsx      # 🎣 Authentication React hook & context
├── components/
│   ├── ui/              # 🧩 Shadcn/UI components (Button, Card, etc.)
│   ├── auth/            # 🔐 Authentication-specific components
│   └── layout/          # 📐 Layout components (Header, Sidebar)
└── styles/
    └── globals.css      # 🎨 TailwindCSS global styles
```

### Key Frontend Files

#### `lib/api.js` - API Client
```javascript
// JWT token management
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: { 'Authorization': `Bearer ${token}` }
});

// User management endpoints
export const userAPI = {
  getUsers: () => api.get('/api/users/'),
  createUser: (userData) => api.post('/api/users/', userData),
  updateUser: (userId, userData) => api.put(`/api/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/api/users/${userId}`)
};
```

#### `lib/permissions.js` - Role Management
```javascript
export const normalizeRole = (role) => ROLE_MAPPING[role] || 'user';
export const hasPermission = (userRole, requiredRole) => { /* ... */ };
```

---

## 🔄 User Management Flow

### Create User Flow

```
1. 🎨 Frontend: SuperAdmin authentication
   ├── Login with credentials
   ├── Receive JWT token
   └── Store in localStorage

2. 🎨 Frontend: Navigate to User Management
   ├── Dashboard → User Management card
   ├── Route: /user-management
   ├── Check: normalizeRole(user.role) in ['superadmin', 'admin']
   └── Render: User management interface

3. 📡 API: Fetch existing users
   ├── GET /api/users/ with Bearer token
   ├── Backend: require_admin_or_superadmin() decorator
   ├── Response: List of users with normalized roles
   └── Frontend: Display in table

4. 🎨 Frontend: Create user form
   ├── User fills: username, email, role, password
   ├── Validation: Email format, password strength
   └── Submit: POST request preparation

5. 📡 API: Create user request
   ├── POST /api/users/ with user data
   ├── Headers: Authorization Bearer token
   └── Body: UserCreate schema validation

6. 🛡️ Backend: Authentication & authorization
   ├── get_current_user() extracts user from JWT
   ├── require_admin_or_superadmin() checks permission
   └── Proceed if authorized

7. 🗄️ Backend: Data processing
   ├── UserCreate schema validation
   ├── safe_check_user_exists() prevents duplicates
   ├── Password hashing with bcrypt
   └── Generate UUID for new user

8. 🗄️ Database: User creation
   ├── Raw SQL INSERT to avoid model conflicts
   ├── Essential columns only (id, username, email, etc.)
   ├── Transaction commit
   └── Return created user data

9. 📡 Response: Success confirmation
   ├── Backend returns created user object
   ├── Frontend updates users list
   ├── Show success notification
   └── Reset form
```

### Role Permission Check Flow

```python
# Backend endpoint protection
@router.post("/api/users/")
async def create_user(
    user_data: UserCreate,
    current_user = Depends(require_admin_or_superadmin)  # 🔒 Permission gate
):
    # Only admin/superadmin roles can access this endpoint
    
# Frontend UI permission check
const normalizedRole = normalizeRole(user.role);  // admin1 → admin
if (['superadmin', 'admin'].includes(normalizedRole)) {
    return <Button onClick={createUser}>Create User</Button>;
} else {
    return <p>Insufficient permissions</p>;
}
```

---

## 🗄️ Database Compatibility Layer

### Why safe_db.py is Critical

**Problem:** Database schema differences between environments
```sql
-- Development database
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    employee_code VARCHAR(50),  -- ❌ Missing in production
    department VARCHAR(100),    -- ❌ Missing in production
    position VARCHAR(100)       -- ❌ Missing in production
);

-- Production database
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
    -- ❌ employee_code, department, position columns missing
);
```

**Solution:** Raw SQL with essential columns only
```python
# ❌ BREAKS: SQLAlchemy model queries
user = db.query(User).filter(User.username == username).first()
# Error: column "employee_code" does not exist

# ✅ WORKS: Raw SQL with compatible columns
def safe_get_user_by_username(db: Session, username: str) -> Optional[SafeUser]:
    result = db.execute(text("""
        SELECT id, username, email, hashed_password, role, 
               is_active, created_at, last_login 
        FROM users 
        WHERE username = :username
    """), {"username": username})
    
    if result:
        return SafeUser(**result.fetchone()._asdict())
    return None
```

### Safe Database Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `safe_get_user_by_username()` | User lookup by username | `SafeUser \| None` |
| `safe_get_user_by_id()` | User lookup by ID | `SafeUser \| None` |
| `safe_check_user_exists()` | Check username/email existence | `boolean` |
| `safe_update_user()` | Update user with validation | `boolean` |
| `safe_delete_user()` | Delete user safely | `boolean` |
| `check_table_schema()` | Debug schema differences | `Dict[str, Any]` |

---

## 📡 API Endpoints

### Authentication Routes
```http
POST /api/auth/login           # User authentication
POST /api/auth/register        # New user registration  
POST /api/auth/forgot-password # Initiate password reset
POST /api/auth/reset-password  # Complete password reset
GET  /api/auth/me             # Get current user profile
```

### User Management Routes
```http
# User CRUD operations (Admin+ required)
GET    /api/users/             # List all users
POST   /api/users/             # Create new user
GET    /api/users/{user_id}    # Get specific user details
PUT    /api/users/{user_id}    # Update user information
DELETE /api/users/{user_id}    # Delete user (SuperAdmin only)

# Password management (Admin+ required)
POST   /api/users/{user_id}/password  # Change user password

# Debug tools (SuperAdmin only)
GET    /api/users/debug/schema # Inspect database schema
```

### Endpoint Security

| Endpoint | Permission Level | Decorator |
|----------|------------------|-----------|
| `GET /users/` | Admin+ | `require_admin_or_superadmin` |
| `POST /users/` | Admin+ | `require_admin_or_superadmin` |
| `PUT /users/{id}` | Admin+ | `require_admin_or_superadmin` |
| `DELETE /users/{id}` | SuperAdmin | `require_superadmin` |
| `POST /users/{id}/password` | Admin+ | `require_admin_or_superadmin` |
| `GET /users/debug/schema` | SuperAdmin | `require_superadmin` |

---

## 🛡️ Permission Matrix

| Feature | SuperAdmin | Admin | HR | User | Notes |
|---------|------------|-------|----|----- |-------|
| **Authentication** | ✅ | ✅ | ✅ | ✅ | All users can login |
| **View Own Profile** | ✅ | ✅ | ✅ | ✅ | Basic user right |
| **Dashboard Access** | ✅ | ✅ | ✅ | ✅ | Role-specific content |
| **View Users List** | ✅ | ✅ | ❌ | ❌ | User management permission |
| **Create New Users** | ✅ | ✅ | ❌ | ❌ | Admin-level operation |
| **Edit User Data** | ✅ | ✅ | ❌ | ❌ | Admin-level operation |
| **Delete Users** | ✅ | ❌ | ❌ | ❌ | SuperAdmin exclusive |
| **Change User Passwords** | ✅ | ✅ | ❌ | ❌ | Admin-level operation |
| **System Debug Tools** | ✅ | ❌ | ❌ | ❌ | SuperAdmin exclusive |
| **Database Schema View** | ✅ | ❌ | ❌ | ❌ | Debug/troubleshooting |

---

## 📊 Data Flow Examples

### Example 1: SuperAdmin Creating HR User

```
🎯 Goal: Create new HR user account

1. 🔐 Authentication Phase
   ├── SuperAdmin enters credentials at /login
   ├── Frontend: POST /api/auth/login
   ├── Backend: Validate credentials via safe_get_user_by_username()
   ├── Backend: Generate JWT token with user data
   ├── Frontend: Store token in localStorage
   └── Redirect to /dashboard

2. 🏠 Dashboard Navigation
   ├── Dashboard renders SuperAdmin-specific widgets
   ├── "User Management" card visible (permission check)
   ├── Click redirects to /user-management
   └── Route protection: normalizeRole(user.role) === 'superadmin' ✅

3. 👥 User Management Interface
   ├── Component mount triggers useEffect
   ├── API call: GET /api/users/ with Bearer token
   ├── Backend: require_admin_or_superadmin() validates token
   ├── Response: Current users list
   └── Frontend: Render users table + "Create User" button

4. 📝 User Creation Form
   ├── SuperAdmin clicks "Create User"
   ├── Form fields: username, email, password, role dropdown
   ├── Role options: ['user', 'hr', 'admin'] (no superadmin)
   ├── Fill data: username="hruser", email="hr@company.com", role="hr"
   └── Form validation: email format, password strength

5. 🚀 API Submission
   ├── Frontend: userAPI.createUser(formData)
   ├── Request: POST /api/users/ with JSON body
   ├── Headers: Authorization: Bearer {jwt_token}
   ├── Body: {username, email, hashed_password, role: "hr"}
   └── Await response

6. 🛡️ Backend Processing
   ├── FastAPI receives request at @router.post("/")
   ├── require_admin_or_superadmin dependency extracts user
   ├── UserCreate schema validates input data
   ├── safe_check_user_exists() prevents duplicates
   ├── Password hashing: pwd_context.hash(password)
   └── Generate UUID for new user ID

7. 🗄️ Database Operation
   ├── Raw SQL INSERT with essential columns only
   ├── INSERT INTO users (id, username, email, hashed_password, role, is_active, created_at)
   ├── VALUES (uuid, 'hruser', 'hr@company.com', hashed_pw, 'hr', TRUE, NOW())
   ├── Commit transaction
   └── SELECT created user data

8. ✅ Success Response
   ├── Backend returns: {id, username, email, role: "hr", is_active, created_at}
   ├── Frontend receives 201 Created response
   ├── Update users list state with new user
   ├── Show success notification: "HR user created successfully"
   ├── Reset form fields
   └── New user appears in table with HR role badge
```

### Example 2: Role-Based Dashboard Rendering

```
🎯 Goal: Display appropriate dashboard based on user role

1. 🔍 User Role Detection
   ├── useAuth hook provides user object from JWT
   ├── user.role could be: "admin1" (legacy from database)
   ├── normalizeRole("admin1") returns "admin"
   └── Dashboard component receives canonical role

2. 🎨 Role-Based Rendering Logic
   ├── Switch statement on normalized role
   ├── case 'superadmin': renderSuperAdminDashboard()
   ├── case 'admin': renderAdminDashboard()  
   ├── case 'hr': renderHRDashboard()
   └── default: renderUserDashboard()

3. 🏠 SuperAdmin Dashboard Widgets
   ├── System Overview card with user count
   ├── User Management card (full CRUD access)
   ├── System Settings card
   ├── Debug Tools card
   └── All role-specific features enabled

4. 👤 Admin Dashboard Widgets  
   ├── User Management card (no delete button)
   ├── Employee Management card
   ├── Reports card
   └── Limited system access

5. 🧑‍💼 HR Dashboard Widgets
   ├── Employee Directory (read-only)
   ├── Leave Management card
   ├── Basic Reports card
   └── No user management access

6. 👨‍💻 User Dashboard Widgets
   ├── Personal Profile card
   ├── My Tasks card
   ├── Company Announcements
   └── Basic employee features only
```

---

## 🎯 Key Architecture Decisions

### 1. **Safe Database Operations**
**Decision:** Use raw SQL queries instead of SQLAlchemy models
**Reason:** Production/development database schema differences
**Impact:** Prevents column existence errors, ensures compatibility

### 2. **Role Normalization**
**Decision:** Centralized role mapping in `permissions.py`
**Reason:** Legacy database contains `admin1`, `admin2` variants
**Impact:** Consistent role handling across frontend/backend

### 3. **Type Safety with Literal Types**
**Decision:** Use `Literal["user", "admin", "superadmin", "hr"]` in schemas
**Reason:** Prevent invalid role assignments at compile time
**Impact:** Better IDE support, runtime error prevention

### 4. **JWT Stateless Authentication**
**Decision:** Token-based authentication with role embedded
**Reason:** Scalable, works well with Railway deployment
**Impact:** No server-side session storage required

### 5. **Permission Decorator Pattern**
**Decision:** FastAPI dependencies for authorization (`@Depends(require_admin)`)
**Reason:** Consistent permission checking across endpoints
**Impact:** Clean, reusable authorization logic

### 6. **Modular Frontend Architecture**
**Decision:** Separate API client, auth hooks, permission utilities
**Reason:** Clear separation of concerns, testability
**Impact:** Maintainable codebase, reusable components

### 7. **Safe Error Handling**
**Decision:** Try-catch blocks with HTTPException for API errors
**Reason:** Graceful error handling, proper HTTP status codes
**Impact:** Better user experience, easier debugging

### 8. **Environment-Specific Configuration**
**Decision:** Different database schemas in dev vs production
**Reason:** Production database limitations, legacy constraints
**Impact:** Requires compatibility layer (safe_db.py)

---

## 🚀 Deployment Architecture

### Railway Deployment Flow

```
📦 Local Development
├── Git commit & push to main branch
├── GitHub webhook triggers Railway build
├── Railway pulls latest code
├── Docker build process (if Dockerfile present)
├── Environment variables injection
├── Application startup
└── Health check & live deployment

🌐 Production URLs:
├── Frontend: https://sme-management-frontend-production.up.railway.app
├── Backend: https://sme-management-system-production.up.railway.app
└── API Docs: https://sme-management-system-production.up.railway.app/docs
```

### Environment Variables
```bash
# Backend (.env)
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://user:pass@host:port/db
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend (.env)
VITE_API_URL=https://sme-management-system-production.up.railway.app
```

---

## 📚 Additional Resources

### Development Commands
```bash
# Backend development
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend development  
cd frontend
npm install
npm run dev

# Database migrations
alembic upgrade head
alembic revision --autogenerate -m "description"

# Testing
pytest backend/tests/
npm run test
```

### Debugging Tools
```bash
# Check database schema
GET /api/users/debug/schema

# View API documentation
https://your-backend-url/docs

# Backend logs
Railway dashboard → Backend service → Logs

# Frontend build logs  
Railway dashboard → Frontend service → Build logs
```

---

**📅 Last Updated:** August 12, 2025  
**🔄 Version:** 2.0 - Complete System Refactor  
**👥 Status:** Production Ready  
**📋 Next Review:** When adding new features or roles
