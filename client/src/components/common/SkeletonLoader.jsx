import React from 'react';

export const TableRowSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="animate-pulse">
      {/* Table header skeleton */}
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 grid" 
           style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array(columns).fill(0).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-gray-300 rounded-md"></div>
        ))}
      </div>
      
      {/* Table rows skeleton */}
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="px-6 py-4 border-b border-gray-200 grid items-center" 
             style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array(columns).fill(0).map((_, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="h-4 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 4, gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' }) => {
  return (
    <div className={`grid ${gridCols} gap-4 animate-pulse`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={`card-${i}`} className="bg-white p-4 rounded-md shadow">
          <div className="h-5 bg-gray-300 rounded-md w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded-md mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export const StatCardSkeleton = ({ count = 4, gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' }) => {
  return (
    <div className={`grid ${gridCols} gap-4 animate-pulse`}>
      {Array(count).fill(0).map((_, i) => (
        <div key={`stat-${i}`} className="bg-white p-4 rounded-md shadow border border-gray-100">
          <div className="flex items-center">
            <div className="rounded-full bg-gray-200 h-12 w-12 mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonLoader = {
  TableRow: TableRowSkeleton,
  Card: CardSkeleton,
  StatCard: StatCardSkeleton
};

export default SkeletonLoader; 