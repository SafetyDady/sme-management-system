import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Loader2, Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.jsx';

const EmployeeAssignmentModal = ({ isOpen, onClose, user, onAssign, onUnassign, loading }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Fetch unassigned employees when modal opens
  useEffect(() => {
    if (isOpen && !user?.employee_id) {
      fetchUnassignedEmployees();
    }
  }, [isOpen]);

  const fetchUnassignedEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await fetch('/api/employees/unassigned', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleAssign = () => {
    if (selectedEmployee) {
      onAssign(user.id, parseInt(selectedEmployee));
    }
  };

  const handleUnassign = () => {
    onUnassign(user.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Assignment</DialogTitle>
          <DialogDescription>
            {user?.employee_id 
              ? `Manage employee assignment for user: ${user?.username}`
              : `Assign an employee to user: ${user?.username}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Assignment Status */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                {user?.employee_id ? (
                  <>
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Currently assigned to Employee ID: {user.employee_id}</span>
                    <Badge variant="outline" className="text-green-600">Assigned</Badge>
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Not assigned to any employee</span>
                    <Badge variant="outline" className="text-gray-500">Unassigned</Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment Actions */}
          {!user?.employee_id ? (
            // Assign new employee
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Employee to Assign:</label>
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading employees...</span>
                </div>
              ) : (
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                        {employee.emp_code} - {employee.first_name} {employee.last_name}
                        {employee.department && ` (${employee.department})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {employees.length === 0 && !loadingEmployees && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No unassigned employees available. All employees are already linked to user accounts.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            // Unassign current employee
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unassigning will remove the link between this user and their employee record. 
                The employee record will remain but won't be linked to any user account.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          
          {!user?.employee_id ? (
            <Button 
              onClick={handleAssign} 
              disabled={!selectedEmployee || loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Assign Employee
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={handleUnassign}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Unassign Employee
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAssignmentModal;
