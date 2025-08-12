import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useHR } from '../../hooks/useHR.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Shield,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Loader2,
  Building,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import EmployeeList from '../../components/hr/EmployeeList.jsx';
import EmployeeForm from '../../components/hr/EmployeeForm.jsx';

const HRDashboard = () => {
  const { user } = useAuth();
  const { employees, loading: employeesLoading, fetchEmployees } = useHR();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: [],
    recentHires: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('📊 Loading HR Dashboard data...');
        
        // Fetch employees data
        await fetchEmployees();
        
        console.log('✅ HR Dashboard data loaded');
      } catch (error) {
        console.error('❌ Failed to load HR dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calculate stats from employees data
  useEffect(() => {
    if (employees) {
      const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const recentHires = employees.filter(emp => 
        emp.start_date && new Date(emp.start_date) >= thisMonth
      ).length;

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter(emp => emp.active_status !== false).length,
        departments,
        recentHires
      });
    }
  }, [employees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading HR Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          👥 HR Management Dashboard - {user?.username}
        </h1>
        <p className="text-green-100">
          Human Resources Management | Role: {user?.role} | Access Level: HR Manager
        </p>
        <p className="text-green-200 text-sm mt-1">
          Permissions: Employee Management, Leave Management, HR Reports
        </p>
      </div>

      {/* HR Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-blue-100 text-sm">Total Employees</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEmployees}</div>
            <p className="text-green-100 text-sm">Active Employees</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Building className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                Depts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments.length}</div>
            <p className="text-purple-100 text-sm">Departments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UserPlus className="h-8 w-8" />
              <Badge variant="secondary" className="bg-white/20 text-white">
                New
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentHires}</div>
            <p className="text-orange-100 text-sm">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Management Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
          <TabsTrigger value="reports">HR Reports</TabsTrigger>
          <TabsTrigger value="settings">HR Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Management
              </CardTitle>
              <CardDescription>
                Manage employee information, add new employees, and update existing records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>
                Approve/reject leave requests and manage employee time off
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Management</h3>
              <p className="text-gray-600 mb-4">Feature coming soon...</p>
              <Button variant="outline" disabled>
                <Clock className="mr-2 h-4 w-4" />
                Manage Leaves
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                HR Reports & Analytics
              </CardTitle>
              <CardDescription>
                Generate reports and view HR analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">HR Reports</h3>
              <p className="text-gray-600 mb-4">Advanced reporting and analytics coming soon...</p>
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                HR Settings
              </CardTitle>
              <CardDescription>
                Configure HR policies and system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">HR Configuration</h3>
              <p className="text-gray-600 mb-4">Settings and configuration panel coming soon...</p>
              <Button variant="outline" disabled>
                <Shield className="mr-2 h-4 w-4" />
                HR Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRDashboard;
