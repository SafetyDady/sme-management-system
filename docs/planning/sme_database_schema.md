# SME Management System - Database Schema Design

## 🎯 หลักการออกแบบ

### 1. รักษา Authentication Schema เดิม
- **ไม่แก้ไข** ตาราง `users` และ `password_reset_tokens`
- **เพิ่มเติม** roles สำหรับ SME business
- **ใช้ Foreign Key** เชื่อมต่อกับ `users.id`

### 2. Modular Design
- แยก schema ตาม business modules
- ใช้ prefix เพื่อจัดกลุ่ม (hr_, project_, inventory_, financial_)
- รองรับการขยายในอนาคต

### 3. Data Integrity
- ใช้ Foreign Keys อย่างเหมาะสม
- ใช้ Constraints สำหรับ business rules
- ใช้ Indexes สำหรับ performance

## 📊 Schema Overview

```
Authentication (Existing)
├── users
└── password_reset_tokens

HR Module
├── hr_employees
├── hr_leave_requests
└── hr_daily_actual

Project Module
├── customers
├── projects
├── project_tasks
└── project_resources

Inventory Module
├── inventory_categories
├── inventory_items
├── inventory_transactions
└── inventory_stock

Financial Module
├── financial_accounts
├── financial_transactions
├── financial_budgets
└── financial_reports
```

## 🔐 Authentication Schema (Existing - ไม่แก้ไข)

### users (Existing)
```sql
-- ตารางนี้มีอยู่แล้ว - ไม่แก้ไข
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- จะเพิ่ม roles ใหม่
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### password_reset_tokens (Existing)
```sql
-- ตารางนี้มีอยู่แล้ว - ไม่แก้ไข
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45)
);
```

### Role Enhancement (เพิ่มเติม)
```sql
-- เพิ่ม roles ใหม่สำหรับ SME
-- ใน application level จะจัดการ roles เหล่านี้:
-- 'superadmin' - ผู้ดูแลระบบ
-- 'owner' - เจ้าของธุรกิจ
-- 'manager' - ผู้จัดการ
-- 'hr' - ฝ่ายบุคคล
-- 'accountant' - ฝ่ายบัญชี
-- 'employee' - พนักงาน
```

## 👥 HR Module Schema

### hr_employees
```sql
CREATE TABLE hr_employees (
    employee_id SERIAL PRIMARY KEY,
    emp_code VARCHAR(20) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id), -- เชื่อมกับ authentication
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    start_date DATE,
    employment_type VARCHAR(20) CHECK (employment_type IN ('monthly', 'daily', 'subcontract', 'freelance')),
    salary_monthly DECIMAL(10,2),
    wage_daily DECIMAL(8,2),
    active_status BOOLEAN DEFAULT true,
    contact_phone VARCHAR(20),
    contact_address TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_hr_employees_emp_code ON hr_employees(emp_code);
CREATE INDEX idx_hr_employees_department ON hr_employees(department);
CREATE INDEX idx_hr_employees_active ON hr_employees(active_status);
CREATE INDEX idx_hr_employees_user_id ON hr_employees(user_id);
```

### hr_leave_requests
```sql
CREATE TABLE hr_leave_requests (
    leave_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES hr_employees(employee_id),
    leave_type VARCHAR(20) CHECK (leave_type IN ('sick', 'personal', 'vacation', 'maternity', 'emergency')),
    leave_date_start DATE NOT NULL,
    leave_date_end DATE NOT NULL,
    leave_days DECIMAL(3,1) NOT NULL,
    reason TEXT,
    submitted_by INTEGER REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_status VARCHAR(10) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    note TEXT
);

