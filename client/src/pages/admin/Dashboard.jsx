import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDashboardStats,
  getSalesStats,
  getTopProducts,
  getRecentOrders
} from '../../redux/slices/dashboardSlice';

// Components
import StatCard from '../../components/admin/StatCard';
import SalesChart from '../../components/admin/SalesChart';
import TopProducts from '../../components/admin/TopProducts';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  const dispatch = useDispatch();
  let { stats, salesData, topProducts, recentOrders, loading, error } = useSelector(
    (state) => state.dashboard
  );
  stats = stats?.data;
  const [timeFilter, setTimeFilter] = useState('30days');

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getSalesStats(timeFilter));
    dispatch(getTopProducts(5));
    dispatch(getRecentOrders(5));
  }, [dispatch, timeFilter]);

  // Handle period change for sales chart
  const handlePeriodChange = (period) => {
    setTimeFilter(period);
  };

  // Format numbers with comma separators
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount ? `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '$0.00';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your admin dashboard. Here's what's happening with your store today.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.
            totalRevenue
             || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-indigo-500"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats?.orderCount || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="bg-blue-500"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats?.productCount || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          }
          color="bg-green-500"
        />
        <StatCard
          title="Total Customers"
          value={formatNumber(stats?.userCount || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="bg-purple-500"
        />
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats?.todayRevenue || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          color="bg-amber-500"
        />
        <StatCard
          title="Today's Orders"
          value={formatNumber(stats?.todayOrders || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Orders"
          value={formatNumber(stats?.pendingOrders || 0)}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-orange-500"
        />
      </div>

      {/* Charts and data tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart 
          salesData={salesData || []} 
          timeFilter={timeFilter}
          onPeriodChange={handlePeriodChange}
        />
        <TopProducts products={topProducts || []} />
      </div>

      {/* Recent orders */}
      <div>
        <RecentOrdersTable orders={recentOrders || []} />
      </div>
    </div>
  );
};

export default Dashboard; 