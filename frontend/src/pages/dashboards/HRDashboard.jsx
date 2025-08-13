import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { 
  Users, 
  Calendar, 
  UserPlus,
  ClipboardList,
  Award,
  Clock,
  TrendingUp,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const HRDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          👥 HR Dashboard - {user?.username}
        </h1>
        <p className="text-green-100 text-lg">
          Human Resources | Role: HR | People Management
        </p>
        <p className="text-green-200 text-sm mt-1">
          Employee lifecycle, recruitment, and HR operations
        </p>
      </div>

      {/* HR Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8" />
              <span className="text-2xl font-bold">247</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100">Total Employees</p>
            <p className="text-xs text-blue-200">+5 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <UserPlus className="h-8 w-8" />
              <span className="text-2xl font-bold">12</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-100">New Hires</p>
            <p className="text-xs text-green-200">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Calendar className="h-8 w-8" />
              <span className="text-2xl font-bold">23</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100">Leave Requests</p>
            <p className="text-xs text-orange-200">8 pending approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Award className="h-8 w-8" />
              <span className="text-2xl font-bold">94%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">Satisfaction Rate</p>
            <p className="text-xs text-purple-200">Employee survey</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Employee Management</CardTitle>
            </div>
            <CardDescription>
              View, add, and manage employee records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/hr'}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Employees
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <CardTitle>Leave Management</CardTitle>
            </div>
            <CardDescription>
              Track and approve employee leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Leave System
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserPlus className="h-6 w-6 text-purple-600" />
              <CardTitle>Recruitment</CardTitle>
            </div>
            <CardDescription>
              Manage job postings and candidate pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Recruitment
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-6 w-6 text-orange-600" />
              <CardTitle>Performance Reviews</CardTitle>
            </div>
            <CardDescription>
              Employee evaluations and performance tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Performance
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-indigo-600" />
              <CardTitle>Time & Attendance</CardTitle>
            </div>
            <CardDescription>
              Track working hours and attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Time Tracking
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <CardTitle>HR Analytics</CardTitle>
            </div>
            <CardDescription>
              Employee metrics and HR insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              HR Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HRDashboard;
