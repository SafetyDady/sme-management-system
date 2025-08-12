import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
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
  Building,
  Activity,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const HRDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 12,
    activeEmployees: 10,
    departments: 4,
    recentHires: 2
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
          🏢 GC Management - {user?.username || 'HR Manager'}
        </h1>
        <p className="text-green-100">
          Human Resources Management | Role: {user?.role || 'hr'} | Access Level: HR Manager
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
              <Badge className="bg-white/20 text-white border-white/20">
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
              <Badge className="bg-white/20 text-white border-white/20">
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
              <Badge className="bg-white/20 text-white border-white/20">
                Depts
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-purple-100 text-sm">Departments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UserPlus className="h-8 w-8" />
              <Badge className="bg-white/20 text-white border-white/20">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Employee Management</CardTitle>
            </div>
            <CardDescription>
              จัดการข้อมูลพนักงาน เพิ่ม/แก้ไข/ดูรายชื่อ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => toast.success('Employee Management - Coming Soon!')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Employees
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <CardTitle>Leave Management</CardTitle>
            </div>
            <CardDescription>
              อนุมัติ/ปฏิเสธการลา จัดการวันหยุดพนักงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => toast.info('Leave Management - Coming Soon!')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Manage Leaves
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <CardTitle>HR Reports</CardTitle>
            </div>
            <CardDescription>
              รายงานและสถิติด้านทรัพยากรบุคคล
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => toast.info('HR Reports - Coming Soon!')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* HR Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                HR Overview & Statistics
              </CardTitle>
              <CardDescription>
                Quick overview of HR metrics and recent activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Department Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Engineering</span>
                      <Badge variant="outline">5 employees</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sales</span>
                      <Badge variant="outline">3 employees</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Marketing</span>
                      <Badge variant="outline">2 employees</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">HR</span>
                      <Badge variant="outline">2 employees</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">2 new hires this month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">5 pending leave requests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-gray-600">1 upcoming review</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Management
              </CardTitle>
              <CardDescription>
                Manage employee information and records
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Directory</h3>
              <p className="text-gray-600 mb-4">Complete employee management system coming soon</p>
              <Button onClick={() => toast.success('Employee Management will be available soon!')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>
                Approve/reject leave requests and manage time off
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Requests</h3>
              <p className="text-gray-600 mb-4">Leave approval system coming soon</p>
              <Button 
                variant="outline" 
                onClick={() => toast.info('Leave management features will be added soon!')}
              >
                <Clock className="mr-2 h-4 w-4" />
                View Pending Requests
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
                Generate comprehensive HR reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-4">Advanced reporting tools coming soon</p>
              <Button 
                variant="outline"
                onClick={() => toast.info('Analytics and reporting features coming soon!')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRDashboard;
