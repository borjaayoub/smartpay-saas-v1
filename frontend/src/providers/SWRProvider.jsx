import { SWRConfig } from 'swr';
import { fetcher } from '../lib/fetcher';
import useToastStore from '../store/toastStore';

// SWR configuration
const swrConfig = {
  fetcher: fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  errorRetryCount: 3,
  errorRetryInterval: 15000, // 15 seconds
  focusThrottleInterval: 10000, // 10 seconds - throttle focus revalidation
  loadingTimeout: 30000, // 30 seconds timeout for requests
  onError: (error, key) => {
    console.error('SWR Error:', error);
    
    // Only show toast for non-auth related errors
    if (!key.includes('/auth/') && error.response?.status !== 401) {
      const toast = useToastStore.getState();
      toast.error(
        error.response?.data?.error || error.message || 'An error occurred while fetching data',
        'Data Fetch Error'
      );
    }
  },
  onSuccess: (data, key) => {
    // Optional: Log successful fetches in development
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.log(`SWR Success: ${key}`, data);
    }
  },
  // Global error boundary for SWR
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry on 4xx errors (client errors)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return;
    }
    
    // Don't retry on auth errors
    if (error.response?.status === 401) {
      return;
    }
    
    // Don't retry on network errors more than 2 times
    if (retryCount >= 2) {
      return;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.min(1000 * Math.pow(2, retryCount), 4000);
    setTimeout(() => revalidate({ retryCount }), delay);
  },
  // Global loading state management
  onLoadingSlow: (key) => {
    console.warn(`SWR: Slow request detected for ${key}`);
  },
  // Global mutation configuration
  onMutationSuccess: (data, key) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.log(`SWR Mutation Success: ${key}`, data);
    }
  },
  onMutationError: (error, key) => {
    console.error(`SWR Mutation Error: ${key}`, error);
  },
};

export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
};
