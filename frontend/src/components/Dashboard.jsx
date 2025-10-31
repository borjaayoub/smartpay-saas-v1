import { Building2, UsersRound , FileText, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from './ui/StatCard';
import QuickActions from './ui/QuickActions';
import PayslipsWidget from './Payslips';
import PayrollChart from './ui/PayrollChart';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useEmployees } from '../hooks/useEmployees';
import { useContracts } from '../hooks/useContracts';

const Dashboard = () => {
  const { stats, isLoading, error } = useDashboardStats();
  const { employees, isLoading: employeesLoading } = useEmployees({}, { page: 1, limit: 500 });
  const { contracts, isLoading: contractsLoading } = useContracts({}, { page: 1, limit: 500 });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Generate trend text
  const getTrendText = (trend, trendUp, type) => {
    if (type === 'payroll') {
      const sign = trendUp ? '+' : '';
      return `${sign}${trend}% from last month`;
    }
    if (type === 'employees') {
      return `${trend} new this month`;
    }
    if (type === 'contracts') {
      return `${trend} new this month`;
    }
    return '';
  };

  // Default stats when loading or error
  // const defaultStats = [
  //   {
  //     title: 'Total Employees',
  //     value: '0',
  //     icon: UsersRound,
  //     color: 'text-blue-500 bg-blue-500/10',
  //     trend: '0 new this month',
  //     trendUp: true,
  //   },
  //   {
  //     title: 'Active Contracts',
  //     value: '0',
  //     icon: FileText,
  //     color: 'text-green-500 bg-green-500/10',
  //     trend: '0 new this month',
  //     trendUp: true,
  //   },
  //   {
  //     title: 'Monthly Payroll',
  //     value: '$0',
  //     icon: DollarSign,
  //     color: 'text-purple-500 bg-purple-500/10',
  //     trend: '0% from last month',
  //     trendUp: true,
  //   },
  //   {
  //     title: 'Average Salary',
  //     value: '$0',
  //     icon: TrendingUp,
  //     color: 'text-orange-500 bg-orange-500/10',
  //     trend: 'per employee',
  //     trendUp: true,
  //   },
  // ];

  // Build stats array from API data
  const statsData = stats && stats.total_employees > 0 ? [
    {
      title: 'Total Employees',
      value: formatNumber(stats.total_employees),
      icon: UsersRound,
      color: 'text-blue-500 bg-blue-500/90',
      trend: getTrendText(stats.trends.employees_this_month, true, 'employees'),
      trendUp: true,
    },
    {
      title: 'Active Contracts',
      value: formatNumber(stats.active_contracts),
      icon: FileText,
      color: 'text-green-500 bg-green-500/90',
      trend: getTrendText(stats.trends.contracts_this_month, true, 'contracts'),
      trendUp: true,
    },
    {
      title: 'Monthly Payroll',
      value: formatCurrency(stats.monthly_payroll),
      icon: DollarSign,
      color: 'text-purple-500 bg-purple-500/90',
      trend: getTrendText(stats.trends.payroll_trend, stats.trends.payroll_trend_up, 'payroll'),
      trendUp: stats.trends.payroll_trend_up,
    },
    {
      title: 'Average Salary',
      value: formatCurrency(stats.average_salary),
      icon: TrendingUp,
      color: 'text-orange-500 bg-orange-500/90',
      trend: 'per employee',
      trendUp: true,
    },
  ] : [
    {
      title: 'Total Employees',
      value: '0',
      icon: UsersRound,
      color: 'text-blue-500 bg-blue-500/90',
      trend: '0 new this month',
      trendUp: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Payroll Management Overview</p>
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              Failed to load dashboard statistics. Showing default values.
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendUp={stat.trendUp}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <PayrollChart 
          employees={employees || []} 
          contracts={contracts || []} 
          isLoading={employeesLoading || contractsLoading}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payslips */}
        <div className="lg:col-span-2">
          <PayslipsWidget />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;