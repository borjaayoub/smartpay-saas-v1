import React, { useState } from 'react';
import { Calculator, Users, Settings, Download, RefreshCw } from 'lucide-react';
import { 
  usePayrollSimulation, 
  useSimulationState 
} from '../hooks/usePayrollSimulator';
import { useEmployees } from '../hooks/useEmployees';
import SimulationResultsModal from './SimulationResultsModal';

const PayrollSimulator = () => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // SWR hooks for data fetching
  const { employees, isLoading: employeesLoading, isError: employeesError } = useEmployees();
  
  // Custom hooks for simulation logic
  const { simulatePayroll, simulateBulkPayroll } = usePayrollSimulation();
  const {
    simulationParams,
    setSimulationParams,
    selectedEmployee,
    selectedEmployees,
    bulkMode,
    setBulkMode,
    simulationResult,
    setSimulationResult,
    bulkResult,
    setBulkResult,
    loading,
    setLoading,
    resetSimulation,
    handleEmployeeSelect,
  } = useSimulationState();

  const handleSimulation = async () => {
    if (!selectedEmployee && !bulkMode) {
      alert('Please select an employee');
      return;
    }

    if (bulkMode && selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    // Validate gross salary
    if (!simulationParams.gross_salary || simulationParams.gross_salary <= 0) {
      alert('Please enter a valid gross salary');
      return;
    }

    setLoading(true);
    try {
      if (bulkMode) {
        // For bulk simulation, prepare data for each employee
        const employeesData = selectedEmployees.map(empId => {
          return {
            employee_id: empId,
            gross_salary: parseFloat(simulationParams.gross_salary),
            overtime_hours: parseFloat(simulationParams.overtime_hours) || 0,
            overtime_rate: parseFloat(simulationParams.overtime_rate) || 1.5,
            bonuses: parseFloat(simulationParams.bonuses) || 0,
            allowances: parseFloat(simulationParams.allowances) || 0,
            deductions: parseFloat(simulationParams.deductions) || 0,
          };
        });
        
        const result = await simulateBulkPayroll({
          employees: employeesData
        });
        setBulkResult(result);
      } else {
        // For single simulation
        const result = await simulatePayroll({
          employee_id: parseInt(selectedEmployee),
          gross_salary: parseFloat(simulationParams.gross_salary),
          overtime_hours: parseFloat(simulationParams.overtime_hours) || 0,
          overtime_rate: parseFloat(simulationParams.overtime_rate) || 1.5,
          bonuses: parseFloat(simulationParams.bonuses) || 0,
          allowances: parseFloat(simulationParams.allowances) || 0,
          deductions: parseFloat(simulationParams.deductions) || 0,
        });
        setSimulationResult(result.simulation);
      }
      // Open modal after successful simulation
      setIsModalOpen(true);
    } catch {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg mr-4">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payroll Simulator</h1>
              <p className="text-gray-600 mt-1">
                Calculate payroll components including CNSS, AMO, and Income Tax according to Moroccan labor law
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Simulation Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Simulation Parameters</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  bulkMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                {bulkMode ? 'Bulk Mode' : 'Single Mode'}
              </button>
              <button
                onClick={resetSimulation}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 inline mr-1" />
                Reset
              </button>
            </div>
          </div>

          {/* Employee Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {bulkMode ? 'Select Employees' : 'Select Employee'}
            </label>
            {employeesLoading ? (
              <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading employees...
              </div>
            ) : employeesError ? (
              <div className="p-4 text-center text-red-500 border border-red-200 rounded-md">
                Failed to load employees
              </div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                No employees found
              </div>
            ) : (
              <select
                value={bulkMode ? '' : (selectedEmployee || '')}
                onChange={(e) => {
                  if (!bulkMode && e.target.value) {
                    const empId = parseInt(e.target.value);
                    handleEmployeeSelect(empId);
                    // Auto-populate gross_salary from employee's contract
                    const employee = employees.find(emp => emp.id === empId);
                    if (employee?.base_salary) {
                      setSimulationParams(prev => ({
                        ...prev,
                        gross_salary: parseFloat(employee.base_salary)
                      }));
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={bulkMode}
              >
                <option value="">
                  {bulkMode ? 'Use checkboxes below for bulk selection' : 'Choose an employee...'}
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name} {employee.position ? `- ${employee.position}` : ''}
              </option>
                ))}
              </select>
            )}
            
            {/* Bulk selection checkboxes */}
            {bulkMode && employees && employees.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEmployees.includes(employee.id)
                        ? 'bg-blue-50 border-blue-200' 
                        : ''
                    }`}
                    onClick={() => handleEmployeeSelect(employee.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleEmployeeSelect(employee.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{employee.position || 'No position'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {employee.base_salary ? formatCurrency(employee.base_salary) : 'No salary'}
                        </p>
                        <p className="text-xs text-gray-500">{employee.department || 'No department'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulation Parameters */}
          <div className="space-y-4">
            {/* Gross Salary - Required field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={simulationParams.gross_salary || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value) || 0;
                  setSimulationParams(prev => ({
                    ...prev,
                    gross_salary: val
                  }));
                  // Auto-populate from selected employee if available
                  if (!bulkMode && selectedEmployee && val === '') {
                    const employee = employees.find(emp => emp.id === parseInt(selectedEmployee));
                    if (employee?.base_salary) {
                      setSimulationParams(prev => ({
                        ...prev,
                        gross_salary: parseFloat(employee.base_salary)
                      }));
                    }
                  }
                }}
                placeholder={!bulkMode && selectedEmployee ? (() => {
                  const employee = employees.find(emp => emp.id === parseInt(selectedEmployee));
                  return employee?.base_salary ? `Default: ${formatCurrency(employee.base_salary)}` : 'Enter salary';
                })() : 'Enter salary'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!bulkMode && selectedEmployee && (() => {
                const employee = employees.find(emp => emp.id === parseInt(selectedEmployee));
                return employee?.base_salary ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Employee's contract salary: {formatCurrency(employee.base_salary)}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-yellow-600">
                    No contract salary found. Please enter a salary.
                  </p>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={simulationParams.overtime_hours || 0}
                  onChange={(e) => setSimulationParams(prev => ({
                    ...prev,
                    overtime_hours: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overtime Rate
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={simulationParams.overtime_rate || 1.5}
                  onChange={(e) => setSimulationParams(prev => ({
                    ...prev,
                    overtime_rate: parseFloat(e.target.value) || 1.5
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonuses
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={simulationParams.bonuses || 0}
                  onChange={(e) => setSimulationParams(prev => ({
                    ...prev,
                    bonuses: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowances
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={simulationParams.allowances || 0}
                  onChange={(e) => setSimulationParams(prev => ({
                    ...prev,
                    allowances: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deductions
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={simulationParams.deductions || 0}
                onChange={(e) => setSimulationParams(prev => ({
                  ...prev,
                  deductions: parseFloat(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSimulation}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  {bulkMode ? 'Simulate Bulk Payroll' : 'Simulate Payroll'}
                </>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Modal */}
      <SimulationResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        simulationResult={simulationResult}
        bulkResult={bulkResult}
        bulkMode={bulkMode}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default PayrollSimulator;
