import React, { useState } from 'react';
import { Search, Eye, FileText, Loader2, AlertCircle } from 'lucide-react';
import { usePayslips } from '../hooks/usePayslips';
import { useEmployees } from '../hooks/useEmployees';
import PayslipDetailModal from './PayslipDetailModal';

export default function Payslips() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 12 });
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch payslips with search and pagination
  const { payslips, pagination: paginationData, isLoading, error } = usePayslips(filters, pagination);
  
  // Fetch employees to get names for display
  const { employees } = useEmployees({}, { page: 1, limit: 100 });
  
  // Create a map of employee IDs to employee data for quick lookup
  const employeeMap = React.useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters };
    
    if (searchTerm.trim()) {
      // Check if search term looks like a month (e.g., "October 2025", "2025-01")
      const monthPattern = /(january|february|march|april|may|june|july|august|september|october|november|december|\d{4}-\d{2})/i;
      if (monthPattern.test(searchTerm)) {
        newFilters.month = searchTerm;
      } else {
        // Search by employee name
        const matchingEmployees = employees.filter(emp => 
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingEmployees.length > 0) {
          newFilters.employee_id = matchingEmployees[0].id;
        }
      }
    } else {
      delete newFilters.month;
      delete newFilters.employee_id;
    }
    
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Format payslip data for display
  const formattedPayslips = React.useMemo(() => {
    return payslips.map(payslip => {
      const employee = employeeMap[payslip.employee_id];
      return {
        id: payslip.id,
        employeeName: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
        month: payslip.month,
        grossSalary: payslip.gross_salary || payslip.base_salary || 0,
        deductions: payslip.total_deductions || 0,
        netSalary: payslip.net_salary || 0,
        status: payslip.status,
      };
    });
  }, [payslips, employeeMap]);

  // Format month display
  const formatMonth = (month) => {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  // Handle view payslip details
  const handleViewPayslip = (payslipId) => {
    const payslip = payslips.find(p => p.id === payslipId);
    if (payslip) {
      setSelectedPayslip(payslip);
      setIsModalOpen(true);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pay Slips</h1>
              <p className="text-gray-600 mt-1">Pay Slip History and Management</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by employee or month..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </form>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading payslips...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 mb-2">Failed to load payslips</p>
              <p className="text-gray-500 text-sm">
                {error.response?.data?.error || error.message || 'Please try again later'}
              </p>
            </div>
          )}

          {/* Payslips List */}
          {!isLoading && !error && formattedPayslips.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formattedPayslips.map((payslip) => (
                <div 
                  key={payslip.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    {/* Left Section - Employee Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {payslip.employeeName}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {formatMonth(payslip.month)}
                      </p>
                    </div>

                    {/* Right Section - Status and Actions */}
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        payslip.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        payslip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {payslip.status}
                      </span>
                      <button 
                        onClick={() => handleViewPayslip(payslip.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Salary Details */}
                  <div className="flex justify-between items-center">
                    {/* Gross Salary */}
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">Gross Salary</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {payslip.grossSalary.toFixed(0)} DH
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>

                    {/* Deductions */}
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">Withholdings</p>
                      <p className="text-sm font-semibold text-red-600">
                        -{payslip.deductions.toFixed(0)} DH
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 mx-2"></div>

                    {/* Net Salary */}
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                      <p className="text-sm font-semibold text-green-600">
                        {payslip.netSalary.toFixed(0)} DH
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && formattedPayslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payslips found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create payslips using the Payroll Simulator'}
              </p>
            </div>
          )}

          {/* Pagination and Summary */}
          {!isLoading && !error && paginationData && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">
                  Showing {formattedPayslips.length} of {paginationData.total || 0} payslips
                </span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              {paginationData.pages && paginationData.pages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!paginationData.has_prev}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg font-medium">
                    Page {pagination.page} of {paginationData.pages}
                  </span>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!paginationData.has_next}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payslip Detail Modal */}
      <PayslipDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayslip(null);
        }}
        payslip={selectedPayslip}
        employee={selectedPayslip ? employeeMap[selectedPayslip.employee_id] : null}
      />
    </div>
  );
}