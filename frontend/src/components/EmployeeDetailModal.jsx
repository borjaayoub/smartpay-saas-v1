import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, CreditCard, Hash, Landmark, IdCard, Pencil, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
import ContractModal from './ContractModal';

export default function EmployeeDetailModal({ employee, isOpen, onClose, onEdit, onDelete }) {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  
  if (!isOpen || !employee) return null;

  // Safe date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <IdCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Employee Details
                </h2>
                <p className="text-sm text-gray-600">
                  {employee.first_name} {employee.last_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Employee Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-lg text-blue-600 font-medium">{employee.department || employee.position}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className={`text-sm px-4 py-2 rounded-full font-medium ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
                <span className={`text-sm px-4 py-2 rounded-full font-medium flex items-center gap-2 ${
                  employee.paiments_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {employee.paiments_status === 'paid' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {employee.paiments_status === 'paid' ? 'Paid' : 'Pending Payment'}
                </span>
              </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{employee.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{employee.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <IdCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">CIN:</span>
                      <span className="ml-2 font-medium">{employee.cin}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">CNSS:</span>
                      <span className="ml-2 font-medium">{employee.cnss_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Hiring Date:</span>
                      <span className="ml-2 font-medium">{formatDate(employee.hiring_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Landmark className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Bank Account:</span>
                      <span className="ml-2 font-medium">{employee.bank_account || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Base Salary:</span>
                      <span className="ml-2 font-bold text-green-600 text-lg">{employee.base_salary} DH</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="ml-2 font-medium">{formatDate(employee.paiments_date) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 justify-end">
              <button
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Pencil className="w-4 h-4" />
                Edit Employee
              </button>
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This will also delete all associated contracts and payslips.`)) {
                    try {
                      await onDelete(employee);
                      onClose(); // Only close after successful deletion
                    } catch (err) {
                      // Error is handled by the mutation hook, don't close modal on error
                      console.error('Error deleting employee:', err);
                    }
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Employee
              </button>
              <button
                onClick={() => setIsContractModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                View Contracts
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contract Modal */}
      <ContractModal
        employee={employee}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
      />
    </div>
  );
}
