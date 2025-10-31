import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api, fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// Hook for fetching contribution rates
export const useContributionRates = () => {
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

// Hook for contribution rate mutations
export const useContributionRateMutations = () => {
  const toast = useToastStore();

  // Create contribution rate mutation
  const { trigger: createContributionRateMutation, isMutating: isCreating } = useSWRMutation(
    '/contribution-rates',
    async (url, { arg }) => {
      const response = await api.post(url, arg);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the rates list
        mutate((key) => typeof key === 'string' && key.startsWith('/contribution-rates'));
        
        toast.success(
          `Contribution rate has been created successfully!`,
          'Rate Created'
        );
      },
      onError: (error) => {
        console.error('Error creating contribution rate:', error);
        
        let errorMessage = 'Failed to create contribution rate. Please try again.';
        
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
          errorMessage = 'This contribution rate already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Creation Failed');
      }
    }
  );

  // Update contribution rate mutation
  const { trigger: updateContributionRateMutation, isMutating: isUpdating } = useSWRMutation(
    '/contribution-rates',
    async (url, { arg }) => {
      const { rateId, rateData } = arg;
      const response = await api.put(`/contribution-rates/${rateId}`, rateData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Invalidate and revalidate the rates list
        mutate((key) => typeof key === 'string' && key.startsWith('/contribution-rates'));
        
        toast.success(
          `Contribution rate has been updated successfully!`,
          'Rate Updated'
        );
      },
      onError: (error) => {
        console.error('Error updating contribution rate:', error);
        
        let errorMessage = 'Failed to update contribution rate. Please try again.';
        
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
          errorMessage = 'This contribution rate already exists. Please check for duplicates.';
        } else if (errorMessage.includes('constraint') || errorMessage.includes('violation')) {
          errorMessage = 'Invalid data provided. Please check your input and try again.';
        }
        
        toast.error(errorMessage, 'Update Failed');
      }
    }
  );

  // Delete contribution rate mutation
  const { trigger: deleteContributionRateMutation, isMutating: isDeleting } = useSWRMutation(
    '/contribution-rates',
    async (url, { arg }) => {
      const { rateId } = arg;
      await api.delete(`/contribution-rates/${rateId}`);
      return true;
    },
    {
      onSuccess: () => {
        // Invalidate and revalidate the rates list
        mutate((key) => typeof key === 'string' && key.startsWith('/contribution-rates'));
        
        toast.success(
          `Contribution rate has been deleted successfully!`,
          'Rate Deleted'
        );
      },
      onError: (error) => {
        console.error('Error deleting contribution rate:', error);
        toast.error(
          error.response?.data?.error || 'Failed to delete contribution rate. Please try again.',
          'Deletion Failed'
        );
      }
    }
  );

  const createContributionRate = async (rateData) => {
    return createContributionRateMutation(rateData);
  };

  const updateContributionRate = async (rateId, rateData) => {
    return updateContributionRateMutation({ rateId, rateData });
  };

  const deleteContributionRate = async (rateId) => {
    return deleteContributionRateMutation({ rateId });
  };

  return {
    createContributionRate,
    updateContributionRate,
    deleteContributionRate,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

// Hook for a single contribution rate
export const useContributionRate = (rateId) => {
  const { data, error, isLoading, mutate } = useSWR(
    rateId ? `/contribution-rates/${rateId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    rate: data?.rate,
    isLoading,
    error,
    mutate,
  };
};