# SME Management System – Simplified Role & Dashboard Structure

## 1. Core Role Structure (เริ่มต้นเพื่อง่ายต่อการพัฒนา)
แต่ละ Role จะมี Dashboard เป็นของตัวเอง และสามารถเพิ่ม Feature ได้ตามต้องการ

| Role         | ชื่อไทย            | Level | Dashboard Route       | Dashboard Name      |
|--------------|------------------ |-------|----------------------|---------------------|
| superadmin   | ผู้ดูแลระบบสูงสุด    | 4     | `/superadmin`        | SuperAdmin Console  |
| system_admin | ผู้ดูแลระบบ        | 3     | `/system_admin`      | System Admin Dashboard |
| hr           | HR Manager        | 2     | `/hr`                | HR Dashboard        |
| employee     | พนักงานทั่วไป      | 1     | `/employee`          | Employee Portal     |

## 1.1 Extended Roles (ขยายภายหลังตามต้องการ)

| Role         | ชื่อไทย            | Level | Dashboard Route       | Dashboard Name      |
|--------------|------------------ |-------|----------------------|---------------------|
| manager      | ผู้จัดการ          | 2.5   | `/manager`           | Manager Dashboard   |
| supervisor   | หัวหน้างาน         | 1.5   | `/supervisor`        | Supervisor Panel    |
| accounting   | เจ้าหน้าที่บัญชี     | 2     | `/accounting`        | Finance Dashboard   |
| purchasing   | เจ้าหน้าที่จัดซื้อ    | 2     | `/purchasing`        | Procurement Panel   |
| engineer     | วิศวกร            | 2     | `/engineer`          | Engineer Workspace  |

---

## 2. Dashboard Structure (แต่ละ Role มี Dashboard เป็นของตัวเอง)

### 2.1 SuperAdmin Console (`/superadmin`)
**เป้าหมาย:** จัดการระบบทั้งหมด
**Feature List:**
- ✅ User Management (จัดการผู้ใช้ทั้งหมด)
- ✅ Role & Permission Management 
- 🔧 System Settings (การตั้งค่าระบบ)
- 📊 Analytics & Reports (ข้อมูลวิเคราะห์)
- 📋 System Logs (บันทึกกิจกรรม)
- 🔧 Database Management (จัดการฐานข้อมูล)

### 2.2 System Admin Dashboard (`/system_admin`) 
**เป้าหมาย:** จัดการองค์กรและผู้ใช้
**Feature List:**
- ✅ User Management (จัดการผู้ใช้ในระดับ system_admin ลงมา)
- ✅ Employee Management (จัดการข้อมูลพนักงาน)
- 🔧 Department Management (จัดการแผนก)
- 📊 Company Reports (รายงานองค์กร)
- ⚙️ System Configuration (การตั้งค่าระบบ)
- 🔧 Backup & Maintenance (การสำรองข้อมูล)

### 2.3 HR Dashboard (`/hr`)
**เป้าหมาย:** จัดการพนักงานและ HR Functions
**Feature List:**
- ✅ Employee Management (จัดการข้อมูลพนักงาน)
- 🔧 Leave Management (ระบบใบลา)
- 🔧 Attendance Management (ระบบลงเวลา)
- 🔧 Payroll Management (ระบบเงินเดือน)
- 🔧 Benefits Management (ระบบสวัสดิการ)
- 📊 HR Reports (รายงาน HR)
- 🔧 Recruitment (ระบบสรรหา)

### 2.4 Employee Portal (`/employee`)
**เป้าหมาย:** พนักงานจัดการข้อมูลส่วนตัว
**Feature List:**
- ✅ My Profile (ข้อมูลส่วนตัว)
- 🔧 Leave Request (ขอใบลา)
- 🔧 Time Clock (ลงเวลาทำงาน)
- 🔧 Payslip (ใบเงินเดือน)
- 🔧 Benefits Info (ข้อมูลสวัสดิการ)
- 🔧 Training Records (บันทึกการอบรม)

