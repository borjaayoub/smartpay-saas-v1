import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching companies with filters
export const useCompanies = (filters = {}, pagination = { page: 1, limit: 12 }) => {
  const params = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
  });

  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);

  const { data, error, isLoading, mutate: mutateCompanies } = useSWR(
    `/companies?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
    }
  );

  return {
    companies: data?.companies || [],
    pagination: data?.pagination || {},
    isLoading,
    error,
    mutate: mutateCompanies,
  };
};

// Hook for company mutations
export const useCompanyMutations = () => {
  const toast = useToastStore();

  // Create company mutation
  const { trigger: createCompanyMutation, isMutating: isCreating } = useSWRMutation(
    '/companies',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the companies list
        mutate((key) => typeof key === 'string' && key.startsWith('/companies'));
        
        toast.success(
          `Company ${data.company?.name} has been created successfully!`,
          'Company Created'
        );
      },
      onError: (error) => {
        console.error('Error creating company:', error);
        
        let errorMessage = 'Failed to create company. Please try again.';
        
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
          errorMessage = 'This company information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Creation Failed');
      }
    }
  );

  // Update company mutation
  const { trigger: updateCompanyMutation, isMutating: isUpdating } = useSWRMutation(
    '/companies',
    async (url, { arg }) => {
      const { companyId, companyData } = arg;
      const response = await api.put(`/companies/${companyId}`, companyData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the companies list
        mutate((key) => typeof key === 'string' && key.startsWith('/companies'));
        
        toast.success(
          `Company ${data.company?.name} has been updated successfully!`,
          'Company Updated'
        );
      },
      onError: (error) => {
        console.error('Error updating company:', error);
        
        let errorMessage = 'Failed to update company. Please try again.';
        
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
          errorMessage = 'This company information already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Update Failed');
      }
    }
  );

  // Delete company mutation
  const { trigger: deleteCompanyMutation, isMutating: isDeleting } = useSWRMutation(
    '/companies',
    async (url, { arg }) => {
      const { companyId } = arg;
      await api.delete(`/companies/${companyId}`);
      return true;
    },
    {
      onSuccess: (data, key, config) => {
        const { companyName } = config.arg;
        // Invalidate and revalidate the companies list
        mutate((key) => typeof key === 'string' && key.startsWith('/companies'));
        
        toast.success(
          `Company ${companyName} has been deleted successfully!`,
          'Company Deleted'
        );
      },
      onError: (error) => {
        console.error('Error deleting company:', error);
        toast.error(
          error.response?.data?.error || 'Failed to delete company. Please try again.',
          'Deletion Failed'
        );
      }
    }
  );

  const createCompany = async (companyData) => {
    return createCompanyMutation(companyData);
  };

  const updateCompany = async (companyId, companyData) => {
    return updateCompanyMutation({ companyId, companyData });
  };

  const deleteCompany = async (companyId, companyName) => {
    return deleteCompanyMutation({ companyId, companyName });
  };

  return {
    createCompany,
    updateCompany,
    deleteCompany,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for a single company
export const useCompany = (companyId) => {
  const { data, error, isLoading, mutate } = useSWR(
    companyId ? `/companies/${companyId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    company: data?.company,
    isLoading,
    error,
    mutate,
  };
};