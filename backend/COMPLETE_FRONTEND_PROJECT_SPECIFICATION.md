# 🎯 Complete Frontend Project Specification - Authentication & User Management System

## 📋 **Project Overview**

**Project**: Frontend ระบบ Auth & User Management สำหรับ Manus  
**Backend**: ✅ Production Ready - https://web-production-5b6ab.up.railway.app  
**Framework**: React (SPA - Single Page Application)  
**Authentication**: JWT-based with Role-based Access Control  

---

## 🔗 **Backend Integration**

### **Production API:**
- **Base URL**: https://web-production-5b6ab.up.railway.app
- **API Documentation**: https://web-production-5b6ab.up.railway.app/docs
- **Status**: ✅ Production Ready with Security Grade A

### **Available Test Accounts:**
```json
{
  "superadmin": {
    "username": "superadmin",
    "password": "superadmin123",
    "role": "superadmin"
  },
  "admin1": {
    "username": "admin1", 
    "password": "admin123",
    "role": "admin"
  },
  "admin2": {
    "username": "admin2",
    "password": "admin123",
    "role": "admin"
  }
}
```

**Note**: user1/user123 account needs to be created via API or admin interface

---

## 👥 **User Roles & Permissions**

### **1. Super Admin (สิทธิ์สูงสุด)**
- ✅ เห็นเมนู: Dashboard, User Management, Village, Analytics, System
- ✅ User Management: CRUD ได้ทุก role (superadmin, admin, user)
- ✅ จัดการผู้ใช้ทุกระดับ
- ✅ เข้าถึงข้อมูลระบบทั้งหมด

### **2. Admin (สิทธิ์รองลงมา)**
- ✅ เห็นเมนู: Dashboard, User Management (จำกัดเฉพาะ user role "user")
- ❌ ไม่สามารถแก้ไข/ลบ superadmin/admin คนอื่นได้
- ⚠️ ปุ่ม action (edit, delete, block) ของ superadmin/admin จะ dim/disable
- ✅ จัดการ user ธรรมดาได้

### **3. User (ผู้ใช้ทั่วไป)**
- ✅ ดู/แก้ไขข้อมูลตัวเอง (profile, password)
- ❌ ไม่มีสิทธิ์เห็น user management
- ❌ ไม่สามารถจัดการผู้ใช้คนอื่น

---

## 🔄 **User Flow & UX Workflow**

### **1. Login Process**
```
1. หน้า Login → รับ username/password
2. POST /auth/login
3. Success: รับ JWT + decode role
4. Fail: แสดง "ชื่อผู้ใช้หรือรหัสผ่านผิด"
```

### **2. Post-Login Redirect**
```
1. GET /auth/me → ดึง user info + role
2. Redirect ตาม role:
   - superadmin → Super Admin Dashboard
   - admin → Admin Dashboard  
   - user → User Dashboard (profile เท่านั้น)
```

### **3. Route Guard**
```
- ทุกหน้า dashboard ต้องมี route guard
- เช็ค JWT + role
- JWT หมดอายุ → กลับ login
- Role ไม่ตรง → redirect/error
```

### **4. Logout Process**
```
1. Clear JWT from storage
2. Redirect to login page
```

---

## 🎨 **UI/UX Requirements**

### **Login Page**
- ✅ Responsive design (มือถือ/PC)
- ✅ Modern, clean interface
- ✅ Error state handling
- ✅ Loading states

### **Dashboard Layout**
- ✅ Sidebar/Menu (Collapsible, responsive)
- ✅ Card stats
- ✅ Quick Actions
- ✅ Data tables

### **User Management Table**
- ✅ **Superadmin**: เห็น/จัดการทุกคน
- ⚠️ **Admin**: เห็นทุกคน แต่ปุ่ม action ของ superadmin/admin = disable
- ✅ ปุ่ม CRUD (Add/Edit/Delete/Block/Unblock)
- ✅ Modal ยืนยันก่อนดำเนินการ
- ✅ Tooltip บนปุ่ม disabled ("You don't have permission")

### **Profile Page**
- ✅ User/admin แก้ข้อมูลตัวเอง
- ✅ เปลี่ยนรหัสผ่าน
- ✅ Form validation

---

## 📡 **API Integration Specifications**

### **Authentication APIs**
```javascript
// Login
POST /auth/login
Body: { "username": "string", "password": "string" }
Response: { "access_token": "jwt", "token_type": "bearer", "expires_in": 3600, "user": {...} }

// Get current user
GET /auth/me
Headers: { "Authorization": "Bearer <jwt>" }
Response: { "id": "uuid", "username": "string", "role": "string", ... }
```

