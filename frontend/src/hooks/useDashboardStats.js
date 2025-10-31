import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';

// Hook for fetching dashboard statistics
export const useDashboardStats = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/dashboard/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      errorRetryCount: 3,
    }
  );

  return {
    stats: data?.stats || null,
    isLoading,
    error,
    mutate,
  };
};
