# 🏗️ SME Management System - Complete Structure Documentation

## 📋 Overview
This documentation provides complete structure and troubleshooting guide to prevent recurring issues.

**Started:** August 10, 2025
**Issues Duration:** 2 days of authentication & user management fixes
**Status:** ✅ RESOLVED (August 12, 2025)

---

## 🎯 System Architecture

### Frontend (React + Vite)
- **Location:** `/frontend/`
- **Deployment:** Railway (https://sme-management-frontend-production.up.railway.app)
- **Authentication:** JWT tokens stored in localStorage
- **Key Files:**
  - `src/lib/api.js` - API communication layer
  - `src/pages/UserManagement.jsx` - User CRUD interface
  - `src/pages/Dashboard.jsx` - Role-based dashboard

### Backend (FastAPI + PostgreSQL)
- **Location:** `/backend/`  
- **Deployment:** Railway (https://sme-management-system-production.up.railway.app)
- **Database:** PostgreSQL with schema compatibility issues
- **Key Files:**
  - `main.py` - Application entry point
  - `app/auth.py` - Authentication logic
  - `app/safe_db.py` - **CRITICAL** - Database compatibility layer
  - `routers/users.py` - User management API endpoints

---

## 🚨 Critical Components (NEVER BREAK THESE)

### 1. `app/safe_db.py` - Database Compatibility Layer
**Purpose:** Handle database schema differences between dev/production

**Key Classes & Functions:**
```python
class SafeUser:
    # Safe user object with essential fields only
    
def safe_get_user_by_username(db, username) -> Optional[SafeUser]
def safe_get_user_by_id(db, user_id) -> Optional[SafeUser]  
def safe_check_user_exists(db, username, email) -> bool
def safe_update_user(db, user_id, updates) -> bool
def safe_delete_user(db, user_id) -> bool
def check_table_schema(db) -> Dict[str, Any]
```

**WHY CRITICAL:** Production database missing employee_code columns that dev has. Raw SQL queries avoid SQLAlchemy model conflicts.

### 2. `app/auth.py` - Authentication System
**Dependencies:** Uses `safe_get_user_by_username()` exclusively

**Critical Function:**
```python
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # MUST use safe_get_user_by_username - NOT User model
```

### 3. `routers/users.py` - User Management API
**ALL ENDPOINTS MUST USE SAFE_DB FUNCTIONS:**

```python
# ✅ CORRECT Pattern:
user = safe_get_user_by_id(db, user_id)
if safe_check_user_exists(db, username, email):
success = safe_update_user(db, user_id, updates)

# ❌ NEVER USE: 
# db.query(User).filter(...) - Will break in production!
```

---

## 🔄 Complete API Endpoints

### Authentication Routes (`/api/auth/`)
- `POST /login` - User login (returns JWT)
- `POST /register` - User registration  
- `POST /forgot-password` - Password reset
- `GET /me` - Get current user info

### User Management Routes (`/api/users/`)
- `GET /` - List all users (Admin+)
- `POST /` - Create user (Admin+)
- `GET /{user_id}` - Get specific user (Admin+)
- `PUT /{user_id}` - Update user (Admin+)
- `DELETE /{user_id}` - Delete user (SuperAdmin only)
- `GET /debug/schema` - Check database schema (SuperAdmin only)

---

## 🛠️ Development vs Production Differences

### Database Schema Differences
| Column | Development | Production | Solution |
|--------|-------------|------------|----------|
| `employee_code` | ✅ Exists | ❌ Missing | Use raw SQL, avoid in SELECT |
| `department` | ✅ Exists | ❌ Missing | Use raw SQL, avoid in SELECT |
| `position` | ✅ Exists | ❌ Missing | Use raw SQL, avoid in SELECT |
| Core fields | ✅ Match | ✅ Match | Safe to use in both |

### Core Fields (Safe everywhere):
- `id`, `username`, `email`, `hashed_password`
- `role`, `is_active`, `created_at`, `last_login`

---

## 🚨 Common Failure Patterns & Solutions

### 1. Authentication Fails
**Symptoms:** Users can't login, 401 errors
**Cause:** `auth.py` trying to use User model instead of safe functions
**Solution:**
```python
# In get_current_user():
user = safe_get_user_by_username(db, username)  # ✅ 
# NOT: user = db.query(User).filter(...).first()  # ❌
```

### 2. User Management CRUD Broken
**Symptoms:** Can list users but can't create/update/delete
**Cause:** Missing endpoints or not using safe functions
**Solution:** Ensure all endpoints in `users.py` use safe_db functions

### 3. Syntax Errors in users.py
**Symptoms:** `SyntaxError: invalid syntax` on server start
**Cause:** Corrupted file from bad edits
**Solution:** Replace with clean version from this documentation

### 4. Database Column Errors
**Symptoms:** `column "employee_code" does not exist`
**Cause:** Using SQLAlchemy models directly
**Solution:** Use raw SQL queries in safe_db.py functions

---

## 🎯 Role-Based Access Control

### User Hierarchy:
1. **SuperAdmin** - Full system control, user management, deletions
2. **Admin** - User management, cannot delete users
3. **HR** - Basic user viewing, limited management
4. **User** - Basic access only

### Permission Matrix:
| Action | SuperAdmin | Admin | HR | User |
|--------|------------|-------|----|----|
| View Users | ✅ | ✅ | ✅ | ❌ |
| Create Users | ✅ | ✅ | ❌ | ❌ |
| Update Users | ✅ | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ |
| Debug Schema | ✅ | ❌ | ❌ | ❌ |

---

## 🔧 Emergency Fixes Checklist

### When Authentication Breaks:
1. Check `app/auth.py` uses `safe_get_user_by_username()`
2. Verify JWT_SECRET_KEY is set
3. Test login endpoint directly

### When User Management Breaks:
1. Check all `users.py` endpoints use safe_db functions
2. Verify imports are correct
3. Test individual endpoints in API docs

### When Server Won't Start:
1. Check for syntax errors in Python files
2. Run: `python -c "from routers.users import router"`
3. Check Railway deployment logs

---

## 📱 Testing Endpoints

### Development:
```bash
# Start backend
cd backend && uvicorn main:app --reload --port 8000

# Test endpoints
curl -X GET "http://localhost:8000/api/users/debug/schema" -H "Authorization: Bearer {token}"
```

### Production:
- API Docs: https://sme-management-system-production.up.railway.app/docs
- Frontend: https://sme-management-frontend-production.up.railway.app

---

## 🎯 Deployment Process

### Backend (Railway):
1. Push to GitHub main branch
2. Railway auto-deploys from GitHub
3. Check deployment logs for errors
4. Test API endpoints

### Frontend (Railway):
1. Push to GitHub main branch  
2. Railway auto-builds Vite app
3. Check frontend connects to backend
4. Test user login flow

---

## 💡 Key Learnings

1. **Database compatibility is critical** - Different schemas between environments
2. **Raw SQL > SQLAlchemy models** - For compatibility across schema versions
3. **Centralized safe functions** - Prevent "fix one, break another" issues
4. **Proper error handling** - Using HTTPException correctly
5. **Role-based security** - Proper authorization decorators

---

## 📝 Quick Reference

### Most Important Files:
1. `backend/app/safe_db.py` - Database compatibility layer
2. `backend/app/auth.py` - Authentication system
3. `backend/routers/users.py` - User management API
4. `frontend/src/lib/api.js` - Frontend API client

### Emergency Contacts:
- **Frontend URL:** https://sme-management-frontend-production.up.railway.app
- **Backend API:** https://sme-management-system-production.up.railway.app
- **API Docs:** https://sme-management-system-production.up.railway.app/docs

---

## 🎉 Success Criteria

When everything works correctly:
- ✅ SuperAdmin can login successfully
- ✅ User Management page loads user list
- ✅ Create new HR users works
- ✅ Update/Delete users functions properly
- ✅ No authentication or database errors
- ✅ Backend server starts without syntax errors

---

**Last Updated:** August 12, 2025
**Status:** 🟢 All systems operational
**Next Review:** When adding new features or encountering issues
