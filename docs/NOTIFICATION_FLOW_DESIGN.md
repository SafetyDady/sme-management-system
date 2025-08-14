# Notification System for User-Employee Assignment

## 🔔 Notification Flow Overview

### **Phase 1: Employee Added by HR**
```
HR adds Employee → System generates notifications:
├── 📧 Email to System Admin(s)
├── 🔔 In-app notification to System Admin(s)  
├── 📊 Dashboard badge counter update
└── 📝 Audit log entry
```

### **Phase 2: User Account Created by System Admin**
```
System Admin creates User → System generates notifications:
├── 📧 Welcome email to Employee (with login credentials)
├── 📧 Confirmation email to HR (assignment completed)
├── 🔔 In-app notification to HR
└── 📝 Audit log entry
```

## 📧 Email Templates Design

### **1. System Admin Notification Email**
```
Subject: 🆕 New Employee Requires User Account Assignment

Dear System Administrator,

A new employee has been added to the system and requires a user account:

Employee Details:
• Name: [First Name] [Last Name]
• Position: [Position]
• Department: [Department]
• Added by: [HR Manager Name]
• Date Added: [Date]

Action Required:
Please log in to the system to assign a user account and appropriate role.

🔗 Direct Link: [System URL]/system-admin/pending-assignments

Best regards,
SME Management System
```

### **2. Employee Welcome Email**
```
Subject: 🎉 Welcome to SME Management System - Your Account is Ready!

Dear [Employee Name],

Welcome to our organization! Your system account has been created.

Login Credentials:
• Username: [username]
• Temporary Password: [generated_password]
• System URL: [System URL]

Important Notes:
• Please change your password on first login
• Your role: [role_display_name]
• Contact IT support if you need assistance

Next Steps:
1. Click the login link above
2. Enter your credentials
3. Change your password
4. Complete your profile

Welcome aboard!
Best regards,
HR Department
```

### **3. HR Confirmation Email**
```
Subject: ✅ User Account Assigned - [Employee Name]

Dear HR Manager,

The user account assignment has been completed:

Employee: [First Name] [Last Name]
User Account: [username] 
Role Assigned: [role_display_name]
Assigned by: [System Admin Name]
Date Completed: [Date]

The employee has been notified via email with login instructions.

Best regards,
SME Management System
```

## 🔔 In-App Notification System

### **Notification Types:**
```typescript
interface Notification {
  id: string;
  type: 'employee_added' | 'user_assigned' | 'assignment_completed';
  recipient_role: 'system_admin' | 'hr' | 'superadmin';
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: DateTime;
  employee_id?: number;
  user_id?: number;
}
```

### **Dashboard Integration:**
```jsx
// System Admin Dashboard
<NotificationBadge count={pendingAssignments} />
<PendingAssignmentsList />

// HR Dashboard  
<NotificationBadge count={recentActivity} />
<AssignmentStatusList />
```

## 🚀 Implementation Plan

### **Backend Components:**

#### **1. Notification Service**
```python
# /backend/services/notification_service.py
class NotificationService:
    def notify_employee_added(employee_id: int, hr_user_id: int):
        # Send email to system admins
        # Create in-app notifications
        # Update dashboard counters
        
    def notify_user_assigned(employee_id: int, user_id: int, admin_user_id: int):
        # Send welcome email to employee
        # Send confirmation email to HR
        # Create in-app notifications
```

#### **2. Email Service Enhancement**
```python
# /backend/services/email_service.py
class EmailTemplates:
    SYSTEM_ADMIN_NOTIFICATION = "employee_assignment_required"
    EMPLOYEE_WELCOME = "employee_welcome"
    HR_ASSIGNMENT_CONFIRMATION = "assignment_completed"
    
def send_template_email(template: str, recipient: str, data: dict):
    # Load template
    # Replace variables
    # Send email
```

