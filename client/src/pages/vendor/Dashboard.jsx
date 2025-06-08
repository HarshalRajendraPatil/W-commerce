import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorDashboardStats } from '../../redux/slices/dashboardSlice';

// Import components
import StatCard from '../../components/vendor/StatCard';
import VendorSalesChart from '../../components/vendor/VendorSalesChart';
import TopProductsTable from '../../components/vendor/TopProductsTable';
import RecentOrdersTable from '../../components/vendor/RecentOrdersTable';
import LowStockProducts from '../../components/vendor/LowStockProducts';
import RecentReviews from '../../components/vendor/RecentReviews';

const VendorDashboard = () => {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getVendorDashboardStats());
  }, [dispatch]);

  // Helper to format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-5 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.data?.totalRevenue)}
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Orders"
            value={stats?.data?.orderCount || 0}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          />
          <StatCard
            title="Product Count"
            value={stats?.data?.productCount || 0}
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            }
          />
          <StatCard
            title="Average Rating"
            value={stats?.data?.averageRating ? stats.data.averageRating.toFixed(1) + '/5' : 'N/A'}
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
          />
        </div>
      )}
      
      {/* Sales Chart */}
      <VendorSalesChart />
      
      {/* 2-column layout for tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsTable />
        <RecentOrdersTable />
      </div>
      
      {/* 2-column layout for low stock and reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockProducts />
        <RecentReviews />
      </div>
    </div>
  );
};

export default VendorDashboard; 