### 2.5 Manager Dashboard (`/manager`) - ขยายภายหลัง
**เป้าหมาย:** จัดการทีมและอนุมัติงาน
**Feature List:**
- 🔧 Team Management (จัดการทีมงาน)
- 🔧 Leave Approval (อนุมัติใบลา)
- 🔧 Performance Review (ประเมินผลงาน)
- 🔧 Task Assignment (มอบหมายงาน)
- 📊 Team Reports (รายงานทีม)

### 2.6 Accounting Dashboard (`/accounting`) - ขยายภายหลัง
**เป้าหมาย:** จัดการการเงินและบัญชี
**Feature List:**
- 🔧 Financial Management (จัดการการเงิน)
- 🔧 Expense Management (จัดการค่าใช้จ่าย)
- 🔧 Invoice Management (จัดการใบแจ้งหนี้)
- 📊 Financial Reports (รายงานการเงิน)

---

## 3. Development Phase Plan

### 🚀 Phase 1: Core System (MVP)
**Roles:** `superadmin`, `system_admin`, `hr`, `employee`
**Priority Features:**
- ✅ Authentication & Authorization System
- ✅ User Management (SuperAdmin)
- ✅ Employee Management (HR)
- ✅ Basic Profile Management (Employee)
- 🔧 Simple Dashboard for each role

### 🔧 Phase 2: Extended Features  
**เพิ่ม Features ใน Dashboard เดิม:**
- HR: Leave Management, Attendance System
- System Admin: Department Management, Reports
- Employee: Leave Request, Time Clock

### 📈 Phase 3: Additional Roles
**เพิ่ม Roles:** `manager`, `accounting`
**Features:**
- Manager Dashboard with Team Management
- Accounting Dashboard with Financial Tools

### 🎯 Phase 4: Specialized Modules
**เพิ่ม Roles ตามความต้องการ:** `supervisor`, `purchasing`, `engineer`

---

## 4. Simple Permission Matrix

| Feature                 | superadmin | system_admin | hr    | employee |
|-------------------------|------------|--------------|-------|----------|
| User Management         | ✅         | ⚠️           | ❌    | ❌       |
| Employee Management     | ✅         | ✅           | ✅    | ❌       |
| Profile Management      | ✅         | ✅           | ⚠️    | ✅       |
| System Settings         | ✅         | ⚠️           | ❌    | ❌       |

**หมายเหตุ:**
- ✅ = เข้าถึงได้เต็มที่
- ⚠️ = เข้าถึงได้บางส่วนหรือเฉพาะข้อมูลของตัวเอง  
- ❌ = เข้าถึงไม่ได้

---

## 5. Technical Implementation Guide

### 5.1 Frontend Route Structure
```javascript
// Router Configuration
const routes = {
  '/superadmin/*': SuperAdminDashboard,
  '/system_admin/*': SystemAdminDashboard, 
  '/hr/*': HRDashboard,
  '/employee/*': EmployeeDashboard,
  
  // Extended Routes (Phase 3+)
  '/manager/*': ManagerDashboard,
  '/accounting/*': AccountingDashboard
}
```

### 5.2 Dashboard Component Structure
```
src/
├── features/
│   ├── superadmin-dashboard/
│   │   ├── pages/
│   │   ├── components/
│   │   └── index.js
│   ├── system-admin-dashboard/
│   ├── hr-dashboard/
│   └── employee-dashboard/
└── shared/
    └── components/
```

### 5.3 Feature Development Strategy
1. **แต่ละ Dashboard = แต่ละ Feature Folder**
2. **เริ่มจากฟีเจอร์พื้นฐาน แล้วค่อยเพิ่ม**
3. **Shared Components สำหรับฟีเจอร์ที่ใช้ร่วมกัน**
4. **Permission-based Component Rendering**

---

## 6. Next Steps
1. ✅ **เก็บ Role ปัจจุบัน:** `["superadmin", "system_admin", "hr", "employee"]`
2. 🔧 **พัฒนา Dashboard พื้นฐานของแต่ละ Role**
3. 🔧 **เพิ่ม Feature ทีละตัวตามความต้องการ**
4. 📈 **ขยาย Role เพิ่มเติมเมื่อจำเป็น**

**สัญลักษณ์:**
- ✅ = เสร็จแล้ว
- 🔧 = กำลังพัฒนา/แผนพัฒนา
- 📊 = Reports/Analytics
- ⚙️ = Configuration/Settings
