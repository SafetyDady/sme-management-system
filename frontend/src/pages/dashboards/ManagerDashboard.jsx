import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { 
  Users, 
  Target, 
  TrendingUp,
  FileText,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          👔 Manager Dashboard - {user?.username}
        </h1>
        <p className="text-blue-100 text-lg">
          Department Management | Role: Manager | Team Leadership
        </p>
        <p className="text-blue-200 text-sm mt-1">
          Team performance tracking and departmental oversight
        </p>
      </div>

      {/* Team Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8" />
              <span className="text-2xl font-bold">24</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-100">Team Members</p>
            <p className="text-xs text-green-200">3 departments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8" />
              <span className="text-2xl font-bold">87%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100">Goal Achievement</p>
            <p className="text-xs text-blue-200">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <AlertCircle className="h-8 w-8" />
              <span className="text-2xl font-bold">5</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-orange-100">Pending Tasks</p>
            <p className="text-xs text-orange-200">2 high priority</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Award className="h-8 w-8" />
              <span className="text-2xl font-bold">92%</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-100">Team Performance</p>
            <p className="text-xs text-purple-200">Above average</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <CardTitle>Team Management</CardTitle>
            </div>
            <CardDescription>
              Manage team members and assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-green-600" />
              <CardTitle>Goal Tracking</CardTitle>
            </div>
            <CardDescription>
              Set and monitor team objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Track Goals
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <CardTitle>Performance Reports</CardTitle>
            </div>
            <CardDescription>
              Team analytics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-orange-600" />
              <CardTitle>Schedule Management</CardTitle>
            </div>
            <CardDescription>
              Team schedules and time tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Schedule
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>
              Team documentation and processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Docs
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Task Management</CardTitle>
            </div>
            <CardDescription>
              Assign and track team tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              Manage Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
