# 📋 SME Management System - Master Project Documentation
**Last Updated**: August 11, 2025 (Post HR Module Completion)  
**Status**: Production Ready with HR Module Functional  
**Repository**: sme-management-system (SafetyDady)

---

## 🎯 **CRITICAL INFORMATION FOR NEW AI SESSIONS**

### **CURRENT PRODUCTION STATUS**: ✅ FULLY OPERATIONAL
- **Backend**: https://web-production-5b6ab.up.railway.app *(Railway Auto-Deploy)*
- **Database**: PostgreSQL on Railway *(Production Ready)*
- **Authentication**: JWT-based, Role-based Access (superadmin/admin/user)
- **HR Module**: Complete CRUD operations for employee management

### **ADMIN CREDENTIALS** (Production)
```
Username: admin
Password: admin123
```

### **RECENT FIXES APPLIED** (August 11, 2025)
1. **Option A Architecture**: Clean User model (removed employee field duplication)
2. **API Endpoint Alignment**: `/auth/login` (not `/api/login`)
3. **Production Health Check**: `text("SELECT 1")` SQLAlchemy syntax
4. **Admin Debug Endpoints**: Added for production troubleshooting

---

## 🏗️ **SYSTEM ARCHITECTURE OVERVIEW**

### **Backend (FastAPI)**
```
📂 backend/
├── main.py                    # FastAPI app entry point
├── requirements.txt           # Python dependencies
├── app/
│   ├── models.py             # SQLAlchemy models (CLEAN USER MODEL)
│   ├── schemas.py            # Pydantic validation schemas  
│   ├── auth.py               # JWT authentication logic
│   ├── database.py           # Database connection
│   └── routers/
│       ├── auth.py          # Auth endpoints (/auth/*)
│       └── users.py         # User management
├── alembic/                  # Database migrations
└── dependencies/             # Auth dependencies
```

### **Frontend (React + Vite)**
```
📂 frontend/
├── src/
│   ├── lib/api.js           # API client (FIXED ENDPOINTS)
│   ├── components/          # React components
│   │   └── auth/           # Authentication components
│   ├── pages/              # Application pages
│   └── hooks/              # Custom React hooks
└── public/
```

### **Database Schema** (PostgreSQL)
```sql
-- AUTHENTICATION (Clean Model)
users (
    id, username, email, role, 
    is_active, created_at
    -- NO EMPLOYEE FIELDS (Option A Applied)
)

-- HR MANAGEMENT (Separate Concerns)
hr_employees (
    employee_id, emp_code, first_name, last_name,
    department, position, employment_type,
    salary_base, contact_phone, hire_date,
    active_status, created_at, updated_at
)

-- PASSWORD RESET
password_reset_tokens (
    token, user_id, expires_at, created_at
)
```

---

## ✅ **COMPLETED MODULES & FEATURES**

### **1. Authentication System** *(100% Complete)*
- [x] JWT-based login/logout
- [x] Role-based access control (superadmin, admin, user)
- [x] Password hashing with bcrypt
- [x] Token refresh mechanism
- [x] User registration and profile management
- [x] Password reset functionality (email + admin reset)

### **2. HR Employee Management** *(100% Complete - Aug 11, 2025)*
- [x] Employee CRUD operations (Create, Read, Update, Delete)
- [x] Department and position tracking
- [x] Employment type classification (Full-time, Part-time, Contract, Intern)
- [x] Salary base management
- [x] Contact information (phone, email)
- [x] Employment status tracking (active/inactive)
- [x] Search and filter functionality
- [x] Admin-only access controls
- [x] Unicode support for Thai names

### **3. Production Deployment** *(100% Complete)*
- [x] Railway backend deployment with auto-deploy
- [x] PostgreSQL production database
- [x] CORS and security configuration
- [x] Environment variable management
- [x] Health check endpoints

---

## 🔧 **KEY API ENDPOINTS**

### **Authentication** (`/auth/*`)
```
POST /auth/login                # User login
POST /auth/logout              # User logout  
GET  /auth/me                  # Current user info
POST /auth/register            # User registration
POST /auth/forgot-password     # Password reset request
POST /auth/reset-password      # Password reset confirmation
```

### **User Management** (`/users/*`)
```
GET    /users/                 # List users (admin only)
POST   /users/                 # Create user (admin only)
GET    /users/{user_id}        # Get user details
PUT    /users/{user_id}        # Update user
DELETE /users/{user_id}        # Delete user (admin only)
```

