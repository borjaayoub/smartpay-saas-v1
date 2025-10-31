import React from 'react';
import { Search } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange }) {
  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      paiments_status: '',
      start_date: '',
      end_date: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className={`text-sm font-medium transition-colors ${
            hasActiveFilters 
              ? 'text-indigo-600 hover:text-indigo-800' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Search Input */}
        <div>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, CIN, position, department"
              value={filters.search || ''}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="fired">Fired</option>
          </select>
        </div>

        {/* Payment Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paiments_status || ''}
            onChange={(e) => handleInputChange('paiments_status', e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer text-sm"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        
      </div>
    </div>
  );
}

