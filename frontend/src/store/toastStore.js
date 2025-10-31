import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      autoClose: true,
      ...toast,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
  
  // Convenience methods
  success: (message, title = 'Success', options = {}) => {
    return useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  },
  
  error: (message, title = 'Error', options = {}) => {
    return useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      ...options,
    });
  },
  
  warning: (message, title = 'Warning', options = {}) => {
    return useToastStore.getState().addToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  },
  
  info: (message, title = 'Info', options = {}) => {
    return useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  },
}));

export default useToastStore;
