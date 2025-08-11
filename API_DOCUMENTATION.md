# 🔄 SME Management System - API Documentation
**Generated**: August 11, 2025  
**Version**: 2.0 (HR Employee Management)
**Base URL**: `http://localhost:8000` (Development) | `https://your-railway-app.railway.app` (Production)

---

## 🔐 Authentication

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "351e5701-6547-4259-9954-dcdc246dd69c",
    "username": "admin",
    "email": "admin@sme.local",
    "role": "superadmin",
    "is_active": true
  },
  "expires_in": 3600
}
```

### Get Current User
```bash
GET /auth/me
Authorization: Bearer {access_token}

Response 200:
{
  "id": "351e5701-6547-4259-9954-dcdc246dd69c",
  "username": "admin",
  "email": "admin@sme.local",
  "role": "superadmin",
  "is_active": true,
  "created_at": "2025-08-11T01:45:05.847155",
  "employee_code": null,
  "department": null,
  "position": null,
  "hire_date": null,
  "phone": null,
  "address": null
}
```

---

## 👨‍💼 Employee Management (Admin Only)

### Create Employee
```bash
POST /api/employees/
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "emp_code": "EMP001",
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "email": "somchai@sme.local", 
  "department": "IT",
  "position": "Software Developer",
  "employment_type": "full_time",
  "salary_base": 35000,
  "contact_phone": "081-234-5678"
}

Response 201:
{
  "employee_id": 1,
  "emp_code": "EMP001",
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "position": "Software Developer",
  "department": "IT",
  "start_date": null,
  "employment_type": "full_time",
  "salary_base": 35000.0,
  "contact_phone": "081-234-5678",
  "active_status": true,
  "user_id": null
}
```

### Get All Employees
```bash
GET /api/employees/
Authorization: Bearer {admin_token}

# Optional Query Parameters:
# ?department=IT
# ?search=EMP001
# ?employment_type=full_time
# ?active_status=true

Response 200:
[
  {
    "employee_id": 1,
    "emp_code": "EMP001",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "position": "Senior Software Developer",
    "department": "IT",
    "start_date": null,
    "employment_type": "full_time",
    "salary_base": 45000.0,
    "contact_phone": "081-234-5678",
    "active_status": true,
    "user_id": null
  }
]
```

### Get Employee by ID
```bash
GET /api/employees/{employee_id}
Authorization: Bearer {admin_token}

Response 200:
{
  "employee_id": 1,
  "emp_code": "EMP001",
  "first_name": "สมชาย", 
  "last_name": "ใจดี",
  "position": "Senior Software Developer",
  "department": "IT",
  "start_date": null,
  "employment_type": "full_time", 
  "salary_base": 45000.0,
  "contact_phone": "081-234-5678",
  "active_status": true,
  "user_id": null
}
```

### Update Employee
```bash
PATCH /api/employees/{employee_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "position": "Senior Software Developer",
  "salary_base": 45000,
  "contact_phone": "081-234-5678"
}

Response 200:
{
  "employee_id": 1,
  "emp_code": "EMP001",
  "first_name": "สมชาย",
  "last_name": "ใจดี", 
  "position": "Senior Software Developer",
  "department": "IT",
  "start_date": null,
  "employment_type": "full_time",
  "salary_base": 45000.0,
  "contact_phone": "081-234-5678",
  "active_status": true,
  "user_id": null
}
```

### Delete Employee
```bash
DELETE /api/employees/{employee_id}
Authorization: Bearer {admin_token}

Response 200:
{
  "message": "Employee deleted"
}
```

---

## 🛠️ System Endpoints

### Health Check
```bash
GET /health

Response 200:
{
  "status": "degraded",
  "message": "Auth system is running", 
  "timestamp": "2025-08-11T22:44:48.115668",
  "version": "1.0.0",
  "database": "disconnected",
  "modules": null
}
```

### API Documentation
```bash
GET /docs
# Interactive Swagger UI documentation

GET /openapi.json  
# OpenAPI 3.0 specification
```

---

## 📝 Data Models

### Employee Schema
```typescript
interface Employee {
  employee_id: number;          // Primary key
  emp_code: string;            // Unique employee code (e.g. "EMP001")
  first_name: string;          // First name (supports Unicode/Thai)
  last_name: string;           // Last name (supports Unicode/Thai)
  position: string | null;     // Job position
  department: string | null;   // Department name
  start_date: string | null;   // Start date (ISO format)
  employment_type: string;     // "full_time" | "part_time" | "contract"
  salary_base: number | null;  // Base salary amount
  contact_phone: string | null; // Phone number
  active_status: boolean;      // Active/inactive status
  user_id: string | null;      // Link to users table (optional)
}
```

### User Schema  
```typescript
interface User {
  id: string;                  // UUID primary key
  username: string;            // Unique username
  email: string;               // Email address
  role: string;                // "superadmin" | "admin" | "user"
  is_active: boolean;          // Account status
  created_at: string;          // Creation timestamp
  employee_code: string | null; // Employee code (if applicable)
  department: string | null;   // Department (if applicable)  
  position: string | null;     // Position (if applicable)
  hire_date: string | null;    // Hire date (if applicable)
  phone: string | null;        // Phone number (if applicable)
  address: string | null;      // Address (if applicable)
}
```

---

## 🔒 Authentication & Authorization

### Required Headers
```bash
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Role-Based Access Control
- **SuperAdmin**: Full system access, can manage all resources
- **Admin**: Can manage employees, users (limited scope)  
- **User**: Read-only access to own profile

### Protected Endpoints
- All `/api/employees/*` endpoints require Admin role or higher
- `/api/users/*` endpoints require appropriate role-based access
- Authentication endpoints (`/auth/*`) are public except `/auth/me`

---

## 🧪 Testing Examples

### Complete Employee Lifecycle Test
```bash
# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | \
  python3 -c "import json, sys; print(json.load(sys.stdin)['access_token'])")

# 2. Create Employee  
curl -X POST "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emp_code": "EMP001",
    "first_name": "สมชาย",
    "last_name": "ใจดี",
    "department": "IT", 
    "position": "Software Developer",
    "employment_type": "full_time",
    "salary_base": 35000
  }'

# 3. Get All Employees
curl -X GET "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer $TOKEN"

# 4. Update Employee
curl -X PATCH "http://localhost:8000/api/employees/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "Senior Software Developer", 
    "salary_base": 45000
  }'

# 5. Delete Employee
curl -X DELETE "http://localhost:8000/api/employees/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created successfully  
- `400` - Bad request / Invalid input
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `422` - Validation error
- `500` - Internal server error

### Error Response Format
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "type": "missing",
      "loc": ["body", "first_name"],
      "msg": "Field required",
      "input": {...}
    }
  ],
  "request_id": "3a8d05db-e196-4c02-bfe3-d9d378988f3e"
}
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Security  
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com  
SMTP_PASSWORD=your-app-password

# Railway (Production)
PORT=8000
```

### Database Connection
```bash
# Local Development
postgresql://postgres:smepass123@localhost:5432/sme_management_dev

# Production (Railway)
postgresql://postgres:TYWlnCcsPDIephEWIHxiKgxaEFpddIqN@switchyard.proxy.rlwy.net:11181/railway
```

---

*Documentation last updated: August 11, 2025*  
*API Version: 2.0*  
*System Status: Fully Functional ✅*
