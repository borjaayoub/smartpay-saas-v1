import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon, color, trend, trendUp, isLoading = false }) {
  const IconComponent = icon;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && !isLoading && (
          <div className="flex items-center mt-3">
            {trendUp ? (
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
            )}
            <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </span>
          </div>
        )}
        {isLoading && (
          <div className="h-4 bg-gray-200 rounded animate-pulse mt-3"></div>
        )}
      </div>
    </div>
  );
}

