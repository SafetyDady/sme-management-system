import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Loader2, Users, Shield } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useEmployees } from '../hooks/useEmployees';
import EmployeeList from '../components/EmployeeList';
import EmployeeModal from '../components/EmployeeModal';
import { canManageEmployees } from '../utils/roleUtils';

const EmployeeManagement = () => {
  const { user: currentUser } = useAuth();
  const { employees, loading, submitting, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus } = useEmployees();
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit', 'delete'
    employee: null
  });

  // Check if user has permission to manage employees
  if (!currentUser || !canManageEmployees(currentUser.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access employee management. This feature requires HR or higher access level.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Modal handlers
  const openModal = (mode, employee = null) => {
    setModalState({ isOpen: true, mode, employee });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', employee: null });
  };

  // CRUD operations
  const handleCreateEmployee = async (employeeData) => {
    const result = await createEmployee(employeeData);
    if (result.success) {
      closeModal();
    }
  };

  const handleUpdateEmployee = async (employeeId, employeeData) => {
    const result = await updateEmployee(employeeId, employeeData);
    if (result.success) {
      closeModal();
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const result = await deleteEmployee(employeeId);
    if (result.success) {
      closeModal();
    }
  };

  const handleToggleEmployeeStatus = async (employeeId, isActive) => {
    await toggleEmployeeStatus(employeeId, isActive);
  };

  // Modal submit handler
  const handleModalSubmit = (...args) => {
    switch (modalState.mode) {
      case 'create':
        return handleCreateEmployee(args[0]);
      case 'edit':
        return handleUpdateEmployee(args[0], args[1]);
      case 'delete':
        return handleDeleteEmployee(args[0]);
      default:
        return Promise.resolve();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-green-600" />
                <span>Employee Management</span>
              </CardTitle>
              <CardDescription>
                Manage company employees, departments, and employment details. Current user: {currentUser.username} ({currentUser.role})
              </CardDescription>
            </div>
            
            {/* Stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{employees.length}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          ) : (
            <EmployeeList
              employees={employees}
              onEdit={(employee) => openModal('edit', employee)}
              onDelete={(employee) => openModal('delete', employee)}
              onCreateNew={() => openModal('create')}
              onToggleStatus={handleToggleEmployeeStatus}
              loading={submitting}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <EmployeeModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        employee={modalState.employee}
        onSubmit={handleModalSubmit}
        submitting={submitting}
        mode={modalState.mode}
      />
    </div>
  );
};

export default EmployeeManagement;