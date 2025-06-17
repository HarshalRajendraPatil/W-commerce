import React from 'react';

const StatsCard = ({ title, value, icon, color, footer }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bgLight: 'bg-blue-50',
          bgDark: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-200'
        };
      case 'green':
        return {
          bgLight: 'bg-green-50',
          bgDark: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200'
        };
      case 'yellow':
        return {
          bgLight: 'bg-yellow-50',
          bgDark: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        };
      case 'red':
        return {
          bgLight: 'bg-red-50',
          bgDark: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200'
        };
      case 'purple':
        return {
          bgLight: 'bg-purple-50',
          bgDark: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-200'
        };
      case 'indigo':
        return {
          bgLight: 'bg-indigo-50',
          bgDark: 'bg-indigo-100',
          text: 'text-indigo-700',
          border: 'border-indigo-200'
        };
      default:
        return {
          bgLight: 'bg-gray-50',
          bgDark: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200'
        };
    }
  };
  
  const colors = getColorClasses();
  
  return (
    <div className={`rounded-lg border ${colors.border} overflow-hidden`}>
      <div className={`flex items-center p-4 ${colors.bgLight}`}>
        <div className={`flex items-center justify-center p-3 rounded-full ${colors.bgDark} ${colors.text}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className={`text-2xl font-bold mt-1 ${colors.text}`}>{value}</p>
        </div>
      </div>
      
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500">{footer}</p>
        </div>
      )}
    </div>
  );
};

export default StatsCard; 