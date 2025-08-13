import React, { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Search, UserPlus, Filter, Users, Grid3X3, Table } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import EmployeeTable from './EmployeeTable';
import { AVAILABLE_DEPARTMENTS, getDepartmentDisplayName, AVAILABLE_EMPLOYMENT_TYPES, getEmploymentTypeDisplayName } from '../utils/roleUtils';

const EmployeeList = ({ employees, onEdit, onDelete, onCreateNew, onToggleStatus, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('first_name');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesEmploymentType = employmentTypeFilter === 'all' || employee.employment_type === employmentTypeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && employee.is_active) ||
                           (statusFilter === 'inactive' && !employee.is_active);
      
      return matchesSearch && matchesDepartment && matchesEmploymentType && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'first_name':
          return (a.first_name || '')?.localeCompare(b.first_name || '') || 0;
        case 'last_name':
          return (a.last_name || '')?.localeCompare(b.last_name || '') || 0;
        case 'email':
          return (a.email || '')?.localeCompare(b.email || '') || 0;
        case 'department':
          return (a.department || '')?.localeCompare(b.department || '') || 0;
        case 'position':
          return (a.position || '')?.localeCompare(b.position || '') || 0;
        case 'hire_date':
          return new Date(b.hire_date || 0) - new Date(a.hire_date || 0);
        case 'created':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });

  // Get department counts for filter badges
  const getDepartmentCounts = () => {
    const counts = {};
    employees.forEach(employee => {
      counts[employee.department] = (counts[employee.department] || 0) + 1;
    });
    return counts;
  };

  // Get employment type counts
  const getEmploymentTypeCounts = () => {
    const counts = {};
    employees.forEach(employee => {
      counts[employee.employment_type] = (counts[employee.employment_type] || 0) + 1;
    });
    return counts;
  };

  // Get status counts
  const getStatusCounts = () => {
    const active = employees.filter(emp => emp.is_active).length;
    const inactive = employees.filter(emp => !emp.is_active).length;
    return { active, inactive };
  };

  const departmentCounts = getDepartmentCounts();
  const employmentTypeCounts = getEmploymentTypeCounts();
  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search employees by name, email, ID, department, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full sm:w-48">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>All Departments ({employees.length})</span>
                </div>
              </SelectItem>
              {AVAILABLE_DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  <div className="flex items-center space-x-2">
                    <span>{getDepartmentDisplayName(dept)}</span>
                    <span className="text-sm text-gray-500">
                      ({departmentCounts[dept] || 0})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employment Type Filter */}
        <div className="w-full sm:w-40">
          <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Employment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {AVAILABLE_EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center space-x-2">
                    <span>{getEmploymentTypeDisplayName(type)}</span>
                    <span className="text-sm text-gray-500">
                      ({employmentTypeCounts[type] || 0})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-32">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({employees.length})</SelectItem>
              <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
              <SelectItem value="inactive">Inactive ({statusCounts.inactive})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full sm:w-40">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first_name">Sort by First Name</SelectItem>
              <SelectItem value="last_name">Sort by Last Name</SelectItem>
              <SelectItem value="email">Sort by Email</SelectItem>
              <SelectItem value="department">Sort by Department</SelectItem>
              <SelectItem value="position">Sort by Position</SelectItem>
              <SelectItem value="hire_date">Sort by Hire Date</SelectItem>
              <SelectItem value="created">Sort by Created</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('cards')}
            className="h-7 px-2"
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setViewMode('table')}
            className="h-7 px-2"
          >
            <Table className="h-4 w-4 mr-1" />
            Table
          </Button>
        </div>

        {/* Create Employee Button */}
        <Button onClick={onCreateNew} className="whitespace-nowrap bg-green-600 hover:bg-green-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredEmployees.length} of {employees.length} employees
          {departmentFilter !== 'all' && ` in "${getDepartmentDisplayName(departmentFilter)}"`}
          {employmentTypeFilter !== 'all' && ` with "${getEmploymentTypeDisplayName(employmentTypeFilter)}" employment`}
          {statusFilter !== 'all' && ` with "${statusFilter}" status`}
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        
        {(searchTerm || departmentFilter !== 'all' || employmentTypeFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setDepartmentFilter('all');
              setEmploymentTypeFilter('all');
              setStatusFilter('all');
            }}
            className="text-green-600 hover:text-green-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Employee Display */}
      {filteredEmployees.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.employee_id || employee.id}
                employee={employee}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                loading={loading}
              />
            ))}
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            loading={loading}
          />
        )
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || departmentFilter !== 'all' || employmentTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating a new employee record.'}
          </p>
          {(!searchTerm && departmentFilter === 'all' && employmentTypeFilter === 'all' && statusFilter === 'all') && (
            <div className="mt-6">
              <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add your first employee
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
