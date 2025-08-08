# SME Management System - Frontend Development Plan

## 🎯 หลักการออกแบบ Frontend

### 1. รักษา Authentication UI เดิม
- **ไม่แก้ไข** หน้า Login, Dashboard, User Management ที่มีอยู่
- **ใช้ประโยชน์** จาก authentication hooks และ components
- **เพิ่ม role-based navigation** สำหรับ SME modules

### 2. Consistent Design System
- ใช้ **Shadcn/UI** components ที่มีอยู่
- ใช้ **TailwindCSS** สำหรับ styling
- รักษา **design consistency** ทั้งระบบ

### 3. Modular Component Architecture
- แยก components ตาม business modules
- ใช้ custom hooks สำหรับ API calls
- ใช้ React Router สำหรับ navigation

## 📁 Project Structure Enhancement

```
frontend/src/
├── components/
│   ├── common/ (existing)
│   │   ├── Layout.jsx
│   │   ├── Navigation.jsx
│   │   ├── Header.jsx
│   │   └── Sidebar.jsx
│   ├── auth/ (existing - ไม่แก้ไข)
│   │   ├── LoginForm.jsx
│   │   ├── ForgotPasswordForm.jsx
│   │   └── ResetPasswordForm.jsx
│   ├── hr/ (new)
│   │   ├── EmployeeList.jsx
│   │   ├── EmployeeForm.jsx
│   │   ├── LeaveRequestForm.jsx
│   │   ├── LeaveApprovalList.jsx
│   │   └── DepartmentStats.jsx
│   ├── projects/ (new)
│   │   ├── ProjectList.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── CustomerList.jsx
│   │   ├── TaskList.jsx
│   │   └── ProjectDashboard.jsx
│   ├── inventory/ (new)
│   │   ├── ItemList.jsx
│   │   ├── ItemForm.jsx
│   │   ├── StockTransaction.jsx
│   │   ├── LowStockAlert.jsx
│   │   └── InventoryDashboard.jsx
│   └── financial/ (new)
│       ├── AccountList.jsx
│       ├── TransactionForm.jsx
│       ├── BudgetPlanning.jsx
│       ├── FinancialReports.jsx
│       └── FinancialDashboard.jsx
├── pages/
│   ├── auth/ (existing - ไม่แก้ไข)
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── dashboard/ (existing - enhance)
│   │   └── Dashboard.jsx
│   ├── hr/ (new)
│   │   ├── HRDashboard.jsx
│   │   ├── EmployeeManagement.jsx
│   │   ├── LeaveManagement.jsx
│   │   └── AttendanceTracking.jsx
│   ├── projects/ (new)
│   │   ├── ProjectDashboard.jsx
│   │   ├── ProjectManagement.jsx
│   │   ├── CustomerManagement.jsx
│   │   └── TaskManagement.jsx
│   ├── inventory/ (new)
│   │   ├── InventoryDashboard.jsx
│   │   ├── ItemManagement.jsx
│   │   ├── StockManagement.jsx
│   │   └── ProcurementManagement.jsx
│   └── financial/ (new)
│       ├── FinancialDashboard.jsx
│       ├── AccountManagement.jsx
│       ├── TransactionManagement.jsx
│       ├── BudgetManagement.jsx
│       └── FinancialReports.jsx
├── hooks/
│   ├── useAuth.js (existing - ไม่แก้ไข)
│   ├── useHR.js (new)
│   ├── useProjects.js (new)
│   ├── useInventory.js (new)
│   └── useFinancial.js (new)
├── lib/
│   ├── api.js (existing - enhance)
│   ├── auth.js (existing - ไม่แก้ไข)
│   ├── utils.js (existing - enhance)
│   └── constants.js (new)
└── styles/
    ├── globals.css (existing)
    └── components.css (new)
```

## 🔐 Authentication Integration

