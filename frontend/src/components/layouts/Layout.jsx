import { LogOut, User, Building2, Loader2, Home, Users, FileText, DollarSign, Settings, Menu, X, Calculator, Sparkles } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { user, isLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Payroll Simulator', icon: Calculator, path: '/payroll-simulator' },
    { name: 'Payslips', icon: FileText, path: '/payslips' },  
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <Sparkles className="h-4 w-4 text-indigo-300 absolute -top-1 -right-1 animate-pulse-subtle" />
          </div>
          <p className="mt-3 text-sm text-slate-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between z-20 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-3 text-lg font-bold text-gray-900">SmartPay</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white fixed h-full flex flex-col z-40 transition-all duration-300 border-r border-gray-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">SmartPay</h1>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section at Bottom */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center mb-3 px-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gray-100">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || user?.email || 'User'}
              </p>
              {user?.role && (
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user.role}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group"
          >
            <LogOut className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;