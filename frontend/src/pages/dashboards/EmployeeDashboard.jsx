import React from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { User, Calendar, Clock, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">👤 Employee Dashboard - {user?.username}</h1>
        <p className="text-indigo-100 text-lg">Personal Workspace | Role: Employee | Self-Service</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">8.5h</div>
            <p className="text-sm text-muted-foreground">Today's Hours</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">42.5h</div>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">15</div>
            <p className="text-sm text-muted-foreground">Leave Days Left</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-sm text-muted-foreground">Tasks Due</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-indigo-600" />
              <CardTitle>Time Tracking</CardTitle>
            </div>
            <CardDescription>Clock in/out and timesheet management</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Clock className="mr-2 h-4 w-4" />
              Clock In/Out
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <CardTitle>Leave Requests</CardTitle>
            </div>
            <CardDescription>Submit and track leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <CardTitle>My Profile</CardTitle>
            </div>
            <CardDescription>Personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-purple-600" />
              <CardTitle>Pay Stubs</CardTitle>
            </div>
            <CardDescription>View and download payslips</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Payslips
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <CardTitle>My Tasks</CardTitle>
            </div>
            <CardDescription>Assigned tasks and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <CheckCircle className="mr-2 h-4 w-4" />
              View Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-cyan-600" />
              <CardTitle>Performance</CardTitle>
            </div>
            <CardDescription>Goals and performance reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              My Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