### Role-Based Navigation
```jsx
// components/common/Navigation.jsx
import { useAuth } from '../../hooks/useAuth';

const Navigation = () => {
  const { user } = useAuth();
  
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: 'Home' }
    ];
    
    const roleBasedItems = {
      superadmin: [
        { path: '/hr', label: 'HR Management', icon: 'Users' },
        { path: '/projects', label: 'Projects', icon: 'Briefcase' },
        { path: '/inventory', label: 'Inventory', icon: 'Package' },
        { path: '/financial', label: 'Financial', icon: 'DollarSign' },
        { path: '/users', label: 'User Management', icon: 'Settings' }
      ],
      owner: [
        { path: '/hr', label: 'HR Management', icon: 'Users' },
        { path: '/projects', label: 'Projects', icon: 'Briefcase' },
        { path: '/inventory', label: 'Inventory', icon: 'Package' },
        { path: '/financial', label: 'Financial', icon: 'DollarSign' }
      ],
      manager: [
        { path: '/hr', label: 'HR Management', icon: 'Users' },
        { path: '/projects', label: 'Projects', icon: 'Briefcase' },
        { path: '/inventory', label: 'Inventory', icon: 'Package' }
      ],
      hr: [
        { path: '/hr', label: 'HR Management', icon: 'Users' }
      ],
      accountant: [
        { path: '/financial', label: 'Financial', icon: 'DollarSign' },
        { path: '/inventory', label: 'Inventory', icon: 'Package' }
      ],
      employee: [
        { path: '/hr/my-profile', label: 'My Profile', icon: 'User' },
        { path: '/hr/my-leaves', label: 'My Leaves', icon: 'Calendar' }
      ]
    };
    
    return [...baseItems, ...(roleBasedItems[user?.role] || [])];
  };
  
  return (
    <nav className="space-y-2">
      {getMenuItems().map((item) => (
        <NavLink key={item.path} to={item.path} className="nav-item">
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};
```

### Enhanced Dashboard
```jsx
// pages/dashboard/Dashboard.jsx (enhance existing)
import { useAuth } from '../../hooks/useAuth';
import HRDashboardWidget from '../../components/hr/HRDashboardWidget';
import ProjectDashboardWidget from '../../components/projects/ProjectDashboardWidget';
import InventoryDashboardWidget from '../../components/inventory/InventoryDashboardWidget';
import FinancialDashboardWidget from '../../components/financial/FinancialDashboardWidget';

const Dashboard = () => {
  const { user } = useAuth();
  
  const getDashboardWidgets = () => {
    const widgets = [];
    
    // Role-based widget visibility
    if (['superadmin', 'owner', 'manager', 'hr'].includes(user?.role)) {
      widgets.push(<HRDashboardWidget key="hr" />);
    }
    
    if (['superadmin', 'owner', 'manager'].includes(user?.role)) {
      widgets.push(<ProjectDashboardWidget key="projects" />);
    }
    
    if (['superadmin', 'owner', 'manager', 'accountant'].includes(user?.role)) {
      widgets.push(<InventoryDashboardWidget key="inventory" />);
      widgets.push(<FinancialDashboardWidget key="financial" />);
    }
    
    return widgets;
  };
  
  return (
    <div className="dashboard-container">
      <h1>Welcome back, {user?.username}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getDashboardWidgets()}
      </div>
    </div>
  );
};
```

## 👥 HR Module Frontend

### HR Custom Hook
```jsx
// hooks/useHR.js
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const useHR = () => {
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchEmployees = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/hr/employees', { params: filters });
      setEmployees(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createEmployee = async (employeeData) => {
    try {
      const response = await api.post('/hr/employees', employeeData);
      setEmployees(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const updateEmployee = async (employeeId, updateData) => {
    try {
      const response = await api.put(`/hr/employees/${employeeId}`, updateData);
      setEmployees(prev => 
        prev.map(emp => emp.employee_id === employeeId ? response.data : emp)
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const fetchLeaveRequests = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/hr/leaves', { params: filters });
      setLeaveRequests(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createLeaveRequest = async (leaveData) => {
    try {
      const response = await api.post('/hr/leaves', leaveData);
      setLeaveRequests(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const approveLeaveRequest = async (leaveId, approvalData) => {
    try {
      const response = await api.put(`/hr/leaves/${leaveId}/approve`, approvalData);
      setLeaveRequests(prev =>
        prev.map(leave => leave.leave_id === leaveId ? response.data : leave)
      );
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  return {
    employees,
    leaveRequests,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    fetchLeaveRequests,
    createLeaveRequest,
    approveLeaveRequest
  };
};
```

