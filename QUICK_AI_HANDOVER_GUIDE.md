# 🚀 Quick AI Session Handover Guide
**Emergency Reference for New AI Sessions**

---

## ⚡ **IMMEDIATE STATUS CHECK**

### **Production Health Check**
```bash
curl https://sme-management-system-production.up.railway.app/health
# Expected: {"status": "healthy"}
```

### **Admin Login Test**
```bash
curl -X POST https://sme-management-system-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: {"access_token":"...", "user":{...}}
```

---

## 🔧 **CRITICAL FILES & LOCATIONS**

```
📂 BACKEND KEY FILES:
/home/safety/sme-management/backend/main.py          # FastAPI app
/home/safety/sme-management/backend/app/models.py   # CLEAN USER MODEL
/home/safety/sme-management/backend/app/schemas.py  # Pydantic schemas

📂 FRONTEND KEY FILES:
/home/safety/sme-management/frontend/src/lib/api.js  # API endpoints

📂 DOCUMENTATION:
/home/safety/sme-management/MASTER_PROJECT_DOCUMENTATION.md  # Master doc
```

---

## 🏗️ **ARCHITECTURE SUMMARY**

### **CLEAN USER MODEL** (Option A Applied)
```python
# users table - AUTH ONLY
class User(Base):
    id: int
    username: str
    email: str  
    role: str (superadmin/admin/user)
    is_active: bool
    created_at: datetime
    # NO employee fields (employee_code, department, etc.)

# hr_employees table - HR DATA ONLY  
class HREmployee(Base):
    employee_id: int
    emp_code: str
    first_name: str
    last_name: str
    department: str
    position: str
    employment_type: str
    salary_base: decimal
    # ... other employee fields
```

### **API STRUCTURE**
```
/auth/*      - Authentication endpoints
/users/*     - User management (admin)
/hr/employees/* - HR employee CRUD (admin)
/admin/*     - Debug/troubleshooting
```

---

## ✅ **WHAT'S WORKING (100% Complete)**

1. **Authentication System** - JWT, roles, password reset
2. **User Management** - CRUD operations for users  
3. **HR Employee Management** - Full CRUD with search/filter
4. **Production Deployment** - Railway auto-deploy from main branch
5. **Database** - PostgreSQL with proper migrations

---

## 🚨 **KNOWN ISSUES & FIXES**

### **Recent Fixes Applied (Aug 11, 2025)**
```
✅ FIXED: API endpoint mismatch (/auth/login vs /api/login)
✅ FIXED: Production health check SQL syntax  
✅ FIXED: User model field duplication (Option A)
✅ FIXED: Admin password hash compatibility
```

### **Common Problems**
```
Problem: 405 Method Not Allowed on login
Fix: Use /auth/login endpoint (not /api/login)

Problem: Column 'users.employee_code' not found
Fix: Option A applied - clean User model

Problem: Admin login fails
Fix: POST /admin/reset-admin-password with {"new_password":"admin123"}
```

---

## 🛠️ **QUICK COMMANDS**

### **Development**
```bash
# Start backend
cd /home/safety/sme-management/backend
python -m uvicorn main:app --reload

# Start frontend  
cd /home/safety/sme-management/frontend
npm run dev
```

### **Database**
```bash
cd /home/safety/sme-management/backend
alembic current           # Check migration status
alembic upgrade head      # Apply migrations
```

### **Git Operations**
```bash
cd /home/safety/sme-management
git status
git add .
git commit -m "description"  
git push origin main      # Triggers Railway auto-deploy
```

---

## 📋 **NEXT TASKS (If Needed)**

1. **Frontend Deployment** - Deploy React app to Vercel/Netlify
2. **Phase 3 Planning** - Leave management system design
3. **Testing** - Comprehensive integration testing
4. **Documentation** - API documentation updates

---

## 🎯 **SESSION CONTINUATION STRATEGY**

1. **Always check production status first** (curl health + login)
2. **Read MASTER_PROJECT_DOCUMENTATION.md** for full context
3. **Check recent Git commits** for latest changes
4. **Test admin credentials** before making changes
5. **Use terminal ID 19335** for main operations (cwd: sme-management)

---

*Keep this document updated after each major change or fix.*
