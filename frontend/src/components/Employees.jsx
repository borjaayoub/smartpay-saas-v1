import React, { useState } from 'react';
import { Pencil, Trash2, Plus, User, Loader2, Mail, CheckCircle, Clock, Calendar, HandCoins } from 'lucide-react';
import FilterBar from './ui/FilterBar';
import EmployeeModal from './EmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';
import useEmployeeStore from '../store/employeeStore';
import { useEmployees, useEmployeeMutations } from '../hooks/useEmployees';

export default function Employees() {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paiments_status: '',
    start_date: '',
    end_date: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
  });

  // Use SWR hook for data fetching
  const { employees, pagination: paginationData, isLoading: loading, error } = useEmployees(filters, pagination);
  const { deleteEmployee } = useEmployeeMutations();

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const { openAddModal, openEditModal } = useEmployeeStore();

  const handleEdit = (employee) => {
    openEditModal(employee);
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }

    try {
      // Make sure employee has a valid ID
      if (!employee || !employee.id) {
        console.error('Invalid employee data:', employee);
        alert('Error: Invalid employee data. Cannot delete.');
        return;
      }
      
      await deleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`);
    } catch (err) {
      // Error handling is done in the mutation hook
      console.error('Error deleting employee:', err);
      // Show user-friendly error if mutation hook didn't handle it
      // if (err.message) {
      //   alert(`Error: ${err.message}`);
      // }
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600 mt-1">Manage your workforce</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Employees Table Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading employees...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
          <div className="p-12 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-900 font-medium mb-2">Failed to load employees</p>
            <p className="text-gray-500 text-sm mb-4">{error.message || 'An error occurred while fetching employees'}</p>
          </div>
          )}

          {/* Card Content */}
          {!loading && !error && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">
                          {employee.first_name} {employee.last_name}
                        </h3>
                        {employee.position && (
                          <p className="text-sm text-blue-500 font-medium">{employee.position}</p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : employee.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.status === 'on_leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                        </span>
                        {employee.paiments_status && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                            employee.paiments_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {employee.paiments_status === 'paid' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {employee.paiments_status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Essential Info Only */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{employee.email || 'N/A'}</span>
                      </div>
                      {employee.hiring_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Hired: <span className="text-gray-700 font-semibold">{employee.hiring_date}</span></span>
                        </div>
                      )}
                      {employee.base_salary !== null && employee.base_salary !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <HandCoins className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Salary:</span>
                          <span className="font-semibold text-green-600">{employee.base_salary.toLocaleString()} DH</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(employee);
                        }}
                        className="flex items-center gap-1 px-2 py-2 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-100 hover:shadow-md transition-all font-medium flex-1 justify-center"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(employee);
                        }}
                        className="flex items-center gap-1 px-2 py-2 text-xs text-red-600 border border-red-300 rounded hover:bg-red-100 hover:shadow-md transition-all font-medium flex-1 justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-12 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No employees found</p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Pagination and Summary */}
        {!loading && !error && paginationData && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {employees.length} of {paginationData.total || 0} employees
          </div>
          {(paginationData.pages || 0) > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!paginationData.has_prev}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {pagination.page} of {paginationData.pages || 1}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!paginationData.has_next}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
        )}
  
        {/* Employee Modal */}
        <EmployeeModal />
      
        {/* Employee Detail Modal */}
        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}