-- Indexes
CREATE INDEX idx_leave_employee ON hr_leave_requests(employee_id);
CREATE INDEX idx_leave_status ON hr_leave_requests(approval_status);
CREATE INDEX idx_leave_dates ON hr_leave_requests(leave_date_start, leave_date_end);
```

### hr_daily_actual
```sql
CREATE TABLE hr_daily_actual (
    actual_id SERIAL PRIMARY KEY,
    work_date DATE NOT NULL,
    project_id INTEGER, -- จะเชื่อมกับ projects table ในอนาคต
    task_id INTEGER,
    worker_id INTEGER REFERENCES hr_employees(employee_id),
    normal_hour DECIMAL(4,2) DEFAULT 0,
    ot_hour_1 DECIMAL(4,2) DEFAULT 0, -- OT 1.5x
    ot_hour_2 DECIMAL(4,2) DEFAULT 0, -- OT 2x
    ot_hour_3 DECIMAL(4,2) DEFAULT 0, -- OT 3x
    ci_factor DECIMAL(3,2) DEFAULT 1.0, -- Cost Index factor
    work_type VARCHAR(50),
    submitted_by INTEGER REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_status VARCHAR(10) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    note TEXT
);

-- Indexes
CREATE INDEX idx_daily_actual_date ON hr_daily_actual(work_date);
CREATE INDEX idx_daily_actual_worker ON hr_daily_actual(worker_id);
CREATE INDEX idx_daily_actual_project ON hr_daily_actual(project_id);
CREATE INDEX idx_daily_actual_status ON hr_daily_actual(approval_status);
```

## 🏢 Project Module Schema

### customers
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20),
    customer_type VARCHAR(20) CHECK (customer_type IN ('individual', 'company', 'government')),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- days
    active_status BOOLEAN DEFAULT true,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_customers_name ON customers(customer_name);
CREATE INDEX idx_customers_active ON customers(active_status);
CREATE INDEX idx_customers_type ON customers(customer_type);
```

### projects
```sql
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_code VARCHAR(30) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    customer_id INTEGER REFERENCES customers(customer_id),
    project_type VARCHAR(30),
    project_status VARCHAR(20) CHECK (project_status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    project_manager_id INTEGER REFERENCES hr_employees(employee_id),
    description TEXT,
    location TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_projects_code ON projects(project_code);
CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
```

### project_tasks
```sql
CREATE TABLE project_tasks (
    task_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id),
    task_name VARCHAR(200) NOT NULL,
    task_description TEXT,
    assigned_to INTEGER REFERENCES hr_employees(employee_id),
    task_status VARCHAR(20) CHECK (task_status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2) DEFAULT 0,
    start_date DATE,
    due_date DATE,
    completed_date DATE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX idx_tasks_status ON project_tasks(task_status);
CREATE INDEX idx_tasks_priority ON project_tasks(priority);
```

## 📦 Inventory Module Schema

### inventory_categories
```sql
CREATE TABLE inventory_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) UNIQUE NOT NULL,
    parent_category_id INTEGER REFERENCES inventory_categories(category_id),
    description TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_inventory_categories_code ON inventory_categories(category_code);
CREATE INDEX idx_inventory_categories_parent ON inventory_categories(parent_category_id);
```

### inventory_items
```sql
CREATE TABLE inventory_items (
    item_id SERIAL PRIMARY KEY,
    item_code VARCHAR(30) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES inventory_categories(category_id),
    unit VARCHAR(20) NOT NULL, -- kg, pcs, m, etc.
    unit_cost DECIMAL(10,2),
    reorder_level DECIMAL(10,2) DEFAULT 0,
    max_stock_level DECIMAL(10,2),
    current_stock DECIMAL(10,2) DEFAULT 0,
    item_type VARCHAR(20) CHECK (item_type IN ('material', 'tool', 'consumable', 'equipment')),
    location VARCHAR(100),
    supplier_info TEXT,
    description TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_inventory_items_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_items_type ON inventory_items(item_type);
CREATE INDEX idx_inventory_items_stock ON inventory_items(current_stock);
```

### inventory_transactions
```sql
CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(item_id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    reference_type VARCHAR(20), -- 'purchase', 'project', 'adjustment', etc.
    reference_id INTEGER, -- ID ของเอกสารอ้างอิง
    project_id INTEGER REFERENCES projects(project_id),
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_inventory_trans_item ON inventory_transactions(item_id);
CREATE INDEX idx_inventory_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inventory_trans_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_trans_project ON inventory_transactions(project_id);
```

