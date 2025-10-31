import React, { useState, useEffect } from 'react';
import { X, Loader2, User } from 'lucide-react';
import useEmployeeStore from '../store/employeeStore';
import { useEmployeeMutations } from '../hooks/useEmployees';

export default function EmployeeModal() {
  const { isModalOpen, modalMode, selectedEmployee, closeModal } = useEmployeeStore();
  const { createEmployee, updateEmployee } = useEmployeeMutations();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cin: '',
    cnss_number: '',
    amo_number: '',
    cimr_number: '',
    bank_account: '',
    status: 'active',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (modalMode === 'edit' && selectedEmployee) {
      setFormData({
        first_name: selectedEmployee.first_name || '',
        last_name: selectedEmployee.last_name || '',
        email: selectedEmployee.email || '',
        phone: selectedEmployee.phone || '',
        address: selectedEmployee.address || '',
        city: selectedEmployee.city || '',
        zip: selectedEmployee.zip || '',
        country: selectedEmployee.country || '',
        cin: selectedEmployee.cin || '',
        cnss_number: selectedEmployee.cnss_number || '',
        amo_number: selectedEmployee.amo_number || '',
        cimr_number: selectedEmployee.cimr_number || '',
        bank_account: selectedEmployee.bank_account || '',
        status: selectedEmployee.status || 'active',
      });
    } else {
      // Reset form for add mode
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: '',
        cin: '',
        cnss_number: '',
        amo_number: '',
        cimr_number: '',
        bank_account: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [modalMode, selectedEmployee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields based on backend requirements
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip.trim()) newErrors.zip = 'Zip code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.cin.trim()) newErrors.cin = 'CIN is required';
    if (!formData.cnss_number.trim()) newErrors.cnss_number = 'CNSS number is required';
    if (!formData.amo_number.trim()) newErrors.amo_number = 'AMO number is required';
    if (!formData.bank_account.trim()) newErrors.bank_account = 'Bank account is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // CNSS number validation - only alphanumeric characters
    if (formData.cnss_number && !/^[a-zA-Z0-9]+$/.test(formData.cnss_number)) {
      newErrors.cnss_number = 'CNSS number can only contain letters and numbers';
    }
    
    // AMO number validation - only alphanumeric characters
    if (formData.amo_number && !/^[a-zA-Z0-9]+$/.test(formData.amo_number)) {
      newErrors.amo_number = 'AMO number can only contain letters and numbers';
    }
    
    // CIMR number validation - only alphanumeric characters (optional field)
    if (formData.cimr_number && !/^[a-zA-Z0-9]+$/.test(formData.cimr_number)) {
      newErrors.cimr_number = 'CIMR number can only contain letters and numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Clean and format the data before sending - only employee fields, no contract fields
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zip: formData.zip.trim(),
        country: formData.country.trim(),
        cin: formData.cin.trim(),
        cnss_number: formData.cnss_number.trim(),
        amo_number: formData.amo_number.trim(),
        bank_account: formData.bank_account.trim(),
        status: formData.status,
      };
      
      // Only add optional fields if they have values
      if (formData.cimr_number && formData.cimr_number.trim()) {
        payload.cimr_number = formData.cimr_number.trim();
      }
      
      if (modalMode === 'edit') {
        await updateEmployee(selectedEmployee.id, payload);
      } else {
        await createEmployee(payload);
      }
      
      // Only close modal on success
      closeModal();
    } catch (err) {
      // Error handling is done in the mutation hooks
      // Don't close modal on error - let user see the error and try again
      console.error('Error in handleSubmit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      closeModal();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+212 6XX XXX XXX"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Casablanca"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.zip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="20000"
                  />
                  {errors.zip && (
                    <p className="mt-1 text-xs text-red-500">{errors.zip}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Morocco"
                  />
                  {errors.country && (
                    <p className="mt-1 text-xs text-red-500">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Identification Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Identification Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.cin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="AB123456"
                  />
                  {errors.cin && (
                    <p className="mt-1 text-xs text-red-500">{errors.cin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNSS Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cnss_number"
                    value={formData.cnss_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.cnss_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789"
                  />
                  {errors.cnss_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.cnss_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AMO Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="amo_number"
                    value={formData.amo_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.amo_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123456789"
                  />
                  {errors.amo_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.amo_number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CIMR Number
                  </label>
                  <input
                    type="text"
                    name="cimr_number"
                    value={formData.cimr_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.cimr_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Optional"
                  />
                  {errors.cimr_number && (
                    <p className="mt-1 text-xs text-red-500">{errors.cimr_number}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.bank_account ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234567890123456"
                  />
                  {errors.bank_account && (
                    <p className="mt-1 text-xs text-red-500">{errors.bank_account}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="fired">Fired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalMode === 'edit' ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