### **User Management APIs (ต้องสร้างเพิ่ม)**
```javascript
// List users
GET /users
Headers: { "Authorization": "Bearer <jwt>" }
Response: [{ "id": "uuid", "username": "string", "role": "string", ... }]

// Create user
POST /users
Headers: { "Authorization": "Bearer <jwt>" }
Body: { "username": "string", "password": "string", "email": "string", "role": "string" }

// Update user
PUT /users/:id
Headers: { "Authorization": "Bearer <jwt>" }
Body: { "username": "string", "email": "string", "role": "string" }

// Delete user
DELETE /users/:id
Headers: { "Authorization": "Bearer <jwt>" }

// Block/Unblock user
PATCH /users/:id
Headers: { "Authorization": "Bearer <jwt>" }
Body: { "is_active": boolean }
```

**⚠️ Note**: User Management APIs ยังไม่ได้ implement ใน backend - ต้องสร้างเพิ่ม

---

## 🛡️ **Security Requirements**

### **Frontend Security**
- ✅ JWT auth ทุก request หลัง login
- ✅ Session guard (JWT expired → logout อัตโนมัติ)
- ✅ Role-based access control
- ✅ Error state ชัดเจน (403, session timeout, API error)

### **Backend Security (Already Implemented)**
- ✅ Rate limiting (5 requests/minute for auth)
- ✅ Security headers (HSTS, CSP, X-Frame-Options)
- ✅ CORS policy configured
- ✅ Request ID tracking
- ✅ Input validation

---

## 🔧 **Technical Requirements**

### **Framework & Libraries**
```json
{
  "framework": "React 18+",
  "routing": "React Router v6",
  "state_management": "Context API or Redux Toolkit",
  "http_client": "Axios",
  "ui_framework": "Material-UI, Ant Design, or Tailwind CSS",
  "form_handling": "React Hook Form + Yup validation",
  "notifications": "React Toastify"
}
```

### **Project Structure**
```
src/
├── components/
│   ├── common/
│   ├── auth/
│   └── dashboard/
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── UserManagement.jsx
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── services/
│   └── api.js
├── utils/
│   ├── auth.js
│   └── constants.js
└── App.jsx
```

### **Key Features to Implement**

#### **1. Authentication System**
- Login form with validation
- JWT token management
- Auto-logout on token expiry
- Protected routes

#### **2. Dashboard Components**
- Role-based navigation
- Stats cards
- Quick actions
- Responsive layout

#### **3. User Management**
- User list table
- CRUD operations
- Role-based permissions
- Search/filter functionality
- Modal confirmations

#### **4. Profile Management**
- User profile editing
- Password change
- Form validation

---

## 🧪 **Testing Requirements**

### **Test Scenarios**
1. **Login Flow**: ทดสอบกับ 3 test accounts
2. **Role Permissions**: ยืนยัน access control ทุก role
3. **Route Guards**: ทดสอบ unauthorized access
4. **API Integration**: ทดสอบทุก endpoint
5. **Responsive Design**: ทดสอบบนอุปกรณ์ต่างๆ

### **Error Handling**
- Network errors
- API errors (401, 403, 429, 500)
- Form validation errors
- Session timeout

---

## 📋 **Deliverables Checklist**

### **Code & Documentation**
- [ ] Source code (GitHub repository)
- [ ] README.md with setup instructions
- [ ] Environment configuration guide
- [ ] API integration documentation

### **Deployment**
- [ ] Production build
- [ ] Deployment guide
- [ ] Live demo URL (if possible)

### **Testing & Demo**
- [ ] Screenshot ทุกฟีเจอร์
- [ ] Short demo video
- [ ] Test results with all 3 user roles
- [ ] Responsive design verification

### **Quality Assurance**
- [ ] Code review checklist
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Security best practices

---

## ⚠️ **Known Backend Limitations**

### **Missing APIs (ต้องสร้างเพิ่ม)**
1. **GET /users** - List all users
2. **POST /users** - Create new user
3. **PUT /users/:id** - Update user
4. **DELETE /users/:id** - Delete user
5. **PATCH /users/:id** - Block/unblock user

### **Missing Test Account**
- **user1/user123** - ต้องสร้างผ่าน admin interface

---

## 🚀 **Development Phases**

### **Phase 1: Authentication (Week 1)**
- Login page
- JWT handling
- Route guards
- Basic dashboard

### **Phase 2: User Management (Week 2)**
- User list table
- CRUD operations
- Role-based permissions
- Backend API extensions

### **Phase 3: Polish & Testing (Week 3)**
- UI/UX refinements
- Error handling
- Testing & debugging
- Documentation

---

## 📞 **Support & Resources**

**Backend API**: https://web-production-5b6ab.up.railway.app  
**API Documentation**: https://web-production-5b6ab.up.railway.app/docs  
**Test Accounts**: superadmin/superadmin123, admin1/admin123, admin2/admin123  

**Status**: ✅ Backend ready, Frontend specifications complete  
**Next Step**: Begin React development with authentication flow

---

*This specification provides complete requirements for frontend development. Backend is production-ready and waiting for frontend integration.*