### Employee List Component
```jsx
// components/hr/EmployeeList.jsx
import { useState, useEffect } from 'react';
import { useHR } from '../../hooks/useHR';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const EmployeeList = ({ onEditEmployee, onCreateEmployee }) => {
  const { employees, loading, error, fetchEmployees } = useHR();
  const [filters, setFilters] = useState({
    department: '',
    active_only: true,
    search: ''
  });
  
  useEffect(() => {
    fetchEmployees(filters);
  }, [filters]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  if (loading) return <div>Loading employees...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search employees..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={filters.department}
          onValueChange={(value) => handleFilterChange('department', value)}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
        </Select>
        <Button onClick={onCreateEmployee}>Add Employee</Button>
      </div>
      
      {/* Employee Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Employment Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.employee_id}>
              <TableCell>{employee.emp_code}</TableCell>
              <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.employment_type}</TableCell>
              <TableCell>
                <Badge variant={employee.active_status ? 'success' : 'secondary'}>
                  {employee.active_status ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditEmployee(employee)}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeList;
```

### Employee Form Component
```jsx
// components/hr/EmployeeForm.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHR } from '../../hooks/useHR';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const { createEmployee, updateEmployee } = useHR();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: employee || {
      emp_code: '',
      first_name: '',
      last_name: '',
      position: '',
      department: '',
      employment_type: 'monthly',
      salary_monthly: '',
      wage_daily: ''
    }
  });
  
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (employee) {
        await updateEmployee(employee.employee_id, data);
      } else {
        await createEmployee(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emp_code">Employee Code</Label>
              <Input
                id="emp_code"
                {...register('emp_code', { required: 'Employee code is required' })}
                disabled={!!employee}
              />
              {errors.emp_code && (
                <p className="text-sm text-red-500">{errors.emp_code.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select {...register('employment_type')}>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="subcontract">Subcontract</option>
                <option value="freelance">Freelance</option>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                {...register('first_name', { required: 'First name is required' })}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                {...register('last_name', { required: 'Last name is required' })}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Position</Label>
              <Input id="position" {...register('position')} />
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Select {...register('department')}>
                <option value="">Select Department</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_monthly">Monthly Salary</Label>
              <Input
                id="salary_monthly"
                type="number"
                step="0.01"
                {...register('salary_monthly')}
              />
            </div>
            
            <div>
              <Label htmlFor="wage_daily">Daily Wage</Label>
              <Input
                id="wage_daily"
                type="number"
                step="0.01"
                {...register('wage_daily')}
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
```

### HR Dashboard Page
```jsx
// pages/hr/HRDashboard.jsx
import { useState } from 'react';
import EmployeeList from '../../components/hr/EmployeeList';
import EmployeeForm from '../../components/hr/EmployeeForm';
import LeaveApprovalList from '../../components/hr/LeaveApprovalList';
import DepartmentStats from '../../components/hr/DepartmentStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent } from '../../components/ui/dialog';

const HRDashboard = () => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeForm(true);
  };
  
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };
  
  const handleFormSuccess = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
    // Refresh data will be handled by the hooks
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">HR Management</h1>
      
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
          <TabsTrigger value="stats">Department Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          <EmployeeList
            onCreateEmployee={handleCreateEmployee}
            onEditEmployee={handleEditEmployee}
          />
        </TabsContent>
        
        <TabsContent value="leaves">
          <LeaveApprovalList />
        </TabsContent>
        
        <TabsContent value="stats">
          <DepartmentStats />
        </TabsContent>
      </Tabs>
      
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-4xl">
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowEmployeeForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRDashboard;
```

## 🚀 Router Configuration

