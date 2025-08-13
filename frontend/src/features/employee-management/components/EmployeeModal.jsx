import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import EmployeeForm from './EmployeeForm';

const EmployeeModal = ({ isOpen, onClose, employee, onSave, submitting }) => {
  const handleSubmit = (formData) => {
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Edit Employee' : 'Create New Employee'}
          </DialogTitle>
        </DialogHeader>
        
        <EmployeeForm
          employee={employee}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitting={submitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeModal;
