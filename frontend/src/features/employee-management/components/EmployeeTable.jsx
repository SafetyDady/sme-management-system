import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Edit, Trash2, Shield, ShieldOff } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { getDepartmentDisplayName, getEmploymentTypeDisplayName, getEmploymentTypeColor, getDepartmentColor } from '../utils/roleUtils.js';

const EmployeeTable = ({ employees, onEdit, onDelete, onToggleStatus, loading }) => {
  const handleDelete = (employee) => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (window.confirm(`Are you sure you want to delete employee ${employeeName}?`)) {
      onDelete(employee.id);
    }
  };

  const handleToggleStatus = (employee) => {
    const action = employee.is_active ? 'deactivate' : 'activate';
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (window.confirm(`Are you sure you want to ${action} ${employeeName}?`)) {
      onToggleStatus(employee.id, !employee.is_active);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-green-50">
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            <TableHead className="font-semibold">Position</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Hire Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow 
              key={employee.employee_id || employee.id} 
              className={`hover:bg-gray-50 ${
                employee.is_active ? '' : 'opacity-60 bg-gray-25'
              }`}
            >
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-600 font-mono">
                  {employee.employee_id}
                </span>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-600">
                  {employee.email}
                </span>
              </TableCell>
              
              <TableCell>
                <Badge className={`${getDepartmentColor(employee.department)} text-xs`}>
                  {getDepartmentDisplayName(employee.department)}
                </Badge>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-700">
                  {employee.position}
                </span>
              </TableCell>
              
              <TableCell>
                <Badge className={`${getEmploymentTypeColor(employee.employment_type)} text-xs`}>
                  {getEmploymentTypeDisplayName(employee.employment_type)}
                </Badge>
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-gray-600">
                  {employee.hire_date ? formatDate(employee.hire_date) : 'N/A'}
                </span>
              </TableCell>
              
              <TableCell>
                <Badge className={employee.is_active ? 
                  'bg-green-100 text-green-800 border-green-200' : 
                  'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(employee)}
                    disabled={loading}
                    className="h-7 px-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleToggleStatus(employee)}
                    disabled={loading}
                    className={`h-7 px-2 ${employee.is_active ? 
                      'text-orange-600 hover:bg-orange-50' : 
                      'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {employee.is_active ? (
                      <ShieldOff className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleDelete(employee)}
                    disabled={loading}
                    className="h-7 px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees to display
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
