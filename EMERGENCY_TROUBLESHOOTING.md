# 🚨 TROUBLESHOOTING QUICK GUIDE

## Immediate Action Items

### 🔥 Server Won't Start (Syntax Error)
```bash
# Check for syntax errors
cd backend && python -c "from routers.users import router"

# If error, replace users.py with clean version:
# Copy content from COMPLETE_SYSTEM_DOCUMENTATION.md
```

### 🔐 Authentication Broken
**Check:** `backend/app/auth.py` line ~45:
```python
# ✅ MUST BE:
user = safe_get_user_by_username(db, username)

# ❌ NOT:
# user = db.query(User).filter(...).first()
```

### 👥 User Management Not Working
**Check:** `backend/routers/users.py` imports:
```python
from app.safe_db import (
    safe_get_user_by_id, 
    safe_check_user_exists,
    safe_update_user,
    safe_delete_user
)
```

### 🗄️ Database Column Errors
**Error:** `column "employee_code" does not exist`
**Solution:** Use only these columns in production:
```sql
SELECT id, username, email, role, is_active, created_at, last_login FROM users
```

---

## Test Commands

### Backend Syntax Test:
```bash
cd backend
python -c "from main import app; print('Backend OK')"
```

### API Test:
```bash
# Get users list (needs auth token)
curl -X GET "https://sme-management-system-production.up.railway.app/api/users/"
```

---

## Key Files to Never Break:
1. `backend/app/safe_db.py` - Database compatibility
2. `backend/app/auth.py` - Authentication  
3. `backend/routers/users.py` - User management
4. `frontend/src/lib/api.js` - API client

---

## Emergency Contacts:
- **GitHub Repo:** https://github.com/SafetyDady/sme-management-system
- **Frontend:** https://sme-management-frontend-production.up.railway.app
- **Backend:** https://sme-management-system-production.up.railway.app/docs