### Enhanced App.jsx
```jsx
// App.jsx (enhance existing)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';

// Existing pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import UserManagement from './pages/UserManagement';

// New SME pages
import HRDashboard from './pages/hr/HRDashboard';
import ProjectDashboard from './pages/projects/ProjectDashboard';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import FinancialDashboard from './pages/financial/FinancialDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* HR Module */}
            <Route path="hr/*" element={
              <ProtectedRoute requiredPermissions={['hr:read']}>
                <Routes>
                  <Route index element={<HRDashboard />} />
                  <Route path="employees" element={<HRDashboard />} />
                  <Route path="leaves" element={<HRDashboard />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* Project Module */}
            <Route path="projects/*" element={
              <ProtectedRoute requiredPermissions={['project:read']}>
                <Routes>
                  <Route index element={<ProjectDashboard />} />
                  <Route path="customers" element={<ProjectDashboard />} />
                  <Route path="tasks" element={<ProjectDashboard />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* Inventory Module */}
            <Route path="inventory/*" element={
              <ProtectedRoute requiredPermissions={['inventory:read']}>
                <Routes>
                  <Route index element={<InventoryDashboard />} />
                  <Route path="items" element={<InventoryDashboard />} />
                  <Route path="stock" element={<InventoryDashboard />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* Financial Module */}
            <Route path="financial/*" element={
              <ProtectedRoute requiredPermissions={['financial:read']}>
                <Routes>
                  <Route index element={<FinancialDashboard />} />
                  <Route path="accounts" element={<FinancialDashboard />} />
                  <Route path="transactions" element={<FinancialDashboard />} />
                  <Route path="budgets" element={<FinancialDashboard />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* User Management (existing) */}
            <Route path="users" element={
              <ProtectedRoute requiredRoles={['superadmin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## 📋 Frontend Development Phases

### Phase 1: HR Module (Week 3-4)
1. สร้าง useHR hook
2. สร้าง HR components (EmployeeList, EmployeeForm, LeaveRequestForm)
3. สร้าง HRDashboard page
4. เพิ่ม HR routes ใน App.jsx
5. ทดสอบ integration กับ backend APIs

### Phase 2: Project Module (Week 5-6)
1. สร้าง useProjects hook
2. สร้าง Project components
3. สร้าง ProjectDashboard page
4. เพิ่ม Project routes
5. ทดสอบ integration

### Phase 3: Financial Module (Week 7-8)
1. สร้าง useFinancial hook
2. สร้าง Financial components
3. สร้าง FinancialDashboard page
4. เพิ่ม Financial routes
5. ทดสอบ integration

### Phase 4: Inventory Module (Week 9-10)
1. สร้าง useInventory hook
2. สร้าง Inventory components
3. สร้าง InventoryDashboard page
4. เพิ่ม Inventory routes
5. ทดสอบ integration

### Phase 5: Integration & Polish (Week 11-12)
1. Enhanced Dashboard with all modules
2. Cross-module integrations
3. Performance optimization
4. UI/UX improvements
5. Mobile responsiveness

## 🎨 Design System Guidelines

### Color Scheme
```css
/* styles/components.css */
:root {
  /* Primary colors */
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  
  /* Secondary colors */
  --secondary: #64748b;
  --secondary-foreground: #ffffff;
  
  /* Status colors */
  --success: #16a34a;
  --warning: #d97706;
  --error: #dc2626;
  --info: #0ea5e9;
  
  /* Module colors */
  --hr-color: #8b5cf6;
  --project-color: #06b6d4;
  --inventory-color: #10b981;
  --financial-color: #f59e0b;
}

.module-hr { border-left: 4px solid var(--hr-color); }
.module-project { border-left: 4px solid var(--project-color); }
.module-inventory { border-left: 4px solid var(--inventory-color); }
.module-financial { border-left: 4px solid var(--financial-color); }
```

### Component Standards
- ใช้ Shadcn/UI components เป็นหลัก
- ใช้ consistent spacing (4px grid)
- ใช้ responsive design patterns
- ใช้ loading states และ error handling
- ใช้ accessibility best practices

## ⚠️ ข้อควรระวัง

1. **ไม่แก้ไข** authentication pages และ components ที่มีอยู่
2. **ทดสอบ role-based access** อย่างละเอียด
3. **ใช้ consistent error handling** ทั้งระบบ
4. **Optimize performance** สำหรับ large datasets
5. **Test responsive design** บนหลายขนาดหน้าจอ
6. **Implement proper loading states** สำหรับ UX ที่ดี

