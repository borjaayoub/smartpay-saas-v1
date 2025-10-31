import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching payslips with filters
export const usePayslips = (filters = {}, pagination = { page: 1, limit: 10 }) => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.month) params.append('month', filters.month);
  if (filters.employee_id) params.append('employee_id', filters.employee_id);
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const { data, error, isLoading, mutate: mutatePayslips } = useSWR(
    `/payslips?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    payslips: data?.payslips || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    mutate: mutatePayslips,
  };
};

// Hook for payslip mutations
export const usePayslipMutations = () => {
  const toast = useToastStore();

  // Create payslip mutation
  const { trigger: createPayslipMutation, isMutating: isCreating } = useSWRMutation(
    '/payslips',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the payslips list
        mutate((key) => typeof key === 'string' && key.startsWith('/payslips'));
        
        toast.success(
          `Payslip has been created successfully!`,
          'Payslip Created'
        );
      },
      onError: (error) => {
        console.error('Error creating payslip:', error);
        
        let errorMessage = 'Failed to create payslip. Please try again.';
        
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
        
        toast.error(errorMessage, 'Creation Failed');
      }
    }
  );

  // Update payslip mutation
  const { trigger: updatePayslipMutation, isMutating: isUpdating } = useSWRMutation(
    '/payslips',
    async (url, { arg }) => {
      const { payslipId, payslipData } = arg;
      const response = await api.put(`/payslips/${payslipId}`, payslipData);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the payslips list
        mutate((key) => typeof key === 'string' && key.startsWith('/payslips'));
        
        toast.success(
          `Payslip has been updated successfully!`,
          'Payslip Updated'
        );
      },
      onError: (error) => {
        console.error('Error updating payslip:', error);
        
        let errorMessage = 'Failed to update payslip. Please try again.';
        
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
        
        toast.error(errorMessage, 'Update Failed');
      }
    }
  );

  // Delete payslip mutation
  const { trigger: deletePayslipMutation, isMutating: isDeleting } = useSWRMutation(
    '/payslips',
    async (url, { arg }) => {
      const { payslipId } = arg;
      await api.delete(`/payslips/${payslipId}`);
      return true;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the payslips list
        mutate((key) => typeof key === 'string' && key.startsWith('/payslips'));
        
        toast.success(
          `Payslip has been deleted successfully!`,
          'Payslip Deleted'
        );
      },
      onError: (error) => {
        console.error('Error deleting payslip:', error);
        toast.error(
          error.response?.data?.error || 'Failed to delete payslip. Please try again.',
          'Deletion Failed'
        );
      }
    }
  );

  const createPayslip = async (payslipData) => {
    return createPayslipMutation(payslipData);
  };

  const updatePayslip = async (payslipId, payslipData) => {
    return updatePayslipMutation({ payslipId, payslipData });
  };

  const deletePayslip = async (payslipId) => {
    return deletePayslipMutation({ payslipId });
  };

  return {
    createPayslip,
    updatePayslip,
    deletePayslip,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for a single payslip
export const usePayslip = (payslipId) => {
  const { data, error, isLoading, mutate } = useSWR(
    payslipId ? `/payslips/${payslipId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    payslip: data?.payslip,
    isLoading,
    error,
    mutate,
  };
};