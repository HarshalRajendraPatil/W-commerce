import React from 'react';
import { format } from 'date-fns';
import Loader from '../common/Loader';

const CouponStatsModal = ({ coupon, stats, onClose }) => {
  if (!coupon) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-transparent backdrop-blur-sm shadow-lg bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Coupon Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-indigo-50 p-4 rounded-md mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">{coupon.code}</h3>
              <p className="text-sm text-indigo-700">{coupon.description}</p>
            </div>
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium 
                ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {coupon.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Discount</h4>
            <p className="text-lg font-semibold text-gray-900">
              {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value.toFixed(2)}`}
              {coupon.type === 'percentage' && coupon.maxDiscount > 0 && 
                ` (Max: $${coupon.maxDiscount.toFixed(2)})`}
            </p>
            {coupon.minPurchase > 0 && (
              <p className="text-sm text-gray-600">
                Min purchase: ${coupon.minPurchase.toFixed(2)}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Validity</h4>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(coupon.startDate), 'PP')} - {format(new Date(coupon.endDate), 'PP')}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(coupon.endDate) < new Date() 
                ? 'Expired' 
                : `Expires in ${Math.ceil((new Date(coupon.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days`}
            </p>
          </div>
        </div>

        {!stats ? (
          <div className="py-8">
            <Loader size="medium" text="Loading usage statistics..." />
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Usage</h4>
                <p className="text-xl font-semibold text-gray-900">{stats.usageCount || 0}</p>
                {coupon.usageLimit > 0 && (
                  <p className="text-sm text-gray-600">
                    {coupon.usageLimit - (stats.usageCount || 0)} uses remaining
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Discount Amount</h4>
                <p className="text-xl font-semibold text-green-600">
                  ${(stats.totalDiscountAmount || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Average Discount</h4>
                <p className="text-xl font-semibold text-gray-900">
                  ${stats.usageCount ? (stats.totalDiscountAmount / stats.usageCount).toFixed(2) : '0.00'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Usage Rate</h4>
                <p className="text-xl font-semibold text-gray-900">
                  {coupon.usageLimit > 0 
                    ? `${((stats.usageCount || 0) / coupon.usageLimit * 100).toFixed(1)}%`
                    : 'Unlimited'}
                </p>
              </div>
            </div>
            
            {stats.topUsers && stats.topUsers.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Top Users</h3>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Discount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.topUsers.map((user, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.user.name}</div>
                            <div className="text-xs text-gray-500">{user.user.email}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.count}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${user.totalDiscount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponStatsModal; 