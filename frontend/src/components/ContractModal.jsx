import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, Plus, Pencil, Trash2, Calendar, DollarSign, Building2, Briefcase, Clock, CheckCircle, Hash } from 'lucide-react';
import { useContracts, useContractMutations } from '../hooks/useContracts';
import { mutate } from 'swr';

export default function ContractModal({ employee, isOpen, onClose }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch contracts for this employee
  const { contracts, isLoading, error } = useContracts(
    { employee_id: employee?.id },
    { page: 1, limit: 100 }
  );
  
  const { createContract, updateContract, deleteContract } = useContractMutations();
  
  // Helper function to convert backend date format to input date format
  const parseDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      // Backend format: "Mon, 15 Jan 2024" or "YYYY-MM-DD"
      // Try to parse it
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Convert to YYYY-MM-DD format for input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };
  
  const [formData, setFormData] = useState({
    contract_type: 'CDI',
    hiring_date: '',
    expiration_date: '',
    position: '',
    department: '',
    base_salary: '',
    payments_status: 'pending',
    payments_date: '',
  });
  
  const [errors, setErrors] = useState({});
  
  // Reset form when modal opens/closes or when editing changes
  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setEditingContract(null);
      setFormData({
        contract_type: 'CDI',
        hiring_date: '',
        expiration_date: '',
        position: '',
        department: '',
        base_salary: '',
        payments_status: 'pending',
        payments_date: '',
      });
      setErrors({});
    } else if (editingContract) {
      setFormData({
        contract_type: editingContract.contract_type || 'CDI',
        hiring_date: parseDateForInput(editingContract.hiring_date),
        expiration_date: parseDateForInput(editingContract.expiration_date),
        position: editingContract.position || '',
        department: editingContract.department || '',
        base_salary: editingContract.base_salary || '',
        payments_status: editingContract.payments_status || 'pending',
        payments_date: parseDateForInput(editingContract.payments_date),
      });
    }
  }, [isOpen, editingContract]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.hiring_date) newErrors.hiring_date = 'Hiring date is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.base_salary || Number(formData.base_salary) <= 0) {
      newErrors.base_salary = 'Base salary must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        employee_id: employee.id,
        contract_type: formData.contract_type,
        hiring_date: formData.hiring_date,
        position: formData.position.trim(),
        department: formData.department.trim(),
        base_salary: Number(formData.base_salary),
        payments_status: formData.payments_status,
      };
      
      // Handle optional date fields - send null if empty, otherwise send the date
      if (formData.expiration_date && formData.expiration_date.trim()) {
        payload.expiration_date = formData.expiration_date;
      } else if (editingContract) {
        // If editing and expiration_date is cleared, send null to remove it
        payload.expiration_date = null;
      }
      
      if (formData.payments_date && formData.payments_date.trim()) {
        payload.payments_date = formData.payments_date;
      } else if (editingContract && formData.payments_status === 'pending') {
        // If status is pending and date is cleared, send null
        payload.payments_date = null;
      }
      
      if (editingContract) {
        await updateContract(editingContract.id, payload);
        setEditingContract(null);
        // Manually refresh the contracts list
        mutate((key) => typeof key === 'string' && key.startsWith('/contracts'));
      } else {
        await createContract(payload);
        setIsCreating(false);
        // Manually refresh the contracts list
        mutate((key) => typeof key === 'string' && key.startsWith('/contracts'));
      }
      
      // Reset form after successful submission
      setFormData({
        contract_type: 'CDI',
        hiring_date: '',
        expiration_date: '',
        position: '',
        department: '',
        base_salary: '',
        payments_status: 'pending',
        payments_date: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Error saving contract:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (contract) => {
    setEditingContract(contract);
    setIsCreating(false);
  };
  
  const handleDelete = async (contract) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      await deleteContract(contract.id);
    } catch (err) {
      console.error('Error deleting contract:', err);
    }
  };
  
  const handleCancel = () => {
    setIsCreating(false);
    setEditingContract(null);
    setFormData({
      contract_type: 'CDI',
      hiring_date: '',
      expiration_date: '',
      position: '',
      department: '',
      base_salary: '',
      payments_status: 'pending',
      payments_date: '',
    });
    setErrors({});
  };
  
  if (!isOpen || !employee) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contracts</h2>
                <p className="text-sm text-gray-600">
                  {employee.first_name} {employee.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isCreating && !editingContract && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Contract
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Create/Edit Form */}
            {(isCreating || editingContract) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingContract ? 'Edit Contract' : 'Create New Contract'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contract Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="contract_type"
                        value={formData.contract_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="Intern">Intern</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.position ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Software Engineer"
                      />
                      {errors.position && (
                        <p className="mt-1 text-xs text-red-500">{errors.position}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.department ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Engineering"
                      />
                      {errors.department && (
                        <p className="mt-1 text-xs text-red-500">{errors.department}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Salary (DH) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="base_salary"
                        value={formData.base_salary}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.base_salary ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="5000"
                        min="0"
                        step="0.01"
                      />
                      {errors.base_salary && (
                        <p className="mt-1 text-xs text-red-500">{errors.base_salary}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hiring Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="hiring_date"
                        value={formData.hiring_date}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.hiring_date ? 'border-red-500' : 'border-gray-300'
                        }`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.hiring_date && (
                        <p className="mt-1 text-xs text-red-500">{errors.hiring_date}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        name="expiration_date"
                        value={formData.expiration_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        name="payments_status"
                        value={formData.payments_status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="payments_date"
                        value={formData.payments_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingContract ? 'Update Contract' : 'Create Contract'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Contracts List */}
            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500">Loading contracts...</p>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-red-500">Failed to load contracts</p>
              </div>
            )}
            
            {!isLoading && !error && contracts.length === 0 && !isCreating && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No contracts found for this employee</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 px-4 py-2 mx-auto text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create First Contract
                </button>
              </div>
            )}
            
            {!isLoading && !error && contracts.length > 0 && (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all"
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <h4 className="text-xl font-bold text-gray-900">
                            {contract.position}
                          </h4>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {contract.contract_type}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                            contract.payments_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {contract.payments_status === 'paid' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {contract.payments_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        
                        {/* Contract ID */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                          <Hash className="w-3 h-3" />
                          <span>Contract ID: {contract.id}</span>
                        </div>
                      </div>
                      
                      {!isCreating && !editingContract && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(contract)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit contract"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contract)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete contract"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</p>
                            <p className="text-sm font-semibold text-gray-900">{contract.department}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Base Salary</p>
                            <p className="text-base font-bold text-green-600">
                              {Number(contract.base_salary).toLocaleString()} DH
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hiring Date</p>
                            <p className="text-sm font-semibold text-gray-900">{contract.hiring_date || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {contract.expiration_date && (
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiration Date</p>
                              <p className="text-sm font-semibold text-orange-600">{contract.expiration_date}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Status</p>
                            <p className={`text-sm font-semibold ${
                              contract.payments_status === 'paid' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {contract.payments_status === 'paid' ? 'Paid' : 'Pending Payment'}
                            </p>
                          </div>
                        </div>
                        
                        {contract.payments_date && (
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Date</p>
                              <p className="text-sm font-semibold text-gray-900">{contract.payments_date}</p>
                            </div>
                          </div>
                        )}
                        
                        {contract.created_at && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created</p>
                              <p className="text-sm text-gray-600">{contract.created_at}</p>
                            </div>
                          </div>
                        )}
                        
                        {contract.updated_at && contract.updated_at !== contract.created_at && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</p>
                              <p className="text-sm text-gray-600">{contract.updated_at}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contract Duration Info */}
                    {contract.hiring_date && contract.expiration_date && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            Contract Duration: <span className="font-semibold text-gray-900">
                              {contract.hiring_date} to {contract.expiration_date}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

