import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Edit, Trash2, Calendar, Mail, Building, Briefcase, IdCard, Clock, Shield, ShieldOff } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { getDepartmentDisplayName, getEmploymentTypeDisplayName, getEmploymentTypeColor, getDepartmentColor } from '../utils/roleUtils.js';

const EmployeeCard = ({ employee, onEdit, onDelete, onToggleStatus, loading }) => {
  const handleDelete = () => {
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (window.confirm(`Are you sure you want to delete employee ${employeeName}?`)) {
      onDelete(employee.id);
    }
  };

  const handleToggleStatus = () => {
    const action = employee.is_active ? 'deactivate' : 'activate';
    const employeeName = `${employee.first_name} ${employee.last_name}`;
    if (window.confirm(`Are you sure you want to ${action} ${employeeName}?`)) {
      onToggleStatus(employee.id, !employee.is_active);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      employee.is_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-400 opacity-75'
    }`}>
      <CardContent className="p-6">
        {/* Header with Name and Status */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <IdCard className="h-3 w-3 mr-1" />
              ID: {employee.employee_id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={employee.is_active ? 
              'bg-green-100 text-green-800 border-green-200' : 
              'bg-gray-100 text-gray-800 border-gray-200'
            }>
              {employee.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Employee Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
            <Badge className={`${getDepartmentColor(employee.department)} text-xs`}>
              {getDepartmentDisplayName(employee.department)}
            </Badge>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{employee.position}</span>
          </div>

          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <Badge className={`${getEmploymentTypeColor(employee.employment_type)} text-xs`}>
              {getEmploymentTypeDisplayName(employee.employment_type)}
            </Badge>
          </div>

          {employee.hire_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Hired: {formatDate(employee.hire_date)}</span>
            </div>
          )}

          {employee.salary && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-lg mr-2">💰</span>
              <span>Salary: ${employee.salary?.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            disabled={loading}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={loading}
            className={employee.is_active ? 
              'text-orange-600 border-orange-200 hover:bg-orange-50' : 
              'text-green-600 border-green-200 hover:bg-green-50'
            }
          >
            {employee.is_active ? (
              <>
                <ShieldOff className="h-3 w-3 mr-1" />
                Disable
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Enable
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
