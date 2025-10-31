import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';
import { useAuth } from './useAuth';

export const useUser = () => {
  const { isAuthenticated, user: cachedUser, updateUser } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? '/auth/me' : null, // Only fetch if authenticated
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        // Update auth store with fresh user data
        updateUser(data.user);
      },
    }
  );

  return {
    user: data?.user || cachedUser,
    isLoading,
    isError: error,
    mutate,
  };
};