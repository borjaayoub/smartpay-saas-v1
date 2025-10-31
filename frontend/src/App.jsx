import React from 'react';
import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Employees from './components/Employees.jsx';
import PayrollSimulator from './components/PayrollSimulator.jsx';
import Layout from './components/layouts/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { SWRProvider } from './providers/SWRProvider.jsx';
import { useAuth } from './hooks/useAuth';
import PayslipsPage from './components/PayslipsPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import { setNavigateHandler } from './lib/fetcher.js';


function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Set up navigation handler for the API interceptor
  React.useEffect(() => {
    setNavigateHandler(navigate);
  }, [navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Landing page - show to non-authenticated users */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="payroll-simulator" element={<PayrollSimulator />} />
        <Route path="payslips" element={<PayslipsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <SWRProvider>
      <BrowserRouter>
        <AppContent />
        
        {/* Toast Container */}
        <ToastContainer />
      </BrowserRouter>
    </SWRProvider>
  );
}

export default App;