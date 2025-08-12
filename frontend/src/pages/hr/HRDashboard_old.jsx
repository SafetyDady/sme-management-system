import React, { useState, useEffect } from 'react';
import EmployeeList from '../../components/hr/EmployeeList';
import EmployeeForm from '../../components/hr/EmployeeForm';
import { useHR } from '../../hooks/useHR';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Building2, 
  UserCheck, 
  UserX,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Plus,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Simple stats component for demo
const HRStats = ({ employees }) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.active_status).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  
  const departmentCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const employmentTypeCounts = employees.reduce((acc, emp) => {
    const type = emp.employment_type || 'contract';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Employees */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Employees */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Employees */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <UserX className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(departmentCounts).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Department breakdown component
const DepartmentStats = ({ employees }) => {
  const departmentCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(departmentCounts).map(([dept, count]) => (
            <div key={dept} className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{dept}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Simple leave management placeholder
const LeaveManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Leave Management
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Leave System Coming Soon</h3>
        <p className="text-gray-600">Employee leave requests and approval workflow will be available here.</p>
      </div>
    </CardContent>
  </Card>
);

const HRDashboard = () => {
  const { user } = useAuth();
  const { employees, fetchEmployees } = useHR();
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
    // Refresh employee list
    fetchEmployees();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
          <p className="text-gray-600">Welcome back, {user?.username}!</p>
        </div>
      </div>

      {/* HR Statistics */}
      <HRStats employees={employees} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeList
            onCreateEmployee={handleCreateEmployee}
            onEditEmployee={handleEditEmployee}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentStats employees={employees} />
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Bulk Operations</h4>
                    <p className="text-sm text-gray-600">Import/export employee data, bulk department updates.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Reports</h4>
                    <p className="text-sm text-gray-600">Generate department reports, employee listings.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeaveManagement />
        </TabsContent>
      </Tabs>

      {/* Employee Form Dialog */}
      <Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
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