### **HR Employee Management** (`/hr/employees/*`)
```
GET    /hr/employees/          # List employees (admin only)
POST   /hr/employees/          # Create employee (admin only)
GET    /hr/employees/{emp_id}  # Get employee details
PUT    /hr/employees/{emp_id}  # Update employee (admin only)
DELETE /hr/employees/{emp_id}  # Delete employee (admin only)
GET    /hr/employees/search    # Search employees
```

### **Admin Debug** (`/admin/*`)
```
GET    /admin/check-users      # Check user accounts (debugging)
POST   /admin/reset-admin-password  # Reset admin password
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Production Login Issues**
```bash
# Issue: 405 Method Not Allowed
# Solution: Check API endpoint alignment
Frontend: /auth/login (not /api/login)
Backend: /auth/login endpoint exists

# Issue: 401 Unauthorized  
# Solution: Use admin debug endpoint
POST /admin/reset-admin-password
Body: {"new_password": "admin123"}
```

### **Database Schema Conflicts**
```bash
# Issue: "column users.employee_code does not exist"
# Solution: Option A Applied - Clean User Model
User model only contains auth fields
Employee data is in hr_employees table
```

### **Development vs Production**
```bash
# Development
Backend: http://localhost:8000
Frontend: http://localhost:3001

# Production  
Backend: https://web-production-5b6ab.up.railway.app
Frontend: TBD (ready for deployment)
```

---

## 📁 **PROJECT FILE STRUCTURE**

### **Critical Files to Check First**
1. `backend/main.py` - FastAPI app with all endpoints
2. `backend/app/models.py` - Database models (CLEAN USER MODEL)
3. `backend/app/schemas.py` - API validation schemas
4. `frontend/src/lib/api.js` - API client configuration
5. `backend/requirements.txt` - Python dependencies

### **Configuration Files**
1. `docker-compose.yml` - Local development setup
2. `railway.toml` - Railway deployment config
3. `backend/alembic.ini` - Database migration config
4. `frontend/vite.config.js` - Frontend build config

### **Documentation Files** (Reference)
1. `PROJECT_STATUS_REPORT_AUGUST_2025.md` - Previous status
2. `DEVELOPMENT_PROGRESSION_AND_LEARNING.md` - Learning journey
3. `SME_Management_System_Complete_Design.md` - System design
4. `API_DOCUMENTATION.md` - API reference

---

## 🛠️ **QUICK START FOR NEW AI SESSIONS**

### **1. Production Check**
```bash
# Test production login
curl -X POST https://web-production-5b6ab.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return JWT token and user data
```

### **2. Local Development**
```bash
cd /home/safety/sme-management

# Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Frontend  
cd ../frontend
npm run dev

# Access: http://localhost:3001
```

### **3. Database Operations**
```bash
cd backend

# Check current migration status
alembic current

# Apply latest migrations (if needed)
alembic upgrade head

# Create new migration (for schema changes)
alembic revision --autogenerate -m "description"
```

---

## 🎯 **NEXT DEVELOPMENT PHASES**

### **Phase 3: Leave Management System** *(Future)*
- Employee leave requests and approvals
- Leave balance tracking
- Calendar integration
- Approval workflow

### **Phase 4: Performance & Analytics** *(Future)*
- Employee performance tracking
- Dashboard analytics
- Reporting system
- KPI management

### **Phase 5: Payroll Integration** *(Future)*
- Salary calculation
- Payment processing
- Tax calculations
- Payslip generation

---

## ⚡ **EMERGENCY TROUBLESHOOTING**

### **If Production is Down**
1. Check Railway deployment status
2. Verify environment variables
3. Check database connectivity: `GET /health`
4. Review recent Git commits for breaking changes

### **If Authentication Fails**
1. Use admin reset: `POST /admin/reset-admin-password`
2. Check JWT token expiry
3. Verify user exists: `GET /admin/check-users`
4. Check password hash format

### **If Database Errors**
1. Check migration status: `alembic current`
2. Apply pending migrations: `alembic upgrade head`
3. Verify model-schema alignment
4. Check for field duplication issues

---

## 📞 **CONTACT & HANDOVER INFO**

**Current Status**: HR Module completed and production-ready  
**Last Session**: User model cleanup (Option A) successfully applied  
**Production**: Fully functional with admin/admin123 access  
**Next Priority**: Frontend deployment and Phase 3 planning

**Architecture Decision**: Clean separation between User (auth) and HR Employee (data) models to prevent field duplication and maintain system flexibility.

---
*This document serves as the single source of truth for project continuity across AI sessions.*
