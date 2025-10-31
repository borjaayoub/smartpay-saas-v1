import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { api } from '../lib/fetcher';

const AUTH_KEY = 'auth-storage';

// Helper functions for localStorage
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setStoredAuth = (authData) => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  } catch {
    // Handle localStorage errors silently
    console.error('Error setting auth token in localStorage');
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // Handle localStorage errors silently
    console.error('Error clearing auth token from localStorage');
  }
};

// SWR fetcher for auth data
const authFetcher = () => {
  const stored = getStoredAuth();
  return stored; // Return null if no auth data instead of throwing
};

// SWR mutation for login
const loginMutation = async (url, { arg }) => {
  const response = await api.post(url, arg);
  const { token, user } = response.data;
  
  const authData = {
    user,
    token,
    isAuthenticated: true,
  };
  
  setStoredAuth(authData);
  return authData;
};

// SWR mutation for register
const registerMutation = async (url, { arg }) => {
  const response = await api.post(url, arg);
  const { token, user } = response.data;
  
  const authData = {
    user,
    token,
    isAuthenticated: true,
  };
  
  setStoredAuth(authData);
  return authData;
};

// SWR mutation for logout
const logoutMutation = async () => {
  clearStoredAuth();
  return null;
};

export const useAuth = () => {
  // Get auth data from SWR cache or localStorage
  const { data: authData, mutate: mutateAuth } = useSWR(
    'auth-data',
    authFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      fallbackData: getStoredAuth(),
    }
  );

  // Login mutation
  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation(
    '/auth/login',
    loginMutation
  );

  // Register mutation
  const { trigger: register, isMutating: isRegistering } = useSWRMutation(
    '/auth/register',
    registerMutation
  );

  // Logout mutation
  const { trigger: logout, isMutating: isLoggingOut } = useSWRMutation(
    'logout',
    logoutMutation
  );

  // Login function
  const handleLogin = useCallback(async (credentials) => {
    const result = await login(credentials);
    await mutateAuth(result, false); // Update cache without revalidation
    return result;
  }, [login, mutateAuth]);

  // Register function
  const handleRegister = useCallback(async (credentials) => {
    const result = await register(credentials);
    await mutateAuth(result, false); // Update cache without revalidation
    return result;
  }, [register, mutateAuth]);

  // Logout function
  const handleLogout = useCallback(async () => {
    await logout();
    await mutateAuth(null, false); // Clear cache
    // Clear all SWR cache to prevent stale data
    mutate(() => true, undefined, { revalidate: false });
  }, [logout, mutateAuth]);

  // Update user data
  const updateUser = useCallback((userData) => {
    if (authData) {
      const updatedAuth = { ...authData, user: userData };
      setStoredAuth(updatedAuth);
      mutateAuth(updatedAuth, false);
    }
  }, [authData, mutateAuth]);

  return {
    // Auth state
    user: authData?.user || null,
    token: authData?.token || null,
    isAuthenticated: authData?.isAuthenticated || false,
    
    // Loading states
    isLoading: authData === undefined,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    
    // SWR utilities
    mutate: mutateAuth,
  };
};
