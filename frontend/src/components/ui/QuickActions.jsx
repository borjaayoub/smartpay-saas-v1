import React from 'react';
import { UsersRound, Calculator, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionCard = ({ icon, label, onClick, iconColor = 'text-blue-500' }) => {
  const IconComponent = icon;
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left group"
    >
      <div className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-sm font-medium text-gray-900 flex-1">{label}</span>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
    </button>
  );
};

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: UsersRound,
      label: 'Manage Employees',
      iconColor: 'text-blue-500',
      onClick: () => navigate('/employees'),
    },
    {
      icon: Calculator,
      label: 'Payroll Simulator',
      iconColor: 'text-emerald-500',
      onClick: () => navigate('/payroll-simulator'),
    },
    {
      icon: FileText,
      label: 'Pay Slips',
      iconColor: 'text-violet-500',
      onClick: () => navigate('/payslips'),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <QuickActionCard
            key={index}
            icon={action.icon}
            label={action.label}
            iconColor={action.iconColor}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}

