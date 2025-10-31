import { create } from 'zustand';

const useEmployeeStore = create((set) => ({
  // Modal state
  isModalOpen: false,
  modalMode: 'add', // 'add' or 'edit'
  selectedEmployee: null,
  
  // Open modal for adding new employee
  openAddModal: () => 
    set({ 
      isModalOpen: true, 
      modalMode: 'add',
      selectedEmployee: null 
    }),
  
  // Open modal for editing employee
  openEditModal: (employee) => 
    set({ 
      isModalOpen: true, 
      modalMode: 'edit',
      selectedEmployee: employee 
    }),
  
  // Close modal
  closeModal: () => 
    set({ 
      isModalOpen: false, 
      modalMode: 'add',
      selectedEmployee: null 
    }),
}));

export default useEmployeeStore;

