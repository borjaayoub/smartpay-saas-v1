import axios from 'axios';

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Navigation handler - will be set by the app
let navigateHandler = null;
export const setNavigateHandler = (navigate) => {
  navigateHandler = navigate;
};

// Axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies/credentials
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage directly to avoid circular dependencies
    try {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // Handle JSON parse errors silently
      console.error('Error parsing auth data:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data from localStorage
      try {
        localStorage.removeItem('auth-storage');
      } catch (error) {
        // Handle localStorage errors silently
        console.error('Error clearing auth data from localStorage:', error);
      }
      // Use React Router navigation if available, otherwise fallback to window.location
      if (navigateHandler && window.location.pathname !== '/login') {
        navigateHandler('/login', { replace: true });
      } else if (!navigateHandler && window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// SWR Fetcher
export const fetcher = (url) => api.get(url).then((res) => res.data);
