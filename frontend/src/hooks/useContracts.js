import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching contracts with filters
export const useContracts = (filters = {}, pagination = { page: 1, limit: 12 }) => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.contract_type) params.append('contract_type', filters.contract_type);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.employee_id) params.append('employee_id', filters.employee_id);

  const { data, error, isLoading, mutate: mutateContracts } = useSWR(
    `/contracts?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    contracts: data?.contracts || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    mutate: mutateContracts,
  };
};

// Hook for contract mutations
export const useContractMutations = () => {
  const toast = useToastStore();

  // Create contract mutation
  const { trigger: createContractMutation, isMutating: isCreating } = useSWRMutation(
    '/contracts',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the contracts list
        mutate((key) => typeof key === 'string' && key.startsWith('/contracts'));
        
        toast.success(
          `Contract has been created successfully!`,
          'Contract Created'
        );
      },
      onError: (error) => {
        console.error('Error creating contract:', error);
        
        let errorMessage = 'Failed to create contract. Please try again.';
        
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
          errorMessage = 'This contract information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Creation Failed');
      }
    }
  );

  // Update contract mutation
  const { trigger: updateContractMutation, isMutating: isUpdating } = useSWRMutation(
    '/contracts',
    async (url, { arg }) => {
      const { contractId, contractData } = arg;
      const response = await api.put(`/contracts/${contractId}`, contractData);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the contracts list
        mutate((key) => typeof key === 'string' && key.startsWith('/contracts'));
        
        toast.success(
          `Contract has been updated successfully!`,
          'Contract Updated'
        );
      },
      onError: (error) => {
        console.error('Error updating contract:', error);
        
        let errorMessage = 'Failed to update contract. Please try again.';
        
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
          errorMessage = 'This contract information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Update Failed');
      }
    }
  );

  // Delete contract mutation
  const { trigger: deleteContractMutation, isMutating: isDeleting } = useSWRMutation(
    '/contracts',
    async (url, { arg }) => {
      const { contractId } = arg;
      await api.delete(`/contracts/${contractId}`);
      return true;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the contracts list
        mutate((key) => typeof key === 'string' && key.startsWith('/contracts'));
        
        toast.success(
          `Contract has been deleted successfully!`,
          'Contract Deleted'
        );
      },
      onError: (error) => {
        console.error('Error deleting contract:', error);
        toast.error(
          error.response?.data?.error || 'Failed to delete contract. Please try again.',
          'Deletion Failed'
        );
      }
    }
  );

  const createContract = async (contractData) => {
    return createContractMutation(contractData);
  };

  const updateContract = async (contractId, contractData) => {
    return updateContractMutation({ contractId, contractData });
  };

  const deleteContract = async (contractId) => {
    return deleteContractMutation({ contractId });
  };

  return {
    createContract,
    updateContract,
    deleteContract,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for a single contract
export const useContract = (contractId) => {
  const { data, error, isLoading, mutate } = useSWR(
    contractId ? `/contracts/${contractId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    contract: data?.contract,
    isLoading,
    error,
    mutate,
  };
};