## 💰 Financial Module Schema

### financial_accounts
```sql
CREATE TABLE financial_accounts (
    account_id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(20) CHECK (account_type IN ('asset', 'liability', 'equity', 'income', 'expense')),
    parent_account_id INTEGER REFERENCES financial_accounts(account_id),
    current_balance DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_financial_accounts_code ON financial_accounts(account_code);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(account_type);
CREATE INDEX idx_financial_accounts_parent ON financial_accounts(parent_account_id);
```

### financial_transactions
```sql
CREATE TABLE financial_transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('income', 'expense', 'transfer', 'adjustment')),
    debit_account_id INTEGER REFERENCES financial_accounts(account_id),
    credit_account_id INTEGER REFERENCES financial_accounts(account_id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(20), -- 'project', 'payroll', 'purchase', etc.
    reference_id INTEGER,
    project_id INTEGER REFERENCES projects(project_id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_status VARCHAR(10) CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_financial_trans_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_trans_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_trans_debit ON financial_transactions(debit_account_id);
CREATE INDEX idx_financial_trans_credit ON financial_transactions(credit_account_id);
CREATE INDEX idx_financial_trans_project ON financial_transactions(project_id);
CREATE INDEX idx_financial_trans_status ON financial_transactions(approval_status);
```

### financial_budgets
```sql
CREATE TABLE financial_budgets (
    budget_id SERIAL PRIMARY KEY,
    budget_name VARCHAR(200) NOT NULL,
    budget_year INTEGER NOT NULL,
    budget_month INTEGER, -- NULL สำหรับ annual budget
    account_id INTEGER REFERENCES financial_accounts(account_id),
    project_id INTEGER REFERENCES projects(project_id), -- NULL สำหรับ general budget
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_financial_budgets_year ON financial_budgets(budget_year);
CREATE INDEX idx_financial_budgets_account ON financial_budgets(account_id);
CREATE INDEX idx_financial_budgets_project ON financial_budgets(project_id);
```

## 🔗 Relationships Summary

### Key Relationships:
1. **users** ← hr_employees (user_id)
2. **hr_employees** ← hr_leave_requests (employee_id)
3. **hr_employees** ← hr_daily_actual (worker_id)
4. **customers** ← projects (customer_id)
5. **projects** ← project_tasks (project_id)
6. **projects** ← hr_daily_actual (project_id)
7. **inventory_items** ← inventory_transactions (item_id)
8. **financial_accounts** ← financial_transactions (debit/credit_account_id)

### Audit Trail:
ทุกตารางมี fields สำหรับ audit:
- `created_at`, `created_by`
- `updated_at`, `updated_by` (สำหรับตารางที่แก้ไขได้)
- `approved_by`, `approved_at` (สำหรับตารางที่ต้องอนุมัติ)

## 📋 Migration Strategy

### Phase 1: HR Module
```sql
-- สร้างตารางตามลำดับ
1. hr_employees
2. hr_leave_requests  
3. hr_daily_actual
```

### Phase 2: Project Module
```sql
-- สร้างตารางตามลำดับ
1. customers
2. projects
3. project_tasks
-- อัพเดท hr_daily_actual เพิ่ม FK constraint กับ projects
```

### Phase 3: Inventory Module
```sql
-- สร้างตารางตามลำดับ
1. inventory_categories
2. inventory_items
3. inventory_transactions
```

### Phase 4: Financial Module
```sql
-- สร้างตารางตามลำดับ
1. financial_accounts
2. financial_transactions
3. financial_budgets
```

## ⚠️ ข้อควรระวัง

1. **ไม่แก้ไข** ตาราง users และ password_reset_tokens
2. **ใช้ transactions** เมื่อสร้าง multiple tables
3. **ทดสอบ Foreign Keys** ก่อน deploy
4. **Backup database** ก่อนทำ migration
5. **ใช้ Alembic** สำหรับ version control ของ schema

