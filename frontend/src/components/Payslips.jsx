import React from 'react';
import { FileText, ArrowRight, Loader2, AlertCircle, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePayslips } from '../hooks/usePayslips';
import { useEmployees } from '../hooks/useEmployees';

export default function PayslipsWidget() {
  const navigate = useNavigate();
  
  // Fetch recent payslips (limit to 3 for the dashboard view)
  const { payslips, isLoading, error } = usePayslips({}, { page: 1, limit: 3 });
  
  // Fetch employees to get names for display
  const { employees } = useEmployees({}, { page: 1, limit: 100 });
  
  
  // Create a map of employee IDs to employee data for quick lookup
  const employeeMap = React.useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employees]);

  // Format payslip data for display
  const recentPayslips = React.useMemo(() => {
    return payslips.map(payslip => {
      const employee = employeeMap[payslip.employee_id];
      return {
        id: payslip.id,
        employeeId: `#${payslip.employee_id.toString().padStart(8, '0')}`,
        employeeName: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
        month: payslip.month,
        amount: payslip.net_salary ? payslip.net_salary.toFixed(2) : '0.00',
        currency: 'DH',
        status: payslip.status,
      };
    });
  }, [payslips, employeeMap]);

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Payslips</h2>
                <p className="text-sm text-gray-600">Latest payroll documents</p>
              </div>
            </div>
            <button 
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              onClick={() => navigate('/payslips')}
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[240px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-gray-500">Loading payslips...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-600 mb-1">Failed to load payslips</p>
                <p className="text-xs text-gray-500">Please try again later</p>
              </div>
            </div>
          )}

          {/* Payslips List */}
          {!isLoading && !error && recentPayslips.length > 0 && (
            <div className="divide-y divide-gray-200">
              {recentPayslips.map((payslip) => (
                <div 
                  key={payslip.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/payslips')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {payslip.employeeName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {payslip.month}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {payslip.amount} {payslip.currency}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payslip.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        payslip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {payslip.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && recentPayslips.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-1">No payslips yet</p>
                <p className="text-xs text-gray-400">Generate payslips using the Payroll Simulator to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
