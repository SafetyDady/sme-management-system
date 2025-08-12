import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHR } from '../../hooks/useHR';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
  const { createEmployee, updateEmployee, loading } = useHR();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      emp_code: employee?.emp_code || '',
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      position: employee?.position || '',
      department: employee?.department || '',
      employment_type: employee?.employment_type || 'full_time',
      salary_base: employee?.salary_base || '',
      contact_phone: employee?.contact_phone || '',
      user_id: employee?.user_id || '',
      start_date: employee?.start_date ? employee.start_date.split('T')[0] : ''
    }
  });

  useEffect(() => {
    if (employee) {
      reset({
        emp_code: employee.emp_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        position: employee.position || '',
        department: employee.department || '',
        employment_type: employee.employment_type || 'full_time',
        salary_base: employee.salary_base || '',
        contact_phone: employee.contact_phone || '',
        user_id: employee.user_id || '',
        start_date: employee.start_date ? employee.start_date.split('T')[0] : ''
      });
    }
  }, [employee, reset]);

  const onSubmit = async (data) => {
    try {
      const employeeData = {
        ...data,
        salary_base: data.salary_base ? parseFloat(data.salary_base) : null
      };

      if (employee) {
        await updateEmployee(employee.employee_id, employeeData);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(employeeData);
        toast.success('Employee created successfully');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(`Failed to ${employee ? 'update' : 'create'} employee: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {employee ? 'Edit Employee' : 'Add New Employee'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emp_code">Employee Code *</Label>
              <Input
                id="emp_code"
                {...register('emp_code', { 
                  required: 'Employee code is required',
                  minLength: { value: 2, message: 'Code must be at least 2 characters' },
                  maxLength: { value: 20, message: 'Code must be less than 20 characters' }
                })}
                placeholder="EMP001"
                disabled={!!employee} // Don't allow editing code for existing employees
              />
              {errors.emp_code && (
                <p className="text-sm text-red-500">{errors.emp_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id">Link to User (Optional)</Label>
              <Input
                id="user_id"
                {...register('user_id')}
                placeholder="User UUID or leave empty"
              />
            </div>
          </div>

          {/* Name Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name', { 
                  required: 'First name is required',
                  minLength: { value: 1, message: 'First name is required' },
                  maxLength: { value: 50, message: 'First name must be less than 50 characters' }
                })}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name', { 
                  required: 'Last name is required',
                  minLength: { value: 1, message: 'Last name is required' },
                  maxLength: { value: 50, message: 'Last name must be less than 50 characters' }
                })}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register('position', {
                  maxLength: { value: 100, message: 'Position must be less than 100 characters' }
                })}
                placeholder="Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                onValueChange={(value) => setValue('department', value)}
                defaultValue={employee?.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select 
                onValueChange={(value) => setValue('employment_type', value)}
                defaultValue={employee?.employment_type || 'full_time'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
            </div>
          </div>

          {/* Contact & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone', {
                  maxLength: { value: 20, message: 'Phone must be less than 20 characters' }
                })}
                placeholder="+66 12 345 6789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_base">Base Salary (Optional)</Label>
              <Input
                id="salary_base"
                type="number"
                step="0.01"
                {...register('salary_base', {
                  min: { value: 0, message: 'Salary must be positive' }
                })}
                placeholder="50000.00"
              />
              {errors.salary_base && (
                <p className="text-sm text-red-500">{errors.salary_base.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {employee ? 'Update' : 'Create'} Employee
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
