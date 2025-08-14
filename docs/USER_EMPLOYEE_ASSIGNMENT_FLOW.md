# User-Employee Assignment Process Flow

## 🎯 Objective
สร้างระบบเชื่อมโยง User Account กับ Employee แบบ One-to-One เพื่อให้การจัดการสิทธิ์เป็นไปอย่างมีระบบ

## 📊 Current State Analysis

### Tables Structure:
- **users**: authentication & authorization (username, email, role, password)
- **hr_employees**: employee information (name, position, department, user_id)

### Current Issues:
1. ❌ Employee record ถูกสร้างโดย HR แต่ไม่มี User Account
2. ❌ System Admin สร้าง User แยกจาก Employee 
3. ❌ ไม่มีการ link ระหว่าง User กับ Employee
4. ❌ ไม่มีการตรวจสอบ duplicate assignment

## 🔄 Proposed Process Flow

### Phase 1: Employee Registration (HR)
```
HR → Add Employee → Employee Record Created (user_id = NULL)
                 → Status: "Pending User Assignment"
```

### Phase 2: User Assignment (System Admin)
```
System Admin → View Unassigned Employees
            → Select Employee 
            → Create/Assign User Account
            → Link User ↔ Employee (One-to-One)
            → Status: "Active with User Access"
```

### Phase 3: Access Control
```
Employee → Login with User Credentials
        → System checks User.role
        → Grant access based on permissions
        → Display Employee-specific data
```

## 🛠️ Implementation Requirements

### 1. Database Enhancements
- ✅ `hr_employees.user_id` already exists (nullable)
- 🔧 Add unique constraint on user_id (prevent duplicate assignments)
- 🔧 Add status field to track assignment state

### 2. Backend API Endpoints
```
GET /api/employees/unassigned     # List employees without user accounts
POST /api/employees/{id}/assign   # Assign user to employee  
DELETE /api/employees/{id}/unassign # Remove user assignment
GET /api/users/available          # List users not assigned to employees
```

### 3. Frontend Components
```
- UnassignedEmployeesView: Show employees needing user accounts
- UserAssignmentModal: UI for assigning users to employees  
- EmployeeUserStatus: Visual indicator of assignment status
- AssignmentHistory: Track who assigned what when
```

### 4. Permission Matrix
```
superadmin: Can assign/unassign any user to any employee
system_admin: Can assign users (except superadmin) to employees
hr: Can view assignment status only
employee: Can view own assignment only
```

## 📱 User Interface Flow

### For HR Dashboard:
```
Employee Management
├── Employee List
│   ├── Status Column: "Has User Account" ✅/❌
│   └── Quick Action: "Request User Assignment"
```

### For System Admin Dashboard:
```
User Management
├── Pending Assignments (Badge with count)
├── Assign User to Employee
│   ├── Select Employee (dropdown/search)
│   ├── Create New User OR Select Existing User
│   └── Assign Role + Link
└── Manage Assignments
    ├── View current assignments
    └── Modify/Remove assignments
```

## 🔐 Security Considerations

### One-to-One Relationship Rules:
- ✅ One User can be assigned to only One Employee
- ✅ One Employee can have only One User
- ✅ Prevent orphaned User accounts
- ✅ Maintain audit trail of assignments

### Role Assignment Logic:
```javascript
const assignUserToEmployee = (userId, employeeId, role) => {
  // 1. Check if employee already has user
  // 2. Check if user already assigned to another employee  
  // 3. Validate role permissions
  // 4. Create link with audit log
  // 5. Update employee status
}
```

## 📈 Benefits

### For HR:
- 📊 Clear visibility of which employees have system access
- 🎯 Easy request process for user account creation
- 📋 Status tracking for all employees

### For System Admin:
- 🔧 Centralized user-employee management
- 🚨 Clear pending assignments dashboard
- ✅ Prevention of duplicate/incorrect assignments

### For Employees:
- 🔑 Single login for all systems
- 👤 Personalized experience with employee data
- 🔒 Appropriate access based on role

## 🚀 Implementation Phases

### Phase 1: Backend Foundation
1. Database schema updates
2. API endpoints for assignment management
3. Validation and constraint enforcement

### Phase 2: Frontend Interface  
1. Unassigned employees view
2. User assignment modal/workflow
3. Status indicators and badges

### Phase 3: Integration & Testing
1. End-to-end assignment flow
2. Permission testing
3. Edge case handling

### Phase 4: Production Deployment
1. Data migration for existing records
2. User training and documentation
3. Monitoring and optimization

## 📝 Next Steps

1. **Review and Approve Process Flow**
2. **Design Database Schema Updates** 
3. **Create API Specifications**
4. **Design UI/UX Mockups**
5. **Begin Implementation**

---
**Created:** August 13, 2025
**Status:** Proposal for Review
**Priority:** High - Critical for complete system integration
