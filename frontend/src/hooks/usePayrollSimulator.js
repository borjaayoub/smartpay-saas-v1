import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useState } from 'react';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching contribution rates
export const usePayrollContributionRates = () => {
  const { data, error, isLoading, mutate: mutateRates } = useSWR(
    '/contribution-rates',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes - rates don't change often
      errorRetryCount: 3,
    }
  );

  return {
    rates: data?.rates || [],
    isLoading,
    error,
    mutate: mutateRates,
  };
};

// Hook for payroll simulation mutations
export const usePayrollSimulation = () => {
  const { success, error: showError } = useToastStore();

  // Single payroll simulation mutation - matches backend endpoint
  const { trigger: simulatePayrollMutation, isMutating: isSimulating } = useSWRMutation(
    '/simulation/preview',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: () => {
        success('Payroll simulation completed successfully!', 'Simulation Complete');
      },
      onError: (error) => {
        console.error('Error simulating payroll:', error);
        showError(
          error.response?.data?.error || 'Failed to simulate payroll. Please try again.',
          'Simulation Failed'
        );
      }
    }
  );

  // Bulk payroll simulation - since backend doesn't have bulk endpoint, we simulate multiple times
  const simulateBulkPayrollMutation = async (employeesData) => {
    const results = [];
    const errors = [];
    
    for (const empData of employeesData) {
      try {
        const response = await api.post('/simulation/preview', empData);
        results.push({
          employee_id: empData.employee_id,
          simulation: response.data.simulation
        });
      } catch (error) {
        console.error(`Error simulating for employee ${empData.employee_id}:`, error);
        errors.push({
          employee_id: empData.employee_id,
          error: error.response?.data?.error || 'Simulation failed'
        });
      }
    }
    
    if (errors.length > 0 && results.length === 0) {
      throw new Error(`All simulations failed. First error: ${errors[0].error}`);
    }
    
    return {
      results,
      errors,
      total: employeesData.length,
      successful: results.length,
      failed: errors.length
    };
  };

  // Update contribution rates mutation
  const { trigger: updateContributionRatesMutation, isMutating: isUpdatingRates } = useSWRMutation(
    '/payroll-simulator/rates',
    async (url, { arg }) => {
      const response = await api.put(url, { rates: arg });
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the rates
        mutate('/contribution-rates');
        success('Contribution rates updated successfully!', 'Rates Updated');
      },
      onError: (error) => {
        console.error('Error updating contribution rates:', error);
        showError(
          error.response?.data?.error || 'Failed to update contribution rates. Please try again.',
          'Update Failed'
        );
      }
    }
  );

  const simulatePayroll = async (params) => {
    return simulatePayrollMutation(params);
  };

  const simulateBulkPayroll = async (params) => {
    // Backend doesn't support bulk, so we simulate each employee
    const { employees } = params;
    if (!employees || employees.length === 0) {
      throw new Error('No employees provided for bulk simulation');
    }
    
    const result = await simulateBulkPayrollMutation(employees);
    
    if (result.successful > 0) {
      success(`Successfully simulated ${result.successful} of ${result.total} employees`, 'Bulk Simulation Complete');
    }
    if (result.failed > 0) {
      showError(`${result.failed} simulations failed. Check console for details.`, 'Some Simulations Failed');
    }
    
    return result;
  };

  const updateContributionRates = async (rates) => {
    return updateContributionRatesMutation(rates);
  };

  return {
    simulatePayroll,
    simulateBulkPayroll,
    updateContributionRates,
    isSimulating,
    isBulkSimulating: false, // Not using SWRMutation for bulk anymore
    isUpdatingRates,
  };
};

// Hook for simulation state management
export const useSimulationState = () => {
  const [simulationParams, setSimulationParams] = useState({
    gross_salary: '',
    overtime_hours: 0,
    overtime_rate: 1.5,
    bonuses: 0,
    allowances: 0,
    deductions: 0,
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetSimulation = () => {
    setSimulationParams({
      gross_salary: '',
      overtime_hours: 0,
      overtime_rate: 1.5,
      bonuses: 0,
      allowances: 0,
      deductions: 0,
    });
    setSelectedEmployee(null);
    setSelectedEmployees([]);
    setBulkMode(false);
    setSimulationResult(null);
    setBulkResult(null);
    setLoading(false);
  };

  const handleEmployeeSelect = (employeeId) => {
    if (bulkMode) {
      setSelectedEmployees(prev => 
        prev.includes(employeeId) 
          ? prev.filter(id => id !== employeeId)
          : [...prev, employeeId]
      );
    } else {
      setSelectedEmployee(employeeId);
    }
  };

  return {
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
  };
};