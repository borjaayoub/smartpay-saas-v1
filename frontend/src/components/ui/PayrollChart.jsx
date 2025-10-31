import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp } from 'lucide-react';

const PayrollChart = ({ employees = [], contracts = [], isLoading = false }) => {
  // Helper function to parse backend date format ("Mon, 15 Jan 2024" or ISO format)
  const parseBackendDate = React.useCallback((dateString) => {
    if (!dateString) return null;
    
    try {
      // Try parsing the backend format: "Mon, 15 Jan 2024"
      if (dateString.includes(',')) {
        // Split "Mon, 15 Jan 2024" into parts
        const parts = dateString.split(',');
        if (parts.length === 2) {
          const datePart = parts[1].trim(); // "15 Jan 2024"
          // Parse "15 Jan 2024" format - more reliable than new Date()
          const dateMatch = datePart.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
          if (dateMatch) {
            const day = parseInt(dateMatch[1], 10);
            const monthName = dateMatch[2]; // "Jan", "Feb", etc.
            const year = parseInt(dateMatch[3], 10);
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            const month = monthMap[monthName];
            if (month !== undefined) {
              const parsedDate = new Date(year, month, day);
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
              }
            }
          }
          // Fallback: try standard Date parsing
          const parsed = new Date(datePart);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
      }
      
      // Fallback to standard Date parsing (for ISO or other formats)
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse date:', dateString, error);
    }
    
    return null;
  }, []);

  // Prepare data for the chart - employee growth over last 6 months
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();
      
      // Count employees created in this month
      let employeesThisMonth = 0;
      employees.forEach(emp => {
        if (!emp || !emp.created_at) return;
        const empDate = parseBackendDate(emp.created_at);
        if (empDate && empDate.getMonth() === targetMonth && empDate.getFullYear() === targetYear) {
          employeesThisMonth++;
        }
      });
      
      // Count contracts created in this month
      let contractsThisMonth = 0;
      contracts.forEach(contract => {
        if (!contract || !contract.created_at) return;
        const contractDate = parseBackendDate(contract.created_at);
        if (contractDate && contractDate.getMonth() === targetMonth && contractDate.getFullYear() === targetYear) {
          contractsThisMonth++;
        }
      });
      
      months.push({
        name: monthName,
        employees: employeesThisMonth,
        contracts: contractsThisMonth,
      });
    }
    
    return months;
  }, [employees, contracts, parseBackendDate]);

  // Calculate totals for display
  const totalEmployees = employees.length;
  const totalContracts = contracts.length;

  // Debug: Log chart data for troubleshooting
  React.useEffect(() => {
    if (!isLoading) {
      console.log('=== PayrollChart Debug ===');
      console.log('Total employees received:', totalEmployees);
      console.log('Total contracts received:', totalContracts);
      
      if (employees.length > 0) {
        const sampleEmployees = employees.slice(0, 5);
        console.log('Sample employees with dates:', sampleEmployees.map(e => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          created_at: e.created_at,
          parsed: parseBackendDate(e.created_at)
        })));
      }
      
      if (contracts.length > 0) {
        const sampleContracts = contracts.slice(0, 5);
        console.log('Sample contracts with dates:', sampleContracts.map(c => ({
          id: c.id,
          employee_id: c.employee_id,
          created_at: c.created_at,
          parsed: parseBackendDate(c.created_at)
        })));
      }
      
      console.log('Chart data prepared:', chartData);
      console.log('Current date:', new Date().toISOString());
      console.log('========================');
    }
  }, [isLoading, employees, contracts, chartData, totalEmployees, totalContracts, parseBackendDate]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Growth Trends</h3>
            <p className="text-sm text-gray-500">Last 6 months overview</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-right">
            <p className="text-gray-500">Total Employees</p>
            <p className="font-semibold text-gray-900">{totalEmployees}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Total Contracts</p>
            <p className="font-semibold text-gray-900">{totalContracts}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <>
          {/* Debug info - always show for now to help debug */}
          <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600 border border-gray-200">
            <div className="font-semibold mb-1">Debug Info:</div>
            <div>Total Employees: {totalEmployees} | Total Contracts: {totalContracts}</div>
            <div className="mt-1">Data points: {chartData.map(d => `${d.name}: ${d.employees}E/${d.contracts}C`).join(', ')}</div>
            {employees.length > 0 && (
              <div className="mt-1 text-gray-500">
                Sample employee date: {employees[0].created_at} → Parsed: {parseBackendDate(employees[0].created_at)?.toISOString() || 'FAILED'}
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorContracts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="employees" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEmployees)"
                name="Employees"
              />
              <Area 
                type="monotone" 
                dataKey="contracts" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorContracts)"
                name="Contracts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="mb-2">No data available for chart</p>
            <p className="text-xs text-gray-400">
              {employees.length === 0 && contracts.length === 0 
                ? 'No employees or contracts found'
                : 'No data in the last 6 months'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollChart;

