import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching employees with filters
export const useEmployees = (filters = {}, pagination = { page: 1, limit: 12 }) => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.paiments_status) params.append('paiments_status', filters.paiments_status);

  const { data, error, isLoading, mutate: mutateEmployees } = useSWR(
    `/employees?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    employees: data?.employees || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    mutate: mutateEmployees,
  };
};

// Hook for employee mutations
export const useEmployeeMutations = () => {
  const toast = useToastStore();

  // Create employee mutation
  const { trigger: createEmployeeMutation, isMutating: isCreating } = useSWRMutation(
    '/employees',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the employees list
        mutate((key) => typeof key === 'string' && key.startsWith('/employees'));
        
        toast.success(
          `Employee ${data.employee?.first_name} ${data.employee?.last_name} has been created successfully!`,
          'Employee Created'
        );
      },
      onError: (error) => {
        console.error('Error creating employee:', error);
        
        let errorMessage = 'Failed to create employee. Please try again.';
        
        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.details) {
            errorMessage = error.response.data.details;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific database constraint errors
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorMessage = 'This employee information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Creation Failed');
      }
    }
  );

  // Update employee mutation
  const { trigger: updateEmployeeMutation, isMutating: isUpdating } = useSWRMutation(
    '/employees',
    async (url, { arg }) => {
      const { employeeId, employeeData } = arg;
      const response = await api.put(`/employees/${employeeId}`, employeeData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the employees list
        mutate((key) => typeof key === 'string' && key.startsWith('/employees'));
        
        toast.success(
          `Employee ${data.employee?.first_name} ${data.employee?.last_name} has been updated successfully!`,
          'Employee Updated'
        );
      },
      onError: (error) => {
        console.error('Error updating employee:', error);
        
        let errorMessage = 'Failed to update employee. Please try again.';
        
        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.details) {
            errorMessage = error.response.data.details;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific database constraint errors
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorMessage = 'This employee information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Update Failed');
      }
    }
  );

  // Delete employee mutation
  const { trigger: deleteEmployeeMutation, isMutating: isDeleting } = useSWRMutation(
    '/employees',
    async (url, { arg }) => {
      const { employeeId } = arg;
      
      // Validate employee ID
      if (employeeId === null || employeeId === undefined || employeeId === '') {
        throw new Error('Employee ID is required');
      }
      
      // Convert to number - handle both string and number
      const id = Number(employeeId);
      
      if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        throw new Error(`Invalid employee ID: ${employeeId}`);
      }
      
      // Make the delete request - use string interpolation to ensure it's a clean URL
      const deleteUrl = `/employees/${id}`;
      const response = await api.delete(deleteUrl);
      return response.data;
    },
    {
      onSuccess: (data, key, config) => {
        // Safely get employee name from config, with fallback
        const employeeName = config?.arg?.employeeName || 'Employee';
        
        // Invalidate and revalidate the employees list
        mutate((key) => typeof key === 'string' && key.startsWith('/employees'));
        
        toast.success(
          `${employeeName} has been deleted successfully!`,
          'Employee Deleted'
        );
      },
      onError: (error) => {
        console.error('Error deleting employee:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Get error message from response
        let errorMessage = 'Failed to delete employee. Please try again.';
        
        if (error.response?.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.details) {
            errorMessage = error.response.data.details;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage, 'Deletion Failed');
      }
    }
  );

  const createEmployee = async (employeeData) => {
    return createEmployeeMutation(employeeData);
  };

  const updateEmployee = async (employeeId, employeeData) => {
    return updateEmployeeMutation({ employeeId, employeeData });
  };

  const deleteEmployee = async (employeeId, employeeName) => {
    return deleteEmployeeMutation({ employeeId, employeeName });
  };

  return {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for a single employee
export const useEmployee = (employeeId) => {
  const { data, error, isLoading, mutate } = useSWR(
    employeeId ? `/employees/${employeeId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    employee: data?.employee,
    isLoading,
    error,
    mutate,
  };
};