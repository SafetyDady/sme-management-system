import React, { useState, useEffect } from 'react';
import { useHR } from '../../hooks/useHR';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const EmployeeList = ({ onEditEmployee, onCreateEmployee }) => {
  const { employees, loading, error, fetchEmployees, deleteEmployee } = useHR();
  const [filters, setFilters] = useState({
    department: '',
    active_only: true,
    search: ''
  });

  useEffect(() => {
    fetchEmployees(filters);
  }, [fetchEmployees, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete employee ${employeeName}?`)) {
      return;
    }

    try {
      await deleteEmployee(employeeId);
      toast.success('Employee deleted successfully');
    } catch (error) {
      toast.error(`Failed to delete employee: ${error.message}`);
    }
  };

  const getStatusBadge = (active) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        Inactive
      </Badge>
    );
  };

  const getEmploymentTypeBadge = (type) => {
    const colors = {
      full_time: "bg-blue-100 text-blue-800 border-blue-200",
      part_time: "bg-yellow-100 text-yellow-800 border-yellow-200",
      contract: "bg-purple-100 text-purple-800 border-purple-200",
      intern: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return (
      <Badge className={colors[type] || colors.contract}>
        {type?.replace('_', ' ').toUpperCase() || 'CONTRACT'}
      </Badge>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Employees</h3>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => fetchEmployees(filters)} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        </div>
        <Button onClick={onCreateEmployee} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or employee code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Department Filter */}
            <Select 
              value={filters.department} 
              onValueChange={(value) => handleFilterChange('department', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select 
              value={filters.active_only?.toString()} 
              onValueChange={(value) => handleFilterChange('active_only', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Employee List ({employees.length})
            </CardTitle>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && employees.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No employees found</h3>
              <p className="text-gray-600">Get started by adding your first employee.</p>
              <Button onClick={onCreateEmployee} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.employee_id} className="hover:bg-gray-50">
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {employee.emp_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          {employee.user_id && (
                            <div className="text-sm text-gray-500">
                              Linked User
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.position || <span className="text-gray-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {employee.department || <span className="text-gray-400">-</span>}
                      </TableCell>
                      <TableCell>
                        {getEmploymentTypeBadge(employee.employment_type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(employee.active_status)}
                      </TableCell>
                      <TableCell>
                        {employee.contact_phone ? (
                          <a 
                            href={`tel:${employee.contact_phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {employee.contact_phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(
                              employee.employee_id,
                              `${employee.first_name} ${employee.last_name}`
                            )}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeList;