#### **3. Database Schema Updates**
```sql
-- Add notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    recipient_user_id INT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    employee_id INT REFERENCES hr_employees(id),
    user_id INT REFERENCES users(id)
);

-- Add email log table
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    employee_id INT REFERENCES hr_employees(id),
    user_id INT REFERENCES users(id)
);
```

### **Frontend Components:**

#### **1. Notification Component**
```jsx
// /frontend/src/components/notifications/NotificationBell.jsx
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  return (
    <div className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2">
          {unreadCount}
        </Badge>
      )}
    </div>
  );
};
```

#### **2. Pending Assignments View**
```jsx
// /frontend/src/features/system-admin/PendingAssignments.jsx
const PendingAssignments = () => {
  const [pendingEmployees, setPendingEmployees] = useState([]);
  
  return (
    <div className="space-y-4">
      <h2>🔔 Pending User Assignments ({pendingEmployees.length})</h2>
      {pendingEmployees.map(employee => (
        <AssignmentCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};
```

## ⚙️ Configuration Settings

### **Email Configuration:**
```python
# /backend/config/notification_settings.py
NOTIFICATION_SETTINGS = {
    "email": {
        "enabled": True,
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "use_tls": True,
        "templates_dir": "./email_templates"
    },
    "in_app": {
        "enabled": True,
        "retention_days": 30
    },
    "recipients": {
        "system_admin_notifications": ["admin@company.com"],
        "hr_notifications": ["hr@company.com"]
    }
}
```

### **Template Variables:**
```python
TEMPLATE_VARIABLES = {
    "employee_name": "employee.first_name + ' ' + employee.last_name",
    "position": "employee.position",
    "department": "employee.department", 
    "hr_manager": "hr_user.username",
    "system_admin": "admin_user.username",
    "login_url": "frontend_url + '/login'",
    "assignment_url": "frontend_url + '/system-admin/assignments'"
}
```

## 📊 Dashboard Enhancements

### **System Admin Dashboard:**
```
┌─ Pending Assignments ────────────────┐
│ 🔔 3 New Employees Need User Accounts │
│                                      │
│ • John Doe (Developer, IT)           │
│ • Jane Smith (Analyst, Finance)      │  
│ • Bob Johnson (Manager, Sales)       │
│                                      │
│ [View All Pending] [Assign Users]    │
└──────────────────────────────────────┘
```

### **HR Dashboard:**
```
┌─ Assignment Status ───────────────────┐
│ 📊 Employee Account Status            │
│                                      │
│ ✅ Active: 45 employees              │
│ ⏳ Pending: 3 employees              │
│ ❌ Inactive: 2 employees             │
│                                      │
│ [View Details] [Request Assignment]  │
└──────────────────────────────────────┘
```

## 🔒 Security & Privacy

### **Email Security:**
- ✅ Use secure SMTP with TLS
- ✅ Never include actual passwords in emails
- ✅ Use temporary password generation
- ✅ Include password reset instructions

### **Notification Privacy:**
- ✅ Only authorized roles see relevant notifications
- ✅ Sensitive data masked in notifications
- ✅ Audit trail for all notifications sent

## 📈 Analytics & Monitoring

### **Metrics to Track:**
```
- Average time from Employee creation to User assignment
- Email delivery success rates
- Notification read rates
- Assignment completion rates by System Admin
```

### **Alerts:**
```
- If assignments pending > 24 hours
- If email delivery fails
- If multiple failed login attempts after account creation
```

---

## 🎯 Next Steps for Implementation:

1. **✅ Approve Notification Flow Design**
2. **🔧 Set up Email Service (SMTP configuration)**  
3. **💾 Create Database Tables (notifications, email_logs)**
4. **⚡ Build Notification Service**
5. **📱 Create Frontend Notification Components**
6. **🧪 Test End-to-End Notification Flow**

**คิดว่า Flow นี้ครอบคลุมความต้องการไหมครับ? หรือมีส่วนไหนที่ต้องปรับเพิ่มเติม?** 🤔
